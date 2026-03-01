const { User, Loan, Ticket, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==========================================
// 📊 DASHBOARD AGGREGATOR
// ==========================================

/**
 * @desc    Get Role-Based Dashboard Overview
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let dashboardData = {};

    // ==========================================
    // 🛡️ SUPER ADMIN VIEW
    // ==========================================
    if (role === 'super_admin') {
      // Parallel fetch for speed
      const [userCount, loanVolume, criticalTickets, recentActivity] = await Promise.all([
        User.count(),
        Loan.sum('amount'),
        Ticket ? Ticket.count({ where: { priority: 'high', status: 'open' } }) : 0,
        // Audit Trail Snippet for "Live Feed" widget
        sequelize.models.AuditLog ? sequelize.models.AuditLog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'admin', attributes: ['name'] }]
        }) : []
      ]);

      dashboardData = {
        viewType: 'admin_command_center',
        metrics: {
          totalUsers: userCount,
          systemVolume: loanVolume || 0,
          criticalAlerts: criticalTickets
        },
        recentActivity: recentActivity.map(log => ({
            action: log.action,
            admin: log.admin?.name || 'System',
            time: log.createdAt
        }))
      };
    }

    // ==========================================
    // 💼 LENDER VIEW
    // ==========================================
    else if (role === 'lender') {
      // Lenders see loans assigned to them or in their pool
      const assignedLoans = await Loan.count({ 
        where: { 
            [Op.or]: [{ lenderId: userId }, { status: 'submitted' }] 
        } 
      });

      dashboardData = {
        viewType: 'lender_workspace',
        metrics: {
            assignedLoans,
            pendingReviews: assignedLoans // Placeholder logic
        },
        // Lenders need to see new loan applications
        queue: await Loan.findAll({
            where: { status: 'submitted' },
            limit: 5,
            attributes: ['id', 'amount', 'loanType', 'createdAt'],
            include: [{ model: User, as: 'borrower', attributes: ['name'] }]
        })
      };
    }

    // ==========================================
    // 🏠 BORROWER VIEW
    // ==========================================
    else {
      // Borrowers only see their own application
      const myLoan = await Loan.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      dashboardData = {
        viewType: 'borrower_home',
        hasActiveLoan: !!myLoan,
        loanSummary: myLoan ? {
            id: myLoan.id,
            status: myLoan.status,
            amount: myLoan.amount,
            nextStep: myLoan.status === 'draft' ? 'Complete Application' : 'Wait for Review'
        } : null
      };
    }

    res.json({
        success: true,
        role,
        ...dashboardData
    });

  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to load dashboard workspace' 
    });
  }
};