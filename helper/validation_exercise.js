const Joi = require('joi')

const exerciseCreateSchema = Joi.object().keys({
    examFileUrl :Joi.string().required(),
    exerciseName : Joi.string().required(),
    description: Joi.string(),
    deadline : Joi.date(),
    classId: Joi.string().required(),
    typeOfExams : Joi.string(),
})

const exerciseUpdateSchema = Joi.object().keys({
    examFileUrl :Joi.string(),
    exerciseName : Joi.string(),
    description: Joi.string(),
    deadline : Joi.date(),
    disabled : Joi.boolean(),
    typeOfExams : Joi.string(),
})
module.exports= { 
    exerciseCreateSchema,
    exerciseUpdateSchema
}