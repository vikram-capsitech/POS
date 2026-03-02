import express from "express";
import { upload } from "../../Middlewares/Multer.middleware.js";
import { protect } from "../../Middlewares/Auth.middleware.js";
import {
  checkIn,
  checkOut,
  checkInManager,
  checkOutManager,
  applyBreak,
  resumeWork,
  getDailyAttendance,
  getMonthlyAttendance,
  getAttendanceById,
  deleteAttendance,
} from "../../Controller/workforce/attendanceController.js";

const router = express.Router();

// ── Check In / Out ────────────────────────────────────────────────────────────
router.post("/check-in", protect, upload.single("selfie"), checkIn);
router.post("/check-in/manager", protect, checkInManager);
router.post("/check-out", protect, checkOut);
router.post("/check-out/manager", protect, checkOutManager);

// ── Breaks ────────────────────────────────────────────────────────────────────
router.post("/break/start", protect, applyBreak);
router.post("/break/end", protect, resumeWork);

// ── Fetch ─────────────────────────────────────────────────────────────────────
router.get("/daily", protect, getDailyAttendance);
router.get("/monthly", protect, getMonthlyAttendance);
router.get("/:id", protect, getAttendanceById);

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete("/:id", protect, deleteAttendance);

export default router;
