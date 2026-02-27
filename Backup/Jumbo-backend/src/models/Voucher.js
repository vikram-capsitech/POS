const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
    },

    description: {
      type: String,
    },
    coins: {
      type: Number,
      required: [true, "Please add Coins"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add owner of the voucher"],
    },
    assignType: {
      type: String,
      enum: ["ALL", "SPECIFIC"],
      default: "ALL",
    },
    assignTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
      },
    ],
    status: {
      type: String,
      enum: ["Active", "In-active"],
      default: "Active",
    },
    timeline: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Voucher", voucherSchema);
