const { Schema, model } = require ('mongoose')
const fileFolderSchema = new Schema({
  fileType:{
    type : String,
    enum: ["file","folder"],
  },
  fileName:{
    type : String,
  },
  description:{
    type : String,
  },
  extension:{
    type : String,
  },
  fileSize:{
    type : Number,
  },
  classId : {
    type : String,
  },
  userId : {
    type : String,
  },
  path :{
    type : String,
    default : null,
  },
  thumbnailUrl: { 
    type : String,
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
module.exports = model('fileFolder', fileFolderSchema)