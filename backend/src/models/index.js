const sequelize = require('../config/db');

// ==========================================
// 1. IMPORT ALL MODELS
// ==========================================
const User = require('./User');
const Profile = require('./Profile');
const Loan = require('./Loan');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const Ticket = require('./Ticket');
const Document = require('./Document');
const Payment = require('./Payment'); 
const Wallet = require('./Wallet');
const Repayment = require('./Repayment');
const Session = require('./Session');
const MagicLink = require('./MagicLink');
const Setting = require('./Setting'); 
 

// ==========================================
// 🔗 RELATIONSHIPS (The Enterprise Map)
// ==========================================

// --- 1. User & Profile (One-to-One) ---
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- 2. User & Wallet (One-to-One) ---
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// --- 3. User & Auth (Sessions + MagicLinks) ---
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(MagicLink, { foreignKey: 'userId', as: 'magicLinks', onDelete: 'CASCADE' }); 
MagicLink.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- 4. User & Loans (Borrower vs Lender) ---
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'borrower' });

User.hasMany(Loan, { foreignKey: 'lenderId', as: 'assignedLoans' });
Loan.belongsTo(User, { foreignKey: 'lenderId', as: 'lender' });

// --- 5. Loan & Documents (One-to-Many) ---
Loan.hasMany(Document, { foreignKey: 'loanId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

User.hasMany(Document, { foreignKey: 'userId', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

// --- 6. Financials: Payments & Repayments ---
Loan.hasMany(Payment, { foreignKey: 'loanId', as: 'payments' });
Payment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'paymentHistory' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'payer' });

Loan.hasMany(Repayment, { foreignKey: 'loanId', as: 'repaymentSchedule', onDelete: 'CASCADE' });
Repayment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

// --- 7. Support Tickets ---
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Loan.hasMany(Ticket, { foreignKey: 'relatedLoanId', as: 'tickets' });
Ticket.belongsTo(Loan, { foreignKey: 'relatedLoanId', as: 'loan' });

// --- 8. System Logs & Alerts ---
User.hasMany(AuditLog, { foreignKey: 'adminId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- 9. Organizational Hierarchy ---
User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// ==========================================
// 📦 EXPORT BUNDLE
// ==========================================
module.exports = { 
  sequelize,
  User, 
  Profile, 
  Loan,
  Document,
  AuditLog,
  Notification, 
  Ticket,
  Payment,
  Wallet,
  Repayment,
  Session,
  MagicLink,
  Setting 
};