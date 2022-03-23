const { Schema, model } = require("mongoose");
const questionTypeSchema = new Schema(
  {
    questionTypeName: {
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
module.exports = model("questionType", questionTypeSchema);
