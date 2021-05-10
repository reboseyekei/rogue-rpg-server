const { model, Schema } = require("mongoose");
const { alter } = require("./_Objects");

const attributeSchema = new Schema({
  space: alter,
  time: alter,
  death: alter,
  life: alter,
  fire: alter,
  water: alter,
  earth: alter,
  air: alter,
});

module.exports = model("Attribute", attributeSchema);
