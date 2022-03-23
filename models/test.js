const { Schema, model } = require("mongoose");
const testSchema = new Schema(
  {
    testName: {
      type: String,
      required: true,
    },
    description: {
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
    },
    totalQuestions: {
      type: String,
    },
    totalTopics :{
      type : String,
    },
    isHide: {
      type: Boolean,
      default: false,
    },
    classIds: {
      type: Array,
      default: [],
    },
    listTopics :{
      type: Array,
      default:[]
    },
    createBy: {
      type: String,
      default: null,
    },
    updateBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = model("test", testSchema);
