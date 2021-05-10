const { model, Schema } = require("mongoose");

const partySchema = new Schema({
  name: String,
  location: String,
  charting: Boolean,
  characters: [String],
  tokenDistribution: [Number],
});

module.exports = model("Party", partySchema);
