import rateLimit from "express-rate-limit";
import ApiError from "../Utils/ApiError.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

const rateLimitHandler = (req, res, next, options) => {
  throw new ApiError(
    429,
    options.message || "Too many requests — please try again later"
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
// 10 attempts per 15 minutes per IP

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login attempts — please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ─── OTP / Email Verification ─────────────────────────────────────────────────
// 5 requests per 10 minutes per IP

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many OTP requests — please try again after 10 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
// 5 requests per hour per IP

export const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many password reset requests — please try again after 1 hour",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ─── General API ──────────────────────────────────────────────────────────────
// 200 requests per minute per IP — applied globally in server.js

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: "Too many requests — please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});