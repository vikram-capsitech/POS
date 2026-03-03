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
      default: null,
      // null = global role (created by superadmin, available to all orgs)
      // ObjectId = org-scoped role (created by admin, only for their org)
    },

    isGlobal: {
      type: Boolean,
      default: false,
      // true = superadmin-created platform-wide role
      // false = org-scoped role created by admin
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    // Page-level access: which sections of the dashboard this role can see.
    // e.g. ["task", "sop", "pos", "attendance", "voucher", "request", "issue", "ai-review", "salary-management"]
    // Empty array or undefined = no page restrictions (full access for admin roles)
    pages: [
      {
        type: String,
        trim: true,
        lowercase: true,
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

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// For global roles (isGlobal=true), name must be unique globally (organizationID is null)
// For org roles, name must be unique within the org
roleSchema.index({ name: 1, organizationID: 1 }, { unique: true, sparse: true });

const Role = mongoose.model("Role", roleSchema);
export default Role;
