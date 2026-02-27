import mongoose from "mongoose";

const inventoryRequestSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: String,
      required: true,
      trim: true,
      // kept as String intentionally: "5kg", "2 packs", "1 dozen"
    },

    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending",
    },

    message: {
      type: String,
      trim: true,
    },

    // admin's response when approving/rejecting
    responseNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryRequestSchema.index({ organizationID: 1, status: 1 });

const InventoryRequest = mongoose.model("InventoryRequest", inventoryRequestSchema);
export default InventoryRequest;