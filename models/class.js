const { Schema, model } = require("mongoose");
const ClassSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    classCode: {
      type: String,
    },
    province: {
      type: String,
    },
    isHide: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    bannerImg: {
      type: String,
    },
    approveMode: {
      type: Boolean,
      default: false,
    },
    newFeeds: {
      type: Array,
      default: [],
    },
    pools: {
      type: Array,
      default: [],
    },
    calendars: {
      type: Array,
      default: [],
    },
    students: {
      type: Array,
      default: [],
    },
    awaitStudents: {
      type: Array,
      default: [],
    },
    lectures: {
      type: Array,
      default: [],
    },
    fileFolder: {
      type: Array,
      default: [],
    },
    exercise: {
      type: Array,
      default: [],
    },
    createBy: {
      type: String,
      default: null,
    },
    updateBy: {
      type: String,
      default: null,
    },
    price: {
      type: String,
    },
    totalTime: {
      type: String,
    },
    createdUser: {
      type: Object,
    },
  },
  { timestamps: true }
);
module.exports = model("class", ClassSchema);
