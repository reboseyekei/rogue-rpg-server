const { model, Schema } = require("mongoose");

const levelSchema = new Schema({
  lvl: Number,
  xp: Number,
  potentialIncrease: Number,
  capIncrease: Number,
  statIncrease: Number,
  cap: Number,
  stat: Number,
  health: Number,
  mana: Number,
  stamina: Number,
  shield: Number,
  bonus: [Number],
  perks: [String],
});

module.exports = model("Level", levelSchema);
