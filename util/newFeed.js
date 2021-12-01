const NewFeed = require("../models/newFeeds");
const Class = require("../models/class");
const {
  newFeedCreateSchema,
  newFeedUpdateSchema,
} = require("../helper/validation_newFeed");

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
const createNewFeed = async (req, res) => {
  try {
    const result = await newFeedCreateSchema.validateAsync(req.body);
    const { classId } = result;
    const newFeedCreate = new NewFeed({
      ...result,
      createBy: req.user._id,
    });
    const newFeedCreated = await newFeedCreate.save();

    const addedClass = await Class.findOneAndUpdate(
      { _id: classId },
      { $push: { newFeeds: newFeedCreated }, $set: { updateBy: req.user._id } }
    );
    return res.status(201).json({
      message: "NewFeed create successful and added to Class ",
      success: true,
      data: addedClass,
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
const updateNewFeed = async (req, res) => {
  try {
    const result = await newFeedUpdateSchema.validateAsync(req.body);
    const oldNewFeed = await NewFeed.findById(req.params.id);
    const updateNewFeed = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedNewFeed = await Object.assign(oldNewFeed, updateNewFeed);
    if (!updatedNewFeed) return null;
    await updatedNewFeed.save();
    const newFeedId = updatedNewFeed._id;

    const updateClass = await Class.findOneAndUpdate(
      { _id: oldNewFeed.classId, "newFeeds._id": newFeedId },
      {
        $set: {
          "newFeeds.$": updatedNewFeed,
        },
      }
    );
    return res.status(201).json({
      message: "newFeed update successful ",
      success: true,
      data: updateClass,
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

// const lectureNameValidation = async (lecturename) => {
//   let oldLecture = await Lecture.findOne({ name: lecturename });
//   return oldLecture ? false : true;
// };

const getListNewFeed = async (req, res) => {
  try {
    const features = new APIfeatures(NewFeed.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    const listNewFeed = await features.query;
    const total = await NewFeed.countDocuments({});
    return res.status(201).json({
      message: "Get list newfeed successful",
      success: true,
      data: listNewFeed,
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
const getNewFeedById = async (req, res) => {
  try {
    const likeNewFeed = await NewFeed.findById(req.params.id);
    if (!likeNewFeed)
      return res.status(400).json({ msg: "NewFeed does not exist." });

    res.json({
      status: "success",
      data: likeNewFeed,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteNewFeed = async (req, res) => {
  try {
    const newFeed = await NewFeed.findById(req.params.id);
    if (!newFeed) {
      return res.status(404).json({
        message: "NewFeed not found. Invalid id of newFeed",
        success: false,
      });
    }

    const newFeedId = newFeed._id;
    const classId = newFeed.classId;

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: { newFeeds: { _id: newFeedId } },
    });
    await NewFeed.remove(newFeed);
    return res.status(201).json({
      message: "NewFeed successfully deleted",
      success: true,
      data: updatedClass,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
module.exports = {
  createNewFeed,
  updateNewFeed,
  deleteNewFeed,
  getListNewFeed,
  getNewFeedById,
};
