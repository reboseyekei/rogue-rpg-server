const { model, Schema } = require("mongoose");
const { alter } = require("./_Objects");

const buffsSchema = new Schema({
  regen: alter,
  dread: alter,
  poison: alter,
  scorch: alter,
  cold: alter,
  spark: alter,
  reflect: alter,
  summon: alter,
  taunt: alter,
  flee: alter,
  immortal: Number,
  strong: Number,
  warped: Number,
  sniper: Number,
  wellspring: Number,
  overcharged: Number,
  scavenger: Number,
  swift: Number,
});

module.exports = model("Buffs", buffsSchema);
