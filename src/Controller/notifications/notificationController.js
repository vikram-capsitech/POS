import Notification from "../../Models/notifications/Notification.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  GET /api/notifications
// ─────────────────────────────────────────────
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, unreadOnly } = req.query;
  const query = { recipient: req.user.id };
  if (unreadOnly === "true") query.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user.id, read: false }),
  ]);

  res.json({
    success: true,
    count: total,
    unreadCount,
    page: Number(page),
    data: notifications,
  });
});

// ─────────────────────────────────────────────
//  PATCH /api/notifications/:id/read
// ─────────────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.recipient.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  notification.read = true;
  await notification.save();

  res.json({ success: true, data: notification });
});

// ─────────────────────────────────────────────
//  PATCH /api/notifications/mark-all-read
// ─────────────────────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true },
  );
  res.json({ success: true, message: "All notifications marked as read" });
});

// ─────────────────────────────────────────────
//  DELETE /api/notifications/:id
// ─────────────────────────────────────────────
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.recipient.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Not authorized");
  }
  await notification.deleteOne();
  res.json({ success: true, message: "Notification deleted" });
});

// ─────────────────────────────────────────────
//  POST /api/notifications  (internal / admin use)
// ─────────────────────────────────────────────
const createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, category, title, message, data } = req.body;

  const notification = await Notification.create({
    recipient: recipient ?? req.user.id,
    type: type ?? "info",
    category: category ?? "general",
    title,
    message,
    data: data ?? {},
  });

  res.status(201).json({ success: true, data: notification });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    read: false,
  });
  res.json({ success: true, unreadCount });
});

export {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount,
};
