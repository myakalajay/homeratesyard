import { 
  LayoutDashboard, FileText, PieChart, Users, 
  Shield, Briefcase, CreditCard, LifeBuoy,
  FileSearch, BarChart3, Lock, ActivitySquare,
  Globe, Home, Compass, BadgeCheck, ClipboardList, 
  CircleDollarSign, FolderLock, Bot, Mail, Settings // 🟢 FIX: Added Settings icon
} from 'lucide-react';

/**
 * 🔗 SHARED ENTERPRISE MENUS
 * Currently empty. Global account actions (Profile, Settings, Sign Out) 
 * are securely handled by the DashboardTopBar dropdown overlay.
 */
export const SHARED_MENUS = Object.freeze([]);

/**
 * 🔑 ROLE-SPECIFIC COMMAND STRUCTURES
 * Enterprise-grade nomenclature aligned strictly with the Next.js 
 * Pages directory structure and PostgreSQL ENUMs.
 */
export const ROLE_MENUS = Object.freeze({
  
  // 🟢 BORROWER (Consumer Interface) - V1 US Market Optimized
  borrower: [
    { label: 'Dashboard', href: '/borrower', icon: LayoutDashboard },
    { label: 'Loan Explorer', href: '/borrower/explore', icon: Compass },
    { label: 'Pre-Approvals', href: '/borrower/pre-approvals', icon: BadgeCheck },
    { label: 'Application Tracker', href: '/borrower/applications', icon: ClipboardList },
    { label: 'My Properties', href: '/borrower/properties', icon: Home },
    { label: 'Payments & Loans', href: '/borrower/finance', icon: CircleDollarSign },
    { label: 'Secure Vault', href: '/borrower/vault', icon: FolderLock },
    { label: 'Support Desk', href: '/borrower/support', icon: LifeBuoy },
  ],

  // 🟠 LENDER (Financial Partner Interface)
  lender: [
    { label: 'Pipeline Overview', href: '/lender', icon: LayoutDashboard },
    { label: 'Active Applications', href: '/lender/applications', icon: Briefcase },
    { label: 'My Borrowers', href: '/lender/borrowers', icon: Users },
    { label: 'Sarah AI Logs', href: '/admin/sarah-logs', icon: Bot }, // Strategic Lead Monitoring
    { label: 'Commissions', href: '/lender/commissions', icon: BarChart3 },
    { label: 'Support Helpdesk', href: '/lender/support', icon: LifeBuoy }
  ],

  // 🟣 ADMIN (Operations Manager)
  admin: [
    { label: 'System Overview', href: '/admin', icon: Shield },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Sarah AI Logs', href: '/admin/sarah-logs', icon: Bot }, 
    { label: 'All Loans', href: '/admin/loans', icon: Globe },
    { label: 'Analytics', href: '/admin/analytics', icon: PieChart },
    { label: 'Email Automation', href: '/admin/emails', icon: Mail }, // 🟢 FIX: Name alignment
    { label: 'System Settings', href: '/admin/settings', icon: Settings }, // 🟢 FIX: Missing Module added
    { label: 'Support Tickets', href: '/admin/support', icon: LifeBuoy },
  ],

  // ⚫ SUPER ADMIN (Master Command Center)
  superadmin: [
    { label: 'System Overview', href: '/superadmin', icon: Shield }, 
    { label: 'User Management', href: '/superadmin/users', icon: Users }, 
    { label: 'Sarah AI Logs', href: '/admin/sarah-logs', icon: Bot }, 
    { label: 'All Loans', href: '/superadmin/loans', icon: Globe },      
    { label: 'Email Automation', href: '/admin/emails', icon: Mail }, // 🟢 FIX: SuperAdmins need Email access
    { label: 'Audit Logs', href: '/superadmin/audit-logs', icon: Lock },  
    { label: 'System Health', href: '/superadmin/health', icon: ActivitySquare }, 
    { label: 'System Settings', href: '/admin/settings', icon: Settings }, // 🟢 FIX: Missing Module added
    { label: 'Support Tickets', href: '/superadmin/support', icon: LifeBuoy }, 
  ],
  
  // ⚫ SUPER ADMIN (Legacy DB Fallback)
  super_admin: [
    { label: 'System Overview', href: '/superadmin', icon: Shield }, 
    { label: 'User Management', href: '/superadmin/users', icon: Users }, 
    { label: 'Sarah AI Logs', href: '/admin/sarah-logs', icon: Bot },
    { label: 'All Loans', href: '/superadmin/loans', icon: Globe },      
    { label: 'Email Automation', href: '/admin/emails', icon: Mail }, // 🟢 FIX: SuperAdmins need Email access
    { label: 'Audit Logs', href: '/superadmin/audit-logs', icon: Lock },  
    { label: 'System Health', href: '/superadmin/health', icon: ActivitySquare }, 
    { label: 'System Settings', href: '/admin/settings', icon: Settings }, // 🟢 FIX: Missing Module added
    { label: 'Support Tickets', href: '/superadmin/support', icon: LifeBuoy }, 
  ]
});