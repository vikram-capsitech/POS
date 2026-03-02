import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import {
  createTask,
  getAllTasks,
  getTasksForEmployees,
  getTasksByFilter,
  getTask,
  updateTask,
  deleteTask,
  markTaskSeen,
} from "../../Controller/operations/taskController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.get("/emp", protect, orgScope, getTasksForEmployees);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  orgScope,
  checkPermission("task:write"),
  upload.single("voiceNote"),
  createTask,
);
router.post(
  "/filter",
  protect,
  orgScope,
  checkPermission("task:read"),
  getTasksByFilter,
);
router.get("/", protect, orgScope, checkPermission("task:read"), getAllTasks);
router.patch("/seen", protect, orgScope, markTaskSeen);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, orgScope, getTask);
router.put(
  "/:id",
  protect,
  orgScope,
  checkPermission("task:write"),
  upload.single("voiceNote"),
  updateTask,
);
router.delete(
  "/:id",
  protect,
  orgScope,
  checkPermission("task:delete"),
  deleteTask,
);

export default router;
