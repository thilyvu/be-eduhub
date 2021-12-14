const { Schema, model } = require("mongoose");
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
      enum: ["teacher", "student", "admin"],
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    province: {
      type: String,
      default: "",
    },
    DOB: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "orther"],
      default: "student",
    },
    classes: {
      type: Array,
      default: [],
    },
    avatar: {
      type: String,
      default: "",
    },
    emailCode: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = model("users", UserSchema);
