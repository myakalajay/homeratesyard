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
    // 🟢 FIX: Added 'super_admin' fallback to prevent legacy database crashes
    type: DataTypes.ENUM('superadmin', 'super_admin', 'admin', 'lender', 'borrower'),
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
  // 🔐 PASSWORD RECOVERY FIELDS
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
  
  // 🟢 FIX: CRITICAL SECURITY - Prevent passwords from leaking to the frontend APIs
  defaultScope: {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
  },
  scopes: {
    // Allows auth controllers to easily bypass the default scope using User.scope('withPassword').findOne(...)
    withPassword: {
      attributes: { include: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    }
  },

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
  // Graceful fallback if the password wasn't loaded in the query scope
  if (!this.password) {
    throw new Error('Password hash not loaded in user instance. Use scope("withPassword") in your query.');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;