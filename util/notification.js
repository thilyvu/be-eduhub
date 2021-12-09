const Notification = require("../models/notifications");
const {
  notificationCreateSchema,
  notificationUpdateSchema,
} = require("../helper/validation_notification");
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query

    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
const createNotification = async (req, res) => {
  try {
    const result = await notificationCreateSchema.validateAsync(req.body);
    // create new user
    const newNotification = new Notification({
      ...result,
    });
    await newNotification.save();
    return res.status(201).json({
      message: "New notification create successful ",
      success: true,
    });
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(444).json({
        message: err.message,
        success: false,
      });
    }
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const updateNotification = async (req, res) => {
  try {
    const result = await notificationUpdateSchema.validateAsync(req.body);
    const oldNotification = await Notification.findById(req.params.id);
    if (!oldNotification) {
      return res.status(400).json({
        message: `Notification id not exist`,
        success: false,
      });
    }
    const updateNotification = await Object.assign(oldNotification, result);
    const updatedNotification = await updateNotification.save();

    if (updatedNotification) {
      return res.status(201).json({
        message: "Notification successfully update",
        success: true,
      });
    }
    return res.status(400).json({
      message: "Notification update fail",
      success: false,
    });
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(444).json({
        message: err.message,
        success: false,
      });
    }
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const getListNotification = async (req, res) => {
  try {
    const features = new APIfeatures(Notification.find(), req.query)
      .filtering()
      .sorting()
      .paginating();
    const total = await Notification.countDocuments({});
    const listNotification = await features.query;
    return res.status(201).json({
      message: "Notification successfully update",
      success: true,
      data: listNotification,
      total: total,
    });
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(444).json({
        message: err.message,
        success: false,
      });
    }
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const getListPersonalNotification = async (req, res) => {
  try {
    console.log(req.user);
    const features = new APIfeatures(
      Notification.find({ userId: req.user._id }),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();
    const total = await Notification.countDocuments({});
    const listNotification = await features.query;
    return res.status(201).json({
      message: "Get list personal notification successfully",
      success: true,
      data: listNotification,
      total: total,
    });
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(444).json({
        message: err.message,
        success: false,
      });
    }
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found. Invalid id of notification",
        success: false,
      });
    }
    await Notification.remove(notification);
    return res.status(201).json({
      message: "Notification successfully update",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
module.exports = {
  createNotification,
  updateNotification,
  deleteNotification,
  getListNotification,
  getListPersonalNotification,
};
