const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequest } = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getRequests);

router.route('/request')
    .post(protect, createRequest); // Kitchen staff can create

router.route('/:id')
    .put(protect, admin, updateRequest);

module.exports = router;
