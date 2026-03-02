import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createOrGetCoins,
  addTransaction,
  getEmployeeCoins,
  getAllWallets,
} from "../../Controller/finance/coinsController.js";

const router = express.Router();

// ── Wallet ────────────────────────────────────────────────────────────────────
router.post(
  "/wallet",
  protect,
  checkPermission("staff:write"),
  createOrGetCoins,
);
router.get(
  "/wallet/:employeeId",
  protect,
  checkPermission("staff:read"),
  getEmployeeCoins,
);
router.get("/", protect, checkPermission("staff:read"), getAllWallets);

// ── Transactions ──────────────────────────────────────────────────────────────
router.post(
  "/transaction",
  protect,
  checkPermission("staff:write"),
  addTransaction,
);

export default router;
