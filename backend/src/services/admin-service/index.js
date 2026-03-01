/**
 * 🏢 SUPER ADMIN SERVICE MODULE
 * Public Interface for the Enterprise Control Plane
 */

const adminRoutes = require('./routes');
const adminMiddleware = require('./middleware/rbac.middleware');

module.exports = {
    // Expose the Router to the main Express App
    routes: adminRoutes,
    
    // Expose Middleware if other modules need to check admin permissions
    middleware: adminMiddleware,
    
    // Module Metadata
    info: {
        name: 'Super Admin Control Plane',
        version: '2.0.0',
        securityLevel: 'High'
    }
};