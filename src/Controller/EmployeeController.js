import asyncHandler from "express-async-handler";
import User from "../../models/core/User.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import Coins from "../../models/finance/Coins.js";
import Document from "../../models/resources/Document.js";
import AllocatedItems from "../../models/resources/AllocatedItems.js";
import LeaveRequest from "../../models/workforce/LeaveRequest.js";
import SalaryTransaction from "../../models/workforce/SalaryTransaction.js";
import ApiError from "../../utils/ApiError.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

const parseJsonField = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
};

// ─── Add Employee ─────────────────────────────────────────────────────────────

export const addEmployee = asyncHandler(async (req, res) => {
  const { email, userName, password, phoneNumber, roleID } = req.body;
  const organizationID = req.user.organizationID;

  const [emailExists, userNameExists] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ userName }),
  ]);

  if (emailExists)    throw new ApiError(400, "Email already exists");
  if (userNameExists) throw new ApiError(400, "Username already taken");

  let profilePhoto = null;
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, "profiles");
    profilePhoto = r.secure_url;
  }

  const user = await User.create({
    userName,
    email,
    password:        password || "123456",
    phoneNumber,
    profilePhoto,
    roleID:          roleID || null,
    organizationID,
    isEmailVerified: true,
  });

  const {
    position, salary, hireDate, designation,
    totalLeave, coinsPerMonth, access,
  } = req.body;

  const profile = await EmployeeProfile.create({
    userID:         user._id,
    organizationID,
    position:       position   || "employee",
    salary:         Number(salary)      || 0,
    hireDate:       hireDate   || new Date(),
    designation,
    totalLeave:     Number(totalLeave)  || 4,
    coinsPerMonth:  Number(coinsPerMonth) || 0,
    access:         parseJsonField(access),
  });

  // Auto-create coin wallet
  await Coins.create({ organizationID, employeeID: user._id, totalEarned: 0, totalSpent: 0 });

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data:    { user, profile },
  });
});

// ─── Get All Employees ────────────────────────────────────────────────────────

export const getAllEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, position } = req.query;
  const organizationID = req.user.organizationID;

  // Build user filter from search
  let userIds = null;
  if (search) {
    const matchedUsers = await User.find({
      organizationID,
      $or: [
        { displayName: { $regex: search, $options: "i" } },
        { email:       { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    userIds = matchedUsers.map((u) => u._id);
  }

  const profileQuery = { organizationID };
  if (position)            profileQuery.position = position;
  if (userIds !== null)    profileQuery.userID   = { $in: userIds };

  const [profiles, total] = await Promise.all([
    EmployeeProfile.find(profileQuery)
      .populate("userID", "-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    EmployeeProfile.countDocuments(profileQuery),
  ]);

  // Attach document count per employee in parallel
  const result = await Promise.all(
    profiles.map(async (p) => {
      const docCount = await Document.countDocuments({ employeeID: p.userID?._id });
      return { ...p, documentCount: docCount };
    })
  );

  res.status(200).json({
    success: true, count: total, data: result,
    page: Number(page), limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// ─── Get Employee By ID ───────────────────────────────────────────────────────

export const getEmployeeById = asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.findOne({
    userID:         req.params.id,
    organizationID: req.user.organizationID,
  }).populate("userID", "-password -refreshToken");

  if (!profile) throw new ApiError(404, "Employee not found");

  res.status(200).json({ success: true, data: profile });
});

// ─── Update Employee ──────────────────────────────────────────────────────────

export const updateEmployeeById = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!user) throw new ApiError(404, "Employee not found");

  // Check email uniqueness if changing
  if (req.body.email && req.body.email !== user.email) {
    const taken = await User.findOne({ email: req.body.email });
    if (taken) throw new ApiError(400, "Email already in use");
  }

  const userFields = ["displayName", "userName", "phoneNumber", "email", "gender", "address", "designation"];
  userFields.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, "profiles");
    user.profilePhoto = r.secure_url;
  }
  await user.save();

  // Profile update
  const profileFields = ["position", "salary", "totalLeave", "coinsPerMonth", "employeeStatus", "designation", "hireDate"];
  const profileUpdate = {};
  profileFields.forEach((f) => { if (req.body[f] !== undefined) profileUpdate[f] = req.body[f]; });
  if (req.body.access) profileUpdate.access = parseJsonField(req.body.access);

  const profile = await EmployeeProfile.findOneAndUpdate(
    { userID: user._id },
    profileUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data:    { user, profile },
  });
});

// ─── Delete Employee ──────────────────────────────────────────────────────────

export const deleteEmployeeById = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!user) throw new ApiError(404, "Employee not found");

  // Cascade: delete profile
  await EmployeeProfile.findOneAndDelete({ userID: req.params.id });

  res.status(200).json({ success: true, message: "Employee deleted" });
});

// ─── My Profile (logged-in employee) ─────────────────────────────────────────

export const getCurrentEmployeeProfile = asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.findOne({ userID: req.user._id })
    .populate("userID", "-password -refreshToken")
    .populate("organizationID", "name theme modules wifiSsid wifiPass");

  if (!profile) throw new ApiError(404, "Employee profile not found");

  res.status(200).json({ success: true, data: profile });
});

// ─── Receive Alloted Item ─────────────────────────────────────────────────────

export const receiveAllotedItem = asyncHandler(async (req, res) => {
  const profile = await EmployeeProfile.findOne({ userID: req.params.id });
  if (!profile) throw new ApiError(404, "Employee not found");

  profile.allotedItems = parseJsonField(req.body.allotedItems, []);
  await profile.save();

  res.status(200).json({ success: true, data: profile });
});

// ─── Employee Overview (rich aggregated data) ─────────────────────────────────
// Bug fix: original getEmployeeOverviewForFutere (typo) had broken filtering logic.
// Now unified into one endpoint with optional ?type=salary|leave|coins&month=0&year=2025

export const getEmployeeOverview = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { type, month, year } = req.query;

  const profile = await EmployeeProfile.findOne({
    userID:         employeeId,
    organizationID: req.user.organizationID,
  }).populate("userID", "-password -refreshToken");

  if (!profile) throw new ApiError(404, "Employee not found");

  const now = new Date();
  const cm  = month !== undefined ? Number(month) : now.getMonth();
  const cy  = year  !== undefined ? Number(year)  : now.getFullYear();

  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const selStart = new Date(cy, cm, 1);
  const selEnd   = new Date(cy, cm + 1, 0, 23, 59, 59);

  const [transactions, allocatedItems, wallet, leaves, documents] = await Promise.all([
    SalaryTransaction.find({ employee: employeeId }).sort({ date: -1 }).lean(),
    AllocatedItems.find({ issuedTo: employeeId, organizationID: req.user.organizationID }).lean(),
    Coins.findOne({ employeeID: employeeId }).lean(),
    LeaveRequest.find({ createdBy: employeeId }).sort({ createdAt: -1 }).lean(),
    Document.find({ employeeID: employeeId, organizationID: req.user.organizationID }).lean(),
  ]);

  // Filter salary — if type=salary use selected month, else current month
  const [salStart, salEnd] = type === "salary"
    ? [{ currentMonth: cm, currentYear: cy }]
    : [{ currentMonth: now.getMonth(), currentYear: now.getFullYear() }];

  const filteredSalary = transactions.filter((t) =>
    type === "salary"
      ? t.currentMonth === cm && t.currentYear === cy
      : t.currentMonth === now.getMonth() && t.currentYear === now.getFullYear()
  );

  const [leaveRangeStart, leaveRangeEnd] = type === "leave" ? [selStart, selEnd] : [curStart, curEnd];
  const filteredLeaves = leaves.filter((l) => {
    const d = new Date(l.startDate);
    return d >= leaveRangeStart && d <= leaveRangeEnd;
  });

  const balance = (wallet?.totalEarned || 0) - (wallet?.totalSpent || 0);

  res.status(200).json({
    success:       true,
    appliedFilter: type || "current-month",
    data: {
      employee:       profile,
      salary:         filteredSalary,
      leaves:         filteredLeaves,
      allocatedItems,
      documents,
      coins: {
        totalEarned: wallet?.totalEarned || 0,
        totalSpent:  wallet?.totalSpent  || 0,
        balance,
      },
    },
  });
});