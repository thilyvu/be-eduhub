const { Schema, model } = require("mongoose");
const studentKeySchema = new Schema(
  {
    studentId: {
      type: String,
    },
    listKeys: {
      type: Array,
      default: [],
    },
    testId: {
      type: String,
      required: true,
    },
    classId: {
      type: String,
      required: true,
    },
    listTopics: {
      type: Array,
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
module.exports = model("studentKey", studentKeySchema);
