const { default: mongoose } = require("mongoose");
const Coins = require("../models/Coins");
const CoinsTransaction = require("../models/CoinsTransaction");
const Employee = require("../models/Employee");
const Voucher = require("../models/Voucher");
const { decodeToken, decodeAdminUser } = require("../utils/decodeToken");
const User = require("../models/base/User");
const getRestaurantIDFromToken = async (req) => {
  const decodedId = await decodeToken(req);

  const employee = await Employee.findById(decodedId);
  if (employee) {
    return employee.restaurantID; // employee request
  }
  return decodedId; // admin request (restaurantID)
};
const getEmployeeFromToken = async (req) => {
  const decodedId = await decodeToken(req);
  return await Employee.findById(decodedId);
};

const createVoucher = async (req, res) => {
  try {
    const restaurantID = await getRestaurantIDFromToken(req);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const {
      title,
      description,
      coins,
      assignType = "ALL",
      assignTo = [],
      timeline,
    } = req.body;

    if (!title || !coins) {
      return res.status(400).json({
        error: "Title and coins are required",
      });
    }

    if (!timeline?.startDate || !timeline?.endDate) {
      return res.status(400).json({
        error: "Timeline startDate and endDate are required",
      });
    }

    if (assignType === "SPECIFIC" && (!assignTo || assignTo.length === 0)) {
      return res.status(400).json({
        error: "assignTo is required when assignType is SPECIFIC",
      });
    }

    const voucher = await Voucher.create({
      restaurantID,
      title,
      description,
      coins,
      createdBy: req.user.id,
      assignType,
      assignTo: assignType === "SPECIFIC" ? assignTo : [],
      timeline: {
        startDate: new Date(timeline.startDate),
        endDate: new Date(timeline.endDate),
      },
    });

    res.status(201).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVouchers = async (req, res) => {
  try {
    const restaurantID = await getRestaurantIDFromToken(req);

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter = { restaurantID };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.assignTo) {
      const assignToIds = req.query.assignTo.split(",");
      filter.assignTo = { $in: assignToIds };
    }

    if (req.query.monthYear) {
      const [year, month] = req.query.monthYear.split("-").map(Number);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const [vouchers, total] = await Promise.all([
      Voucher.find(filter)
        .populate("assignTo", "name role")
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Voucher.countDocuments(filter),
    ]);

    res.status(200).json({
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const restaurantID = await getRestaurantIDFromToken(req);

    const voucher = await Voucher.findOne({
      _id: req.params.id,
      restaurantID,
    })
      .populate("assignTo", "name")
      .populate("createdBy", "name role");

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateVoucher = async (req, res) => {
  try {
    const restaurantID = await getRestaurantIDFromToken(req);
    if (req.body.assignType === "ALL") {
      req.body.assignTo = [];
    }

    //  If SPECIFIC, assignTo must exist
    if (
      req.body.assignType === "SPECIFIC" &&
      (!req.body.assignTo || req.body.assignTo.length === 0)
    ) {
      return res.status(400).json({
        error: "assignTo is required when assignType is SPECIFIC",
      });
    }

    const voucher = await Voucher.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantID,
      },
      {
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not found",
      });
    }

    res.status(200).json({
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const restaurantID = await getRestaurantIDFromToken(req);

    const voucher = await Voucher.findOneAndDelete({
      _id: req.params.id,
      restaurantID,
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeVouchers = async (req, res) => {
  try {
    const employee = await getEmployeeFromToken(req);

    if (!employee) {
      return res.status(403).json({ error: "Only employee allowed" });
    }

    const now = new Date();

    const vouchers = await Voucher.find({
      restaurantID: employee.restaurantID,
      status: "Active",
      "timeline.startDate": { $lte: now },
      "timeline.endDate": { $gte: now },
      $or: [
        { assignType: "ALL" },
        {
          assignType: "SPECIFIC",
          assignTo: employee._id,
        },
      ],
    }).lean();

    //  Redeemed vouchers by this employee
    const redeemedTransactions = await CoinsTransaction.find({
      employeeId: employee._id,
      type: "debit",
      voucherId: { $exists: true },
    }).select("voucherId");

    const redeemedSet = new Set(
      redeemedTransactions.map((t) => t.voucherId.toString()),
    );

    //  Employee coins
    const coinsDoc = await Coins.findOne({
      employeeId: employee._id,
    });

    const availableCoins =
      (coinsDoc?.totalEarned || 0) - (coinsDoc?.totalSpent || 0);

    const vouchersWithStatus = vouchers.map((v) => ({
      ...v,
      isRedeemed: redeemedSet.has(v._id.toString()),
      canRedeem:
        !redeemedSet.has(v._id.toString()) && availableCoins >= v.coins,
      availableCoins: availableCoins,
    }));

    res.status(200).json(vouchersWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const redeemVoucher = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employee = await getEmployeeFromToken(req);

    if (!employee) {
      return res
        .status(403)
        .json({ error: "Only employee can redeem voucher" });
    }

    const { voucherId } = req.body;

    if (!voucherId) {
      return res.status(400).json({ error: "voucherId is required" });
    }

    const now = new Date();

    const voucher = await Voucher.findOne({
      _id: voucherId,
      restaurantID: employee.restaurantID,
      status: "Active",
      "timeline.startDate": { $lte: now },
      "timeline.endDate": { $gte: now },
      $or: [
        { assignType: "ALL" },
        {
          assignType: "SPECIFIC",
          assignTo: employee._id,
        },
      ],
    }).session(session);
    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not available or not assigned to you",
      });
    }

    //  Coins doc
    const coinsDoc = await Coins.findOne({
      employeeId: employee._id,
      restaurantID: employee.restaurantID,
    }).session(session);

    if (!coinsDoc) {
      return res.status(404).json({ error: "Coins account not found" });
    }

    const availableCoins = coinsDoc.totalEarned - coinsDoc.totalSpent;

    if (availableCoins < voucher.coins) {
      return res.status(400).json({
        error: "Insufficient coins",
        availableCoins,
        required: voucher.coins,
      });
    }

    //  Double redeem protection
    const alreadyRedeemed = await CoinsTransaction.findOne({
      employeeId: employee._id,
      voucherId: voucher._id,
      type: "debit",
    }).session(session);

    if (alreadyRedeemed) {
      return res.status(400).json({ error: "Voucher already redeemed" });
    }

    //  Create debit transaction
    const [transaction] = await CoinsTransaction.create(
      [
        {
          restaurantID: employee.restaurantID,
          employeeId: employee._id,
          voucherId: voucher._id,
          amount: voucher.coins,
          type: "debit",
          description: `Redeemed voucher: ${voucher.title}`,
        },
      ],
      { session },
    );

    // 🔻 Update coins
    coinsDoc.totalSpent += voucher.coins;
    coinsDoc.coinsTransactions.push(transaction._id);
    await coinsDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Voucher redeemed successfully",
      voucherId: voucher._id,
      coinsUsed: voucher.coins,
      remainingCoins: availableCoins - voucher.coins,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getEmployeeVouchers,
  redeemVoucher,
};
