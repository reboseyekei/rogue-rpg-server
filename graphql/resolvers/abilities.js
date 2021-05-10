const checkAuth = require("../../util/checkAuth");
const { AuthenticationError } = require("apollo-server");

const User = require("../../models/User");
const Ability = require("../../models/Ability");
const AbilitiesInv = require("../../models/AbilitiesInv");
const { adminList } = require("../../util/admins");

module.exports = {
  Query: {
    async getAbility(_, { abilityId }) {
      try {
        if (!abilityId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const ability = await Ability.findById(abilityId);
        if (ability) {
          return ability;
        } else {
          throw new Error("Ability not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAbilitiesInv(_, { abilitiesInvId }) {
      try {
        if (!abilitiesInvId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const abilitiesInv = await AbilitiesInv.findById(abilitiesInvId);
        if (abilitiesInv) {
          return abilitiesInv;
        } else {
          throw new Error("Abilities inventory not found");
        }
      } catch (err) {}
    },
  },
  Mutation: {
    async createAbility(
      _,
      {
        createAbilityInput: {
          tag,
          lvl,
          target,
          healthCost,
          manaCost,
          staminaCost,
          shieldCost,
          mindReq,
          bodyReq,
          soulReq,
          repeatable,
          mindRepeat,
          bodyRepeat,
          soulRepeat,
          effects,
          damage,
          healthGain,
          manaGain,
          staminaGain,
          shieldGain,
        },
      },
      context
    ) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (adminList.includes(user.username)) {
        const newAbility = new Ability({
          tag,
          lvl,
          target,
          healthCost,
          manaCost,
          staminaCost,
          shieldCost,
          mindReq,
          bodyReq,
          soulReq,
          repeatable,
          mindRepeat,
          bodyRepeat,
          soulRepeat,
          effects,
          damage,
          healthGain,
          manaGain,
          staminaGain,
          shieldGain,
        });

        const ability = newAbility.save();
        return ability;
      } else {
        throw new AuthenticationError("Invalid Permissions");
      }
    },
  },
};
