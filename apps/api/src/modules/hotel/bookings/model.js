const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestPhone: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { type: String, enum: ['BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'], default: 'BOOKED' },
  totalAmount: Number,
  advanceAmount: Number,
  serviceOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] // Linked Restaurant/Service Orders
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
