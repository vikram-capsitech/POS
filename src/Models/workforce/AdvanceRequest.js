import mongoose from "mongoose";

const advanceRequestSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    askedMoney: {
      type: Number,
      required: true,
      min: 0,
    },

    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    voiceNote: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      default: "advance",
    },
  },
  { timestamps: true }
);

advanceRequestSchema.index({ organizationID: 1, employee: 1 });

const AdvanceRequest = mongoose.model("AdvanceRequest", advanceRequestSchema);
export default AdvanceRequest;