import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    deadline: {
      startDate: { type: Date },
      endDate:   { type: Date },
    },

    voiceNote: {
      type: String,
    },

    sop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOP",
      default: null,
    },

    category: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },

    // ── AI Review ─────────────────────────────────────────────────────────────

    aiReview: {
      type: Boolean,
      default: false,
    },

    aiStatus: {
      type: String,
      enum: ["Pending", "Under Review", "Passed", "Rejected"],
      default: null,
    },

    // ── Time Tracking ─────────────────────────────────────────────────────────

    startTime: { type: Date },
    endTime:   { type: Date },

    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },

    estimatedTime: {
      type: Number, // in seconds
      default: 0,
    },

    isNew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ organizationID: 1, status: 1 });
taskSchema.index({ assignTo: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;