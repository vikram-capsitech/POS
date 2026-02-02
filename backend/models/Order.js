const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, // Not required for delivery
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true },
        customization: { type: String },
        specialRequest: { type: String } // "Not too spicy"
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'preparing', 'ready', 'served', 'paid'],
        default: 'pending'
    },
    orderSource: {
        type: String,
        enum: ['dine-in', 'zomato', 'swiggy'],
        default: 'dine-in'
    },
    total: { type: Number, required: true },
    waiterName: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
