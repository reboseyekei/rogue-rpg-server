const Equipment = require("../../models/Equipment");

const Item = require("../../models/Item");
const { equips } = require("../../models/_Objects");

module.exports = {
  Query: {
    async getEquipment(_, { equipmentId }) {
      try {
        if (!equipmentId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const equipment = await Equipment.findById(equipmentId);
        if (equipment) {
          return equipment;
        } else {
          throw new Error("Equipment not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getEquips(_, { equipmentId }) {
      try {
        if (!equipmentId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const equipment = await Equipment.findById(equipmentId);
        if (equipment) {
          let head = equipment.head.item;
          let upperBody = equipment.upperBody.item;
          let lowerBody = equipment.lowerBody.item;
          let feet = equipment.feet.item;
          let leftHand = equipment.leftHand.item;
          let rightHand = equipment.rightHand.item;
          let ringOne = equipment.ringOne.item;
          let ringTwo = equipment.ringTwo.item;

          var equips = {
            head: null,
            upperBody: null,
            lowerBody: null,
            feet: null,
            leftHand: null,
            rightHand: null,
            ringOne: null,
            ringTwo: null,
          };

          async function itemSearch(item) {
            const itemFound = await Item.findById(item);
            if (itemFound) {
              return itemFound;
            } else {
              throw new Error("Item not found");
            }
          }

          if (head) {
            equips.head = itemSearch(head);
          }
          if (upperBody) {
            equips.upperBody = itemSearch(upperBody);
          }
          if (lowerBody) {
            equips.lowerBody = itemSearch(lowerBody);
          }
          if (feet) {
            equips.feet = itemSearch(feet);
          }
          if (leftHand) {
            equips.leftHand = itemSearch(leftHand);
          }
          if (rightHand) {
            equips.rightHand = itemSearch(rightHand);
          }
          if (ringOne) {
            equips.ringOne = itemSearch(ringOne);
          }
          if (ringTwo) {
            equips.ringTwo = itemSearch(ringTwo);
          }

          return equips;
        } else {
          throw new Error("Equipment not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async deleteEquip(_, { deleteEquipInput: { equipmentId, target } }) {
      try {
        const equipment = await Equipment.findById(equipmentId);
        equipment[target] = { item: null, enchantment: [] };
        equipment.save();
      } catch (err) {
        throw new Error(err);
      }
    },
    async deleteEquipment(_, { equipmentId }) {
      try {
        const equipment = await Equipment.findById(equipmentId);
        await equipment.delete();
        return "Equipment is gone";
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
