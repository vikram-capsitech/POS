const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    breaks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Break",

    }],

    hoursWorked: {
      type: Number,
      default: 0, // in hours
    },

    overtime: {
      type: Number,
      default: 0, // in hours
    },

    status: {
      type: String,
      enum: ["On time", "Late", "Early", "Absent", "Authorized leave", "Leave"],
      default: "On time",
    },
    selfie: {
      type: String,
      default: null,
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    dressCheck: {
      type: Boolean,
      default: true,
    },
    dressReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
