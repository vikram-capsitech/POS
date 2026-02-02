const mongoose = require('mongoose');

const inventoryRequestSchema = mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: String, required: true },
    quantity: { type: String, required: true }, // "5kg", "2 packs"
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'fulfilled'],
        default: 'pending'
    },
    message: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('InventoryRequest', inventoryRequestSchema);
