const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @model Ticket
 * @description Manages support inquiries, linking them to users and specific loans.
 * Features categorized priority and JSON-based conversation history.
 */
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'The user requesting support'
  },
  relatedLoanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Loans',
      key: 'id'
    },
    comment: 'Optional link to a specific Loan application'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('technical', 'billing', 'loan_status', 'document_review', 'other'),
    defaultValue: 'other'
  },
  priority: {
    // 🟢 SYNCED: Matches standard industry priority levels
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'The initial message or problem description'
  },
  /**
   * 💬 CHAT HISTORY
   * Stores an array of message objects: 
   * [{ senderId: UUID, role: 'admin|user', message: string, timestamp: DATE }]
   */
  history: {
    type: DataTypes.JSONB, // 🟢 OPTIMIZATION: Use JSONB for better performance in PostgreSQL
    allowNull: true,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'Tickets',
  indexes: [
    {
      name: 'ticket_status_priority_index',
      fields: ['status', 'priority']
    },
    {
      name: 'ticket_user_index',
      fields: ['userId']
    },
    {
      name: 'ticket_loan_index',
      fields: ['relatedLoanId']
    }
  ]
});

module.exports = Ticket;