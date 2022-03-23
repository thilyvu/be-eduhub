const Joi = require("joi");

const testCreateSchema = Joi.object().keys({
  testName: Joi.string().required(),
  description: Joi.string(),
  startDate: Joi.string(),
  endDate: Joi.string(),
  totalQuestions: Joi.string(),
  totalStudents: Joi.string(),
  totalTopics: Joi.string(),
  listTopics : Joi.array()
});

const testUpdateSchema = Joi.object().keys({
    testName: Joi.string(),
    description: Joi.string(),
    startDate: Joi.string(),
    endDate: Joi.string(),
    totalQuestions: Joi.string(),
    totalStudents: Joi.string(),
    totalTopics: Joi.string(),
    listTopics : Joi.array()
});
module.exports = {
    testCreateSchema,
    testUpdateSchema,
};
