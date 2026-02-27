import mongoose from "mongoose";

const allocatedItemsSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    itemName: {
      type: String,
      trim: true,
      required: true,
    },

    image: {
      type: String, // URL or file path
    },

    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // the employee this item is assigned to
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // admin who issued the item
    },

    status: {
      type: String,
      enum: ["Pending", "Received", "Returned"],
      // added "Returned" as a useful state for asset tracking
      default: "Pending",
    },

    issuedOn: {
      type: Date,
      default: Date.now,
    },

    returnedOn: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

allocatedItemsSchema.index({ organizationID: 1, issuedTo: 1 });

const AllocatedItems = mongoose.model("AllocatedItems", allocatedItemsSchema);
export default AllocatedItems;