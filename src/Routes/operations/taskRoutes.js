import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  createTask,
  getAllTasks,
  getTasksForEmployees,
  getTasksByFilter,
  getTask,
  updateTask,
  deleteTask,
  markTaskSeen,
} from "../controllers/taskController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.get("/emp", protect, getTasksForEmployees);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post("/",       protect, checkPermission("task:write"),  upload.single("voiceNote"), createTask);
router.post("/filter", protect, checkPermission("task:read"),   getTasksByFilter);
router.get( "/",       protect, checkPermission("task:read"),   getAllTasks);
router.patch("/seen",  protect, markTaskSeen);

// ── Single ────────────────────────────────────────────────────────────────────
router.get(   "/:id", protect, getTask);
router.put(   "/:id", protect, checkPermission("task:write"),  upload.single("voiceNote"), updateTask);
router.delete("/:id", protect, checkPermission("task:delete"), deleteTask);

export default router;