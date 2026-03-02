const Break = require("../Models/Break");
const Attendance = require("../Models/Attendance");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

// ─────────────────────────────────────────────
//  POST /api/breaks/start
// ─────────────────────────────────────────────
const startBreak = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw new ApiError(404, "Attendance record not found");
  if (attendance.checkOut)
    throw new ApiError(400, "Cannot start a break after checkout");

  const running = await Break.findOne({
    attendance: attendanceId,
    breakEnd: null,
  });
  if (running) throw new ApiError(400, "A break is already in progress");

  const breakRecord = await Break.create({
    attendance: attendanceId,
    breakStart: new Date(),
  });

  attendance.breaks.push(breakRecord._id);
  await attendance.save();

  res.json({ success: true, message: "Break started", data: breakRecord });
});

// ─────────────────────────────────────────────
//  POST /api/breaks/end
// ─────────────────────────────────────────────
const endBreak = asyncHandler(async (req, res) => {
  const { breakId } = req.body;

  const breakRecord = await Break.findById(breakId);
  if (!breakRecord) throw new ApiError(404, "Break record not found");
  if (breakRecord.breakEnd) throw new ApiError(400, "Break has already ended");

  breakRecord.breakEnd = new Date();
  breakRecord.duration = Math.floor(
    (breakRecord.breakEnd - breakRecord.breakStart) / 60_000,
  );
  await breakRecord.save();

  res.json({ success: true, message: "Break ended", data: breakRecord });
});

// ─────────────────────────────────────────────
//  GET /api/breaks/:attendanceId
// ─────────────────────────────────────────────
const getBreaksByAttendance = asyncHandler(async (req, res) => {
  const breaks = await Break.find({ attendance: req.params.attendanceId });
  const totalMinutes = breaks.reduce((sum, b) => sum + (b.duration ?? 0), 0);

  res.json({
    success: true,
    count: breaks.length,
    totalMinutes,
    data: breaks,
  });
});

export { startBreak, endBreak, getBreaksByAttendance };
