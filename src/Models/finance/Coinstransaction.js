import mongoose from "mongoose";

// Every time coins are earned or spent, a record is created here.
// Think of this as a ledger — one row per transaction.

const coinsTransactionSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    voucherID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
      // populated when type is "debit" and employee redeems a voucher
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    // reason for the transaction
    // e.g. "Task completed", "Voucher redeemed", "Monthly reward"
    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

coinsTransactionSchema.index({ organizationID: 1, employeeID: 1 });
coinsTransactionSchema.index({ employeeID: 1, date: -1 });

const CoinsTransaction = mongoose.model("CoinsTransaction", coinsTransactionSchema);
export default CoinsTransaction;