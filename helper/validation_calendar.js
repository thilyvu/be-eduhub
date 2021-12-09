const Joi = require('joi')

const calendarCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    description: Joi.required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    color : Joi.string().required(),
})

const calendarCreateClassSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    description: Joi.required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    color : Joi.string().required(),
    classId: Joi.string().required()
})

const calendarUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    description: Joi.required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    color : Joi.string().required(),
})
module.exports= { 
    calendarCreateSchema,
    calendarUpdateSchema,
    calendarCreateClassSchema
}