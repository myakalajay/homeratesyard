const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @desc    Protect routes - Verify JWT from Header OR Cookie
 * @access  Private
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback: Check for token in cookies (for httpOnly support)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. Validation
  if (!token) {
    return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
    });
  }

  try {
    // 4. Verify Token
    if (!process.env.JWT_SECRET) {
        console.warn('⚠️ WARNING: JWT_SECRET is not defined in env variables.');
    }
    
    // 🟢 CRITICAL: Decoding token reveals impersonation status
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_demo_secret_key_123');

    // 5. Attach User to Request
    const currentUser = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!currentUser) {
      return res.status(401).json({ 
          success: false, 
          message: 'The user belonging to this token no longer exists.' 
      });
    }

    // Optional Production Gap: Ensure user isn't suspended
    if (currentUser.status === 'suspended' || currentUser.status === 'inactive') {
      return res.status(403).json({ 
          success: false, 
          message: 'Your account has been suspended or deactivated.' 
      });
    }

    // 🟢 FIX: Attach the user AND any impersonation context to the request
    req.user = currentUser;
    req.impersonation = {
      isImpersonating: !!decoded.isImpersonating,
      originalAdminId: decoded.originalAdmin || null
    };

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.name, error.message);
    
    // 6. Differentiate Error Types for precise Frontend UI handling
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired, please login again' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token, authorization denied' });
    }
    
    // Catch-all for DB errors or other issues
    return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

/**
 * @desc    Role authorization - Restricted to specific roles
 * @usage   authorize('super_admin', 'admin') OR authorize(['super_admin', 'admin'])
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Safety Check: Ensure protect() ran first
    if (!req.user) {
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error: Role check executed before user verification.' 
        });
    }

    // 🟢 BUG FIX: Flatten the roles array. 
    // This handles both authorize('admin') AND authorize(['admin', 'super_admin']) syntax safely.
    const allowedRoles = roles.flat();

    // 2. Role Check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' requires elevated permissions.`
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize };