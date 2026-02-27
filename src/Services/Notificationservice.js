import Notification from "../models/notifications/Notification.js";
import EmployeeProfile from "../models/core/EmployeeProfile.js";

// ─── Firebase Setup ───────────────────────────────────────────────────────────

let admin = null;

try {
  const firebaseAdmin = await import("firebase-admin");
  admin = firebaseAdmin.default;

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   FIREBASE_PROJECT_ID,
          privateKey:  FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    console.log("✅ Firebase Admin SDK initialized");
  } else {
    console.log("⚠️  Firebase credentials missing — push notifications disabled");
    admin = null;
  }
} catch {
  console.log("⚠️  Firebase Admin SDK not available — push notifications disabled");
  admin = null;
}

// ─── Push Notification ────────────────────────────────────────────────────────

/**
 * Send a push notification via Firebase Cloud Messaging
 * @param {string} fcmToken  - Device FCM token from EmployeeProfile
 * @param {string} title     - Notification title
 * @param {string} message   - Notification body
 * @param {object} data      - Extra data for deep linking (all values must be strings)
 */
const sendPushNotification = async (fcmToken, title, message, data = {}) => {
  if (!admin || !fcmToken) {
    return { success: false, reason: "FCM not configured or no token" };
  }

  try {
    const payload = {
      notification: { title, body: message },
      android: {
        notification: { sound: "notification" },
      },
      apns: {
        payload: { aps: { sound: "notification.wav" } },
      },
      data: {
        ...Object.fromEntries(
          // FCM requires all data values to be strings
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(payload);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Push notification error:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Single Notification ──────────────────────────────────────────────────────

/**
 * Create an in-app notification and optionally send a push notification
 *
 * @param {object} options
 * @param {string}  options.recipientID    - User._id of the recipient
 * @param {string}  options.organizationID - Organization._id (for scoping)
 * @param {string}  options.type           - "info" | "error" | "success" | "warning"
 * @param {string}  options.category       - "task" | "sop" | "issue" | "leave" | "advance" | "salary" | "general"
 * @param {string}  options.title          - Notification title
 * @param {string}  options.message        - Notification body
 * @param {string}  [options.senderID]     - User._id of sender (null = system)
 * @param {object}  [options.data]         - Extra data for deep linking e.g. { taskID: "..." }
 */
const sendNotification = async ({
  recipientID,
  organizationID,
  type = "info",
  category = "general",
  title,
  message,
  senderID = null,
  data = {},
}) => {
  try {
    // 1. Save in-app notification
    const notification = await Notification.create({
      recipient: recipientID,
      organizationID,
      sender: senderID,
      type,
      category,
      title,
      message,
      data,
    });

    // 2. Get FCM token from EmployeeProfile
    // FCM token lives on EmployeeProfile, not User, per our model design
    const profile = await EmployeeProfile.findOne({ userID: recipientID }).select("fcmToken");

    if (profile?.fcmToken) {
      await sendPushNotification(profile.fcmToken, title, message, {
        category,
        notificationID: notification._id.toString(),
        ...data,
      });
    } else {
      console.log(`⚠️  No FCM token for user ${recipientID} — skipping push`);
    }

    return { success: true, notification };
  } catch (error) {
    console.error("❌ sendNotification error:", error.message);
    return { success: false, error: error.message };
  }
};

// ─── Bulk Notification ────────────────────────────────────────────────────────

/**
 * Send the same notification to multiple recipients
 *
 * @param {object}   options
 * @param {string[]} options.recipientIDs  - Array of User._id strings
 * @param {string}   options.organizationID
 * @param {string}   options.type
 * @param {string}   options.category
 * @param {string}   options.title
 * @param {string}   options.message
 * @param {string}   [options.senderID]
 * @param {object}   [options.data]
 */
const sendBulkNotification = async ({
  recipientIDs,
  organizationID,
  type = "info",
  category = "general",
  title,
  message,
  senderID = null,
  data = {},
}) => {
  const results = await Promise.allSettled(
    recipientIDs.map((recipientID) =>
      sendNotification({
        recipientID,
        organizationID,
        type,
        category,
        title,
        message,
        senderID,
        data,
      })
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
  const failed     = results.length - successful;

  return { total: recipientIDs.length, successful, failed, results };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mark a notification as read
 * @param {string} notificationID
 */
const markAsRead = async (notificationID) => {
  return Notification.findByIdAndUpdate(
    notificationID,
    { read: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 * @param {string} recipientID
 */
const markAllAsRead = async (recipientID) => {
  return Notification.updateMany(
    { recipient: recipientID, read: false },
    { read: true }
  );
};

/**
 * Get unread notification count for a user
 * @param {string} recipientID
 */
const getUnreadCount = async (recipientID) => {
  return Notification.countDocuments({ recipient: recipientID, read: false });
};

export {
  sendNotification,
  sendBulkNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};



// // single
// await sendNotification({
//   recipientID: user._id,
//   organizationID: req.user.organizationID,
//   type: "success",
//   category: "task",
//   title: "Task Completed",
//   message: "Your task has been marked complete",
//   data: { taskID: task._id.toString() },
// });

// // bulk
// await sendBulkNotification({
//   recipientIDs: [id1, id2, id3],
//   organizationID: req.user.organizationID,
//   type: "info",
//   category: "general",
//   title: "Announcement",
//   message: "Staff meeting at 5pm",
// });