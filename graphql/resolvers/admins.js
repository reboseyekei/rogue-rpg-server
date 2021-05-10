const mongoose = require("mongoose");
const { AuthenticationError } = require("apollo-server-errors");

const checkAuth = require("../../util/checkAuth");
const { adminList } = require("../../util/admins");

const User = require("../../models/User");
const Character = require("../../models/Character");
const Spirit = require("../../models/Spirit");
const Location = require("../../models/Location");
const MonsterTemplate = require("../../models/MonsterTemplate");
const AreaTemplate = require("../../models/AreaTemplate");
const Perk = require("../../models/Perk");


const AbilitiesInv = require("../../models/AbilitiesInv");
const Inventory = require("../../models/Inventory");
const Equipment = require("../../models/Equipment");
const Party = require("../../models/Party");
const Dungeon = require("../../models/Dungeon");

module.exports = {
  Query: {
    async getSpirit(_, { spiritId }) {
      try {
        if (!spiritId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const spirit = await Spirit.findById(spiritId);
        if (spirit) {
          return spirit;
        } else {
          throw new Error("Spirit not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSpirits(_, { userId }) {
      try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const user = await User.findById(userId);
        if (user) {
          let data = [];
          user.spirits.map((spiritId, index) => {
            const spirit = Spirit.findById(spiritId);
            if (spirit) {
              data.push(spirit);
            } else {
              user.spirits.splice(index, 1);
            }
          });
          user.save();
          return data;
        } else {
          throw new Error("Spirit not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPerk(_, { perkId }) {
      try {
        if (!perkId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const perk = await Perk.findById(perkId);
        if (perk) {
          return perk;
        } else {
          throw new Error("Perk not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getMonsterTemplate(_, { monsterTemplateId }) {
      try {
        if (!monsterTemplateId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const monsterTemplate = await MonsterTemplate.findById(monsterTemplateId);
        if (monsterTemplate) {
          return monsterTemplate;
        } else {
          throw new Error("Monster Template not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAreaTemplate(_, { areaTemplateId }) {
      try {
        if (!areaTemplateId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const areaTemplate = await AreaTemplate.findById(areaTemplateId);
        if (areaTemplate) {
          return areaTemplate;
        } else {
          throw new Error("Area Template not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createSpirit(
      _,
      {
        createSpiritInput: {
          name,
          desc,
          alignment,
          humanity,
          level,
          slots,
          abilities,
          mind,
          body,
          soul,
          attributes,
          buffs,
          debuffs,
          health,
          mana,
          stamina,
          shield,
          defRes,
          debuffRes,
          perks,
          canEquip,
          skins,
        },
      },
      context
    ) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newSpirit = new Spirit({
          name,
          desc,
          alignment,
          humanity,
          level,
          slots,
          abilities,
          mind,
          body,
          soul,
          attributes,
          buffs,
          debuffs,
          health,
          mana,
          stamina,
          shield,
          defRes,
          debuffRes,
          perks,
          canEquip,
          skins,
        });
        const spirit = newSpirit.save();
        return spirit;
      } else {
        throw new AuthenticationError("Must be Administrator");
      }
    },
    async createLocation(_, { createLocationInput: { name, desc, areas } }, context) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newLocation = new Location({
          name,
          desc,
          characters: [],
          areas,
        });
        const location = newLocation.save();
        return location;
      } else {
        throw new AuthenticationError("Must be Administrator");
      }
    },
    async createMonsterTemplate(
      _,
      {
        createMonsterTemplateInput: {
          name,
          type,
          alignmentRange,
          humanity,
          rarity,
          droprate,
          environments,
          level,
          attributes,
          buffs,
          debuffs,
          slots,
          abilities,
          cooldown,
          mind,
          body,
          soul,
          health,
          mana,
          stamina,
          shield,
          defRes,
          debuffRes,
          perks,
          effects,
          equipment,
          canEquip,
          items,
          skins,
          lines,
        },
      },
      context
    ) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newMonsterTemplate = new MonsterTemplate(
          {
            _id: mongoose.Types.ObjectId(),
            name,
            desc,
            type,
            alignmentRange,
            humanity,
            rarity,
            droprate,
            environments,
            level,
            attributes,
            buffs,
            debuffs,
            slots,
            abilities,
            cooldown,
            mind,
            body,
            soul,
            health,
            mana,
            stamina,
            shield,
            defRes,
            debuffRes,
            perks,
            effects,
            equipment,
            canEquip,
            items,
            skins,
            lines,
          },
          { collections: "monsters" }
        );
        const monsterTemplate = newMonsterTemplate.save();
        return monsterTemplate;
      } else {
        throw new AuthenticationError("Must be Administrator");
      }
    },
    async createAreaTemplate(
      _,
      {
        createAreaTemplateInput: {
          name,
          desc,
          icon,
          type,
          level,
          alignment,
          humanity,
          rarity,
          chaos,
          droprate,
          size,
          length,
          range,
          maxLifespan,
          containment,
          creatures,
          bosses,
          environments,
        },
      },
      context
    ) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newAreaTemplate = new AreaTemplate(
          {
            _id: mongoose.Types.ObjectId(),
            name,
            desc,
            icon,
            type,
            level,
            alignment,
            humanity,
            rarity,
            chaos,
            droprate,
            size,
            length,
            range,
            maxLifespan,
            containment,
            creatures,
            bosses,
            environments,
          },
          { collections: "areas" }
        );
        const areaTemplate = newAreaTemplate.save();
        return areaTemplate;
      } else {
        throw new AuthenticationError("Must be Administrator");
      }
    },
    async createPerk(_, { createPerkInput: { name, desc, attributes, buffs, debuffs } }, context) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newPerk = new Perk(
          {
            _id: mongoose.Types.ObjectId(),
            name,
            desc,
            attributes,
            buffs,
            debuffs,
          },
          { collection: "perks" }
        );
        const perk = newPerk.save();
        return perk;
      } else {
        throw new AuthenticationError("Must be Administrator");
      }
    },
    async deleteAll(_, __, context) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        await Location.updateMany({}, {"$set":{"parties": []}});

        await User.deleteMany({});
        await Character.deleteMany({});
        await AbilitiesInv.deleteMany({});
        await Equipment.deleteMany({});
        await Inventory.deleteMany({});
        await Party.deleteMany({});
        await Dungeon.deleteMany({});

        return "All deleted";
      } else {
        throw new AuthenticationError("Must be Administrator")
      }
    },
  },
  Subscription: {
    connection: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("connect"),
    },
  },
};
