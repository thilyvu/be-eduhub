const { Schema, model } = require ('mongoose')
const ExerciseSchema = new Schema({
  exerciseName : {
    type : String,
    required : true
  },
  fileName : {
    type : String,
  },
  description : {
    type : String
  },
  deadline : {
    type: Date,
  },
  startDate :{
    type: Date,
  },
  endDate :{
    type: Date,
  },  
  fileExtension : {
    type : String,
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
  status : {
    type : String,
  },
  isHide :{
    type : Boolean,
    default : false
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