const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Inventory = require("../../models/Inventory");

module.exports = {
  Query: {
    async getInventory(_, { inventoryId }) {
      try {
        if (!inventoryId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const inventory = await Inventory.findById(inventoryId);
        if (inventory) {
          return inventory;
        } else {
          throw new Error("Inventory not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async deleteItem(_, { deleteItemInput: { inventoryId, target } }) {
      try {
        const inventory = await Inventory.findById(inventoryId);
        inventory[target] = { item: null, enchantment: [] };
        inventory.save();
      } catch (err) {
        throw new Error(err);
      }
    },
    async deleteInventory(_, { inventoryId }) {
      try {
        const inventory = await Inventory.findById(inventoryId);
        await inventory.delete();
        return "Inventory is gone";
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
