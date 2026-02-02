const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
    let query = {};
    if (req.query.restaurantId) {
        query.restaurantId = req.query.restaurantId;
    }
    const menuItems = await MenuItem.find(query);
    res.json(menuItems);
});

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Public (for now)
const createMenuItem = asyncHandler(async (req, res) => {
    const { name, category, price, prepTime, spiceLevel, isVeg, ingredients, available, imageUrl, restaurantId } = req.body;

    const menuItem = new MenuItem({
        restaurantId,
        name,
        category,
        price,
        prepTime,
        spiceLevel,
        isVeg,
        ingredients,
        available,
        imageUrl
    });

    const createdMenuItem = await menuItem.save();
    res.status(201).json(createdMenuItem);
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Public
const updateMenuItem = asyncHandler(async (req, res) => {
    const { name, category, price, prepTime, spiceLevel, isVeg, ingredients, available, imageUrl } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
        menuItem.name = name;
        menuItem.category = category;
        menuItem.price = price;
        menuItem.prepTime = prepTime;
        menuItem.spiceLevel = spiceLevel;
        menuItem.isVeg = isVeg;
        menuItem.ingredients = ingredients;
        menuItem.available = available;
        menuItem.imageUrl = imageUrl;

        const updatedMenuItem = await menuItem.save();
        res.json(updatedMenuItem);
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

module.exports = { getMenuItems, createMenuItem, updateMenuItem };
