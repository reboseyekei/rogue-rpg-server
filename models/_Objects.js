const { model, Schema } = require("mongoose");

const enchantment = new Schema({
  target: String,
  value: Number,
});

const alter = new Schema({
  default: Number,
  mod: Number,
});

const division = new Schema({
  max: Number,
  current: Number,
  division: Number,
});

const modItem = new Schema({
  item: String,
  enchantments: [enchantment],
});

const essence = new Schema({
  focus: String,
  value: Number,
});

const resistance = new Schema({
  physical: Number,
  magical: Number,
  soul: Number,
});

const mind = new Schema({
  cap: Number,
  creation: Number,
  destruction: Number,
  restoration: Number,
  projection: Number,
});

const body = new Schema({
  cap: Number,
  vitality: Number,
  defense: Number,
  strength: Number,
  dexterity: Number,
});

const soul = new Schema({
  cap: Number,
  luck: Number,
  capacity: Number,
  clarity: Number,
  will: Number,
});

const attributes = new Schema({
  space: alter,
  time: alter,
  death: alter,
  life: alter,
  fire: alter,
  water: alter,
  earth: alter,
  air: alter,
});

const buffs = new Schema({
  regen: alter,
  dread: alter,
  poison: alter,
  scorch: alter,
  cold: alter,
  spark: alter,
  reflect: alter,
  summon: alter,
  taunt: alter,
  flee: alter,
  immortal: Number,
  strong: Number,
  warped: Number,
  sniper: Number,
  wellspring: Number,
  overcharged: Number,
  scavenger: Number,
  swift: Number,
});

const debuffs = new Schema({
  fear: alter,
  burn: alter,
  freeze: alter,
  shock: alter,
  toxin: alter,
  decay: alter,
  bleed: alter,
  exhaustion: alter,
  explosion: Number,
  paralysis: Number,
  frozen: Number,
  scorched: Number,
  sleep: Number,
});

const scale = new Schema({
  health: division,
  stamina: division,
  mana: division,
  shield: division,
  mind: mind,
  body: body,
  soul: soul,
  attributes: attributes,
  debuffs: debuffs,
  buffs: buffs,
  scaled: Boolean,
  value: Number,
});

const modifier = new Schema({
  target: String,
  scale: scale,
});

const effect = new Schema({
  name: String,
  turns: Number,
  target: Number,
  modifiers: [modifier],
});

const appliedEffect = new Schema({
  name: String,
  turns: Number,
  modifiers: [[String]],
  values: [Number],
})

const perk = new Schema({
  name: String,
  desc: String,
  attributes: attributes,
  buffs: buffs,
  debuffs: debuffs,
});

const ability = new Schema({
  tag: String,
  lvl: Number,
  target: Number,
  healthCost: Number,
  manaCost: Number,
  staminaCost: Number,
  shieldCost: Number,
  mindReq: Number,
  bodyReq: Number,
  soulReq: Number,
  resistance: resistance,
  repeatable: division,
  mindRepeat: mind,
  bodyRepeat: body,
  soulRepeat: soul,
  effects: [effect],
  damage: scale,
  healthGain: scale,
  manaGain: scale,
  staminaGain: scale,
  shieldGain: scale,
});

const item = new Schema({
  name: String,
  desc: String,
  path: String,
  ability: String,
  slots: Number,
  essence: essence,
  mind: mind,
  body: body,
  soul: soul,
  perks: [String],
});

const equipment = new Schema({
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

const equips = new Schema({
  head: item,
  upperBody: item,
  lowerBody: item,
  feet: item,
  ringOne: item,
  ringTwo: item,
  rightHand: item,
  leftHand: item,
});

const inventory = new Schema({
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

const level = new Schema({
  lvl: Number,
  xp: Number,
  potentialIncrease: Number,
  capIncrease: Number,
  statIncrease: Number,
  cap: Number,
  stat: Number,
  health: Number,
  mana: Number,
  stamina: Number,
  shield: Number,
  bonus: [Number],
  perks: [String],
});

const familiar = new Schema({
  owner: String,
  level: level,
  health: Number,
  damage: Number,
  perks: [String],
  inventory: inventory,
});

const enterprise = new Schema({
  name: String,
  level: Number,
  cost: Number,
});

const monsterTemplate = new Schema({
  name: String,
  type: String,
  alignmentRange: Number,
  humanity: Number,
  rarity: Number,
  environments: [String],
  level: level,
  attributes: attributes,
  buffs: buffs,
  debuffs: debuffs,
  slots: Number,
  abilities: [String],
  cooldown: [Number],
  mind: mind,
  body: body,
  soul: soul,
  defRes: Number,
  debuffRes: Number,
  health: division,
  mana: division,
  stamina: division,
  shield: division,
  perks: [String],
  effects: [effect],
  canEquip: Number,
  equipment: [String],
  items: [String],
  skins: [String],
  lines: [[String]]
})

const room = new Schema({
  lifespan: Number,
  environment: String,
  template: monsterTemplate,
})

const votes = new Schema({
  actions: [String],
  data: [[String]]
})

module.exports = {
  resistance,
  enchantment,
  alter,
  modItem,
  essence,
  mind,
  body,
  soul,
  attributes,
  buffs,
  debuffs,
  perk,
  scale,
  modifier,
  effect,
  appliedEffect,
  perk,
  ability,
  item,
  equipment,
  equips,
  inventory,
  level,
  familiar,
  enterprise,
  division,
  monsterTemplate,
  room,
  votes,
};
