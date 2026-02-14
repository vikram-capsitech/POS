const Notification = require("../models/Notification");
const Employee = require("../models/Employee");

// Firebase Admin SDK will be initialized only if credentials are available
let admin = null;
try {
  admin = require("firebase-admin");

  // Check if Firebase credentials are set in environment
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    console.log("✅ Firebase Admin SDK initialized successfully");
  } else {
    console.log(
      "⚠️  Firebase credentials not found. Push notifications will be disabled. In-app notifications will still work.",
    );
    admin = null;
  }
} catch (error) {
  console.log(
    "⚠️  Firebase Admin SDK not available. Push notifications will be disabled. In-app notifications will still work.",
  );
  admin = null;
}

/**
 * Send a push notification via Firebase Cloud Messaging
 * @param {string} fcmToken - Device FCM token
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data for deep linking
 */
const sendPushNotification = async (fcmToken, title, message, data = {}) => {
  if (!admin || !fcmToken) {
    return { success: false, reason: "FCM not configured or no token" };
  }

  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
      android: {
        notification: {
          sound: "notification",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "notification.wav",
          },
        },
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(payload);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Create in-app notification and send push notification
 * @param {string} recipientId - Employee ID to receive notification
 * @param {string} type - Notification type (info, error, success, warning)
 * @param {string} category - Notification category (task, sop, issue, leave, advance, general)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data for deep linking (e.g., taskId, leaveId)
 */
const sendNotification = async (
  recipientId,
  type,
  category,
  title,
  message,
  data = {},
) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      category,
      title,
      message,
      data,
    });


    // Get employee's FCM token for push notification
    const employee = await Employee.findById(recipientId);
    if (employee && employee.fcmToken) {
      // Send push notification
      await sendPushNotification(employee.fcmToken, title, message, {
        category,
        notificationId: notification._id.toString(),
        ...data,
      });
    } else {
      console.log(
        `⚠️  No FCM token found for employee ${recipientId}. Skipping push notification.`,
      );
    }

    return { success: true, notification };
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to multiple recipients
 * @param {Array<string>} recipientIds - Array of employee IDs
 * @param {string} type - Notification type
 * @param {string} category - Notification category
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 */
const sendBulkNotification = async (
  recipientIds,
  type,
  category,
  title,
  message,
  data = {},
) => {
  const promises = recipientIds.map((recipientId) =>
    sendNotification(recipientId, type, category, title, message, data),
  );

  const results = await Promise.allSettled(promises);
  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed, results };
};

module.exports = {
  sendNotification,
  sendBulkNotification,
};
