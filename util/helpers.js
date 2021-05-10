function initEquip() {
  return {
    slots: 0,
    mind: {
      cap: 0,
      creation: 0,
      destruction: 0,
      restoration: 0,
      projection: 0,
    },
    body: {
      cap: 0,
      vitality: 0,
      defense: 0,
      strength: 0,
      dexterity: 0,
    },
    soul: {
      cap: 0,
      luck: 0,
      capacity: 0,
      clarity: 0,
      will: 0,
    },
  };
}

function parseEquip(equip) {
  let parsed = {
    slots: 0 + equip.slots,
    mind: {
      cap: 0 + equip.mind.cap,
      creation: 0 + equip.mind.creation,
      destruction: 0 + equip.mind.destruction,
      restoration: 0 + equip.mind.restoration,
      projection: 0 + +equip.mind.projection,
    },
    body: {
      cap: 0 + equip.body.cap,
      vitality: 0 + equip.body.vitality,
      defense: 0 + equip.body.defense,
      strength: 0 + equip.body.strength,
      dexterity: 0 + equip.body.dexterity,
    },
    soul: {
      cap: 0 + equip.soul.cap,
      luck: 0 + equip.soul.luck,
      capacity: 0 + equip.soul.capacity,
      clarity: 0 + equip.soul.clarity,
      will: 0 + equip.soul.will,
    },
  };
  return parsed;
}

function sum(ob1, ob2) {
  let sum = {
    slots: ob1.slots,
    mind: {
      cap: 0 + ob1.mind.cap + ob2.mind.cap,
      creation: 0 + ob1.mind.creation + ob2.mind.creation,
      destruction: 0 + ob1.mind.destruction + ob2.mind.destruction,
      restoration: 0 + ob1.mind.restoration + ob2.mind.restoration,
      projection: 0 + ob1.mind.projection + ob2.mind.projection,
    },
    body: {
      cap: 0 + ob1.body.cap + ob2.body.cap,
      vitality: 0 + ob1.body.vitality + ob2.body.vitality,
      defense: 0 + ob1.body.defense + ob2.body.defense,
      strength: 0 + ob1.body.strength + ob2.body.strength,
      dexterity: 0 + ob1.body.dexterity + ob2.body.dexterity,
    },
    soul: {
      cap: 0 + ob1.soul.cap + ob2.soul.cap,
      luck: 0 + ob1.soul.luck + ob2.soul.luck,
      capacity: 0 + ob1.soul.capacity + ob2.soul.capacity,
      clarity: 0 + ob1.soul.clarity + ob2.soul.clarity,
      will: 0 + ob1.soul.will + ob2.soul.will,
    },
  };

  return sum;
}

//Gets all the stats that equipment gives
function parseEquipped(equipped) {
  let init = initEquip();
  let head = initEquip();
  let upperBody = initEquip();
  let lowerBody = initEquip();
  let feet = initEquip();
  let leftHand = initEquip();
  let rightHand = initEquip();
  let ringOne = initEquip();
  let ringTwo = initEquip();

  if (equipped.head) {
    head = parseEquip(equipped.head);
  }
  if (equipped.upperBody) {
    upperBody = parseEquip(equipped.upperBody);
  }
  if (equipped.lowerBody) {
    lowerBody = parseEquip(equipped.lowerBody);
  }
  if (equipped.feet) {
    feet = parseEquip(equipped.feet);
  }
  if (equipped.leftHand) {
    leftHand = parseEquip(equipped.leftHand);
  }
  if (equipped.rightHand) {
    rightHand = parseEquip(equipped.rightHand);
  }
  if (equipped.ringOne) {
    ringOne = parseEquip(equipped.ringOne);
  }
  if (equipped.ringTwo) {
    ringTwo = parseEquip(equipped.ringTwo);
  }

  let total = sum(init, head);
  total = sum(total, upperBody);
  total = sum(total, lowerBody);
  total = sum(total, feet);
  total = sum(total, leftHand);
  total = sum(total, rightHand);
  total = sum(total, ringOne);
  total = sum(total, ringTwo);
  return total;
}


module.exports = {
    sum,
    parseEquip,
    parseEquipped,
}
