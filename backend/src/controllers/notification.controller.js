const { Notification } = require('../models');

// ==========================================
// 🔔 NOTIFICATION CONTROLLER
// ==========================================

/**
 * @desc    Get My Notifications (Paginated)
 * @route   GET /api/notifications?page=1&limit=20
 * @access  Private
 */
exports.getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // Add metadata for frontend pagination
        res.json({
            notifications: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            unreadCount: await Notification.count({ 
                where: { userId: req.user.id, isRead: false } 
            })
        });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        res.status(500).json({ message: 'Failed to load notifications' });
    }
};

/**
 * @desc    Mark a Single Notification as Read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findByPk(req.params.id);

        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Security: Ensure ownership
        if (notif.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        notif.isRead = true;
        await notif.save();

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Mark ALL Notifications as Read (Bulk Action)
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Delete a Notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notif = await Notification.findByPk(req.params.id);

        if (!notif) return res.status(404).json({ message: 'Not found' });
        if (notif.userId !== req.user.id) return res.status(403).json({ message: 'Access Denied' });

        await notif.destroy();
        res.json({ success: true, message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};