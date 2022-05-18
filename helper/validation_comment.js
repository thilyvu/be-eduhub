const Joi = require("joi");

const commentCreateSchema = Joi.object().keys({
  content: Joi.string().trim().required(),
  newFeedId: Joi.string(),
  lectureId: Joi.string(),
  fileUrls: Joi.array(),
  imageUrls: Joi.array(),
});

const commentUpdateSchema = Joi.object().keys({
  content: Joi.string().trim().required(),
});
module.exports = {
  commentCreateSchema,
  commentUpdateSchema,
};
