const { Router } = require("express");
const { userAuth } = require("../../util/auth");

const {
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
} = require("../../util/fileFolder");
const router = Router();

router.post("/file", userAuth, async (req, res) => {
  await createFile(req, res);
});
router.post("/folder", userAuth, async (req, res) => {
  await createFolder(req, res);
});
router.post("/userFolder", userAuth, async (req, res) => {
  await createRootFolderForUser(req, res);
});
router.post("/classFolder", userAuth, async (req, res) => {
  await createRootFolderForClass(req, res);
});
router.put("/file/:id", userAuth, async (req, res) => {
  await updateFile(req, res);
});
router.put("/folder/:id", userAuth, async (req, res) => {
  await updateFolder(req, res);
});
router.get("/getListUserFolder", userAuth, async (req, res) => {
  await getListUserFolder(req, res);
});
router.get("/getListClassFolder/:classId", userAuth, async (req, res) => {
  await getListClassFolder(req, res);
});
router.get("/getSubFolderById/:id", userAuth, async (req, res) => {
  await getSubFolderById(req, res);
});
router.delete("/file/:id", userAuth, async (req, res) => {
  await deleteFileFolder(req, res);
});

module.exports = router;
