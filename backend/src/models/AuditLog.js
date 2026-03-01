const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false, // In some systems, 'System' actions might make this nullable, but strict is good
    comment: 'The User ID of the actor performing the change'
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'The ID of the object being modified (Loan ID, User ID, etc.)'
  },
  action: {
    type: DataTypes.STRING(50), // Limited length for indexing performance
    allowNull: false,
    comment: 'Standardized verbs: CREATE, UPDATE, DELETE, LOGIN, DOWNLOAD, APPROVE'
  },
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'The table or module affected: User, Loan, Document, Settings'
  },
  details: {
    type: DataTypes.JSON, // Use JSONB if using PostgreSQL for better query performance
    allowNull: true,
    comment: 'Delta snapshot: { old: "draft", new: "submitted" }'
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 compatible length
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Browser or Device string for security fingerprinting'
  }
}, {
  timestamps: true,
  updatedAt: false, // 🔒 CRITICAL: Audit logs must be Write-Once-Read-Many (Immutable)
  indexes: [
    // Index for "Show me history of this specific Loan"
    {
      name: 'audit_target_index',
      fields: ['targetId']
    },
    // Index for "Show me activity by this Admin"
    {
      name: 'audit_admin_index',
      fields: ['adminId']
    },
    // Index for "Show me recent suspicious activity" (Sorting by date)
    {
      name: 'audit_created_index',
      fields: ['createdAt']
    }
  ]
});

module.exports = AuditLog;