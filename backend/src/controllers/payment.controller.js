const { Payment, Loan, User, sequelize } = require('../models');
const { sendNotification } = require('../services/notification.service');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Future Integration

// ==========================================
// 💳 PAYMENT CONTROLLER
// ==========================================

/**
 * @desc    Initiate a Payment (Mock Gateway)
 * @route   POST /api/payments
 * @access  Private (Borrower)
 */
exports.createPayment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { loanId, amount, method } = req.body;

    // 1. Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      await t.rollback();
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // 2. Gateway Integration (Mock for now)
    // In production: const charge = await stripe.paymentIntents.create({...});
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const status = 'completed'; // Mock success

    // 3. Record Transaction
    const payment = await Payment.create({
      loanId,
      userId: req.user.id,
      amount,
      method: method || 'bank_transfer',
      status,
      transactionId,
      paidAt: new Date()
    }, { transaction: t });

    // 4. Update Loan Balance (Atomic Decrement)
    // Ideally, this should be a separate ledger entry, but simple decrement works for MVP
    // loan.balance -= amount; 
    // await loan.save({ transaction: t });

    await t.commit();

    // 5. Notify
    sendNotification(req.user.id, 'Payment Received', `We received your payment of $${amount}.`, 'success');

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });

  } catch (error) {
    await t.rollback();
    console.error("Payment Error:", error);
    res.status(500).json({ message: 'Payment processing failed.' });
  }
};

/**
 * @desc    Get Payment History for a Loan
 * @route   GET /api/payments/loan/:loanId
 * @access  Private (Owner/Admin)
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    // 1. Security Check
    const loan = await Loan.findByPk(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });

    const isAuthorized = 
      req.user.role === 'super_admin' || 
      req.user.role === 'admin' || 
      loan.userId === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access Denied.' });
    }

    // 2. Fetch History
    const payments = await Payment.findAll({
      where: { loanId },
      order: [['paidAt', 'DESC']]
    });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve history.' });
  }
};

/**
 * @desc    Generate Receipt (Stub)
 * @route   GET /api/payments/:id/receipt
 * @access  Private
 */
exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Transaction not found.' });

    if (payment.userId !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access Denied.' });
    }

    // Return simple JSON receipt for now. 
    // Phase 4: Generate PDF here using pdfService
    res.json({
      receiptId: `RCPT-${payment.id}`,
      date: payment.paidAt,
      amount: payment.amount,
      method: payment.method,
      status: payment.status
    });

  } catch (error) {
    res.status(500).json({ message: 'Receipt generation failed.' });
  }
};