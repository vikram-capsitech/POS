import asyncHandler from "express-async-handler";
import User from "../../models/core/User.js";
import Organization from "../../models/core/Organization.js";
import Role from "../../models/core/Role.js";
import Permission from "../../models/core/Permission.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import Coins from "../../models/finance/Coins.js";
import ApiError from "../../utils/ApiError.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// ─── Organizations ────────────────────────────────────────────────────────────

export const getOrganizations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };

  const [orgs, total] = await Promise.all([
    Organization.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Organization.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: orgs,
    page: Number(page), totalPages: Math.ceil(total / limit),
  });
});

export const addAdmin = asyncHandler(async (req, res) => {
  const {
    userName, email, password, phoneNumber,
    organizationName, organizationAddress,
    gstIn, fssaiLicense, contactPhone, monthlyfee,
  } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) throw new ApiError(400, "Email already exists");

  let profilePhoto     = null;
  let organizationLogo = null;

  if (req.files?.profilePhoto?.[0]) {
    const r = await uploadToCloudinary(req.files.profilePhoto[0].buffer, "profiles");
    profilePhoto = r.secure_url;
  }
  if (req.files?.organizationLogo?.[0]) {
    const r = await uploadToCloudinary(req.files.organizationLogo[0].buffer, "org-logos");
    organizationLogo = r.secure_url;
  }

  // Create org first
  const org = await Organization.create({
    name:    organizationName || userName,
    address: organizationAddress || "Not specified",
    logo:    organizationLogo,
    meta:    { gstIn, fssaiLicense, contactPhone },
  });

  // Create admin user linked to org
  const admin = await User.create({
    userName,
    email,
    password:        password || "123456",
    phoneNumber,
    profilePhoto,
    systemRole:      "admin",
    organizationID:  org._id,
    monthlyfee:      monthlyfee || 0,
    isEmailVerified: true,
  });

  const { password: _, ...safeAdmin } = admin.toObject();

  res.status(201).json({
    success: true,
    message: "Admin and organization created successfully",
    data: {
      admin:        safeAdmin,
      organization: { _id: org._id, name: org.name, address: org.address },
    },
  });
});

export const updateUserById = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);
  if (!admin) throw new ApiError(404, "User not found");

  // Email uniqueness
  if (req.body.email && req.body.email !== admin.email) {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) throw new ApiError(400, "Email already in use");
  }

  const userAllowed = ["displayName", "userName", "phoneNumber", "email", "gender", "monthlyfee", "designation"];
  userAllowed.forEach((f) => { if (req.body[f] !== undefined) admin[f] = req.body[f]; });

  if (req.files?.profilePhoto?.[0]) {
    const r = await uploadToCloudinary(req.files.profilePhoto[0].buffer, "profiles");
    admin.profilePhoto = r.secure_url;
  }

  await admin.save();

  // Update organization if fields provided
  let orgData = null;
  if (admin.organizationID) {
    const org = await Organization.findById(admin.organizationID);
    if (org) {
      const orgAllowed = {
        organizationName: "name",
        gstIn:            "meta.gstIn",
        fssaiLicense:     "meta.fssaiLicense",
        contactPhone:     "meta.contactPhone",
      };

      Object.entries(orgAllowed).forEach(([bodyKey, modelKey]) => {
        if (req.body[bodyKey] !== undefined) {
          // handle nested paths
          const parts = modelKey.split(".");
          if (parts.length === 2) {
            org[parts[0]] = org[parts[0]] || {};
            org[parts[0]][parts[1]] = req.body[bodyKey];
            org.markModified(parts[0]);
          } else {
            org[modelKey] = req.body[bodyKey];
          }
        }
      });

      if (req.files?.organizationLogo?.[0]) {
        const r = await uploadToCloudinary(req.files.organizationLogo[0].buffer, "org-logos");
        org.logo = r.secure_url;
      }

      await org.save();
      orgData = org.toObject();
    }
  }

  const { password, ...safeAdmin } = admin.toObject();

  res.status(200).json({
    success: true,
    message: "Updated successfully",
    data: { admin: safeAdmin, organization: orgData },
  });
});

export const deleteAdminById = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "Admin not found");

  res.status(200).json({ success: true, message: "Admin deleted successfully" });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, systemRole, organizationID, search } = req.query;
  const query = {};

  // Admins can only see their own org
  if (req.user.systemRole === "admin") {
    query.organizationID = req.user.organizationID;
  } else {
    if (organizationID) query.organizationID = organizationID;
    if (systemRole)     query.systemRole     = systemRole;
  }

  if (search) {
    query.$or = [
      { displayName: { $regex: search, $options: "i" } },
      { email:       { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .populate("organizationID", "name")
      .populate("roleID", "name displayName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true, count: total, data: users,
    page: Number(page), totalPages: Math.ceil(total / limit),
  });
});

export const getUsersById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshToken")
    .populate("organizationID")
    .populate("roleID", "name displayName permissions");

  if (!user) throw new ApiError(404, "User not found");

  const [employeeCount, managerCount] = await Promise.all([
    EmployeeProfile.countDocuments({ organizationID: user.organizationID }),
    EmployeeProfile.countDocuments({ organizationID: user.organizationID, position: "manager" }),
  ]);

  res.status(200).json({
    success: true,
    data: { ...user.toObject(), employeeCount, managerCount },
  });
});

// ─── Organization Theme / Modules ─────────────────────────────────────────────

export const updateOrganizationTheme = asyncHandler(async (req, res) => {
  const { theme, modules } = req.body;

  const orgId = req.user.systemRole === "superadmin"
    ? req.params.id
    : req.user.organizationID;

  if (!orgId) throw new ApiError(400, "Organization ID required");

  const update = {};
  if (theme)   update.theme   = theme;
  if (modules) update.modules = modules;

  const org = await Organization.findByIdAndUpdate(orgId, update, {
    new:           true,
    runValidators: true,
  });

  if (!org) throw new ApiError(404, "Organization not found");
  res.status(200).json({ success: true, data: org });
});

// ─── Role Management ──────────────────────────────────────────────────────────

export const getAllRoles = asyncHandler(async (req, res) => {
  const orgId = req.user.systemRole === "superadmin"
    ? req.query.organizationID
    : req.user.organizationID;

  const roles = await Role.find({ organizationID: orgId })
    .populate("permissions", "key description module");

  res.status(200).json({ success: true, count: roles.length, data: roles });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, displayName, permissions } = req.body;
  const organizationID = req.user.organizationID;

  const exists = await Role.findOne({ name, organizationID });
  if (exists) throw new ApiError(400, "Role name already exists in your organization");

  // Validate all permission IDs
  if (permissions?.length) {
    const valid = await Permission.find({ _id: { $in: permissions } });
    if (valid.length !== permissions.length) {
      throw new ApiError(400, "One or more permission IDs are invalid");
    }
  }

  const role = await Role.create({ name, displayName, permissions, organizationID });

  res.status(201).json({ success: true, message: "Role created", data: role });
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findOne({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!role) throw new ApiError(404, "Role not found");

  if (req.body.displayName)          role.displayName = req.body.displayName;
  if (req.body.permissions)          role.permissions = req.body.permissions;
  if (req.body.isActive !== undefined) role.isActive  = req.body.isActive;

  await role.save();
  res.status(200).json({ success: true, data: role });
});

export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndDelete({
    _id:            req.params.id,
    organizationID: req.user.organizationID,
  });
  if (!role) throw new ApiError(404, "Role not found");

  res.status(200).json({ success: true, message: "Role deleted" });
});

export const assignRole = asyncHandler(async (req, res) => {
  const { roleID } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  // Ensure role belongs to same org
  const role = await Role.findOne({ _id: roleID, organizationID: req.user.organizationID });
  if (!role) throw new ApiError(404, "Role not found in your organization");

  user.roleID     = roleID;
  user.systemRole = null;
  await user.save();

  res.status(200).json({ success: true, message: `Role "${role.displayName}" assigned` });
});

// ─── Payments (Superadmin billing for admins) ─────────────────────────────────

export const getPaymentsByMonthYear = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (month === undefined || year === undefined) {
    throw new ApiError(400, "Month and year required");
  }

  const payments = await (await import("../../models/finance/Payments.js")).default.aggregate([
    { $match: { currentMonth: Number(month), currentYear: Number(year) } },
    { $lookup: { from: "users", localField: "admin", foreignField: "_id", as: "admin" } },
    { $unwind: "$admin" },
    {
      $project: {
        _id: 1,
        adminId:         "$admin._id",
        adminName:       "$admin.displayName",
        monthlyFee:      "$admin.monthlyfee",
        status:          1,
        lastPaymentDate: "$date",
        month:           "$currentMonth",
        year:            "$currentYear",
        organizationID:  1,
      },
    },
    { $sort: { lastPaymentDate: -1 } },
  ]);

  res.status(200).json({ success: true, count: payments.length, data: payments });
});

export const createPayment = asyncHandler(async (req, res) => {
  let { admins, status } = req.body;

  if (!Array.isArray(admins)) admins = [admins];
  if (!admins.length) throw new ApiError(400, "Admins array required");

  const Payments = (await import("../../models/finance/Payments.js")).default;
  const now = new Date();

  const payments = await Promise.all(
    admins.map((adminId) =>
      Payments.create({
        admin:        adminId,
        status,
        currentMonth: now.getMonth(),
        currentYear:  now.getFullYear(),
      })
    )
  );

  res.status(201).json({ success: true, data: payments });
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) throw new ApiError(400, "Month and year required");

  const Payments = (await import("../../models/finance/Payments.js")).default;

  const payment = await Payments.findOne({
    admin:        req.params.id,
    currentMonth: Number(month),
    currentYear:  Number(year),
  }).populate("admin", "displayName email monthlyfee");

  if (!payment) throw new ApiError(404, "Payment not found for the given month/year");

  res.status(200).json({ success: true, data: payment });
});