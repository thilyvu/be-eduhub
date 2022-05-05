const { Router } = require("express");
const {
  userRegister,
  updatePassword,
  userLogin,
  userAuth,
  serializeUser,
  checkRole,
  updateProfile,
  getListUser,
  getUserById,
  getUserByEmail,
  resetPassword,
  refreshToken,
  deleteUser,
  verifyCode,
  resendEmailVerifiedCode,
  authFacebook
} = require("../../util/auth");
const router = Router();

router.post("/register-user", async (req, res) => {
  await userRegister(req.body, "student", res);
});
router.post("/authFacebook", async (req, res) => {
  await authFacebook(req, res);
});
router.post("/register-teacher", async (req, res) => {
  await userRegister(req.body, "teacher", res);
});
router.post("/register-super-admin", async (req, res) => {
  await userRegister(req.body, "admin", res);
});
router.post("/refresh-token", async (req, res) => {
  await refreshToken(req, res);
});

router.post("/resendMail/:email", async (req, res) => {
  await resendEmailVerifiedCode(req, res);
});
router.post("/verifyCode", async (req, res) => {
  await verifyCode(req, res);
});

router.post("/login-user", async (req, res) => {
  console.log(req.body);
  await userLogin(req.body, "student", res);
});
router.put("/update-profile/:id", userAuth, async (req, res) => {
  await updateProfile(req, res);
});

router.put("/updatePassword/:id", async (req, res) => {
  await updatePassword(req.body, req.params.id, res);
});

router.put("/resetPassword/:id", async (req, res) => {
  await resetPassword(req.body, req.params.id, res);
});
router.post("/logout", (req, res) => {
  req.user = null;
});
router.get(
  "/getListUsers",
  userAuth,
  checkRole(["teacher"]),
  async (req, res) => {
    await getListUser(req, res);
  }
);
router.get("/getUserByEmail/:email", async (req, res) => {
  await getUserByEmail(req, res);
});
router.get(
  "/getUser/:id",
  userAuth,
  checkRole(["teacher"]),
  async (req, res) => {
    await getUserById(req, req.params.id, res);
  }
);
router.get("/getUserEmail/", userAuth, async (req, res) => {
  await getUserByEmail(req.body, res);
});
// router.post('/login-admin', bucketListController.postBucketList)
// router.post('/login-super-admin', bucketListController.postBucketList)
router.get("/profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});
router.get("/user-profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});
router.get(
  "/teacher-profile",
  userAuth,
  checkRole(["teacher"]),
  async (req, res) => {
    return res.json(serializeUser(req.user));
  }
);
router.delete("/deleteUser/:id", userAuth, async (req, res) => {
  await deleteUser(req, res);
});
router.get(
  "/super-admin-profile",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json(serializeUser(req.user));
  }
);

module.exports = router;
