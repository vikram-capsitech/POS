import Payments from "../../Models/finance/Payments.js";
import User from "../../Models/core/User.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import { logUserAction } from "../../Utils/Logger.js";

// ─────────────────────────────────────────────
//  POST /api/payments  (superadmin creates payment records)
// ─────────────────────────────────────────────
const createRecord = asyncHandler(async (req, res) => {
  let { admins, status } = req.body;

  if (!Array.isArray(admins)) admins = [admins];
  if (!admins.length)
    throw new ApiError(400, "At least one admin ID is required");

  const adminRecords = await User.find({ _id: { $in: admins }, role: "admin" });
  if (!adminRecords.length)
    throw new ApiError(404, "No valid admin records found");

  const payments = await Promise.all(
    adminRecords.map((admin) =>
      Payments.create({
        admin: admin._id,
        restaurantID: admin.restaurantID,
        status,
      }),
    ),
  );

  await logUserAction(req, "PAYMENT_RECORDS_CREATED", "FINANCE", null, { createdCount: payments.length });

  res.status(201).json({
    success: true,
    message: "Payments created successfully",
    data: payments,
  });
});

// ─────────────────────────────────────────────
//  GET /api/payments?month=&year=  (superadmin)
// ─────────────────────────────────────────────
const getPaymentsByMonthYear = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (month === undefined || year === undefined) {
    throw new ApiError(400, "month and year are required");
  }

  const payments = await Payments.aggregate([
    { $match: { currentMonth: Number(month), currentYear: Number(year) } },
    {
      $lookup: {
        from: "users",
        localField: "admin",
        foreignField: "_id",
        as: "admin",
      },
    },
    { $unwind: "$admin" },
    {
      $project: {
        _id: 1,
        adminId: "$admin._id",
        adminName: "$admin.name",
        role: "$admin.role",
        monthlyFee: "$admin.monthlyfee",
        status: 1,
        lastPaymentDate: "$date",
        month: "$currentMonth",
        year: "$currentYear",
        restaurantID: 1,
      },
    },
    { $sort: { lastPaymentDate: -1 } },
  ]);

  res.json({ success: true, count: payments.length, data: payments });
});

// ─────────────────────────────────────────────
//  GET /api/payments/:adminId?month=&year=
// ─────────────────────────────────────────────
const getPaymentById = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (month === undefined || year === undefined) {
    throw new ApiError(400, "month and year are required");
  }

  const payment = await Payments.findOne({
    admin: req.params.id,
    currentMonth: Number(month),
    currentYear: Number(year),
  }).populate("admin", "name email monthlyfee");

  if (!payment)
    throw new ApiError(404, "Payment record not found for given month/year");
  res.json({ success: true, data: payment });
});

// ─────────────────────────────────────────────
//  PATCH /api/payments/:id/status
// ─────────────────────────────────────────────
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const VALID = ["Paid", "Pending", "Overdue"];
  if (!VALID.includes(status))
    throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);

  const old = await Payments.findById(req.params.id);
  const payment = await Payments.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!payment) throw new ApiError(404, "Payment record not found");

  const changes = old && old.status !== payment.status ? { status: { from: old.status, to: payment.status } } : undefined;
  await logUserAction(req, "PAYMENT_STATUS_UPDATED", "FINANCE", payment._id, { changes });

  res.json({ success: true, message: "Payment status updated", data: payment });
});

export {
  createRecord,
  getPaymentsByMonthYear,
  getPaymentById,
  updatePaymentStatus,
};
