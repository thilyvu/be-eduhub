const { Schema, model } = require("mongoose");
const answerSchema = new Schema(
  {
    student: {
      type: Object,
    },
    listKeys: {
      type: Array,
      default : []
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
module.exports = model("answer", answerSchema);
