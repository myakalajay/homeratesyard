const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// ✅ FIXED: Matched controller export name
const { getDashboard } = require('../controllers/dashboard.controller');

// ==========================================
// 🛡️ GLOBAL PROTECTION
// ==========================================
// All dashboard routes require a valid JWT token
router.use(protect);

// ==========================================
// 📊 DASHBOARD ROUTES
// ==========================================

/**
 * @route   GET /api/dashboard
 * @desc    Get Role-Based Dashboard Overview (Aggregator)
 * @access  Private (All Roles)
 */
router.get('/', getDashboard);

module.exports = router;