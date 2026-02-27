const mongoose = require("mongoose");

const CoinsTransactionSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },

    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CoinsTransaction", CoinsTransactionSchema);
