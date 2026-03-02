const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema(
  {
    
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },

    breakStart: {
      type: Date,
      required: true,
    },

    breakEnd: {
      type: Date,
      default: null, // null means break still running
    },

    duration: {
      type: Number, // minutes
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Break", breakSchema);
