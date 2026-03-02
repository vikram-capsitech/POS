import User from "../../Models/core/User.js";
import EmployeeProfile from "../../Models/core/EmployeeProfile.js";
import AllocatedItems from "../../Models/resources/AllocatedItems.js";
import Document from "../../Models/resources/Document.js";
import Coins from "../../Models/finance/Coins.js";
import CoinsTransaction from "../../Models/finance/Coinstransaction.js";
import LeaveRequest from "../../Models/workforce/LeaveRequest.js";
import SalaryTransaction from "../../Models/workforce/SalaryTransaction.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import { logUserAction } from "../../Utils/Logger.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseJsonField = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return fallback;
};

// ─────────────────────────────────────────────
//  POST /api/employees
// ─────────────────────────────────────────────
export const addEmployee = asyncHandler(async (req, res) => {
  const organizationID = req.user.organizationID;
  const { email, userName, phoneNumber, displayName, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { userName }] });
  if (exists)
    throw new ApiError(400, "User with this email or username already exists");

  const profilePhoto = req.file?.path ?? null;

  // 1. Create the base User (no systemRole = regular org member)
  const user = await User.create({
    email,
    userName,
    phoneNumber,
    displayName: displayName ?? email,
    password: password ?? "Employee@123",
    profilePhoto,
    systemRole: null, // org members have no systemRole — they have roleID
    organizationID,
    isEmailVerified: true,
  });

  // 2. Create the EmployeeProfile with job-specific data
  const {
    position,
    jobRole,
    salary,
    hireDate,
    totalLeave,
    coinsPerMonth,
    fcmToken,
    access,
  } = req.body;

  const profile = await EmployeeProfile.create({
    userID: user._id,
    organizationID,
    position,
    jobRole,
    salary: salary ?? 0,
    hireDate: hireDate ?? Date.now(),
    totalLeave: totalLeave ?? 4,
    coinsPerMonth: coinsPerMonth ?? 0,
    fcmToken: fcmToken ?? null,
    access: parseJsonField(access, []),
  });

  // 3. Auto-create coin wallet
  await Coins.create({
    organizationID,
    employeeID: user._id,
    totalEarned: coinsPerMonth ?? 0,
    totalSpent: 0,
  });

  await logUserAction(req, "EMPLOYEE_ADDED", "EMPLOYEE", user._id, { 
    name: user.displayName,
    jobRole: profile.jobRole 
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { user, profile }, "Employee added successfully"),
    );
});

// ─────────────────────────────────────────────
//  GET /api/employees
// ─────────────────────────────────────────────
export const getAllEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, jobRole } = req.query;
  const { organizationID } = req.user;

  // Get all users in this org (excluding admins)
  const userFilter = { organizationID, systemRole: null };
  const profileFilter = { organizationID };
  if (jobRole) profileFilter.jobRole = jobRole;

  // Get profiles and their userIDs
  const profiles = await EmployeeProfile.find(profileFilter).lean();
  const userIds = profiles.map((p) => p.userID);

  const [users, total] = await Promise.all([
    User.find({ ...userFilter, _id: { $in: userIds } })
      .select(
        "-password -refreshToken -emailVerificationToken -forgotPasswordToken",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments({ ...userFilter, _id: { $in: userIds } }),
  ]);

  const profileMap = Object.fromEntries(
    profiles.map((p) => [p.userID.toString(), p]),
  );

  const data = users.map((u) => ({
    ...u.toObject(),
    profile: profileMap[u._id.toString()] ?? null,
  }));

  return res.json(
    new ApiResponse(200, {
      count: total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/employees/profile  (current user's own profile)
// ─────────────────────────────────────────────
export const getCurrentEmployeeProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );
  const profile = await EmployeeProfile.findOne({ userID: req.user._id });
  if (!user) throw new ApiError(404, "User not found");
  return res.json(new ApiResponse(200, { user, profile }));
});

// ─────────────────────────────────────────────
//  GET /api/employees/:id
// ─────────────────────────────────────────────
export const getEmployeeById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken",
  );
  if (!user) throw new ApiError(404, "Employee not found");
  const profile = await EmployeeProfile.findOne({ userID: req.params.id });
  return res.json(new ApiResponse(200, { user, profile }));
});

// ─────────────────────────────────────────────
//  PUT /api/employees/:id
// ─────────────────────────────────────────────
export const updateEmployeeById = asyncHandler(async (req, res) => {
  // Update base User
  const userFields = [
    "displayName",
    "email",
    "phoneNumber",
    "gender",
    "address",
    "profilePhoto",
  ];
  const userUpdate = {};
  userFields.forEach((k) => {
    if (req.body[k] !== undefined) userUpdate[k] = req.body[k];
  });
  if (req.file?.path) userUpdate.profilePhoto = req.file.path;

  // Update EmployeeProfile
  const profileFields = [
    "position",
    "jobRole",
    "salary",
    "hireDate",
    "employeeStatus",
    "totalLeave",
    "coinsPerMonth",
    "access",
    "fcmToken",
  ];
  const profileUpdate = {};
  profileFields.forEach((k) => {
    if (req.body[k] !== undefined) profileUpdate[k] = req.body[k];
  });
  if (req.body.access)
    profileUpdate.access = parseJsonField(req.body.access, []);

  const [oldUser, oldProfile] = await Promise.all([
    User.findById(req.params.id),
    EmployeeProfile.findOne({ userID: req.params.id })
  ]);

  const [user, profile] = await Promise.all([
    User.findByIdAndUpdate(
      req.params.id,
      { $set: userUpdate },
      { new: true, runValidators: true },
    ).select("-password -refreshToken"),
    EmployeeProfile.findOneAndUpdate(
      { userID: req.params.id },
      { $set: profileUpdate },
      { new: true, runValidators: true },
    ),
  ]);

  if (!user) throw new ApiError(404, "Employee not found");

  const changes = {};
  if (oldUser?.displayName !== user.displayName) changes.name = { from: oldUser.displayName, to: user.displayName };
  if (oldProfile?.jobRole !== profile.jobRole) changes.jobRole = { from: oldProfile.jobRole, to: profile.jobRole };
  if (oldProfile?.employeeStatus !== profile.employeeStatus) changes.status = { from: oldProfile.employeeStatus, to: profile.employeeStatus };

  await logUserAction(req, "EMPLOYEE_UPDATED", "EMPLOYEE", user._id, { name: user.displayName, changes });

  return res.json(new ApiResponse(200, { user, profile }, "Employee updated"));
});

// ─────────────────────────────────────────────
//  DELETE /api/employees/:id
// ─────────────────────────────────────────────
export const deleteEmployeeById = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "Employee not found");
  await EmployeeProfile.deleteOne({ userID: req.params.id });

  await logUserAction(req, "EMPLOYEE_DELETED", "EMPLOYEE", req.params.id, { name: user.displayName });

  return res.json(new ApiResponse(200, {}, "Employee deleted successfully"));
});

// ─────────────────────────────────────────────
//  PUT /api/employees/received/:id  (mark allotted item as received)
// ─────────────────────────────────────────────
export const receiveAllotedItem = asyncHandler(async (req, res) => {
  const { status } = req.body; // "Received" | "Returned"
  const item = await AllocatedItems.findByIdAndUpdate(
    req.params.id,
    { $set: { status: status ?? "Received" } },
    { new: true },
  );
  if (!item) throw new ApiError(404, "Allocated item not found");
  return res.json(new ApiResponse(200, item, "Item status updated"));
});

// ─────────────────────────────────────────────
//  GET /api/employees/overview/:employeeId
// ─────────────────────────────────────────────
export const getEmployeeOverview = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { type, month, year } = req.query;
  const { organizationID } = req.user;

  const user = await User.findById(employeeId).select(
    "-password -refreshToken",
  );
  if (!user) throw new ApiError(404, "Employee not found");
  const profile = await EmployeeProfile.findOne({ userID: employeeId });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const filterMonth = month !== undefined ? Number(month) : currentMonth;
  const filterYear = year !== undefined ? Number(year) : currentYear;

  const filterStart = new Date(filterYear, filterMonth, 1);
  const filterEnd = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59);
  const currentStart = new Date(currentYear, currentMonth, 1);
  const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  const [salaryAll, leavesAll, wallet, allocatedItems, documents, coinsTxAll] =
    await Promise.all([
      SalaryTransaction.find({ employee: employeeId })
        .sort({ date: -1 })
        .lean(),
      LeaveRequest.find({ createdBy: employeeId })
        .sort({ startDate: -1 })
        .lean(),
      Coins.findOne({ employeeID: employeeId }).lean(),
      AllocatedItems.find({ issuedTo: employeeId, organizationID }).lean(),
      Document.find({ employeeID: employeeId, organizationID })
        .populate("employeeID", "displayName")
        .lean(),
      CoinsTransaction.find({ employeeID: employeeId })
        .sort({ date: -1 })
        .lean(),
    ]);

  // Default: current month data
  let salary = salaryAll.filter(
    (t) => t.currentMonth === currentMonth && t.currentYear === currentYear,
  );
  let leave = leavesAll.filter(
    (l) =>
      new Date(l.startDate) >= currentStart &&
      new Date(l.startDate) <= currentEnd,
  );
  let coinsTransactions = coinsTxAll.filter(
    (c) => new Date(c.date) >= currentStart && new Date(c.date) <= currentEnd,
  );

  if (type === "salary") {
    salary = salaryAll.filter(
      (t) => t.currentMonth === filterMonth && t.currentYear === filterYear,
    );
  }
  if (type === "leave") {
    leave = leavesAll.filter(
      (l) =>
        new Date(l.startDate) >= filterStart &&
        new Date(l.startDate) <= filterEnd,
    );
  }
  if (type === "coins") {
    coinsTransactions = coinsTxAll.filter(
      (c) => new Date(c.date) >= filterStart && new Date(c.date) <= filterEnd,
    );
  }

  return res.json(
    new ApiResponse(200, {
      appliedFilter: type ?? "current-month",
      user,
      profile,
      salary,
      leave,
      coins: {
        transactions: coinsTransactions,
        totalEarned: wallet?.totalEarned ?? 0,
        totalSpent: wallet?.totalSpent ?? 0,
        balance: (wallet?.totalEarned ?? 0) - (wallet?.totalSpent ?? 0),
      },
      allocatedItems,
      documents,
    }),
  );
});
