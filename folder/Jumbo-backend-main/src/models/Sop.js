const mongoose = require("mongoose");

const sopSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
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
      enum: ["Cleaning", "Kitchen", "Maintenance"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Review", "Draft"],
      default: "Active"
    },
    statusClass: {
      type: String,
      enum: ["info", "warning", "success"],
      default: "info"
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
        id: { type: Number, required: false },
        name: { type: String, required: false, trim: true },
        items: [{ type: String, required: false, trim: true }],
      },
    ],
  },
  { timestamps: true } // adds createdAt & updatedAt for the whole SOP
);

module.exports = mongoose.model("SOP", sopSchema);
