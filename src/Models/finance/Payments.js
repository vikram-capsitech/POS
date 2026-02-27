import mongoose from "mongoose";

const paymentsSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // replaces old "admin" ref — any user with payroll permission can process
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // which employee this payment is for
    },

    amount: {
      type: Number,
      min: 0,
      default: 0,
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

    type: {
      type: String,
      enum: ["salary", "advance", "bonus", "deduction"],
      default: "salary",
    },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentsSchema.index({ organizationID: 1, currentMonth: 1, currentYear: 1 });
paymentsSchema.index({ employee: 1 });

const Payments = mongoose.model("Payments", paymentsSchema);
export default Payments;