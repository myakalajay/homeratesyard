const jwt = require('jsonwebtoken');
// ⚠️ Database is handled externally as requested, assuming global db object
const db = require('../../../models'); // Adjust path to your central DB entry

/**
 * 🛡️ Role-Based Access Control (RBAC) Middleware
 * Enforces "Clean Room" policy. Only 'super_admin' or explicit 'admin' allowed.
 */
exports.authorizeAdmin = (requiredRole = 'admin') => {
  return async (req, res, next) => {
    try {
      // 1. Token Verification (Standard)
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ message: '⛔ Security Alert: No credentials provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 2. Database Validation (Prevents "Ghost Admin" attacks if user deleted)
      const user = await db.User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: '⛔ Security Alert: User record invalid.' });
      }

      // 3. Hierarchy Check
      // super_admin > admin > *
      const roles = ['super_admin', 'admin', 'lender', 'borrower'];
      const userRoleIndex = roles.indexOf(user.role);
      const requiredRoleIndex = roles.indexOf(requiredRole);

      // If user role is "lower" in the array (higher index) than required, block.
      // (Assuming array is ordered High -> Low privilege)
      if (userRoleIndex > requiredRoleIndex) {
         console.warn(`[RBAC] Access Denied. User: ${user.email} (${user.role}) tried to access ${requiredRole} route.`);
         return res.status(403).json({ message: '⛔ Insufficient Clearance Level.' });
      }

      // 4. Attach Sovereign User to Request
      req.user = user;
      next();

    } catch (error) {
      console.error("[RBAC] Auth Failure:", error.message);
      return res.status(401).json({ message: 'Session expired or invalid.' });
    }
  };
};