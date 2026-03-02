import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getEmployeeVouchers,
  redeemVoucher,
} from "../../Controller/finance/voucherController.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.get("/emp", protect, getEmployeeVouchers);
router.post("/redeem", protect, redeemVoucher);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post("/", protect, checkPermission("voucher:manage"), createVoucher);
router.get("/", protect, checkPermission("voucher:read"), getAllVouchers);
router.get("/:id", protect, checkPermission("voucher:read"), getVoucherById);
router.put("/:id", protect, checkPermission("voucher:manage"), updateVoucher);
router.delete(
  "/:id",
  protect,
  checkPermission("voucher:manage"),
  deleteVoucher,
);

export default router;
