const express = require('express');
const router = express.Router();

// 🟢 Auth Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// 🟢 Controllers
// 1. Standard Admin Controller
const { 
  getDashboardStats,
  getAllUsers, 
  verifyLender, 
  deleteUser, 
  updateUserRole,
  getAllLoans,
  getLoanById,
  updateLoanStatus,
  impersonateUser,
  getAuditLogs,
  runAus,
  getSystemHealth,
  downloadPreApproval,
  getEmailSettings,
  updateEmailSettings,
  getEmailTemplates,
  updateEmailTemplate,
  sendTestEmail
} = require('../controllers/admin.controller');

// 2. 🟢 FIX: Explicitly import the new Settings Controller
const settingsController = require('../controllers/settings.controller');

// ==========================================
// 🛡️ GLOBAL PROTECTION MIDDLEWARE
// ==========================================
// All routes below this line require a valid JWT token
router.use(protect);

// ==========================================
// 📊 1. DASHBOARD & STATS
// ==========================================
router.get('/stats', authorize('admin', 'super_admin', 'superadmin'), getDashboardStats);

// ==========================================
// 👥 2. USER MANAGEMENT
// ==========================================
router.get('/users', authorize('admin', 'super_admin', 'superadmin'), getAllUsers);
router.put('/users/:id/verify', authorize('admin', 'super_admin', 'superadmin'), verifyLender);

// ⚡ Super Admin Exclusives (High Risk Operations)
router.delete('/users/:id', authorize('super_admin', 'superadmin'), deleteUser);
router.put('/users/:id/role', authorize('super_admin', 'superadmin'), updateUserRole);
router.post('/users/:id/impersonate', authorize('super_admin', 'superadmin'), impersonateUser);

// ==========================================
// 🏦 3. LOAN PIPELINE & INTELLIGENCE
// ==========================================
router.get('/loans', authorize('admin', 'super_admin', 'superadmin'), getAllLoans);
router.get('/loans/:id', authorize('admin', 'super_admin', 'superadmin'), getLoanById);

// 🧠 Enterprise Intelligence & Actions
router.put('/loans/:id/status', authorize('admin', 'super_admin', 'superadmin'), updateLoanStatus);
router.post('/loans/:id/run-aus', authorize('admin', 'super_admin', 'superadmin'), runAus);
router.get('/loans/:id/document/pre-approval', authorize('admin', 'super_admin', 'superadmin'), downloadPreApproval);

// ==========================================
// 🛡️ 4. SECURITY & SYSTEM HEALTH
// ==========================================
router.get('/audit-logs', authorize('admin', 'super_admin', 'superadmin'), getAuditLogs);
router.get('/health', authorize('admin', 'super_admin', 'superadmin'), getSystemHealth);

// ==========================================
// ⚙️ 5. GLOBAL SYSTEM SETTINGS
// ==========================================
// 🟢 FIX: Removed duplicate legacy routes and mapped to the dedicated settingsController
router.route('/settings')
  .get(authorize('admin', 'super_admin', 'superadmin'), settingsController.getSystemSettings)
  .put(authorize('super_admin', 'superadmin'), settingsController.updateSystemSettings);

// ==========================================
// 📧 6. EMAIL AUTOMATION ENGINE
// ==========================================
// 🟢 NEW: Endpoints required for the React Email Builder UI
router.route('/emails/settings')
  .get(authorize('admin', 'super_admin', 'superadmin'), getEmailSettings)
  .put(authorize('super_admin', 'superadmin'), updateEmailSettings);

router.route('/emails/templates')
  .get(authorize('admin', 'super_admin', 'superadmin'), getEmailTemplates);

router.route('/emails/templates/:id')
  .put(authorize('super_admin', 'superadmin'), updateEmailTemplate);

router.post('/emails/test', authorize('admin', 'super_admin', 'superadmin'), sendTestEmail);

module.exports = router;