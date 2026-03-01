const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} = require('../controllers/notification.controller');

// ==========================================
// 🔔 NOTIFICATION ROUTES
// ==========================================

// Global Protection
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications (Paginated)
 * @access  Private
 */
router.get('/', getMyNotifications);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark ALL as read (Bulk Action)
 * @access  Private
 * ⚠️ Must be defined BEFORE /:id/read to avoid collision
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', deleteNotification);

module.exports = router;