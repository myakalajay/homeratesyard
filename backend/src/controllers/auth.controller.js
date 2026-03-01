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
    // 🟢 RENDER PROXY FIX: Ensure cross-domain cookies work behind proxies
    sameSite: isProd ? 'none' : 'lax' 
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
    console.warn('⚠️ [Auth Controller] Non-fatal: Could not fetch associations for token response.');
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

    // 🟢 FIX 1: Use .unscoped() to ensure the password hash is always returned
    const user = await User.unscoped().findOne({ 
      where: { email }
    });
    
    if (!user || !user.password) {
      console.warn(`[Auth] Failed login attempt: User not found or missing password column (${email})`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    let isMatch = false;

    // 🟢 FIX 2: The "Self-Healing" Password Engine
    // Checks if the database password is a raw string instead of a valid bcrypt hash
    const isHashedInDB = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (!isHashedInDB) {
      console.warn(`⚠️ [Auth] Legacy unhashed password detected for ${email}. Upgrading security...`);
      
      // Compare as raw strings
      if (password === user.password) {
        isMatch = true;
        // Automatically hash the plain text password and update the DB silently
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        console.log(`✅ [Auth] Password for ${email} automatically hashed and secured.`);
      }
    } else {
      // Standard secure bcrypt comparison
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(`✅ [Login] Identity verified: ${email} (${user.role})`);
    
    // Ensure we do not leak the unscoped user object with the password back to the frontend
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

    // 1. Create Core Entity
    const user = await User.create({
      name,
      email,
      password, 
      role: role || 'borrower',
      isVerified: false
    }, { transaction: t });

    // 2. Create Attached Sub-Entities
    if (Profile && typeof Profile.create === 'function') {
      await Profile.create({ userId: user.id, nmlsId: nmlsId || null, companyName: companyName || null }, { transaction: t });
    }

    if (Wallet && typeof Wallet.create === 'function') {
      await Wallet.create({ userId: user.id, balance: 0.00, currency: 'USD' }, { transaction: t });
    }

    await t.commit();
    console.log(`✅ [Register] New entity provisioned: ${email} (${user.role})`);

    // 3. Trigger Welcome Email (Non-blocking)
    try {
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`;
      await sendMail(
        'welcome', 
        user.email, 
        'Welcome to HomeRatesYard! 🚀', 
        { 
          user_name: user.name.split(' ')[0], 
          action_url: loginUrl 
        }
      );
    } catch (mailError) {
      console.error('⚠️ [Auth] User registered, but welcome email failed to send:', mailError.message);
    }

    await sendTokenResponse(user, 201, res);

  } catch (error) {
    // Safe transaction rollback
    if (t) {
      try { await t.rollback(); } catch (rollbackErr) { /* ignore */ }
    }
    console.error("❌ Register Error:", error);
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

    console.log(`👋 [Logout] Session terminated successfully.`);
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
      // Security best practice: Do not reveal if an email exists in the DB
      return res.status(200).json({ success: true, message: 'If this email exists, a reset link was sent.' });
    }

    // 1. Generate standard reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token and set to database
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Minutes
    await user.save();

    // 3. Create reset url
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;

    // 4. Dispatch Email
    try {
      await sendMail(
        'password_reset', 
        user.email, 
        'Security Alert: Password Reset Requested 🔐', 
        { 
          user_name: user.name.split(' ')[0], 
          action_url: resetUrl 
        }
      );
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      console.error("❌ Forgot Password Email Error:", err);
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

    if (!token) {
        return res.status(400).json({ success: false, message: 'Reset token is missing' });
    }
    
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // 1. Get hashed token from URL params
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user by token and check if it has expired
    // 🟢 FIX: Use unscoped here too, just in case the default scope hides the token columns
    const user = await User.unscoped().findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() } 
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // 3. Set new password and clear tokens
    user.password = newPassword; 
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // 4. Log the user in automatically after reset
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};