const { Schema, model } = require("mongoose");
const quizExerciseSchema = new Schema(
  {
    exerciseName: {
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
    fileExtension: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
    },
    score: {
      type: String,
    },
    comment: {
      type: String,
    },
    totalStudents: {
      type: String,
    },
    totalAnswers: {
      type: String,
    },
    isHide: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: [],
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
    exerciseName: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = model("quizExercise", quizExerciseSchema);
