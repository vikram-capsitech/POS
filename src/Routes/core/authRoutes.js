import express from "express";
import { protect } from "../../Middlewares/Auth.middleware.js";
import { validate } from "../../Middlewares/Validate.middleware.js";
import {
  userLoginValidator,
  updateUserProfileValidator,
  userChangeCurrentPasswordValidator,
} from "../../Validators/user.validator.js";
import {
  setupSuperAdmin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateFCMToken,
} from "../../Controller/Auth/AuthController.js";

const router = express.Router();

// Public
router.post("/setup", setupSuperAdmin);
router.post("/login", userLoginValidator(), validate, loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  updateUserProfileValidator(),
  validate,
  updateUserProfile,
);
router.put(
  "/change-password",
  protect,
  userChangeCurrentPasswordValidator(),
  validate,
  changePassword,
);
router.put("/fcm-token", protect, updateFCMToken);

export default router;
