const { Schema, model } = require("mongoose");
const topicSchema = new Schema(
  {
    topicName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    listQuestions: {
      type: String,
    },
    listKeys: {
      type: String,
    },
    testIds: {
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
  },
  { timestamps: true }
);
module.exports = model("topic", topicSchema);
