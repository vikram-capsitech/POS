import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import AiReview from "../../models/operations/AiReview.js";
import Attendance from "../../models/workforce/Attendance.js";
import Task from "../../models/operations/Task.js";
import Request from "../../models/operations/Request.js";
import SalaryRecord from "../../models/workforce/SalaryRecord.js";
import Payments from "../../models/finance/Payments.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import ApiError from "../../utils/ApiError.js";

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getHomeDetails = asyncHandler(async (req, res) => {
  const { systemRole, organizationID } = req.user;
  const range = req.query.range || "daily";

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  // Build the range window for task averages
  let rangeStart, divider;
  if (range === "weekly") {
    rangeStart = new Date(now); rangeStart.setDate(now.getDate() - 6); rangeStart.setHours(0, 0, 0, 0);
    divider    = 7;
  } else if (range === "monthly") {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    divider    = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  } else {
    rangeStart = new Date(todayStart);
    divider    = 1;
  }

  // ── SuperAdmin Dashboard ──────────────────────────────────────────────────
  if (systemRole === "superadmin") {
    const [adminCount, todayCheckIns, paymentAgg] = await Promise.all([
      EmployeeProfile.countDocuments({ systemRole: "admin" }), // count via User instead below
      Attendance.find({ date: { $gte: todayStart, $lte: todayEnd }, checkIn: { $ne: null } })
        .populate("userID", "displayName profilePhoto"),

      Payments.aggregate([
        { $match: { status: "Paid", currentMonth, currentYear } },
        {
          $lookup: {
            from: "users", localField: "admin",
            foreignField: "_id", as: "adminUser",
          },
        },
        { $unwind: "$adminUser" },
        {
          $group: {
            _id:                null,
            totalMonthlyFee:    { $sum: { $ifNull: [{ $toDouble: "$adminUser.monthlyfee" }, 0] } },
            totalPaidCount:     { $sum: 1 },
          },
        },
      ]),
    ]);

    // Get actual admin count from User model
    const { default: User } = await import("../../models/core/User.js");
    const totalAdmins = await User.countDocuments({ systemRole: "admin" });

    return res.status(200).json({
      success: true,
      data: {
        role:                "superadmin",
        totalAdmins,
        todayCheckIns:       todayCheckIns.length,
        checkedInAdmins:     todayCheckIns.map((a) => ({
          userID:   a.userID?._id,
          name:     a.userID?.displayName,
          photo:    a.userID?.profilePhoto,
          checkIn:  a.checkIn,
        })),
        totalPaidPayments:   paymentAgg[0]?.totalPaidCount   || 0,
        totalPendingPayments: totalAdmins - (paymentAgg[0]?.totalPaidCount || 0),
        totalMonthlyFee:     paymentAgg[0]?.totalMonthlyFee  || 0,
      },
    });
  }

  // ── Admin / Manager Dashboard ─────────────────────────────────────────────
  if (!organizationID) throw new ApiError(400, "Organization ID missing");
  const orgId = new mongoose.Types.ObjectId(organizationID);

  const [
    employeeCount,
    todayCheckIns,
    todayTaskAgg,
    rangeTaskAgg,
    paidSalaryAgg,
    pendingAiReviews,
  ] = await Promise.all([
    EmployeeProfile.countDocuments({ organizationID }),

    Attendance.find({
      organizationID,
      date:    { $gte: todayStart, $lte: todayEnd },
      checkIn: { $ne: null },
    }).populate("userID", "displayName profilePhoto"),

    Task.aggregate([
      { $match: { organizationID: orgId, updatedAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Task.aggregate([
      { $match: { organizationID: orgId, updatedAt: { $gte: rangeStart, $lte: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    SalaryRecord.aggregate([
      {
        $match: {
          organizationID: orgId,
          status:         "Paid",
          currentMonth,
          currentYear,
          employee:       { $ne: null },
        },
      },
      { $group: { _id: "$employee" } },
      { $count: "paidCount" },
    ]),

    AiReview.countDocuments({ organizationID, status: "Pending" }),
  ]);

  const _buildTaskStats = (agg, div) => {
    const stats = { total: 0, pending: 0, completed: 0, inProgress: 0 };
    agg.forEach(({ _id, count }) => {
      stats.total += count;
      if (_id === "Pending")     stats.pending    = +(count / div).toFixed(2);
      if (_id === "Completed")   stats.completed  = +(count / div).toFixed(2);
      if (_id === "In Progress") stats.inProgress = +(count / div).toFixed(2);
    });
    stats.total = +(stats.total / div).toFixed(2);
    return stats;
  };

  return res.status(200).json({
    success: true,
    data: {
      role:            systemRole || "admin",
      totalEmployees:  employeeCount,
      todayCheckIns:   todayCheckIns.length,
      checkedInToday:  todayCheckIns.map((a) => ({
        userID:  a.userID?._id,
        name:    a.userID?.displayName,
        photo:   a.userID?.profilePhoto,
        checkIn: a.checkIn,
      })),
      paidSalariesThisMonth: paidSalaryAgg[0]?.paidCount || 0,
      pendingAiReviews,
      taskStats: {
        today:   _buildTaskStats(todayTaskAgg, 1),
        [range]: _buildTaskStats(rangeTaskAgg, divider),
      },
    },
  });
});

// ─── Badges ───────────────────────────────────────────────────────────────────

export const getBadges = asyncHandler(async (req, res) => {
  const { organizationID } = req.user;

  const [newTasks, newRequests] = await Promise.all([
    Task.countDocuments({ organizationID, isNew: true, status: "Completed" }),
    Request.countDocuments({ organizationID, isNew: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      task:    newTasks > 0,
      request: newRequests > 0,
      counts:  { task: newTasks, request: newRequests },
    },
  });
});