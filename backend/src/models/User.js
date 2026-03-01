const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    // Note: Kept strictly lowercase to match our RBAC rules
    type: DataTypes.ENUM('superadmin', 'admin', 'lender', 'borrower'),
    defaultValue: 'borrower',
    allowNull: false
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Self-referential ID for Team Leads/Admins'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // ==========================================
  // 🔐 NEW: PASSWORD RECOVERY FIELDS
  // ==========================================
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Hashed token sent to user email for password reset'
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration timestamp for the reset token (usually 15 mins)'
  }

}, {
  timestamps: true,
  paranoid: true, // Enables soft deletes (deletedAt)
  hooks: {
    beforeCreate: async (user) => {
      // Only hash if the password is provided (safeguard for OAuth integrations)
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      // Only re-hash if the user actually changed their password
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// ==========================================
// 🛠️ INSTANCE METHODS
// ==========================================

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;