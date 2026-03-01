const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createLoan, 
  getMyLoans, 
  getLoanById, 
  updateLoan, 
  deleteLoan 
} = require('../controllers/loan.controller');

// ==========================================
// 🏦 LOAN ROUTES
// ==========================================

// Global Protection: All routes require a valid JWT
router.use(protect);

/**
 * @route   POST /api/loans
 * @desc    Start a new loan application
 * @access  Private (Borrowers Only)
 */
router.post('/', authorize('borrower'), createLoan);

/**
 * @route   GET /api/loans
 * @desc    Get loans contextually (My Loans vs. Assigned Queue)
 * @access  Private (All Roles)
 */
router.get('/', getMyLoans);

/**
 * @route   GET /api/loans/:id
 * @desc    Get full details of a specific loan
 * @access  Private (Owner/Lender/Admin)
 */
router.get('/:id', getLoanById);

/**
 * @route   PUT /api/loans/:id
 * @desc    Update loan details (Edit Draft or Lender Review)
 * @access  Private (Owner/Lender)
 */
router.put('/:id', updateLoan);

/**
 * @route   DELETE /api/loans/:id
 * @desc    Delete a draft application
 * @access  Private (Owner Only)
 */
router.delete('/:id', deleteLoan);

module.exports = router;