const router = require("express").Router();
const {
  createOrGetCoins,
  addTransaction,
  getEmployeeCoins,
  getAllWallets,
} = require("../controllers/coinsController");

// Create wallet or get existing
router.post("/wallet", createOrGetCoins);

// Add credit/debit transaction
router.post("/transaction", addTransaction);

// Get employee coin summary
router.get("/wallet/:employeeId", getEmployeeCoins);

// Get all wallets
router.get("/", getAllWallets);

module.exports = router;
