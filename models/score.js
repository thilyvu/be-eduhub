const { Schema, model } = require ('mongoose')
const ScoreSchema = new Schema({
  answerFile:{
    type : String,
    default : null
  },
  exerciseId : { 
    type: String, 
    required : true
  },
  studentId : {
    type: String, 
    required : true
  },
  student : {
    type : Object
  },
  scores : {
    type : String,
  },
  fileExtension : {
    type : String,
  },
  createName :{
    type : String,
    default : null
  },
  createAvatar :{
    type : String,
    default : null
  },
  createBy : {
    type : String,
    default : null
  },
  updateBy : {
    type: String,
    default : null
  },
},{timestamps : true})
module.exports = model('score', ScoreSchema)