const Joi = require('joi')

const schoolCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    province :Joi.string().trim().required(),
})

const schoolUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
    province :Joi.string().trim(),
})
module.exports= { 
    schoolCreateSchema,
    schoolUpdateSchema,
}