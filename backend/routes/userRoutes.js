const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.route('/').post(registerUser).get(protect, admin, getUsers);

module.exports = router;
