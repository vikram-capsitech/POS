import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createAdvanceRequest,
  getAllAdvanceRequests,
  getMyAdvanceRequests,
  getAdvanceRequestsByFilter,
  getAdvanceRequestById,
  approveAdvanceRequest,
  rejectAdvanceRequest,
  getEmployeeTransactionHistory,
  getOrgTransactionHistory,
  creditSalary,
} from "../../Controller/workforce/Advancerequestcontroller.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  checkPermission("advance:write"),
  upload.single("voiceNote"),
  createAdvanceRequest,
);
router.get("/emp", protect, getMyAdvanceRequests);
router.get("/transactions/:employeeId", protect, getEmployeeTransactionHistory);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.get(
  "/",
  protect,
  checkPermission("advance:read"),
  getAllAdvanceRequests,
);
router.post(
  "/filter",
  protect,
  checkPermission("advance:read"),
  getAdvanceRequestsByFilter,
);
router.post(
  "/approve/:id",
  protect,
  checkPermission("advance:manage"),
  approveAdvanceRequest,
);
router.post(
  "/reject/:id",
  protect,
  checkPermission("advance:manage"),
  rejectAdvanceRequest,
);
router.get(
  "/transactions/all",
  protect,
  checkPermission("payroll:read"),
  getOrgTransactionHistory,
);
router.post(
  "/salary/credit",
  protect,
  checkPermission("payroll:manage"),
  creditSalary,
);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, getAdvanceRequestById);

export default router;
