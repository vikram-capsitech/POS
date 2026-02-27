import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["restaurant", "retail", "hospital", "logistics", "other"],
      default: "other",
      // just a label/metadata — does not affect any business logic
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      // e.g. "burger-king-delhi" — useful for URLs or subdomains
    },

    address: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    logo: {
      type: String, // URL
    },

    theme: {
      primary: { type: String, default: "#5240d6" },
    },

    // Store any org-type-specific legal/business fields here
    // e.g. { gstIn: "...", fssaiLicense: "...", registrationNo: "..." }
    // Avoids polluting schema with restaurant-only fields
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Feature flags — which modules this org has access to
    modules: {
      pos:       { type: Boolean, default: false },
      hrm:       { type: Boolean, default: true  },
      inventory: { type: Boolean, default: false },
      payroll:   { type: Boolean, default: false },
      ai:        { type: Boolean, default: false },
      // add new modules here as the platform grows
    },

    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // the admin/superadmin who registered this org
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// NOTE: No admins[] or employees[] arrays here!
// Users point to org via organizationID on the User model.
// To get all users in an org: User.find({ organizationID: orgId })

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;