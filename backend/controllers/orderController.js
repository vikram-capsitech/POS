const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Table = require('../models/Table');

// @desc    Get all orders (Active)
// @route   GET /api/orders
// @access  Public
// @desc    Get all orders (Active)
// @route   GET /api/orders
// @access  Public
const getOrders = asyncHandler(async (req, res) => {
    // Populate menuItem details in items array
    let query = {};
    if (req.query.restaurantId) {
        query.restaurantId = req.query.restaurantId;
    }
    const orders = await Order.find(query).populate('items.menuItem');
    res.json(orders);
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    const { tableId, items, total, waiterName, orderSource, restaurantId } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const order = new Order({
            tableId,
            restaurantId, // Required now
            items,
            total,
            waiterName,
            orderSource: orderSource || 'dine-in'
        });

        const createdOrder = await order.save();

        // Update table to occupied and link order
        if(tableId) {
            const table = await Table.findById(tableId);
            if (table) {
                table.status = 'occupied';
                table.currentOrderId = createdOrder._id;
                await table.save();
            }
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Public
const updateOrder = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();

        // If paid, free up table (logic depends on requirements, freeing on 'paid' usually)
        if (status === 'paid') {
            const table = await Table.findById(order.tableId);
            if (table) {
                table.status = 'available';
                table.currentOrderId = null;
                await table.save();
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Add items to existing order
// @route   POST /api/orders/:id/items
// @access  Public
const addOrderItems = asyncHandler(async (req, res) => {
    const { items, total } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        // Concatenate new items
        order.items = order.items.concat(items);
        // Update total (assuming simple addition, real apps recalculate)
        order.total = (order.total || 0) + total;
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = { getOrders, createOrder, updateOrder, addOrderItems, getOrderById };
