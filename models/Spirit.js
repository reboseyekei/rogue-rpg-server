const { model, Schema } = require("mongoose");
const { attributes, buffs, debuffs, mind, body, soul, level, division } = require("./_Objects");

const spiritSchema = new Schema({
    name: String,
    desc: String,
    level: level,
    alignment: Number,
    humanity: Number,
    slots: Number,
    abilities: [String],
    mind: mind,
    body: body,
    soul: soul,
    attributes: attributes,
    buffs: buffs,
    debuffs: debuffs,
    health: division,
    mana: division,
    stamina: division,
    shield: division,
    defRes: Number,
    debuffRes: Number,
    perks: [String],
    skins: [[String]],
    canEquip: Number,
});

module.exports = model("Spirit", spiritSchema);
