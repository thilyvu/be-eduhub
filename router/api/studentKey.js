const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createStudentKey,
  updateStudentKey,
  deleteStudentKey,
  getListStudentKey,
  getStudentKeyByClassAndTestId,
  getStudentKeyById,
} = require("../../util/studentKey");

const router = Router();

router.post("/studentKey", userAuth, async (req, res) => {
  await createStudentKey(req, res);
});
router.get("/studentKey", userAuth, async (req, res) => {
  await getListStudentKey(req, res);
});
router.get("/studentKeyById/:id", userAuth, async (req, res) => {
  await getStudentKeyById(req, res);
});
router.post("/StudentKeyByClassAndTestId", userAuth, async (req, res) => {
  await getStudentKeyByClassAndTestId(req, res);
});
router.put("/studentKey/:id", userAuth, async (req, res) => {
  await updateStudentKey(req, res);
});
router.delete("/studentKey/:id", userAuth, async (req, res) => {
  await deleteStudentKey(req, res);
});

module.exports = router;
