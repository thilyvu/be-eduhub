const Joi = require('joi')

const commentCreateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    newFeedId : Joi.string(),
    lectureId :Joi.string()
})

const commentUpdateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
})
module.exports= { 
    commentCreateSchema,
    commentUpdateSchema
}