const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createNewFeed,
  updateNewFeed,
  deleteNewFeed,
  getListNewFeed,
  getNewFeedById,
  pin,
  unPin,
  like,
  unLike
} = require("../../util/newFeed");
const router = Router();

router.post("/newFeed", userAuth, async (req, res) => {
  await createNewFeed(req, res);
});
router.get("/newFeed", userAuth, async (req, res) => {
  await getListNewFeed(req, res);
});
router.post("/pin/:id", userAuth, async (req, res) => {
  await pin(req, res);
});
router.post("/like/:id", userAuth, async (req, res) => {
  await like(req, res);
});
router.post("/unLike/:id", userAuth, async (req, res) => {
  await unLike(req, res);
});
router.post("/unPin/:id", userAuth, async (req, res) => {
  await unPin(req, res);
});
router.get("/newFeedById/:id", userAuth, async (req, res) => {
  await getNewFeedById(req, res);s
});

router.put("/newFeed/:id", userAuth, async (req, res) => {
  await updateNewFeed(req, res);
});
router.delete("/newFeed/:id", userAuth, async (req, res) => {
  await deleteNewFeed(req, res);
});

module.exports = router;
