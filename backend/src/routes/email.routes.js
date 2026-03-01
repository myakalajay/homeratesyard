const express = require('express');
const router = express.Router();

// Import Middleware & Controller safely
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getSettings, updateSettings, 
    getTemplates, updateTemplate, sendTestEmail 
} = require('../controllers/email.controller');

// ==========================================
// 🛡️ GLOBAL PROTECTION
// ==========================================
// 1. Require a valid session token (JWT)
router.use(protect);

// ==========================================
// 🟢 BULLETPROOF RBAC (Role-Based Access Control)
// ==========================================
// We added 'admin', 'Admin', and 'SuperAdmin' to ALL endpoints.
// This completely eliminates 403 Forbidden errors for any admin testing the module.

// Settings Routes
router.get('/settings', authorize('admin', 'Admin', 'super_admin', 'superadmin', 'SuperAdmin'), getSettings);
router.put('/settings', authorize('admin', 'Admin', 'super_admin', 'superadmin', 'SuperAdmin'), updateSettings);

// Template Routes
router.get('/templates', authorize('admin', 'Admin', 'super_admin', 'superadmin', 'SuperAdmin'), getTemplates);
router.put('/templates/:id', authorize('admin', 'Admin', 'super_admin', 'superadmin', 'SuperAdmin'), updateTemplate);

// SMTP Testing Route
router.post('/test', authorize('admin', 'Admin', 'super_admin', 'superadmin', 'SuperAdmin'), sendTestEmail);

module.exports = router;