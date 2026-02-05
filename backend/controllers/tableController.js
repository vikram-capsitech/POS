const asyncHandler = require('express-async-handler');
const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
// @desc    Get all tables for a restaurant
// @route   GET /api/tables
// @access  Public
const getTables = asyncHandler(async (req, res) => {
    let query = {};
    if (req.query.restaurantId) {
        query.restaurantId = req.query.restaurantId;
    }
    const tables = await Table.find(query).populate('currentOrderId');
    res.json(tables);
});

// @desc    Update table status
// @route   PUT /api/tables/:id
// @access  Public
const updateTable = asyncHandler(async (req, res) => {
    const { status, currentOrderId } = req.body;
    const table = await Table.findById(req.params.id);

    if (table) {
        table.status = status || table.status;
        if (currentOrderId !== undefined) table.currentOrderId = currentOrderId;

        const updatedTable = await table.save();
        res.json(updatedTable);
    } else {
        res.status(404);
        throw new Error('Table not found');
    }
});

// @desc    Initialize tables (seeding help)
// @route   POST /api/tables
const createTable = asyncHandler(async (req, res) => {
    const { number, seats, restaurantId } = req.body;
    const table = await Table.create({ number, seats, restaurantId });
    res.status(201).json(table);
});

module.exports = { getTables, updateTable, createTable };
