const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true }, // e.g., 'kg', 'ltr', 'pcs'
  quantity: { type: Number, required: true, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
