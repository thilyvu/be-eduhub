const Joi = require("joi");

const lectureCreateSchema = Joi.object().keys({
  name: Joi.string().trim().required(),
  bannerImg: Joi.string().required(),
  videoUrl: Joi.string().required(),
  classId: Joi.string().required(),
  fileUrls: Joi.array(),
  content: Joi.string(),
});

const lectureUpdateSchema = Joi.object().keys({
  name: Joi.string().trim().required(),
  bannerImg: Joi.string().required(),
  videoUrl: Joi.string().required(),
  fileUrls: Joi.array(),
  content: Joi.string(),
});
module.exports = {
  lectureCreateSchema,
  lectureUpdateSchema,
};
