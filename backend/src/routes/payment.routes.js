const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createPayment, 
  getPaymentHistory, 
  getReceipt 
} = require('../controllers/payment.controller');

// ==========================================
// 💳 PAYMENT ROUTES
// ==========================================

// Global Protection: Financial data is sensitive
router.use(protect);

/**
 * @route   POST /api/payments
 * @desc    Initiate a new payment (Mock/Stripe)
 * @access  Private (Borrower)
 */
router.post('/', createPayment);

/**
 * @route   GET /api/payments/loan/:loanId
 * @desc    View payment history for a specific loan
 * @access  Private (Owner/Admin)
 */
router.get('/loan/:loanId', getPaymentHistory);

/**
 * @route   GET /api/payments/:id/receipt
 * @desc    Get transaction receipt details
 * @access  Private (Owner/Admin)
 */
router.get('/:id/receipt', getReceipt);

module.exports = router;