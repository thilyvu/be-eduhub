const Joi = require("joi");

const classCreateSchema = Joi.object().keys({
  name: Joi.string().trim().required(),
  classCode: Joi.required(),
  description: Joi.required(),
  bannerImg: Joi.required(),
  approveMode: Joi.boolean().required(),
  subject: Joi.string().required(),
  grade: Joi.string().required(),
  province: Joi.string(),
});

const classUpdateSchema = Joi.object().keys({
  name: Joi.string().trim().required(),
  isHide: Joi.boolean(),
  description: Joi.string().trim(),
  bannerImg: Joi.string().trim(),
  approveMode: Joi.boolean(),
  subject: Joi.string(),
  grade: Joi.string(),
  province: Joi.string(),
});
const addToClassSchema = Joi.object().keys({
  classId: Joi.string().required(),
  studentId: Joi.string().required(),
});

const addToClassSchemaByEmailAndPhone = Joi.object().keys({
  classId: Joi.string().required(),
  phone: Joi.string(),
  email: Joi.string(),
});
module.exports = {
  classCreateSchema,
  classUpdateSchema,
  addToClassSchema,
  addToClassSchemaByEmailAndPhone,
};
