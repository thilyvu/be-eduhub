const { Schema, model } = require("mongoose");
const questionSchema = new Schema(
  {
    questionName: {
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
    numberOfQuestion: {
        type : String,
        default : '1'
    },
    listAnswers: {
        type :  Array,
        default : []
    },
    content :{
        type : String,
        default : ''
    },
    listKeys: {
        type : Array,
        default : []
    },
    questionType :{
      type :String
    }
  },
  { timestamps: true }
);
module.exports = model("question", questionSchema);
