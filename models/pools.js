const { Schema, model } = require ('mongoose')
const poolSchema = new Schema({
  content:{
    type : String,
    required: true
  },
  options: {
    type : Array, 
    default : []
  },
  type : {
    type :  String,
  },
  isBlock:{
    type : Boolean,
    default: false
  },
  classId : {
    type : String,
    required : true
  },
  createdUser: {
    type: Object,
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
module.exports = model('pool', poolSchema)