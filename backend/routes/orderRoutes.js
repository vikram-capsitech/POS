const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrder, addOrderItems, getOrderById } = require('../controllers/orderController');

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrderById).put(updateOrder);
router.route('/:id/items').post(addOrderItems);

module.exports = router;
