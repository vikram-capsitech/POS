import mongoose from "mongoose";

// Merged Attendance + AdminAttendance into one model.
// Old codebase had two separate models (Attendance.js & AdminAttendance.js)
// which caused duplication. Now any user (admin or employee) can have
// an attendance record — userID ref handles both.

const attendanceSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // replaces both "employee" ref and "admin" ref from old models
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

    breaks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Break",
      },
    ],

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

// Prevent duplicate attendance record for same user on same day
attendanceSchema.index({ userID: 1, date: 1 }, { unique: true });

// Fast lookup: all attendance for an org on a given date
attendanceSchema.index({ organizationID: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;