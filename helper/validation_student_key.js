const Joi = require("joi");

const studentKeyCreateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
  totalCorrect: Joi.string(),
  totalQuestions: Joi.string(),
});

const studentKeyUpdateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
  totalCorrect: Joi.string(),
  totalQuestions: Joi.string(),
});
const studentKeyGetByClassAndTestSchema = Joi.object().keys({
  classId: Joi.string(),
  testId: Joi.string(),
});
module.exports = {
  studentKeyCreateSchema,
  studentKeyUpdateSchema,
  studentKeyGetByClassAndTestSchema,
};
