const { model, Schema } = require("mongoose");
const { modItem } = require("./_Objects");

const inventorySchema = new Schema({
  owner: String,
  one: modItem,
  two: modItem,
  three: modItem,
  four: modItem,
  five: modItem,
  six: modItem,
  seven: modItem,
  eight: modItem,
  nine: modItem,
  ten: modItem,
  eleven: modItem,
  twelve: modItem,
  thirteen: modItem,
  fourteen: modItem,
  fifteen: modItem,
  sixteen: modItem,
});

module.exports = model("Inventory", inventorySchema);
