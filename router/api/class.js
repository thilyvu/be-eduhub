const { Router } = require("express");
const { userAuth, checkRole } = require("../../util/auth");
const {
  createClass,
  updateClass,
  deleteClass,
  getListClass,
  getClassById,
  joinClass,
  leaveClass,
  getClassByClassCode,
  approveToClass,
  deleteStudentFromClass,
  addStudentToClass,
  getListClassByStudentId,
} = require("../../util/class");
const router = Router();

router.post("/class", userAuth,checkRole(["teacher"]), async (req, res) => {
  await createClass(req, res);
});
router.post("/joinClass/:id", userAuth, async (req, res) => {
  await joinClass(req, res);
});

router.post("/leaveClass/:id", userAuth, async (req, res) => {
  await leaveClass(req, res);
});

router.post("/aproveToClass", userAuth, async (req, res) => {
  await approveToClass(req, res);
});
router.post("/deleteStudentFromClass", userAuth, async (req, res) => {
  await deleteStudentFromClass(req, res);
});

router.post("/addStudentToClass", userAuth, async (req, res) => {
  await addStudentToClass(req, res);
});
// router.post("/leaveClass", userAuth, async (req, res) => {
//   await createClass(req, res);
// });
router.get("/class", userAuth, async (req, res) => {
  await getListClass(req, res);
});
router.get("/classByUserId", userAuth, async (req, res) => {
  await getListClassByStudentId(req, res);
});

router.get("/classById/:id", userAuth, async (req, res) => {
  await getClassById(req, res);
});

router.get("/classByClassCode/:classCode", userAuth, async (req, res) => {
  await getClassByClassCode(req, res);
});

router.put("/class/:id", userAuth, async (req, res) => {
  await updateClass(req, res);
});
router.delete(
  "/class/:id",
  userAuth,
  async (req, res) => {
    await deleteClass(req, res);
  }
);

module.exports = router;
