const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get restaurant info (Public) - supports ?id=xxx or returns default singleton
// @route   GET /api/restaurant
router.get('/', asyncHandler(async (req, res) => {
    if (req.query.all) {
        // List all for Admin
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
        return;
    }

    let info;
    if (req.query.id) {
        info = await Restaurant.findById(req.query.id);
    } else {
        info = await Restaurant.findOne();
    }

    if (!info && !req.query.id) {
         // Create default if not exists (Legacy Support)
        info = await Restaurant.create({});
    }
    res.json(info);
}));

// @desc    Create new restaurant (Admin)
// @route   POST /api/restaurant
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
}));

// @desc    Update restaurant info (Admin)
// @route   PUT /api/restaurant/:id
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    let info = await Restaurant.findById(req.params.id);
    if (!info) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    info.name = req.body.name || info.name;
    info.address = req.body.address || info.address;
    info.phone = req.body.phone || info.phone;
    info.description = req.body.description || info.description;
    info.wifiSsid = req.body.wifiSsid || info.wifiSsid;
    info.wifiPass = req.body.wifiPass || info.wifiPass;

    const updatedInfo = await info.save();
    res.json(updatedInfo);
}));

module.exports = router;
