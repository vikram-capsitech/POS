import express from "express";
import { upload } from "../../Middlewares/Multer.middleware.js";
import { protect, authorize } from "../../Middlewares/Auth.middleware.js";
import {
  addOrganization,
  getOrganizations,
  updateOrganization,
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
  getOrganization,
  getDashboardStats,
} from "../../Controller/admin/adminController.js";
import {
  userAssignRoleValidator,
  createRoleValidator,
  updateRoleValidator,
} from "../../Validators/user.validator.js";
import { validate } from "../../Middlewares/Validate.middleware.js";

const router = express.Router();

// ── Organization ──────────────────────────────────────────────────────────────
router.get(
  "/organizations",
  protect,
  authorize("superadmin", "admin"),
  getOrganizations,
);

router.get(
  "/organization/:id",
  protect,
  authorize("superadmin", "admin"),
  getOrganization,
);

router.get(
  "/dashboard",
  protect,
  authorize("superadmin", "admin"),
  getDashboardStats,
);

router.post(
  "/organizations",
  protect,
  authorize("superadmin"),
  upload.single("logo"),
  addOrganization,
);
router.get(
  "/organizations",
  protect,
  authorize("superadmin", "admin"),
  getOrganizations,
);
router.put(
  "/organizations/:id",
  protect,
  authorize("superadmin", "admin"),
  upload.single("logo"),
  updateOrganization,
);

// ── Admin Management (superadmin only) ────────────────────────────────────────
router.post(
  "/admins",
  protect,
  authorize("superadmin"),
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "organizationLogo", maxCount: 1 },
  ]),
  addAdmin,
);

// ── User Management ───────────────────────────────────────────────────────────
router.get("/users", protect, authorize("superadmin", "admin"), getAllUsers);
router.get(
  "/users/:id",
  protect,
  authorize("superadmin", "admin"),
  getUserById,
);
router.put(
  "/users/:id",
  protect,
  authorize("superadmin", "admin"),
  upload.single("profilePhoto"),
  updateUserById,
);
router.delete("/users/:id", protect, authorize("superadmin"), deleteUserById);

// ── Role Management ───────────────────────────────────────────────────────────
router.post(
  "/roles",
  protect,
  authorize("superadmin", "admin"),
  createRoleValidator(),
  validate,
  createRole,
);
router.get("/roles", protect, authorize("superadmin", "admin"), getAllRoles);
router.put(
  "/roles/:id",
  protect,
  authorize("superadmin", "admin"),
  updateRoleValidator(),
  validate,
  updateRole,
);
router.delete(
  "/roles/:id",
  protect,
  authorize("superadmin", "admin"),
  deleteRole,
);

// ── Assign Role to User ───────────────────────────────────────────────────────
router.put(
  "/users/:id/role",
  protect,
  authorize("superadmin", "admin"),
  userAssignRoleValidator(),
  validate,
  assignRole,
);

export default router;
