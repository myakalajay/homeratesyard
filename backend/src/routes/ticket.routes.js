const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createTicket, 
  getTickets, 
  replyTicket 
} = require('../controllers/ticket.controller');

// ==========================================
// 🎫 SUPPORT TICKET ROUTES
// ==========================================

// Global Protection: Support is for logged-in users only
router.use(protect);

/**
 * @route   POST /api/tickets
 * @desc    Open a new support ticket
 * @access  Private (User)
 */
router.post('/', createTicket);

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets (Admin) or My Tickets (User)
 * @access  Private
 */
router.get('/', getTickets);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket details (Chat History)
 * @access  Private
 * @note    Ideally requires a getTicketById controller method. 
 * If not present, the frontend must filter the list.
 */
// router.get('/:id', getTicketById); // Uncomment when controller supports it

/**
 * @route   POST /api/tickets/:id/reply
 * @desc    Add a message to the ticket history
 * @access  Private (Owner or Admin)
 */
router.post('/:id/reply', replyTicket);

module.exports = router;