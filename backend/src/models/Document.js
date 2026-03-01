const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'The user who uploaded this document'
  },
  loanId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be null if it's a general profile doc (like a Driver's License)
    comment: 'Links the document to a specific loan application'
  },
  type: {
    type: DataTypes.ENUM(
      'PROOF_OF_INCOME', // Paystubs, W2
      'PROOF_OF_ASSETS', // Bank Statements
      'GOVT_ID',         // Driver's License, Passport
      'PROPERTY',        // Appraisal, Deed
      'TAX_RETURN',      // 1040s
      'OTHER'
    ),
    allowNull: false,
    defaultValue: 'OTHER'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    // comment: 'Underwriting status of this specific document'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Original filename (e.g., "paystub-jan.pdf")'
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Storage path (local/uploads/ or S3 key)'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'application/pdf, image/png'
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes'
  },
  adminNote: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reason for rejection or internal notes'
  }
}, {
  timestamps: true,
  indexes: [
    // Index for "Show me all docs for Loan #123"
    {
      name: 'doc_loan_index',
      fields: ['loanId']
    },
    // Index for "Show me all uploaded docs by User X"
    {
      name: 'doc_user_index',
      fields: ['userId']
    }
  ]
});

module.exports = Document;