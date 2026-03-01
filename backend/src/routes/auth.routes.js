const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  emergencyReset // 🚨 Emergency backdoor
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// 🚨 EMERGENCY BACKDOOR: Hit this URL in your browser to forcefully reset the Admin password
router.get('/emergency-reset', emergencyReset);

// ==========================================
// 🔒 PRIVATE ROUTES (Requires JWT)
// ==========================================

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;