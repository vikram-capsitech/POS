const mongoose = require("mongoose");

const menuItemSchema = mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    prepTime: { type: Number, required: true },
    spiceLevel: { type: Number, required: false },
    isVeg: { type: Boolean, required: true },
    ingredients: [String],
    available: { type: Boolean, default: true },
    imageUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
