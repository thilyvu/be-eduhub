const Notification = require("../models/notifications");
const {notificationCreateSchema,notificationUpdateSchema} = require('../helper/validation_notification')
const createNotification = async (notification, res) =>{

 try {
    const result = await notificationCreateSchema.validateAsync(notification);
    // create new user 
    const newNotification = new Notification ({
      ...result
    })
    await newNotification.save();
    return res.status(201).json({
      message: "New notification create successful ",
      success: true
    })
 }
 catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }
};
const updateNotification =async (notification ,notificationId, res) =>{ 

  try {

    const result = await notificationUpdateSchema.validateAsync(notification);
    const oldNotification = await Notification.findById(notificationId);
    const updateNotification = await Object.assign(oldNotification, result);
    const updatedNotification = await updateNotification.save();
    
    if(updatedNotification) {
      return res.status(201).json({
        message: "Notification successfully update",
        success: true
      })
    }
    return res.status(400).json({
      message: "Notification update fail",
      success: false
    })
 }
 catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }
}


const getListNotification = async (req, res)=>{
  try {
    
    const listNotification = await User.find({});
    return res.status(201).json({
      message: "Notification successfully update",
      success: true,
      data :listNotification,
    })
  }
  catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }

}
const deleteNotification = async (notification, notificationId, res)=>{
    try {
      const notification = await Notification.findByPk(notificationId);
      if(!notification){
        return res.status(404).json({
          message: "Notification not found. Invalid id of notification",
          success: false
        })
      }
      await Notification.remove(notification)
      return res.status(201).json({
        message: "Notification successfully update",
        success: true
      })
    }
    catch(err){
      return res.status(500).json({
        message: err.message,
        success: false
      })
    }
  }
module.exports= {
  createNotification,
  updateNotification,
  deleteNotification,
  getListNotification,
};