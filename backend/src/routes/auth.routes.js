const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  logout // 🟢 FIX: Imported the logout controller
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================

/**
 * @route   POST /api/auth/register
 * @desc    Create a new Borrower or Lender account
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', login);

// ==========================================
// 🔒 PRIVATE ROUTES (Requires JWT)
// ==========================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user details (Session Validation)
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user / Clear server-side cookies
 * @access  Private
 */
// 🟢 FIX: Removed inline logic, routed directly to controller
router.post('/logout', protect, logout);

module.exports = router;