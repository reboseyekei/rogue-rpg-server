const { model, Schema } = require("mongoose");
const { attributes, buffs, debuffs } = require("./_Objects");

const perkSchema = new Schema({
  name: String,
  desc: String,
  attributes: attributes,
  buffs: buffs,
  debuffs: debuffs,
});

module.exports = model("Perk", perkSchema);
