import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get( "/",           protect, getMyNotifications);
router.get( "/unread",     protect, getUnreadCount);
router.post("/",           protect, createNotification);
router.put( "/read-all",   protect, markAllAsRead);
router.put( "/:id/read",   protect, markAsRead);

export default router;