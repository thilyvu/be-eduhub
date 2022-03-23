const Joi = require("joi");

const questionTypeCreateSchema = Joi.object().keys({
  questionTypeName: Joi.string().required(),
  description: Joi.string(),
});

const questionTypeUpdateSchema = Joi.object().keys({
  questionTypeName: Joi.string().required(),
  description: Joi.string(),
  disabled: Joi.boolean(),
});
module.exports = {
  questionTypeCreateSchema,
  questionTypeUpdateSchema,
};
