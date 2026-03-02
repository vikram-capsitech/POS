import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
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
router.get("/profile", protect, getCurrentEmployeeProfile);
router.get("/overview/:employeeId", protect, getEmployeeOverview);
router.put("/received/:id", protect, receiveAllotedItem);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get("/", protect, checkPermission("staff:read"), getAllEmployees);
router.post(
  "/",
  protect,
  checkPermission("staff:write"),
  upload.single("profilePhoto"),
  addEmployee,
);

router.get("/:id", protect, checkPermission("staff:read"), getEmployeeById);
router.put(
  "/:id",
  protect,
  checkPermission("staff:write"),
  upload.single("profilePhoto"),
  updateEmployeeById,
);
router.delete(
  "/:id",
  protect,
  checkPermission("staff:delete"),
  deleteEmployeeById,
);

export default router;
