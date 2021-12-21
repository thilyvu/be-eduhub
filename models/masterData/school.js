const { Schema, model } = require ('mongoose')
const schoolSchema = new Schema({
  name:{
    type : String,
    required: true
  },
  province: {
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
module.exports = model('school', schoolSchema)