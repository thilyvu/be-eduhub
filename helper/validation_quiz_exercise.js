const Joi = require("joi");

const quizExerciseCreateSchema = Joi.object().keys({
  fileUrl: Joi.string().required(),
  exerciseName: Joi.string().required(),
  description: Joi.string(),
  typeOfExams: Joi.string(),
  classId: Joi.string().required(),
  startDate: Joi.date(),
  fileExtension: Joi.string(),
  endDate: Joi.date(),
});

const quizExerciseUpdateSchema = Joi.object().keys({
  examFileUrl: Joi.string(),
  exerciseName: Joi.string(),
  description: Joi.string(),
  fileExtension: Joi.string(),
  disabled: Joi.boolean(),
  typeOfExams: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  isHide: Joi.boolean(),
});
module.exports = {
  quizExerciseCreateSchema,
  quizExerciseUpdateSchema,
};
