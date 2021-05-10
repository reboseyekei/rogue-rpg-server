const { UserInputError } = require("apollo-server");

const mongoose = require("mongoose");
const User = require("../../models/User");
const Character = require("../../models/Character");
const Spirit = require("../../models/Spirit");
const Inventory = require("../../models/Inventory");
const Equipment = require("../../models/Equipment");
const Attributes = require("../../models/Attribute");
const Debuffs = require("../../models/Debuffs");
const Buffs = require("../../models/Buffs");
const AbilitiesInv = require("../../models/AbilitiesInv");
const Location = require("../../models/Location");

const { validateCharacterInput } = require("../../util/validators");
const checkAuth = require("../../util/checkAuth");

module.exports = {
  Query: {
    async getCharacters(_, { userId }) {
      try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const user = await User.findById(userId);
        if (user) {
          let data = [];
          user.characters.map((characterId, index) => {
            const character = Character.findById(characterId);
            if (character) {
              data.push(character);
            } else {
              user.characters.splice(index, 1);
            }
          });
          user.save();
          return data;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getCharacter(_, { characterId }) {
      try {
        if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const character = await Character.findById(characterId);
        if (character) {
          return character;
        } else {
          throw new Error("Character not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createCharacter(_, { createCharacterInput: { charName, locationId, spiritId } }, context) {
      const verify = checkAuth(context);

      const user = await User.findById(verify.id);

      const { valid, errors } = validateCharacterInput(charName);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const characterId = mongoose.Types.ObjectId();
      const inventoryId = mongoose.Types.ObjectId();
      const equipmentId = mongoose.Types.ObjectId();
      const abilitiesInvId = mongoose.Types.ObjectId();

      user.characters.push(characterId);

      //Getting Spirit Template
      if (!spiritId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID");
      }
      const spirit = await Spirit.findById(spiritId);
      if (!spirit) {
        throw new Error("Spirit not found");
      }

      const newAttributes = new Attributes({
        space: { default: 0, mod: 0 },
        time: { default: 0, mod: 0 },
        death: { default: 0, mod: 0 },
        life: { default: 0, mod: 0 },
        fire: { default: 0, mod: 0 },
        water: { default: 0, mod: 0 },
        earth: { default: 0, mod: 0 },
        air: { default: 0, mod: 0 },
      });

      const newBuffs = new Buffs({
        regen: { default: 0, mod: 0 },
        dread: { default: 0, mod: 0 },
        poison: { default: 0, mod: 0 },
        scorch: { default: 0, mod: 0 },
        cold: { default: 0, mod: 0 },
        spark: { default: 0, mod: 0 },
        reflect: { default: 0, mod: 0 },
        summon: { default: 0, mod: 0 },
        taunt: { default: 0, mod: 0 },
        flee: { default: 0, mod: 0 },
        immortal: 0,
        strong: 0,
        warped: 0,
        sniper: 0,
        wellspring: 0,
        overcharged: 0,
        scavenger: 0,
        swift: 0,
      });

      const newDebuffs = new Debuffs({
        fear: { default: 0, mod: 0 },
        burn: { default: 0, mod: 0 },
        freeze: { default: 0, mod: 0 },
        shock: { default: 0, mod: 0 },
        toxin: { default: 0, mod: 0 },
        decay: { default: 0, mod: 0 },
        bleed: { default: 0, mod: 0 },
        exhaustion: { default: 0, mod: 0 },
        explosion: 0,
        paralysis: 0,
        frozen: 0,
        scorched: 0,
        sleep: 0,
      });

      const newMind = {
        cap: 0,
        creation: 0,
        destruction: 0,
        restoration: 0,
        projection: 0,
      };

      const newBody = {
        cap: 0,
        vitality: 0,
        defense: 0,
        strength: 0,
        dexterity: 0,
      };

      const newSoul = {
        cap: 0,
        luck: 0,
        capacity: 0,
        clarity: 0,
        will: 0,
      };

      if (spirit.attributes) {
        if (spirit.attributes.space.default) newAttributes.space.default += spirit.attributes.space.default;
        if (spirit.attributes.time.default) newAttributes.time.default += spirit.attributes.time.default;
        if (spirit.attributes.death.default) newAttributes.death.default += spirit.attributes.death.default;
        if (spirit.attributes.life.default) newAttributes.life.default += spirit.attributes.life.default;
        if (spirit.attributes.fire.default) newAttributes.fire.default += spirit.attributes.fire.default;
        if (spirit.attributes.water.default) newAttributes.water.default += spirit.attributes.water.default;
        if (spirit.attributes.earth.default) newAttributes.earth.default += spirit.attributes.earth.default;
        if (spirit.attributes.air.default) newAttributes.air.default += spirit.attributes.air.default;
      }

      if (spirit.buffs) {
        if (spirit.buffs.regen.default) newBuffs.regen.default += spirit.buffs.regen.default;
        if (spirit.buffs.dread.default) newBuffs.dread.default += spirit.buffs.dread.default;
        if (spirit.buffs.poison.default) newBuffs.poison.default += spirit.buffs.poison.default;
        if (spirit.buffs.scorch.default) newBuffs.scorch.default += spirit.buffs.scorch.default;
        if (spirit.buffs.cold.default) newBuffs.cold.default += spirit.buffs.cold.default;
        if (spirit.buffs.spark.default) newBuffs.spark.default += spirit.buffs.spark.default;
        if (spirit.buffs.reflect.default) newBuffs.reflect.default += spirit.buffs.reflect.default;
        if (spirit.buffs.summon.default) newBuffs.summon.default += spirit.buffs.summon.default;
        if (spirit.buffs.taunt.default) newBuffs.taunt.default += spirit.buffs.taunt.default;
        if (spirit.buffs.flee.default) newBuffs.flee.default += spirit.buffs.flee.default;
      }

      if (spirit.debuffs) {
        if (spirit.debuffs.fear.default) newDebuffs.fear.default += spirit.debuffs.fear.default;
        if (spirit.debuffs.freeze.default) newDebuffs.freeze.default += spirit.debuffs.freeze.default;
        if (spirit.debuffs.shock.default) newDebuffs.shock.default += spirit.debuffs.shock.default;
        if (spirit.debuffs.toxin.default) newDebuffs.toxin.default += spirit.debuffs.toxin.default;
        if (spirit.debuffs.decay.default) newDebuffs.decay.default += spirit.debuffs.decay.default;
        if (spirit.debuffs.bleed.default) newDebuffs.bleed.default += spirit.debuffs.bleed.default;
      }

      if (spirit.mind) {
        if (spirit.mind.cap) newMind.cap += spirit.mind.cap;
        if (spirit.mind.creation) newMind.creation += spirit.mind.creation;
        if (spirit.mind.destruction) newMind.destruction += spirit.mind.destruction;
        if (spirit.mind.restoration) newMind.restoration += spirit.mind.restoration;
        if (spirit.mind.projection) newMind.projection += spirit.mind.projection;
      }

      if (spirit.body) {
        if (spirit.body.cap) newBody.cap += spirit.body.cap;
        if (spirit.body.defense) newBody.defense += spirit.body.defense;
        if (spirit.body.vitality) newBody.vitality += spirit.body.vitality;
        if (spirit.body.strength) newBody.strength += spirit.body.strength;
        if (spirit.body.dexterity) newBody.dexterity += spirit.body.dexterity;
      }

      if (spirit.soul) {
        if (spirit.soul.cap) newSoul.cap += spirit.soul.cap;
        if (spirit.soul.luck) newSoul.luck += spirit.soul.luck;
        if (spirit.soul.clarity) newSoul.clarity += spirit.soul.clarity;
        if (spirit.soul.capacity) newSoul.capacity += spirit.soul.capacity;
        if (spirit.soul.will) newSoul.will += spirit.soul.will;
      }

      const newEquipment = new Equipment({
        _id: equipmentId,
        owner: characterId,
        head: { item: null, enchantments: [] },
        upperBody: { item: null, enchantments: [] },
        lowerBody: { item: null, enchantments: [] },
        feet: { item: null, enchantments: [] },
        ringOne: { item: null, enchantments: [] },
        ringTwo: { item: null, enchantments: [] },
        rightHand: { item: null, enchantments: [] },
        leftHand: { item: null, enchantments: [] },
      });

      const newInventory = new Inventory({
        _id: inventoryId,
        owner: characterId,
        one: { item: null, enchantments: [] },
        two: { item: null, enchantments: [] },
        three: { item: null, enchantments: [] },
        four: { item: null, enchantments: [] },
        five: { item: null, enchantments: [] },
        six: { item: null, enchantments: [] },
        seven: { item: null, enchantments: [] },
        eight: { item: null, enchantments: [] },
        nine: { item: null, enchantments: [] },
        ten: { item: null, enchantments: [] },
        eleven: { item: null, enchantments: [] },
        twelve: { item: null, enchantments: [] },
        thirteen: { item: null, enchantments: [] },
        fourteen: { item: null, enchantments: [] },
        fifteen: { item: null, enchantments: [] },
      });

      const newAbilitiesInv = new AbilitiesInv({
        _id: abilitiesInvId,
        owner: characterId,
        slotOne: { item: spirit.abilities[0], enchantments: [] },
        slotTwo: { item: spirit.abilities[1], enchantments: [] },
        slotThree: { item: spirit.abilities[2], enchantments: [] },
        slotFour: { item: spirit.abilities[3], enchantments: [] },
        slotFive: { item: spirit.abilities[4], enchantments: [] },
        slotSix: { item: spirit.abilities[5], enchantments: [] },
        slotSeven: { item: spirit.abilities[6], enchantments: [] },
        slotEight: { item: spirit.abilities[7], enchantments: [] },
        slotNine: { item: spirit.abilities[8], enchantments: [] },
        slotTen: { item: spirit.abilities[9], enchantments: [] },
        slotEleven: { item: spirit.abilities[10], enchantments: [] },
        slotTwelve: { item: spirit.abilities[11], enchantments: [] },
        slotThirteen: { item: spirit.abilities[12], enchantments: [] },
        slotFourteen: { item: spirit.abilities[13], enchantments: [] },
        slotFifteen: { item: spirit.abilities[14], enchantments: [] },
        slotSixteen: { item: spirit.abilities[15], enchantments: [] },
        slotSeventeen: { item: spirit.abilities[16], enchantments: [] },
        slotEighteen: { item: spirit.abilities[17], enchantments: [] },
        slotNineteen: { item: spirit.abilities[18], enchantments: [] },
        slotTwenty: { item: spirit.abilities[19], enchantments: [] },
      });

      /*
      TODO: 
      - Changing amount of default of certain stats based on enterprises or special items.
      - Giving a certain ability based on focus you initially choose
      */
      const newCharacter = new Character({
        _id: characterId,
        owner: user.id,
        name: charName,
        spirit: spirit.name,
        droprate: 5,
        tags: [],
        titles: [],
        place: locationId,
        level: spirit.level,
        cap: 20,
        alignment: user.purity + spirit.alignment,
        humanity: user.wisdom + spirit.humanity,
        slots: spirit.slots,
        attributes: newAttributes,
        buffs: newBuffs,
        debuffs: newDebuffs,
        abilitiesInv: abilitiesInvId,
        cooldowns: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        mind: newMind,
        body: newBody,
        soul: newSoul,
        shield: spirit.shield,
        health: spirit.health,
        mana: spirit.mana,
        stamina: spirit.stamina,
        defRes: spirit.defRes,
        debuffRes: spirit.debuffRes,
        perks: spirit.perks,
        effects: [],
        canEquip: spirit.canEquip,
        equipment: equipmentId,
        inventory: inventoryId,
        familiar: "",
        skins: spirit.skins,
        lines: [[]],
        ai: "mob",
        createdAt: new Date().toISOString(),
      });

      await user.save();
      await newEquipment.save();
      await newInventory.save();
      await newAbilitiesInv.save();
      const character = await newCharacter.save();

      return character;
    },
    async changeSkin(_, { skinIndex, characterId }) {
      try {
        if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const character = await Character.findById(characterId);
        if (character) {
          if(skinIndex < character.skins[1].length){
            let newSkin = character.skins[1][skinIndex];            
            character.skins[0].splice(0, 1);
            character.skins[0].push(newSkin);
          } else {
            throw new Error("Invalid Skin Index")
          }
          character.markModified('skins');
          character.save();
          return character;
        } else {
          throw new Error("Character not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async updateCharacterStats(
      _,
      {
        updateCharacterStatsInput: {
          characterId,
          capUsed,
          statUsed,
          mindCap,
          bodyCap,
          soulCap,
          creation,
          destruction,
          restoration,
          projection,
          vitality,
          defense,
          strength,
          dexterity,
          luck,
          capacity,
          clarity,
          will,
        },
      }
    ) {
      try {
        if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const character = await Character.findById(characterId);
        if (character) {
          //Adding up the values of what was sent to the server for math
          let totalMind = creation + destruction + restoration + projection;
          let totalBody = vitality + defense + strength + dexterity;
          let totalSoul = luck + capacity + clarity + will;
          //
          let totalStat = totalMind + totalBody + totalSoul;
          let totalCap = mindCap + bodyCap + soulCap;

          //Adding up the values of what was sent and what is currently on the server for math
          let fullMind = totalMind + character.mind.creation + character.mind.destruction + character.mind.restoration + character.mind.projection;
          let fullBody = totalBody + character.body.vitality + character.body.defense + character.body.strength + character.body.dexterity;
          let fullSoul = totalSoul + character.soul.luck + character.soul.capacity + character.soul.clarity + character.soul.will;

          if (capUsed <= character.level.cap && statUsed <= character.level.stat && totalStat <= character.level.stat && totalCap <= character.level.cap) {
            //Evaluating that the character's stats fit inside the character's cap limit
            if (mindCap + character.mind.cap >= fullMind && bodyCap + character.body.cap >= fullBody && soulCap + character.soul.cap >= fullSoul) {
              //Checking for mismatches in the total stat/cap points used. If there is a mismatch its likely an exploit
              if (totalStat === statUsed && totalCap === capUsed) {
                //removing used stat/cap points
                character.level.cap -= capUsed;
                character.level.stat -= statUsed;

                //saving changes made in mind,body, and soul categories
                //mind
                character.mind.cap += mindCap;
                character.mind.creation += creation;
                character.mind.destruction += destruction;
                character.mind.restoration += restoration;
                character.mind.projection += projection;

                //body
                character.body.cap += bodyCap;
                character.body.vitality += vitality;
                character.body.defense += defense;
                character.body.strength += strength;
                character.body.dexterity += dexterity;

                //soul
                character.soul.cap += soulCap;
                character.soul.luck += luck;
                character.soul.capacity += capacity;
                character.soul.clarity += clarity;
                character.soul.will += will;

                let totalHealth = bodyCap * 2 + vitality * 4;
                let totalHealthRegen = vitality + defense;
                let totalMana = mindCap * 2 + capacity * 4 + clarity * 2;
                let totalManaRegen = clarity * 2 + capacity * 1;
                let totalStamina = strength * 4 + dexterity * 2;
                let totalStaminaRegen = strength * 1 + dexterity * 2;
                let totalShield = projection * 5;
                let totalShieldRegen = projection * 1;

                character.health.current += totalHealth;
                character.mana.current += totalMana;
                character.stamina.current += totalStamina;
                character.shield.current += totalShield;

                await character.save();
                return character;
              } else {
                throw new Error("Exploit likely detected, invalid request");
              }
            } else {
              throw new Error("Invalid stat point placement: not enough cap, etc");
            }
          } else {
            throw new Error("Insufficient level points");
          }
        } else {
          throw new Error("Character not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async deleteCharacter(_, { characterId }) {
      try {
        const character = await Character.findById(characterId);
        await character.delete();
        return "Character has died";
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
