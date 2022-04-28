const Joi = require('joi')

const newFeedCreateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    image: Joi.array(),
    classId : Joi.string().required()
})

const newFeedUpdateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    image: Joi.array(),
})
module.exports= { 
    newFeedCreateSchema,
    newFeedUpdateSchema
}