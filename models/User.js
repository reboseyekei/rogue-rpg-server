const { model, Schema } = require("mongoose");
const { enterprise } = require("./_Objects");

const userSchema = new Schema({
    email: String,
    password: String,
    username: String,
    characters: [String],
    familiars: [String],
    essence: Number,
    purity: Number,
    wisdom: Number,
    vault: [String],
    locations: [String],
    spirits: [String],
    createdAt: String,
});

module.exports = model("User", userSchema);
