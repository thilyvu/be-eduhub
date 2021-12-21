const Calendar = require("../models/calendar");
const {
  calendarCreateSchema,
  calendarUpdateSchema,
  calendarCreateClassSchema,
} = require("../helper/validation_calendar");
const User = require("../models/users");  
const Class = require("../models/class");
const mongoose = require("mongoose");
const Notification = require("../models/notifications");
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
const createCalendar = async (req, res) => {
  try {
    const result = await calendarCreateSchema.validateAsync(req.body);
    const newCalendar = new Calendar({
      ...result,
      createBy: req.user._id,
    });
    await newCalendar.save();
    return res.status(201).json({
      message: "New calendar create successful ",
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

const createClassCalendar = async (req, res) => {
  try {
    const result = await calendarCreateClassSchema.validateAsync(req.body);
    const newCalendar = new Calendar({
      ...result,
      createBy: req.user._id,
    });
    const oldClass = await Class.findById(
      mongoose.Types.ObjectId(result.classId)
    );
    oldClass.students.forEach(async (student) => {
      const newNotification = new Notification({
        title: "Thêm lịch học mới",
        type: "create",
        content: `Giáo viên vừa thêm lịch học mới ở ${oldClass.name}`,
        userId: student._id,
        metadata: { ClassId: result.classId },
        bannerImg: oldClass.bannerImg,
      });
      await newNotification.save();
    });
    await newCalendar.save();
    return res.status(201).json({
      message: "New class calendar create successful ",
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
const updateCalendar = async (req, res) => {
  try {
    const result = await calendarUpdateSchema.validateAsync(req.body);
    const oldCalendar = await Calendar.findById(req.params.id);
    if (result.name !== oldCalendar.name) {
      let calendarnameNotTaken = await calendarNameValidation(result.name);
      if (!calendarnameNotTaken) {
        return res.status(400).json({
          message: `Calendar name have already taken`,
          success: false,
        });
      }
    }
    const updateCalendar = {
      ...result,
      updateBy: req.user.id,
    };
    if (result.classId) {
      const oldClass = await Class.findById(
        mongoose.Types.ObjectId(result.classId)
      );
      oldClass.students.forEach(async (student) => {
        const newNotification = new Notification({
          title: "Cập nhật lịch học mới",
          type: "Update",
          content: `Giáo viên vừa cập nhật lịch học ở ${oldClass.name}`,
          userId: student._id,
          metadata: { ClassId: result.classId },
          bannerImg: oldClass.bannerImg,
        });
        await newNotification.save();
      });
    }
    const updatedCalendar = await Object.assign(oldCalendar, updateCalendar);
    if (!updatedCalendar) return null;
    await updatedCalendar.save();
    return res.status(201).json({
      message: "Calendar update successful ",
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

const calendarNameValidation = async (calendarname) => {
  let oldCalendar = await Calendar.findOne({ name: calendarname });
  return oldCalendar ? false : true;
};

const getListCalendar = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
    const classIds = student.classes.map((item)=> item._id);
    const features = new APIfeatures(
      Calendar.find({$or: [{ createBy: req.user._id }, {classId : {$in : classIds}}]}),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    const listCalendar = await features.query;
    return res.status(201).json({
      message: "Get list calendar successful",
      success: true,
      data: listCalendar,
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
const getListAllCalendar = async (req, res) => {
  try {
    const features = new APIfeatures(
      Calendar.find(),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    const listCalendar = await features.query;
    const total = await Calendar.countDocuments({});
    return res.status(201).json({
      message: "Get list calendar successful",
      success: true,
      data: listCalendar,
      total: total
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
const getListClassCalendar = async (req, res) => {
  try {
    if (!req.params.classId) {
      return;
    }
    const features = new APIfeatures(
      Calendar.find({ classId: req.params.classId }),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    const listCalendar = await features.query;
    return res.status(201).json({
      message: "Get list calendar successful",
      success: true,
      data: listCalendar,
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
const getCalendarById = async (req, res) => {
  try {
    const likeCalendar = await Calendar.findById(req.params.id);
    if (!likeCalendar)
      return res.status(400).json({ msg: "calendar does not exist." });

    res.json({
      status: "success",
      data: likeCalendar,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteCalendar = async (req, res) => {
  try {
    const calendar = await Calendar.findById(req.params.id);
    if (!calendar) {
      return res.status(404).json({
        message: "Calendar not found. Invalid id of calendar",
        success: false,
      });
    }
    await Calendar.remove(calendar);
    return res.status(201).json({
      message: "Calendar successfully deleted",
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
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getListCalendar,
  getCalendarById,
  createClassCalendar,
  getListClassCalendar,
  getListAllCalendar
};
