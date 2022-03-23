const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
    createTest,
    updateTest,
    deleteTest,
    getListTest,
    getTestById,
} = require("../../util/test");

const router = Router();

router.post("/test", userAuth, async (req, res) => {
  await createTest(req, res);
});
router.get("/test", userAuth, async (req, res) => {
  await getListTest(req, res);
});
router.get("/testById/:id", userAuth, async (req, res) => {
  await getTestById(req, res);
});
router.put("/test/:id", userAuth, async (req, res) => {
  await updateTest(req, res);
});
router.delete("/test/:id", userAuth, async (req, res) => {
  await deleteTest(req, res);
});

module.exports = router;
