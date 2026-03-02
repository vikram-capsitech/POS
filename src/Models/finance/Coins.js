import mongoose from "mongoose";

// Tracks each employee's total coin balance.
// One record per employee — acts as their "coin wallet".
// Individual transactions are stored in CoinsTransaction.

const coinsSchema = new mongoose.Schema(
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
      unique: true, // one wallet per employee
    },

    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    // virtual balance = totalEarned - totalSpent
    // not stored in DB, computed via virtual below
  },
  { timestamps: true }
);

// Virtual: current available balance
coinsSchema.virtual("balance").get(function () {
  return this.totalEarned - this.totalSpent;
});

// NOTE: removed coinsTransactions[] array from here.
// Storing transaction IDs in an array grows unboundedly over time.
// Instead query: CoinsTransaction.find({ employeeID }) when needed.

coinsSchema.index({ organizationID: 1 });

const Coins = mongoose.model("Coins", coinsSchema);
export default Coins;