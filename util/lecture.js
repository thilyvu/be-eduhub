const Lecture = require("../models/lectures");
const Class = require("../models/class");
const {
  lectureCreateSchema,
  lectureUpdateSchema,
} = require("../helper/validation_lecture");
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
const createLecture = async (req, res) => {
  try {
    const result = await lectureCreateSchema.validateAsync(req.body);
    const newLecture = new Lecture({
      ...result,
      createBy: req.user._id,
    });
    const { classId } = result;
    // const lectureNameNotTaken = await lectureNameValidation(result.name);
    // if (!lectureNameNotTaken) {
    // return res.status(400).json({
    //     message: `lecture name have already taken`,
    //     success: false,
    // });
    // }
    const newLectureCreated = await newLecture.save();
    const addedClass = await Class.findOneAndUpdate(
      { _id: classId },
      {
        $push: { lectures: newLectureCreated },
        $set: { updateBy: req.user._id },
      }
    );

    return res.status(201).json({
      message: "New lecture create successful ",
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
const updateLecture = async (req, res) => {
  try {
    const result = await lectureUpdateSchema.validateAsync(req.body);
    const oldLecture = await Lecture.findById(req.params.id);
    // if (result.name !== oldLecture.name) {
    //   const lectureNameNotTaken = await lectureNameValidation(result.name);
    //   if (!lectureNameNotTaken) {
    //     return res.status(400).json({
    //       message: `Lecture name have already taken`,
    //       success: false,
    //     });
    //   }
    // }
    const updateLecture = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedLecture = await Object.assign(oldLecture, updateLecture);
    if (!updatedLecture) return null;
    await updatedLecture.save();
    const lectureId = updatedLecture._id;
    const updateClass = await Class.findOneAndUpdate(
      { _id: oldLecture.classId, "lectures._id": lectureId },
      {
        $set: {
          "lectures.$": updatedLecture,
        },
      }
    );

    return res.status(201).json({
      message: "Lecture update successful ",
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

const lectureNameValidation = async (lecturename) => {
  let oldLecture = await Lecture.findOne({ name: lecturename });
  return oldLecture ? false : true;
};

const getListLecture = async (req, res) => {
  try {
    const features = new APIfeatures(Lecture.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    const listLecture = await features.query;
    const total = await Lecture.countDocuments({});
    return res.status(201).json({
      message: "Get list lecture successful",
      success: true,
      data: listLecture,
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
const getLectureById = async (req, res) => {
  try {
    const likeLecture = await Lecture.findById(req.params.id);
    if (!likeLecture)
      return res.status(400).json({ msg: "Lecture does not exist." });

    res.json({
      status: "success",
      data: likeLecture,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found. Invalid id of lecture",
        success: false,
      });
    }

    const lectureId = lecture._id;
    const classId = lecture.classId;

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: { lectures: { _id: lectureId } },
    });

    await Lecture.remove(lecture);
    return res.status(201).json({
      message: "Lecture successfully deleted",
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
  createLecture,
  updateLecture,
  deleteLecture,
  getListLecture,
  getLectureById,
};
