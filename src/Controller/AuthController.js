import asyncHandler from "express-async-handler";
import User from "../../models/core/User.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import ApiError from "../../utils/ApiError.js";
import { verifyGoogleToken } from "../../utils/verifyGoogleToken.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  })
    .select("+password")
    .populate("organizationID", "name modules theme");

  if (!user) throw new ApiError(401, "Invalid email or password");

  if (user.isLocked) {
    throw new ApiError(423, "Account temporarily locked. Try again later.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new ApiError(401, "Invalid email or password");
  }

  await user.resetLoginAttempts();

  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  const profile = user.roleID
    ? await EmployeeProfile.findOne({ userID: user._id }).select(
        "position salary totalLeave leaveTaken hireDate fcmToken access coinsPerMonth employeeStatus"
      )
    : null;

  res.status(200).json({
    success:      true,
    accessToken,
    refreshToken,
    data:         _buildUserResponse(user, profile),
  });
});

// ─── Google OAuth Login ───────────────────────────────────────────────────────

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, "Google token required");

  const payload = await verifyGoogleToken(credential);
  if (!payload) throw new ApiError(401, "Invalid Google token");

  const user = await User.findOne({ email: payload.email }).populate(
    "organizationID",
    "name modules theme"
  );

  if (!user) {
    throw new ApiError(403, "No account registered with this Google email");
  }

  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  const profile = user.roleID
    ? await EmployeeProfile.findOne({ userID: user._id }).select(
        "position salary totalLeave leaveTaken hireDate fcmToken access"
      )
    : null;

  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
    data:    _buildUserResponse(user, profile),
  });
});

// ─── Get Profile ──────────────────────────────────────────────────────────────

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -refreshToken")
    .populate("organizationID", "name modules theme wifiSsid wifiPass")
    .populate("roleID", "name displayName permissions");

  if (!user) throw new ApiError(404, "User not found");

  const profile = user.roleID
    ? await EmployeeProfile.findOne({ userID: user._id })
    : null;

  res.status(200).json({ success: true, data: _buildUserResponse(user, profile) });
});

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const allowed = [
    "displayName", "userName", "phoneNumber", "gender",
    "address", "about", "dob", "designation",
    "social", "fontFamily", "theme", "themeType", "sizeLevel", "status",
  ];
  allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "profiles");
    user.profilePhoto = result.secure_url;
  }

  await user.save();
  res.status(200).json({ success: true, message: "Profile updated", data: user });
});

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.isPasswordCorrect(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password     = newPassword;
  user.refreshToken = null; // force re-login everywhere
  await user.save();

  res.status(200).json({ success: true, message: "Password changed. Please login again." });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const user = await User.findOne({ refreshToken });
  if (!user) throw new ApiError(401, "Invalid or expired refresh token");

  const accessToken     = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();
  user.refreshToken     = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ─── Update FCM Token (for push notifications) ───────────────────────────────

export const updateFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) throw new ApiError(400, "FCM token required");

  const profile = await EmployeeProfile.findOneAndUpdate(
    { userID: req.user._id },
    { fcmToken },
    { new: true }
  );

  if (!profile) throw new ApiError(404, "Employee profile not found");
  res.status(200).json({ success: true, message: "FCM token updated" });
});

// ─── One-time SuperAdmin Setup ────────────────────────────────────────────────

export const setupSuperAdmin = asyncHandler(async (req, res) => {
  if (process.env.SETUP_DISABLED === "true") {
    throw new ApiError(403, "Setup endpoint is disabled");
  }
  const exists = await User.findOne({ systemRole: "superadmin" });
  if (exists) throw new ApiError(400, "SuperAdmin already exists");

  const { userName, email, password, phoneNumber } = req.body;

  const superAdmin = await User.create({
    userName:        userName    || "superadmin",
    email:           email       || "superadmin@platform.com",
    password:        password    || "SuperAdmin@123",
    phoneNumber:     phoneNumber || "0000000000",
    systemRole:      "superadmin",
    organizationID:  null,
    isEmailVerified: true,
  });

  res.status(201).json({
    success:     true,
    message:     "SuperAdmin created. Set SETUP_DISABLED=true in .env immediately.",
    accessToken: superAdmin.generateAccessToken(),
    data:        { _id: superAdmin._id, email: superAdmin.email },
  });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

const _buildUserResponse = (user, profile) => ({
  _id:            user._id,
  userName:       user.userName,
  displayName:    user.displayName,
  email:          user.email,
  profilePhoto:   user.profilePhoto,
  systemRole:     user.systemRole,
  roleID:         user.roleID,
  organization:   user.organizationID,
  organizationID: user.organizationID?._id || user.organizationID,
  status:         user.status,
  theme:          user.theme,
  themeType:      user.themeType,
  modules:        user.organizationID?.modules || {},
  ...(profile && {
    position:       profile.position,
    salary:         profile.salary,
    totalLeave:     profile.totalLeave,
    leaveTaken:     profile.leaveTaken,
    hireDate:       profile.hireDate,
    fcmToken:       profile.fcmToken,
    access:         profile.access,
    coinsPerMonth:  profile.coinsPerMonth,
    employeeStatus: profile.employeeStatus,
  }),
});