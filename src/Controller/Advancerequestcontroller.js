import asyncHandler from "express-async-handler";
import AdvanceRequest from "../../models/workforce/AdvanceRequest.js";
import SalaryTransaction from "../../models/workforce/SalaryTransaction.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import ApiError from "../../utils/ApiError.js";
import { sendNotification } from "../../services/notificationService.js";

const ADVANCE_LIMIT = 0.6; // 60% of monthly salary

// ─── Create ───────────────────────────────────────────────────────────────────

export const createAdvanceRequest = asyncHandler(async (req, res) => {
  const { askedMoney, description, assignTo, employeeId } = req.body;
  const { _id: createdBy, organizationID } = req.user;
  const voiceNote = req.file?.path || null;

  // Admin can pass employeeId to create on behalf; employee omits it
  const targetEmployeeId = employeeId || createdBy;

  const profile = await EmployeeProfile.findOne({ userID: targetEmployeeId });
  if (!profile) throw new ApiError(404, "Employee profile not found");

  const maxAllowed      = (profile.salary || 0) * ADVANCE_LIMIT;
  const alreadyTaken    = profile.monthlyAdvanceTaken || 0;
  const remainingBudget = maxAllowed - alreadyTaken;

  if (Number(askedMoney) > remainingBudget) {
    throw new ApiError(400, [
      `Advance exceeds 60% salary limit.`,
      `Max: ₹${maxAllowed.toFixed(0)}`,
      `Already taken: ₹${alreadyTaken.toFixed(0)}`,
      `Remaining: ₹${remainingBudget.toFixed(0)}`,
    ].join(" "));
  }

  const request = await AdvanceRequest.create({
    employee:        targetEmployeeId,
    organizationID,
    askedMoney:      Number(askedMoney),
    description,
    remainingBalance: remainingBudget,
    voiceNote,
    createdBy,
    assignTo,
  });

  req.app.get("io").to(`ORG_${organizationID}`).emit("REQUEST_EVENT", {
    event:     "ADVANCE_CREATED",
    requestId: request._id,
  });

  res.status(201).json({ success: true, data: request });
});

// ─── Get All (Admin) ──────────────────────────────────────────────────────────

export const getAllAdvanceRequests = asyncHandler(async (req, res) => {
  const { employeeId, page = 1, limit = 10 } = req.query;
  const query = { organizationID: req.user.organizationID };
  if (employeeId) query.employee = employeeId;

  const [requests, total] = await Promise.all([
    AdvanceRequest.find(query)
      .populate("employee",  "displayName")
      .populate("createdBy", "displayName")
      .populate("approvedBy","displayName")
      .populate("assignTo",  "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    AdvanceRequest.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: requests,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// ─── Get My Requests (Employee) ───────────────────────────────────────────────

export const getAdvanceRequestForEmployee = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { employee: req.user._id };
  if (status) query.status = status;

  const requests = await AdvanceRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// ─── Get By Filter ────────────────────────────────────────────────────────────

export const getAdvanceRequestByFilter = asyncHandler(async (req, res) => {
  const { status = [], page = 1, limit = 10 } = req.body;
  const query = { organizationID: req.user.organizationID };
  if (status.length) query.status = { $in: status };

  const [requests, total] = await Promise.all([
    AdvanceRequest.find(query)
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    AdvanceRequest.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: requests,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// ─── Get By ID ────────────────────────────────────────────────────────────────

export const getAdvanceRequestById = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findById(req.params.id)
    .populate("employee",   "displayName")
    .populate("createdBy",  "displayName")
    .populate("approvedBy", "displayName");

  if (!request) throw new ApiError(404, "Request not found");

  const profile = await EmployeeProfile.findOne({ userID: request.employee })
    .select("salary monthlyAdvanceTaken monthlySalaryReceived");

  res.status(200).json({
    success: true,
    data: {
      ...request.toObject(),
      employeeSummary: {
        salary:         profile?.salary               || 0,
        advanceTaken:   profile?.monthlyAdvanceTaken  || 0,
        salaryReceived: profile?.monthlySalaryReceived|| 0,
        maxAllowed:     (profile?.salary || 0) * ADVANCE_LIMIT,
        remaining:      request.remainingBalance,
      },
    },
  });
});

// ─── Approve ──────────────────────────────────────────────────────────────────

export const approveAdvanceRequest = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findOne({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!request) throw new ApiError(404, "Request not found");
  if (request.status !== "Pending") throw new ApiError(400, `Request already ${request.status}`);

  const profile = await EmployeeProfile.findOne({ userID: request.employee });
  if (!profile) throw new ApiError(404, "Employee profile not found");

  profile.monthlyAdvanceTaken = (profile.monthlyAdvanceTaken || 0) + request.askedMoney;
  await profile.save();

  const maxAllowed         = (profile.salary || 0) * ADVANCE_LIMIT;
  request.status           = "Approved";
  request.approvedBy       = req.user._id;
  request.remainingBalance = maxAllowed - profile.monthlyAdvanceTaken;
  await request.save();

  await SalaryTransaction.create({
    organizationID: req.user.organizationID,
    employee:       request.employee,
    amount:         request.askedMoney,
    type:           "advance",
  });

  await sendNotification({
    recipientID:    request.employee,
    organizationID: req.user.organizationID,
    senderID:       req.user._id,
    type:           "success",
    category:       "advance",
    title:          "Advance Approved",
    message:        `Your advance of ₹${request.askedMoney} has been approved.`,
    data:           { advanceId: request._id.toString(), amount: request.askedMoney },
  });

  res.status(200).json({ success: true, message: "Advance approved", data: request });
});

// ─── Reject ───────────────────────────────────────────────────────────────────

export const rejectAdvanceRequest = asyncHandler(async (req, res) => {
  const request = await AdvanceRequest.findOne({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!request) throw new ApiError(404, "Request not found");
  if (request.status !== "Pending") throw new ApiError(400, `Request already ${request.status}`);

  request.status     = "Rejected";
  request.approvedBy = req.user._id;
  await request.save();

  await sendNotification({
    recipientID:    request.employee,
    organizationID: req.user.organizationID,
    senderID:       req.user._id,
    type:           "error",
    category:       "advance",
    title:          "Advance Rejected",
    message:        `Your advance of ₹${request.askedMoney} has been rejected.`,
    data:           { advanceId: request._id.toString() },
  });

  res.status(200).json({ success: true, message: "Advance rejected", data: request });
});

// ─── Credit Salary ────────────────────────────────────────────────────────────

export const creditSalary = asyncHandler(async (req, res) => {
  const { employeeId, amount } = req.body;

  const profile = await EmployeeProfile.findOne({ userID: employeeId });
  if (!profile) throw new ApiError(404, "Employee profile not found");

  profile.monthlySalaryReceived = (profile.monthlySalaryReceived || 0) + Number(amount);
  profile.lastPaidAt            = new Date();
  profile.salaryStatus          = profile.monthlySalaryReceived >= profile.salary
    ? "Paid" : "Pending";
  await profile.save();

  await SalaryTransaction.create({
    organizationID: req.user.organizationID,
    employee:       employeeId,
    amount:         Number(amount),
    type:           "salary",
  });

  res.status(200).json({ success: true, message: "Salary credited" });
});

// ─── Transaction History — single employee ────────────────────────────────────

export const getEmployeeTransactionHistory = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const transactions = await SalaryTransaction.find({ employee: employeeId })
    .sort({ date: -1 })
    .lean();

  res.status(200).json({ success: true, data: transactions });
});

// ─── Transaction History — all employees (Admin) ──────────────────────────────
// Bug fix: original used SalaryTransaction.findById({ restaurantID }) — should be .find()

export const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const query = { organizationID: req.user.organizationID };
  if (type) query.type = type;

  const [transactions, total] = await Promise.all([
    SalaryTransaction.find(query)
      .populate("employee", "displayName")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    SalaryTransaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: transactions,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});