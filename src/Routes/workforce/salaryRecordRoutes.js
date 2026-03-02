import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createRecord,
  getSalarySummary,
  getRecord,
  deleteRecord,
} from "../../Controller/workforce/Salaryrecordcontroller.js";

const router = express.Router();

router.post("/", protect, checkPermission("payroll:manage"), createRecord);
router.get("/", protect, checkPermission("payroll:read"), getSalarySummary);
router.get("/:id", protect, checkPermission("payroll:read"), getRecord);
router.delete("/:id", protect, checkPermission("payroll:manage"), deleteRecord);

export default router;
