const Exercise = require("../models/exercise");
// const Class = require("../models/class");
const {
  exerciseCreateSchema,
  exerciseUpdateSchema,
} = require("../helper/validation_exercise");
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
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
const createExercise = async (req, res) => {
  try {
    const result = await exerciseCreateSchema.validateAsync(req.body);
    const newExecise = new Exercise({
      ...result,
      createBy: req.user._id,
    });
    console.log(result.exerciseName)
    let exerciseNameNotTaken = await exerciseNameValidation(result.exerciseName);
    if (!exerciseNameNotTaken) {
      return res.status(400).json({
        message: `exerciseName have already taken`,
        success: false,
      });
    }
    const { classId } = result;
    // const lectureNameNotTaken = await lectureNameValidation(result.name);
    // if (!lectureNameNotTaken) {
    // return res.status(400).json({
    //     message: `lecture name have already taken`,
    //     success: false,
    // });
    // }
    const newExerciseCreated = await newExecise.save();
    // const addedClass = await Class.findOneAndUpdate(
    //   { _id: classId },
    //   {
    //     $push: { lectures: newLectureCreated },
    //     $set: { updateBy: req.user._id },
    //   }
    // );

    return res.status(201).json({
      message: "New exercise create successful ",
      success: true,
      data: newExerciseCreated,
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
const updateExercise = async (req, res) => {
  try {
    const result = await exerciseUpdateSchema.validateAsync(req.body);
    const oldExercise = await Exercise.findById(req.params.id);
    // if (result.name !== oldLecture.name) {
    //   const lectureNameNotTaken = await lectureNameValidation(result.name);
    //   if (!lectureNameNotTaken) {
    //     return res.status(400).json({
    //       message: `Lecture name have already taken`,
    //       success: false,
    //     });
    //   }
    // }
    const updateExercise = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedExercise = await Object.assign(oldExercise, updateExercise);
    if (!updatedExercise) return null;
    await updatedExercise.save();
    // const lectureId = updatedLecture._id;
    // const updateClass = await Class.findOneAndUpdate(
    //   { _id: oldLecture.classId, "lectures._id": lectureId },
    //   {
    //     $set: {
    //       "lectures.$": updatedLecture,
    //     },
    //   }
    // );

    return res.status(201).json({
      message: "Exercise update successful ",
      success: true,
      data: updatedExercise,
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

const exerciseNameValidation = async (exercisename) => {
  let oldExercise = await Exercise.findOne({ exerciseName: exercisename });
  return oldExercise ? false : true;
};

const getListExercise = async (req, res) => {
  try {
    const features = new APIfeatures(Exercise.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    const listExercise = await features.query;
    return res.status(201).json({
      message: "Get list exercise successful",
      success: true,
      data: listExercise,
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

const getExerciseByClassId = async (req, res) => {
  try {
    console.log(req.params.classId);
    const features = new APIfeatures(Exercise.find({"classId" :req.params.classId }), req.query)
      .filtering()
      .sorting()
      .paginating();

    let listExercise = await features.query;
    const ids = listExercise.map((item) =>
    mongoose.Types.ObjectId(item.exercisesId)
  );
  
  let scores = await Score.find(
    {
      $and: [
        { studentId: { $eq:  mongoose.Types.ObjectId(req.user._id) } },
        { exercisesId: { $in: ids } },
      ],
    } 
);

listExercise = listExercise.map((item) => {
  const startDate = new Date (item.startDate);
  const endDate = new Date ( item.endDate);
  if(startDate && endDate) {
    item.isHide = Date.now() > startDate && Date.now< endDate ? false : true
  } else 
  {
    item.isHide = true
  }
  return item

});
  listExercise = listExercise.map((item) => {
    item.status = scores.find(
      (u) => u.exercisesId.toString() === item.exercisesId.toString()
    ) ? "Done" : "Not Done";
    return item;
  });
    return res.status(201).json({
      message: "Get list exercise successful",
      success: true,
      data: listExercise,
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
const getExerciseById = async (req, res) => {
  try {
    const likeExercise = await Exercise.findById(req.params.id);
    if (!likeExercise)
      return res.status(400).json({ msg: "Exercise does not exist." });

    res.json({
      status: "success",
      data: likeExercise,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({
        message: "Exercise not found. Invalid id of exercise",
        success: false,
      });
    }
    await Exercise.remove(exercise);
    return res.status(201).json({
      message: "Exercise successfully deleted",
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
    createExercise,
  updateExercise,
  deleteExercise,
  getListExercise,
  getExerciseById,
  getExerciseByClassId
};
