const mongoose = require("mongoose");

const advanceRequestSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },

    askedMoney: {
      type: Number,
      required: true,
    },

    remainingBalance: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee", // or Employee (if employee creates)
      required: true,
    },
    voiceNote: {
      type: String
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: { type: String, default: "advance" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvanceRequest", advanceRequestSchema);
