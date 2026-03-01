'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Search, Shield, UserCheck, UserMinus, BadgeCheck, 
  ArrowLeft, ArrowRight, Filter as FilterIcon, Settings, Clock, 
  ShieldAlert, Users, Activity, MoreVertical, Mail, RefreshCw, Database
} from 'lucide-react';

import RouteGuard from '@/components/auth/RouteGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// Modals (Ensure these paths match your project structure)
import EditUserModal from '@/components/modals/EditUserModal';
import UserHistoryDrawer from '@/components/ui/UserHistoryDrawer';

export default function UserManagementPage() {
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // 🟢 STRICT DEFAULTS for pagination & metrics
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalUsers: 0 });
  const [metrics, setMetrics] = useState({ verified: 0, pending: 0 });

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const loadUsers = async (page) => {
    setLoading(true);
    setError(false);
    try {
      const response = await adminService.getUsers({ page, limit: 15 });
      const data = response?.data || response || {};
      
      // 🟢 100% DYNAMIC HYDRATION: Zero mock data.
      const fetchedUsers = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
      
      setUsers(fetchedUsers);
      setPagination(prev => ({ 
        ...prev, 
        totalPages: Number(data?.totalPages ?? 1),
        totalUsers: Number(data?.total ?? fetchedUsers.length)
      }));

      // Dynamically calculate metrics for the current dataset or use API totals if provided
      setMetrics({
        verified: Number(data?.verifiedCount ?? fetchedUsers.filter(u => u.isVerified).length),
        pending: Number(data?.pendingCount ?? fetchedUsers.filter(u => !u.isVerified).length)
      });

    } catch (err) {
      console.error("Failed to sync user directory:", err);
      setError(true);
      addToast("Failed to secure connection to user database.", "error");
      setUsers([]); // Safe fallback to prevent crash
      setMetrics({ verified: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 SAFE MULTI-FILTER LOGIC
  const filteredUsers = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (users || []).filter(u => {
      const matchesSearch = 
        (u?.email || "").toLowerCase().includes(term) || 
        (u?.name || "").toLowerCase().includes(term) ||
        (u?.nmlsId || "").toLowerCase().includes(term);
      
      const matchesRole = roleFilter === 'all' || (u?.role || "").toLowerCase() === roleFilter.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Enterprise Role Styling
  const getRoleStyle = (role) => {
    const lowerRole = (role || "").toLowerCase();
    if (lowerRole.includes('super')) return "bg-purple-50 text-purple-700 border-purple-200";
    if (lowerRole.includes('admin')) return "bg-red-50 text-red-700 border-red-200"; 
    if (lowerRole.includes('lender')) return "bg-blue-50 text-blue-700 border-blue-200";
    if (lowerRole.includes('ai')) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(userToDelete.id);
      addToast("User access permanently revoked.", "success");
      setUserToDelete(null);
      loadUsers(pagination.page); 
    } catch (err) {
      addToast("Failed to revoke user access.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
      <DashboardLayout role="admin">
      <Head>
        <title>User Directory | HRY Enterprise</title>
      </Head>

      <div className="flex flex-col min-h-screen bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
        
        {/* --- 1. CORPORATE HEADER & KPIs --- */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">

              <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">Identity & Access</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Manage platform roles, lender verifications, and system access.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => loadUsers(pagination.page)} 
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all bg-white border shadow-sm border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-[#0A1128] disabled:opacity-70"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-400"} />
              {loading ? "Syncing Directory..." : "Sync Directory"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 sm:gap-6 sm:grid-cols-3">
          <KPIStoreCard title="Total Identities" value={(pagination.totalUsers || 0).toLocaleString()} icon={<Users className="text-blue-600" />} loading={loading} />
          <KPIStoreCard title="Verified Lenders" value={(metrics.verified || 0).toLocaleString()} icon={<BadgeCheck className="text-emerald-600" />} loading={loading} />
          <KPIStoreCard title="Access Requests" value={(metrics.pending || 0).toLocaleString()} icon={<ShieldAlert className="text-amber-600" />} highlight={metrics.pending > 0} loading={loading} />
        </div>

        {/* --- 2. CONTROLS & SEARCH --- */}
        <div className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
          <div className="flex items-center w-full gap-3 sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name, email, or NMLS..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A1128]/10 focus:border-[#0A1128] outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#0A1128] hover:bg-slate-50 transition-all shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#0A1128]/10"
              >
                <option value="all">All Roles</option>
                <option value="lender">Lenders</option>
                <option value="admin">Administrators</option>
                <option value="superadmin">Super Admins</option>
                <option value="user">Standard Users</option>
              </select>
              <FilterIcon size={14} className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Database size={14} className="text-slate-400" /> RBAC Security Active
          </div>
        </div>

        {/* --- 3. DATA TABLE --- */}
        <div className="flex-1 overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#FBFCFD] border-b border-slate-100">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-4 sm:p-6 w-[35%]">Identity Details</th>
                  <th className="p-4 sm:p-6 w-[25%]">System Role</th>
                  <th className="p-4 sm:p-6 w-[20%] text-center">Status</th>
                  <th className="p-4 sm:p-6 w-[20%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                
                {loading && users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <RefreshCw size={32} className="mx-auto mb-4 text-slate-200 animate-spin" />
                      <p className="text-sm font-bold text-slate-500">Authenticating with identity provider...</p>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <ShieldAlert size={32} className="mx-auto mb-4 text-red-300" />
                      <p className="text-sm font-bold text-red-600">Database connection failed.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <Users size={32} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-sm font-bold text-slate-500">No identities match your parameters.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-all hover:bg-slate-50/50 group">
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#0A1128] text-xs shrink-0 shadow-sm">
                          {(user?.name || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 leading-tight mb-0.5">{user?.name || 'Unknown User'}</span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <Mail size={10} /> {user?.email || 'No email provided'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                        getRoleStyle(user?.role)
                      )}>
                        {user?.role?.replace('_', ' ') || 'User'}
                      </span>
                    </td>
                    <td className="p-4 text-center sm:p-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                        user?.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {user?.isVerified ? <BadgeCheck size={14} /> : <ShieldAlert size={14} />}
                        {user?.isVerified ? "Verified" : "Pending"}
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      {/* Desktop Actions */}
                      <div className="justify-end hidden gap-2 transition-opacity opacity-0 sm:flex group-hover:opacity-100">
                         <ActionIconButton icon={<Settings size={16} />} onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }} />
                         <ActionIconButton icon={<Clock size={16} />} onClick={() => { setSelectedUser(user); setIsHistoryDrawerOpen(true); }} />
                         <ActionIconButton icon={<UserMinus size={16} />} onClick={() => { setUserToDelete(user); }} color="red" />
                      </div>
                      {/* Mobile Actions Fallback */}
                      <div className="flex justify-end sm:hidden">
                         <ActionIconButton icon={<MoreVertical size={16} />} onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !error && (
            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-[#FBFCFD]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 transition-all bg-white border rounded-lg shadow-sm border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                </button>
                <button 
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 transition-all bg-white border rounded-lg shadow-sm border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DRAWERS & MODALS --- */}
      {isHistoryDrawerOpen && selectedUser && (
        <UserHistoryDrawer 
          isOpen={isHistoryDrawerOpen} 
          onClose={() => { setIsHistoryDrawerOpen(false); setSelectedUser(null); }} 
          user={selectedUser} 
        />
      )}

      {/* Destructive Deletion Modal Inline for Data Safety */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 mb-4 border border-red-100 bg-red-50 rounded-xl">
              <ShieldAlert size={24} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0A1128]">Revoke Identity Access?</h3>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">
              You are about to permanently delete <span className="font-bold text-slate-700">{userToDelete.name}</span>. This will destroy their active session and purge them from the RBAC registry.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 text-sm font-bold transition-all bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-bold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isDeleting ? <Activity size={16} className="animate-spin" /> : <UserMinus size={16} />}
                {isDeleting ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}
      </DashboardLayout>
    </RouteGuard>
  );
}

// --- PURE CSS CORPORATE COMPONENTS ---

function KPIStoreCard({ title, value, icon, highlight, loading }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm transition-all relative overflow-hidden",
      highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
    )}>
      {highlight && <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500 opacity-10 blur-2xl" />}
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", highlight ? "text-amber-800" : "text-slate-400")}>
            {title}
          </p>
          {loading ? (
            <div className="w-20 h-10 mt-1 rounded-lg bg-slate-100 animate-pulse"></div>
          ) : (
            <h4 className={cn("text-4xl font-bold tracking-tighter", highlight ? "text-amber-700" : "text-[#0A1128]")}>
              {value}
            </h4>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          highlight ? "bg-amber-100" : "bg-slate-50 border border-slate-100"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionIconButton({ icon, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 transition-colors border border-transparent rounded-lg text-slate-400 shadow-sm border-slate-200",
        color === 'red' ? "hover:border-red-200 hover:text-red-600 hover:bg-red-50" : "hover:border-slate-300 hover:text-[#0A1128] hover:bg-slate-50"
      )}
    >
      {icon}
    </button>
  );
}