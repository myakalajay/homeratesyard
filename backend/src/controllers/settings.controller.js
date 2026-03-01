const { Setting, AuditLog } = require('../models'); // 🟢 FIX: Centralized model import for Audit access

// 🟢 FIX: Strict Whitelist of allowed configuration keys
const ALLOWED_KEYS = [
  'siteName', 'siteEmail', 'maintenance', 
  'twoFactor', 'sessionTimeout', 'passwordExpiry', 
  'platformFee', 'currency', 'minWithdrawal'
];

/**
 * @route   GET /api/admin/settings
 * @desc    Fetch all global system configurations
 * @access  Private (Admin/SuperAdmin)
 */
exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const config = {};

    // Transform the array of DB rows back into a clean JSON object
    settings.forEach(setting => {
      try {
        // Safely parse booleans and numbers ("true" -> true, "1.5" -> 1.5)
        config[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        // Fallback for standard unquoted strings
        config[setting.key] = setting.value;
      }
    });

    res.status(200).json(config);
  } catch (error) {
    console.error('❌ [Settings Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve system settings.' });
  }
};

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system configurations (Upsert)
 * @access  Private (Admin/SuperAdmin)
 */
exports.updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    const safeUpdates = {};

    // 1. 🟢 FIX: Payload Sanitization (Whitelist Enforcement)
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_KEYS.includes(key)) {
        safeUpdates[key] = value;
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ message: "No valid configuration keys provided." });
    }

    // 2. Backend Security & Boundary Validation
    if (safeUpdates.platformFee !== undefined && Number(safeUpdates.platformFee) < 0) {
      return res.status(400).json({ message: "Platform fee cannot be negative." });
    }
    if (safeUpdates.minWithdrawal !== undefined && Number(safeUpdates.minWithdrawal) < 0) {
      return res.status(400).json({ message: "Minimum withdrawal cannot be negative." });
    }
    if (safeUpdates.passwordExpiry !== undefined && Number(safeUpdates.passwordExpiry) < 1) {
      return res.status(400).json({ message: "Password expiry must be at least 1 day." });
    }

    // 3. Database Upsert Engine
    const upsertPromises = Object.entries(safeUpdates).map(([key, value]) => {
      return Setting.upsert({ 
        key, 
        // We stringify the values so booleans and numbers are safely stored in the TEXT column
        value: JSON.stringify(value) 
      });
    });

    await Promise.all(upsertPromises);

    // 4. 🟢 FIX: Enterprise Audit Trail Logging
    try {
      if (AuditLog && req.user) {
        await AuditLog.create({
          adminId: req.user.id,
          action: 'UPDATE_SYSTEM_SETTINGS',
          resource: 'Settings',
          targetId: 'GLOBAL',
          details: JSON.stringify(safeUpdates),
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
        });
      }
    } catch (auditErr) {
      console.warn('⚠️ [Audit Log Warning]: Could not record settings update.', auditErr.message);
    }

    res.status(200).json({ 
      success: true,
      message: 'System configurations successfully updated.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Settings Error]:', error);
    res.status(500).json({ message: 'Failed to persist settings to database.' });
  }
};