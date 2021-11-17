const Joi = require('joi')

const provinceCreateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})

const provinceUpdateSchema = Joi.object().keys({
    name :Joi.string().trim().required(),
})
module.exports= { 
    provinceCreateSchema,
    provinceUpdateSchema,
}