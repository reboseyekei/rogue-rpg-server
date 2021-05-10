const { gql } = require("apollo-server");

module.exports = gql`
  """
  ====================== GENERAL ======================
  """
  type Division {
    max: Float
    current: Float
    division: Float
  }
  input DivisionInput {
    max: Float
    current: Float
    division: Float
  }
  type Alter {
    default: Int
    mod: Int
  }
  input AlterInput {
    default: Int
    mod: Int
  }
  type Enchantment {
    target: String!
    value: Int!
  }
  input EnchantmentInput {
    target: String!
    value: Int!
  }
  type ModItem {
    item: String
    enchantments: [Enchantment]
  }
  input ModItemInput {
    item: String
    enchantments: [EnchantmentInput]
  }
  type Essence {
    focus: String!
    value: Int!
  }
  input EssenceInput {
    focus: String!
    value: Int!
  }
  """
  ====================== STATS ======================
  """
  type Mind {
    cap: Int
    creation: Int
    destruction: Int
    restoration: Int
    projection: Int
  }
  input MindInput {
    cap: Int
    creation: Int
    destruction: Int
    restoration: Int
    projection: Int
  }
  type Body {
    cap: Int
    vitality: Int
    defense: Int
    strength: Int
    dexterity: Int
  }
  input BodyInput {
    cap: Int
    vitality: Int
    defense: Int
    strength: Int
    dexterity: Int
  }
  type Soul {
    cap: Int
    luck: Int
    capacity: Int
    clarity: Int
    will: Int
  }
  input SoulInput {
    cap: Int
    luck: Int
    capacity: Int
    clarity: Int
    will: Int
  }
  """
  ====================== ATTRIBUTES ======================
  """
  type Attributes {
    space: Alter
    time: Alter
    death: Alter
    life: Alter
    fire: Alter
    water: Alter
    earth: Alter
    air: Alter
  }
  input AttributesInput {
    space: AlterInput
    time: AlterInput
    death: AlterInput
    life: AlterInput
    fire: AlterInput
    water: AlterInput
    earth: AlterInput
    air: AlterInput
  }
  """
  ====================== BUFFS/DEBUFFS ======================
  """
  type Buffs {
    """
    Value buffs
    """
    regen: Alter
    dread: Alter
    poison: Alter
    scorch: Alter
    cold: Alter
    spark: Alter
    reflect: Alter
    summon: Alter
    taunt: Alter
    flee: Alter
    """
    Timed buffs
    """
    immortal: Int
    strong: Int
    warped: Int
    sniper: Int
    wellspring: Int
    overcharged: Int
    scavenger: Int
    swift: Int
  }
  input BuffsInput {
    regen: AlterInput
    dread: AlterInput
    poison: AlterInput
    scorch: AlterInput
    cold: AlterInput
    spark: AlterInput
    reflect: AlterInput
    summon: AlterInput
    taunt: AlterInput
    flee: AlterInput
    immortal: Int
    strong: Int
    warped: Int
    sniper: Int
    wellspring: Int
    overcharged: Int
    scavenger: Int
    swift: Int
  }
  type Debuffs {
    """
    Value debuffs
    """
    fear: Alter
    burn: Alter
    freeze: Alter
    shock: Alter
    toxin: Alter
    decay: Alter
    bleed: Alter
    exhaustion: Alter
    """
    Timed debuffs
    """
    explosion: Int
    paralysis: Int
    frozen: Int
    scorched: Int
    sleep: Int
  }
  input DebuffsInput {
    fear: AlterInput
    burn: AlterInput
    freeze: AlterInput
    shock: AlterInput
    toxin: AlterInput
    decay: AlterInput
    bleed: AlterInput
    exhaustion: AlterInput
    explosion: Int
    paralysis: Int
    frozen: Int
    scorched: Int
    sleep: Int
  }

  """
  ====================== PERKS/EFFECTS/ABILITIES ======================
  """
  type Perk {
    id: ID!
    name: String!
    desc: String!
    """
    The values the perk adds onto for display and removal
    """
    attributes: Attributes
    buffs: Buffs
    debuffs: Debuffs
  }
  input PerkInput {
    name: String!
    desc: String!
    attributes: AttributesInput
    buffs: BuffsInput
    debuffs: DebuffsInput
  }
  type Scale {
    """
    Scaling of value according to stats
    any # greater than 0 means that for each # of stat the value a positive multiplier is added
    any # greater than 0 means that for each # of stat the value a negative multiplier is added
    0 means no scaling
    at the end all multipliers are added together
    example one: character has 50 dex and the dex scale is 10. a 5x multiplier is applied
    example two: character has 50 dex and 20 strength. The modifier for dexterity is 10 and the modifier for strength is -10. A 3x multiplier is applied
    example three: an ability that deals 50 damage for each turn of scorched debuff, value inside Scale would be 50 and debuff.scorched would be 1

    Ideally abilities with negative modifiers won't be used but it allows for more flexibility

    Scaling of value according to health, stamina, and mana
    All previous rules apply, except instead of stat values scaling can go by:
    Your max of that stat
    Your current value of that stat
    Your division of that stat

    division will apply a multiplier to the value of your max/current

    example: character has 50 health with a max of 200, division multiplier is 2. A 8x modifier is applied
    max is equivalent to the highest value the ability scales up to
    """
    health: Division
    stamina: Division
    mana: Division
    shield: Division
    mind: Mind
    body: Body
    soul: Soul
    attributes: Attributes
    debuffs: Debuffs
    buffs: Buffs
    """
    Value decides the initial value, scaling effects how much the stats effect that value. This will usually be 1, but also 0 in the case of no scaling
    Scaled provides an easy way for the server to check if it needs to check for scaling or not
    """
    scaled: Boolean!
    value: Int!
  }
  input ScaleInput {
    health: DivisionInput
    stamina: DivisionInput
    mana: DivisionInput
    shield: DivisionInput
    mind: MindInput
    body: BodyInput
    soul: SoulInput
    attributes: AttributesInput
    debuffs: DebuffsInput
    buffs: BuffsInput
    scaled: Boolean!
    value: Int!
  }
  type Modifier {
    target: String
    scale: Scale
  }
  input ModifierInput {
    target: String
    scale: ScaleInput
  }
  type Effect {
    id: ID
    name: String!
    target: Boolean!
    turns: Int!
    modifiers: [Modifier]
  }
  input EffectInput {
    name: String!
    target: Int!
    turns: Int!
    modifiers: [ModifierInput]
  }
  type AppliedEffect {
    name: String!
    turns: Int!
    modifiers: [[String]]!
    values: [Int]!
  }
  type Ability {
    id: ID!
    tag: String!
    lvl: Int!
    target: Int
    """
    Ability Costs
    """
    healthCost: Int
    manaCost: Int
    staminaCost: Int
    shieldCost: Int
    """
    Stat requirement (Caps)
    """
    mindReq: Int
    bodyReq: Int
    soulReq: Int
    """
    Repeatability checks default amount of repeats, the max amount of repeats, whether the ability can scale with stats (current), and how it scales with stats(division) (ex: bodyRepeat.dexterity = 2, every 2 dexterity causes a repeat)
    """
    repeatable: Division
    mindRepeat: Mind
    bodyRepeat: Body
    soulRepeat: Soul
    """
    Keeps track of all effects an ability bestows
    """
    effects: [Effect]
    """
    Scaling for one time effects
    """
    damage: Scale
    healthGain: Scale
    manaGain: Scale
    staminaGain: Scale
    shieldGain: Scale
  }
  type AbilitiesInv {
    slotOne: ModItem
    slotTwo: ModItem
    slotThree: ModItem
    slotFour: ModItem
    slotFive: ModItem
    slotSix: ModItem
    slotSeven: ModItem
    slotEight: ModItem
    slotNine: ModItem
    slotTen: ModItem
    slotEleven: ModItem
    slotTwelve: ModItem
    slotThirteen: ModItem
    slotFourteen: ModItem
    slotFifteen: ModItem
    slotSixteen: ModItem
    slotSeventeen: ModItem
    slotEighteen: ModItem
    slotNineteen: ModItem
    slotTwenty: ModItem
  }
  input CreateAbilityInput {
    tag: String!
    lvl: Int!
    target: Int!
    healthCost: Int
    manaCost: Int
    staminaCost: Int
    shieldCost: Int
    mindReq: Int
    bodyReq: Int
    soulReq: Int
    repeatable: DivisionInput
    mindRepeat: MindInput
    bodyRepeat: BodyInput
    soulRepeat: SoulInput
    effects: [EffectInput]
    damage: ScaleInput
    healthGain: ScaleInput
    manaGain: ScaleInput
    staminaGain: ScaleInput
    shieldGain: ScaleInput
  }
  """
  ====================== ITEMS/EQUIPMENT/INVENTORY ======================
  """
  type Item {
    id: ID
    name: String
    desc: String
    path: String
    type: String
    ability: String
    slots: Int
    essence: Essence
    mind: Mind
    body: Body
    soul: Soul
    perks: [String]
  }
  type Equipment {
    id: ID!
    owner: ID!
    head: ModItem
    upperBody: ModItem
    lowerBody: ModItem
    feet: ModItem
    ringOne: ModItem
    ringTwo: ModItem
    rightHand: ModItem
    leftHand: ModItem
  }
  input EquipmentInput {
    head: ModItemInput
    upperBody: ModItemInput
    lowerBody: ModItemInput
    feet: ModItemInput
    ringOne: ModItemInput
    ringTwo: ModItemInput
    rightHand: ModItemInput
    leftHand: ModItemInput
  }
  type Equips {
    head: Item
    upperBody: Item
    lowerBody: Item
    feet: Item
    ringOne: Item
    ringTwo: Item
    rightHand: Item
    leftHand: Item
  }
  type Inventory {
    id: ID!
    owner: ID!
    one: ModItem
    two: ModItem
    three: ModItem
    four: ModItem
    five: ModItem
    six: ModItem
    seven: ModItem
    eight: ModItem
    nine: ModItem
    ten: ModItem
    eleven: ModItem
    twelve: ModItem
    thirteen: ModItem
    fourteen: ModItem
    fifteen: ModItem
  }
  input SwitchItemsInput {
    firstAnchor: ID!
    secondAnchor: ID!
    firstTarget: String!
    secondTarget: String!
  }
  input DeleteItemInput {
    inventoryId: ID!
    target: Int!
  }
  input DeleteEquipInput {
    equipmentId: ID!
    target: Int!
  }
  input CreateItemInput {
    name: String!
    desc: String!
    path: String!
    type: String!
    ability: String
    focus: String
    essence: Int
    mindCap: Int
    bodyCap: Int
    soulCap: Int
    creation: Int
    restoration: Int
    destruction: Int
    projection: Int
    vitality: Int
    defense: Int
    strength: Int
    dexterity: Int
    luck: Int
    capacity: Int
    clarity: Int
    will: Int
    perks: [String]
  }
  """
  ====================== LEVEL MANAGER ======================
  """
  type Level {
    lvl: Int!
    xp: Int!
    """
    potential: How much cap you gain in all categories on level up
    capIncrease: How many cap points you gain on level up
    statIncrease: how many stat points you get on level upwww
    """
    potentialIncrease: Int!
    capIncrease: Int!
    statIncrease: Int!
    cap: Int!
    stat: Int!
    """
    How much of base stats you gain per level
    """
    health: Int!
    mana: Int!
    stamina: Int!
    shield: Int!
    """
    Bonus is the level which you unlock the corresponding perk in the array at if there are class specific perks
    """
    bonus: [Int]
    perks: [String]
  }

  input LevelInput {
    lvl: Int
    xp: Int
    potentialIncrease: Int
    capIncrease: Int
    statIncrease: Int
    cap: Int
    stat: Int
    health: Int
    mana: Int
    stamina: Int
    shield: Int
    bonus: [Int]
    perks: [String]
  }

  """
  ====================== SPIRIT ======================
  """
  type Spirit {
    id: ID!
    name: String!
    desc: String!
    level: Level!
    alignment: Int!
    humanity: Int!
    slots: Int!
    abilities: [String]!
    mind: Mind
    body: Body
    soul: Soul
    attributes: Attributes
    buffs: Buffs
    debuffs: Debuffs
    health: Division!
    mana: Division!
    stamina: Division!
    shield: Division!
    defRes: Int!
    debuffRes: Int!
    perks: [String]
    skins: [[String]]!
    canEquip: Int!
  }

  input SpiritInput {
    name: String!
    desc: String!
    level: LevelInput!
    alignment: Int!
    humanity: Int!
    slots: Int!
    abilities: [String]!
    mind: MindInput
    body: BodyInput
    soul: SoulInput
    attributes: AttributesInput
    buffs: BuffsInput
    debuffs: DebuffsInput
    health: DivisionInput!
    mana: DivisionInput!
    stamina: DivisionInput!
    shield: DivisionInput!
    defRes: Int!
    debuffRes: Int!
    perks: [String]
    skins: [[String]]!
    canEquip: Int!
  }

  """
  ====================== FAMILIARS/CHARACTERS ======================
  """
  type Familiar {
    id: ID!
    owner: ID
    lvl: Level!
    health: Int!
    damage: Int!
    perks: [String]
    inventory: String
  }

  type Character {
    id: ID!
    owner: ID!
    name: String!
    spirit: String
    place: String!
    party: String
    level: Level
    cap: Int
    tags: [String]
    titles: [String]
    alignment: Int!
    humanity: Int!
    attributes: Attributes
    buffs: Buffs
    debuffs: Debuffs
    slots: Int!
    abilitiesInv: String!
    cooldowns: [Int]
    mind: Mind!
    body: Body!
    soul: Soul!
    health: Division!
    mana: Division!
    stamina: Division!
    shield: Division!
    defRes: Int!
    debuffRes: Int!
    perks: [String]
    effects: [AppliedEffect]
    canEquip: Int!
    equipment: String!
    inventory: String!
    familiar: String
    """
      skins uses the first array slot to decide which skin is being used
      ["warrior"]
      the 2nd array slot decides which skins are available
      ["bandit", "adventurer"]
      the third array slot decides which skins are unlocked through leveling further, first skin requires level five, 2nd skin requires level 10, 3rd skin requires 15
      ["knight", "palladin", "general"]
      the fourth array slot decides which skins were unlocked through events, etc
      ["seraph", "titan"]
    """
    skins: [[String]]!
    lines: [[String]]
    ai: String
  }

  type CharacterOutput {
    id: ID!
    name: String!
    level: Int!
    humanity: Int!
    alignment: Int!
    spirit: String!
    skin: String!
    health: Division!
    mana: Division!
    stamina: Division!
    shield: Division!
    effects: [AppliedEffect]!
  }

  input CreateCharacterInput {
    charName: String!
    locationId: String!
    spiritId: String!
  }
  input updateCharacterStatsInput {
    characterId: ID!
    capUsed: Int!
    statUsed: Int!
    mindCap: Int!
    bodyCap: Int!
    soulCap: Int!
    creation: Int!
    restoration: Int!
    destruction: Int!
    projection: Int!
    vitality: Int!
    defense: Int!
    strength: Int!
    dexterity: Int!
    luck: Int!
    capacity: Int!
    clarity: Int!
    will: Int!
  }
  """
  ====================== LOCATION ======================
  """
  type Location {
    id: ID!
    name: String!
    desc: String!
    parties: [String]!
    areas: [String]
  }

  input LocationInput {
    name: String!
    desc: String!
    areas: String!
  }

  """
  ====================== PARTY ======================
  """

  type Party {
    id: ID!
    name: String!
    location: String!
    charting: Boolean!
    characters: [String]!
    tokenDistribution: [Int]!
  }

  """
  ====================== USER MANAGEMENT ======================
  """
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    characters: [String]!
    familiars: [String]!
    essence: Int!
    purity: Int!
    wisdom: Int!
    vault: [String]
    locations: [String]
    spirits: [String]
    createdAt: String!
  }
  input RegisterInput {
    email: String!
    username: String!
    password: String!
    confirmPassword: String!
  }
  input LoginInput {
    email: String!
    password: String!
  }

  """
  ====================== DUNGEONS/REGIONS ======================
  """
  type MonsterTemplate {
    id: ID!
    name: String!
    """
    name: the base name of the creature
    type: creature, trap, treasure
    alignmentRange: creatures will have the ability to stray from their dungeons alignments, and so meeting a boss with a good alignment might help you
    rarity: the ability for a creature to be buffed up into a miniboss, will add onto the dungeon rarity
    environments: the environment a creature can be in
    the rest is just the monster stats that would be used
    equipment: a list of items the monster has equipped, a function will properly equip them
    items: a list of items the monster would have inside its inventory
    skins: first array contains the skin that it will be using, 2nd array contains that skin and the skin it will use if rare
    """
    type: String!
    humanity: Int!
    alignmentRange: Int!
    rarity: Int!
    droprate: Int!
    environments: [String]!
    level: Level!
    attributes: Attributes
    buffs: Buffs
    debuffs: Debuffs
    slots: Int!
    abilitiesInv: String!
    cooldown: [Int]
    mind: Mind!
    body: Body!
    soul: Soul!
    health: Division!
    mana: Division!
    stamina: Division!
    shield: Division!
    defRes: Int
    debuffRes: Int
    perks: [String]
    effects: [Effect]
    equipment: Equipment
    canEquip: Int!
    items: [String]
    skins: [String]!
    lines: [[String]]
  }

  input MonsterTemplateInput {
    name: String!
    type: String!
    alignmentRange: Int!
    humanity: Int!
    rarity: Int!
    droprate: Int!
    environments: [String]!
    level: LevelInput!
    attributes: AttributesInput
    buffs: BuffsInput
    debuffs: DebuffsInput
    slots: Int!
    abilities: [String]!
    cooldown: [Int]!
    mind: MindInput
    body: BodyInput
    soul: SoulInput
    health: DivisionInput!
    mana: DivisionInput!
    stamina: DivisionInput!
    shield: DivisionInput!
    defRes: Int
    debuffRes: Int
    perks: [String]
    effects: [EffectInput]
    equipment: EquipmentInput
    canEquip: Int!
    items: [String]
    skins: [String]!
    lines: [[String]]
  }

  type AreaTemplate {
    id: ID!
    """
    type: Region, expedition, trial
    level: estimated level you should be to start this
    alignment: base alignment of creatures in the dungeon
    humanity: base humanity added to creatures in the dungeon, humanity indicating level of intelligence and how civilized a being is
    rarity: -5 to 5, indicating the likelihood of minibosses. A 6 needs to be rolled for a miniboss to spawn
    droprate: 0 to 10 indictating the multiplier on drops, 3 is the average 
    chaos: the number of floors its possible for you to backtrack, good for messy dungeons. SHOULD NOT BE HIGHER THAN 5
    size: How many floors
    length: base rooms you have to go through to complete each floor
    range: max amount of variation allowed in number of rooms
    containment: level of restrictions in the dungeon, the array corresponds to the floors
     -0 means you can leave mid rooms and you can't die,
     -1 means you can leave mid rooms and you can die, 
     -2 means you can't leave mid rooms(only through teleporter rooms) and you can die
    mobs: what creatures can spawn
    bosses: order of bosses corresponding to each floor
    environments: possible environments within the dungeon
    """
    name: String!
    desc: String!
    icon: String!
    type: String!
    level: Int!
    alignment: Int!
    humanity: Int!
    rarity: Int!
    chaos: Int!
    droprate: Int!
    size: Int!
    length: Int!
    range: Int!
    maxLifespan: Int!
    containment: [Int]!
    mobs: [String]
    bosses: [String]
    environments: [String]
  }

  input AreaTemplateInput {
    name: String!
    desc: String!
    icon: String!
    type: String!
    level: Int!
    alignment: Int!
    humanity: Int!
    rarity: Int!
    chaos: Int!
    droprate: Int!
    size: Int!
    length: Int!
    range: Int!
    maxLifespan: Int!
    containment: [Int]!
    mobs: [String]
    bosses: [String]
    environments: [String]
  }

  type Room {
    lifespan: Int!
    environment: String!
    template: MonsterTemplate
  }

  type Votes {
    actions: [String]
    data: [[String]]
  }

  type Dungeon {
    id: ID!
    name: String!
    floors: [[Room]]
    bossRooms: [Room]
    currFloor: Int!
    currRoom: Int!
    leadingTo: [Int]
    leadingToVote: [[String]]
    actions: Votes
    chaos: Int!
    droprate: Int!
    occupants: [String]
    players: [String]
    loot: String
    turn: [[String]]
    totalTokens: [Int]
    tokens: [Int]
    tokenDistribution: [Int]
    return: String!
    log: [String]
    timestamp: [String]
    active: [String]
  }

  type DestinationOutput {
    environment: String!
    vote: [String]
  }

  type DungeonOutput {
    id: ID!
    room: Room
    occupants: [CharacterOutput]
    players: [CharacterOutput]
    playerIds: [String]
    leadingRooms: [DestinationOutput]
    actions: Votes
    tokens: [String]
    tokenDistribution: [String]
    totalTokens: [String]
    log: [String]
    timestamp: [String]
    turn: [[String]]
    active: [String]
    loot: String
  }

  input CreateDungeonInput {
    templateId: ID!
    partyId: ID
    characterId: ID!
    locationId: ID!
  }

  union Place = Dungeon | Location

  type PlaceData {
    places: [String]
    data: [Place]
  }

  """
  ====================== QUERY/MUTATION ======================
  """
  type Query {
    getUser(userId: ID!): User
    getCharacter(characterId: ID!): Character
    getCharacters(userId: ID!): [Character]
    getInventory(inventoryId: ID!): Inventory
    getEquipment(equipmentId: ID!): Equipment
    getEquips(equipmentId: ID!): Equips
    getItem(itemId: ID!): Item
    getActiveItem(anchor: ID!, target: String!): Item
    getAbility(abilityId: ID!): Ability
    getAbilitiesInv(abilitiesInvId: ID!): AbilitiesInv
    getDungeon(dungeonId: ID!): Dungeon
    getSpirit(spiritId: ID!): Spirit
    getLocation(locationId: ID!): Location
    getSpirits(userId: ID!): [Spirit]
    getLocations(userId: ID!): [Location]
    getMonsterTemplate(monsterTemplateId: ID!): MonsterTemplate
    getAreaTemplate(areaTemplateId: ID!): AreaTemplate
    getPerk(perkId: ID!): Perk
    getPlace(placeId: ID!): Place
    getPlaces(userId: ID!): PlaceData
    getParty(partyId: ID!): Party
    getParties(locationId: ID!): [Party]
    getMembers(partyId: ID!): [Character]
    getAreas(locationId: ID!): [AreaTemplate]
    getPlayers(dungeonId: ID!): [Character]
    getRoom(dungeonId: ID!, floor: Int!, room: Int!): Room
    getDungeonOutput(dungeonId: ID!, characterId: ID!): DungeonOutput
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    """
    ADMIN COMMANDS
    """
    createSpirit(createSpiritInput: SpiritInput): Spirit!
    createLocation(createLocationInput: LocationInput): Location!
    createMonsterTemplate(createMonsterTemplateInput: MonsterTemplateInput): MonsterTemplate!
    createAreaTemplate(createAreaTemplateInput: AreaTemplateInput): AreaTemplate!
    createItem(createItemInput: CreateItemInput): Item!
    removeItem(itemId: ID!): String!
    createAbility(createAbilityInput: CreateAbilityInput): Ability!
    createPerk(createPerkInput: PerkInput): Perk!
    deleteAll: String!
    """
    USER SENSITIVE COMMANDS
    """
    createCharacter(createCharacterInput: CreateCharacterInput): Character!
    """
    GENERAL COMMANDS
    """
    changeSkin(skinIndex: Int!, characterId: ID!): Character!
    updateCharacterStats(updateCharacterStatsInput: updateCharacterStatsInput): Character!
    deleteCharacter(characterId: ID!): String!
    switchItems(switchItemsInput: SwitchItemsInput): String!
    deleteItem(deleteItemInput: DeleteItemInput): String!
    deleteInventory(inventoryId: ID!): String!
    deleteEquip(deleteEquipInput: DeleteEquipInput): String!
    deleteEquipment(equipmentId: ID!): String!
    createDungeon(createDungeonInput: CreateDungeonInput): Dungeon!
    enterLocation(placeId: ID!, characterId: ID!): Location!
    leaveLocation(placeId: ID!, characterId: ID!): Location!
    createParty(locationId: ID!, characterId: ID!, name: String!): Party
    joinParty(partyId: ID!, characterId: ID!): Party
    leaveParty(partyId: ID!, characterId: ID!): String
    kickParty(partyId: ID!, characterId: ID!): String
    updatePartyToken(partyId: ID!, newTokenDist: [Int]!): Party
    disbandParty(partyId: ID!): String!
    roomVote(index: Int!, action: String!, characterId: ID!, dungeonId: ID!): Dungeon
    actionVote(index: Int!, action: String!, characterId: ID!, dungeonId: ID!): Dungeon
    sendAbility(characterId: ID!, dungeonId: ID!, slot: String!): String
  }
  type Subscription {
    locationConnect(locationId: ID!): Character!
  }
`;
