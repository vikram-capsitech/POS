const express = require('express');
const router = express.Router();
const { getStats, createReport, getReports } = require('../../controllers/pos/reportController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, isAdmin, getReports)
    .post(protect, createReport); // Staff can submit reports

router.route('/stats')
    .get(protect, isAdmin, getStats);

module.exports = router;
