const Joi = require("joi");

const studentKeyCreateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
});

const studentKeyUpdateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
});
module.exports = {
  studentKeyCreateSchema,
  studentKeyUpdateSchema,
};
