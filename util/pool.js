const Pool = require("../models/pools");
const Class = require("../models/class");
const {
  poolCreateSchema,
  poolUpdateSchema,
} = require("../helper/validation_pool");
const mongoose = require("mongoose");
const Notification = require("../models/notifications");
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );
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
const createPool = async (req, res) => {
  try {
    const result = await poolCreateSchema.validateAsync(req.body);
    const newPool = new Pool({
      ...result,
      createBy: req.user._id,
    });
    const { classId } = result;
    const oldClass = await Class.findById(
      mongoose.Types.ObjectId(result.classId)
    );
    oldClass.students.forEach(async (student) => {
      const newNotification = new Notification({
        title: "Thêm cuộc thăm dò mới ",
        type: "create",
        content: `Giáo viên vừa thêm cuộc thăm dò ${result.name} mới ở ${oldClass.name}`,
        userId: student._id,
        metadata: { ClassId: result.classId },
        bannerImg: oldClass.bannerImg,
      });
      await newNotification.save();
    });
    const newPoolCreated = await newPool.save();
    const addedClass = await Class.findOneAndUpdate(
      { _id: classId },
      {
        $push: { pools: newPoolCreated },
        $set: { updateBy: req.user._id },
      }
    );

    return res.status(201).json({
      message: "New pool create successful ",
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
const updatePool = async (req, res) => {
  try {
    const result = await poolUpdateSchema.validateAsync(req.body);
    const oldPool = await Pool.findById(req.params.id);
    const updatePool = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedPool = await Object.assign(oldPool, updatePool);
    if (!updatedPool) return null;
    await updatedPool.save();
    const poolId = updatedPool._id;
    const updateClass = await Class.findOneAndUpdate(
      { _id: oldPool.classId, "pools._id": poolId },
      {
        $set: {
          "pools.$": updatedPool,
        },
      }
    );

    return res.status(201).json({
      message: "Pool update successful ",
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


const getListPool = async (req, res) => {
  try {
    const features = new APIfeatures(Pool.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    const listPool = await features.query;
    const total = await Pool.countDocuments({});
    return res.status(201).json({
      message: "Get list pool successful",
      success: true,
      data: listPool,
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
const getPoolById = async (req, res) => {
  try {
    const likePool = await Pool.findById(req.params.id);
    if (!likePool)
      return res.status(400).json({ msg: "Pool does not exist." });

    res.json({
      status: "success",
      data: likePool,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deletePool = async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id);
    if (!pool) {
      return res.status(404).json({
        message: "Pool not found. Invalid id of Pool",
        success: false,
      });
    }

    const poolId = pool._id;
    const classId = pool.classId;

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: { pools: { _id: poolId } },
    });

    await Pool.remove(pool);
    return res.status(201).json({
      message: "Pool successfully deleted",
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
  createPool,
  updatePool,
  deletePool,
  getListPool,
  getPoolById,
};
