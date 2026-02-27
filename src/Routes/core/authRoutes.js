import express from "express";
import {
  loginUser,
  getUserProfile,
  updateUserProfile,
  setupSuperAdmin,
  googleLogin,
  changePassword,
  updateFCMToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
  userChangeCurrentPasswordValidator,
  updateUserProfileValidator,
} from "../validators/userValidators.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login",  userLoginValidator(), validate, loginUser);
router.post("/setup",  userRegisterValidator(), validate, setupSuperAdmin); // initial setup only
router.post("/google", googleLogin);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get( "/profile", protect, getUserProfile);
router.put( "/profile", protect, updateUserProfileValidator(), validate, updateUserProfile);

router.put("/change-password", protect, userChangeCurrentPasswordValidator(), validate, changePassword);
router.put("/fcm-token",       protect, updateFCMToken);

export default router;