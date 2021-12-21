const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createNewFeed,
  updateNewFeed,
  deleteNewFeed,
  getListNewFeed,
  getNewFeedById,
} = require("../../util/newFeed");
const router = Router();

router.post("/newFeed", userAuth, async (req, res) => {
  await createNewFeed(req, res);
});
router.get("/newFeed", userAuth, async (req, res) => {
  await getListNewFeed(req, res);
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
