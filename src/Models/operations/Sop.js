import mongoose from "mongoose";

const sopSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      // removed hardcoded enum ["Cleaning", "Kitchen", "Maintenance"]
      // so any org type can define their own categories
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Review", "Draft"],
      default: "Active",
    },

    statusClass: {
      type: String,
      enum: ["info", "warning", "success"],
      default: "info",
    },

    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    estimatedTime: {
      type: String,
      enum: ["15 min", "30 min", "45 min", "1 hr", "2 hr", "3 hr"],
      default: "30 min",
    },

    voiceNote: {
      type: String,
    },

    steps: [
      {
        id:    { type: Number },
        name:  { type: String, trim: true },
        items: [{ type: String, trim: true }],
      },
    ],
  },
  { timestamps: true }
);

sopSchema.index({ organizationID: 1, status: 1 });

const SOP = mongoose.model("SOP", sopSchema);
export default SOP;