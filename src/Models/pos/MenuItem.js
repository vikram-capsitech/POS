import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    prepTime: {
      type: Number, // in minutes
      required: true,
      min: 0,
    },

    spiceLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },

    isVeg: {
      type: Boolean,
      required: true,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    available: {
      type: Boolean,
      default: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0, // percentage
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ organizationID: 1, category: 1 });
menuItemSchema.index({ organizationID: 1, available: 1 });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;