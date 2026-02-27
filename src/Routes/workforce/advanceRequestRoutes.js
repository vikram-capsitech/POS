import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  createAdvanceRequest,
  getAllAdvanceRequests,
  getAdvanceRequestForEmployee,
  getAdvanceRequestByFilter,
  getAdvanceRequestById,
  approveAdvanceRequest,
  rejectAdvanceRequest,
  getEmployeeTransactionHistory,
  getTransactionHistory,
  creditSalary,
} from "../controllers/advanceRequestController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.post("/",    protect, checkPermission("advance:write"), upload.single("voiceNote"), createAdvanceRequest);
router.get( "/emp", protect, getAdvanceRequestForEmployee);
router.get( "/transactions/:employeeId", protect, getEmployeeTransactionHistory);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.get( "/",                  protect, checkPermission("advance:read"),   getAllAdvanceRequests);
router.post("/filter",            protect, checkPermission("advance:read"),   getAdvanceRequestByFilter);
router.post("/approve/:id",       protect, checkPermission("advance:manage"), approveAdvanceRequest);
router.post("/reject/:id",        protect, checkPermission("advance:manage"), rejectAdvanceRequest);
router.get( "/transactions/all",  protect, checkPermission("payroll:read"),   getTransactionHistory);
router.post("/salary/credit",     protect, checkPermission("payroll:manage"), creditSalary);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, getAdvanceRequestById);

export default router;