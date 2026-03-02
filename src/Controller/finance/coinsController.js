// coinsController.js
import Coins from "../../Models/finance/Coins.js";
import CoinsTransaction from "../../Models/finance/Coinstransaction.js";
import { sendNotification } from "../../Services/Notificationservice.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// GET or auto-create wallet
const createOrGetCoins = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  let wallet = await Coins.findOne({ employeeId }).populate({
    path: "coinsTransactions",
    options: { sort: { date: -1 } },
  });

  if (!wallet) {
    wallet = await Coins.create({
      restaurantID: req.organizationID,
      employeeId,
    });
  }
  res.json({ success: true, data: wallet });
});

const addTransaction = asyncHandler(async (req, res) => {
  const { employeeId, amount, type, description } = req.body;
  const restaurantID = req.organizationID;

  if (!["credit", "debit"].includes(type))
    throw new ApiError(400, "type must be credit or debit");

  let wallet = await Coins.findOne({ employeeId });
  if (!wallet) wallet = await Coins.create({ restaurantID, employeeId });

  const transaction = await CoinsTransaction.create({
    restaurantID,
    employeeId,
    amount,
    type,
    description,
  });

  if (type === "credit") wallet.totalEarned += amount;
  else wallet.totalSpent += amount;
  wallet.coinsTransactions.push(transaction._id);
  await wallet.save();

  await sendNotification(
    employeeId,
    type === "credit" ? "success" : "warning",
    "general",
    type === "credit" ? "Coins Credited" : "Coins Debited",
    `Your wallet has been ${type === "credit" ? "credited" : "debited"} by ${amount} coins. Reason: ${description}`,
    { transactionId: transaction._id.toString(), type, amount },
  );

  res
    .status(201)
    .json({ success: true, message: "Transaction added", data: transaction });
});

const getEmployeeCoins = asyncHandler(async (req, res) => {
  const wallet = await Coins.findOne({ employeeId: req.params.employeeId })
    .populate({ path: "coinsTransactions", options: { sort: { date: -1 } } })
    .populate("employeeId", "name position");
  if (!wallet) throw new ApiError(404, "No wallet found for this employee");
  res.json({ success: true, data: wallet });
});

const getAllWallets = asyncHandler(async (req, res) => {
  const wallets = await Coins.find({ restaurantID: req.organizationID })
    .populate("employeeId", "name position")
    .populate("coinsTransactions");
  res.json({ success: true, count: wallets.length, data: wallets });
});

export { createOrGetCoins, addTransaction, getEmployeeCoins, getAllWallets };
