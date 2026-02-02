const express = require('express');
const router = express.Router();
const { getTables, updateTable, createTable } = require('../controllers/tableController');

router.route('/').get(getTables).post(createTable);
router.route('/:id').put(updateTable);

module.exports = router;
