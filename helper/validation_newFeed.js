const Joi = require('joi')

const newFeedCreateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    image: Joi.string(),
    classId : Joi.string().required()
})

const newFeedUpdateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    image: Joi.string(),
})
module.exports= { 
    newFeedCreateSchema,
    newFeedUpdateSchema
}