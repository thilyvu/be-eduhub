const Joi = require('joi')

const notificationCreateSchema = Joi.object().keys({
  title :Joi.string().trim().required(),
  content: Joi.required(),
  type: Joi.required(),
  userId :Joi.string().trim().required(),
})

const notificationUpdateSchema = Joi.object().keys({
  email :Joi.string().trim().email().required(),
  content: Joi.string().required(),
  type: Joi.required(),
  userId :Joi.string().trim().required(),

})
module.exports= { 
    notificationCreateSchema,
    notificationUpdateSchema
}