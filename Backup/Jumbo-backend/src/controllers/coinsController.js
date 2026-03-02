const Coins = require("../models/Coins");
const CoinsTransaction = require("../models/CoinsTransaction");

//  Create (or auto-init) employee wallet
exports.createOrGetCoins = async (req, res) => {
  try {
    const {
      restaurantId,
      employeeId } = req.body;

    let wallet = await Coins.findOne({ employeeId })
      .populate({
        path: "coinsTransactions",
        options: { sort: { date: -1 } }, // latest first
      });

    if (!wallet) {
      wallet = await Coins.create({
        restaurantID: restaurantId,
        employeeId
      });
    }

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add credit / debit transaction
exports.addTransaction = async (req, res) => {
  try {
    const {
      restaurantId,
      employeeId, amount, type, description } = req.body;

    let wallet = await Coins.findOne({ employeeId });

    // Auto-create wallet if missing
    if (!wallet) {
      wallet = await Coins.create({
        restaurantID: restaurantId,
        employeeId
      });
    }

    // Create transaction
    const transaction = await CoinsTransaction.create({
      restaurantID: restaurantId,
      employeeId,
      amount,
      type,
      description,
    });

    // Update totals
    if (type === "credit") {
      wallet.totalEarned += amount;
    } else if (type === "debit") {
      wallet.totalSpent += amount;
    }

    wallet.coinsTransactions.push(transaction._id);
    await wallet.save();

    // Send notification to employee
    const { sendNotification } = require("../services/notificationService");
    await sendNotification(
      employeeId,
      type === 'credit' ? 'success' : 'warning',
      'general',
      type === 'credit' ? 'Coins Credited' : 'Coins Debited',
      `Your wallet has been ${type === 'credit' ? 'credited' : 'debited'} by ${amount} coins. Reason: ${description}`,
      { transactionId: transaction._id.toString(), type, amount }
    );

    res.status(201).json({
      success: true,
      message: "Transaction added",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Get employee coin summary
exports.getEmployeeCoins = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const wallet = await Coins.findOne({ employeeId })
      .populate({
        path: "coinsTransactions",
        options: { sort: { date: -1 } }, // latest first
      })
      .populate("employeeId", "name position");

    if (!wallet)
      return res.status(404).json({ success: false, message: "No wallet found" });

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Get all employees wallet
exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await Coins.find()
      .populate("employeeId", "name position")
      .populate("coinsTransactions");

    res.status(200).json({ success: true, data: wallets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
