const usersResolvers = require("./users");
const charactersResolvers = require("./characters");
const inventoriesResolvers = require("./inventories");
const equipmentsResolvers = require("./equipments");
const itemsResolvers = require("./items");
const abilitiesResolvers = require("./abilities");
const dungeonResolvers = require("./dungeons");
const locationsResolvers = require("./locations");
const adminsResolvers = require("./admins");

module.exports = {
  Place: {
    __resolveType(obj, context, info) {
        if (obj.chaos) {
            return 'Dungeon';
        } 
        if(obj.desc) {
            return 'Location';
        }

        return null;
    },
  },
  Query: {
    ...usersResolvers.Query,
    ...charactersResolvers.Query,
    ...inventoriesResolvers.Query,
    ...equipmentsResolvers.Query,
    ...itemsResolvers.Query,
    ...abilitiesResolvers.Query,
    ...dungeonResolvers.Query,
    ...adminsResolvers.Query,
    ...locationsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...charactersResolvers.Mutation,
    ...inventoriesResolvers.Mutation,
    ...equipmentsResolvers.Mutation,
    ...itemsResolvers.Mutation,
    ...abilitiesResolvers.Mutation,
    ...dungeonResolvers.Mutation,
    ...adminsResolvers.Mutation,
    ...locationsResolvers.Mutation,
  },
  Subscription: {
    ...locationsResolvers.Subscription,
  }
};
