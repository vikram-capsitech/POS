import mongoose from "mongoose";

const salaryRecordSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    currentMonth: {
      type: Number,
      default: () => new Date().getMonth(),
    },

    currentYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

salaryRecordSchema.index({ organizationID: 1, employee: 1, currentMonth: 1, currentYear: 1 });

const SalaryRecord = mongoose.model("SalaryRecord", salaryRecordSchema);
export default SalaryRecord;