const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true }, // T1, T2
  capacity: Number,
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED'], default: 'AVAILABLE' },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
