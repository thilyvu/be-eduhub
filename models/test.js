const { Schema, model } = require("mongoose");
const testSchema = new Schema(
  {
    testName: {
      type: String,
      required: true,
    },
    testDescription: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
    },
    totalStudents: {
      type: String,
      default: 0,
    },
    totalQuestions: {
      type: String,
      default: 0,
    },
    totalTopics: {
      type: String,
      default: 0,
    },
    isHide: {
      type: Boolean,
      default: false,
    },
    classIds: {
      type: Array,
      default: [],
    },
    listTopics: {
      type: Array,
      default: [],
    },
    listQuestions: {
      type: Array,
      default: [],
    },
    listKeys: {
      type: Array,
      default: [],
    },
    listAnswers: {
      type: Array,
      default: [],
    },
    isShowPoint: {
      type: Boolean,
      default: false,
    },
    countDownTime: {
      type: Date,
    },
    createBy: {
      type: String,
      default: null,
    },
    updateBy: {
      type: String,
      default: null,
    },
    createdUser: {
      type: Object,
    },
  },
  { timestamps: true }
);
module.exports = model("test", testSchema);
