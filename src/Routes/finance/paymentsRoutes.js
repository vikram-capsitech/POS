import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createRecord,
  getPaymentsByMonthYear,
  getPaymentById,
} from "../../Controller/finance/paymentsController.js";

const router = express.Router();

router.post("/", protect, checkPermission("payroll:manage"), createRecord);
router.get(
  "/",
  protect,
  checkPermission("payroll:read"),
  getPaymentsByMonthYear,
);
router.get("/:id", protect, checkPermission("payroll:read"), getPaymentById);

export default router;
