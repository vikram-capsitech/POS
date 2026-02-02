const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem, updateMenuItem } = require('../controllers/menuController');

router.route('/').get(getMenuItems).post(createMenuItem);
router.route('/:id').put(updateMenuItem);

module.exports = router;
