import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    attendanceID: {
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
      default: null, // null means break is still ongoing
    },

    duration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  { timestamps: true }
);

const Break = mongoose.model("Break", breakSchema);
export default Break;