const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createComment,
  updateComment,
  deleteComment,
  getListComment,
  getCommentById,
} = require("../../util/comment");

const router = Router();

router.post("/comment", userAuth, async (req, res) => {
  await createComment(req, res);
});
router.get("/comment", userAuth, async (req, res) => {
  await getListComment(req, res);
});

router.get("/commentById/:id", userAuth, async (req, res) => {
  await getCommentById(req, res);
});

router.put("/comment/:id", userAuth, async (req, res) => {
  await updateComment(req, res);
});
router.delete("/comment/:id", userAuth, async (req, res) => {
  await deleteComment(req, res);
});

module.exports = router;
