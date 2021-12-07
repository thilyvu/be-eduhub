const { Router } = require("express");
const { userAuth, checkRole } = require("../../util/auth");
const {
  createNotification,
  updateNotification,
  deleteNotification,
  getListNotification,
} = require("../../util/notification");
const router = Router();

router.post("/notification", async (req, res) => {
  await createNotification(req, res);
});
router.get("/notification", async (req, res) => {
  await getListNotification(req, res);
});

router.put("/notification/:id", userAuth, async (req, res) => {
  await updateNotification(req, res);
});
router.delete("/notification/:id", userAuth, async (req, res) => {
  await deleteNotification(req, res);
});

module.exports = router;
