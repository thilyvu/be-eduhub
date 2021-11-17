const { Schema, model } = require ('mongoose')
const gradeSchema = new Schema({
  name:{
    type : String,
    required: true
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
module.exports = model('grade', gradeSchema)