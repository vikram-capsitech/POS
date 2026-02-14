const AdminAttendance = require("../models/AdminAttendance");
const Admin = require("../models/Admin");
// const Break = require("../models/Break");
const { decodeToken } = require("../utils/decodeToken");

const formatDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

//*************  Check In  Check out  ******************* */

exports.AdmincheckIn = async (req, res) => {
  try {
    const { adminId } = req.body;

    if (
      !adminId ||
      (typeof adminId !== "string" && typeof adminId !== "number")
    ) {
      return res.status(400).json({ error: "adminId is required" });
    }

    const now = new Date();
    const date = formatDate(now);

    const existing = await AdminAttendance.findOne({
      admin: adminId,
      date,
    });

    let attendance;
    if (!existing) {
      attendance = await AdminAttendance.create({
        // restaurantID,
        admin: adminId,
        date,
        checkIn: now,
      });
    }
    res.status(200).json({
      success: true,
      message: "Checked in successfully",
      data: existing ?? attendance,
    });
  } catch (error) {
    console.error("[CheckIn] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.AdmincheckOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    const attendance = await AdminAttendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }
    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//*****************************   Admin get attendence mark absent ******************* */
exports.getAdminDailyAttendance = async (req, res) => {
  try {
    const date = req.query.date
      ? formatDate(new Date(req.query.date))
      : formatDate(new Date());

    const result = await AdminAttendance.find({ date }).populate("admin");

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAdminAttendanceById = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);
    if (!decodedId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const date = req.query.date
      ? formatDate(new Date(req.query.date))
      : formatDate(new Date());

    const result = await AdminAttendance.findOne({
      admin: decodedId,
      date,
    }).populate("admin", "name role");

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAdminAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AdminAttendance.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getAdminMonthlyAttendance = async (req, res) => {
  try {
    const { year, month, adminId } = req.query;
    if (!year || !month || !adminId) {
      return res.status(400).json({
        success: false,
        message: "Year, month, and adminId are required",
      });
    }
    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const result = await AdminAttendance.find({
      admin: adminId,
      date: {
        $gte: formatDate(startDate),
        $lte: formatDate(endDate),
      },
    })
      .populate("admin", "name role")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("[getAdminMonthlyAttendance] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
