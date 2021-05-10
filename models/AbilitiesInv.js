const { model, Schema } = require("mongoose");
const { modItem } = require("./_Objects");

const abilitiesInvSchema = new Schema({
  owner: String,
  slotOne: modItem,
  slotTwo: modItem,
  slotThree: modItem,
  slotFour: modItem,
  slotFive: modItem,
  slotSix: modItem,
  slotSeven: modItem,
  slotEight: modItem,
  slotNine: modItem,
  slotTen: modItem,
  slotEleven: modItem,
  slotTwelve: modItem,
  slotThirteen: modItem,
  slotFourteen: modItem,
  slotFifteen: modItem,
  slotSixteen: modItem,
  slotSeventeen: modItem,
  slotEighteen: modItem,
  slotNineteen: modItem,
  slotTwenty: modItem,
});

module.exports = model("AbilitiesInv", abilitiesInvSchema);
