const mongoose = require("mongoose");
const { AuthenticationError } = require("apollo-server-errors");
const { withFilter } = require("apollo-server");

const checkAuth = require("../../util/checkAuth");

const User = require("../../models/User");
const Character = require("../../models/Character");
const Location = require("../../models/Location");
const AreaTemplate = require("../../models/AreaTemplate");

const { PubSub } = require("apollo-server");

const pubsub = new PubSub();

module.exports = {
  Query: {
    async getLocation(_, { locationId }) {
      try {
        if (!locationId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const location = await Location.findById(locationId);
        if (location) {
          return location;
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getLocations(_, { userId }) {
      try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const user = await User.findById(userId);
        if (user) {
          let data = [];
          user.locations.map((locationId, index) => {
            const location = Location.findById(locationId);
            if (location) {
              data.push(location);
            } else {
              user.locations.splice(index, 1);
            }
          });
          user.save();
          return data;
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAreas(_, { locationId }) {
      try {
        if (!locationId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const location = await Location.findById(locationId);
        if (location) {
          let data = [];
          location.areas.map(async (areaId, index) => {
            const areaTemplate = AreaTemplate.findById(areaId);
            if (areaTemplate) {
              data.push(areaTemplate);
            } else {
              location.areas.splice(index, 1);
            }
          });
          location.save();
          return data;
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async enterLocation(_, { placeId, characterId }) {
      if (!placeId.match(/^[0-9a-fA-F]{24}$/) || !characterId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid ID");
      }
      const location = await Location.findById(placeId);
      const character = Character.findById(characterId);
      if (location && character) {
        let tempCharacters = location.characters;
        tempCharacters.push(characterId);
        location.characters = tempCharacters;
        location.save();
        pubsub.publish("LOCATION_CONNECTED", {
          locationConnect: character,
        });
        return location;
      } else {
        throw new Error("Location not found");
      }
    },
  },
  Subscription: {
    locationConnect: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("LOCATION_CONNECTED"),
        (payload, variables) => {
          console.log(payload.locationConnect.name);
          return payload.locationConnect._id === variables.locationId;
        }
      ),
    },
  },
};
