const mongoose = require("mongoose");

const coinsSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
      unique: true, // each employee has ONE coins record
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    coinsTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoinsTransaction",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coins", coinsSchema);
