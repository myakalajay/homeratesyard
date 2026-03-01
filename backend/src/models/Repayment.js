const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Repayment = sequelize.define('Repayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Loans', key: 'id' },
    comment: 'The loan this payment is applied to'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    comment: 'The payer (usually the borrower)'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  // 🟢 Synchronized with Seed Script
  scheduledDate: {
    type: DataTypes.DATE, // Using DATE for better JS compatibility in seeds
    allowNull: false,
    comment: 'Due date for this installment'
  },
  actualPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the money was actually received'
  },
  // 🟢 Added to support the loop in your seed script
  installmentNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'late', 'overdue'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING, // 'ACH', 'STRIPE', 'WIRE'
    allowNull: true
  },
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External Gateway ID (e.g., ch_3Lh...)'
  }
}, {
  timestamps: true,
  tableName: 'Repayments',
  indexes: [
    { fields: ['loanId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['scheduledDate'] }
  ]
});

module.exports = Repayment;