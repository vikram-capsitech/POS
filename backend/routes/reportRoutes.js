const express = require('express');
const router = express.Router();
const { getStats, createReport, getReports } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getReports)
    .post(protect, createReport); // Staff can submit reports

router.route('/stats')
    .get(protect, admin, getStats);

module.exports = router;
