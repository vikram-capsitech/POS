import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  USER_TEMP_TOKEN_EXPIRY,
  ThemeEnum,
  AvailableThemes,
} from "../../constant.js";

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────────────────────────

    profilePhoto: { type: String, default: null },

    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    displayName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
    },

    address: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    about: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
      default: null,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    social: [
      {
        type: String,
        validate: {
          validator: (v) =>
            /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(
              v,
            ),
          message: "Invalid URL format",
        },
      },
    ],

    // ── Role & Org ────────────────────────────────────────────────────────────

    systemRole: {
      type: String,
      enum: ["superadmin", "admin"],
      default: null,
      // superadmin = platform-wide access, no org
      // admin      = manages one organization
    },

    roleID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
      // org-level custom roles (manager, employee, etc.)
      validate: {
        validator: function (value) {
          if (this.systemRole && value) return false;
          return true;
        },
        message: "System role users should not have a custom roleID",
      },
    },

    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      required: function () {
        return this.systemRole !== "superadmin";
      },
    },

    // ── Security ──────────────────────────────────────────────────────────────

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    // ── Auth ──────────────────────────────────────────────────────────────────

    password: {
      type: String,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiry: { type: Date, default: null },
    emailVerificationRawOTP: { type: String, select: false },
    emailVerificationRawOTPExpires: { type: Date, select: false },

    forgotPasswordToken: { type: String, default: null },
    forgotPasswordExpiry: { type: Date, default: null },

    temporaryToken: { type: String, default: null },
    temporaryTokenExpiry: { type: Date, default: null },

    // ── OAuth ─────────────────────────────────────────────────────────────────

    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },

    // ── Preferences ───────────────────────────────────────────────────────────

    status: {
      type: String,
      enum: ["Idle", "Online", "Offline", "Do Not Disturb"],
      default: "Offline",
    },

    theme: {
      type: String,
      enum: AvailableThemes,
      default: ThemeEnum.Default,
    },

    themeType: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    fontFamily: { type: String, default: null },

    sizeLevel: {
      type: String,
      enum: ["xs", "s", "m", "l", "xl"],
      default: "m",
    },

    isSystemDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

userSchema.index({ organizationID: 1 });
userSchema.index({ roleID: 1 });
userSchema.index({ organizationID: 1, systemRole: 1 });

// ── Virtual: check if account is locked ───────────────────────────────────────

userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Methods ───────────────────────────────────────────────────────────────────

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Increment login attempts and lock account if limit exceeded
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

  // reset attempts if previous lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const update = { $inc: { loginAttempts: 1 } };

  // lock the account if max attempts reached
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    update.$set = { lockUntil: Date.now() + LOCK_DURATION };
  }

  return this.updateOne(update);
};

// Reset login attempts after successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      systemRole: this.systemRole,
      roleID: this.roleID,
      organizationID: this.organizationID,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + USER_TEMP_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);
export default User;
