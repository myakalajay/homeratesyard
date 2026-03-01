const { Loan, User, Profile, Document, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendNotification } = require('../services/notification.service');

// ==========================================
// 🏦 LOAN CONTROLLER (Standard Operations)
// ==========================================

/**
 * @desc    Create a New Loan Application
 * @route   POST /api/loans
 * @access  Private (Borrower)
 */
exports.createLoan = async (req, res) => {
  try {
    const { amount, loanType, propertyAddress, propertyValue, estimatedCreditScore } = req.body;

    // 1. Validation
    if (!amount || !loanType || !propertyAddress) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Draft Creation
    const loan = await Loan.create({
      userId: req.user.id,
      amount,
      loanType,
      status: 'draft', // Starts as draft until submitted
      propertyAddress,
      propertyValue,
      estimatedCreditScore: estimatedCreditScore || 0
    });

    // 3. Notify User
    // Fire-and-forget notification
    sendNotification(req.user.id, 'Application Started', `Loan #${loan.id} created as draft.`, 'info');

    res.status(201).json({ 
        success: true, 
        message: 'Loan application started', 
        loan 
    });

  } catch (error) {
    console.error("Create Loan Error:", error);
    res.status(500).json({ message: 'Failed to create application' });
  }
};

/**
 * @desc    Get My Loans (Smart Context: Borrower vs Lender)
 * @route   GET /api/loans?status=submitted&page=1
 * @access  Private
 */
exports.getMyLoans = async (req, res) => {
  try {
    const { role, id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let where = {};

    // 🧠 SMART CONTEXT SWITCHING
    if (role === 'borrower') {
        // Borrower: See ONLY my loans
        where = { userId: id };
    } else if (role === 'lender') {
        // Lender: See assigned loans OR pool of submitted loans
        where = {
            [Op.or]: [
                { lenderId: id }, // Assigned to me
                { status: 'submitted', lenderId: null } // Open Marketplace
            ]
        };
    } else if (['admin', 'super_admin'].includes(role)) {
        // Admin: See everything (though they usually use Admin Portal)
        where = {}; 
    }

    // Filter by Status if requested
    if (req.query.status) {
        where.status = req.query.status;
    }

    const { count, rows } = await Loan.findAndCountAll({
        where,
        include: [
            { model: User, as: 'borrower', attributes: ['name', 'email'] }
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        offset
    });

    res.json({
        loans: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error("Fetch Loans Error:", error);
    res.status(500).json({ message: 'Failed to retrieve loans' });
  }
};

/**
 * @desc    Get Single Loan Details
 * @route   GET /api/loans/:id
 * @access  Private (Owner/Lender/Admin)
 */
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
        include: [
            { model: User, as: 'borrower', attributes: ['id', 'name', 'email', 'phone'] },
            { model: Document, as: 'documents', attributes: ['id', 'type', 'name', 'createdAt'] }
        ]
    });

    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // 🛡️ SECURITY: Access Control
    const isOwner = loan.userId === req.user.id;
    const isAssignedLender = loan.lenderId === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    // Lenders can view "Submitted" loans to pick them up
    const isMarketplaceView = req.user.role === 'lender' && loan.status === 'submitted' && !loan.lenderId;

    if (!isOwner && !isAssignedLender && !isAdmin && !isMarketplaceView) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update Loan (Borrower Edit or Lender Review)
 * @route   PUT /api/loans/:id
 * @access  Private
 */
exports.updateLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const { status, lenderId, ...updates } = req.body;
    const { role, id } = req.user;

    // SCENARIO 1: Borrower Editing Draft
    if (role === 'borrower') {
        if (loan.userId !== id) return res.status(403).json({ message: 'Unauthorized' });
        if (loan.status !== 'draft' && loan.status !== 'submitted') {
            return res.status(400).json({ message: 'Cannot edit a loan currently under review' });
        }
        
        // Allowed updates
        await loan.update(updates);
        
        // State Transition: Draft -> Submitted
        if (status === 'submitted' && loan.status === 'draft') {
            loan.status = 'submitted';
            loan.submittedAt = new Date();
            await loan.save();
            sendNotification(id, 'Application Submitted', 'Your loan is now visible to lenders.', 'success');
        }
        return res.json(loan);
    }

    // SCENARIO 2: Lender Picking Up Loan
    if (role === 'lender') {
        // Lender Assigns Self
        if (status === 'under_review' && loan.status === 'submitted' && !loan.lenderId) {
            loan.lenderId = id;
            loan.status = 'under_review';
            await loan.save();
            
            sendNotification(loan.userId, 'Lender Assigned', 'A lender has begun reviewing your file.', 'info');
            return res.json({ message: 'Loan assigned to you', loan });
        }
        
        // Lender Updating Assigned Loan
        if (loan.lenderId === id) {
             // Lenders cannot approve/reject via this endpoint (Must use Admin/Underwriter portal)
             // But they can update notes or minor fields
             await loan.update(updates);
             return res.json(loan);
        }
    }

    res.status(400).json({ message: 'Invalid operation' });

  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

/**
 * @desc    Delete Loan (Borrower Draft Only)
 * @route   DELETE /api/loans/:id
 * @access  Private
 */
exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    if (loan.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (loan.status !== 'draft') return res.status(400).json({ message: 'Only draft applications can be deleted' });

    await loan.destroy();
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};