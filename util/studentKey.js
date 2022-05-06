const StudentKey = require("../models/studentKey");
const Class = require("../models/class");
const Test = require("../models/test");
var _ = require("lodash");
const {
  studentKeyCreateSchema,
  studentKeyUpdateSchema,
  studentKeyGetByClassAndTestSchema,
} = require("../helper/validation_student_key");
const mongoose = require("mongoose");
const User = require("../models/users");
const Score = require("../models/score");
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
const createStudentKey = async (req, res) => {
  try {
    const result = await studentKeyCreateSchema.validateAsync(req.body);
    var studentKeys = _.cloneDeep(result.listKeys);
    studentKeys = studentKeys.map((studentKey) => {
      return { isCorrect: true, ...studentKey };
    });
    const likeTest = await Test.findById(result.testId).select([
      "-listQuestions",
      "-listAnswers",
    ]);

    let listTopics = _.cloneDeep(likeTest.listTopics);
    var totalCorrect = likeTest.totalQuestions;
    var totalQuestions = likeTest.totalQuestions;
    if (result.status === "started") {
      const newStudentKey = new StudentKey({
        ...result,
        listTopics: listTopics,
        studentId: req.user._id,
        totalCorrect: totalCorrect,
        totalQuestions: totalQuestions,
        createBy: req.user._id,
        studentKeys: studentKeys,
      });
      const newStudentKeyCreated =  await newStudentKey.save();
      return res.status(201).json({
        message: "New student key create successful ",
        success: true,
        totalQuestions: totalQuestions,
        totalCorrect: totalCorrect,
        newStudentKeyCreated: newStudentKeyCreated
      });
    } else {
      likeTest.listKeys.map((key, keyIndex) => {
        if (
          key.replace("[", "").replace("]", "").trim().toLowerCase() !==
          studentKeys[keyIndex].key.trim().toLowerCase()
        ) {
          totalCorrect--;
          studentKeys[keyIndex].isCorrect = false;
        }
      });
      const newStudentKey = new StudentKey({
        ...result,
        listTopics: listTopics,
        studentId: req.user._id,
        totalCorrect: totalCorrect,
        totalQuestions: totalQuestions,
        createBy: req.user._id,
        studentKeys: studentKeys,
      });
      const newStudentKeyCreated = await newStudentKey.save();
      return res.status(201).json({
        message: "New student key create successful ",
        success: true,
        totalQuestions: totalQuestions,
        totalCorrect: totalCorrect,
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
const updateStudentKey = async (req, res) => {
  try {
    const result = await studentKeyUpdateSchema.validateAsync(req.body);
    var studentKeys = _.cloneDeep(result.listKeys);
    studentKeys = studentKeys.map((studentKey) => {
      return { isCorrect: true, ...studentKey };
    });
    const likeTest = await Test.findById(result.testId).select([
      "-listQuestions",
      "-listAnswers",
    ]);
    let listTopics = _.cloneDeep(likeTest.listTopics);
    var totalCorrect = likeTest.totalQuestions;
    var totalQuestions = likeTest.totalQuestions;
    if (result.status !== "started") {
      likeTest.listKeys.map((key, keyIndex) => {
        if (
          key.replace("[", "").replace("]", "").trim().toLowerCase() !==
          studentKeys[keyIndex].key.trim().toLowerCase()
        ) {
          totalCorrect--;
          studentKeys[keyIndex].isCorrect = false;
        }
      });
      const newStudentKey = {
        ...result,
        listTopics: listTopics,
        studentId: req.user._id,
        totalCorrect: totalCorrect,
        totalQuestions: totalQuestions,
        createBy: req.user._id,
        studentKeys: studentKeys,
      };
      const oldStudentKey = await StudentKey.findById(req.params.id);
      if (!oldStudentKey) {
        return res.status(400).json({
          message: `student key id not exist`,
          success: false,
        });
      }
      const updateStudentKey = {
        ...newStudentKey,
        updateBy: req.user.id,
      };
      const updatedStudentKey = await Object.assign(
        oldStudentKey,
        updateStudentKey
      );
      if (!updatedStudentKey) return null;
      await updatedStudentKey.save();
  
      return res.status(201).json({
        message: "student key update successful ",
        success: true,
        data: updatedStudentKey,
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

const getListStudentKey = async (req, res) => {
  try {
    const features = new APIfeatures(StudentKey.find(), req.query)
      .filtering()
      .sorting()
      .paginating();
    const total = await StudentKey.countDocuments({});
    const listStudentKey = await features.query;
    return res.status(201).json({
      message: "Get list student key successful",
      success: true,
      data: listStudentKey,
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

const getStudentKeyByClassAndTestId = async (req, res) => {
  try {
    const result = await studentKeyGetByClassAndTestSchema.validateAsync(
      req.body
    );
    const listStudentKey = await StudentKey.find({
      $and: [
        { classId: mongoose.Types.ObjectId(result.classId) },
        { testId: mongoose.Types.ObjectId(result.testId) },
      ],
    });
    const userIds = listStudentKey.flatMap((studentKey) =>
      mongoose.Types.ObjectId(studentKey.studentId)
    );
    let createdUsers = await User.find({ _id: { $in: userIds } }).select([
      "-classes",
      "-password",
      "-username",
    ]);
    listStudentKey.map((item, index) => {
      item.index = index + 1;
      item.createdUser = createdUsers.find(
        (u) => u._id.toString() === item.studentId
      );
      item.studentKeys.map((key, keyIndex) => {
        let index = keyIndex + 1;
        if (key.questionType === "Multiple choice with more than one answer") {
          index = keyIndex + 2;
        }
        key.index = index;
      });
      return item;
    });
    listStudentKey.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
    return res.status(201).json({
      message: "Get list studentKey successful",
      success: true,
      data: listStudentKey,
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
const getStudentKeyById = async (req, res) => {
  try {
    const likeStudentKey = await StudentKey.findById(req.params.id);
    if (!likeStudentKey)
      return res.status(400).json({ msg: "Student key does not exist." });

    res.json({
      status: "success",
      data: likeStudentKey,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteStudentKey = async (req, res) => {
  try {
    const studentKey = await StudentKey.findById(req.params.id);
    if (!studentKey) {
      return res.status(404).json({
        message: "studentKey not found. Invalid id of studentKey",
        success: false,
      });
    }
    await StudentKey.remove(studentKey);
    return res.status(201).json({
      message: "studentKey successfully deleted",
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
  createStudentKey,
  updateStudentKey,
  deleteStudentKey,
  getListStudentKey,
  getStudentKeyByClassAndTestId,
  getStudentKeyById,
};
