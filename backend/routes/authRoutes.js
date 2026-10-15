const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { deleteAccountRateLimiter } = require('../middleware/security');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccountRateLimiter, deleteAccount);

module.exports = router;
