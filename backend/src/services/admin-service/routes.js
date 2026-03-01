const express = require('express');
const router = express.Router();

// Import Middleware
const { authorizeAdmin } = require('./middleware/rbac.middleware');
const { auditLogger } = require('./middleware/audit.middleware');

// Import Controllers (We will build these in Phase 2, but we need placeholders now)
// For now, we point to a placeholder object to prevent crash
const adminController = require('./controllers/admin.controller'); 

// ==========================================
// 🛡️ GLOBAL SECURITY GATE
// ==========================================
// 1. All routes require a valid token
// 2. All routes require 'super_admin' or 'admin' role
// 3. All routes are logged to the forensic ledger
router.use(authorizeAdmin('admin')); 

// ==========================================
// 🚦 COMMAND CENTER ROUTES
// ==========================================

// Dashboard Intelligence
router.get('/stats', 
    auditLogger('VIEW_DASHBOARD'), 
    adminController.getDashboardStats
);

// User Directory Management
router.get('/users', 
    auditLogger('VIEW_DIRECTORY'), 
    adminController.getAllUsers
);
router.put('/users/:id/verify', 
    authorizeAdmin('super_admin'), // Higher security level
    auditLogger('VERIFY_USER'), 
    adminController.verifyUser
);

// Loan Pipeline Surveillance
router.get('/loans', 
    auditLogger('VIEW_PIPELINE'), 
    adminController.getAllLoans
);
router.post('/loans/:id/aus', 
    auditLogger('RUN_AUS'), 
    adminController.runAusEngine
);

// Global Registry (Settings) - Super Admin Only
router.get('/config', 
    authorizeAdmin('super_admin'), 
    auditLogger('VIEW_CONFIG'), 
    adminController.getGlobalConfig
);
router.put('/config', 
    authorizeAdmin('super_admin'), 
    auditLogger('UPDATE_CONFIG'), 
    adminController.updateGlobalConfig
);

// System Terminal (Health)
router.get('/health', 
    authorizeAdmin('super_admin'), 
    adminController.getSystemHealth
);

module.exports = router;