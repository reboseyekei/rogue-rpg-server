const { model, Schema } = require("mongoose");
const { room, votes} = require("./_Objects");

const dungeonSchema = new Schema({
    name: String,
    floors: [[room]],
    bossRooms: [room],
    currFloor: Number,
    currRoom: Number,
    leadingTo: [Number],
    leadingToVote: [[String]],
    actions: votes,
    chaos: Number,
    droprate: Number,
    occupants: [String],
    players: [String],
    turn: [[String]],
    loot: String,
    tokens: [Number],
    totalTokens: [Number],
    tokenDistribution: [Number],
    return: String,
    log: [String],
    timestamp: [String],
    active: [String],
});

module.exports = model("Dungeon", dungeonSchema);
