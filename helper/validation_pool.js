const Joi = require('joi')

const poolCreateSchema = Joi.object().keys({
    content :Joi.string().trim().required(),
    options: Joi.array().required(),
    classId : Joi.string().required(),
    type : Joi.string(),
    isBlock : Joi.boolean()
})

const poolUpdateSchema = Joi.object().keys({
    content :Joi.string().trim(),
    options: Joi.array(),
    type: Joi.string(),
    isBlock : Joi.boolean(),

})
module.exports= { 
    poolCreateSchema,
    poolUpdateSchema
}