const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['VEG', 'NON_VEG', 'DRINK'], default: 'VEG' },
  description: String,
  image: String,
  isAvailable: { type: Boolean, default: true },
  // Recipe for Inventory Deduction
  recipe: [{
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: { type: Number, required: true } // Quantity consumed per unit of product
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
