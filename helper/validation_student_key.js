const Joi = require("joi");

const studentKeyCreateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
  totalCorrect: Joi.string(),
  totalQuestions: Joi.string(),
  status: Joi.string(),
});

const studentKeyUpdateSchema = Joi.object().keys({
  studentId: Joi.string(),
  listKeys: Joi.array(),
  testId: Joi.string(),
  classId: Joi.string(),
  listTopics: Joi.array(),
  totalCorrect: Joi.string(),
  totalQuestions: Joi.string(),
  status: Joi.string(),
});
const studentKeyGetByClassAndTestSchema = Joi.object().keys({
  classId: Joi.string(),
  testId: Joi.string(),
});
const studentKeyGetByClassAndTestAndStudentIdSchema = Joi.object().keys({
  classId: Joi.string(),
  testId: Joi.string(),
  studentId: Joi.string(),
});
module.exports = {
  studentKeyCreateSchema,
  studentKeyUpdateSchema,
  studentKeyGetByClassAndTestSchema,
  studentKeyGetByClassAndTestAndStudentIdSchema,
};
