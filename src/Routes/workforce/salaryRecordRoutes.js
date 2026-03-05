import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import {
  createRecord,
  getSalarySummary,
  getRecord,
  deleteRecord,
} from "../../Controller/workforce/Salaryrecordcontroller.js";

const router = express.Router();

router.post("/", protect, orgScope, checkPermission("payroll:manage"), createRecord);
router.get("/", protect, orgScope, checkPermission("payroll:read"), getSalarySummary);
router.get("/:id", protect, orgScope, checkPermission("payroll:read"), getRecord);
router.delete("/:id", protect, orgScope, checkPermission("payroll:manage"), deleteRecord);

export default router;
