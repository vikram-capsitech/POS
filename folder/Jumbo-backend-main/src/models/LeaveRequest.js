const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    voiceNote: {
      type: String, // store file path or URL
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,

    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    isAuthorizedLeave: {
      type: Boolean,
      default: false
    },

    type: { type: String, default: "leave" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
