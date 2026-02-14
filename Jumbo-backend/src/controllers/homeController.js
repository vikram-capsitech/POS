const { default: mongoose } = require("mongoose");
const AiReview = require("../models/AiReview");
const Attendance = require("../models/Attendance");
const User = require("../models/base/User");
const Employee = require("../models/Employee");
const SalaryTransaction = require("../models/SalaryTransaction");
const Task = require("../models/Task");
const Payments = require("../models/Payments");
const AdminAttendance = require("../models/AdminAttendance");
const SalaryRecord = require("../models/SalaryRecord");
const Request = require("../models/Request");

exports.getHomeDetails = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const range = req.query.range || "daily";
    const role = req.user.role;

    // decoded token se restaurantID milega
    const decoded = req.user; // protect middleware se
    const restaurantID = decoded.restaurant;

    let response = {};
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    let startDate, endDate, divider;

    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (range === "daily") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      divider = 1;
    }

    if (range === "weekly") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      divider = 7;
    }

    if (range === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      divider = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    // TODAY CHECK-IN COUNT
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    /* =========================
       SUPER ADMIN DASHBOARD
    ========================== */
    if (role === "superadmin") {
      const userCount = await User.countDocuments({
        role: { $in: ["admin"] },
      });

      const paymentmonth = await Payments.aggregate([
        {
          $match: {
            status: "Paid",
            currentMonth,
            currentYear,
          },
        },
        {
          $group: {
            _id: "$admin", // one document per admin
          },
        },
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
              $sum: {
                $ifNull: [{ $toDouble: "$admin.monthlyfee" }, 0],
              },
            },
            totalpaidpaymentCount: { $sum: 1 },
          },
        },
      ]);

      const totalMonthlyFee = paymentmonth[0]?.totalMonthfee || 0;
      const totalpaidpayment = paymentmonth[0]?.totalpaidpaymentCount || 0;

      const todayAdminCheckin = await AdminAttendance.find({
        date: { $gte: startOfToday, $lte: endOfToday },
        checkIn: { $ne: null },
      }).populate("admin", "name");

      // .sort({ checkIn: 1 });
      const checkedInAdmins = todayAdminCheckin
        // .filter(item=>item.admin)
        .map((item) => ({
          adminId: item.admin?._id,
          name: item.admin?.name,
          checkIn: item.checkIn,
        }));
      const todayAdminCheckedIn = todayAdminCheckin.length;

      response = {
        role: role,
        checkedInAdmins,
        totalAdminOrEmployee: userCount,
        todayCheckIn: todayAdminCheckedIn,
        totalpendingpayment: userCount - totalpaidpayment,
        totalpaidpayment,
        totalMonthlyFee,
      };
    }

    /* =========================
       ADMIN DASHBOARD
    ========================== */
    if (role !== "superadmin") {
      if (!restaurantID) {
        return res.status(400).json({
          success: false,
          message: "Restaurant ID missing",
        });
      }

      const totalpaidsalaryAgg = await SalaryRecord.aggregate([
        {
          $match: {
            restaurantID: new mongoose.Types.ObjectId(restaurantID),
            status: "Paid",
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            employee: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$employee",
          },
        },
        {
          $count: "paidEmployees",
        },
      ]);

      const totalpaidsalary = totalpaidsalaryAgg[0]?.paidEmployees || 0;

      const salarymonth = await SalaryRecord.aggregate([
        {
          $match: {
            restaurantID,
            status: "Paid",
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "employee",
            foreignField: "_id",
            as: "employee",
          },
        },

        { $unwind: "$employee" },
        {
          $group: {
            _id: "$employee._id",
            salary: { $first: "$employee.salary" },
          },
        },

        {
          $group: {
            _id: null,
            totalMonthsalary: { $sum: "$salary" },
          },
        },
      ]);
      const totalMonthlysalary = salarymonth[0]?.totalMonthsalary || 0;

      const todayCheckedInEmp = await Attendance.find({
        restaurantID,
        date: { $gte: startOfToday, $lte: endOfToday },
        checkIn: { $ne: null },
      }).populate("employee", "name");

      const CheckInEmployee = todayCheckedInEmp.map((item) => ({
        employeeId: item.employee?._id,
        name: item.employee?.name,
        checkIn: item.checkIn,
      }));

      const todayEmpCheckedIn = todayCheckedInEmp.length;

      // Employee count
      const employeeCount = await Employee.countDocuments({
        restaurantID,
      });

      // Task base query
      let taskQuery = { restaurantID };

      // Pending + date filter
      if (fromDate && toDate) {
        taskQuery.status = "Pending";
        taskQuery["deadline.endDate"] = {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        };
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayAgg = await Task.aggregate([
        {
          $match: {
            restaurantID: new mongoose.Types.ObjectId(restaurantID),
            updatedAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const todayStats = {
        total: 0,
        pending: 0,
        completed: 0,
        inProgress: 0,
      };

      todayAgg.forEach((t) => {
        todayStats.total += t.count;
        if (t._id === "Pending") todayStats.pending = t.count;
        if (t._id === "Completed") todayStats.completed = t.count;
        if (t._id === "In Progress") todayStats.inProgress = t.count;
      });
      const rangeAgg = await Task.aggregate([
        {
          $match: {
            restaurantID: new mongoose.Types.ObjectId(restaurantID),
            updatedAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      const avgStats = {
        total: 0,
        pending: 0,
        completed: 0,
        inProgress: 0,
      };

      rangeAgg.forEach((t) => {
        avgStats.total += t.count;
        if (t._id === "Pending") avgStats.pending = t.count / divider;
        if (t._id === "Completed") avgStats.completed = t.count / divider;
        if (t._id === "In Progress") avgStats.inProgress = t.count / divider;
      });

      avgStats.total = avgStats.total / divider;

      Object.keys(avgStats).forEach(
        (key) => (avgStats[key] = Number(avgStats[key].toFixed(2))),
      );

      //  AI REVIEW PENDING COUNT
      const pendingAiReviews = await AiReview.countDocuments({
        restaurantID,
        aiVerdict: "Pending",
      });

      response = {
        role: role,
        totalpaidsalary,
        totalMonthlysalary,
        CheckInEmployee,
        totalAdminOrEmployee: employeeCount,
        todayCheckedIn: todayEmpCheckedIn,
        taskStats: {
          today: todayStats,
          average: avgStats,
          // hasTodayTasks
        },
        pendingAiReviews,
        // totalSalaryGiven,
      };
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Home dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getBadges = async (req, res) => {
  try {
    const restaurantID = req.user.restaurant;

    const hasNewTask = await Task.find({
      restaurantID: restaurantID,
      isNew: true,
      status: "Completed",
    });

    const hasNewRequest = await Request.find({
      restaurantID,
      isNew: true,
    });

    const badgeData = {
      task: !!hasNewTask,
      request: !!hasNewRequest,
    };

    return res.status(200).json({
      success: true,
      data: badgeData,
    });
  } catch (error) {
    console.error("Get badge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
