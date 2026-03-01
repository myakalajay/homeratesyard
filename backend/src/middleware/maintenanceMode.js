const Setting = require('../models/Setting');

const maintenanceMode = async (req, res, next) => {
  // 1. Ignore admin and auth routes so you don't lock yourself out!
  if (req.originalUrl.startsWith('/api/admin') || req.originalUrl.startsWith('/api/auth')) {
    return next();
  }

  try {
    // 2. Check the DB for the maintenance flag
    const status = await Setting.findByPk('maintenance');
    
    // 3. If active, intercept the request and return 503
    if (status && JSON.parse(status.value) === true) {
      return res.status(503).json({
        success: false,
        message: 'HomeRatesYard is currently undergoing scheduled maintenance. Please check back shortly.',
        code: 'MAINTENANCE_MODE_ACTIVE'
      });
    }

    next();
  } catch (error) {
    // If DB fails, fail open (let the request through) so the site doesn't break
    next();
  }
};

module.exports = maintenanceMode;