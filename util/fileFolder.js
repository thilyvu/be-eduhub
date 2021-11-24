const FileFolder = require("../models/fileFolder");
const User = require("../models/users");
const Mongoose = require("mongoose");
const {
  fileRegisterSchema,
  fileUpdateSchema,
  folderRegisterSchema,
  folderUpdateSchema,
} = require("../helper/validation_filesFolder");

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
const createFile = async (req, res) => {
  try {
    const fileParentClassId = req.body.parentId;
    const result = await fileRegisterSchema.validateAsync(req.body);
    const classId = result.classId;
    const userId = req.user._id;
    let parentPath;
    let parentId;
    if (!fileParentClassId) {
      // console.log(classId);
      if (classId) {
        const parentClassFolder = await FileFolder.findOne({
          $and: [
            { classId: { $eq: Mongoose.Types.ObjectId(classId) } },
            {
              path: { $eq: null },
            },
          ],
        });
        if (parentClassFolder !== null) {
          parentPath = parentClassFolder.path;
          parentId = parentClassFolder._id;
        }
      } else {
        const parentUserFolder = await FileFolder.findOne({
          userId: Mongoose.Types.ObjectId(userId),
        });
        if (parentUserFolder !== null) {
          parentPath = parentUserFolder.path;
          parentId = parentUserFolder._id;
        }
      }
    } else {
      let rootFolder;
      if (classId) {
        rootFolder = await FileFolder.findOne({
          $and: [
            { classId: { $eq: Mongoose.Types.ObjectId(classId) } },
            {
              _id: { $eq: Mongoose.Types.ObjectId(fileParentClassId) },
            },
          ],
        });
      } else {
        rootFolder = await FileFolder.findOne({
          $and: [
            { userId: { $eq: req.user._id } },
            {
              _id: { $eq: Mongoose.Types.ObjectId(fileParentClassId) },
            },
          ],
        });
      }
      parentPath = rootFolder.path;
    }

    let childPath;
    if (parentPath === null) {
      childPath = `,${parentId},`;
    } else {
      childPath = `${parentPath}${fileParentClassId},`;
    }
    let newFileAdded;
    if (classId) {
      const newFile = new FileFolder({
        ...result,
        path: childPath,
        fileType: "file",
        createBy: req.user._id,
      });
      newFileAdded = await newFile.save();
    } else {
      const newFile = new FileFolder({
        ...result,
        path: childPath,
        fileType: "file",
        userId: req.user._id,
        createBy: req.user._id,
      });
      newFileAdded = await newFile.save();
    }

    return res.status(201).json({
      message: "New File create successful ",
      success: true,
      data: newFileAdded,
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

const createFolder = async (req, res) => {
  try {
    const fileParentClassId = req.body.parentId;

    const result = await folderRegisterSchema.validateAsync(req.body);
    const classId = result.classId;
    const userId = req.user._id;
    let parentPath;
    let parentId;
    if (!fileParentClassId) {
      if (classId) {
        const parentClassFolder = await FileFolder.findOne({
          classId: Mongoose.Types.ObjectId(classId),
        });
        if (parentClassFolder !== null) {
          parentPath = parentClassFolder.path;
          parentId = parentClassFolder._id;
        }
      } else {
        const parentUserFolder = await FileFolder.findOne({
          userId: Mongoose.Types.ObjectId(userId),
        });
        if (parentUserFolder !== null) {
          parentPath = parentUserFolder.path;
          parentId = parentUserFolder._id;
        }
      }
    } else {
      let rootFolder;
      if (classId) {
        rootFolder = await FileFolder.findOne({
          $and: [
            { classId: { $eq: Mongoose.Types.ObjectId(classId) } },
            {
              _id: { $eq: Mongoose.Types.ObjectId(fileParentClassId) },
            },
          ],
        });
      } else {
        rootFolder = await FileFolder.findOne({
          $and: [
            { userId: { $eq: req.user._id } },
            {
              _id: { $eq: Mongoose.Types.ObjectId(fileParentClassId) },
            },
          ],
        });
        // console.log(rootFolder);
      }
      parentPath = rootFolder.path;
    }

    let childPath;
    if (parentPath === null) {
      childPath = `,${parentId},`;
    } else {
      childPath = `${parentPath}${fileParentClassId},`;
    }
    let newFolderAdded;
    if (classId) {
      const newFile = new FileFolder({
        ...result,
        path: childPath,
        fileType: "folder",
        createBy: req.user._id,
      });
      newFolderAdded = await newFile.save();
    } else {
      const newFile = new FileFolder({
        ...result,
        path: childPath,
        fileType: "folder",
        userId: req.user._id,
        createBy: req.user._id,
      });
      newFolderAdded = await newFile.save();
    }

    return res.status(201).json({
      message: "New folder create successful ",
      success: true,
      data: newFolderAdded,
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

const updateFile = async (req, res) => {
  try {
    const result = await fileUpdateSchema.validateAsync(req.body);
    const oldFile = await FileFolder.findById(req.params.id);
    const updateFile = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedFile = await Object.assign(oldFile, updateFile);
    if (!updatedFile) return null;
    await updatedFile.save();
    return res.status(201).json({
      message: "File  update successful ",
      success: true,
      data: updatedFile,
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

const updateFolder = async (req, res) => {
  try {
    const result = await folderUpdateSchema.validateAsync(req.body);
    const oldFile = await FileFolder.findById(req.params.id);
    const updateFile = {
      ...result,
      updateBy: req.user.id,
    };
    const updatedFile = await Object.assign(oldFile, updateFile);
    if (!updatedFile) return null;
    await updatedFile.save();
    return res.status(201).json({
      message: "File  update successful ",
      success: true,
      data: updatedFile,
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

const getListClassFolder = async (req, res) => {
  try {
    const rootClassFolder = await FileFolder.findOne({
      $and: [
        { classId: { $eq: Mongoose.Types.ObjectId(req.params.classId) } },
        {
          path: { $eq: null },
        },
      ],
    });
    const rootFolderId = rootClassFolder._id;
    const term = await FileFolder.find({
      path: new RegExp(`^,${rootFolderId.toString()},$`),
    });
    console.log(new RegExp(`^,${rootFolderId.toString()},$`));
    console.log(term);
    const features = new APIfeatures(
      FileFolder.find({ path: new RegExp(`^,${rootFolderId.toString()},$`) }),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    let listFolder = await features.query;
    listFolder = listFolder.sort((a, b) => {
      if (
        a.fileType.toLowerCase() === "folder" &&
        b.fileType.toLowerCase() === "file"
      ) {
        return -1;
      } else {
        return 1;
      }
    });
    return res.status(201).json({
      message: "Get folder successful",
      success: true,
      data: listFolder,
    });
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(444).json({
        message: err.message,
        success: false,
        data: listFolder,
      });
    }
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const createRootFolderForUser = async (req, res) => {
  const defaultFolderRoot = new FileFolder({
    fileType: "folder",
    path: null,
    userId: req.body.userId,
    createBy: req.user._id,
  });
  await defaultFolderRoot.save();
  return res.status(201).json({
    message: "New File create successful ",
    success: true,
    data: defaultFolderRoot,
  });
};
const createRootFolderForClass = async (req, res) => {
  console.log("in");
  const defaultFolderRoot = new FileFolder({
    fileType: "folder",
    path: null,
    classId: req.body.classId,
    createBy: req.user._id,
  });
  await defaultFolderRoot.save();
  return res.status(201).json({
    message: "New File create successful ",
    success: true,
    data: defaultFolderRoot,
  });
};
const getListUserFolder = async (req, res) => {
  try {
    const rootUserFolder = await FileFolder.findOne({
      $and: [
        { userId: { $eq: req.user._id } },
        {
          path: { $eq: null },
        },
      ],
    });
    const rootFolderId = rootUserFolder._id;
    // console.log(rootFolderId)
    // console.log( `/,${rootFolderId.toString()},/`)
    const features = new APIfeatures(
      FileFolder.find({ path: new RegExp(`^,${rootFolderId.toString()},$`) }),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    let listFolder = await features.query;
    listFolder = listFolder.sort((a, b) => {
      if (
        a.fileType.toLowerCase() === "folder" &&
        b.fileType.toLowerCase() === "file"
      ) {
        return -1;
      } else {
        return 1;
      }
    });
    return res.status(201).json({
      message: "Get list user folder successful",
      success: true,
      data: listFolder,
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

const getSubFolderById = async (req, res) => {
  try {
    const rootFolder = await FileFolder.findById(
      Mongoose.Types.ObjectId(req.params.id)
    );
    const rootFolderId = rootFolder._id;
    const rootFolderPath = rootFolder.path;
    const features = new APIfeatures(
      FileFolder.find({
        path:
          rootFolderPath !== null
            ? new RegExp(
                `^${rootFolderPath.toString()}${rootFolderId.toString()},$`
              )
            : new RegExp(`^,${rootFolderId.toString()},$`),
      }),
      req.query
    )
      .filtering()
      .sorting()
      .paginating();

    let listFolder = await features.query;
    listFolder = listFolder.sort((a, b) => {
      if (
        a.fileType.toLowerCase() === "folder" &&
        b.fileType.toLowerCase() === "file"
      ) {
        return -1;
      } else {
        return 1;
      }
    });
    return res.status(201).json({
      message: "Get list user folder successful",
      success: true,
      data: listFolder,
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
const deleteFileFolder = async (req, res) => {
  try {
    // const deleteFile = await FileFolder.findById(req.params.id);
    const rootFolder = await FileFolder.findById(
      Mongoose.Types.ObjectId(req.params.id)
    );
    const rootFolderId = rootFolder._id;
    const rootFolderPath = rootFolder.path;

    // const listDeleteFile =await FileFolder.find({path : new RegExp(`^${rootFolderPath.toString()}${rootFolderId.toString()},`)});

    if (!rootFolder) {
      return res.status(404).json({
        message: "File folder not found. Invalid id of file folder",
        success: false,
      });
    }
    await FileFolder.deleteOne(rootFolder);
    await FileFolder.deleteMany({
      path: new RegExp(
        `^${rootFolderPath.toString()}${rootFolderId.toString()},`
      ),
    });

    return res.status(201).json({
      message: "File folder successfully deleted",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};
const getAllFileFolder = async (req, res) => {
  try {
    const features = new APIfeatures(FileFolder.find(), req.query)
      .filtering()
      .sorting()
      .paginating();

    let listFolder = await features.query;
    listFolder = listFolder.sort((a, b) => {
      if (
        a.fileType.toLowerCase() === "folder" &&
        b.fileType.toLowerCase() === "file"
      ) {
        return -1;
      } else {
        return 1;
      }
    });
    return res.status(201).json({
      message: "Get list file folder successful",
      success: true,
      data: listFolder,
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
module.exports = {
  createFile,
  createFolder,
  updateFile,
  deleteFileFolder,
  getListClassFolder,
  updateFolder,
  getListUserFolder,
  getSubFolderById,
  createRootFolderForUser,
  createRootFolderForClass,
  getAllFileFolder,
};
