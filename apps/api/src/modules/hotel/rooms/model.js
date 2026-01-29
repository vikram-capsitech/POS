const mongoose = require('mongoose');
const { ROOM_STATUS } = require('@pos/shared');

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['STANDARD', 'DELUXE', 'SUITE'], required: true },
  price: { type: Number, required: true }, // Base price
  status: { type: String, enum: Object.values(ROOM_STATUS), default: ROOM_STATUS.AVAILABLE }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
