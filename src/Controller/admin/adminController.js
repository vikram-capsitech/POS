import User from "../../Models/core/User.js";
import Organization from "../../Models/core/Organization.js";
import EmployeeProfile from "../../Models/core/EmployeeProfile.js";
import Role from "../../Models/core/Role.js";
import Permission from "../../Models/core/Permission.js";
import Task from "../../Models/operations/Task.js";
import Attendance from "../../Models/workforce/Attendance.js";
import LeaveRequest from "../../Models/workforce/LeaveRequest.js";
import Order from "../../Models/pos/Order.js";
import UserLog from "../../Models/core/UserLog.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
//  POST /api/admin/organizations
// ─────────────────────────────────────────────
export const addOrganization = asyncHandler(async (req, res) => {
  const { name, type, address, contactEmail, contactPhone, slug } = req.body;

  const logo = req.file?.path ?? null;

  const org = await Organization.create({
    name,
    type,
    address,
    contactEmail,
    contactPhone,
    slug,
    logo,
    ownedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, org, "Organization created successfully"));
});

// ─────────────────────────────────────────────
//  GET /api/admin/organizations
// ─────────────────────────────────────────────
export const getOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find()
    .populate("ownedBy", "displayName email")
    .sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, { count: orgs.length, data: orgs }));
});

// ─────────────────────────────────────────────
//  PUT /api/admin/organizations/:id
// ─────────────────────────────────────────────
export const updateOrganization = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    address,
    contactEmail,
    contactPhone,
    slug,
    theme,
    modules,
  } = req.body;

  // Admin can only update their own org; superadmin can update any org
  let orgId = req.params.id;
  if (
    req.user.systemRole === "admin" &&
    req.user.organizationID.toString() !== orgId
  ) {
    throw new ApiError(403, "Not authorized to update this organization");
  }
  if (!orgId) throw new ApiError(400, "Organization ID is required");

  const update = {};
  if (name !== undefined) update.name = name;
  if (type !== undefined) update.type = type;
  if (address !== undefined) update.address = address;
  if (contactEmail !== undefined) update.contactEmail = contactEmail;
  if (contactPhone !== undefined) update.contactPhone = contactPhone;
  if (slug !== undefined) update.slug = slug;
  if (theme !== undefined) update["settings.theme"] = theme;
  if (modules !== undefined) update.modules = modules;

  if (req.file?.path) update.logo = req.file.path;

  const updated = await Organization.findByIdAndUpdate(
    orgId,
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updated) throw new ApiError(404, "Organization not found");

  return res.json(new ApiResponse(200, updated, "Organization updated"));
});

// ─────────────────────────────────────────────
//  POST /api/admin/admins   (superadmin creates an org + admin user)
// ─────────────────────────────────────────────
export const addAdmin = asyncHandler(async (req, res) => {
  const {
    email,
    userName,
    phoneNumber,
    displayName,
    password,
    gender,
    address,
    dob,
    organizationName,
    organizationAddress,
    contactPhone,
    orgType,
  } = req.body;

  if (!email || !userName || !phoneNumber) {
    throw new ApiError(400, "email, userName, and phoneNumber are required");
  }

  const exists = await User.findOne({ $or: [{ email }, { userName }] });
  if (exists)
    throw new ApiError(400, "User with this email or username already exists");

  const profilePhoto = req.files?.profilePhoto?.[0]?.path ?? null;
  const orgLogo = req.files?.organizationLogo?.[0]?.path ?? null;

  // Create the Organization first
  const org = await Organization.create({
    name: organizationName ?? displayName ?? email,
    type: orgType ?? "other",
    address: organizationAddress ?? "",
    contactEmail: email,
    contactPhone: contactPhone ?? phoneNumber,
    logo: orgLogo,
    ownedBy: req.user._id,
  });

  // Create the admin User — explicit field pick (never spread req.body)
  const admin = await User.create({
    email,
    userName,
    phoneNumber,
    displayName: displayName ?? email,
    password: password ?? "Admin@123",
    gender: gender ?? null,
    address: address ?? "",
    dob: dob ?? null,
    profilePhoto,
    systemRole: "admin",
    organizationID: org._id,
    isEmailVerified: true,
  });

  const safe = admin.toObject();
  delete safe.password;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { admin: safe, organization: org },
        "Admin and organization created",
      ),
    );
});

// ─────────────────────────────────────────────
//  GET /api/admin/users
// ─────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, systemRole, orgId } = req.query;

  const filter = {};
  if (systemRole) filter.systemRole = systemRole;
  // superadmin can filter by org; admin only sees their own org
  if (req.user.systemRole === "admin") {
    filter.organizationID = req.user.organizationID;
  } else if (orgId) {
    filter.organizationID = orgId;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "-password -refreshToken -emailVerificationToken -forgotPasswordToken",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return res.json(
    new ApiResponse(200, {
      count: total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: users,
    }),
  );
});

// ─────────────────────────────────────────────
//  GET /api/admin/users/:id
// ─────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select(
      "-password -refreshToken -emailVerificationToken -forgotPasswordToken",
    )
    .populate("organizationID", "name type")
    .populate("roleID", "name displayName permissions");

  if (!user) throw new ApiError(404, "User not found");

  const profile = await EmployeeProfile.findOne({ userID: user._id });

  return res.json(new ApiResponse(200, { user, profile }));
});

// ─────────────────────────────────────────────
//  PUT /api/admin/users/:id
// ─────────────────────────────────────────────
export const updateUserById = asyncHandler(async (req, res) => {
  const ALLOWED = [
    "displayName",
    "phoneNumber",
    "email",
    "gender",
    "address",
    "designation",
  ];
  const updates = {};
  ALLOWED.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  if (req.file?.path) updates.profilePhoto = req.file.path;

  // Email uniqueness check
  if (updates.email) {
    const taken = await User.findOne({
      email: updates.email,
      _id: { $ne: req.params.id },
    });
    if (taken) throw new ApiError(400, "Email already in use");
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!updated) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, updated, "User updated successfully"));
});

// ─────────────────────────────────────────────
//  DELETE /api/admin/users/:id
// ─────────────────────────────────────────────
export const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  // Clean up their EmployeeProfile if any
  await EmployeeProfile.deleteOne({ userID: req.params.id });

  return res.json(new ApiResponse(200, {}, "User deleted successfully"));
});

// ─────────────────────────────────────────────
//  PUT /api/admin/users/:id/role
// ─────────────────────────────────────────────
export const assignRole = asyncHandler(async (req, res) => {
  const { roleID, organizationID } = req.body;

  const role = await Role.findById(roleID);
  if (!role) throw new ApiError(404, "Role not found");

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { roleID, organizationID } },
    { new: true },
  ).select("-password -refreshToken");

  if (!updated) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, updated, "Role assigned successfully"));
});

// ─────────────────────────────────────────────
//  POST /api/admin/roles
// ─────────────────────────────────────────────
export const createRole = asyncHandler(async (req, res) => {
  const { name, displayName, permissions, organizationID } = req.body;

  // Admin can only create roles for their own org
  const orgId =
    req.user.systemRole === "admin" ? req.user.organizationID : organizationID;

  const role = await Role.create({
    name,
    displayName,
    permissions,
    organizationID: orgId,
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, role, "Role created"));
});

// ─────────────────────────────────────────────
//  GET /api/admin/roles
// ─────────────────────────────────────────────
export const getAllRoles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.systemRole === "admin") {
    filter.organizationID = req.user.organizationID;
  } else if (req.query.orgId) {
    filter.organizationID = req.query.orgId;
  }

  const roles = await Role.find(filter)
    .populate("permissions", "key label module")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, { count: roles.length, data: roles }));
});

// ─────────────────────────────────────────────
//  PUT /api/admin/roles/:id
// ─────────────────────────────────────────────
export const updateRole = asyncHandler(async (req, res) => {
  const { displayName, permissions, isActive } = req.body;

  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, "Role not found");

  if (role.isDefault)
    throw new ApiError(403, "System default roles cannot be modified");

  if (displayName !== undefined) role.displayName = displayName;
  if (permissions !== undefined) role.permissions = permissions;
  if (isActive !== undefined) role.isActive = isActive;

  await role.save();

  return res.json(new ApiResponse(200, role, "Role updated"));
});

// ─────────────────────────────────────────────
//  DELETE /api/admin/roles/:id
// ─────────────────────────────────────────────
export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, "Role not found");

  if (role.isDefault)
    throw new ApiError(403, "System default roles cannot be deleted");

  await role.deleteOne();

  return res.json(new ApiResponse(200, {}, "Role deleted successfully"));
});

// ─────────────────────────────────────────────
//  GET /api/pos/organization  (current user's org)
// ─────────────────────────────────────────────
export const getOrganization = asyncHandler(async (req, res) => {
  if (!req.user.organizationID)
    throw new ApiError(400, "No organization linked to this account");
  const org = await Organization.findById(req.user.organizationID).populate(
    "ownedBy",
    "displayName email",
  );
  if (!org) throw new ApiError(404, "Organization not found");
  return res.json(new ApiResponse(200, org));
});

// ─────────────────────────────────────────────
//  POST /api/pos/organization  (superadmin)
// ─────────────────────────────────────────────
export const createOrganization = asyncHandler(async (req, res) => {
  const { name, type, address, contactEmail, contactPhone, slug } = req.body;
  const logo = req.file?.path ?? null;
  const org = await Organization.create({
    name,
    type,
    address,
    contactEmail,
    contactPhone,
    slug,
    logo,
    ownedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, org, "Organization created"));
});

// Removed duplicate updateOrganization function

// ─────────────────────────────────────────────
//  GET /api/admin/dashboard
//  Returns per-org aggregated stats for the admin dashboard
// ─────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const isSuperadmin = req.user.systemRole === "superadmin";

  // Determine which orgs to aggregate
  let orgFilter = {};
  if (!isSuperadmin) {
    // Admin sees only their own org
    if (!req.user.organizationID)
      throw new ApiError(400, "No organization linked");
    orgFilter = { _id: req.user.organizationID };
  }
  // Optional org filter from query
  if (req.query.orgId) {
    orgFilter._id = new mongoose.Types.ObjectId(req.query.orgId);
  }

  const orgs = await Organization.find(orgFilter)
    .populate("ownedBy", "displayName email")
    .sort({ createdAt: -1 });

  if (!orgs.length) {
    return res.json(
      new ApiResponse(200, { orgs: [], totals: {} }, "No organizations found"),
    );
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const last30Start = new Date(now);
  last30Start.setDate(last30Start.getDate() - 29);
  last30Start.setHours(0, 0, 0, 0);

  // ── Aggregate all orgs in parallel ──────────────────────────────────────
  const orgStats = await Promise.all(
    orgs.map(async (org) => {
      const orgId = org._id;

      const [
        taskStatusAgg,
        taskPriorityAgg,
        employeeCount,
        todayAttendance,
        pendingLeaves,
        posOrderAgg,
        recentLogs,
      ] = await Promise.all([
        // Task by status
        Task.aggregate([
          { $match: { organizationID: orgId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        // Task by priority
        Task.aggregate([
          { $match: { organizationID: orgId } },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        // Employee count
        EmployeeProfile.countDocuments({ organizationID: orgId }),
        // Today's check-ins
        Attendance.countDocuments({
          organizationID: orgId,
          date: { $gte: todayStart, $lte: todayEnd },
          checkIn: { $ne: null },
        }),
        // Pending leave requests
        LeaveRequest.countDocuments({
          organizationID: orgId,
          status: "Pending",
        }),
        // POS orders — last 30 days
        Order.aggregate([
          {
            $match: {
              organizationID: orgId,
              createdAt: { $gte: last30Start, $lte: todayEnd },
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: { $ifNull: ["$finalAmount", "$total"] } },
              completedOrders: {
                $sum: {
                  $cond: [{ $in: ["$status", ["paid", "served"]] }, 1, 0],
                },
              },
            },
          },
        ]),
        // Recent activity logs (last 5)
        UserLog.find({ organizationID: orgId })
          .populate("userID", "displayName userName")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      // ── Shape task stats ─────────────────────────────────────────────────
      const taskByStatus = {
        Pending: 0,
        "In Progress": 0,
        Completed: 0,
        Rejected: 0,
      };
      let totalTasks = 0;
      taskStatusAgg.forEach((t) => {
        taskByStatus[t._id] = t.count;
        totalTasks += t.count;
      });

      const taskByPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      taskPriorityAgg.forEach((t) => {
        taskByPriority[t._id] = t.count;
      });

      const pos = posOrderAgg[0] ?? {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
      };

      return {
        org: {
          _id: org._id,
          name: org.name,
          type: org.type,
          logo: org.logo,
          slug: org.slug,
          modules: org.modules ?? {},
          isActive: org.isActive,
          ownedBy: org.ownedBy,
          contactEmail: org.contactEmail,
          contactPhone: org.contactPhone,
        },
        tasks: {
          total: totalTasks,
          byStatus: taskByStatus,
          byPriority: taskByPriority,
        },
        employees: employeeCount,
        todayAttendance,
        pendingLeaves,
        pos: {
          totalOrders: pos.totalOrders,
          totalRevenue: Number((pos.totalRevenue ?? 0).toFixed(2)),
          completedOrders: pos.completedOrders,
        },
        recentActivity: recentLogs,
      };
    }),
  );

  // ── Compute combined totals ──────────────────────────────────────────────
  const totals = orgStats.reduce(
    (acc, s) => ({
      totalEmployees: acc.totalEmployees + s.employees,
      totalTasks: acc.totalTasks + s.tasks.total,
      totalPendingLeaves: acc.totalPendingLeaves + s.pendingLeaves,
      totalTodayAttendance: acc.totalTodayAttendance + s.todayAttendance,
      totalRevenue: acc.totalRevenue + s.pos.totalRevenue,
      totalOrders: acc.totalOrders + s.pos.totalOrders,
    }),
    {
      totalEmployees: 0,
      totalTasks: 0,
      totalPendingLeaves: 0,
      totalTodayAttendance: 0,
      totalRevenue: 0,
      totalOrders: 0,
    },
  );

  return res.json(
    new ApiResponse(
      200,
      { orgs: orgStats, totals, orgCount: orgs.length },
      "Dashboard stats fetched",
    ),
  );
});
