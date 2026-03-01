const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // 🔒 Creates a unique index automatically
    comment: 'Foreign Key to Users table'
  },
  nmlsId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Required for Lenders/Admins for compliance'
  },
  avatarUrl: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  zipCode: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: true
});

module.exports = Profile;