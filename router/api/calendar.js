const { Router } = require("express");
const { userAuth } = require("../../util/auth");
const {
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getListCalendar,
  getCalendarById,
  createClassCalendar,
  getListClassCalendar,
  getListAllCalendar
} = require("../../util/calendar");

const router = Router();

router.post("/calendar", userAuth, async (req, res) => {
  await createCalendar(req, res);
});
router.get("/calendar", userAuth, async (req, res) => {
  await getListCalendar(req, res);
});
router.get("/allCalendar", userAuth, async (req, res) => {
  await getListAllCalendar(req, res);
});
router.post("/classCalendar", userAuth, async (req, res) => {
  await createClassCalendar(req, res);
});
router.get("/calendarById/:id", userAuth, async (req, res) => {
  await getCalendarById(req, res);
});

router.put("/calendar/:id", userAuth, async (req, res) => {
  await updateCalendar(req, res);
});
router.delete("/calendar/:id", userAuth, async (req, res) => {
  await deleteCalendar(req, res);
});
router.get("/classCalendar/:classId", userAuth, async (req, res) => {
  await getListClassCalendar(req, res);
});

module.exports = router;
