import LeaveRequest from "../../Models/workforce/LeaveRequest.js";
import EmployeeProfile from "../../Models/core/EmployeeProfile.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import { sendNotification } from "../../Services/Notificationservice.js";

// ─────────────────────────────────────────────
//  POST /api/leave-requests
// ─────────────────────────────────────────────
export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { title, reason, startDate, endDate, createdBy } = req.body;
  const organizationID = req.user.organizationID;
  const voiceNoteFile = req.file?.path ?? null;

  const isAuthorized =
    title?.toLowerCase().includes("authorized") ||
    reason?.toLowerCase().includes("authorized");

  const leave = await LeaveRequest.create({
    title,
    reason,
    startDate,
    endDate,
    organizationID,
    createdBy: createdBy ?? req.user._id,
    voiceNote: voiceNoteFile,
    isAuthorizedLeave: isAuthorized,
  });

  req.app.get("io")?.to(`ADMIN_${organizationID}`).emit("REQUEST_EVENT", {
    event: "REQUEST_CREATED",
    request: leave._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, leave, "Leave request created"));
});

// ─────────────────────────────────────────────
//  GET /api/leave-requests  (admin view)
// ─────────────────────────────────────────────
export const getAllLeaveRequests = asyncHandler(async (req, res) => {
  const { status, employeeId, page = 1, limit = 10 } = req.query;
  const query = { organizationID: req.user.organizationID };
  if (status) query.status = status;
  if (employeeId) query.createdBy = employeeId;

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    LeaveRequest.countDocuments(query),
  ]);

  return res.json(
    new ApiResponse(200, {
      count: total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: leaves,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/leave-requests/emp  (employee's own)
// ─────────────────────────────────────────────
export const getAllLeaveRequestsForEmployee = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { createdBy: req.user._id };
  if (status) query.status = status;

  const leaves = await LeaveRequest.find(query)
    .populate("createdBy", "displayName")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.json(new ApiResponse(200, { count: leaves.length, data: leaves }));
});

// ─────────────────────────────────────────────
//  POST /api/leave-requests/filter
// ─────────────────────────────────────────────
export const getLeaveRequestByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.body;
  const query = { organizationID: req.user.organizationID };
  if (status?.length) query.status = { $in: status };

  const [requests, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    LeaveRequest.countDocuments(query),
  ]);

  return res.json(
    new ApiResponse(200, {
      count: total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: requests,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/leave-requests/history/:employeeId
// ─────────────────────────────────────────────
export const getLeaveHistory = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find({ createdBy: req.params.employeeId })
    .populate("createdBy", "displayName")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, { count: leaves.length, data: leaves }));
});

// ─────────────────────────────────────────────
//  GET /api/leave-requests/:id
// ─────────────────────────────────────────────
export const getLeaveRequestById = asyncHandler(async (req, res) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id).populate(
    "createdBy",
    "displayName",
  );

  if (!leaveRequest) throw new ApiError(404, "Leave request not found");

  // Get leave quota from EmployeeProfile
  const profile = await EmployeeProfile.findOne(
    { userID: leaveRequest.createdBy },
    "totalLeave leaveTaken",
  ).lean();

  const totalLeave = profile?.totalLeave ?? 0;
  const leaveTaken = profile?.leaveTaken ?? 0;
  const leaveLeft = Math.max(totalLeave - leaveTaken, 0);

  return res.json(
    new ApiResponse(200, {
      ...leaveRequest.toObject(),
      totalLeave,
      leaveTaken,
      leaveLeft,
    }),
  );
});

// ─────────────────────────────────────────────
//  PUT /api/leave-requests/approve/:id
//  PUT /api/leave-requests/reject/:id
// ─────────────────────────────────────────────
export const approveOrRejectLeave = asyncHandler(async (req, res) => {
  // Derive action from URL path
  const isApproval = req.path.includes("approve");
  const newStatus = isApproval ? "Approved" : "Rejected";

  const leaveRequest = await LeaveRequest.findById(req.params.id);
  if (!leaveRequest) throw new ApiError(404, "Leave request not found");

  if (leaveRequest.status !== "Pending") {
    throw new ApiError(
      400,
      "Only pending leave requests can be approved or rejected",
    );
  }

  leaveRequest.status = newStatus;
  leaveRequest.approvedBy = req.user._id;
  await leaveRequest.save();

  // Increment leaveTaken in EmployeeProfile when approved (not for authorized leaves)
  if (isApproval && !leaveRequest.isAuthorizedLeave && leaveRequest.endDate) {
    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const days = Math.ceil((end - start) / 86_400_000) + 1;
    await EmployeeProfile.findOneAndUpdate(
      { userID: leaveRequest.createdBy },
      { $inc: { leaveTaken: days } },
    );
  }

  // Push notification
  const startFmt = new Date(leaveRequest.startDate).toLocaleDateString();
  const endFmt = leaveRequest.endDate
    ? new Date(leaveRequest.endDate).toLocaleDateString()
    : startFmt;

  await sendNotification(
    leaveRequest.createdBy,
    isApproval ? "success" : "error",
    "leave",
    isApproval ? "Leave Approved" : "Leave Rejected",
    isApproval
      ? `Your leave from ${startFmt} to ${endFmt} has been approved.`
      : `Your leave from ${startFmt} to ${endFmt} has been rejected.`,
    { leaveId: leaveRequest._id.toString(), status: newStatus },
  );

  return res.json(
    new ApiResponse(200, {}, `Leave ${newStatus.toLowerCase()} successfully`),
  );
});
