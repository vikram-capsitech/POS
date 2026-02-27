import express from "express";
import { protect, checkPermission } from "../../middleware/authMiddleware.js";
import {
  getReports,
  getReportById,
  getStats,
  createReport,
  updateReport,
  deleteReport,
} from "../../controllers/pos/reportController.js";

const router = express.Router();

// stats must be defined before /:id to avoid route conflict
router.get("/stats", protect, checkPermission("reports:read"),   getStats);

router.get( "/",     protect, checkPermission("reports:read"),   getReports);
router.post("/",     protect, createReport);  // any staff can submit a report

router.get(   "/:id", protect, getReportById);
router.put(   "/:id", protect, checkPermission("reports:read"),   updateReport);
router.delete("/:id", protect, checkPermission("reports:export"), deleteReport);

export default router;