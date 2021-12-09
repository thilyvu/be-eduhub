const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createQuizExercise,
  updateQuizExercise,
  deleteQuizExercise,
  getListQuizExercise,
  getQuizExerciseByClassId,
  getQuizExerciseById,
} = require("../../util/quizExercise");

const router = Router();

router.post("/quizExercise", userAuth, async (req, res) => {
  await createQuizExercise(req, res);
});
router.get("/quizExercise", userAuth, async (req, res) => {
  await getListQuizExercise(req, res);
});
router.get("/quizExerciseById/:id", userAuth, async (req, res) => {
  await getQuizExerciseById(req, res);
});
router.get("/quizExerciseByClassId/:classId", userAuth, async (req, res) => {
  await getQuizExerciseByClassId(req, res);
});
router.put("/quizExercise/:id", userAuth, async (req, res) => {
  await updateQuizExercise(req, res);
});
router.delete("/quizExercise/:id", userAuth, async (req, res) => {
  await deleteQuizExercise(req, res);
});

module.exports = router;
