import Report from "../../Models/pos/Report.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/reports
// ─────────────────────────────────────────────
const createReport = asyncHandler(async (req, res) => {
  const { type, score, checklist, notes } = req.body;
  const VALID_TYPES = ["cleanliness", "end_of_day", "incident"];
  if (!VALID_TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  const report = await Report.create({
    restaurantId: req.organizationID,
    type,
    submittedBy: req.user.id,
    score,
    checklist: checklist ?? [],
    notes,
  });

  // Notify admin via socket
  req.app.get("io")?.to(`ADMIN_${req.organizationID}`).emit("REPORT_EVENT", {
    event: "REPORT_SUBMITTED",
    reportId: report._id,
    type,
    submittedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Report submitted successfully",
    data: report,
  });
});

// ─────────────────────────────────────────────
//  GET /api/reports
// ─────────────────────────────────────────────
const getAllReports = asyncHandler(async (req, res) => {
  const { type, status, submittedBy, page = 1, limit = 10 } = req.query;
  const query = { restaurantId: req.organizationID };
  if (type) query.type = type;
  if (status) query.status = status;
  if (submittedBy) query.submittedBy = submittedBy;

  // Date range filter
  if (req.query.from || req.query.to) {
    query.createdAt = {};
    if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) query.createdAt.$lte = new Date(req.query.to);
  }

  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate("submittedBy", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Report.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: reports,
  });
});

// ─────────────────────────────────────────────
//  GET /api/reports/my  (employee's own reports)
// ─────────────────────────────────────────────
const getMyReports = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const query = { submittedBy: req.user.id };
  if (type) query.type = type;
  if (status) query.status = status;

  const reports = await Report.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// ─────────────────────────────────────────────
//  GET /api/reports/:id
// ─────────────────────────────────────────────
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate(
    "submittedBy",
    "name position",
  );
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

// ─────────────────────────────────────────────
//  PATCH /api/reports/:id/review
// ─────────────────────────────────────────────
const reviewReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: "reviewed" },
    { new: true },
  );
  if (!report) throw new ApiError(404, "Report not found");
  res.json({
    success: true,
    message: "Report marked as reviewed",
    data: report,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/reports/:id
// ─────────────────────────────────────────────
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, message: "Report deleted" });
});

// ─────────────────────────────────────────────
//  GET /api/reports/summary  (stats by type/date)
// ─────────────────────────────────────────────
const getReportSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { restaurantId: req.organizationID };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const summary = await Report.aggregate([
    { $match: match },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" },
      },
    },
    { $sort: { "_id.type": 1 } },
  ]);

  res.json({ success: true, data: summary });
});

export {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  reviewReport,
  deleteReport,
  getReportSummary,
};
