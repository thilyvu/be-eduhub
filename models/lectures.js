const { Schema, model } = require ('mongoose')
const LectureSchema = new Schema({
  name:{
    type : String,
    required: true
  },
  exercise: {
    type: Array,
    default : []
  },
  description: {
    type: String,
    required: true
  },
  document: {
    type: Array,
    default : []
  },
  videoUrl : {
    type :String,
  },
  bannerImg : { 
    type : String,
  },
  classId : {
    type : String,
    required : true
  },
  createBy : {
    type : String,
    default : null
  },
  updateBy : {
    type: String,
    default : null
  }

},{timestamps : true})
module.exports = model('lecture', LectureSchema)