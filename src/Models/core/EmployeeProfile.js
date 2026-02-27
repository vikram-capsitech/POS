import mongoose from "mongoose";

// Stores org/employee-specific data separately from the base User model.
// This replaces the old Employee.js discriminator pattern.
// Base auth/profile fields stay on User, job-specific fields live here.

const employeeProfileSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // ── Job Info ──────────────────────────────────────────────────────────────

    position: {
      type: String,
      trim: true,
    },

    jobRole: {
      type: String,
      // kept open (no enum) so it works for any org type, not just restaurants
      // e.g. "kitchenStaff", "nurse", "cashier", "driver"
      trim: true,
    },

    hireDate: {
      type: Date,
      default: Date.now,
    },

    employeeStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ── Salary ────────────────────────────────────────────────────────────────

    salary: {
      type: Number,
      min: 0,
      default: 0,
    },

    salaryStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    lastPaidAt: {
      type: Date,
      default: null,
    },

    monthlyAdvanceTaken: {
      type: Number,
      default: 0,
    },

    monthlySalaryReceived: {
      type: Number,
      default: 0,
    },

    // ── Leave Tracking ────────────────────────────────────────────────────────

    totalLeave: {
      type: Number,
      default: 4,
    },

    leaveTaken: {
      type: Number,
      default: 0,
    },

    leavesProvided: {
      type: Number,
      default: 0,
    },

    unauthorizedLeaves: {
      type: Number,
      default: 0,
    },

    // ── Rewards ───────────────────────────────────────────────────────────────

    coinsPerMonth: {
      type: Number,
      default: 0,
    },

    // ── Location (for check-in etc.) ──────────────────────────────────────────

    currentLocation: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    // ── Notifications ─────────────────────────────────────────────────────────

    fcmToken: {
      type: String,
      default: null,
    },

    // ── Access & Items ────────────────────────────────────────────────────────

    access: {
      type: [String],
      default: [],
    },

    allotedItems: [
      {
        name: { type: String },
        isReceived: { type: String, default: "Pending" },
      },
    ],
  },
  { timestamps: true }
);

// Fast lookup: all employees in an org
employeeProfileSchema.index({ organizationID: 1 });

const EmployeeProfile = mongoose.model("EmployeeProfile", employeeProfileSchema);
export default EmployeeProfile;