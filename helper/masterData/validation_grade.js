const Joi = require('joi')

const gradeCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})

const gradeUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})
module.exports= { 
    gradeCreateSchema,
    gradeUpdateSchema,
}