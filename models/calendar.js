const { Schema, model } = require ('mongoose')
const CalendarSchema = new Schema({
  name:{
    type : String,
    required: true
  },
  description: {
    type: String,
    required :true
  },
  startTime: {
    type: Date,
    required : true
  },
  endTime:{
    type: Date,
    required : true
  },
  color: {
    type: String,
    required: true
  },
  classId: {
    type : String
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
module.exports = model('calendars', CalendarSchema)