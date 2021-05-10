const { model, Schema } = require("mongoose");

const areaTemplateSchema = new Schema({
    name: String,
    desc: String,
    icon: String,
    type: String,
    level: Number,
    alignment: Number,
    humanity: Number,
    rarity: Number,
    chaos: Number,
    droprate: Number,
    size: Number,
    length: Number,
    range: Number,
    maxLifespan: Number,
    containment: [Number],
    mobs: [String],
    bosses: [String],
    environments: [String],
});

module.exports = model("AreaTemplate", areaTemplateSchema);
