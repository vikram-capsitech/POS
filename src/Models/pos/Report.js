import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    type: {
      type: String,
      enum: ["cleanliness", "end_of_day", "incident"],
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    score: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },

    checklist: [
      {
        item:    { type: String },
        checked: { type: Boolean, default: false },
      },
    ],

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

reportSchema.index({ organizationID: 1, type: 1 });
reportSchema.index({ organizationID: 1, status: 1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;