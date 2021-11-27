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
  await createNotification(req.body, res);
});
router.get("/notification", async (req, res) => {
  await getListNotification(req.body, res);
});

router.put(
  "/notification/:id",
  userAuth,
  checkRole(["teacher"]),
  async (req, res) => {
    await updateNotification(req.body, req.params.id, res);
  }
);
router.delete(
  "/notification/:id",
  userAuth,
  checkRole(["teacher "]),
  async (req, res) => {
    await deleteNotification(req.body, req.params.id, res);
  }
);

module.exports = router;
