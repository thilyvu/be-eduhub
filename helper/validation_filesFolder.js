const Joi = require('joi')

const fileRegisterSchema = Joi.object().keys({
    fileName :Joi.string().trim().required(),
    description :Joi.string().trim(),
    extension :Joi.string().trim().required(),
    fileSize :Joi.number().required(),
    classId :Joi.string().trim(),
    thumbnailUrl :Joi.string().trim(),
    parentId: Joi.string(),
})
const folderRegisterSchema = Joi.object().keys({
    fileName :Joi.string().trim().required(),
    description :Joi.string().trim(),
    classId :Joi.string().trim(),
    thumbnailUrl :Joi.string().trim(), 
    parentId: Joi.string(),
})
const fileUpdateSchema = Joi.object().keys({
    fileName :Joi.string().trim(),
    description :Joi.string().trim(),
    extension :Joi.string().trim(),
    fileSize :Joi.number(),
    thumbnailUrl :Joi.string().trim()
})
const folderUpdateSchema = Joi.object().keys({
    fileName :Joi.string().trim().required(),
    description :Joi.string().trim(),
    thumbnailUrl :Joi.string().trim(),
})
module.exports= { 
    fileRegisterSchema,
    folderRegisterSchema,
    fileUpdateSchema,
    folderUpdateSchema
}