const Joi = require("joi");

const scoreCreateSchema = Joi.object().keys({
  answerFile: Joi.string().required(),
  exerciseId: Joi.string().required(),
  studentId: Joi.string().required(),
  fileExtension: Joi.string(),
  fileName: Joi.string(),
});

const scoreUpdateSchema = Joi.object().keys({
  answerFile: Joi.string(),
  exerciseId: Joi.string(),
  studentId: Joi.string().required(),
  scores: Joi.string(),
  fileExtension: Joi.string(),
  fileName: Joi.string(),
  comment: Joi.string(),
});
module.exports = {
  scoreCreateSchema,
  scoreUpdateSchema,
};
