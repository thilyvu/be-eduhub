const { Schema, model } = require("mongoose");
const LectureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exercise: {
      type: Array,
      default: [],
    },
    description: {
      type: String,
    },
    document: {
      type: Array,
      default: [],
    },
    videoUrl: {
      type: String,
    },
    content: {
      type: String,
    },
    fileUrls: {
      type: Array,
      default: [],
    },
    bannerImg: {
      type: String,
    },
    classId: {
      type: String,
      required: true,
    },
    createBy: {
      type: String,
      default: null,
    },
    updateBy: {
      type: String,
      default: null,
    },
    comments: {
      type: Array,
      default: [],
    },
    createName: {
      type: String,
      default: null,
    },
    createAvatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = model("lecture", LectureSchema);
