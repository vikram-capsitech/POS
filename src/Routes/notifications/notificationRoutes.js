import express from "express";
import { protect } from "../../Middlewares/Auth.middleware.js";
import {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../../Controller/notifications/notificationController.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.get("/unread", protect, getUnreadCount);
router.post("/", protect, createNotification);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

export default router;
