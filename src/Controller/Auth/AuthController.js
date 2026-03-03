import jwt from "jsonwebtoken";
import User from "../../Models/core/User.js";
import EmployeeProfile from "../../Models/core/EmployeeProfile.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import { logUserAction } from "../../Utils/Logger.js";

// ─── Token cookie helpers ─────────────────────────────────────────────────────

const ACCESS_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 min
};

const REFRESH_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const issueTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────
//  POST /api/auth/setup  (one-time superadmin creation)
// ─────────────────────────────────────────────
export const setupSuperAdmin = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ systemRole: "superadmin" });
  if (exists) throw new ApiError(400, "Super admin already exists");

  const { displayName, name, email, userName, password, phoneNumber } =
    req.body;

  if (!email || !userName || !password || !phoneNumber) {
    throw new ApiError(
      400,
      "email, userName, password, and phoneNumber are required",
    );
  }

  const superAdmin = await User.create({
    displayName: displayName ?? name ?? "Super Admin",
    userName,
    email,
    password,
    phoneNumber,
    systemRole: "superadmin",
    isEmailVerified: true,
  });

  const { accessToken, refreshToken } = await issueTokens(superAdmin);

  const safe = superAdmin.toObject();
  delete safe.password;
  delete safe.refreshToken;

  return res
    .status(201)
    .cookie("accessToken", accessToken, ACCESS_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_OPTIONS)
    .json(
      new ApiResponse(
        201,
        { user: safe, accessToken },
        "Super admin created successfully",
      ),
    );
});

// ─────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { loginEmail, loginPassword } = req.body;
  const identifier = loginEmail;

  if (!identifier || !loginPassword) {
    throw new ApiError(400, "Please provide email/username and password");
  }

  const user = await User.findOne({
    $or: [
      { email: { $regex: new RegExp("^" + identifier + "$", "i") } },
      { userName: { $regex: new RegExp("^" + identifier + "$", "i") } },
    ],
  })
    .select("+password")
    .populate("organizationID", "name type modules theme slug logo")
    .populate("roleID", "name displayName pages permissions");  // ← include pages

  if (!user) throw new ApiError(401, "Invalid credentials");

  if (user.isLocked) {
    throw new ApiError(
      423,
      "Account temporarily locked — too many failed login attempts",
    );
  }

  const isMatch = await user.isPasswordCorrect(loginPassword);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  await user.resetLoginAttempts();

  const { accessToken, refreshToken } = await issueTokens(user);

  // Manual request augmentation because 'protect' middleware isn't run yet
  const logReq = { ...req, user: user, organizationID: user.organizationID?._id || user.organizationID };
  await logUserAction(logReq, "USER_LOGIN", "AUTH", user._id);

  const safe = user.toObject();
  delete safe.password;
  delete safe.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_OPTIONS)
    .json(
      new ApiResponse(200, { user: safe, accessToken }, "Login successful"),
    );
});

// ─────────────────────────────────────────────
//  POST /api/auth/logout
// ─────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } });

  await logUserAction(req, "USER_LOGOUT", "AUTH", req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", ACCESS_OPTIONS)
    .clearCookie("refreshToken", REFRESH_OPTIONS)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─────────────────────────────────────────────
//  POST /api/auth/refresh-token
// ─────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // For shared accounts (like waiters/kitchen), multiple devices might be logged in, 
  // which overwrites the single refreshToken string. We bypass the strict match 
  // for non-admin employees to prevent "Refresh token mismatch".
  const isEmployee = user.systemRole !== "superadmin" && user.systemRole !== "admin";
  
  if (!isEmployee && user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token mismatch — please login again");
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_OPTIONS)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

// ─────────────────────────────────────────────
//  GET /api/auth/profile
// ─────────────────────────────────────────────
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("organizationID", "name type modules theme slug logo")
    .populate("roleID", "name displayName pages permissions");

  if (!user) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, user, "Profile fetched"));
});

// ─────────────────────────────────────────────
//  PUT /api/auth/profile
// ─────────────────────────────────────────────
export const updateUserProfile = asyncHandler(async (req, res) => {
  const ALLOWED = [
    "displayName",
    "phoneNumber",
    "gender",
    "address",
    "dob",
    "designation",
    "about",
    "social",
    "themeType",
    "sizeLevel",
    "fontFamily",
    "status",
    "theme",
  ];

  const updates = {};
  ALLOWED.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (req.file?.path) updates.profilePhoto = req.file.path;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true },
  ).populate("organizationID", "name type modules theme slug logo");

  return res.json(
    new ApiResponse(200, updated, "Profile updated successfully"),
  );
});

// ─────────────────────────────────────────────
//  PUT /api/auth/change-password
// ─────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.isPasswordCorrect(oldPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  await logUserAction(req, "PASSWORD_CHANGED", "AUTH", user._id);

  return res.json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─────────────────────────────────────────────
//  PUT /api/auth/fcm-token
// ─────────────────────────────────────────────
export const updateFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) throw new ApiError(400, "FCM token is required");

  await EmployeeProfile.findOneAndUpdate(
    { userID: req.user._id },
    { fcmToken },
  );

  return res.json(new ApiResponse(200, {}, "FCM token updated"));
});
