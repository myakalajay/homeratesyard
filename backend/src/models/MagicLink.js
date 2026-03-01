const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @model MagicLink
 * @description Handles passwordless authentication tokens.
 * Links are valid for one-time use and expire after a short duration (e.g., 15 mins).
 */
const MagicLink = sequelize.define('MagicLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', // Matches the tableName in User.js
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Security: Mark if the token has been consumed to prevent replay attacks
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Security: Expiration time (usually set to +15 minutes from creation)
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Optional: Track IP for security auditing
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'MagicLinks',
  indexes: [
    { fields: ['token'] },
    { fields: ['userId'] }
  ]
});

module.exports = MagicLink;