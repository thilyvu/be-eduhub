const { Schema, model } = require ('mongoose')
const newFeedSchema = new Schema({
  content:{
    type : String,
    required: true
  },
  comments: {
    type : Array, 
    default : []
  },
  image : {
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
  createName :{
    type : String,
    default : null
  },
  createAvatar :{
    type : String,
    default : null
  },
  updateBy : {
    type: String,
    default : null
  }

},{timestamps : true})
module.exports = model('newFeed', newFeedSchema)