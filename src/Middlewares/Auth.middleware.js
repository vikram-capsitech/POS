import jwt from "jsonwebtoken";
import User from "../Models/core/User.js";
import Role from "../Models/core/Role.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "../Utils/AsyncHandler.js";

// ─── Verify JWT ───────────────────────────────────────────────────────────────

export const protect = asyncHandler(async (req, res, next) => {
  // Support both cookie-based (browsers) and Bearer-token (mobile / Swagger) clients
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized — no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationRawOTP",
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token — user not found");
  }

  if (user.isLocked) {
    throw new ApiError(
      423,
      "Account is temporarily locked due to too many failed login attempts",
    );
  }

  req.user = user;
  next();
});

// ─── System Role Guard ────────────────────────────────────────────────────────
// Use for platform-level access: authorize("superadmin") or authorize("superadmin", "admin")

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!roles.includes(req.user.systemRole)) {
      throw new ApiError(
        403,
        `Access denied — requires one of: ${roles.join(", ")}`,
      );
    }

    next();
  });

// ─── Permission Check ─────────────────────────────────────────────────────────
// Use for org-level custom role permissions: checkPermission("task:read")
// Superadmin and admin always pass through — only custom role users are checked

export const checkPermission = (requiredPermission) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    // superadmin and admin bypass permission checks
    if (
      req.user.systemRole === "superadmin" ||
      req.user.systemRole === "admin"
    ) {
      return next();
    }

    if (!req.user.roleID) {
      throw new ApiError(403, "Access denied — no role assigned");
    }

    // Fetch role with populated permissions
    // We use lean() for performance since we only need to read
    const role = await Role.findById(req.user.roleID)
      .populate("permissions", "key")
      .lean();

    if (!role || !role.isActive) {
      throw new ApiError(403, "Access denied — role not found or inactive");
    }

    const hasPermission = role.permissions.some(
      (p) => p.key === requiredPermission,
    );

    if (!hasPermission) {
      throw new ApiError(
        403,
        `Access denied — missing permission: ${requiredPermission}`,
      );
    }

    // Cache permissions on req so multiple checkPermission calls
    // in the same request don't hit the DB again
    req.userPermissions = role.permissions.map((p) => p.key);

    next();
  });

// ─── Optional Auth ────────────────────────────────────────────────────────────
// For routes where auth is optional — attaches user if token exists, skips if not

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return next(); // no token is fine — just continue

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (user) req.user = user;
  } catch {
    // invalid token — silently ignore and continue
  }

  next();
});
