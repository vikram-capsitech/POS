import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., "TASK_UPDATED", "LOGIN", "SOP_CREATED"
    },
    module: {
      type: String, // e.g., "TASK", "AUTH", "SOP"
    },
    resourceID: {
      type: mongoose.Schema.Types.ObjectId, // ID of the task, sop, etc.
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Storing what changed, or just a description
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

const UserLog = mongoose.model("UserLog", userLogSchema);
export default UserLog;
