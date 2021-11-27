const { Schema, model } = require ('mongoose')
const NotificationSchema = new Schema({
  title:{
    type : String,
    required: true
  },
  type: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
  isRead:{
    type: Boolean,
    default : false
  },
  userId: {
    type: String,
    required : trúe
  }

},{timestamps : true})
module.exports = model('notification', NotificationSchema)