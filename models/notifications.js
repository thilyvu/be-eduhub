const { Schema, model } = require("mongoose");
const NotificationSchema = new Schema(
  {
    title: {
      type: String,
    },
    type: {
      type: String,
    },
    content: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
    },
    metadata: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
module.exports = model("notification", NotificationSchema);
