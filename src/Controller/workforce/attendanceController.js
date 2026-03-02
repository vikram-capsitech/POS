import Attendance from "../../Models/workforce/Attendance.js";
import Break from "../../Models/workforce/Break.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip time from a date to get start-of-day */
const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const hoursWorked = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Number(((checkOut - checkIn) / 3600000).toFixed(2));
};

// ─────────────────────────────────────────────
//  POST /api/attendance/check-in
// ─────────────────────────────────────────────
export const checkIn = asyncHandler(async (req, res) => {
  const { lat, lng, dressCheck = true, dressReason = "" } = req.body;
  const { organizationID, _id: userID } = req.user;

  const today = startOfDay(new Date());

  const existing = await Attendance.findOne({ userID, date: today });
  if (existing) throw new ApiError(400, "Already checked in today");

  const selfie = req.file?.path ?? null;

  const attendance = await Attendance.create({
    organizationID,
    userID,
    date: today,
    checkIn: new Date(),
    location: { lat: lat ?? 0, lng: lng ?? 0 },
    selfie,
    dressCheck,
    dressReason,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attendance, "Check-in recorded"));
});

// ─────────────────────────────────────────────
//  POST /api/attendance/check-in/manager  (manual check-in for another user)
// ─────────────────────────────────────────────
export const checkInManager = asyncHandler(async (req, res) => {
  const { employeeId, date, status } = req.body;
  const { organizationID } = req.user;

  const day = startOfDay(date ? new Date(date) : new Date());

  const existing = await Attendance.findOne({ userID: employeeId, date: day });
  if (existing)
    throw new ApiError(400, "Attendance already exists for this date");

  const attendance = await Attendance.create({
    organizationID,
    userID: employeeId,
    date: day,
    checkIn: new Date(),
    status: status ?? "On time",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attendance, "Check-in recorded (manager)"));
});

// ─────────────────────────────────────────────
//  POST /api/attendance/check-out
// ─────────────────────────────────────────────
export const checkOut = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  const today = startOfDay(new Date());

  const attendance = await Attendance.findOne({ userID, date: today });
  if (!attendance) throw new ApiError(404, "No check-in found for today");
  if (attendance.checkOut) throw new ApiError(400, "Already checked out today");

  attendance.checkOut = new Date();
  attendance.hoursWorked = hoursWorked(attendance.checkIn, attendance.checkOut);
  await attendance.save();

  return res.json(new ApiResponse(200, attendance, "Check-out recorded"));
});

// ─────────────────────────────────────────────
//  POST /api/attendance/check-out/manager
// ─────────────────────────────────────────────
export const checkOutManager = asyncHandler(async (req, res) => {
  const { employeeId, date } = req.body;
  const day = startOfDay(date ? new Date(date) : new Date());

  const attendance = await Attendance.findOne({
    userID: employeeId,
    date: day,
  });
  if (!attendance) throw new ApiError(404, "No check-in found for this date");

  attendance.checkOut = new Date();
  attendance.hoursWorked = hoursWorked(attendance.checkIn, attendance.checkOut);
  await attendance.save();

  return res.json(
    new ApiResponse(200, attendance, "Check-out recorded (manager)"),
  );
});

// ─────────────────────────────────────────────
//  POST /api/attendance/break/start
// ─────────────────────────────────────────────
export const applyBreak = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  const attendance = await Attendance.findOne({
    userID: req.user._id,
    date: today,
  });
  if (!attendance) throw new ApiError(404, "No check-in found for today");

  const breakRecord = await Break.create({
    attendanceID: attendance._id,
    breakStart: new Date(),
  });

  attendance.breaks.push(breakRecord._id);
  await attendance.save();

  return res
    .status(201)
    .json(new ApiResponse(201, breakRecord, "Break started"));
});

// ─────────────────────────────────────────────
//  POST /api/attendance/break/end
// ─────────────────────────────────────────────
export const resumeWork = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  const attendance = await Attendance.findOne({
    userID: req.user._id,
    date: today,
  });
  if (!attendance) throw new ApiError(404, "No check-in found for today");

  // Find the most recent open break
  const breakRecord = await Break.findOne({
    attendanceID: attendance._id,
    breakEnd: null,
  }).sort({ breakStart: -1 });

  if (!breakRecord) throw new ApiError(400, "No active break found");

  breakRecord.breakEnd = new Date();
  breakRecord.duration = Math.round(
    (breakRecord.breakEnd - breakRecord.breakStart) / 60000,
  );
  await breakRecord.save();

  return res.json(
    new ApiResponse(200, breakRecord, "Break ended — back to work!"),
  );
});

// ─────────────────────────────────────────────
//  GET /api/attendance/daily
// ─────────────────────────────────────────────
export const getDailyAttendance = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 50 } = req.query;
  const { organizationID } = req.user;

  const day = startOfDay(date ? new Date(date) : new Date());

  const [records, total] = await Promise.all([
    Attendance.find({ organizationID, date: day })
      .populate("userID", "displayName profilePhoto")
      .populate("breaks")
      .sort({ checkIn: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Attendance.countDocuments({ organizationID, date: day }),
  ]);

  return res.json(
    new ApiResponse(200, {
      date: day,
      count: total,
      data: records,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/attendance/monthly
// ─────────────────────────────────────────────
export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { month, year, employeeId } = req.query;
  const { organizationID } = req.user;

  const now = new Date();
  const m = month !== undefined ? Number(month) : now.getMonth();
  const y = year !== undefined ? Number(year) : now.getFullYear();

  const query = {
    organizationID,
    date: {
      $gte: new Date(y, m, 1),
      $lte: new Date(y, m + 1, 0, 23, 59, 59),
    },
  };
  if (employeeId) query.userID = employeeId;

  const records = await Attendance.find(query)
    .populate("userID", "displayName profilePhoto")
    .sort({ date: 1, checkIn: 1 });

  return res.json(
    new ApiResponse(200, {
      month: m,
      year: y,
      count: records.length,
      data: records,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/attendance/:id
// ─────────────────────────────────────────────
export const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id)
    .populate("userID", "displayName profilePhoto")
    .populate("breaks");

  if (!record) throw new ApiError(404, "Attendance record not found");

  return res.json(new ApiResponse(200, record));
});

// ─────────────────────────────────────────────
//  DELETE /api/attendance/:id
// ─────────────────────────────────────────────
export const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) throw new ApiError(404, "Attendance record not found");

  // Delete associated breaks
  await Break.deleteMany({ _id: { $in: record.breaks } });
  await record.deleteOne();

  return res.json(new ApiResponse(200, {}, "Attendance record deleted"));
});
