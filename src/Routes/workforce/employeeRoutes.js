import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import { upload } from "../../Middlewares/Multer.middleware.js";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getCurrentEmployeeProfile,
  getEmployeeOverview,
  receiveAllotedItem,
} from "../../Controller/workforce/employeeController.js";

const router = express.Router();

// ── Current Employee ──────────────────────────────────────────────────────────
router.get("/profile", protect, orgScope, getCurrentEmployeeProfile);
router.get("/overview/:employeeId", protect, orgScope, getEmployeeOverview);
router.put("/received/:id", protect, orgScope, receiveAllotedItem);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get("/", protect, orgScope, checkPermission("staff:read"), getAllEmployees);
router.post(
  "/",
  protect,
  orgScope,
  checkPermission("staff:write"),
  upload.single("profilePhoto"),
  addEmployee,
);

router.get(
  "/:id",
  protect,
  orgScope,
  checkPermission("staff:read"),
  getEmployeeById,
);
router.put(
  "/:id",
  protect,
  orgScope,
  checkPermission("staff:write"),
  upload.single("profilePhoto"),
  updateEmployeeById,
);
router.delete(
  "/:id",
  protect,
  orgScope,
  checkPermission("staff:delete"),
  deleteEmployeeById,
);

export default router;
