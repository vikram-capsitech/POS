const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    number: { type: Number, required: true }, // Removed unique constraint as it should be unique per restaurant only
    seats: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['available', 'occupied', 'reserved', 'billing'], 
        default: 'available' 
    },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    floor: { type: String, default: 'Ground' },
    shape: { type: String, enum: ['round', 'square', 'rect'], default: 'square' },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
