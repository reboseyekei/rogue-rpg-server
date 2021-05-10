const checkAuth = require("../../util/checkAuth");
const { AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");

const User = require("../../models/User");
const Character = require("../../models/Character");
const Inventory = require("../../models/Inventory");
const Equipment = require("../../models/Equipment");
const AbilitiesInv = require("../../models/AbilitiesInv");
const Attributes = require("../../models/Attribute");
const Debuffs = require("../../models/Debuffs");
const Buffs = require("../../models/Buffs");
const Item = require("../../models/Item");
const Dungeon = require("../../models/Dungeon");
const Party = require("../../models/Party");
const Location = require("../../models/Location");
const MonsterTemplate = require("../../models/MonsterTemplate");
const AreaTemplate = require("../../models/AreaTemplate");

const { parseEquipped, parseEquip, sum } = require("../../util/helpers");
const Ability = require("../../models/Ability");

const attributeList = ["space", "time", "death", "life", "fire", "water", "earth", "air"];
const buffList = [
  "regen",
  "dread",
  "poison",
  "scorch",
  "cold",
  "spark",
  "reflect",
  "summon",
  "taunt",
  "flee",
  "immortal",
  "strong",
  "warped",
  "sniper",
  "wellspring",
  "overcharged",
  "scavenger",
  "swift",
];
const debuffList = ["fear", "burn", "freeze", "shock", "toxin", "decay", "bleed", "exhaustion", "explosion", "paralysis", "frozen", "scorched", "sleep"];
const mindList = ["destruction", "creation", "restoration", "projection"];
const bodyList = ["vitality", "defense", "strength", "dexterity"];
const soulList = ["luck", "clarity", "capacity", "will"];
const slotList = [
  "slotOne",
  "slotTwo",
  "slotThree",
  "slotFour",
  "slotFive",
  "slotSix",
  "slotSeven",
  "slotEight",
  "slotNine",
  "slotTen",
  "slotEleven",
  "slotTwelve",
  "slotThirteen",
  "slotFourteen",
  "slotFifteen",
  "slotSixteen",
  "slotSeventeen",
  "slotEighteen",
  "slotNineteen",
  "slotTwenty",
];

function slotChecker(slots, slot) {
  let slotNum;
  switch (slot) {
    case "slotOne":
      slotNum = 1;
      break;
    case "slotTwo":
      slotNum = 2;
      break;
    case "slotThree":
      slotNum = 3;
      break;
    case "slotFour":
      slotNum = 4;
      break;
    case "slotFive":
      slotNum = 5;
      break;
    case "slotSix":
      slotNum = 6;
      break;
    case "slotSeven":
      slotNum = 8;
      break;
    case "slotNine":
      slotNum = 9;
      break;
    case "slotTen":
      slotNum = 10;
      break;
    case "slotEleven":
      slotNum = 11;
      break;
    case "slotTwelve":
      slotNum = 12;
      break;
    case "slotThirteen":
      slotNum = 13;
      break;
    case "slotFourteen":
      slotNum = 14;
      break;
    case "slotFifteen":
      slotNum = 15;
      break;
    case "slotSixteen":
      slotNum = 16;
      break;
    case "slotOSeventeen":
      slotNum = 17;
      break;
    case "slotEighteen":
      slotNum = 18;
      break;
    case "slotNineteen":
      slotNum = 19;
      break;
    case "slotTwenty":
      slotNum = 20;
      break;
  }
  if (slotNum <= slots) {
    return true;
  } else {
    return false;
  }
}

function sortArray(ids, initiatives) {
  sorted = [];
  checked = [];
  let stop = false;
  let max = -1;

  for (let i = 0; i < ids.length; i++) {
    checked[i] = false;
  }

  while (!stop) {
    stop = true;
    for (let i = 0; i < checked.length; i++) {
      if (!checked[i]) {
        if (max == -1 || checked[max] || initiatives[i] > initiatives[max]) {
          max = i;
          stop = false;
        }
      }
    }

    if (!stop) {
      checked[max] = true;
      sorted.push(ids[max]);
    }
  }
  return sorted;
}

async function destroyCharacter(characterId, isPlayer) {
  if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID");
  }

  const character = await Character.findById(characterId);

  if (character) {
    if (isPlayer) {
      //First step, removing it from the user that owns the character
      const user = await User.findById(character.owner);
      user.characters.splice(user.characters.indexOf(characterId), 1);

      //Second Step, removing the character from the party
      const party = await Party.findById(character.party);
      party.characters.splice(party.characters.indexOf(characterId), 1);

      //Third step, removing the character from the dungeon
      if (dungeon.players.length === 1) {
        //If there is only one person in the dungeon just delete the dungeon
        await Dungeon.findByIdAndDelete(character.place);
      } else {
        //If there is more than one person than remove that player from the dungeon
        const dungeon = await Dungeon.findById(character.place);
        const charIndex = dungeon.players.indexOf(characterId);
        dungeon.players.splice(charIndex, 1);

        //Remove the player from the turn list
        let turnIndex = dungeon.turn[1].indexOf(characterId);
        dungeon.turn[1].splice(turnIndex, 1);

        if (dungeon.turn[0][0] === characterId) {
          //If it was the dead players turn
          nextTurn(character.place);
        }
        await Dungeon.findByIdAndUpdate(character.place, { turn: dungeon.turn, players: dungeon.players });
      }
    } else {
      const dungeon = await Dungeon.findById(character.owner);
      dungeon.occupants.splice(dungeon.occupants.indexOf(characterId), 1);
      //Remove the occupant from the turn list
      let turnIndex = dungeon.turn[1].indexOf(characterId);
      dungeon.turn[1].splice(turnIndex, 1);

      if (dungeon.turn[0][0] === characterId) {
        //If it was the dead players turn
        nextTurn(character.owner);
      }
      await Dungeon.findByIdAndUpdate(character.owner, { turn: dungeon.turn, occupants: dungeon.occupants });
    }

    //Second Step, deleting the inventory, abilitiesInv, and equipment
    await Inventory.findByIdAndDelete(character.inventory);
    await Equipment.findByIdAndDelete(character.equipment);
    await AbilitiesInv.findByIdAndDelete(character.abilitiesInv);
    character.delete();
  } else {
    throw new Error("Character cannot be found");
  }
}

async function getAbilityData(itemId) {
  const item = await Item.findById(itemId);
  const ability = await Ability.findById(item.ability);
  if (item && ability) {
    return ability;
  }
}

async function getItemData(itemId) {
  const item = await Item.findById(itemId);
  if (item) {
    return item;
  }
}

function checkReqs(character, ability) {
  if (ability.mindReq && character.mind.cap < ability.mindReq) {
    return false;
  }
  if (ability.bodyReq && character.body.cap < ability.bodyReq) {
    return false;
  }
  if (ability.soulReq && character.soul.cap < ability.soulReq) {
    return false;
  }
  if (ability.healthCost && character.health.current <= ability.healthCost) {
    return false;
  }
  if (ability.manaCost && character.mana.current < ability.manaCost) {
    return false;
  }
  if (ability.staminaCost && character.stamina.current < ability.staminaCost) {
    return false;
  }
  if (ability.shieldCost && character.shield.current < ability.shieldCost) {
    return false;
  }
  return true;
}

function calcDivisionMult(charDivision, scaleDivision) {
  let mult = 0;
  if (scaleDivision.current) {
    mult += Math.floor(charDivision.current / scaleDivision.current);
  }
  if (scaleDivision.max) {
    mult += Math.floor(charDivision.max / scaleDivision.max);
  }
  if (scaleDivision.division) {
    let div = charDivision.max / charDivision.current;
    mult += Math.floor(div / scaleDivision.division);
  }
  return mult;
}

function calcCategoryMult(target, charCategory, scaleCategory) {
  let mult = 0;
  if (target === "mind" || target === "mindRepeat") {
    if (scaleCategory.cap) mult += Math.floor(charCategory.cap / scaleCategory.cap);
    if (scaleCategory.destruction) mult += Math.floor(charCategory.destruction / scaleCategory.destruction);
    if (scaleCategory.creation) mult += Math.floor(charCategory.creation / scaleCategory.creation);
    if (scaleCategory.restoration) mult += Math.floor(charCategory.restoration / scaleCategory.restoration);
    if (scaleCategory.projection) mult += Math.floor(charCategory.projection / scaleCategory.projection);
  } else if (target === "body" || target === "bodyRepeat") {
    if (scaleCategory.cap) mult += Math.floor(charCategory.cap / scaleCategory.cap);
    if (scaleCategory.vitality) mult += Math.floor(charCategory.vitality / scaleCategory.vitality);
    if (scaleCategory.defense) mult += Math.floor(charCategory.defense / scaleCategory.defense);
    if (scaleCategory.strength) mult += Math.floor(charCategory.strength / scaleCategory.strength);
    if (scaleCategory.dexterity) mult += Math.floor(charCategory.dexterity / scaleCategory.dexterity);
  } else if (target === "soul" || target === "soulRepeat") {
    if (scaleCategory.cap) mult += Math.floor(charCategory.cap / scaleCategory.cap);
    if (scaleCategory.luck) mult += Math.floor(charCategory.luck / scaleCategory.luck);
    if (scaleCategory.clarity) mult += Math.floor(charCategory.clarity / scaleCategory.clarity);
    if (scaleCategory.capacity) mult += Math.floor(charCategory.capacity / scaleCategory.capacity);
    if (scaleCategory.will) mult += Math.floor(charCategory.will / scaleCategory.will);
  }
  return mult;
}

function calcAlterMult(data, target) {
  let mult = 0;
  if (target.default && target.mod) {
    //Treat the mod and default as seperate, with their own multipliers
    mult += Math.floor(data.default / target.default);
    mult += Math.floor(data.mod / target.mod);
  } else if (target.default) {
    //Treat the mod and default values as the same, with a single multiplier
    let total = data.default + data.mod;
    mult += Math.floor(total / target.default);
  } else if (target.mod) {
    //Only add a multiplier for mod
    mult += Math.floor(total / target.mod);
  }
  return mult;
}

function calcBuffsMult(charBuffs, scaleBuffs) {
  let mult = 0;
  //Alter buffs
  if (scaleBuffs.regen) mult += calcAlterMult(charBuffs.regen, scaleBuffs.regen);
  if (scaleBuffs.dread) mult += calcAlterMult(charBuffs.dread, scaleBuffs.dread);
  if (scaleBuffs.poison) mult += calcAlterMult(charBuffs.poison, scaleBuffs.poison);
  if (scaleBuffs.scorch) mult += calcAlterMult(charBuffs.scorch, scaleBuffs.scorch);
  if (scaleBuffs.cold) mult += calcAlterMult(charBuffs.cold, scaleBuffs.cold);
  if (scaleBuffs.spark) mult += calcAlterMult(charBuffs.spark, scaleBuffs.spark);
  if (scaleBuffs.reflect) mult += calcAlterMult(charBuffs.reflect, scaleBuffs.reflect);
  if (scaleBuffs.summon) mult += calcAlterMult(charBuffs.summon, scaleBuffs.summon);
  if (scaleBuffs.taunt) mult += calcAlterMult(charBuffs.taunt, scaleBuffs.taunt);
  if (scaleBuffs.flee) mult += calcAlterMult(charBuffs.flee, scaleBuffs.flee);
  //Timed buffs
  if (scaleBuffs.immortal) mult += Math.floor(charBuffs.immortal / scaleBuffs.immortal);
  if (scaleBuffs.strong) mult += Math.floor(charBuffs.strong / scaleBuffs.strong);
  if (scaleBuffs.warped) mult += Math.floor(charBuffs.warped / scaleBuffs.warped);
  if (scaleBuffs.sniper) mult += Math.floor(charBuffs.sniper / scaleBuffs.sniper);
  if (scaleBuffs.wellspring) mult += Math.floor(charBuffs.wellspring / scaleBuffs.wellspring);
  if (scaleBuffs.overcharged) mult += Math.floor(charBuffs.overcharged / scaleBuffs.overcharged);
  if (scaleBuffs.scavenger) mult += Math.floor(charBuffs.scavenger / scaleBuffs.scavenger);
  if (scaleBuffs.swift) mult += Math.floor(charBuffs.swift / scaleBuffs.swift);
  return mult;
}

function calcDebuffsMult(charDebuffs, scaleDebuffs) {
  let mult = 0;
  //Alter buffs
  if (scaleDebuffs.fear) mult += calcAlterMult(charDebuffs.fear, scaleDebuffs.fear);
  if (scaleDebuffs.burn) mult += calcAlterMult(charDebuffs.burn, scaleDebuffs.burn);
  if (scaleDebuffs.freeze) mult += calcAlterMult(charDebuffs.freeze, scaleDebuffs.freeze);
  if (scaleDebuffs.shock) mult += calcAlterMult(charDebuffs.shock, scaleDebuffs.shock);
  if (scaleDebuffs.toxin) mult += calcAlterMult(charDebuffs.toxin, scaleDebuffs.toxin);
  if (scaleDebuffs.decay) mult += calcAlterMult(charDebuffs.decay, scaleDebuffs.decay);
  if (scaleDebuffs.bleed) mult += calcAlterMult(charDebuffs.bleed, scaleDebuffs.bleed);
  if (scaleDebuffs.exhaustion) mult += calcAlterMult(charDebuffs.exhaustion, scaleDebuffs.exhaustion);
  //Timed buffs
  if (scaleDebuffs.explosion) mult += Math.floor(charDebuffs.explosion / scaleDebuffs.explosion);
  if (scaleDebuffs.paralysis) mult += Math.floor(charDebuffs.paralysis / scaleDebuffs.paralysis);
  if (scaleDebuffs.frozen) mult += Math.floor(charDebuffs.frozen / scaleDebuffs.frozen);
  if (scaleDebuffs.scorched) mult += Math.floor(charDebuffs.scorched / scaleDebuffs.scorched);
  if (scaleDebuffs.sleep) mult += Math.floor(charDebuffs.sleep / scaleDebuffs.sleep);

  return mult;
}

function calcAttributesMult(charAttributes, scaleAttributes) {
  let mult = 0;

  if (scaleAttributes.space) mult += calcAlterMult(charAttributes.space, scaleAttributes.space);
  if (scaleAttributes.time) mult += calcAlterMult(charAttributes.time, scaleAttributes.time);
  if (scaleAttributes.death) mult += calcAlterMult(charAttributes.death, scaleAttributes.death);
  if (scaleAttributes.life) mult += calcAlterMult(charAttributes.life, scaleAttributes.life);
  if (scaleAttributes.fire) mult += calcAlterMult(charAttributes.fire, scaleAttributes.fire);
  if (scaleAttributes.water) mult += calcAlterMult(charAttributes.water, scaleAttributes.water);
  if (scaleAttributes.earth) mult += calcAlterMult(charAttributes.earth, scaleAttributes.earth);
  if (scaleAttributes.air) mult += calcAlterMult(charAttributes.air, scaleAttributes.air);

  return mult;
}

function calcMultiplier(character, scale) {
  let mult = 1;
  if (scale.health) mult += calcDivisionMult(character.health, scale.health);
  if (scale.mana) mult += calcDivisionMult(character.mana, scale.mana);
  if (scale.stamina) mult += calcDivisionMult(character.stamina, scale.stamina);
  if (scale.shield) mult += calcDivisionMult(character.shield, scale.shield);
  if (scale.mind) mult += calcCategoryMult("mind", character.mind, scale.mind);
  if (scale.body) mult += calcCategoryMult("body", character.body, scale.body);
  if (scale.soul) mult += calcCategoryMult("soul", character.soul, scale.soul);
  if (scale.buffs) mult += calcBuffsMult(character.buffs, scale.buffs);
  if (scale.debuffs) mult += calcDebuffsMult(character.debuffs, scale.debuffs);
  if (scale.attributes) mult += calcAttributesMult(character.attributes, scale.attributes);
  return mult;
}

async function useAbility(charData, abilityData, dungeon, isPlayer) {
  //Getting the character
  const character = await Character.findById(charData.id);

  //Applying the ability costs
  if (abilityData.healthCost) {
    character.health.current -= abilityData.healthCost;
  }
  if (abilityData.manaCost) {
    character.mana.current -= abilityData.manaCost;
  }
  if (abilityData.staminaCost) {
    character.stamina.current -= abilityData.staminaCost;
  }
  if (abilityData.shieldCost) {
    character.shield.current -= abilityData.shieldCost;
  }

  let damage = 0;
  let healthGain = 0;
  let manaGain = 0;
  let staminaGain = 0;
  let shieldGain = 0;

  if (abilityData.damage) {
    damage = abilityData.damage.value;
    if (abilityData.damage.scaled) {
      damage *= calcMultiplier(charData, abilityData.damage);
    }
  }
  if (abilityData.healthGain) {
    healthGain = abilityData.healthGain.value;
    if (abilityData.healthGain.scaled) {
      healthGain *= calcMultiplier(charData, abilityData.healthGain);
    }
  }
  if (abilityData.manaGain) {
    manaGain = abilityData.manaGain.value;
    if (abilityData.manaGain.scaled) {
      manaGain *= calcMultiplier(charData, abilityData.manaGain);
    }
  }
  if (abilityData.staminaGain) {
    staminaGain = abilityData.staminaGain.value;
    if (abilityData.staminaGain.scaled) {
      staminaGain *= calcMultiplier(charData, abilityData.staminaGain);
    }
  }
  if (abilityData.shieldGain) {
    shieldGain = abilityData.shieldGain.value;
    if (abilityData.shieldGain.scaled) {
      shieldGain *= calcMultiplier(charData, abilityData.shieldGain);
    }
  }

  //How many times an ability will repeat
  let repeat = 1;
  if (abilityData.repeatable) {
    let mult = 1;
    if (abilityData.mindRepeat) mult += calcCategoryMult("mindRepeat", character.mind, abilityData.mindRepeat);
    if (abilityData.bodyRepeat) mult += calcCategoryMult("bodyRepeat", character.mind, abilityData.bodyRepeat);
    if (abilityData.soulRepeat) mult += calcCategoryMult("soulRepeat", character.mind, abilityData.soulRepeat);
    repeat *= mult;
    if (repeat > abilityData.repeatable.max) {
      repeat = abilityData.repeatable.max;
    }
  }

  let target;
  if (isPlayer) {
    target = await Character.findById(dungeon.occupants[0]);
  } else {
    let randomPlayer = Math.floor(Math.random() * dungeon.players.length);
    target = await Character.findById(dungeon.players[randomPlayer]);
  }
  for (let i = 0; i < repeat; i++) {
    if (isPlayer) {
      if (abilityData.target === 0) {
        character.health.current -= damage;
        character.health.current += healthGain;
        character.mana.current += manaGain;
        character.stamina.current += staminaGain;
        character.shield.current += shieldGain;
      } else if (abilityData.target > 0) {
        if (abilityData.target === 1 || abilityData.target === 2) {
          target.health.current -= damage;
          character.health.current += healthGain;
          character.mana.current += manaGain;
          character.stamina.current += staminaGain;
          character.shield.current += shieldGain;
        } else if (abilityData.target === 3 || abilityData.target === 4) {
          target.health.current -= damage;
          target.health.current += healthGain;
          target.mana.current += manaGain;
          target.stamina.current += staminaGain;
          target.shield.current += shieldGain;
        }
      }
      if (abilityData.effects) {
        let calcEffect = {};
        for (let i = 0; i < abilityData.effects.length; i++) {
          let effect = abilityData.effects[i];
          calcEffect.name = effect.name;
          calcEffect.turns = effect.turns;
          calcEffect.modifiers = [];
          calcEffect.values = [];
          for (let j = 0; j < effect.modifiers.length; j++) {
            let modifier = effect.modifiers[j];
            let list = [];
            if (attributeList.includes(modifier.target)) {
              list.push("attributes");
              list.push(modifier.target);
              list.push("default");
            } else if (buffList.includes(modifier.target)) {
              list.push("buffs");
              list.push(modifier.target);
              list.push("default");
            } else if (debuffList.includes(modifier.target)) {
              list.push("debuffs");
              list.push(modifier.target);
              list.push("default");
            } else if (mindList.includes(modifier.target)) {
              list.push("mind");
              list.push(modifier.target);
            } else if (bodyList.includes(modifier.target)) {
              list.push("body");
              list.push(modifier.target);
            } else if (soulList.includes(modifier.target)) {
              list.push("soul");
              list.push(modifier.target);
            }
            calcEffect.modifiers.push(list);
            modValue = modifier.scale.value;
            if (modifier.scale.scaled) {
              modValue *= calcMultiplier(charData, modifier.scale);
            }
            calcEffect.values.push(modValue);
          }
          if (effect.target === 0 || effect.target === 1 || (isPlayer && effect.target === 2)) {
            let effectTarget = effect.target === 0 ? character : target;
            for (let i = 0; i < calcEffect.modifiers.length; i++) {
              let modifier = calcEffect.modifiers[i];
              if (modifier.length === 3) {
                effectTarget[modifier[0]][modifier[1]][modifier[2]] += calcEffect.values[i];
              } else if (modifier.length === 2) {
                effectTarget[modifier[0]][modifier[1]] += calcEffect.values[i];
              }
            }
            effectTarget.effects.push(calcEffect);
            await effectTarget.save();
          } else if ((!isPlayer && effect.target === 2) || (isPlayer && effect.target === 3)) {
            //target 2 Only implemented for occupants to damage all players
            //target 3 Only implemented for players to buff all players
            for (let i = 0; i < dungeon.players.length; i++) {
              const effectTarget = await Character.findById(dungeon.players[i]);
              for (let j = 0; j < calcEffect.modifiers.length; j++) {
                let modifier = calcEffect.modifiers[j];
                if (modifier.length === 3) {
                  effectTarget[modifier[0]][modifier[1]][modifier[2]] += calcEffect.values[j];
                } else if (modifier.length === 2) {
                  effectTarget[modifier[0]][modifier[1]] += calcEffect.values[j];
                }
              }
              effectTarget.effects.push(calcEffect);
              await effectTarget.save();
            }
          }
        }
      }
    } else {
      if (abilityData.target === 0) {
        character.health.current -= damage;
        character.health.current += healthGain;
        character.mana.current += manaGain;
        character.stamina.current += staminaGain;
        character.shield.current += shieldGain;
      } else if (abilityData.target > 0) {
        if (abilityData.target === 1 || abilityData.target === 3) {
          if (abilityData.target === 1) {
            target.health.current -= damage;
            character.health.current += healthGain;
            character.mana.current += manaGain;
            character.stamina.current += staminaGain;
            character.shield.current += shieldGain;
          } else if (abilityData.target === 3) {
            target.health.current -= damage;
            target.health.current += healthGain;
            target.mana.current += manaGain;
            target.stamina.current += staminaGain;
            target.shield.current += shieldGain;
          }
        } else if (abilityData.target === 2 || abilityData.target === 4) {
          if (abilityData.target === 2) {
            for (let i = 0; i < dungeon.players.length; i++) {
              const player = await Character.findById(dungeon.players[i]);
              player.health.current -= damage;
              await player.save();
            }
            character.health.current += healthGain;
            character.mana.current += manaGain;
            character.stamina.current += staminaGain;
            character.shield.current += shieldGain;
          } else if (abilityData.target === 4) {
            for (let i = 0; i < dungeon.players.length; i++) {
              let player = await Character.findById(dungeon.players[i]);
              player.health.current -= damage;
              player.health.current += healthGain;
              player.mana.current += manaGain;
              player.stamina.current += staminaGain;
              player.shield.current += shieldGain;
              await player.save();
            }
          }
        }
      }
    }
  }
  character.save();
  target.save();
}

async function getTotalStats(character) {
  const equipment = await Equipment.findById(character.equipment);
  if (equipment) {
    const head = await Item.findById(equipment.head.item);
    const upperBody = await Item.findById(equipment.upperBody.item);
    const lowerBody = await Item.findById(equipment.lowerBody.item);
    const feet = await Item.findById(equipment.feet.item);
    const ringOne = await Item.findById(equipment.ringOne.item);
    const ringTwo = await Item.findById(equipment.ringTwo.item);
    const rightHand = await Item.findById(equipment.rightHand.item);
    const leftHand = await Item.findById(equipment.leftHand.item);
    const equipped = { head, upperBody, lowerBody, feet, ringOne, ringTwo, rightHand, leftHand };
    const equipStats = parseEquipped(equipped);
    const charStats = parseEquip(character);
    const totalStats = sum(equipStats, charStats);
    return totalStats;
  } else {
    return null;
  }
}

async function prepAbility(characterId, dungeonId, slot) {
  const character = await Character.findById(characterId);
  const dungeon = await Dungeon.findById(dungeonId);

  if (dungeon && character) {
    let side = "";
    //if occupant
    for (let i = 0; i < dungeon.occupants.length; i++) {
      if (characterId === dungeon.occupants[i]) {
        side = "occupant";
      }
    }
    //if player
    for (let i = 0; i < dungeon.players.length; i++) {
      if (characterId === dungeon.players[i]) {
        side = "player";
      }
    }

    const abilitiesInv = await AbilitiesInv.findById(character.abilitiesInv);
    const slotIndex = slotList.indexOf(slot);
    //Checking if:
    //There is actually an item in that slot
    //Then if the character can actually use that slot, ex: a character has 3 slots and is using an ability in the 4th slot is INVALID
    //Finally making sure that the ability is not on cooldown
    if (abilitiesInv[slot].item && slotChecker(character.slots, slot) && character.cooldowns[slotIndex] === 0) {
      const ability = await getAbilityData(abilitiesInv[slot].item);
      const item = await getItemData(abilitiesInv[slot].item);
      const charData = await getCharOutput(characterId);
      const isPlayer = side === "player" ? true : false;
      let canUse = checkReqs(charData, ability);
      dungeon.log.push(`${character.name} uses ${item.name.toLowerCase()}`);
      if (canUse) {
        await useAbility(charData, ability, dungeon, isPlayer);
        await nextTurn(dungeonId);
        character.cooldowns[slotIndex] += ability.lvl;
        await Character.findByIdAndUpdate(characterId, { cooldowns: character.cooldowns });
        await Dungeon.findByIdAndUpdate(dungeonId, { log: dungeon.log });
      } else {
        await nextTurn(dungeonId);
      }
      return true;
    }
    return false;
  }
  return false;
}

function getDivisions(character, stat) {
  let healthMax = character.health.max + stat.body.cap * 2 + stat.body.vitality * 4;
  let healthRegen = character.health.division + stat.soul.cap + stat.body.vitality + stat.body.defense;
  let manaMax = character.mana.max + stat.mind.cap * 2 + stat.soul.capacity * 4 + stat.soul.clarity * 2;
  let manaRegen = character.mana.division + stat.soul.cap + stat.soul.clarity * 2 + stat.soul.capacity * 1 + stat.mind.cap * 0.25;
  let staminaMax = character.stamina.max + stat.body.strength * 4 + stat.body.dexterity * 2;
  let staminaRegen = character.stamina.division + stat.body.strength + stat.body.dexterity;
  let shieldMax = character.shield.max + stat.mind.projection * 5;
  let shieldRegen = character.shield.division + stat.mind.projection * 0.5;
  const health = { max: healthMax, current: character.health.current, division: healthRegen };
  const mana = { max: manaMax, current: character.mana.current, division: manaRegen };
  const stamina = { max: staminaMax, current: character.stamina.current, division: staminaRegen };
  const shield = { max: shieldMax, current: character.shield.current, division: shieldRegen };
  const divisions = { health, mana, stamina, shield };
  return divisions;
}

async function getCharOutput(characterId) {
  const character = await Character.findById(characterId);
  console.log
  if (character) {
    const totalStats = await getTotalStats(character);
    if (totalStats) {
      const divisions = getDivisions(character, totalStats);
      const abilitiesInv = await AbilitiesInv.findById(character.abilitiesInv);
      const charOutput = {
        id: character.id,
        ai: character.ai,
        name: character.name,
        level: character.level.lvl,
        spirit: character.spirit,
        humanity: character.humanity,
        alignment: character.alignment,
        skin: character.skins[0][0],
        abilitiesInv,
        cooldowns: character.cooldowns,
        mind: totalStats.mind,
        body: totalStats.body,
        soul: totalStats.soul,
        health: divisions.health,
        mana: divisions.mana,
        stamina: divisions.stamina,
        shield: divisions.shield,
        effects: character.effects,
      };
      return charOutput;
    } else {
      throw new Error("Invalid stat calculations, suspected faulty items");
    }
  }
}

function isHostile(dungeon) {
  if (dungeon.occupants.length >= 1) {
    for (let i = 0; i < dungeon.occupants.length; i++) {
      let nonliving = ["treasure", "spring", "monument"];
      let notFullHealth = dungeon.occupants[i].health.current < dungeon.occupants[i].health.max;
      let notPassiveAlignment = dungeon.occupants[i].alignment < 30;
      let notFriendlyAlignment = dungeon.occupants[i].spirit < 60;
      let isLiving = nonliving.includes(dungeon.occupants[i].spirit);
      if (notPassiveAlignment) {
        return true;
      } else if (isLiving && notFullHealth && notFriendlyAlignment) {
        return true;
      }
    }
    return false;
  } else {
    return false;
  }
}

async function spawnCreature(dungeonId, template) {
  if (!dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID");
  }
  const dungeon = await Dungeon.findById(dungeonId);
  if (dungeon) {
    const characterId = mongoose.Types.ObjectId();
    const inventoryId = mongoose.Types.ObjectId();
    const equipmentId = mongoose.Types.ObjectId();
    const abilitiesInvId = mongoose.Types.ObjectId();

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

    if (template.attributes) {
      if (template.attributes.space) newAttributes.space.default += template.attributes.space.default;
      if (template.attributes.time) newAttributes.time.default += template.attributes.time.default;
      if (template.attributes.death) newAttributes.death.default += template.attributes.death.default;
      if (template.attributes.life) newAttributes.life.default += template.attributes.life.default;
      if (template.attributes.fire) newAttributes.fire.default += template.attributes.fire.default;
      if (template.attributes.water) newAttributes.water.default += template.attributes.water.default;
      if (template.attributes.earth) newAttributes.earth.default += template.attributes.earth.default;
      if (template.attributes.air) newAttributes.air.default += template.attributes.air.default;
    }

    if (template.buffs) {
      if (template.buffs.regen) newBuffs.regen.default += template.buffs.regen.default;
      if (template.buffs.dread) newBuffs.dread.default += template.buffs.dread.default;
      if (template.buffs.poison) newBuffs.poison.default += template.buffs.poison.default;
      if (template.buffs.scorch) newBuffs.scorch.default += template.buffs.scorch.default;
      if (template.buffs.cold) newBuffs.cold.default += template.buffs.cold.default;
      if (template.buffs.spark) newBuffs.spark.default += template.buffs.spark.default;
      if (template.buffs.reflect) newBuffs.reflect.default += template.buffs.reflect.default;
      if (template.buffs.summon) newBuffs.summon.default += template.buffs.summon.default;
      if (template.buffs.taunt) newBuffs.taunt.default += template.buffs.taunt.default;
      if (template.buffs.flee) newBuffs.flee.default += template.buffs.flee.default;
    }

    if (template.debuffs) {
      if (template.debuffs.fear) newDebuffs.fear.default += template.debuffs.fear.default;
      if (template.debuffs.freeze) newDebuffs.freeze.default += template.debuffs.freeze.default;
      if (template.debuffs.shock) newDebuffs.shock.default += template.debuffs.shock.default;
      if (template.debuffs.toxin) newDebuffs.toxin.default += template.debuffs.toxin.default;
      if (template.debuffs.decay) newDebuffs.decay.default += template.debuffs.decay.default;
      if (template.debuffs.bleed) newDebuffs.bleed.default += template.debuffs.bleed.default;
    }

    if (template.mind) {
      if (template.mind.cap) newMind.cap += template.mind.cap;
      if (template.mind.creation) newMind.creation += template.mind.creation;
      if (template.mind.destruction) newMind.destruction += template.mind.destruction;
      if (template.mind.restoration) newMind.restoration += template.mind.restoration;
      if (template.mind.projection) newMind.projection += template.mind.projection;
    }

    if (template.body) {
      if (template.body.cap) newBody.cap += template.body.cap;
      if (template.body.defense) newBody.defense += template.body.defense;
      if (template.body.vitality) newBody.vitality += template.body.vitality;
      if (template.body.strength) newBody.strength += template.body.strength;
      if (template.body.dexterity) newBody.dexterity += template.body.dexterity;
    }

    if (template.soul) {
      if (template.soul.cap) newSoul.cap += template.soul.cap;
      if (template.soul.luck) newSoul.luck += template.soul.luck;
      if (template.soul.clarity) newSoul.clarity += template.soul.clarity;
      if (template.soul.capacity) newSoul.capacity += template.soul.capacity;
      if (template.soul.will) newSoul.will += template.soul.will;
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

    if (template.equipment) {
      if (template.equipment.head) newEquipment.head.item = template.equipment.head;
      if (template.equipment.upperBody) newEquipment.upperBody.item = template.equipment.upperBody;
      if (template.equipment.lowerBody) newEquipment.lowerBody.item = template.equipment.lowerBody;
      if (template.equipment.feet) newEquipment.feet.item = template.equipment.feet;
      if (template.equipment.ringOne) newEquipment.ringOne.item = template.equipment.ringOne;
      if (template.equipment.ringTwo) newEquipment.ringTwo.item = template.equipment.ringTwo;
      if (template.equipment.rightHand) newEquipment.rightHand.item = template.equipment.rightHand;
      if (template.equipment.leftHand) newEquipment.leftHand.item = template.equipment.leftHand;
    }

    const newInventory = new Inventory({
      _id: inventoryId,
      owner: characterId,
      one: { item: template.items[1], enchantments: [] },
      two: { item: template.items[2], enchantments: [] },
      three: { item: template.items[3], enchantments: [] },
      four: { item: template.items[4], enchantments: [] },
      five: { item: template.items[5], enchantments: [] },
      six: { item: template.items[6], enchantments: [] },
      seven: { item: template.items[7], enchantments: [] },
      eight: { item: template.items[8], enchantments: [] },
      nine: { item: template.items[9], enchantments: [] },
      ten: { item: template.items[10], enchantments: [] },
      eleven: { item: template.items[11], enchantments: [] },
      twelve: { item: template.items[12], enchantments: [] },
      thirteen: { item: template.items[13], enchantments: [] },
      fourteen: { item: template.items[14], enchantments: [] },
      fifteen: { item: template.items[15], enchantments: [] },
    });

    const newAbilitiesInv = new AbilitiesInv({
      _id: abilitiesInvId,
      owner: characterId,
      slotOne: { item: template.abilities[0], enchantments: [] },
      slotTwo: { item: template.abilities[1], enchantments: [] },
      slotThree: { item: template.abilities[2], enchantments: [] },
      slotFour: { item: template.abilities[3], enchantments: [] },
      slotFive: { item: template.abilities[4], enchantments: [] },
      slotSix: { item: template.abilities[5], enchantments: [] },
      slotSeven: { item: template.abilities[6], enchantments: [] },
      slotEight: { item: template.abilities[7], enchantments: [] },
      slotNine: { item: template.abilities[8], enchantments: [] },
      slotTen: { item: template.abilities[9], enchantments: [] },
      slotEleven: { item: template.abilities[10], enchantments: [] },
      slotTwelve: { item: template.abilities[11], enchantments: [] },
      slotThirteen: { item: template.abilities[12], enchantments: [] },
      slotFourteen: { item: template.abilities[13], enchantments: [] },
      slotFifteen: { item: template.abilities[14], enchantments: [] },
      slotSixteen: { item: template.abilities[15], enchantments: [] },
      slotSeventeen: { item: template.abilities[16], enchantments: [] },
      slotEighteen: { item: template.abilities[17], enchantments: [] },
      slotNineteen: { item: template.abilities[18], enchantments: [] },
      slotTwenty: { item: template.abilities[19], enchantments: [] },
    });

    let cooldowns = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < template.cooldown.length; i++) {
      cooldowns[i] = template.cooldown[i];
    }

    const newCharacter = new Character({
      _id: characterId,
      owner: dungeonId,
      name: template.name,
      spirit: template.name,
      droprate: template.droprate,
      tags: [],
      titles: [],
      place: dungeonId,
      level: template.level,
      cap: 20,
      alignment: template.alignmentRange,
      humanity: template.humanity,
      slots: template.slots,
      attributes: newAttributes,
      buffs: newBuffs,
      debuffs: newDebuffs,
      abilitiesInv: abilitiesInvId,
      cooldowns,
      mind: newMind,
      body: newBody,
      soul: newSoul,
      shield: template.shield,
      health: template.health,
      mana: template.mana,
      stamina: template.stamina,
      defRes: template.defRes,
      debuffRes: template.debuffRes,
      perks: template.perks,
      effects: [],
      canEquip: template.canEquip,
      equipment: equipmentId,
      inventory: inventoryId,
      familiar: "",
      skins: [[template.skins[0]], [template.skins[0], template.skins[1]]],
      lines: template.lines,
      ai: template.type,
      createdAt: new Date().toISOString(),
    });

    dungeon.occupants.push(characterId);

    const character = await newCharacter.save();
    await newEquipment.save();
    await newInventory.save();
    await newAbilitiesInv.save();
    await dungeon.save();

    let charData = await getCharOutput(characterId);
    character.health.current = charData.health.max;
    character.mana.current = charData.mana.max;
    character.stamina.current = charData.stamina.max;
    character.shield.current = charData.shield.max;
    await character.save();
  } else {
    throw new Error("Dungeon not Found");
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function choices(currRoom, chaos) {
  let isBoss = currRoom === -1 ? true : false;
  let leads = [];
  let leadingToVote = [];

  if (!isBoss) {
    //Generate leads list
    let array = [];
    let safeChaos = chaos - currRoom;
    if (safeChaos < chaos * -1) {
      safeChaos = chaos * -1;
    }
    if (currRoom === 0) {
      array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } else {
      for (let i = 0; i < 10; i++) {
        array.push(i + safeChaos);
      }
    }

    //Max amount of choices is 4
    let shuffledArray = shuffle(array);
    let choices = 1 + Math.floor(Math.random() * 3);

    for (i = 0; i < choices; i++) {
      leads.push(shuffledArray[i]);
      leadingToVote.push([]);
    }
  }

  return { leads, leadingToVote };
}

async function embark(dungeonId) {
  const dungeon = await Dungeon.findById(dungeonId);
  if (dungeon) {
    let maxIndex = 0;
    for (let i = 1; i < dungeon.leadingToVote.length; i++) {
      if (dungeon.leadingToVote[i].length > dungeon.leadingToVote[maxIndex].length) {
        maxIndex = i;
      }
    }
    let index = 0;

    if (dungeon.leadingToVote[maxIndex].length === 0) {
      //embark randomly
      index = Math.floor(Math.random() * dungeon.leadingToVote.length);
    } else {
      //embark in the most voted direction
      index = maxIndex;
    }

    let targetRoom = dungeon.currRoom + dungeon.leadingTo[index];
    let isBoss = targetRoom >= dungeon.floors[dungeon.currFloor].length;
    let floorSize = dungeon.floors[dungeon.currFloor].length;
    if (targetRoom > floorSize) {
      dungeon.currRoom = -1;
    } else {
      dungeon.currRoom = targetRoom;
      if(isBoss){
        if(dungeon.currFloor < dungeon.floors.length) {
          dungeon.currFloor += 1;
        } else {
          //Write code to leave the dungeon
        }
      }
    }

    //reset character overhealth and overshield on embarking
    for (let i = 0; i < dungeon.players.length; i++) {
      let charData = await getCharOutput(dungeon.players[i]);
      if (charData && (charData.health.current > charData.health.max || charData.shield.current > charData.shield.max)) {
        let character = await Character.findById(dungeon.players[i]);
        character.health.current = charData.health.max;
        character.shield.current = charData.shield.max;
        character.save();
      }
    }
    //reset action votes
    for (let i = 0; i < dungeon.actions.data.length; i++) {
      dungeon.actions.data[i] = [];
    }

    for (let i = 0; i < dungeon.leadingToVote.length; i++) {
      dungeon.leadingToVote[i] = [];
    }

    await Dungeon.findByIdAndUpdate(dungeonId, { actions: dungeon.actions, leadingToVote: dungeon.leadingToVote });
    if (dungeon.occupants[0]) {
      await destroyCharacter(dungeon.occupants[0], false);
    }
    await dungeon.save();

    // Spawning the next creature
    if (isBoss && dungeon.bossRooms[targetRoom].template) {
      await spawnCreature(dungeonId, dungeon.bossRooms[targetRoom].template);
    } else if (!isBoss && dungeon.floors[dungeon.currFloor][targetRoom].template) {
      await spawnCreature(dungeonId, dungeon.floors[dungeon.currFloor][targetRoom].template);
    }
  } else {
    throw new Error("Dungeon not found");
  }
}

function regenCalc(max, newCurr) {
  if (newCurr > max) {
    return max;
  } else {
    return newCurr;
  }
}

async function passTurn(characterId) {
  if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID");
  }
  let character = await Character.findById(characterId);

  if (character) {
    let charData = await getCharOutput(characterId);
    if (charData) {
      //Regen
      //Fixing overhealth first
      if (charData.health.current > charData.health.max) {
        let overhealth = charData.health.current - charData.health.max;

        //Lose 50% overhealth every turn (can add perks here in the future)
        let newOverhealth = Math.floor(overhealth * 0.5);
        character.health.current = newOverhealth + charData.health.max;
      }

      //Fixing overshield next
      if (charData.shield.current > charData.shield.max) {
        let overshield = charData.shield.current - charData.shield.max;

        //Lose 25% overshield every turn (can add perks here in the future)
        let newOverShield = Math.floor(overshield * 0.75);
        character.shield.current = newOverShield + charData.shield.max;
      }

      //regen can go past max on shield and health, hence the "over" mechanic
      character.health.current += charData.health.division;
      character.shield.current += charData.shield.division;
      character.shield.current += charData.shield.max / 10;

      //normal regen for mana and stamina (maybe add a perk that allows over mana in the future?)
      character.mana.current = regenCalc(charData.mana.max, character.mana.current + charData.mana.division);
      character.stamina.current = regenCalc(charData.stamina.max, character.stamina.current + charData.stamina.division);

      //Taking a turn off of each effect
      for (let i = 0; i < character.effects.length; i++) {
        if (character.effects[i].turns > 0) {
          character.effects[i].turns -= 1;
        }
        if (character.effects[i].turns <= 0) {
          //Saving the effect and removing it from effect list
          let effect = character.effects[i];
          character.effects.splice(i, 1);

          //Removing each of the effects on the character
          for (let j = 0; j < effect.modifiers.length; j++) {
            let modifier = effect.modifiers[j];
            let value = effect.values[j];
            if (modifier.length === 3) {
              character[modifier[0]][modifier[1]][modifier[2]] -= value;
            } else if (modifier.length === 2) {
              character[modifier[0]][modifier[1]] -= value;
            }
          }
          await Character.findByIdAndUpdate(characterId);
        }
      }
      //Subtracting one from all cooldowns
      for (let i = 0; i < character.cooldowns.length; i++) {
        let cooldown = character.cooldowns[i];
        if (cooldown > 0) {
          character.cooldowns[i] -= 1;
        }
      }
      await Character.findByIdAndUpdate(characterId, { cooldowns: character.cooldowns });
      character.save();
      let initiative = charData.body.dexterity * 2 + charData.soul.will + charData.mind.projection * 0.5 + charData.soul.clarity * 0.5;
      return initiative;
    } else {
      throw new Error("Invalid Character");
    }
  }
  return null;
}

async function startTurn(characterId) {
  if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID");
  }
  let character = await Character.findById(characterId);
  if (character) {
    //Write code for turn start
  } else {
    throw new Error("Invalid Character");
  }
  //place holder for applying buffs and debuffs
}

async function nextTurn(dungeonId) {
  if (!dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid ID");
  }

  const dungeon = await Dungeon.findById(dungeonId);
  if (dungeon) {
    let allActors = dungeon.turn[1];
    let lastActor = dungeon.turn[1][dungeon.turn[1].length - 1];
    let currActor = dungeon.turn[1].indexOf(dungeon.turn[0][0]);
    if (dungeon.turn[0][0] === lastActor) {
      let initiatives = [allActors, []];
      for (let i = 0; i < allActors.length; i++) {
        //Pass the turn for all actors
        let actor = allActors[i];
        //Get the new initiatives for all the players
        initiatives[1].push(passTurn(actor));
      }
      let sortedData = sortArray(initiatives[0], initiatives[1]);
      dungeon.turn = [[sortedData[0]], sortedData];
    } else {
      dungeon.turn[0][0] = dungeon.turn[1][currActor + 1];
    }
    dungeon.markModified("turn");
    await dungeon.save();
    startTurn(dungeon.turn[0][0]);
  } else {
    throw new Error("Invalid Dungeon");
  }
}

function lifeCheck(dungeon) {
  let lifespan;
  let isBoss = dungeon.currRoom === -1 ? true : false;
  if (isBoss) {
    //Is in a boss room
    lifespan = dungeon.bossRooms[dungeon.currFloor].lifespan;
  } else {
    //Is in a normal room
    lifespan = dungeon.floors[dungeon.currFloor][dungeon.currRoom].lifespan;
  }
  return lifespan;
}

async function rest(dungeonId) {
  const dungeon = await Dungeon.findById(dungeonId);

  if (dungeon) {
    let playerList = dungeon.players;
    let lifespan = lifeCheck(dungeon);
    let isBoss = dungeon.currRoom === -1 ? true : false;

    if (lifespan === 0) {
      embark(dungeonId);
    } else {
      for (let i = 0; i < playerList.length; i++) {
        const character = await Character.findById(playerList[i]);
        if (character) {
          passTurn(playerList[i]);
        } else {
          throw new Error("Character not found");
        }
      }
      if (isBoss) {
        dungeon.bossRooms[dungeon.currFloor].lifespan -= 1;
      } else {
        dungeon.floors[dungeon.currFloor][dungeon.currRoom].lifespan -= 1;
      }
      await Dungeon.findByIdAndUpdate(dungeonId, { floors: dungeon.floors });
    }
  } else {
    throw new Error("Dungeon not found");
  }
}

module.exports = {
  Query: {
    async getDungeon(_, { dungeonId }) {
      try {
        if (!dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const dungeon = await Dungeon.findById(dungeonId);
        if (dungeon) {
          return dungeon;
        } else {
          throw new Error("Dungeon not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPlace(_, { placeId }) {
      try {
        if (!placeId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const dungeon = await Dungeon.findById(placeId);
        const location = await Location.findById(placeId);
        if (dungeon) {
          return dungeon;
        } else if (location) {
          return location;
        } else {
          throw new Error("Place not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPlaces(_, { userId }) {
      try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const user = await User.findById(userId);
        if (user) {
          let res = { places: [], data: [] };
          for (let i = 0; i < user.characters.length; i++) {
            const character = await Character.findById(user.characters[i]);
            if (character) {
              const dungeon = await Dungeon.findById(character.place);
              const location = await Location.findById(character.place);
              if (dungeon) {
                res.places.push(character.place);
                res.data.push(dungeon);
              } else if (location) {
                res.places.push(character.place);
                res.data.push(location);
              } else {
                throw new Error("Character place not found");
              }
            } else {
              user.characters.splice(index, 1);
            }
          }
          user.save();
          return res;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getParties(_, { locationId }) {
      try {
        if (!locationId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const location = await Location.findById(locationId);
        if (location) {
          let data = [];
          location.parties.map(async (partyId, index) => {
            const party = Party.findById(partyId);
            if (party) {
              data.push(party);
            } else {
              location.parties.splice(index, 1);
            }
          });
          location.save();
          return data;
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getParty(_, { partyId }) {
      try {
        if (!partyId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const party = await Party.findById(partyId);
        if (party) {
          return party;
        } else {
          throw new Error("Party not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getMembers(_, { partyId }) {
      try {
        if (!partyId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const party = await Party.findById(partyId);
        if (party) {
          let data = [];
          party.characters.map((characterId, index) => {
            const character = Character.findById(characterId);
            if (character) {
              data.push(character);
            } else {
              party.characters.splice(index, 1);
            }
          });
          party.save();
          return data;
        } else {
          throw new Error("Party not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPlayers(_, { dungeonId }) {
      try {
        if (!dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const dungeon = await Dungeon.findById(dungeonId);
        if (dungeon) {
          let data = [];
          dungeon.players.map((characterId, index) => {
            const character = Character.findById(characterId);
            if (character) {
              data.push(character);
            } else {
              dungeon.players.splice(index, 1);
            }
          });
          dungeon.save();
          return data;
        } else {
          throw new Error("Dungeon not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getRoom(_, { dungeonId, floor, room }) {
      try {
        if (!dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const dungeon = await Dungeon.findById(dungeonId);
        if (dungeon) {
          const currRoom = dungeon.floors[floor][room];
          return currRoom;
        } else {
          throw new Error("Dungeon not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getDungeonOutput(_, { dungeonId, characterId }) {
      try {
        if (!dungeonId.match(/^[0-9a-fA-F]{24}$/) || !characterId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const dungeon = await Dungeon.findById(dungeonId);
        const character = await Character.findById(characterId);
        if (dungeon && character) {
          //Getting the turn timer stored
          if (!dungeon.timestamp[0]) {
            dungeon.timestamp[0] = new Date().getTime();
          }

          //Getting the data setup
          let isBoss = dungeon.currRoom === -1 ? true : false;
          let room = isBoss ? dungeon.bossRooms[dungeon.currFloor] : dungeon.floors[dungeon.currFloor][dungeon.currRoom];
          let leadingRooms = [];
          for (let k = 0; k < dungeon.leadingTo.length; k++) {
            let targetRoom = dungeon.currRoom + dungeon.leadingTo[k];
            let floorLength = dungeon.floors[dungeon.currFloor].length;
            let leadingRoom;
            if (targetRoom < floorLength) {
              leadingRoom = dungeon.floors[dungeon.currFloor][targetRoom];
            } else if (targetRoom >= floorLength) {
              leadingRoom = dungeon.bossRooms[dungeon.currFloor];
              leadingRoom.environment = "Boss Room";
            }
            let leadingOutput = { environment: leadingRoom.environment, vote: dungeon.leadingToVote[k] };
            leadingRooms.push(leadingOutput);
          }
          let occupants = [];
          let players = [];
          if (dungeon.players.length > 0) {
            for (let i = 0; i < dungeon.players.length; i++) {
              let charData = await getCharOutput(dungeon.players[i]);
              if (charData) {
                players.push(charData);
              } else {
                dungeon.players.splice(i, 1);
              }
            }
          }
          if (dungeon.occupants.length > 0) {
            for (let i = 0; i < dungeon.occupants.length; i++) {
              let charData = await getCharOutput(dungeon.occupants[i]);
              if (charData) {
                occupants.push(charData);
              } else {
                dungeon.occupants.splice(i, 1);
              }
            }
          }
          const actions = { actions: dungeon.actions.actions, data: dungeon.actions.data };
          const dungeonOutput = {
            id: dungeon._id,
            room: room,
            occupants: occupants,
            log: dungeon.log,
            players: players,
            playerIds: dungeon.players,
            leadingRooms,
            actions,
            tokens: dungeon.tokens,
            tokenDistribution: dungeon.tokenDistribution,
            totalTokens: dungeon.totalTokens,
            timestamp: dungeon.timestamp,
            active: dungeon.active,
          };

          //Managing votes, only runs if there are no hostiles
          //If there aren't timestamps, make them
          // 0 timestamp is for how long a player has been on a floor
          // 1 timestamp is how long a player has not been on a floor
          let activeIndex = 0;
          let currPlayer = dungeon.players.indexOf(characterId);
          let currTime = new Date().getTime();

          let secondSort = [];

          for (let i = 0; i < dungeon.players.length; i++) {
            secondSort[i] = currTime - dungeon.active[i];
          }
          let mostActive = secondSort[activeIndex];
          if (secondSort.length > 1) {
            for (let i = 1; i < secondSort.length; i++) {
              if (secondSort[i] <= mostActive) {
                mostActive = secondSort[i];
                activeIndex = i;
              }
            }
          }

          //Only run this if the current player is the most active
          if (currPlayer === activeIndex) {
            if (!isHostile(dungeonOutput)) {
              let totalRest = dungeon.actions.data[0].length;
              let totalEmbark = dungeon.actions.data[1].length;
              let totalVotes = totalRest + totalEmbark;
              let maxVotes = dungeon.players.length;

              if (totalRest + totalEmbark > 0) {
                if (!dungeon.timestamp[1]) {
                  dungeon.timestamp[1] = new Date().getTime();
                }

                let oldTime = Number.isFinite(dungeon.timestamp[1]) ? dungeon.timestamp[1] : parseInt(dungeon.timestamp[1]);
                let seconds = (currTime - oldTime) / 1000;
                let forceVote = seconds >= 30;
                let minVote = seconds >= 2;

                if (totalVotes === maxVotes && minVote && activeIndex === currPlayer) {
                  if (totalEmbark > totalRest) {
                    embark(dungeonId);
                  } else {
                    rest(dungeonId);
                  }
                  dungeon.timestamp[0] = new Date();
                  dungeon.timestamp[1] = null;
                } else if (totalVotes < maxVotes && forceVote && activeIndex === currPlayer) {
                  if (totalEmbark > totalRest) {
                    embark(dungeonId);
                  } else {
                    rest(dungeonId);
                  }
                  dungeon.timestamp[0] = new Date();
                  dungeon.timestamp[1] = null;
                }
              } else if (totalRest + totalEmbark < 0) {
                dungeon.timestamp[1] = null;
              }
            }

            //Turn Manager
            //-1 Indicate its a free turn, meaning the first person who acts initiates
            if (!isHostile(dungeonOutput)) {
              //For non hostiles, just resetting the turns
              dungeon.turn[0][0] = "general";
              dungeon.turn[1] = [];
              await Dungeon.findByIdAndUpdate(dungeonId, { turn: dungeon.turn });
            } else if (isHostile(dungeonOutput)) {
              //For hostiles, we want to check if turns have been set, and if not we'll set them
              let allActors = players.concat(occupants);
              for(let i = 0; i < allActors.length; i++){
                let actor = allActors[i];
                if(actor.health.current <= 0){
                  let isPlayer = i >= dungeon.players.length ? false : true;
                  destroyCharacter(actor.id, isPlayer);
                }
              }

              if (dungeon.turn[0][0] === "general") {
                let turnData = [[], []];
                if (allActors.length > 1) {
                  for (let i = 0; i < allActors.length; i++) {
                    let actor = allActors[i];
                    let initiative = actor.body.dexterity * 2 + actor.soul.will + actor.mind.projection * 0.5 + actor.soul.clarity * 0.5;
                    turnData[0].push(actor.id);
                    turnData[1].push(initiative);
                  }

                  let sortedData = sortArray(turnData[0], turnData[1]);
                  dungeon.turn = [[sortedData[0]], sortedData];
                  await Dungeon.findByIdAndUpdate(dungeonId, { turn: dungeon.turn });
                }
              }
              //Otherwise, we want to check if the current hostiles turn is a mob or if its a idle player
              if (dungeon.turn[0][0] === dungeon.occupants[0]) {
                let allIds = dungeon.players.concat(dungeon.occupants);
                let allActors = players.concat(occupants);
                let currActor = allActors[allIds.indexOf(dungeon.turn[0][0])];
                let AI = currActor.ai;
                let available = [];

                //First we need to get the index of the available abilities
                for (let i = 0; i < slotList.length; i++) {
                  let currSlot = currActor.abilitiesInv[slotList[i]].item;
                  //If there is an ability in that slot
                  if (currSlot) {
                    if (currActor.cooldowns[i] === 0) {
                      available.push(i);
                    }
                  }
                }

                //Prepping variables and getting the random slot, in case the AI uses random
                let valid;
                let randIndex = Math.floor(Math.random() * available.length);
                let randomSlot = slotList[available[randIndex]];

                //Run the actual AI, but first we need to check if it has any available. If it doesn't we will just skip
                if (available.length === 0) {
                  await nextTurn(dungeonId);
                } else if (AI === "mob") {
                  valid = await prepAbility(currActor.id, dungeonId, randomSlot);
                } else if (AI === "mob_burst") {
                  //mob_burst priortizes the first ability, so if the first ability is available (index 0) then it will always use it
                  if (available.includes(0)) {
                    valid = await prepAbility(currActor.id, dungeonId, "slotOne");
                  } else {
                    valid = await prepAbility(currActor.id, dungeonId, randomSlot);
                  }
                }
              }
            }
          }

          let charIndex = dungeon.players.indexOf(characterId);
          dungeon.active[charIndex] = new Date().getTime();
          await Dungeon.findByIdAndUpdate(dungeonId, { timestamp: dungeon.timestamp, active: dungeon.active });
          await dungeon.save();
          dungeonOutput.turn = dungeon.turn;
          return dungeonOutput;
        } else {
          throw new Error("Dungeon not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createDungeon(_, { createDungeonInput: { templateId, partyId, characterId, locationId } }) {
      //Checking if ID's are valid
      if (!templateId.match(/^[0-9a-fA-F]{24}$/) || !characterId.match(/^[0-9a-fA-F]{24}$/) || !locationId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Dungeon Creation");
      }

      let dungeonId = mongoose.Types.ObjectId();
      const template = await AreaTemplate.findById(templateId);
      const location = await Location.findById(locationId);
      const character = await Character.findById(characterId);
      const party = partyId ? await Party.findById(partyId) : null;

      //Checking if data was actually retrieved
      if (!template || !location || !character) {
        throw new Error("Data not found");
      } else if (partyId && !party) {
        throw new Error("Data not found");
      }

      //Updating party to be "charting"
      if (party) {
        party.charting = true;
        party.save();
      }

      //Checking if it was the party leader
      if (party && characterId !== party.characters[0]) {
        throw new AuthenticationError("Must be party leader to create dungeon");
      }

      //Updating each of the party members locations
      if (party) {
        for (i = 0; i < party.characters.length; i++) {
          if (!party.characters[i].match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid ID for character");
          }
          const player = await Character.findById(party.characters[i]);
          if (!player) {
            throw new Error("Invalid character");
          }
          player.place = dungeonId;
          player.save();
        }
      } else if (!party) {
        const player = await Character.findById(characterId);
        if (!player) {
          throw new Error("Invalid Character");
        }
        player.place = dungeonId;
        player.save();
      }

      //Getting mobs
      let mobs = [];
      for (i = 0; i < template.mobs.length; i++) {
        let monsterTemplateId = template.mobs[i];
        if (!monsterTemplateId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID for monster template");
        }
        const monsterTemplate = await MonsterTemplate.findById(monsterTemplateId);
        if (monsterTemplate) {
          monsterTemplate.alignmentRange = Math.floor(Math.random() * monsterTemplate.alignmentRange) + template.alignment;
          monsterTemplate.humanity += template.humanity;
          monsterTemplate.rarity += template.rarity;
          mobs.push(monsterTemplate);
        } else {
          throw new Error("Monster template not found");
        }
      }

      //Getting bosses
      let bosses = [];
      for (i = 0; i < template.bosses.length; i++) {
        let monsterTemplateId = template.bosses[i];
        if (!monsterTemplateId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID for monster template");
        }
        const monsterTemplate = await MonsterTemplate.findById(monsterTemplateId);
        if (monsterTemplate) {
          monsterTemplate.alignmentRange = Math.floor(Math.random() * monsterTemplate.alignmentRange) + template.alignment;
          monsterTemplate.humanity += Math.floor(Math.random() * template.humanity);
          monsterTemplate.rarity += template.rarity;
          bosses.push(monsterTemplate);
        } else {
          throw new Error("Monster template not found");
        }
      }

      //Creating the dungeon
      let dungeonStructure = [];
      let bossStructure = [];
      for (i = 0; i < template.size; i++) {
        let bossEnvironment = bosses[i].environments[Math.floor(Math.random() * bosses[i].environments.length)];
        bossStructure[i] = {
          lifespan: 10,
          environment: bossEnvironment,
          template: bosses[i],
        };
        let floorSize = template.length + Math.floor(Math.random() * (template.range * 2)) - template.range;
        dungeonStructure[i] = [];
        dungeonStructure[i][0] = { lifespan: 10, environment: "entrance" };
        for (j = 1; j < floorSize; j++) {
          let lifespanCalc = Math.floor(Math.random() * template.maxLifespan);
          let environmentCalc = template.environments[Math.floor(Math.random() * template.environments.length)];
          let validMobs = [];
          for (k = 0; k < mobs.length; k++) {
            let mobEnvironments = mobs[k].environments;
            if (mobEnvironments.includes(environmentCalc)) {
              validMobs.push(mobs[k]);
            }
          }
          let mob = validMobs[Math.floor(Math.random() * validMobs.length)];
          dungeonStructure[i][j] = {
            lifespan: lifespanCalc,
            environment: environmentCalc,
            template: mob,
          };
        }
      }

      //Max amount of choices is 4
      let leadData = choices(0, template.chaos);
      let tokenDist = [];
      if (partyId && party) {
        if (party.tokenDistribution.length > 0) {
          tokenDist = party.tokenDistribution;
        } else if (party.characters.length > 1) {
          for (let i = 0; i < party.characters.length; i++) {
            tokenDist.push(3);
          }
        }
      } else {
        tokenDist = [6];
      }

      let starterLog = [];

      let destinationText = leadData.leads.length > 1 ? "destinations" : "destination";
      if (party && party.characters.length > 1) {
        starterLog.push(`Rules and Tips: `);
        starterLog.push(`"Flee" will remove all tokens and unstable items from the player, but allow them to leave to leave the dungeon`);
        starterLog.push(`- If the player is engaging a hostile, "Flee" will consume your turn and will work off of a percent chance`);
        starterLog.push(`- "Flee" will then trigger at the end of every player and occupants turn`);
        starterLog.push(`- If the player is not engaging a hostile, "Flee" will always succeed and will immediately fire`);
        starterLog.push(
          `"Leave" will turn all unstable items into stable ones, allowing you to leave the dungeon with them, and convert all tokens into experience`
        );
        starterLog.push(`- Availability of "Leave" is based on the current floor's containtment level, but generally "Leave" requires there to be no hostiles`);
        starterLog.push(`"Idle" is an action available in the turns tab`);
        starterLog.push(`- "Idle" will make a player run on the Mob AI, and must be turned off if the player wishes to make their own decisions`);
        starterLog.push(`- "Idle" only effects turn actions, and does not effect fleeing or leaving`);
        starterLog.push(`- If a player sets themselves idle, it will not count as a force idle`);
        starterLog.push(`Votes are force counted every 30 seconds`);
        starterLog.push(`- Votes are only force counted if every member has not voted and some have`);
        starterLog.push(`- A force count will NOT take place if no one has voted`);
        starterLog.push(`- If there is no majority in the force count and there are votes, the party will automatically rest`);
        starterLog.push(`- Force counts do not apply to destination votes, as destination votes will be counted on embarking or room dissolution`);
        starterLog.push(`"Force Action" is an vote action used to force another players turn by making them idle, it is available in the turns tab`);
        starterLog.push(`- "Force Action" requires a majority vote and can only be done after 30 seconds of target player's inactivity`);
        starterLog.push(`- As rogue-rpg is turn based, "Force Action" is intended to prevent a player from idling all players`);
        starterLog.push(`- If there are any "Force Action" votes after a minute of player inactivity, whether majority or not, the player will be made idle`);
        starterLog.push(`- If a player has had "Force Action" applied on them 5 times, they will no longer have the ability to un-idle themselves`);
        starterLog.push(`"Bidding" is accessed from the bidding menu. Whenever a creature drops loot, a bid is carried out, the loot being anonymous`);
        starterLog.push(`- Players can bid using their tokens, which they gain per room and per creature slain,`);
        starterLog.push(`- The highest bidder wins the bid after 10 seconds`);
        starterLog.push(`- The players bids, whether winning or losing, are all lost upon the conclusion`);
        starterLog.push(`- If no bids are placed, the loot randomly goes to one of the party members`);
        starterLog.push(`- All items obtained in bids are unstable, and will be lost by fleeing`);
        starterLog.push(`████████████████████████████████████████████████████████████████`);
        starterLog.push(`Here lies ${template.name}: ${template.desc}`);
        starterLog.push(
          `The party of ${party.characters.length} enter the dungeon, the outer appearance is quickly concealed by the grand door leading forward`
        );
        starterLog.push(
          `Past the door lies ${leadData.leads.length} ${destinationText}, the party must vote on which way to go from here. Use the actions tab`
        );
        starterLog.push(
          `In 10 turns all will be forced forward in the chosen direction. If a vote was not cast or there was no majority, a random destination will be chosen.`
        );
        starterLog.push(`Till then, the party can either pass a turn by resting or embark early through a majority vote.`);
      } else {
        starterLog.push(`Rules and Tips:`);
        starterLog.push(`"Flee" will remove all tokens and unstable items from the player, but allow them to leave to leave the dungeon`);
        starterLog.push(`- If the player is engaging a hostile, "Flee" will consume your turn and will work off of a percent chance`);
        starterLog.push(`- "Flee" will then trigger at the end of every player and occupants turn`);
        starterLog.push(`- If the player is not engaging a hostile, "Flee" will always succeed`);
        starterLog.push(
          `"Leave" will turn all unstable items into stable ones, allowing you to leave the dungeon with them, and convert all tokens into experience`
        );
        starterLog.push(`- Availability of "Leave" is based on the current floor's containtment level, but generally "Leave" requires there to be no hostiles`);
        starterLog.push(`"Idle" is an action available in the turns tab`);
        starterLog.push(`- Idling will make a player run on the Mob AI, performing their turns for them`);
        starterLog.push(`████████████████████████████████████████████████████████████████`);
        starterLog.push(`${character.name} enters the dungeon, appearing as a solo figure before a grand door.`);
        starterLog.push(`Past the door lies ${leadData.leads.length} destinations, ${character.name} must decide. (actions tab)`);
        starterLog.push(
          `In 10 turns ${character.name} will be forced forward in the chosen direction, if a destination was not chosen a random one will be chosen.`
        );
        starterLog.push(`Till then, ${character.name} can either pass a turn by resting or embark early. (actions tab)`);
      }

      const actions = { actions: ["rest", "embark", "flee", "leave"], data: [[], [], [], []] };

      let active = [];
      if (partyId) {
        for (let i = 0; i < party.characters.length; i++) {
          let stagTime = new Date().getTime();
          active.push(stagTime);
        }
      } else {
        let time = new Date().getTime();
        active = [time];
      }

      const newDungeon = new Dungeon({
        _id: dungeonId,
        name: template.name,
        floors: dungeonStructure,
        bossRooms: bossStructure,
        currFloor: 0,
        currRoom: 0,
        leadingTo: leadData.leads,
        leadingToVote: leadData.leadingToVote,
        actions,
        chaos: template.chaos,
        droprate: template.droprate,
        occupants: [],
        players: partyId ? party.characters : characterId,
        tokens: tokenDist,
        totalTokens: tokenDist,
        tokenDistribution: tokenDist,
        return: locationId,
        log: starterLog,
        turn: [["general"]],
        timestamp: [],
        active,
      });

      const dungeon = newDungeon.save();
      return dungeon;
    },
    async sendAbility(_, { characterId, dungeonId, slot }) {
      if (!characterId.match(/^[0-9a-fA-F]{24}$/) || !dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Use Ability");
      }
      let valid = await prepAbility(characterId, dungeonId, slot);
      if (valid) {
        return "Ability Sent";
      } else {
        throw new Error("Ability usage failed");
      }
    },
    async roomVote(_, { index, action, characterId, dungeonId }, context) {
      if (!characterId.match(/^[0-9a-fA-F]{24}$/) || !dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Room Vote");
      }

      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      const character = await Character.findById(characterId);
      const dungeon = await Dungeon.findById(dungeonId);

      if (dungeon && character) {
        if (user.id === character.owner) {
          let allVotes = dungeon.leadingToVote;
          let allVotesIndex = [];
          for (let i = 0; i < allVotes.length; i++) {
            for (let j = 0; j < allVotes[i].length; j++) {
              if (allVotes[i][j] === characterId) {
                allVotesIndex[0] = i;
                allVotesIndex[1] = j;
              }
            }
          }
          let votes = dungeon.leadingToVote[index];
          if (action === "add") {
            if (!votes.includes(characterId) && votes.length + 1 <= dungeon.players.length) {
              //If the character has a vote elsewhere, remove it
              if (allVotesIndex.length === 2) {
                dungeon.leadingToVote[allVotesIndex[0]].splice(allVotesIndex[1], 1);
              }
              votes.push(characterId);
              dungeon.leadingToVote[index] = votes;
              await Dungeon.findByIdAndUpdate(dungeonId, { leadingToVote: dungeon.leadingToVote });
            }
          }
          if (action === "remove") {
            if (votes.includes(characterId)) {
              const voteIndex = votes.indexOf(characterId);
              votes.splice(voteIndex, 1);
              dungeon.leadingToVote[index] = votes;
              await Dungeon.findByIdAndUpdate(dungeonId, { leadingToVote: dungeon.leadingToVote });
            }
          }
          return dungeon;
        } else {
          throw new AuthenticationError("Invalid Permissions, must be logged in to vote");
        }
      } else {
        throw new Error("Dungeon or Character not found");
      }
    },
    async actionVote(_, { index, action, characterId, dungeonId }, context) {
      if (!characterId.match(/^[0-9a-fA-F]{24}$/) || !dungeonId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Room Vote");
      }

      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      const character = await Character.findById(characterId);
      const dungeon = await Dungeon.findById(dungeonId).catch({});

      if (dungeon && character) {
        if (user.id === character.owner) {
          let allVotes = dungeon.actions.data;
          let allVotesIndex = [];
          for (let i = 0; i < allVotes.length; i++) {
            for (let j = 0; j < allVotes[i].length; j++) {
              if (allVotes[i][j] === characterId) {
                allVotesIndex[0] = i;
                allVotesIndex[1] = j;
              }
            }
          }
          let votes = dungeon.actions.data[index];
          if (action === "add") {
            if (!votes.includes(characterId) && votes.length + 1 <= dungeon.players.length) {
              //If the character has a vote elsewhere, remove it
              if (allVotesIndex.length === 2) {
                dungeon.actions.data[allVotesIndex[0]].splice(allVotesIndex[1], 1);
              }
              votes.push(characterId);
              dungeon.actions.data[index] = votes;
              await Dungeon.findByIdAndUpdate(dungeonId, { actions: dungeon.actions });
            }
          }
          if (action === "remove") {
            if (votes.includes(characterId)) {
              const voteIndex = votes.indexOf(characterId);
              votes.splice(voteIndex, 1);
              dungeon.actions.data[index] = votes;
              await Dungeon.findByIdAndUpdate(dungeonId, { actions: dungeon.actions });
            }
          }
          return dungeon;
        } else {
          throw new AuthenticationError("Invalid Permissions, must be logged in to vote");
        }
      } else {
        throw new Error("Dungeon or Character not found");
      }
    },
    async createParty(_, { locationId, characterId, name }) {
      if (!locationId.match(/^[0-9a-fA-F]{24}$/) && !characterId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Party Creation");
      }
      const location = await Location.findById(locationId);
      const character = await Character.findById(characterId);
      if (character && location && character.place === locationId) {
        let partyId = mongoose.Types.ObjectId();
        character.party = partyId;
        character.save();
        location.parties.push(partyId);
        location.save();
        const newParty = new Party({
          _id: partyId,
          name,
          location: locationId,
          charting: false,
          characters: [characterId],
          tokenDistribution: [],
        });
        const party = newParty.save();
        return party;
      } else {
        throw new Error("Error: Invalid character, location, or character does not match specified location");
      }
    },
    async joinParty(_, { partyId, characterId }) {
      if (!partyId.match(/^[0-9a-fA-F]{24}$/) && !characterId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Party Join");
      }
      const party = await Party.findById(partyId);
      const character = await Character.findById(characterId);
      if (character && party && character.place === party.location && !party.characters.includes(characterId)) {
        if (party.characters.length >= 6) {
          throw new UserInputError("Errors", { join: "party is full" });
        }
        let newParty = party;
        newParty.characters.push(characterId);
        newParty.tokenDistribution = [];
        if (character.party) {
          let oldParty = await Party.findById(partyId);
          if (oldParty) {
            const index = oldParty.characters.indexOf(characterId);
            oldParty.characters.splice(index, 1);
            if (oldParty.characters.length === 0) {
              const location = Location.findById(oldParty.location);
              location.parties.splice(location.parties.indexOf(partyId), 1);
              location.save();
              oldParty.delete();
            } else if (oldParty.tokenDistribution) {
              oldParty.tokenDistribution[0] += oldParty.tokenDistribution[index];
              oldParty.save();
            }
          }
        }
        character.party = partyId;
        newParty.save();
        character.save();
        return newParty;
      } else {
        throw new Error("Invalid character, location, character already within party, or character does not match specified location");
      }
    },
    async leaveParty(_, { partyId, characterId }) {
      if (!partyId.match(/^[0-9a-fA-F]{24}$/) && !characterId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID's for Party Leave");
      }
      const party = await Party.findById(partyId);
      const character = await Character.findById(characterId);
      if (character && party && character.place === party.location && party.characters.includes(characterId)) {
        const index = party.characters.indexOf(characterId);
        let newParty = party;
        newParty.characters.splice(index, 1);
        if (party.characters.length === 0) {
          newParty.delete();
          const location = await Location.findById(party.location);
          const locIndex = location.parties.indexOf(partyId);
          location.parties.splice(locIndex, 1);
          location.save();
        } else if (party.tokenDistribution.length > 0) {
          let unAllocTokens = party.tokenDistribution(index);
          newParty.tokenDistribution[0] += unAllocTokens;
          newParty.tokenDistribution.splice(index, 1);
          newParty.save();
        } else {
          newParty.save();
        }
        character.party = null;
        character.save();
        return "Left Party";
      } else {
        throw new Error("Invalid character, location, or character does not match specified location");
      }
    },
    async kickParty(_, { partyId, characterId }, context) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (user) {
        if (!partyId.match(/^[0-9a-fA-F]{24}$/) && !characterId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID's for Party Leave");
        }
        const party = await Party.findById(partyId);
        const character = await Character.findById(characterId);
        if (character && party && character.place === party.location && party.characters.includes(characterId)) {
          const leaderCharId = party.characters[0];
          const leaderChar = await Character.findById(leaderCharId);
          if (leaderChar.owner == user.id) {
            const index = party.characters.indexOf(characterId);
            let newParty = party;
            newParty.characters.splice(index, 1);
            if (party.tokenDistribution.length > 0) {
              let unAllocTokens = party.tokenDistribution(index);
              newParty.tokenDistribution[0] += unAllocTokens;
              newParty.tokenDistribution.splice(index, 1);
            }
            character.party = null;
            character.save();
            newParty.save();
            return `${character.name} was kicked from the party`;
          } else {
            throw new AuthenticationError("Invalid Permissions");
          }
        } else {
          throw new Error("Invalid character, location, or character does not match specified location");
        }
      } else {
        throw new AuthenticationError("Invalid Account");
      }
    },
    async disbandParty(_, { partyId }, context) {
      const verify = checkAuth(context);
      const user = await User.findById(verify.id);
      if (user) {
        if (!partyId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid Party ID");
        }
        const party = await Party.findById(partyId);
        if (party) {
          const leaderCharId = party.characters[0];
          const leaderChar = await Character.findById(leaderCharId);
          if (leaderChar.owner == user.id) {
            party.characters.map((characterId) => {
              const character = Character.findById(characterId);
              if (character) {
                character.place = null;
                character.save();
              }
            });
            const location = await Location.findById(party.location);
            const index = location.parties.indexOf(partyId);
            location.parties.splice(index, 1);
            location.save();
            party.delete();
            return "Party disbanded";
          } else {
            throw new AuthenticationError("Invalid Permissions");
          }
        } else {
          throw new Error("Invalid character, location, or character does not match specified location");
        }
      } else {
        throw new AuthenticationError("Invalid Account");
      }
    },
    async updatePartyToken(_, { partyId, newTokenDist }) {
      if (!partyId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid party Id");
      }
      const party = await Party.findById(partyId);
      if (party) {
        let newParty = party;
        newParty.tokenDistrubtion = newTokenDist;
        newParty.save();
        return newParty;
      } else {
        throw new Error("Party not found");
      }
    },
  },
};
