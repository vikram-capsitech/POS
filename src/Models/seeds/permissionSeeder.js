import Permission from "../Models/core/Permission.js";
import Role from "../Models/core/Role.js";

// ─── Default Permissions ──────────────────────────────────────────────────────
// Run once when platform is set up.
// When you add a new module, just add new entries here.

export const DEFAULT_PERMISSIONS = [
  // Staff
  { key: "staff:read", module: "staff", label: "View Staff" },
  { key: "staff:write", module: "staff", label: "Add / Edit Staff" },
  { key: "staff:delete", module: "staff", label: "Delete Staff" },

  // Attendance
  { key: "attendance:read", module: "attendance", label: "View Attendance" },
  { key: "attendance:write", module: "attendance", label: "Manage Attendance" },

  // Task
  { key: "task:read", module: "task", label: "View Tasks" },
  { key: "task:write", module: "task", label: "Create / Edit Tasks" },
  { key: "task:delete", module: "task", label: "Delete Tasks" },
  { key: "task:assign", module: "task", label: "Assign Tasks" },

  // SOP
  { key: "sop:read", module: "sop", label: "View SOPs" },
  { key: "sop:write", module: "sop", label: "Create / Edit SOPs" },

  // Leave
  { key: "leave:read", module: "leave", label: "View Leave Requests" },
  { key: "leave:write", module: "leave", label: "Submit Leave Requests" },
  { key: "leave:manage", module: "leave", label: "Approve / Reject Leave" },

  // Advance
  { key: "advance:read", module: "advance", label: "View Advance Requests" },
  { key: "advance:write", module: "advance", label: "Submit Advance Requests" },
  {
    key: "advance:manage",
    module: "advance",
    label: "Approve / Reject Advance",
  },

  // Payroll
  { key: "payroll:read", module: "payroll", label: "View Payroll" },
  { key: "payroll:manage", module: "payroll", label: "Process Payroll" },
  { key: "payroll:export", module: "payroll", label: "Export Payroll Reports" },

  // Reports
  { key: "reports:read", module: "reports", label: "View Reports" },
  { key: "reports:export", module: "reports", label: "Export Reports" },

  // Roles (only admins typically)
  { key: "roles:read", module: "roles", label: "View Roles" },
  {
    key: "roles:manage",
    module: "roles",
    label: "Create / Edit / Delete Roles",
  },

  // Vouchers
  { key: "voucher:read", module: "voucher", label: "View Vouchers" },
  { key: "voucher:manage", module: "voucher", label: "Create / Edit Vouchers" },

  // Documents
  { key: "document:read", module: "document", label: "View Documents" },
  {
    key: "document:manage",
    module: "document",
    label: "Upload / Edit Documents",
  },

  // AI Review
  { key: "ai:read", module: "ai", label: "View AI Reviews" },
  { key: "ai:manage", module: "ai", label: "Manage AI Reviews" },
];

// ─── Seed Permissions ─────────────────────────────────────────────────────────
// Call once during platform setup

export const seedPermissions = async () => {
  for (const perm of DEFAULT_PERMISSIONS) {
    await Permission.findOneAndUpdate({ key: perm.key }, perm, {
      upsert: true,
      new: true,
    });
  }
  console.log("✅ Permissions seeded");
};

// ─── Seed Default Roles for a new Organization ───────────────────────────────
// Call this whenever a new org is created

export const seedDefaultRoles = async (organizationID, createdBy) => {
  // fetch permission IDs we need
  const allPerms = await Permission.find({});
  const get = (keys) =>
    allPerms.filter((p) => keys.includes(p.key)).map((p) => p._id);

  const defaults = [
    {
      name: "manager",
      displayName: "Manager",
      permissions: get([
        "staff:read",
        "attendance:read",
        "attendance:write",
        "task:read",
        "task:write",
        "task:assign",
        "sop:read",
        "sop:write",
        "leave:read",
        "leave:manage",
        "advance:read",
        "advance:manage",
        "payroll:read",
        "reports:read",
        "voucher:read",
        "voucher:manage",
        "document:read",
        "document:manage",
      ]),
      isDefault: true,
    },
    {
      name: "employee",
      displayName: "Employee",
      permissions: get([
        "task:read",
        "sop:read",
        "leave:read",
        "leave:write",
        "advance:read",
        "advance:write",
        "attendance:read",
        "document:read",
      ]),
      isDefault: true,
    },
  ];

  for (const role of defaults) {
    await Role.findOneAndUpdate(
      { name: role.name, organizationID },
      { ...role, organizationID, createdBy },
      { upsert: true, new: true },
    );
  }

  console.log(`✅ Default roles seeded for org: ${organizationID}`);
};
