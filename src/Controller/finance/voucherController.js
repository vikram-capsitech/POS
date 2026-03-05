import mongoose from "mongoose";
import Coins from "../../Models/finance/Coins.js";
import CoinsTransaction from "../../Models/finance/Coinstransaction.js";
import Employee from "../../Models/core/EmployeeProfile.js";
import Voucher from "../../Models/resources/Voucher.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/vouchers
// ─────────────────────────────────────────────
const createVoucher = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    coins,
    assignType = "ALL",
    assignTo = [],
    timeline,
  } = req.body;

  if (!title || !coins) throw new ApiError(400, "title and coins are required");
  if (!timeline?.startDate || !timeline?.endDate) {
    throw new ApiError(400, "timeline.startDate and timeline.endDate are required");
  }
  if (assignType === "SPECIFIC" && !assignTo?.length) {
    throw new ApiError(400, "assignTo is required when assignType is SPECIFIC");
  }

  // REMOVED the broken console.log lines
  const voucher = await Voucher.create({
    organizationID: req.organizationID,  // req.organizationID set by orgScope middleware
    title,
    description,
    coins,
    createdBy: req.user._id,
    assignType,
    assignTo: assignType === "SPECIFIC" ? assignTo : [],
    timeline: {
      startDate: new Date(timeline.startDate),
      endDate: new Date(timeline.endDate),
    },
  });

  res.status(201).json({ success: true, data: voucher });
});

// ─────────────────────────────────────────────
//  GET /api/vouchers
// ─────────────────────────────────────────────
const getVouchers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const filter = { ...req.orgFilter };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.assignTo)
    filter.assignTo = { $in: req.query.assignTo.split(",") };

  if (req.query.monthYear) {
    const [year, month] = req.query.monthYear.split("-").map(Number);
    filter.createdAt = {
      $gte: new Date(year, month - 1, 1),
      $lte: new Date(year, month, 0, 23, 59, 59),
    };
  }

  const [vouchers, total] = await Promise.all([
    Voucher.find(filter)
      .populate("assignTo", "name role")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Voucher.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: vouchers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

// ─────────────────────────────────────────────
//  GET /api/vouchers/:id
// ─────────────────────────────────────────────
const getVoucherById = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findOne({
    _id: req.params.id,
    ...req.orgFilter,
  })
    .populate("assignTo", "name")
    .populate("createdBy", "name role");
  if (!voucher) throw new ApiError(404, "Voucher not found");
  res.json({ success: true, data: voucher });
});

// ─────────────────────────────────────────────
//  PUT /api/vouchers/:id
// ─────────────────────────────────────────────
const updateVoucher = asyncHandler(async (req, res) => {
  if (req.body.assignType === "ALL") req.body.assignTo = [];
  if (req.body.assignType === "SPECIFIC" && !req.body.assignTo?.length) {
    throw new ApiError(400, "assignTo is required when assignType is SPECIFIC");
  }

  const voucher = await Voucher.findOneAndUpdate(
    { _id: req.params.id, ...req.orgFilter },
    req.body,
    { new: true, runValidators: true },
  );
  if (!voucher) throw new ApiError(404, "Voucher not found");
  res.json({
    success: true,
    message: "Voucher updated successfully",
    data: voucher,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/vouchers/:id
// ─────────────────────────────────────────────
const deleteVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findOneAndDelete({
    _id: req.params.id,
    ...req.orgFilter,
  });
  if (!voucher) throw new ApiError(404, "Voucher not found");
  res.json({ success: true, message: "Voucher deleted successfully" });
});

// ─────────────────────────────────────────────
//  GET /api/vouchers/employee/available  (employee sees their vouchers)
// ─────────────────────────────────────────────
const getEmployeeVouchers = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  if (!employee) throw new ApiError(403, "Only employees can view vouchers");

  const now = new Date();
  const vouchers = await Voucher.find({
    organizationID: employee.organizationID,
    status: "Active",
    "timeline.startDate": { $lte: now },
    "timeline.endDate": { $gte: now },
    $or: [
      { assignType: "ALL" },
      { assignType: "SPECIFIC", assignTo: employee._id },
    ],
  }).lean();

  const [redeemedTxns, coinsDoc] = await Promise.all([
    CoinsTransaction.find({
      employeeId: employee._id,
      type: "debit",
      voucherId: { $exists: true },
    }).select("voucherId"),
    Coins.findOne({ employeeId: employee._id }),
  ]);

  const redeemedSet = new Set(redeemedTxns.map((t) => t.voucherId.toString()));
  const availableCoins =
    (coinsDoc?.totalEarned ?? 0) - (coinsDoc?.totalSpent ?? 0);

  const data = vouchers.map((v) => ({
    ...v,
    isRedeemed: redeemedSet.has(v._id.toString()),
    canRedeem: !redeemedSet.has(v._id.toString()) && availableCoins >= v.coins,
    availableCoins,
  }));

  res.json({ success: true, data });
});

// ─────────────────────────────────────────────
//  POST /api/vouchers/redeem
// ─────────────────────────────────────────────
const redeemVoucher = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee)
      throw new ApiError(403, "Only employees can redeem vouchers");

    const { voucherId } = req.body;
    if (!voucherId) throw new ApiError(400, "voucherId is required");

    const now = new Date();
    const voucher = await Voucher.findOne({
      _id: voucherId,
      restaurantID: employee.restaurantID,
      status: "Active",
      "timeline.startDate": { $lte: now },
      "timeline.endDate": { $gte: now },
      $or: [
        { assignType: "ALL" },
        { assignType: "SPECIFIC", assignTo: employee._id },
      ],
    }).session(session);

    if (!voucher)
      throw new ApiError(404, "Voucher not available or not assigned to you");

    const coinsDoc = await Coins.findOne({
      employeeId: employee._id,
      restaurantID: employee.restaurantID,
    }).session(session);

    if (!coinsDoc) throw new ApiError(404, "Coins wallet not found");

    const available = coinsDoc.totalEarned - coinsDoc.totalSpent;
    if (available < voucher.coins) {
      throw new ApiError(
        400,
        `Insufficient coins. Available: ${available}, Required: ${voucher.coins}`,
      );
    }

    // Duplicate redemption guard
    const alreadyRedeemed = await CoinsTransaction.findOne({
      employeeId: employee._id,
      voucherId: voucher._id,
      type: "debit",
    }).session(session);
    if (alreadyRedeemed) throw new ApiError(400, "Voucher already redeemed");

    const [transaction] = await CoinsTransaction.create(
      [
        {
          organizationID: employee.organizationID,
          employeeId: employee._id,
          voucherId: voucher._id,
          amount: voucher.coins,
          type: "debit",
          description: `Redeemed voucher: ${voucher.title}`,
        },
      ],
      { session },
    );

    coinsDoc.totalSpent += voucher.coins;
    coinsDoc.coinsTransactions.push(transaction._id);
    await coinsDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Voucher redeemed successfully",
      data: {
        voucherId: voucher._id,
        coinsUsed: voucher.coins,
        remainingCoins: available - voucher.coins,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getEmployeeVouchers,
  redeemVoucher,
};
