const Joi = require("joi");

const testCreateSchema = Joi.object().keys({
  testName: Joi.string().required(),
  testDescription: Joi.string(),
  startDate: Joi.string(),
  endDate: Joi.string(),
  totalQuestions: Joi.string(),
  totalStudents: Joi.string(),
  totalTopics: Joi.string(),
  listTopics: Joi.array(),
  totalQuestions: Joi.string(),
  listQuestions: Joi.array(),
  listKeys: Joi.array(),
  isShowPoint: Joi.boolean(),
  listAnswers: Joi.array(),
  countDownTime: Joi.date(),
});

const testUpdateSchema = Joi.object().keys({
  testName: Joi.string(),
  testDescription: Joi.string(),
  startDate: Joi.string(),
  endDate: Joi.string(),
  totalQuestions: Joi.string(),
  totalStudents: Joi.string(),
  totalTopics: Joi.string(),
  listTopics: Joi.array(),
  listQuestions: Joi.array(),
  listKeys: Joi.array(),
  isShowPoint: Joi.boolean(),
  listAnswers: Joi.array(),
  countDownTime: Joi.date(),
});
const testUpdateClassSchema = Joi.object().keys({
  classIds: Joi.array(),
});
const testRemoveClassSchema = Joi.object().keys({
  classId: Joi.string().required(),
  testId: Joi.string().required(),
});
module.exports = {
  testCreateSchema,
  testUpdateSchema,
  testUpdateClassSchema,
  testRemoveClassSchema,
};
