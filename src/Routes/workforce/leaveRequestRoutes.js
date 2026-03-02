import express from "express";
import { upload } from "../../Middlewares/Multer.middleware.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createLeaveRequest,
  getAllLeaveRequests,
  getAllLeaveRequestsForEmployee,
  getLeaveRequestByFilter,
  getLeaveRequestById,
  getLeaveHistory,
  approveOrRejectLeave,
} from "../../Controller/workforce/leaveRequestController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  checkPermission("leave:write"),
  upload.single("voiceNote"),
  createLeaveRequest,
);
router.get("/emp", protect, getAllLeaveRequestsForEmployee);
router.get("/history/:employeeId", protect, getLeaveHistory);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.get("/", protect, checkPermission("leave:read"), getAllLeaveRequests);
router.post(
  "/filter",
  protect,
  checkPermission("leave:read"),
  getLeaveRequestByFilter,
);
router.put(
  "/approve/:id",
  protect,
  checkPermission("leave:manage"),
  approveOrRejectLeave,
);
router.put(
  "/reject/:id",
  protect,
  checkPermission("leave:manage"),
  approveOrRejectLeave,
);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, getLeaveRequestById);

export default router;
