import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      // optional — some notifications may be platform-wide (superadmin)
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // fixed: was ref: "Employee" — now consistently "User"
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // null = system-generated notification
    },

    type: {
      type: String,
      enum: ["info", "error", "success", "warning"],
      default: "info",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["task", "sop", "issue", "leave", "advance", "salary", "general"],
      // added "salary" as a useful category
      default: "general",
    },

    // any extra data to pass to frontend (e.g. taskId, leaveRequestId)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
  // removed manual createdAt — timestamps: true handles this
);

// Fast lookup: all unread notifications for a user
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ organizationID: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
export default Notification;
