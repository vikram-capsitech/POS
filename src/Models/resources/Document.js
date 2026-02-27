import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    employeeID: {
      // fixed casing: was "EmployeeId" (inconsistent) → now "employeeID"
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    docName: {
      type: String,
      trim: true,
    },

    doc: {
      type: String, // file URL or path
    },

    docType: {
      type: String,
      trim: true,
      // e.g. "id_proof", "contract", "certificate"
    },

    status: {
      type: String,
      enum: ["Pending", "Received"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

documentSchema.index({ organizationID: 1, employeeID: 1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;