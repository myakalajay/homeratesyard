const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @model Payment
 * @description Records all incoming and outgoing financial transactions.
 * Handles loan repayments, subscription fees, and wallet top-ups.
 */
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Link to the User making the payment
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', // Ensure this matches your User table name
      key: 'id'
    }
  },
  // Link to the Loan (if this is a repayment)
  loanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Loans', // Ensure this matches your Loan table name
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  // Stripe/PayPal Transaction ID
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  // e.g., 'stripe', 'paypal', 'bank_transfer', 'wallet'
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'stripe'
  },
  // e.g., 'loan_repayment', 'appraisal_fee', 'subscription', 'wallet_topup'
  type: {
    type: DataTypes.ENUM(
      'loan_repayment', 
      'down_payment',
      'appraisal_fee', 
      'subscription', 
      'wallet_topup',
      'late_fee'
    ),
    allowNull: false,
    defaultValue: 'loan_repayment'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  // JSON metadata for storing provider response (e.g., Stripe receipt URL)
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'Payments',
  indexes: [
    { fields: ['userId'] },
    { fields: ['loanId'] },
    { fields: ['transactionId'] },
    { fields: ['status'] }
  ]
});

module.exports = Payment;