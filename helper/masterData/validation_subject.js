const Joi = require('joi')

const subjectCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})

const subjectUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})
module.exports= { 
    subjectCreateSchema,
    subjectUpdateSchema,
}