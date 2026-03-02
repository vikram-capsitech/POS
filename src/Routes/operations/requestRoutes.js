import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createRequest,
  getAllRequests,
  getAllRequestsForEmployees,
  getRequestByFilter,
  getRequestById,
  updateRequest,
  deleteRequest,
  markRequestSeen,
} from "../../Controller/operations/requestController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.get("/emp", protect, getAllRequestsForEmployees);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post("/", protect, upload.single("voiceNote"), createRequest);
router.post("/filter", protect, getRequestByFilter);
router.get("/", protect, checkPermission("task:read"), getAllRequests);
router.patch("/seen", protect, markRequestSeen);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, getRequestById);
router.put("/:id", protect, upload.single("voiceNote"), updateRequest);
router.delete("/:id", protect, deleteRequest);

export default router;
