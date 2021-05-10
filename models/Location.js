const { model, Schema } = require("mongoose");

const locationSchema = new Schema({
  name: String,
  desc: String,
  characters: [String],
  parties: [String],
  areas: [String],
});

module.exports = model("Location", locationSchema);
