const mongoose = require("mongoose");


const documentSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    EmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    docName: {
      type: String,
    },
    doc: {
      type: String
    },
    docType: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Received"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Document model
const Document = mongoose.model("Document", documentSchema);
module.exports = Document;