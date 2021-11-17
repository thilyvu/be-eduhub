const Joi = require('joi')

const scoreCreateSchema = Joi.object().keys({
    answerFile :Joi.string().required(),
    exerciseId: Joi.string().required(),
    studentId : Joi.string().required()
})

const scoreUpdateSchema = Joi.object().keys({
    answerFile :Joi.string(),
    exerciseId: Joi.string(),
    studentId : Joi.string().required(),
    scores : Joi.string()
})
module.exports= { 
    scoreCreateSchema,
    scoreUpdateSchema
}