const { model, Schema } = require("mongoose");
const {attributes, buffs, debuffs, mind, body, soul, division, effect, level, equipment} = require("./_Objects");

const monsterTemplateSchema = new Schema({
    name: String,
    type: String,
    alignmentRange: Number,
    rarity: Number,
    environments: [String],
    level: level,
    attributes: attributes,
    buffs: buffs,
    debuffs: debuffs,
    slots: Number,
    abilities: [String],
    cooldown: [Number],
    mind: mind,
    body: body,
    soul: soul,
    health: division,
    mana: division,
    stamina: division,
    shield: division,
    defRes: Number,
    debuffRes: Number,
    perks: [String],
    effects: [effect],
    canEquip: Number,
    equipment: equipment,
    items: [String],
    skins: [String],
});

module.exports = model("MonsterTemplate", monsterTemplateSchema);
