const Class = require("../models/class");
const User = require("../models/users");
const mongoose = require("mongoose");
const Notification = require("../models/notifications");
const FileFolder = require("../models/fileFolder");
const {
  classCreateSchema,
  classUpdateSchema,
  addToClassSchema,
  addToClassSchemaByEmailAndPhone,
} = require("../helper/validation_class");

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

    queryStr = JSON.parse(queryStr);
    // Object.values(queryObj).forEach((item) => {
    //   if (Object.keys(item) == "regex") {
    //     let re = new RegExp(Object.values(item), "i");
    //     // queryStr = re;
    //   }
    // });
    for (const [key, value] of Object.entries(queryObj)) {
      if (Object.keys(value) == "regex") {
        let re = new RegExp(Object.values(value), "i");
        queryStr[key] = {
          $regex: re,
        };
      }
    }
    this.query.find(queryStr);
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
const createClass = async (req, res) => {
  try {
    const result = await classCreateSchema.validateAsync(req.body);
    const newClass = new Class({
      ...result,
      createBy: req.user._id,
    });

    let classnameNotTaken = await classNameValidation(result.name);
    if (!classnameNotTaken) {
      return res.status(400).json({
        message: `Classname have already taken`,
        success: false,
      });
    }
    let classcodeNotTaken = await classCodeValidation(result.classCode);
    if (!classcodeNotTaken) {
      return res.status(400).json({
        message: `Classcode have already taken`,
        success: false,
      });
    }
    const newClassAdded = await newClass.save();

    const defaultFolderRoot = new FileFolder({
      fileType: "folder",
      classId: newClassAdded._id,
      createBy: req.user._id,
    });
    const createdDefaultFolderRoot = await defaultFolderRoot.save();

    const addedClassToUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { classes: newClassAdded },
        $set: { updateBy: req.user._id },
      }
    );

    return res.status(201).json({
      message: "New class create successful ",
      success: true,
      data: addedClassToUser,
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
const classNameValidation = async (classname) => {
  let oldClass = await Class.findOne({ name: classname });
  return oldClass ? false : true;
};
const classCodeValidation = async (classCode) => {
  let oldClass = await Class.findOne({ classCode: classCode });
  return oldClass ? false : true;
};
const updateClass = async (req, res) => {
  try {
    const result = await classUpdateSchema.validateAsync(req.body);
    const oldClass = await Class.findById(req.params.id);
    if (result.name !== oldClass.name) {
      let classnameNotTaken = await classNameValidation(result.name);
      if (!classnameNotTaken) {
        return res.status(400).json({
          message: `Classname have already taken`,
          success: false,
        });
      }
    }
    if (result.classCode !== oldClass.classCode) {
      let classcodeNotTaken = await classCodeValidation(result.classCode);
      if (!classcodeNotTaken) {
        return res.status(400).json({
          message: `Classcode have already taken`,
          success: false,
        });
      }
    }
    const updateClass = {
      ...result,
      updateBy: req.user._id,
    };
    const updatedClass = await Object.assign(oldClass, updateClass);
    if (!updatedClass) return null;
    oldClass.students.forEach(async (student) => {
      const newNotification = new Notification({
        title: "Cập nhật thông tin lớp học",
        type: "update",
        content: `Giáo viên ${req.user.name} vừa cập nhật thông tin lớp học`,
        userId: student._id,
        metadata: { ClassId: req.params.id },
        bannerImg: oldClass.bannerImg,
      });
      await newNotification.save();
    });

    await updatedClass.save();
    const ClassId = updatedClass._id;
    // updatedClass.students.forEach()
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, "classes._id": ClassId },
      {
        $set: {
          "classes.$": updatedClass,
        },
      }
    );

    return res.status(201).json({
      message: "Class update successful ",
      success: true,
      data: updatedUser,
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

const joinClass = async (req, res) => {
  try {
    const oldClass = await Class.findById(req.params.id);
    const student = await User.findById(req.user._id).select([
      "-classes",
      "-password",
      "-username",
    ]);
    if (student.role == "teacher") {
      return res.status(400).json({
        message: "Invalid role, teacher are not allow to join",
        success: false,
      });
    } else {
      let isExisted = false;
      if (!oldClass.approveMode) {
        oldClass.students.forEach((student) => {
          if (student._id.toString() === req.user._id.toString()) {
            isExisted = true;
            return res.status(400).json({
              message: "Already in this class",
              success: false,
            });
          }
        });
        if (!isExisted) {
          const addedStudentToClass = await Class.findOneAndUpdate(
            { _id: req.params.id },
            {
              $push: { students: student },
              $set: { updateBy: req.user._id },
            }
          );
          const updatedClass = await Object.assign(
            oldClass,
            addedStudentToClass
          );
          if (!updatedClass) return null;

          const updateClassForUser = await updatedClass.save();
          const ClassId = oldClass._id;
          oldClass.students.forEach(async (student) => {
            await User.findOneAndUpdate(
              { _id: student._id, "classes._id": ClassId },
              {
                $set: {
                  "classes.$": updateClassForUser,
                },
              }
            );
          });
          oldClass.students.forEach(async (student) => {
            const newNotification = new Notification({
              title: "Tham gia lớp học",
              type: "create",
              content: `Học sinh ${req.user.name} vừa tham gia ${oldClass.name}`,
              userId: student._id,
              metadata: { ClassId: req.params.id },
              bannerImg: oldClass.bannerImg,
            });
            await newNotification.save();
          });
          const newNotification = new Notification({
            title: "Tham gia lớp học",
            type: "create",
            content: `Học sinh ${req.user.name} vừa tham gia ${oldClass.name} của bạn`,
            userId: oldClass.createBy,
            metadata: { ClassId: req.params.id },
            bannerImg: oldClass.bannerImg,
          });
          await newNotification.save();
          // add class to student profile
          await User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $push: { classes: updateClassForUser },
            }
          );
          return res.status(201).json({
            message: "Join class successful ",
            success: true,
            data: updateClassForUser,
          });
        }
      } else {
        oldClass.awaitStudents.forEach((student) => {
          if (student._id.toString() === req.user._id.toString()) {
            isExisted = true;
            return res.status(400).json({
              message: "Already send request to join this class",
              success: false,
            });
          }
        });
        if (!isExisted) {
          const addedStudentToClassWithApprove = await Class.findOneAndUpdate(
            { _id: req.params.id },
            {
              $push: { awaitStudents: student },
              $set: { updateBy: req.user._id },
            }
          );
          const updatedClass = await Object.assign(
            oldClass,
            addedStudentToClassWithApprove
          );
          if (!updatedClass) return null;

          const ClassId = oldClass._id;
          const updateClassForUserWith = await updatedClass.save();

          oldClass.students.forEach(async (student) => {
            await User.findOneAndUpdate(
              { _id: student._id, "classes._id": ClassId },
              {
                $set: {
                  "classes.$": updateClassForUserWith,
                },
              }
            );
          });
          // update class in user profile
          const newNotification = new Notification({
            title: "Yêu cầu tham gia lớp học",
            type: "create",
            content: `Học sinh ${req.user.name} vừa gửi yêu cầu tham gia ${oldClass.name} của bạn`,
            userId: oldClass.createBy,
            metadata: { ClassId: req.params.id },
            bannerImg: oldClass.bannerImg,
          });
          await newNotification.save();
          return res.status(201).json({
            message: "Send request to class successful ",
            success: true,
            data: updateClassForUserWith,
          });
        }
      }
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

const approveToClass = async (req, res) => {
  try {
    const result = await addToClassSchema.validateAsync(req.body);
    const studentId = result.studentId;
    const classId = result.classId;
    const oldClass = await Class.findById(mongoose.Types.ObjectId(classId));
    if (req.user._id.toString() !== oldClass.createBy.toString()) {
      return res.status(404).json({
        message: "You dont have permission to approve student to this class ",
        success: true,
      });
    } else {
      const student = await User.findById(
        mongoose.Types.ObjectId(studentId)
      ).select(["-classes", "-password", "-username"]);
      if (!student) {
        return res.status(404).json({
          message: "Student id invalid ",
          success: true,
        });
      } else {
        if (student.role == "teacher") {
          return res.status(400).json({
            message: "Invalid role, teacher are not allow to join",
            success: false,
          });
        } else {
          let isExisted = false;

          oldClass.students.forEach((student) => {
            if (student._id.toString() === studentId.toString()) {
              isExisted = true;
              return res.status(400).json({
                message: "Already in this class",
                success: false,
              });
            }
          });

          if (!isExisted) {
            oldClass.students.forEach(async (stu) => {
              const newNotification = new Notification({
                title: "Cập nhật thông tin lớp học",
                type: "update",
                content: `Học sinh ${student.name} vừa được duyệt vào ${oldClass.name}`,
                userId: stu._id,
                metadata: { ClassId: result.classId },
                bannerImg: oldClass.bannerImg,
              });
              await newNotification.save();
            });
            // add student to list student
            const addedStudentToClass = await Class.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(classId) },
              {
                $push: { students: student },
                $set: { updateBy: req.user._id },
              }
            );
            const newNotification = new Notification({
              title: "Duyệt yêu cầu tham gia lớp học",
              type: "update",
              content: `Chúc mừng bạn vừa được duyệt vào ${oldClass.name}`,
              userId: student._id,
              metadata: { ClassId: result.classId },
              bannerImg: oldClass.bannerImg,
            });
            await newNotification.save();
            // remove student out of awaitstudents list
            const removedStudent = await Class.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(classId) },
              {
                $pull: {
                  awaitStudents: { _id: mongoose.Types.ObjectId(student._id) },
                },
                $set: { updateBy: req.user._id },
              }
            );

            const updatedClass = await Object.assign(
              oldClass,
              addedStudentToClass
            );
            if (!updatedClass) return null;
            // add class to student
            await User.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(studentId) },
              {
                $push: { classes: updatedClass },
              }
            );

            const updateClassForUser = await updatedClass.save();

            oldClass.students.forEach(async (student) => {
              await User.findOneAndUpdate(
                {
                  _id: student._id,
                  "classes._id": mongoose.Types.ObjectId(classId),
                },
                {
                  $set: {
                    "classes.$": updateClassForUser,
                  },
                }
              );
            });
            return res.status(201).json({
              message: "Student approved to class ",
              success: true,
            });
          }
        }
      }
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
const addStudentToClass = async (req, res) => {
  try {
    const result = await addToClassSchemaByEmailAndPhone.validateAsync(
      req.body
    );
    const email = result.email;
    const phone = result.phone;
    const classId = result.classId;
    let student;
    if (email) {
      student = await User.findOne({ email: email }).select([
        "-classes",
        "-password",
        "-username",
      ]);
    } else {
      student = await User.findOne({ phone: phone }).select([
        "-classes",
        "-password",
        "-username",
      ]);
    }
    if (!student) {
      return res.status(404).json({
        message: "Invalid student",
        success: false,
      });
    } else {
      if (student.role == "teacher") {
        return res.status(400).json({
          message: "Invalid role, teacher are not allow to join",
          success: false,
        });
      } else {
        const studentId = student.id;

        const oldClass = await Class.findById(mongoose.Types.ObjectId(classId));
        oldClass.students.forEach((student) => {
          if (student._id.toString() === studentId.toString()) {
            return res.status(400).json({
              message: "Already in this class",
              success: false,
            });
          }
        });
        oldClass.students.forEach(async (stu) => {
          const newNotification = new Notification({
            title: "Thêm học sinh vào lớp học",
            type: "update",
            content: `Học sinh ${student.name} vừa được thêm vào ${oldClass.name}`,
            userId: stu._id,
            metadata: { ClassId: result.classId },
            bannerImg: oldClass.bannerImg,
          });
          await newNotification.save();
        });
        const newNotification = new Notification({
          title: "Thêm vào lớp học",
          type: "update",
          content: `Chúc mừng vừa được thêm vào  ${oldClass.name}`,
          userId: student._id,
          metadata: { ClassId: result.classId },
          bannerImg: oldClass.bannerImg,
        });
        await newNotification.save();
        // add student to list student
        const addedStudentToClass = await Class.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(classId) },
          {
            $push: { students: student },
            $set: { updateBy: req.user._id },
          }
        );
        // remove student out of awaitstudents list
        await Class.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(classId) },
          {
            $pull: { awaitStudents: student },
            $set: { updateBy: req.user._id },
          }
        );
        const updatedClass = await Object.assign(oldClass, addedStudentToClass);
        if (!updatedClass) return null;
        // add class to student
        await User.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(studentId) },
          {
            $push: { classes: updatedClass },
          }
        );

        const updateClassForUser = await updatedClass.save();
        // update class to old student to list student
        oldClass.students.forEach(async (student) => {
          await User.findOneAndUpdate(
            {
              _id: student._id,
              "classes._id": mongoose.Types.ObjectId(classId),
            },
            {
              $set: {
                "classes.$": updateClassForUser,
              },
            }
          );
        });
        return res.status(201).json({
          message: "Student added to class ",
          success: true,
        });
      }
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
const getListClassByStudentId = async (req, res) => {
  try {
    const features = new APIfeatures(
      Class.find({
        $or: [
          {
            "students._id": mongoose.Types.ObjectId(req.user._id),
          },
          { createBy: req.user._id },
        ],
      }).select([
        "-approveMode",
        "-newFeeds",
        "-calendars",
        "-students",
        "-lectures",
        "-fileFolder",
        "-exercise",
      ]),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    const listClass = await features.query;
    // const listClass = await Class.find({
    //   $or: [
    //     ({
    //       "students._id": mongoose.Types.ObjectId(req.user._id),
    //     },
    //     { createBy: req.user._id }),
    //   ],
    // });
    return res.status(201).json({
      message: "Get list class success ",
      success: true,
      data: listClass,
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
const leaveClass = async (req, res) => {
  try {
    const oldClass = await Class.findById(req.params.id);
    const studentId = req.user._id;
    let isExisted = false;
    oldClass.students.forEach((student) => {
      if (student._id.toString() === studentId.toString()) {
        isExisted = true;
      }
    });
    if (isExisted) {
      const removedStudentOutOfClass = await Class.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { students: { _id: req.user._id } },
          $set: { updateBy: req.user._id },
        }
      );
      const updatedClass = await Object.assign(
        oldClass,
        removedStudentOutOfClass
      );
      oldClass.students.forEach(async (student) => {
        const newNotification = new Notification({
          title: "Rời lớp học",
          type: "update",
          content: `Học sinh ${req.user.name} vừa rời khỏi ${oldClass.name}`,
          userId: student._id,
          metadata: { ClassId: req.params.id },
          bannerImg: oldClass.bannerImg,
        });
        await newNotification.save();
      });
      const updateClassForUser = await updatedClass.save();

      /// updateClassForUser need filter remove list student && await + data excercise + document
      if (!updateClassForUser) return null;
      const ClassId = oldClass._id;

      oldClass.students.forEach(async (student) => {
        await User.findOneAndUpdate(
          { _id: student._id, "classes._id": ClassId },
          {
            $set: {
              "classes.$": updateClassForUser,
            },
          }
        );
      });
      // delete class out of curent user
      await User.findOneAndUpdate(
        { _id: req.user._id, "classes._id": ClassId },
        {
          $set: {
            "classes.$": updateClassForUser,
          },
        }
      );
      return res.status(201).json({
        message: "Leave class successful ",
        success: true,
      });
    } else {
      return res.status(400).json({
        message: "Not in this class",
        success: false,
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

const deleteStudentFromClass = async (req, res) => {
  try {
    const result = await addToClassSchema.validateAsync(req.body);
    const studentId = result.studentId;
    const classId = result.classId;
    const oldClass = await Class.findById(mongoose.Types.ObjectId(classId));
    const removedStudentOutOfClass = await Class.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(classId) },
      {
        $pull: { students: { _id: mongoose.Types.ObjectId(studentId) } },
        $set: { updateBy: req.user._id },
      }
    );
    const updatedClass = await Object.assign(
      oldClass,
      removedStudentOutOfClass
    );
    const updateClassForUser = await updatedClass.save();

    /// updateClassForUser need filter remove list student && await + data excercise + document
    if (!updateClassForUser) return null;

    oldClass.students.forEach(async (student) => {
      await User.findOneAndUpdate(
        { _id: student._id, "classes._id": mongoose.Types.ObjectId(classId) },
        {
          $set: {
            "classes.$": updateClassForUser,
          },
        }
      );
    });
    // delete class out of curent user
    await User.findByIdAndUpdate(mongoose.Types.ObjectId(studentId), {
      $pull: { classes: { _id: mongoose.Types.ObjectId(classId) } },
    });
    return res.status(201).json({
      message: "Remove student successful ",
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

const getClassById = async (req, res) => {
  try {
    const listClass = await Class.findOne({ _id: req.params.id }).select([
      "-calendars",
      "-fileFolder",
      "-exercise",
    ]);
    if (listClass.lectures) {
      listClass.lectures = listClass.lectures.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    if (listClass.newFeeds) {
      listClass.newFeeds = listClass.newFeeds.sort(
        (a, b) =>  b.createdAt.getTime() - a.createdAt.getTime() 
      );
      listClass.newFeeds = listClass.newFeeds.sort(
        (value) =>  value.pin ? -1 : 1 
      );
    }

    const ids = listClass.newFeeds
      ? listClass.newFeeds.map((item) => mongoose.Types.ObjectId(item.createBy))
      : [];
    let user = await User.find({ _id: { $in: ids } });
    if (listClass.newFeeds) {
      listClass.newFeeds = listClass.newFeeds.map((item) => {
        item.createAvatar = user.find(
          (u) => u._id.toString() === item.createBy
        ).avatar;
        item.createName = user.find(
          (u) => u._id.toString() === item.createBy
        ).name;
        if (item.likes) {
          item.totalLikes = item.likes ? item.likes.length : 0;
          item.isLiked = false;
          item.likes.map((element) => {
            if (element.toString() === req.user._id.toString()) {
              item.isLiked = true;
            }
          });
        }

        return item;
      });
    }

    const commentIds = listClass.newFeeds
      ? listClass.newFeeds.flatMap((newFeed) =>
          newFeed.comments.map((comment) =>
            mongoose.Types.ObjectId(comment.createBy)
          )
        )
      : [];
    const lectureIds = listClass.lectures
      ? listClass.lectures.flatMap((lecture) => {
          return lecture.comments
            ? lecture.comments.map((comment) => {
                return mongoose.Types.ObjectId(comment.createBy);
              })
            : [];
        })
      : [];
    let commentUsers = await User.find({ _id: { $in: commentIds } });
    listClass.newFeeds = listClass.newFeeds
      ? listClass.newFeeds.map((newFeed) => {
          newFeed.comments = newFeed.comments
            ? newFeed.comments.map((comment) => {
                comment.createAvatar = commentUsers.find(
                  (u) => u._id.toString() === comment.createBy
                ).avatar;
                comment.createName = commentUsers.find(
                  (u) => u._id.toString() === comment.createBy
                ).name;
                return comment;
              })
            : [];
          return newFeed;
        })
      : [];
    let commentLectureUsers = await User.find({ _id: { $in: lectureIds } });
    listClass.lectures = listClass.lectures
      ? listClass.lectures.map((lecture) => {
          if (lecture.comments) {
            lecture.comments = lecture.comments
              ? lecture.comments.map((comment) => {
                  comment.createAvatar = commentLectureUsers.find(
                    (u) => u._id.toString() === comment.createBy
                  ).avatar;
                  comment.createName = commentLectureUsers.find(
                    (u) => u._id.toString() === comment.createBy
                  ).name;
                  return comment;
                })
              : [];
          }

          return lecture;
        })
      : [];
    if (!listClass)
      return res.status(400).json({ msg: "Class does not exist." });

    res.json({
      status: "success",
      data: listClass,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getClassByClassCode = async (req, res) => {
  try {
    const classCodeNeedToFind = req.params.classCode;
    const classFinded = await Class.findOne({
      classCode: { $regex: new RegExp(classCodeNeedToFind, "i") },
    });
    if (!classFinded)
      return res.status(400).json({ msg: "Class does not exist." });

    res.json({
      status: "success",
      data: classFinded,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getListClass = async (req, res) => {
  try {
    const features = new APIfeatures(
      Class.find().select([
        "-newFeeds",
        "-calendars",
        "-students",
        "-lectures",
        "-fileFolder",
        "-exercise",
      ]),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();
    const total = await Class.countDocuments({});
    const listClass = await features.query;
    return res.status(201).json({
      message: "Get list class successful",
      success: true,
      data: listClass,
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
const deleteClass = async (req, res) => {
  try {
    const deleteClass = await Class.findById(req.params.id);
    if (deleteClass.createBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        message: "You dont have permission to delete this class",
        success: false,
      });
    }
    if (!deleteClass) {
      return res.status(404).json({
        message: "Class not found. Invalid id of Class",
        success: false,
      });
    }
    const listUser = deleteClass.students;
    const classId = deleteClass._id;
    // delete class out of student profile
    listUser.forEach(async (student) => {
      await User.findByIdAndUpdate(student._id, {
        $pull: { classes: { _id: classId } },
      });
    });
    deleteClass.students.forEach(async (student) => {
      const newNotification = new Notification({
        title: "Xóa lớp học",
        type: "delete",
        content: `${deleteClass.name} vừa bị xóa `,
        userId: student._id,
        metadata: { ClassId: req.params.id },
        bannerImg: deleteClass.bannerImg,
      });
      await newNotification.save();
    });
    // delete class out of create user
    await User.findByIdAndUpdate(
      mongoose.Types.ObjectId(deleteClass.createBy),
      {
        $pull: { classes: { _id: classId } },
      }
    );
    await Class.deleteOne(deleteClass);
    return res.status(201).json({
      message: "Class successfully deleted",
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
  createClass,
  updateClass,
  deleteClass,
  getListClass,
  getClassById,
  getClassByClassCode,
  joinClass,
  leaveClass,
  approveToClass,
  addStudentToClass,
  deleteStudentFromClass,
  getListClassByStudentId,
};
