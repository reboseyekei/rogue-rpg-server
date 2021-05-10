const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../../util/checkAuth");
const { AuthenticationError } = require("apollo-server");
const { UserInputError } = require("apollo-server");

const Item = require("../../models/Item");
const User = require("../../models/User");
const Inventory = require("../../models/Inventory");
const Equipment = require("../../models/Equipment");
const AbilitiesInv = require("../../models/AbilitiesInv");
const { adminList } = require("../../util/admins");

const { check } = require("../../util/validators");

module.exports = {
  Query: {
    async getItem(_, { itemId }) {
      try {
        if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const item = await Item.findById(itemId);
        if (item) {
          return item;
        } else {
          throw new Error("Item not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getActiveItem(_, { anchor, target }) {
      try {
        let container;
        let check = check(target);
        if (check === 2) {
          container = await Equipment.findById(anchor);
        } else if (check === 1) {
          container = await AbilitiesInv.findById(anchor);
        } else if (check === 0) {
          container = await Inventory.findById(anchor);
        }

        const itemId = container[target].item;

        if (itemId) {
          const item = await Item.findById(itemId);
          if (item) {
            return item;
          } else {
            throw new Error("Item not found");
          }
        } else {
          return null;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async switchItems(_, { switchItemsInput: { firstAnchor, secondAnchor, firstTarget, secondTarget } }) {
      try {
        //the anchors (inventory, equipment)
        let first;
        let second;

        //Type keeps track of whether an anchor is an equipment or inventory. false for inventory, true for equipment
        let firstCheck = check(firstTarget);
        let secondCheck = check(secondTarget);

        //if the target is a equipment value then check equipment storage instead of inventory storage (checking both containers)
        if (firstCheck === 2) {
          first = await Equipment.findById(firstAnchor);
        } else if (firstCheck === 1) {
          first = await AbilitiesInv.findById(firstAnchor);
        } else if (firstCheck === 0) {
          first = await Inventory.findById(firstAnchor);
        }

        if (secondCheck === 2) {
          second = await Equipment.findById(secondAnchor);
        } else if (secondCheck === 1) {
          second = await AbilitiesInv.findById(secondAnchor);
        } else if (secondCheck === 0) {
          second = await Inventory.findById(secondAnchor);
        }

        //Equipment validation
        if (firstCheck === 2 || secondCheck === 2) {
          const firstItemId = first[firstTarget].item;
          const secondItemId = second[secondTarget].item;
          let firstItem;
          let secondItem;

          if (firstItemId) {
            firstItem = await Item.findById(firstItemId);
          }

          if (secondItemId) {
            secondItem = await Item.findById(secondItemId);
          }

          let firstTargetType = firstTarget === "ringOne" || firstTarget === "ringTwo" ? "ring" : firstTarget;
          let secondTargetType = secondTarget === "ringOne" || secondTarget === "ringTwo" ? "ring" : secondTarget;

          if (firstCheck === 2 && secondCheck === 2) {
            if (firstItem && secondItem && (firstItem.type !== secondTargetType || secondItem.type !== firstTargetType)) {
              return "Cannot swap equipments of different types, invalid switch";
            } else if (firstItem && !secondItem && firstItem.type !== secondTargetType) {
              return "Cannot equip that item there, invalid switch";
            } else if (!firstItem && secondItem && secondItem.type !== firstTargetType) {
              return "Cannot equip that item there, invalid switch";
            }
          } else if (firstCheck === 2 && secondItem && secondItem.type !== firstTargetType) {
            return "Cannot equip";
          } else if (secondCheck === 2 && firstItem && firstItem.type !== secondTargetType) {
            return "Cannot Equip";
          }
        }

        //Ability validation
        if (firstCheck === 1 || secondCheck === 1) {
          const firstItemId = first[firstTarget].item;
          const secondItemId = second[secondTarget].item;
          let firstItem;
          let secondItem;

          if (firstItemId) {
            firstItem = await Item.findById(firstItemId);
          }

          if (secondItemId) {
            secondItem = await Item.findById(secondItemId);
          }

          if (firstCheck === 1 && secondItem && secondItem.type !== "ability") {
            //Item is being dragged out of abilities
            return "Cannot use that";
          } else if (secondCheck === 1 && firstItem && firstItem.type !== "ability") {
            //Item is being dragged into abilities
            return "Cannot use that";
          }
        }

        firstModItem = first[firstTarget];
        secondModItem = second[secondTarget];

        first[firstTarget] = secondModItem;
        second[secondTarget] = firstModItem;
        first.save();
        second.save();

        return "Successful item switch";
      } catch (err) {
        throw new Error(err);
      }
    },
    async createItem(
      _,
      {
        createItemInput: {
          name,
          desc,
          path,
          type,
          ability,
          slots,
          focus,
          essence,
          mindCap,
          bodyCap,
          soulCap,
          creation,
          restoration,
          destruction,
          projection,
          vitality,
          defense,
          strength,
          dexterity,
          luck,
          capacity,
          clarity,
          will,
          perks,
        },
      },
      context
    ) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const nameCheck = await Item.findOne({ name });
        if (nameCheck) {
          throw new UserInputError("Item name is taken");
        }
        const newMind = {
          cap: mindCap,
          creation: creation,
          destruction: destruction,
          restoration: restoration,
          projection: projection,
        };

        const newBody = {
          cap: bodyCap,
          vitality: vitality,
          defense: defense,
          strength: strength,
          dexterity: dexterity,
        };

        const newSoul = {
          cap: soulCap,
          luck: luck,
          capacity: capacity,
          clarity: clarity,
          will: will,
        };

        const newEssence = {
          focus: focus,
          value: essence,
        };

        const newItem = new Item({
          name,
          desc,
          path,
          type,
          ability,
          slots,
          essence: newEssence,
          mind: newMind,
          body: newBody,
          soul: newSoul,
          perks,
        });

        const item = newItem.save();
        return item;
      } else {
        throw new AuthenticationError("Invalid Permissions");
      }
    },
    async removeItem(_, { itemId }, context) {
      //TODO UPDATE THIS TO REMOVE ALL INVENTORIES WITH ITEM
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        try {
          const item = await Item.findById(itemId);
          await item.delete();
          return "Item is removed from database";
        } catch (err) {
          throw new Error(err);
        }
      } else {
        throw new AuthenticationError("Invalid Permissions");
      }
    },
  },
};
