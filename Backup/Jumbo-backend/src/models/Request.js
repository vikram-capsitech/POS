const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    raisedBy: {
      type: String,
      enum: ["admin", "user"], // or Employee
      required: true,
    },
    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },

    date: {
      type: Date,
    },
    deadline: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },

    requestType: {
      type: String,
      enum: ["Issue", "Complaint", "Support"], // you said "enum issue" → added more options, change as needed
      required: true,
    },

    submittedDate: {
      type: Date,
      default: Date.now,
    },

    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    category: {
      type: String,
    },
    voiceNote: {
      type: String,
    },
    sop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOP",
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    isNew: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
