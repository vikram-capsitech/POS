import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  getAllReports,
  getReportById,
  getReportSummary,
  createReport,
  reviewReport,
  deleteReport,
} from "../../Controller/operations/reportController.js";

const router = express.Router();

// stats must be defined before /:id to avoid route conflict
router.get(
  "/stats",
  protect,
  checkPermission("reports:read"),
  getReportSummary,
);

router.get("/", protect, checkPermission("reports:read"), getAllReports);
router.post("/", protect, createReport); // any staff can submit a report

router.get("/:id", protect, getReportById);
router.put("/:id", protect, checkPermission("reports:read"), reviewReport);
router.delete("/:id", protect, checkPermission("reports:export"), deleteReport);

export default router;
