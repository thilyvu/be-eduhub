const { Schema, model } = require ('mongoose')
const ExerciseSchema = new Schema({
  exerciseName : {
    type : String,
    required : true
  },
  description : {
    type : String
  },
  deadline : {
    type: Date,
  },
  disabled :{
    type: Boolean,
    default : false
  },
  examFileUrl:{
    type : String,
    default : null
  },
  typeOfExams : {
    type : String,
    default : null
  },
  classId : { 
    type: String, 
    required : true
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
module.exports = model('exercise', ExerciseSchema)