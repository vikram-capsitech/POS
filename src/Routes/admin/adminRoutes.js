import express from "express";
import { uploadPhoto } from "../config/cloudinary.js";
import { protect, checkPermission, authorize } from "../middleware/authMiddleware.js";
import {
  addOrganization,
  getOrganizations,
  updateOrganizationTheme,
  addAdmin,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  assignRole,
  createRole,
  updateRole,
  deleteRole,
  getAllRoles,
} from "../controllers/adminController.js";
import {
  userAssignRoleValidator,
  createRoleValidator,
  updateRoleValidator,
} from "../validators/userValidators.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// ── Organization ──────────────────────────────────────────────────────────────
router.post("/organizations",       protect, authorize("superadmin"), addOrganization);
router.get( "/organizations",       protect, authorize("superadmin"), getOrganizations);
router.put( "/organizations/:id/theme", protect,
  authorize("superadmin", "admin"),
  updateOrganizationTheme
);

// ── Admin Management (superadmin only) ────────────────────────────────────────
router.post("/admins", protect, authorize("superadmin"),
  uploadPhoto.fields([
    { name: "profilePhoto",      maxCount: 1 },
    { name: "organizationLogo",  maxCount: 1 },
  ]),
  addAdmin
);

// ── User Management ───────────────────────────────────────────────────────────
router.get(   "/users",     protect, authorize("superadmin", "admin"), getAllUsers);
router.get(   "/users/:id", protect, authorize("superadmin", "admin"), getUserById);
router.put(   "/users/:id", protect, authorize("superadmin", "admin"),
  uploadPhoto.single("profilePhoto"),
  updateUserById
);
router.delete("/users/:id", protect, authorize("superadmin"), deleteUserById);

// ── Role Management ───────────────────────────────────────────────────────────
router.post("/roles",     protect, checkPermission("roles:manage"), createRoleValidator(), validate, createRole);
router.get( "/roles",     protect, checkPermission("roles:read"),   getAllRoles);
router.put( "/roles/:id", protect, checkPermission("roles:manage"), updateRoleValidator(), validate, updateRole);
router.delete("/roles/:id",protect, checkPermission("roles:manage"), deleteRole);

// ── Assign Role to User ───────────────────────────────────────────────────────
router.put("/users/:id/role", protect,
  checkPermission("roles:manage"),
  userAssignRoleValidator(),
  validate,
  assignRole
);

export default router;