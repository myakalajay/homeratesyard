const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @model Loan
 * @description Stores loan applications, underwriting snapshots, and AUS results.
 */
const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: { // The Borrower
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    comment: 'The user applying for the loan'
  },
  lenderId: { // The Assigned Officer
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
    comment: 'The specific lender/admin working this file'
  },
  // ==============================
  // 💰 LOAN TERMS
  // ==============================
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  interestRate: { // Added to track the locked/quoted rate
    type: DataTypes.FLOAT,
    allowNull: true
  },
  term: {
    type: DataTypes.INTEGER, // e.g., 360 months
    allowNull: false,
    defaultValue: 360
  },
  loanType: {
    // 🟢 UPDATED: Included conventional, fha, va, jumbo to match seed script
    type: DataTypes.ENUM(
      'mortgage', 'refinance', 'heloc', 'personal', 
      'conventional', 'fha', 'va', 'jumbo'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'draft',         // User is typing
      'submitted',     // User hit send (Marketplace Queue)
      'under_review',  // Lender picked it up
      'conditional',   // Approved with conditions
      'approved',      // Clear to Close
      'rejected',      // Denied
      'funded',        // Complete
      'archived',      // Soft deleted/Hidden
      'active',        // Currently in repayment (matching seed)
      'pending'        // Awaiting initial review (matching seed)
    ),
    defaultValue: 'draft'
  },
  // ==============================
  // 📸 UNDERWRITING SNAPSHOTS
  // ==============================
  monthlyIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Snapshot of income used for DTI calc'
  },
  monthlyDebt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Snapshot of liabilities used for DTI calc'
  },
  creditScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Score pulled at time of app'
  },
  propertyAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  propertyValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  // ==============================
  // 🤖 AUTOMATED RESULTS (AUS)
  // ==============================
  ausResult: {
    type: DataTypes.ENUM('approve_eligible', 'refer_caution', 'refer_ineligible', 'manual_review'),
    defaultValue: 'manual_review'
  },
  dtiRatio: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  ltvRatio: { 
    type: DataTypes.FLOAT, 
    allowNull: true
  },
  // ==============================
  // ⚖️ COMPLIANCE & DATES
  // ==============================
  rejectionReason: {
    type: DataTypes.TEXT, 
    allowNull: true
  },
  adverseActionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: { // When the loan was funded/activated
    type: DataTypes.DATE,
    allowNull: true
  },
  nextPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true, // Soft Deletes
  tableName: 'Loans',
  indexes: [
    { fields: ['userId'] },
    { fields: ['status', 'lenderId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Loan;