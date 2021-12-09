const Joi = require('joi')

const lectureCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    description: Joi.string().required(),
    bannerImg: Joi.string().required(),
    videoUrl: Joi.string().required(),
    classId : Joi.string().required()
})

const lectureUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    description: Joi.string().required(),
    bannerImg: Joi.string().required(),
    videoUrl: Joi.string().required(),
})
module.exports= { 
    lectureCreateSchema,
    lectureUpdateSchema
}