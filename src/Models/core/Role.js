import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // e.g. "manager", "kitchen-lead", "cashier"
    },

    displayName: {
      type: String,
      trim: true,
      // e.g. "Manager", "Kitchen Lead", "Cashier"
    },

    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      // roles are always scoped to an org — one org's roles
      // don't leak into another org
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
        // array of permission refs, e.g. [staff:read, task:write]
      },
    ],

    isDefault: {
      type: Boolean,
      default: false,
      // true = system-seeded role (e.g. Manager, Employee)
      // default roles cannot be deleted by admin
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Same role name can't exist twice in the same org
roleSchema.index({ name: 1, organizationID: 1 }, { unique: true });

const Role = mongoose.model("Role", roleSchema);
export default Role;