import mongoose from "mongoose";

const aiReviewSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Under Review", "Passed", "Rejected"],
      default: "Pending",
    },

    images: {
      type: [String],
      default: [],
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: null,
    },

    aiResponse: {
      type: String,
    },

    aiIssue: {
      type: String,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    recordedTime: {
      type: Number,
      default: 0,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    // raw response from AI provider — keep as Mixed for flexibility
    aiRawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

aiReviewSchema.index({ organizationID: 1, status: 1 });
aiReviewSchema.index({ task: 1 });

const AiReview = mongoose.model("AiReview", aiReviewSchema);
export default AiReview;