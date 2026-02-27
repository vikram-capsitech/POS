const mongoose = require("mongoose");

const AiReviewSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
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
      enum: ["Rejected", "Passed", "Pending", "Under Review"],
      default: "Pending",
    },

    images: {
      type: [String],
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    aiResponse: {
      type: String,
    },
    aiIssue: {
      type: String,
    },
    confidenceScore: {
      type: Number,
    },
    recordedTime: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    aiRawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AiReview", AiReviewSchema);
