const express = require("express");
const router = express.Router();

const {
    AdmincheckIn,
    AdmincheckOut,
    getAdminDailyAttendance,
    deleteAdminAttendance,
    getAdminMonthlyAttendance,
    getAdminAttendanceById,
} = require("../controllers/adminAttendanceController.js");
const { protect } = require("../middleware/authMiddleware.js");
router.post("/check-in", protect, AdmincheckIn);
router.post("/check-out",protect, AdmincheckOut);
router.get("/daily", protect, getAdminDailyAttendance);
router.get("/monthly", getAdminMonthlyAttendance);
router.delete("/delete/:id", deleteAdminAttendance);
router.get("/:id", getAdminAttendanceById);

module.exports = router;
