const Comment = require("../models/comment");
const NewFeed = require("../models/newFeeds");
const Lecture = require("../models/lectures");
const User = require("../models/users");
const Class = require("../models/class");
const mongoose = require("mongoose");
const Notification = require("../models/notifications");
const {
  commentCreateSchema,
  commentUpdateSchema,
} = require("../helper/validation_comment");
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
const createComment = async (req, res) => {
  try {
    const result = await commentCreateSchema.validateAsync(req.body);
    const newFeedId = result.newFeedId;
    const lectureId = result.lectureId;
    const newComment = new Comment({
      ...result,
      createBy: req.user._id,
    });
    if(newFeedId) {
      const newCommentCreated = await newComment.save();
      const addedNewFeed = await NewFeed.findOneAndUpdate(
        { _id: newFeedId },
        {
          $push: { comments: newCommentCreated },
          $set: { updateBy: req.user._id },
        }
      );
      const oldNewFeed = await NewFeed.findById(
        mongoose.Types.ObjectId(newFeedId)
      );
      const updateClass = await Class.findOneAndUpdate(
        {
          $and: [
            { _id: { $eq: mongoose.Types.ObjectId(addedNewFeed.classId) } },
            {
              "newFeeds._id": { $eq: mongoose.Types.ObjectId(result.newFeedId) },
            },
          ],
        },
        {
          $push: {
            "newFeeds.$.comments": newCommentCreated,
          },
        }
      );
      const oldClass = await Class.findById(
        mongoose.Types.ObjectId(addedNewFeed.classId)
      );
      const newNotification = new Notification({
        title: "Thêm tin bình luận mới ",
        type: "create",
        content: `${req.user.name} vừa thêm 1 bình luân mới`,
        userId: oldNewFeed.createBy,
        metadata: {
          ClassId: addedNewFeed.classId,
          newFeedId: result.newFeedId,
        },
        bannerImg: oldClass.bannerImg,
      });
      await newNotification.save();
      return res.status(201).json({
        message: "New comment create successful ",
        success: true,
        data: updateClass,
      });
    }
    if(lectureId) {
      const newCommentCreated = await newComment.save();
      const addedLecture = await Lecture.findOneAndUpdate(
        { _id: lectureId },
        {
          $push: { comments: newCommentCreated },
          $set: { updateBy: req.user._id },
        }
      );
      const oldLecture = await Lecture.findById(
        mongoose.Types.ObjectId(lectureId)
      );
  
      const updateClass = await Class.findOneAndUpdate(
        {
          $and: [
            { _id: { $eq: mongoose.Types.ObjectId(addedLecture.classId) } },
            {
              "lectures._id": { $eq: mongoose.Types.ObjectId(result.lectureId) },
            },
          ],
        },
        {
          $push: {
            "lectures.$.comments": newCommentCreated,
          },
        }
      );
      const oldClass = await Class.findById(
        mongoose.Types.ObjectId(addedLecture.classId)
      );
      const newNotification = new Notification({
        title: "Thêm tin bình luận mới ",
        type: "create",
        content: `${req.user.name} vừa thêm 1 bình luân mới`,
        userId: oldLecture.createBy,
        metadata: {
          ClassId: addedLecture.classId,
          newFeedId: result.newFeedId,
        },
        bannerImg: oldClass.bannerImg,
      });
      await newNotification.save();
      return res.status(201).json({
        message: "New comment create successful ",
        success: true,
        data: updateClass,
      });
    }

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
const updateComment = async (req, res) => {
  try {
    const result = await commentUpdateSchema.validateAsync(req.body);
    const oldComment = await Comment.findById(req.params.id);
    const updateComment = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedComment = await Object.assign(oldComment, updateComment);
    if (!updatedComment) return null;
    const updatedCommentUserForNewFeed = await updatedComment.save();
    const commentId = updateComment._id;

    const updateNewFeed = await NewFeed.findOneAndUpdate(
      { _id: oldComment.newFeedId, "comments._id": commentId },
      {
        $set: {
          "comments.$": updatedCommentUserForNewFeed,
        },
      }
    );
    return res.status(201).json({
      message: "Comment update successful ",
      success: true,
      data: updateNewFeed,
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

// const calendarNameValidation = async calendarname =>{
//     let oldCalendar = await Calendar.findOne({"name" : calendarname});
//     return oldCalendar ? false: true;
//   }

const getListComment = async (req, res) => {
  try {
    const features = new APIfeatures(Comment.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    let listComment = await features.query;
    const ids = listComment.map((item) => mongoose.Types.ObjectId(item.createBy));
    let user = await User.find({ _id: { $in: ids } });
    listComment = listComment.map((item) => {
      item.createAvatar = user.find(
        (u) => u._id.toString() === item.createBy.toString()
      ).avatar;
      item.createName = user.find(
        (u) => u._id.toString() === item.createBy.toString()
      ).name;

      // item.exerciseName =
      //   exercises.find((u) => {
      //     if (u) {
      //       return u.exerciseId.toString() === item.exerciseId.toString();
      //     }
      //   }).exerciseName || "";
      return item;
    });
    const total = await Comment.countDocuments({});
    return res.status(201).json({
      message: "Get list comment successful",
      success: true,
      data: listComment,
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
const getCommentById = async (req, res) => {
  try {
    const likeComment = await Comment.findById(req.params.id);
    if (!likeComment)
      return res.status(400).json({ msg: "comment does not exist." });

    res.json({
      status: "success",
      data: likeComment,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const deleteComment = await Comment.findById(req.params.id);
    if (!deleteComment) {
      return res.status(404).json({
        message: "Comment not found. Invalid id of comment",
        success: false,
      });
    }

    const commentId = deleteComment._id;
    const newFeedId = deleteComment.newFeedId;
    console.log(commentId, newFeedId);
    const updatedNewFeed = await Class.findByIdAndUpdate(newFeedId, {
      $pull: { comments: { _id: commentId } },
    });
    await Comment.deleteOne(deleteComment);
    return res.status(201).json({
      message: "Comment successfully deleted",
      success: true,
      data: updatedNewFeed,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getListComment,
  getCommentById,
};
