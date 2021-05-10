const { model, Schema } = require("mongoose");
const { modItem } = require("./_Objects");

const equipmentSchema = new Schema({
  owner: String,
  head: modItem,
  upperBody: modItem,
  lowerBody: modItem,
  feet: modItem,
  ringOne: modItem,
  ringTwo: modItem,
  rightHand: modItem,
  leftHand: modItem,
});

module.exports = model("Equipment", equipmentSchema);
