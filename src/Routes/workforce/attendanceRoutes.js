import express from "express";
import { uploadPhoto } from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
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
} from "../controllers/attendanceController.js";

const router = express.Router();

// ── Check In / Out ────────────────────────────────────────────────────────────
router.post("/check-in",          protect, uploadPhoto.single("image"), checkIn);
router.post("/check-in/manager",  protect, checkInManager);
router.post("/check-out",         protect, checkOut);
router.post("/check-out/manager", protect, checkOutManager);

// ── Breaks ────────────────────────────────────────────────────────────────────
router.post("/break/start", protect, applyBreak);
router.post("/break/end",   protect, resumeWork);

// ── Fetch ─────────────────────────────────────────────────────────────────────
router.get("/daily",   protect, getDailyAttendance);
router.get("/monthly", protect, getMonthlyAttendance);
router.get("/:id",     protect, getAttendanceById);

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete("/:id", protect, deleteAttendance);

export default router;

// NOTE: adminAttendanceRoutes.js is merged into this file.
// The old Admin-specific check-in/out logic should be handled
// in the same controller using req.user.systemRole to differentiate.