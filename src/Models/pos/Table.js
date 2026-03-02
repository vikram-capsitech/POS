import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    number: {
      type: Number,
      required: true,
      // unique per org, not globally — enforced via compound index below
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "billing"],
      default: "available",
    },

    currentOrderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    floor: {
      type: String,
      default: "Ground",
      trim: true,
    },

    shape: {
      type: String,
      enum: ["round", "square", "rect"],
      default: "square",
    },

    // position on floor map (for visual layout)
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// table number must be unique within the same org
tableSchema.index({ organizationID: 1, number: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema);
export default Table;