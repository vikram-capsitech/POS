import express from "express";
import { uploadPhoto } from "../config/cloudinary.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getCurrentEmployeeProfile,
  getEmployeeOverview,
  receiveAllotedItem,
} from "../controllers/employeeController.js";

const router = express.Router();

// ── Current Employee ──────────────────────────────────────────────────────────
router.get("/profile",              protect, getCurrentEmployeeProfile);
router.get("/overview/:employeeId", protect, getEmployeeOverview);
router.put("/received/:id",         protect, receiveAllotedItem);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get( "/",    protect, checkPermission("staff:read"),   getAllEmployees);
router.post("/",    protect, checkPermission("staff:write"),
  uploadPhoto.single("profilePhoto"),
  addEmployee
);

router.get(   "/:id", protect, checkPermission("staff:read"),   getEmployeeById);
router.put(   "/:id", protect, checkPermission("staff:write"),
  uploadPhoto.single("profilePhoto"),
  updateEmployeeById
);
router.delete("/:id", protect, checkPermission("staff:delete"), deleteEmployeeById);

export default router;