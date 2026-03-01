const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust path to your db config

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'system_settings',
  timestamps: true,
});

module.exports = Setting;