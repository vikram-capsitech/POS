const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getDailyAttendance,
  getMonthlyAttendance,
  deleteAttendance,
  applyBreak,
  resumeWork,
  getAttendanceById,
  checkInManager,
  managerCheckOut
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware.js");
const { uploadPhoto } = require("../config/cloudinary.js");

router.post("/check-in", protect, uploadPhoto.single("image"), checkIn);
router.post("/check-in/manager", protect,checkInManager);
router.post("/check-out", checkOut);
router.post("/check-out/manager", managerCheckOut);


router.post("/break/start", applyBreak);
router.post("/break/end", resumeWork);

router.get("/daily", getDailyAttendance);
router.get("/monthly", getMonthlyAttendance);
router.delete("/delete/:id", deleteAttendance);
router.get("/:id", getAttendanceById);

module.exports = router;
