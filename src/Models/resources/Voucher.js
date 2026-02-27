import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
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

    coins: {
      type: Number,
      required: [true, "Please add coins value"],
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignType: {
      type: String,
      enum: ["ALL", "SPECIFIC"],
      default: "ALL",
    },

    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // only relevant when assignType is "SPECIFIC"
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      // fixed "In-active" typo → "Inactive"
      default: "Active",
    },

    timeline: {
      startDate: { type: Date, required: true },
      endDate:   { type: Date, required: true },
    },
  },
  { timestamps: true }
);

voucherSchema.index({ organizationID: 1, status: 1 });

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;