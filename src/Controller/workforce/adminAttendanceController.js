const AdminAttendance = require("../Models/AdminAttendance");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

// ─────────────────────────────────────────────
//  POST /api/admin-attendance/checkin
// ─────────────────────────────────────────────
const checkIn = asyncHandler(async (req, res) => {
  const adminId = req.user.id; // always use authenticated user
  const now = new Date();
  const date = formatDate(now);

  const existing = await AdminAttendance.findOne({ admin: adminId, date });
  if (existing) {
    return res.json({
      success: true,
      message: "Already checked in",
      data: existing,
    });
  }

  const attendance = await AdminAttendance.create({
    admin: adminId,
    date,
    checkIn: now,
  });
  res.json({
    success: true,
    message: "Checked in successfully",
    data: attendance,
  });
});

// ─────────────────────────────────────────────
//  POST /api/admin-attendance/checkout
// ─────────────────────────────────────────────
const checkOut = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;

  const attendance = await AdminAttendance.findById(attendanceId);
  if (!attendance) throw new ApiError(404, "Attendance record not found");
  if (attendance.checkOut) throw new ApiError(400, "Already checked out");

  attendance.checkOut = new Date();
  await attendance.save();

  res.json({
    success: true,
    message: "Checked out successfully",
    data: attendance,
  });
});

// ─────────────────────────────────────────────
//  GET /api/admin-attendance/daily  (superadmin)
// ─────────────────────────────────────────────
const getDailyAttendance = asyncHandler(async (req, res) => {
  const date = req.query.date
    ? formatDate(new Date(req.query.date))
    : formatDate(new Date());

  const result = await AdminAttendance.find({ date }).populate(
    "admin",
    "name role email",
  );
  res.json({ success: true, count: result.length, data: result });
});

// ─────────────────────────────────────────────
//  GET /api/admin-attendance/me  (current admin's record)
// ─────────────────────────────────────────────
const getMyAttendance = asyncHandler(async (req, res) => {
  const date = req.query.date
    ? formatDate(new Date(req.query.date))
    : formatDate(new Date());

  const result = await AdminAttendance.findOne({
    admin: req.user.id,
    date,
  }).populate("admin", "name role");

  res.json({ success: true, data: result });
});

// ─────────────────────────────────────────────
//  GET /api/admin-attendance/monthly
// ─────────────────────────────────────────────
const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { year, month, adminId } = req.query;
  if (!year || !month || !adminId) {
    throw new ApiError(400, "year, month, and adminId are required");
  }

  const startDate = formatDate(new Date(year, month - 1, 1));
  const endDate = formatDate(new Date(year, month, 0));

  const result = await AdminAttendance.find({
    admin: adminId,
    date: { $gte: startDate, $lte: endDate },
  })
    .populate("admin", "name role")
    .sort({ date: 1 });

  res.json({ success: true, count: result.length, data: result });
});

// ─────────────────────────────────────────────
//  DELETE /api/admin-attendance/:id
// ─────────────────────────────────────────────
const deleteAttendance = asyncHandler(async (req, res) => {
  const deleted = await AdminAttendance.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Attendance record not found");
  res.json({ success: true, message: "Attendance deleted successfully" });
});

export {
  checkIn,
  checkOut,
  getDailyAttendance,
  getMyAttendance,
  getMonthlyAttendance,
  deleteAttendance,
};
