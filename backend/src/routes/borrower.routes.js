const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardSummary } = require('../controllers/borrower.controller');

// Protect ensures they are logged in. Authorize ensures ONLY borrowers can access this.
router.get('/dashboard', protect, authorize('borrower'), getDashboardSummary);

module.exports = router;