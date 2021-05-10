const { model, Schema } = require("mongoose");
const { alter } = require("./_Objects");

const debuffsSchema = new Schema({
  fear: alter,
  burn: alter,
  freeze: alter,
  shock: alter,
  toxin: alter,
  decay: alter,
  bleed: alter,
  exhaustion: alter,
  explosion: Number,
  paralysis: Number,
  frozen: Number,
  scorched: Number,
  sleep: Number,
});

module.exports = model("Debuffs", debuffsSchema);
