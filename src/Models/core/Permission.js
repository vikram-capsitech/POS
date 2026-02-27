import mongoose from "mongoose";

// All possible actions across all modules in the platform.
// When you add a new module, just insert new Permission docs —
// no schema changes needed anywhere else.

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // Convention: "module:action"
      // e.g. "staff:read", "staff:write", "payroll:manage", "task:delete"
    },

    label: {
      type: String,
      trim: true,
      // Human readable: "View Staff", "Manage Payroll"
    },

    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // e.g. "staff", "task", "sop", "leave", "payroll", "attendance"
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;
