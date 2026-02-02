const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    type: { type: String, enum: ['cleanliness', 'end_of_day', 'incident'], required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number }, // 1-10 or null
    checklist: [{
        item: String,
        checked: Boolean
    }],
    notes: String,
    status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
