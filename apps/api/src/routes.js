const express = require('express');
const router = express.Router();

const productController = require('./modules/restaurant/products/controller');
const orderController = require('./modules/restaurant/orders/controller');
const tableController = require('./modules/restaurant/tables/controller');
const roomController = require('./modules/hotel/rooms/controller');
const inventoryController = require('./modules/inventory/controller');
const reportsController = require('./modules/reports/controller');

// Restaurant Routes
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);

router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);

router.get('/tables', tableController.getTables);

// Hotel Routes
router.get('/rooms', roomController.getRooms);

// Inventory Routes
router.get('/inventory', inventoryController.getInventory);
router.post('/inventory', inventoryController.createItem);
router.post('/inventory/stock', inventoryController.addStock);

// Reports Routes
router.get('/reports/stats', reportsController.getStats);

module.exports = router;
