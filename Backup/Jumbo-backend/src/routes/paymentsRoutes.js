const express = require("express");
const router = express.Router();

const { protect, isSuperAdmin } = require("../middleware/authMiddleware.js");
const {
  createRecord,
  getPaymentsByMonthYear,
  getPaymentById,
} = require("../controllers/paymentsController.js");
router.post("/", protect,isSuperAdmin, createRecord);
router.get("/", protect, getPaymentsByMonthYear);
router.get('/:id',getPaymentById);

module.exports = router;
