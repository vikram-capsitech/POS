const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Report = require('../models/Report');

// @desc    Get Order Stats (Avg Delivery Time)
// @route   GET /api/reports/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const restaurantId = req.query.restaurantId || req.user.restaurantId;
    
    // Avg Delivery Time (Time between Created and Served/Paid)
    // We look for orders that are 'served' or 'paid'
    const matchStage = {
        status: { $in: ['served', 'paid'] }
    };
    
    if (restaurantId) {
        matchStage.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    const stats = await Order.aggregate([
        { $match: matchStage },
        {
            $project: {
                deliveryTime: { $subtract: ["$updatedAt", "$createdAt"] } // Diff in ms
            }
        },
        {
            $group: {
                _id: null,
                avgDeliveryTime: { $avg: "$deliveryTime" },
                minDeliveryTime: { $min: "$deliveryTime" },
                maxDeliveryTime: { $max: "$deliveryTime" },
                count: { $sum: 1 }
            }
        }
    ]);

    // Format ms to minutes
    const result = stats.length > 0 ? {
        avgMinutes: Math.round(stats[0].avgDeliveryTime / 60000),
        minMinutes: Math.round(stats[0].minDeliveryTime / 60000),
        maxMinutes: Math.round(stats[0].maxDeliveryTime / 60000),
        totalOrders: stats[0].count
    } : { avgMinutes: 0, totalOrders: 0 };

    res.json(result);
});

// @desc    Create a Report (Cleanliness)
// @route   POST /api/reports
// @access  Private (Staff)
const createReport = asyncHandler(async (req, res) => {
    const { type, score, checklist, notes, restaurantId } = req.body;
    
    const report = await Report.create({
        restaurantId: restaurantId || req.user.restaurantId,
        submittedBy: req.user._id,
        type,
        score,
        checklist,
        notes
    });

    res.status(201).json(report);
});

// @desc    Get Reports
// @route   GET /api/reports
// @access  Private (Admin)
const getReports = asyncHandler(async (req, res) => {
    const restaurantId = req.query.restaurantId || req.user.restaurantId;
    const query = restaurantId ? { restaurantId } : {};
    
    const reports = await Report.find(query)
        .populate('submittedBy', 'name role')
        .sort({ createdAt: -1 });

    res.json(reports);
});

module.exports = {
    getStats,
    createReport,
    getReports
};
