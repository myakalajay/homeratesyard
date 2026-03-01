const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    defaultValue: 'info',
    // 🔴 DELETE THIS LINE (The comment causes the crash during ALTER)
    // comment: 'Determines the color/icon in the UI' 
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionLink: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] }
  ]
});

module.exports = Notification;