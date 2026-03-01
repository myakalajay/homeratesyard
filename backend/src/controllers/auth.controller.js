const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize'); 
const { User, Profile, Wallet, sequelize } = require('../models');
const sendMail = require('../utils/mailer'); 

// ==========================================
// 🛡️ HELPER: SECURE TOKEN & DATA INJECTION
// ==========================================
const sendTokenResponse = async (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET || 'fallback_demo_secret_key_123', 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const isProd = process.env.NODE_ENV === 'production';
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? 'none' : 'lax' // 🟢 RENDER FIX: Required for Cross-Origin cookies
  };

  let profileData = null;
  let walletData = null;
  
  try {
    if (Profile && typeof Profile.findOne === 'function') {
        profileData = await Profile.findOne({ where: { userId: user.id } });
    }
    if (Wallet && typeof Wallet.findOne === 'function') {
        walletData = await Wallet.findOne({ where: { userId: user.id } });
    }
  } catch (e) {
    console.warn('⚠️ [Auth] Non-fatal: Could not fetch associations for token response.');
  }

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: profileData?.avatarUrl || null,
        profile: profileData,
        wallet: walletData
      }
    });
};

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.unscoped().findOne({ where: { email } });
    
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    let isMatch = false;
    const isHashedInDB = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (!isHashedInDB) {
      console.warn(`⚠️ [Auth] Legacy unhashed password detected for ${email}. Upgrading security...`);
      
      if (password === user.password) {
        isMatch = true;
        // 🟢 FIX: We set it to the raw password and let the User Model Hook hash it ONCE.
        // Previously, we hashed it here AND the model hashed it, causing a corrupted double-hash.
        user.password = password; 
        await user.save();
        console.log(`✅ [Auth] Password for ${email} secured automatically.`);
      }
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(`✅ [Login] Identity verified: ${email} (${user.role})`);
    await sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("❌ Login Error:", error);
    next(error); 
  }
};

exports.register = async (req, res, next) => {
  let t;
  try {
    const { name, email, password, role, companyName, nmlsId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    t = await sequelize.transaction(); 

    const user = await User.create({
      name,
      email,
      password, 
      role: role || 'borrower',
      isVerified: false
    }, { transaction: t });

    if (Profile && typeof Profile.create === 'function') {
      await Profile.create({ userId: user.id, nmlsId: nmlsId || null, companyName: companyName || null }, { transaction: t });
    }

    if (Wallet && typeof Wallet.create === 'function') {
      await Wallet.create({ userId: user.id, balance: 0.00, currency: 'USD' }, { transaction: t });
    }

    await t.commit();
    console.log(`✅ [Register] New entity provisioned: ${email} (${user.role})`);

    try {
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`;
      await sendMail(
        'welcome', 
        user.email, 
        'Welcome to HomeRatesYard! 🚀', 
        { user_name: user.name.split(' ')[0], action_url: loginUrl }
      );
    } catch (mailError) {
      console.warn('⚠️ [Auth] Welcome email failed:', mailError.message);
    }

    await sendTokenResponse(user, 201, res);

  } catch (error) {
    if (t) {
      try { await t.rollback(); } catch (rollbackErr) { /* ignore */ }
    }
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User entity not found.' });
    }
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), 
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    console.log(`👋 [Logout] Session terminated.`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🔑 PASSWORD RECOVERY FLOW
// ==========================================

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If this email exists, a reset link was sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 
    await user.save();

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;

    try {
      await sendMail(
        'password_reset', 
        user.email, 
        'Security Alert: Password Reset Requested 🔐', 
        { user_name: user.name.split(' ')[0], action_url: resetUrl }
      );
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token; 
    const newPassword = req.body.password;

    if (!token) return res.status(400).json({ success: false, message: 'Reset token is missing' });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.unscoped().findOne({
      where: { resetPasswordToken, resetPasswordExpire: { [Op.gt]: Date.now() } }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = newPassword; 
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🚨 EMERGENCY BACKDOOR (Fixes Corrupted DB Passwords)
// ==========================================
exports.emergencyReset = async (req, res, next) => {
  try {
    const targetEmail = 'admin@homeratesyard.com';
    const newPassword = 'admin123'; 

    let user = await User.unscoped().findOne({ where: { email: targetEmail } });

    if (!user) {
        user = await User.create({
            name: 'System Admin',
            email: targetEmail,
            password: newPassword, // Hook will hash it
            role: 'admin',
            isVerified: true
        });
    } else {
        // Force raw password update; the Model Hook will catch it and properly hash it once.
        user.password = newPassword;
        await user.save();
    }

    res.status(200).json({ success: true, message: `Admin account reset. You can now login with: admin123` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};