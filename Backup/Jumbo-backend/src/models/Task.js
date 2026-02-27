const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
    },

    title: {
      type: String,
      required: [true, "Please add a title"],
    },

    description: {
      type: String,
    },

    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
      },
    ],

    priority: {
      type: String,
    },

    deadline: {
      startDate: {
        type: Date,

      },
      endDate: {
        type: Date,

      }
      // type: Date,
    },

    voiceNote: {
      type: String,
    },

    sop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOP",
    },

    category: {
      type: String,
    },

    status: {
      type: String,
      default: "Pending",
    },
    aiReview: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    estimatedTime: {
      type: Number, // in seconds
      default: 0,
    },
    aiStatus: {
      type: String
    },
   isNew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
