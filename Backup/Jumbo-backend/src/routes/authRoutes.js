const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, updateUserProfile, setupSuperAdmin, googleLogin, changePassword, updateFCMToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/setup', setupSuperAdmin); // For initial setup only
router.post('/google-login', googleLogin)

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);
router.put('/fcm-token', protect, updateFCMToken);

module.exports = router;
