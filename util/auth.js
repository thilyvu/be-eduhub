const User = require("../models/users");
const Class = require("../models/class");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/index");
const Mongoose = require("mongoose");
const passport = require("passport");
const FileFolder = require("../models/fileFolder");
const {
  userRegisterSchema,
  userUpdateSchema,
  userUpdatePasswordValidation,
  userResetPasswordValidation,
  userTokenSchema,
} = require("../helper/validation_schema");
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
const userRegister = async (userDets, role, res) => {
  try {
    const result = await userRegisterSchema.validateAsync(userDets);
    let usernameNotTaken = await validateUsername(result.username);
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: `Username have already taken`,
        success: false,
      });
    }
    let emailNotRegistered = await validateEmail(result.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email have already registered`,
        success: false,
      });
    }
    let phoneNotRegistered = await validateUserPhone(result.phone);
    if (!phoneNotRegistered) {
      return res.status(400).json({
        message: `Phone have already registered`,
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(result.password, 12);
    // create new user
    const newUser = new User({
      ...result,
      password: hashedPassword,
      role,
    });
    const createdUser = await newUser.save();

    const defaultFolderRoot = new FileFolder({
      fileType: "folder",
      path: null,
      userId: createdUser._id,
      createBy: createdUser._id,
    });
    await defaultFolderRoot.save();
    return res.status(201).json({
      message:
        "Congratulation , you are successfully registered , please login ",
      success: true,
      data: createdUser,
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
const validateUsername = async (username) => {
  let user = await User.findOne({ username });
  return user ? false : true;
};
const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  return user ? false : true;
};
const validateUserPhone = async (phone) => {
  let user = await User.findOne({ phone });
  return user ? false : true;
};
const updateProfile = async (req, res) => {
  try {
    const result = await userUpdateSchema.validateAsync(req.body);
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return null;
    const updateUser = await Object.assign(oldUser, result);
    const updatedUser = await updateUser.save();

    // need filter for this user before add change to class
    const listClass = await updatedUser.classes;
    if (listClass.length > 0) {
      for (let i = 0; i < listClass.length; i++) {
        await Class.findOneAndUpdate(
          {
            $and: [
              { _id: { $eq: Mongoose.Types.ObjectId(listClass[i].id) } },
              { "students._id": { $eq: req.params.id } },
            ],
          },
          {
            $set: {
              "students.$": updatedUser,
            },
          }
        );
      }
    }
    return res.status(201).json({
      message: "Congratulation , you are successfully update ",
      success: true,
      result: updatedUser,
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
const userLogin = async (userCreds, role, res) => {
  try {
    let { username, password, email } = userCreds;
    const user = await User.findOne({ $or: [{ username }, { email: email }] });
    if (!user) {
      return res.status(404).json({
        message: "Username or email not found. Invalid login credentials",
        success: false,
      });
    }

    // if(user.role !== role){
    //   return res.status(403).json({
    //     message: "Please make sure you login at right portal ",
    //     success: false
    //   })
    // }
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          username: user.username,
          email: user.email,
        },
        SECRET,
        { expiresIn: "2 days" }
      );
      let refreshToken = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          username: user.username,
          email: user.email,
        },
        SECRET,
        { expiresIn: "7 days" }
      );

      let result = {
        username: user.username,
        role: user.role,
        id: user._id,
        avatar: user.avatar,
        email: user.email,
        token: `Bearer ${token}`,
        refreshToken: `Bearer ${refreshToken}`,
        expiresIn: 168,
        name: user.name,
      };
      return res.status(200).json({
        ...result,
        message: " You are logged in",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: " incorrect password",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    let oldRefreshToken = req.body.refreshToken;
    const payload = jwt.verify(oldRefreshToken, SECRET);
    let refreshToken = jwt.sign(
      {
        user_id: payload.user_id,
        role: payload.role,
        username: payload.username,
        email: payload.email,
      },
      SECRET,
      { expiresIn: "2 days" }
    );

    let result = {
      username: payload.username,
      role: payload.role,
      email: payload.email,
      token: `Bearer ${refreshToken}`,
      expiresIn: 168,
    };
    return res.status(200).json({
      result,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const userAuth = passport.authenticate("jwt", { session: false });
const checkRole = (roles) => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

const serializeUser = (user) => {
  return {
    username: user.username,
    email: user.email,
    name: user.name,
    email: user.email,
    DOB: user.DOB,
    gender: user.gender,
    avatar: user.avatar,
    phone: user.phone,
    province: user.province,
    school: user.school,
    role: user.role,
    id: user.id,
  };
};
const resetPassword = async (req, userId, res) => {
  try {
    let newPassword = await userUpdatePasswordValidation.validateAsync(req);
    const { password } = newPassword;
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ _id: userId }, { password: hashedPassword });
    return res.status(201).json({
      message: "Congratulation, your password update success",
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

const updatePassword = async (req, userId, res) => {
  try {
    let Password = await userResetPasswordValidation.validateAsync(req);
    const { oldPassword, newPassword } = Password;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findOne({ _id: userId });
    let isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      await User.findOneAndUpdate(
        { _id: userId },
        { password: hashedPassword }
      );
      return res.status(201).json({
        message: "Congratulation, your password update success",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: " incorrect password",
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
const getListUser = async (req, res) => {
  try {
    console.log(req.query);
    const features = new APIfeatures(User.find().select("-password"), req.query)
      .filtering()
      .sorting()
      .paginating();

    const users = await features.query;
    const total = await User.countDocuments({});
    res.json({
      status: "success",
      result: users.length,
      data: users,
      total: total,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getUserById = async (req, userId, res) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(400).json({ msg: "User does not exist." });

    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    console.log(req.query.email);
    const { email } = req.query.email;
    const user = await User.findOne({ email: email }).select("-password");
    if (!user) return res.status(400).json({ msg: "User does not exist." });

    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
module.exports = {
  userRegister,
  userLogin,
  userAuth,
  updateProfile,
  serializeUser,
  checkRole,
  updatePassword,
  getListUser,
  getUserById,
  getUserByEmail,
  resetPassword,
  refreshToken,
};
