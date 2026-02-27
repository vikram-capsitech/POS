import express from "express";
import { protect, checkPermission, authorize } from "../../middleware/authMiddleware.js";
import { uploadPhoto } from "../../config/cloudinary.js";
import {
  getOrganization,
  getOrganizations,
  createOrganization,
  updateOrganization,
  updateOrganizationTheme,
} from "../../controllers/pos/organizationController.js";

const router = express.Router();

// ── Public / Any authenticated user ──────────────────────────────────────────
// get current user's org info
router.get("/", protect, getOrganization);

// ── Superadmin only ───────────────────────────────────────────────────────────
router.get( "/all",  protect, authorize("superadmin"), getOrganizations);
router.post("/",     protect, authorize("superadmin"),
  uploadPhoto.single("logo"),
  createOrganization
);

// ── Admin / Superadmin ────────────────────────────────────────────────────────
router.put("/:id",        protect, authorize("superadmin", "admin"),
  uploadPhoto.single("logo"),
  updateOrganization
);
router.put("/:id/theme",  protect, authorize("superadmin", "admin"), updateOrganizationTheme);

export default router;

// NOTE: Old restaurantRoutes.js had inline controller logic directly in the route file.
// That logic has been moved to controllers/pos/organizationController.js
// which is the correct pattern — routes should only handle routing, not business logic.