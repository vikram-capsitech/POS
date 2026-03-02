import mongoose from "mongoose";

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
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

coinsTransactionSchema.index({ organizationID: 1, employeeID: 1 });
coinsTransactionSchema.index({ employeeID: 1, date: -1 });

const CoinsTransaction =
  mongoose.models.CoinsTransaction ||
  mongoose.model("CoinsTransaction", coinsTransactionSchema);

export default CoinsTransaction;
