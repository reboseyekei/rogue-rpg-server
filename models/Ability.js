const { model, Schema } = require("mongoose");
const { mind, body, soul, scale, effect, division } = require("./_Objects");

const abilitySchema = new Schema({
  tag: String,
  lvl: Number,
  target: Number,
  healthCost: Number,
  manaCost: Number,
  staminaCost: Number,
  shieldCost: Number,
  mindReq: Number,
  bodyReq: Number,
  soulReq: Number,
  repeatable: division,
  mindRepeat: mind,
  bodyRepeat: body,
  soulRepeat: soul,
  effects: [effect],
  damage: scale,
  healthGain: scale,
  manaGain: scale,
  staminaGain: scale,
  shieldGain: scale,
});

module.exports = model("Ability", abilitySchema);
