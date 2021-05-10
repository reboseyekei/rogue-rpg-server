const { model, Schema } = require("mongoose");
const { essence, mind, body, soul } = require("./_Objects");

const itemSchema = new Schema({
  name: String,
  desc: String,
  path: String, //the item path for pulling sprites
  type: String, //Checks if item is consumable and its type of consumable item
  ability: String, //Checks what ability the item holds, if its an ability consumable or if its an equipment that grants a ability
  slots: Number, //Checks the amount of enchantment slots an item can have or how many slots an ability takes
  essence: essence, //Checks the feed power an item gives, as well the focus for that feed power (certain items give more feedpower in different areas)
  mind: mind,
  body: body,
  soul: soul,
  perks: [String], //Checks what perks an item bestows
});

module.exports = model("Item", itemSchema);
