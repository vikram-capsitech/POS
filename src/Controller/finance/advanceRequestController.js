const Employee = require("../Models/Employee");
const AdvanceRequest = require("../Models/AdvanceRequest");
const SalaryTransaction = require("../Models/SalaryTransaction");
const { sendNotification } = require("../Services/notificationService");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

// ─────────────────────────────────────────────
//  POST /api/advance-requests
// ─────────────────────────────────────────────
const createAdvanceRequest = asyncHandler(async (req, res) => {
  const restaurantID = req.organizationID;
  const { employeeId, askedMoney, description, assignTo } = req.body;
  const voiceNoteUrl = req.file?.path ?? null;

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new ApiError(404, "Employee not found");

  const maxAllowed = (employee.salary ?? 0) * 0.6;
  const taken = employee.monthlyAdvanceTaken ?? 0;
  const remaining = maxAllowed - taken;

  if (askedMoney > remaining) {
    throw new ApiError(
      400,
      `Advance exceeds limit. Max: ₹${maxAllowed.toFixed(0)}, Taken: ₹${taken.toFixed(0)}, Remaining: ₹${remaining.toFixed(0)}`,
    );
  }

  const request = await AdvanceRequest.create({
    employee: employeeId,
    restaurantID,
    askedMoney,
    description,
    remainingBalance: remaining,
    voiceNote: voiceNoteUrl,
    createdBy: req.user.id,
    assignTo,
  });

  req.app.get("io")?.to(`ADMIN_${restaurantID}`).emit("REQUEST_EVENT", {
    event: "REQUEST_CREATED",
    request: request._id,
  });

  res.status(201).json({ success: true, data: request });
});

// ─────────────────────────────────────────────
//  GET /api/advance-requests  (admin view, all for org)
// ─────────────────────────────────────────────
const getAllAdvanceRequests = asyncHandler(async (req, res) => {
  const { employeeId, status, page = 1, limit = 10 } = req.query;
  const query = { ...req.orgFilter };
  if (employeeId) query.employee = employeeId;
  if (status) query.status = status;

  const [requests, total] = await Promise.all([
    AdvanceRequest.find(query)
      .populate("employee", "name")
      .populate("createdBy", "name role")
      .populate("assignTo", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    AdvanceRequest.countDocuments(query),
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
//  GET /api/advance-requests/my  (employee view)
// ─────────────────────────────────────────────
const getMyAdvanceRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { employee: req.user.id };
  if (status) query.status = status;

  const requests = await AdvanceRequest.find(query)
    .populate("employee", "name")
    .populate("createdBy", "name role")
    .populate("assignTo", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, count: requests.length, data: requests });
});

// ─────────────────────────────────────────────
//  GET /api/advance-requests/:id
// ─────────────────────────────────────────────
const getAdvanceRequestById = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findById(req.params.id)
    .populate(
      "employee",
      "name position salary monthlyAdvanceTaken monthlySalaryReceived",
    )
    .populate("createdBy", "name role");

  if (!request) throw new ApiError(404, "Advance request not found");

  res.json({
    success: true,
    data: {
      ...request.toObject(),
      monthlySalary: request.employee.salary,
      usedBalance: request.employee.monthlyAdvanceTaken,
      salaryReceived: request.employee.monthlySalaryReceived,
      remainingBalance: request.remainingBalance,
    },
  });
});

// ─────────────────────────────────────────────
//  POST /api/advance-requests/filter
// ─────────────────────────────────────────────
const getAdvanceRequestsByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.body;
  const query = { ...req.orgFilter };
  if (status?.length) query.status = { $in: status };

  const [requests, total] = await Promise.all([
    AdvanceRequest.find(query)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    AdvanceRequest.countDocuments(query),
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
//  PATCH /api/advance-requests/:id/approve
// ─────────────────────────────────────────────
const approveAdvanceRequest = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Advance request not found");
  if (request.status !== "Pending")
    throw new ApiError(400, `Request is already ${request.status}`);

  const employee = await Employee.findById(request.employee);
  if (!employee) throw new ApiError(404, "Employee not found");

  employee.monthlyAdvanceTaken += request.askedMoney;
  await employee.save();

  request.approvedBy = req.user.id;
  request.status = "Completed";
  request.remainingBalance =
    employee.salary * 0.6 - employee.monthlyAdvanceTaken;
  await request.save();

  await SalaryTransaction.create({
    restaurantID: req.organizationID,
    employee: request.employee,
    amount: request.askedMoney,
    type: "advance",
  });

  await sendNotification(
    request.employee,
    "success",
    "advance",
    "Advance Request Approved",
    `Your advance request of ₹${request.askedMoney} has been approved.`,
    { advanceId: request._id.toString(), amount: request.askedMoney },
  );

  res.json({
    success: true,
    message: "Advance request approved",
    data: request,
  });
});

// ─────────────────────────────────────────────
//  PATCH /api/advance-requests/:id/reject
// ─────────────────────────────────────────────
const rejectAdvanceRequest = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Advance request not found");
  if (request.status !== "Pending")
    throw new ApiError(400, `Request is already ${request.status}`);

  const { reason } = req.body;
  request.status = "Rejected";
  if (reason) request.rejectionReason = reason;
  await request.save();

  await sendNotification(
    request.employee,
    "error",
    "advance",
    "Advance Request Rejected",
    `Your advance request of ₹${request.askedMoney} has been rejected.`,
    { advanceId: request._id.toString(), amount: request.askedMoney },
  );

  res.json({
    success: true,
    message: "Advance request rejected",
    data: request,
  });
});

// ─────────────────────────────────────────────
//  GET /api/advance-requests/transactions/:employeeId
// ─────────────────────────────────────────────
const getEmployeeTransactionHistory = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const employee = await Employee.findById(employeeId).select(
    "name salary monthlyAdvanceTaken monthlySalaryReceived",
  );
  if (!employee) throw new ApiError(404, "Employee not found");

  const transactions = await SalaryTransaction.find({ employee: employeeId })
    .sort({ date: -1 })
    .lean();

  res.json({ success: true, data: transactions });
});

// ─────────────────────────────────────────────
//  GET /api/advance-requests/transactions  (org level)
// ─────────────────────────────────────────────
const getOrgTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const query = { restaurantID: req.organizationID };
  if (type) query.type = type;

  const [transactions, total] = await Promise.all([
    SalaryTransaction.find(query)
      .sort({ date: -1 })
      .populate(
        "employee",
        "name salary monthlyAdvanceTaken monthlySalaryReceived",
      )
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    SalaryTransaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: transactions,
  });
});

export {
  createAdvanceRequest,
  getAllAdvanceRequests,
  getMyAdvanceRequests,
  getAdvanceRequestById,
  getAdvanceRequestsByFilter,
  approveAdvanceRequest,
  rejectAdvanceRequest,
  getEmployeeTransactionHistory,
  getOrgTransactionHistory,
};
