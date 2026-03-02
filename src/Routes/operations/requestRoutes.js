import express from "express";
import { upload } from "../../Utils/Cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
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
router.get("/emp", protect, orgScope, getAllRequestsForEmployees);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post("/", protect, orgScope, upload.single("voiceNote"), createRequest);
router.post("/filter", protect, orgScope, getRequestByFilter);
router.get("/", protect, orgScope, checkPermission("task:read"), getAllRequests);
router.patch("/seen", protect, orgScope, markRequestSeen);

// ── Single ────────────────────────────────────────────────────────────────────
router.get("/:id", protect, orgScope, getRequestById);
router.put(
  "/:id",
  protect,
  orgScope,
  upload.single("voiceNote"),
  updateRequest,
);
router.delete("/:id", protect, orgScope, deleteRequest);

export default router;
