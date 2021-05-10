const { model, Schema } = require("mongoose");
const { level, perk, inventory } = require("./_Objects");

const familiarSchema = new Schema({
  owner: String,
  level: level,
  health: Number,
  damage: Number,
  perks: [String],
  inventory: inventory,
});

module.exports = model("Familiar", familiarSchema);
