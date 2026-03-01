const { User, Profile, AuditLog, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises; // 🟢 FIX: Use Promises for non-blocking I/O
const path = require('path');

// ==========================================
// 🛡️ INTERNAL HELPERS
// ==========================================
const logUserAction = async (userId, action, resource, details, req) => {
  if (!AuditLog) return;
  try {
    await AuditLog.create({
      adminId: userId, // Tracking the user making changes to themselves
      action,
      resource,
      targetId: userId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    });
  } catch (err) {
    console.warn(`⚠️ [Audit Log Warning]: Could not record user action.`, err.message);
  }
};

// ==========================================
// 👤 USER PROFILE CONTROLLER
// ==========================================

/**
 * @desc    Get Current User Profile (Full Details)
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
      include: Profile ? [{ model: Profile, as: 'profile' }] : []
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User entity not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ [Get Profile Error]:", error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
};

/**
 * @desc    Update Profile (Atomic Update of User & Profile tables)
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  let t;
  try {
    const { name, phone, address, city, state, zip, nmlsId, companyName } = req.body;
    const userId = req.user.id;

    t = await sequelize.transaction();

    // 1. Update Core User Table (Name only)
    if (name) {
      await User.update({ name }, { where: { id: userId }, transaction: t });
    }

    // 2. Update/Upsert Profile Table (Extended Details)
    if (Profile) {
      const profileData = {
        userId,
        phone,
        address,
        city,
        state,
        zip,
        companyName,
        // 🟢 FIX: Check for both standard and legacy admin roles
        nmlsId: ['lender', 'admin', 'superadmin', 'super_admin'].includes(req.user.role) ? nmlsId : null
      };

      // Remove undefined keys so we don't accidentally wipe existing data
      Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

      const existingProfile = await Profile.findOne({ where: { userId }, transaction: t });
      
      if (existingProfile) {
        await Profile.update(profileData, { where: { userId }, transaction: t });
      } else {
        await Profile.create(profileData, { transaction: t });
      }
    }

    // 🟢 FIX: Commit transaction BEFORE sending response
    await t.commit();

    // 3. Log the PII modification
    await logUserAction(userId, 'UPDATE_PROFILE', 'Profile', { fieldsUpdated: Object.keys(req.body) }, req);

    // 4. Return Fresh Data
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role'],
      include: Profile ? [{ model: Profile, as: 'profile' }] : []
    });

    res.status(200).json({ 
      success: true, 
      message: 'Profile successfully updated.', 
      user: updatedUser 
    });

  } catch (error) {
    // 🟢 FIX: Safe transaction rollback
    if (t && !t.finished) await t.rollback();
    console.error("❌ [Update Profile Error]:", error);
    res.status(500).json({ success: false, message: 'Profile update failed due to a server error.' });
  }
};

/**
 * @desc    Change Password
 * @route   PUT /api/users/password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Pre-flight Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    // 2. Verify Current Password
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'password'] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    // 3. 🟢 FIX: Explicitly Hash New Password
    // Relying on model hooks for password resets is dangerous. Explicit hashing guarantees security.
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save(); 

    // 4. Log the security event
    await logUserAction(user.id, 'CHANGE_PASSWORD', 'Security', { status: 'success' }, req);

    res.status(200).json({ success: true, message: 'Password changed successfully.' });

  } catch (error) {
    console.error("❌ [Change Password Error]:", error);
    res.status(500).json({ success: false, message: 'A server error occurred while changing the password.' });
  }
};

/**
 * @desc    Upload Profile Picture
 * @route   POST /api/users/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const userId = req.user.id;
    // Normalize path for frontend consumption
    const relativePath = `/uploads/avatars/${req.file.filename}`;

    if (!Profile) {
      return res.status(500).json({ success: false, message: 'Profile module is not configured.' });
    }

    let profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      profile = await Profile.create({ userId });
    }

    // 🟢 FIX: Asynchronous & Safe File Deletion
    // Prevents blocking the event loop while cleaning up old files
    if (profile.avatarUrl) {
      try {
        // Resolve absolute path safely
        const oldFilePath = path.join(process.cwd(), profile.avatarUrl);
        await fs.unlink(oldFilePath);
      } catch (err) {
        // Non-fatal: File might have already been deleted or missing
        console.warn(`⚠️ [Cleanup]: Could not delete old avatar: ${profile.avatarUrl}`);
      }
    }

    profile.avatarUrl = relativePath;
    await profile.save();

    await logUserAction(userId, 'UPDATE_AVATAR', 'Profile', { file: req.file.filename }, req);

    res.status(200).json({ 
      success: true, 
      message: 'Avatar successfully updated.', 
      avatarUrl: relativePath 
    });

  } catch (error) {
    console.error("❌ [Avatar Upload Error]:", error);
    res.status(500).json({ success: false, message: 'Avatar upload failed.' });
  }
};