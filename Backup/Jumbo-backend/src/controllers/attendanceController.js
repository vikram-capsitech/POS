const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Break = require("../models/Break");
const { decodeToken } = require("../utils/decodeToken");

const formatDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

//*************  Check In  Check out  ******************* */

exports.checkIn = async (req, res) => {
  try {
    const {
      employeeId,
      restaurantID,
      status,
      location,
      dressCheck,
      dressReason,
    } = req.body;
    const selfie = req.file ? req.file.path : null;

    const now = new Date();
    const date = formatDate(now);

    const existing = await Attendance.findOne({
      employee: employeeId,
      restaurantID,
      date,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already checked in for today",
      });
    }

    const attendance = await Attendance.create({
      restaurantID,
      employee: employeeId,
      date,
      checkIn: now,
      status,
      selfie,
      location: JSON.parse(location),
      dressCheck,
      dressReason,
    });
    const employee = await Employee.findById(employeeId);
    const io = req.app.get("io"); // get the socket instance
    io.to(`ADMIN_${restaurantID}`).emit("CHECKIN_EVENT", {
      event: "EMPLOYEE_CHECKIN",
      employeeId,
      employeeName: employee ? employee.name : "Unknown",
      restaurantID,
      status,
      checkInTime: now,
    });

    res.status(200).json({
      success: true,
      message: "Checked in successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("[CheckIn] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    const attendance = await Attendance.findById(attendanceId);
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

    // --- FIX: Convert incoming date into proper Date object ---
    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;

    // --- GET ALL BREAKS FOR THIS ATTENDANCE ---
    const breaks = await Break.find({ attendance: attendanceId });

    // --- CALCULATE TOTAL BREAK MINUTES ---
    let totalBreakMinutes = 0;

    breaks.forEach((br) => {
      if (br.breakEnd) {
        // completed break
        totalBreakMinutes += br.duration || 0;
      } else {
        // ongoing break → count until checkout time
        const ms = checkOutTime - new Date(br.breakStart);
        totalBreakMinutes += Math.floor(ms / 1000 / 60);
      }
    });

    // --- CALCULATE WORKED HOURS ---
    const msWorked = checkOutTime - attendance.checkIn;
    const totalMinutes = Math.floor(msWorked / 1000 / 60);

    // Subtract break time from total minutes
    const netMinutes = totalMinutes - totalBreakMinutes;
    const hours = Math.floor(netMinutes / 60);
    const minutes = netMinutes % 60;

    const hoursWorked = Number((netMinutes / 60).toFixed(2));

    attendance.hoursWorked = hoursWorked;

    // overtime if more than 8 hours
    attendance.overtime =
      attendance.hoursWorked > 8
        ? Number((attendance.hoursWorked - 8).toFixed(2))
        : 0;

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

//*************************     Break In Break out  ******************* */

exports.applyBreak = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance)
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });

    const running = await Break.findOne({
      attendanceId: attendanceId,
      breakEnd: null,
    });

    if (running) {
      return res
        .status(400)
        .json({ success: false, message: "Break already running" });
    }

    // create new break
    const breakRecord = await Break.create({
      attendanceId: attendanceId,
      breakStart: new Date(),
    });
    attendance.breaks.push(breakRecord._id);
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Break started",
      data: breakRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resumeWork = async (req, res) => {
  try {
    const { breakId } = req.body;

    const breakRecord = await Break.findById(breakId);
    if (!breakRecord)
      return res
        .status(404)
        .json({ success: false, message: "Break not found" });

    if (breakRecord.breakEnd !== null)
      return res
        .status(400)
        .json({ success: false, message: "Break already ended" });

    breakRecord.breakEnd = new Date();

    // duration in minutes
    const diffMs = breakRecord.breakEnd - breakRecord.breakStart;
    breakRecord.duration = Math.floor(diffMs / 1000 / 60);

    await breakRecord.save();

    res.status(200).json({
      success: true,
      message: "Break ended",
      data: breakRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//*****************************   Admin get attendence mark absent ******************* */
exports.getDailyAttendance = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required!!!" });
    }

    const date = req.query.date
      ? new Date(req.query.date)
      : formatDate(new Date());

    const result = await Attendance.find({ restaurantID, date })
      .populate(
        "employee",
        "name position leaveTaken totalLeave unauthorizedLeaves currentMonth",
      )
      .populate("breaks");

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDailyAttendance = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required!!!" });
    }

    const date = req.query.date
      ? new Date(req.query.date)
      : formatDate(new Date());

    const result = await Attendance.find({ restaurantID, date })
      .populate("employee", "name position")
      .populate("breaks");

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    const date = req.query.date
      ? new Date(req.query.date)
      : formatDate(new Date());

    const result = await Attendance.findOne({
      employee: decodedId || req.params.id,
      date,
    })
      .populate("employee", "name position")
      .populate("breaks");

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Attendance.findByIdAndDelete(id);

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

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month, employeeId } = req.query;

    if (!year || !month || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Year, month, and employeeId are required",
      });
    }

    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: formatDate(startDate),
        $lte: formatDate(endDate),
      },
    })
      .populate("employee", "name position")
      .populate("breaks")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("[getMonthlyAttendance] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.checkInManager = async (req, res) => {
  try {
    const { employeeId, restaurantID } = req.body;

    const now = new Date();
    const date = formatDate(now);

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.position !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only manager is allowed to check in here",
      });
    }

    const existing = await Attendance.findOne({
      employee: employeeId,
      restaurantID,
      date,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already checked in for today",
      });
    }

    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();

    let status = "On time";
    if (checkInHour < 9 || (checkInHour === 9 && checkInMinute <= 50)) {
      status = "Early";
    } else if (checkInHour === 10 && checkInMinute <= 15) {
      status = "On time";
    } else {
      status = "Late";
    }

    const attendance = await Attendance.create({
      restaurantID,
      employee: employeeId,
      date,
      checkIn: now,
      status,
    });

    const io = req.app.get("io");
    io.to(`ADMIN_${restaurantID}`).emit("CHECKIN_EVENT", {
      event: "MANAGER_CHECKIN",
      employeeId,
      employeeName: employee.name,
      restaurantID,
      status,
      checkInTime: now,
    });

    return res.status(200).json({
      success: true,
      message: "Manager checked in successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("[CheckInManager] Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.managerCheckOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "attendanceId is required",
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Prevent double checkout
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: attendance,
    });

  } catch (error) {
    console.error("Manager checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
