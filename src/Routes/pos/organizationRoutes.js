import express from "express";
import {
  protect,
  checkPermission,
  authorize,
} from "../../Middlewares/Auth.middleware.js";
import { upload } from "../../Middlewares/Multer.middleware.js";
import {
  getOrganization,
  getOrganizations,
  createOrganization,
  updateOrganization,
  updateOrganizationTheme,
} from "../../Controller/admin/adminController.js";

const router = express.Router();

// ── Public / Any authenticated user ──────────────────────────────────────────
// get current user's org info
router.get("/", protect, getOrganization);

// ── Superadmin only ───────────────────────────────────────────────────────────
router.get("/all", protect, authorize("superadmin"), getOrganizations);
router.post(
  "/",
  protect,
  authorize("superadmin"),
  upload.single("logo"),
  createOrganization,
);

// ── Admin / Superadmin ────────────────────────────────────────────────────────
router.put(
  "/:id",
  protect,
  authorize("superadmin", "admin"),
  upload.single("logo"),
  updateOrganization,
);
router.put(
  "/:id/theme",
  protect,
  authorize("superadmin", "admin"),
  updateOrganizationTheme,
);

export default router;

// NOTE: Old restaurantRoutes.js had inline controller logic directly in the route file.
// That logic has been moved to Controller/pos/organizationController.js
// which is the correct pattern — routes should only handle routing, not business logic.
