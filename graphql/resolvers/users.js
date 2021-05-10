const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const mongoose = require("mongoose");
const User = require("../../models/User");
const Inventory = require("../../models/Inventory");

const { SECRET_KEY } = require("../../config");
const { validateRegisterInput, validateLoginInput } = require("../../util/validators");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "48h" }
  );
}

module.exports = {
  Query: {
    async getUser(_, { userId }) {
      try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid ID");
        }
        const user = await User.findById(userId);
        if (user) {
          return user;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async register(_, { registerInput: { email, username, password, confirmPassword} }) {
      // Validate User Data
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      //Make sure user or email doesn't already exist
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        throw new UserInputError("Email is taken", {
          errors: {
            email: "This email is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const userId = mongoose.Types.ObjectId();
      const inventoryId = mongoose.Types.ObjectId();

      const newInventory = new Inventory({
        _id: inventoryId,
        owner: userId,
        one: { item: null, enchantments: [] },
        two: { item: null, enchantments: [] },
        three: { item: null, enchantments: [] },
        four: { item: null, enchantments: [] },
        five: { item: null, enchantments: [] },
        six: { item: null, enchantments: [] },
        seven: { item: null, enchantments: [] },
        eight: { item: null, enchantments: [] },
        nine: { item: null, enchantments: [] },
        ten: { item: null, enchantments: [] },
        eleven: { item: null, enchantments: [] },
        twelve: { item: null, enchantments: [] },
        thirteen: { item: null, enchantments: [] },
        fourteen: { item: null, enchantments: [] },
        fifteen: { item: null, enchantments: [] },
      });

      const newUser = new User({
        _id: userId,
        email: email.toLowerCase(),
        password,
        username,
        characters: [],
        familiars: [],
        essence: 100,
        purity: 0,
        wisdom: 0,
        vault: [inventoryId],
        locations: ["606e7da44c485f5774bfcb75"],
        spirits: ["606e6d7c616b480ba4cfa1d5", "606e71ce616b480ba4cfa1e3", "606e7542616b480ba4cfa1f1"],
        createdAt: new Date().toISOString(),
      });

      await newInventory.save();
      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async login(_, { loginInput: { email, password } }) {
      const { errors, valid } = validateLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      let tempEmail = email.toLowerCase();
      const emailCheck = await User.findOne({ email: tempEmail });
      if (!emailCheck) {
        errors.email = "Email not found";
        throw new UserInputError("Email not found", { errors });
      }

      const match = await bcrypt.compare(password, emailCheck.password);
      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(emailCheck);

      return {
        ...emailCheck._doc,
        id: emailCheck._id,
        token,
      };
    },
  },
};
