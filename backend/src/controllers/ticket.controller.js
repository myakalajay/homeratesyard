const { Ticket, User, sequelize } = require('../models');
const { sendNotification } = require('../services/notification.service');
const { Op } = require('sequelize');

// ==========================================
// 🎫 SUPPORT TICKET CONTROLLER
// ==========================================

/**
 * @desc    Create a new Support Ticket
 * @route   POST /api/tickets
 * @access  Private (User)
 */
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message, relatedLoanId } = req.body;

    // 1. Validation
    if (!subject || !message || !category) {
        return res.status(400).json({ message: 'Subject, Category, and Message are required.' });
    }

    // 2. Create Ticket
    const ticket = await Ticket.create({
      userId: req.user.id,
      subject,
      category,
      priority: priority || 'normal',
      status: 'open',
      relatedLoanId: relatedLoanId || null,
      history: [{ 
          sender: req.user.name, 
          role: 'user', 
          message, 
          date: new Date() 
      }]
    });

    // 3. Notify Admins (Log for now, or finding all admins)
    console.log(`[TICKET] New Ticket #${ticket.id} from ${req.user.email}`);

    res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        ticket
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ message: 'Failed to submit ticket.' });
  }
};

/**
 * @desc    Get Tickets (Paginated & Filterable)
 * @route   GET /api/tickets?status=open&priority=high&page=1
 * @access  Private
 */
exports.getTickets = async (req, res) => {
  try {
    const { role, id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 1. Build Filter
    let where = {};
    
    // User Restriction: Users only see their own
    if (!['super_admin', 'admin'].includes(role)) {
        where.userId = id;
    }

    // Dynamic Filters (Status, Priority)
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;

    // 2. Fetch Data
    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'role'] }
      ],
      order: [
          ['status', 'ASC'], // 'open' usually comes before 'closed' alphabetically or by enum
          ['updatedAt', 'DESC']
      ],
      limit,
      offset
    });

    res.json({
        tickets: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error("Fetch Tickets Error:", error);
    res.status(500).json({ message: 'Failed to retrieve tickets.' });
  }
};

/**
 * @desc    Reply to Ticket & Update Status
 * @route   POST /api/tickets/:id/reply
 * @access  Private (Owner or Admin)
 */
exports.replyTicket = async (req, res) => {
  try {
    const { message, newStatus } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // 1. Security Check
    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    if (!isAdmin && ticket.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    // 2. Append to History (JSON Array)
    const newEntry = {
        sender: req.user.name,
        role: isAdmin ? 'admin' : 'user', // Simplified role for UI
        message,
        date: new Date()
    };
    
    // Spread syntax to create new array reference
    const updatedHistory = ticket.history ? [...ticket.history, newEntry] : [newEntry];
    ticket.history = updatedHistory;
    ticket.changed('history', true); // ⚠️ Critical for Sequelize JSON updates

    // 3. Update Status Logic
    if (newStatus) {
        // Validate Status
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (validStatuses.includes(newStatus)) {
            ticket.status = newStatus;
        }
    } else {
        // Auto-Status Logic:
        // If Admin replies -> Set to 'in_progress' (waiting for user)
        // If User replies -> Set to 'open' (waiting for admin)
        if (isAdmin && ticket.status === 'open') ticket.status = 'in_progress';
        if (!isAdmin && ticket.status === 'resolved') ticket.status = 'open';
    }
    
    await ticket.save();

    // 4. Notifications
    // If Admin replied, notify User
    if (isAdmin) {
        sendNotification(
            ticket.userId,
            `Ticket Updated: ${ticket.subject}`,
            `Support replied: "${message.substring(0, 40)}..."`,
            'info',
            `/dashboard/support`
        );
    } 
    // If User replied, we don't notify Admin here (Admins check dashboard), 
    // but in a real app, we might email the support team alias.

    res.json({ success: true, ticket });
  } catch (error) {
    console.error("Reply Error:", error);
    res.status(500).json({ message: 'Failed to send reply.' });
  }
};