const { Schema, model } = require("mongoose");
const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    newFeedId: {
      type: String,
    },
    lectureId: {
      type: String,
    },
    createBy: {
      type: String,
      default: null,
    },
    createName: {
      type: String,
      default: null,
    },
    createAvatar: {
      type: String,
      default: null,
    },
    fileUrls: {
      type: Array,
      default: [],
    },
    imageUrls: {
      type: Array,
      default: [],
    },
    updateBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = model("comment", CommentSchema);
