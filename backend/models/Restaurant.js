const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    name: { type: String, required: true, default: 'My Restaurant' },
    address: { type: String, default: '123 Food Street' },
    phone: { type: String, default: '555-0199' },
    description: { type: String, default: 'Best food in town!' },
    wifiSsid: { type: String },
    wifiPass: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
