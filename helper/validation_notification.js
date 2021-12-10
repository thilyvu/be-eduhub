const Joi = require("joi");

const notificationCreateSchema = Joi.object().keys({
  title: Joi.string().trim().required(),
  content: Joi.string(),
  type: Joi.string(),
  userId: Joi.string().trim().required(),
  metadata: Joi.object(),
  bannerImg: Joi.string(),
});

const notificationUpdateSchema = Joi.object().keys({
  isRead: Joi.boolean(),
  bannerImg: Joi.string(),
  title: Joi.string().trim(),
  content: Joi.string(),
  type: Joi.string(),
});
module.exports = {
  notificationCreateSchema,
  notificationUpdateSchema,
};
