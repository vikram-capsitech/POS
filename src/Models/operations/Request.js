import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requestType: {
      type: String,
      enum: ["Issue", "Complaint", "Support"],
      required: true,
    },

    // who raised it — kept as a string flag for quick filtering
    // without needing to populate and check systemRole
    raisedBy: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },

    date: {
      type: Date,
    },

    deadline: {
      startDate: { type: Date },
      endDate:   { type: Date },
    },

    submittedDate: {
      type: Date,
      default: Date.now,
    },

    category: {
      type: String,
      trim: true,
    },

    voiceNote: {
      type: String,
    },

    sop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOP",
      default: null,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    isNew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

requestSchema.index({ organizationID: 1, status: 1 });
requestSchema.index({ createdBy: 1 });

const Request = mongoose.model("Request", requestSchema);
export default Request;