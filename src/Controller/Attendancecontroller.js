import asyncHandler from "express-async-handler";
import Attendance from "../../models/workforce/Attendance.js";
import Break from "../../models/workforce/Break.js";
import ApiError from "../../utils/ApiError.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

const fmtDate  = (d) => new Date(d).toISOString().slice(0, 10);
const today    = ()   => fmtDate(new Date());

// Bug fix: original had getDailyAttendance defined TWICE (the first was silently overwritten)
// Bug fix: original checkIn used JSON.parse(location) without try/catch — crashes on bad input
// Bug fix: original applyBreak queried Break with { attendanceId } but model field is { attendance }

// ─── Check In (Employee with selfie) ─────────────────────────────────────────

export const checkIn = asyncHandler(async (req, res) => {
  const { status, location, dressCheck, dressReason } = req.body;
  const { _id: userID, organizationID } = req.user;
  const date = today();

  const existing = await Attendance.findOne({ userID, organizationID, date });
  if (existing) throw new ApiError(400, "Already checked in for today");

  let selfie = null;
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, "selfies");
    selfie = r.secure_url;
  }

  let parsedLocation = null;
  if (location) {
    try { parsedLocation = typeof location === "string" ? JSON.parse(location) : location; }
    catch { parsedLocation = null; }
  }

  const checkInTime    = new Date();
  const resolvedStatus = status || _autoStatus(checkInTime);

  const attendance = await Attendance.create({
    userID, organizationID, date,
    checkIn:    checkInTime,
    status:     resolvedStatus,
    selfie,
    location:   parsedLocation,
    dressCheck,
    dressReason,
  });

  req.app.get("io").to(`ORG_${organizationID}`).emit("CHECKIN_EVENT", {
    event:       "EMPLOYEE_CHECKIN",
    userID,
    name:        req.user.displayName,
    status:      resolvedStatus,
    checkInTime,
  });

  res.status(200).json({
    success: true,
    message: "Checked in successfully",
    data:    attendance,
  });
});

// ─── Check In (Manager — no selfie required) ──────────────────────────────────

export const checkInManager = asyncHandler(async (req, res) => {
  const { _id: userID, organizationID } = req.user;
  const date = today();

  const existing = await Attendance.findOne({ userID, organizationID, date });
  if (existing) throw new ApiError(400, "Already checked in for today");

  const checkInTime    = new Date();
  const resolvedStatus = _autoStatus(checkInTime);

  const attendance = await Attendance.create({
    userID, organizationID, date,
    checkIn: checkInTime,
    status:  resolvedStatus,
  });

  req.app.get("io").to(`ORG_${organizationID}`).emit("CHECKIN_EVENT", {
    event:       "MANAGER_CHECKIN",
    userID,
    name:        req.user.displayName,
    status:      resolvedStatus,
    checkInTime,
  });

  res.status(200).json({
    success: true,
    message: "Manager checked in successfully",
    data:    attendance,
  });
});

// ─── Check Out (works for both employee & manager) ────────────────────────────

export const checkOut = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;
  if (!attendanceId) throw new ApiError(400, "attendanceId is required");

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance)      throw new ApiError(404, "Attendance record not found");
  if (attendance.checkOut) throw new ApiError(400, "Already checked out");

  const checkOutTime = new Date();
  attendance.checkOut = checkOutTime;

  // Sum up all completed + ongoing break minutes
  const breaks = await Break.find({ attendance: attendanceId });
  let totalBreakMinutes = 0;
  breaks.forEach((br) => {
    if (br.breakEnd) {
      totalBreakMinutes += br.duration || 0;
    } else {
      // ongoing break — count until checkout
      totalBreakMinutes += Math.floor((checkOutTime - new Date(br.breakStart)) / 60000);
    }
  });

  const totalMinutes = Math.floor((checkOutTime - attendance.checkIn) / 60000);
  const netMinutes   = Math.max(totalMinutes - totalBreakMinutes, 0);
  const hoursWorked  = +(netMinutes / 60).toFixed(2);

  attendance.hoursWorked = hoursWorked;
  attendance.overtime    = hoursWorked > 8 ? +(hoursWorked - 8).toFixed(2) : 0;
  await attendance.save();

  res.status(200).json({
    success: true,
    message: "Checked out successfully",
    data: { ...attendance.toObject(), totalBreakMinutes, netHours: hoursWorked },
  });
});

// manager checkout is the same logic
export const managerCheckOut = checkOut;

// ─── Break Start ──────────────────────────────────────────────────────────────

export const applyBreak = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance)      throw new ApiError(404, "Attendance not found");
  if (attendance.checkOut) throw new ApiError(400, "Cannot start break after checkout");

  // Bug fix: original queried { attendanceId } — field in model is { attendance }
  const running = await Break.findOne({ attendance: attendanceId, breakEnd: null });
  if (running) throw new ApiError(400, "A break is already running");

  const breakRecord = await Break.create({
    attendance: attendanceId,
    breakStart: new Date(),
  });

  attendance.breaks.push(breakRecord._id);
  await attendance.save();

  res.status(200).json({ success: true, message: "Break started", data: breakRecord });
});

// ─── Break End ────────────────────────────────────────────────────────────────

export const resumeWork = asyncHandler(async (req, res) => {
  const { breakId } = req.body;

  const breakRecord = await Break.findById(breakId);
  if (!breakRecord)          throw new ApiError(404, "Break not found");
  if (breakRecord.breakEnd)  throw new ApiError(400, "Break already ended");

  breakRecord.breakEnd = new Date();
  breakRecord.duration = Math.floor(
    (breakRecord.breakEnd - new Date(breakRecord.breakStart)) / 60000
  );
  await breakRecord.save();

  res.status(200).json({ success: true, message: "Break ended", data: breakRecord });
});

// ─── Get Daily Attendance ─────────────────────────────────────────────────────

export const getDailyAttendance = asyncHandler(async (req, res) => {
  const organizationID = req.user.organizationID;
  const date = req.query.date ? fmtDate(new Date(req.query.date)) : today();

  const result = await Attendance.find({ organizationID, date })
    .populate("userID", "displayName profilePhoto designation")
    .populate("breaks")
    .sort({ checkIn: 1 });

  res.status(200).json({ success: true, count: result.length, date, data: result });
});

// ─── Get Monthly Attendance ───────────────────────────────────────────────────

export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { year, month, employeeId } = req.query;
  if (!year || !month || !employeeId) {
    throw new ApiError(400, "year, month, and employeeId are required");
  }

  const startDate = fmtDate(new Date(year, month - 1, 1));
  const endDate   = fmtDate(new Date(year, month, 0));

  const result = await Attendance.find({
    userID:         employeeId,
    organizationID: req.user.organizationID,
    date:           { $gte: startDate, $lte: endDate },
  })
    .populate("userID", "displayName")
    .populate("breaks")
    .sort({ date: 1 });

  res.status(200).json({ success: true, count: result.length, data: result });
});

// ─── Get by ID (today's record for a user, or by attendance doc ID) ───────────

export const getAttendanceById = asyncHandler(async (req, res) => {
  const date = req.query.date ? fmtDate(new Date(req.query.date)) : today();

  const result = await Attendance.findOne({
    $or: [
      { _id:    req.params.id },
      { userID: req.params.id, date },
    ],
  })
    .populate("userID", "displayName profilePhoto")
    .populate("breaks");

  if (!result) throw new ApiError(404, "Attendance record not found");

  res.status(200).json({ success: true, data: result });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteAttendance = asyncHandler(async (req, res) => {
  const deleted = await Attendance.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Attendance not found");

  await Break.deleteMany({ attendance: req.params.id });

  res.status(200).json({ success: true, message: "Attendance deleted" });
});

// ─── Private helper ───────────────────────────────────────────────────────────

const _autoStatus = (time) => {
  const totalMin = time.getHours() * 60 + time.getMinutes();
  if (totalMin <= 9 * 60 + 50)  return "Early";
  if (totalMin <= 10 * 60 + 15) return "On time";
  return "Late";
};