const Request = require("../Models/Request");
const {
  sendNotification,
  sendBulkNotification,
} = require("../Services/notificationService");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

// ─────────────────────────────────────────────
//  POST /api/requests
// ─────────────────────────────────────────────
const createRequest = asyncHandler(async (req, res) => {
  const { title, description, raisedBy, requestType } = req.body;
  if (!title || !description || !raisedBy || !requestType) {
    throw new ApiError(
      400,
      "title, description, raisedBy, and requestType are required",
    );
  }

  const request = await Request.create({
    ...req.body,
    restaurantID: req.organizationID,
    createdBy: req.user.id,
    voiceNote: req.file?.path ?? null,
  });

  // Socket event for user-raised issues
  if (raisedBy === "user") {
    req.app.get("io")?.to(`ADMIN_${request.restaurantID}`).emit("ISSUE_EVENT", {
      event: "ISSUE_CREATED",
      request: request._id,
    });
  }

  // Notify assignees for admin-raised issues
  if (request.assignTo?.length && raisedBy === "admin") {
    const assignees = Array.isArray(request.assignTo)
      ? request.assignTo.filter(Boolean)
      : [request.assignTo];
    await sendBulkNotification(
      assignees,
      "warning",
      "issue",
      "New Issue Assigned",
      `A new issue has been assigned to you: ${title}`,
      { issueId: request._id.toString(), priority: request.priority },
    );
  }

  res.status(201).json({
    success: true,
    message: "Request created successfully",
    data: request,
  });
});

// ─────────────────────────────────────────────
//  GET /api/requests  (admin)
// ─────────────────────────────────────────────
const getAllRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, raisedBy } = req.query;
  const query = { ...req.orgFilter };
  if (raisedBy) query.raisedBy = raisedBy;

  const [requests, total] = await Promise.all([
    Request.find(query)
      .populate("assignTo", "name position")
      .populate("createdBy", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Request.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: requests,
  });
});

// ─────────────────────────────────────────────
//  GET /api/requests/my  (employee's own + assigned)
// ─────────────────────────────────────────────
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({
    $or: [{ assignTo: req.user.id }, { createdBy: req.user.id }],
  })
    .populate("assignTo", "name position")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, data: requests });
});

// ─────────────────────────────────────────────
//  POST /api/requests/filter
// ─────────────────────────────────────────────
const getRequestsByFilter = asyncHandler(async (req, res) => {
  const { raisedBy, priority, status, page = 1, limit = 10 } = req.body;
  const query = { ...req.orgFilter };
  if (raisedBy) query.raisedBy = raisedBy;

  const orConditions = [];
  if (priority?.length) orConditions.push({ priority: { $in: priority } });
  if (status?.length) orConditions.push({ status: { $in: status } });
  if (orConditions.length) query.$or = orConditions;

  const [requests, total] = await Promise.all([
    Request.find(query)
      .populate("assignTo", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Request.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: requests,
  });
});

// ─────────────────────────────────────────────
//  GET /api/requests/:id
// ─────────────────────────────────────────────
const getRequestById = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate("assignTo")
    .populate("createdBy", "name position")
    .populate("sop", "steps")
    .populate("taskId");

  if (!request) throw new ApiError(404, "Request not found");
  res.json({ success: true, data: request });
});

// ─────────────────────────────────────────────
//  PUT /api/requests/:id
// ─────────────────────────────────────────────
const updateRequest = asyncHandler(async (req, res) => {
  const oldRequest = await Request.findById(req.params.id);
  if (!oldRequest) throw new ApiError(404, "Request not found");

  if (req.file) req.body.voiceNote = req.file.path;

  const updated = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("assignTo");

  // Notify on status change
  if (req.body.status && oldRequest.status !== req.body.status) {
    if (updated.assignTo?.length) {
      const assignees = Array.isArray(updated.assignTo)
        ? updated.assignTo
        : [updated.assignTo];
      await sendBulkNotification(
        assignees,
        "info",
        "issue",
        "Issue Status Updated",
        `Issue "${updated.title}" is now ${req.body.status}`,
        { issueId: updated._id.toString(), status: req.body.status },
      );
    }

    if (
      updated.createdBy &&
      ["Solved", "Completed"].includes(req.body.status)
    ) {
      await sendNotification(
        updated.createdBy,
        "success",
        "issue",
        "Issue Resolved",
        `Your issue "${updated.title}" has been marked as ${req.body.status}`,
        { issueId: updated._id.toString(), status: req.body.status },
      );
    }
  }

  res.json({
    success: true,
    message: "Request updated successfully",
    data: updated,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/requests/:id
// ─────────────────────────────────────────────
const deleteRequest = asyncHandler(async (req, res) => {
  const deleted = await Request.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Request not found");
  res.json({ success: true, message: "Request deleted successfully" });
});

// ─────────────────────────────────────────────
//  PATCH /api/requests/mark-seen
// ─────────────────────────────────────────────
const markRequestsSeen = asyncHandler(async (req, res) => {
  await Request.updateMany(
    { restaurantID: req.organizationID, isNew: true },
    { $set: { isNew: false } },
  );
  res.json({ success: true, message: "All requests marked as seen" });
});

export {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestsByFilter,
  getRequestById,
  updateRequest,
  deleteRequest,
  markRequestsSeen,
};
