const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequest } = require('../../controllers/pos/inventoryController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, isAdmin, getRequests);

router.route('/request')
    .post(protect, createRequest); // Kitchen staff can create

router.route('/:id')
    .put(protect, isAdmin, updateRequest);

module.exports = router;
