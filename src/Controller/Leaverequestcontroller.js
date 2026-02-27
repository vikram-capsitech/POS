import asyncHandler from "express-async-handler";
import LeaveRequest from "../../models/workforce/LeaveRequest.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import ApiError from "../../utils/ApiError.js";
import { sendNotification } from "../../services/notificationService.js";

// ─── Create ───────────────────────────────────────────────────────────────────

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { title, reason, startDate, endDate } = req.body;
  const { _id: createdBy, organizationID } = req.user;
  const voiceNote = req.file?.path || null;

  const isAuthorized =
    title?.toLowerCase().includes("authorized") ||
    reason?.toLowerCase().includes("authorized");

  const leave = await LeaveRequest.create({
    title, reason, startDate, endDate,
    organizationID,
    createdBy,
    voiceNote,
    isAuthorizedLeave: isAuthorized,
  });

  req.app.get("io").to(`ORG_${organizationID}`).emit("REQUEST_EVENT", {
    event:   "LEAVE_CREATED",
    leaveId: leave._id,
  });

  res.status(201).json({ success: true, data: leave });
});

// ─── Get All (Admin/Manager) ──────────────────────────────────────────────────

export const getAllLeaveRequests = asyncHandler(async (req, res) => {
  const { status, employeeId, page = 1, limit = 10 } = req.query;
  const query = { organizationID: req.user.organizationID };

  if (status)     query.status    = status;
  if (employeeId) query.createdBy = employeeId;

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate("createdBy", "displayName profilePhoto")
      .populate("approvedBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    LeaveRequest.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: leaves,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// ─── Get My Leaves (Employee) ─────────────────────────────────────────────────

export const getAllLeaveRequestsForEmployee = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { createdBy: req.user._id };
  if (status) query.status = status;

  const leaves = await LeaveRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, count: leaves.length, data: leaves });
});

// ─── Get By Filter (body-based) ───────────────────────────────────────────────

export const getLeaveRequestByFilter = asyncHandler(async (req, res) => {
  const { status = [], page = 1, limit = 10 } = req.body;
  const query = { organizationID: req.user.organizationID };

  if (status.length) query.status = { $in: status };

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    LeaveRequest.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: leaves,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// ─── Get By ID ────────────────────────────────────────────────────────────────

export const getLeaveRequestById = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id)
    .populate("createdBy", "displayName profilePhoto")
    .populate("approvedBy", "displayName");

  if (!leave) throw new ApiError(404, "Leave request not found");

  const profile = await EmployeeProfile.findOne({ userID: leave.createdBy._id })
    .select("totalLeave leaveTaken");

  const totalLeave = profile?.totalLeave || 0;
  const leaveTaken = profile?.leaveTaken || 0;

  res.status(200).json({
    success: true,
    data: {
      ...leave.toObject(),
      totalLeave,
      leaveTaken,
      leaveLeft: Math.max(totalLeave - leaveTaken, 0),
    },
  });
});

// ─── Leave History for an Employee ───────────────────────────────────────────

export const getLeaveHistory = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find({ createdBy: req.params.employeeId })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: leaves });
});

// ─── Approve / Reject ─────────────────────────────────────────────────────────

export const approveOrRejectLeave = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  // Original bug: accepted "Completed" instead of "Approved" — standardised
  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    throw new ApiError(400, "Status must be Approved, Rejected, or Pending");
  }

  const leave = await LeaveRequest.findOne({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!leave) throw new ApiError(404, "Leave request not found");

  if (leave.status !== "Pending") {
    throw new ApiError(400, `Leave is already ${leave.status}`);
  }

  leave.status     = status;
  leave.approvedBy = req.user._id;
  if (note) leave.note = note;
  await leave.save();

  // Deduct leaveTaken only on Approved, non-authorized leaves
  if (status === "Approved" && !leave.isAuthorizedLeave) {
    const start = new Date(leave.startDate);
    const end   = new Date(leave.endDate);
    const days  = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    await EmployeeProfile.findOneAndUpdate(
      { userID: leave.createdBy },
      { $inc: { leaveTaken: days } }
    );
  }

  const startStr = new Date(leave.startDate).toLocaleDateString();
  const endStr   = new Date(leave.endDate).toLocaleDateString();

  await sendNotification({
    recipientID:    leave.createdBy,
    organizationID: req.user.organizationID,
    senderID:       req.user._id,
    type:           status === "Approved" ? "success" : "error",
    category:       "leave",
    title:          status === "Approved" ? "Leave Approved" : "Leave Rejected",
    message:        status === "Approved"
      ? `Your leave from ${startStr} to ${endStr} has been approved.`
      : `Your leave from ${startStr} to ${endStr} has been rejected.`,
    data: { leaveId: leave._id.toString(), status },
  });

  res.status(200).json({
    success: true,
    message: `Leave ${status.toLowerCase()} successfully`,
    data:    leave,
  });
});