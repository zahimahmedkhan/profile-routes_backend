const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please type a strong password");
        }
      },
    },
    role: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 25,
      default: "SOFTWARE ENGINEER",
    },
    bio: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 100,
      default: "No bio yet",
    },
    skills: {
      type: [String],
      default: [],
      validate(value) {
        if (value.length > 10) {
          throw new Error("You can only add up to 10 skills");
        }
      },
      set: (skills) => skills.map(skill => skill.trim().toUpperCase()),
    },
  },
  {
    collection: "User",
    timestamps: true,
  }
);


const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
