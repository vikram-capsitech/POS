const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware.js");
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getEmployeeVouchers,
  redeemVoucher,
} = require("../controllers/voucherController.js");
// Employee routes
router.get("/emp", protect, getEmployeeVouchers);
router.post("/redeem", protect, redeemVoucher);
router.post("/", protect, createVoucher);
router.get("/", protect, getVouchers);

router.get("/:id", protect, getVoucherById);
router.put("/:id", protect, updateVoucher);
router.delete("/:id", protect, deleteVoucher);
module.exports = router;
