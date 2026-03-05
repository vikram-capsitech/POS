import mongoose from "mongoose";
import AiReview from "../../Models/operations/AiReview.js";
import Attendance from "../../Models/workforce/Attendance.js";
import User from "../../Models/core/User.js";
import Employee from "../../Models/core/EmployeeProfile.js";
import Task from "../../Models/operations/Task.js";
// import AdminAttendance from "../../Models/operations/AdminAttendance.js";
import SalaryRecord from "../../Models/workforce/SalaryRecord.js";
import Request from "../../Models/operations/Request.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import { SalaryTransaction } from "../../Models/index.js";

// ─────────────────────────────────────────────
//  GET /api/home
// ─────────────────────────────────────────────
const getHomeDetails = asyncHandler(async (req, res) => {
  const { range = "daily", fromDate, toDate } = req.query;
  const role = req.user.role;
  const restaurantID = req.user.restaurantID;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let startDate, divider;
  const endDate = new Date(endOfToday);

  if (range === "daily") {
    startDate = new Date(startOfToday);
    divider = 1;
  }
  if (range === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    divider = 7;
  }
  if (range === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    divider = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  // ── SUPERADMIN ───────────────────────────────
  if (role === "superadmin") {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const [userCount, paymentAgg, todayCheckins] = await Promise.all([
      User.countDocuments({ role: "admin" }),
      SalaryTransaction.aggregate([
        { $match: { status: "Paid", currentMonth, currentYear } },
        { $group: { _id: "$admin" } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "admin",
          },
        },
        { $unwind: "$admin" },
        {
          $group: {
            _id: null,
            totalMonthfee: {
              $sum: { $ifNull: [{ $toDouble: "$admin.monthlyfee" }, 0] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      // AdminAttendance.find({
      //   date: { $gte: startOfToday, $lte: endOfToday },
      //   checkIn: { $ne: null },
      // }).populate("admin", "name"),
    ]);

    return res.json({
      success: true,
      data: {
        role,
        totalAdmins: userCount,
        todayCheckIn: todayCheckins.length,
        checkedInAdmins: todayCheckins.map((a) => ({
          adminId: a.admin?._id,
          name: a.admin?.name,
          checkIn: a.checkIn,
        })),
        totalpaidpayment: paymentAgg[0]?.count ?? 0,
        totalpendingpayment: userCount - (paymentAgg[0]?.count ?? 0),
        totalMonthlyFee: paymentAgg[0]?.totalMonthfee ?? 0,
      },
    });
  }

  // ── ADMIN / MANAGER ──────────────────────────
  if (!restaurantID)
    throw new ApiError(400, "Restaurant ID missing from token");

  const orgId = new mongoose.Types.ObjectId(restaurantID);

  const [
    employeeCount,
    paidsalaryAgg,
    todayCheckins,
    todayTaskAgg,
    rangeTaskAgg,
    pendingAiReviews,
  ] = await Promise.all([
    Employee.countDocuments({ restaurantID }),

    SalaryRecord.aggregate([
      {
        $match: {
          restaurantID: orgId,
          status: "Paid",
          currentMonth: now.getMonth(),
          currentYear: now.getFullYear(),
          employee: { $ne: null },
        },
      },
      { $group: { _id: "$employee" } },
      { $count: "paidEmployees" },
    ]),

    Attendance.find({
      restaurantID,
      date: { $gte: startOfToday, $lte: endOfToday },
      checkIn: { $ne: null },
    }).populate("employee", "name"),

    Task.aggregate([
      {
        $match: {
          restaurantID: orgId,
          updatedAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Task.aggregate([
      {
        $match: {
          restaurantID: orgId,
          updatedAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    AiReview.countDocuments({ restaurantID, status: "Pending" }),
  ]);

  const buildTaskStats = (agg, div = 1) => {
    const stats = { total: 0, pending: 0, completed: 0, inProgress: 0 };
    agg.forEach((t) => {
      stats.total += t.count;
      if (t._id === "Pending")
        stats.pending = Number((t.count / div).toFixed(2));
      if (t._id === "Completed")
        stats.completed = Number((t.count / div).toFixed(2));
      if (t._id === "In Progress")
        stats.inProgress = Number((t.count / div).toFixed(2));
    });
    stats.total = Number((stats.total / div).toFixed(2));
    return stats;
  };

  return res.json({
    success: true,
    data: {
      role,
      totalEmployees: employeeCount,
      todayCheckedIn: todayCheckins.length,
      checkedInEmployees: todayCheckins.map((a) => ({
        employeeId: a.employee?._id,
        name: a.employee?.name,
        checkIn: a.checkIn,
      })),
      totalPaidSalary: paidsalaryAgg[0]?.paidEmployees ?? 0,
      pendingAiReviews,
      taskStats: {
        today: buildTaskStats(todayTaskAgg),
        average: buildTaskStats(rangeTaskAgg, divider),
      },
    },
  });
});

// ─────────────────────────────────────────────
//  GET /api/home/badges
// ─────────────────────────────────────────────
const getBadges = asyncHandler(async (req, res) => {
  const restaurantID = req.user.restaurantID;

  const [newTasks, newRequests] = await Promise.all([
    Task.countDocuments({ restaurantID, isNew: true, status: "Completed" }),
    Request.countDocuments({ restaurantID, isNew: true }),
  ]);

  res.json({
    success: true,
    data: {
      task: newTasks > 0,
      request: newRequests > 0,
      taskCount: newTasks,
      requestCount: newRequests,
    },
  });
});

export { getHomeDetails, getBadges };
