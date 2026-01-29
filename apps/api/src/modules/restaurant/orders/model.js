const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD } = require('@pos/shared');

const orderSchema = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    notes: String
  }],
  totalAmount: Number,
  tax: Number,
  finalAmount: Number,
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.NEW },
  type: { type: String, enum: Object.values(ORDER_TYPE), default: ORDER_TYPE.DINE_IN },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableName: String,
  paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD) },
  customerName: String,
  customerPhone: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
