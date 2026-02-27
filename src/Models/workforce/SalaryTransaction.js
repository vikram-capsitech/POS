import mongoose from "mongoose";

const salaryTransactionSchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: true,
      min: 0,
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
      // made into an enum so transaction types are consistent and queryable
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // admin who processed this transaction
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

salaryTransactionSchema.index({ organizationID: 1, employee: 1, currentMonth: 1, currentYear: 1 });

const SalaryTransaction = mongoose.model("SalaryTransaction", salaryTransactionSchema);
export default SalaryTransaction;