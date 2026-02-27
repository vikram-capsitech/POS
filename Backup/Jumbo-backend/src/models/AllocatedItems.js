const mongoose = require("mongoose");

const allocatedIemSchema = new mongoose.Schema(
  {

    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    itemName: {
      type: String,
    },
    image: {
      type: String
    },
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    status: {
      type: String,
      enum: ["Pending", "Received"],
      default: "Pending",
    },
    issuedOn: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

// Create and export the Document model
const AllocatedItems = mongoose.model("AllocatedItems", allocatedIemSchema);
module.exports = AllocatedItems;