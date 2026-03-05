import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getEmployeeVouchers,
  redeemVoucher,
} from "../../Controller/finance/voucherController.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";

const router = express.Router();

// ── Employee ──────────────────────────────────────────────────────────────────
router.get("/emp", protect,orgScope, checkPermission("voucher:read"), getEmployeeVouchers);
router.post("/redeem", protect,orgScope, checkPermission("voucher:manage"), redeemVoucher);

// ── Admin / Manager ───────────────────────────────────────────────────────────
router.post("/", protect, orgScope, checkPermission("voucher:manage"), createVoucher);
router.get("/", protect, orgScope, checkPermission("voucher:read"), getVouchers);
router.get("/:id", protect, orgScope, checkPermission("voucher:read"), getVoucherById);
router.put("/:id", protect, orgScope, checkPermission("voucher:manage"), updateVoucher);
router.delete(
  "/:id",
  protect,
  orgScope,
  checkPermission("voucher:manage"),
  deleteVoucher,
);

export default router;
