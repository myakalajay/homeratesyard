'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { 
  Users, ShieldAlert, Search, UserCheck, Ghost, RefreshCw, 
  Database, UserMinus, ArrowLeft, ArrowRight, ShieldCheck, 
  AlertTriangle, Fingerprint, Mail, Clock
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { cn } from '@/utils/utils';

// UI Primitives
import { Button } from '@/components/ui/primitives/Button';
import Alert from '@/components/ui/feedback/Alert'; 

export default function IdentityRegistry() {
  const { addToast } = useToast();
  const { user: currentUser } = useAuthContext();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null); 
  
  const [activeModal, setActiveModal] = useState(null); 
  const [targetUser, setTargetUser] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadDirectory = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const response = await adminService.getUsers(); 
      let sanitizedData = Array.isArray(response) ? response : (response?.data || response?.users || []);
      setUsers(sanitizedData);
      if (manual) addToast('Identity Registry Synchronized', 'success');
    } catch (err) {
      addToast('Sync Interrupted: Registry node unreachable', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { 
    setMounted(true);
    loadDirectory(); 
  }, [loadDirectory]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter(u => 
      (u.name?.toLowerCase() || "").includes(term) || 
      (u.email?.toLowerCase() || "").includes(term) || 
      (u.role?.toLowerCase() || "").includes(term)
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleVerify = async (userId) => {
    try {
      setProcessingId(userId);
      await adminService.verifyLender(userId);
      addToast("Entity authorization granted", "success");
      await loadDirectory();
    } catch (err) {
      addToast("Protocol override failed", "error");
    } finally { 
      setProcessingId(null); 
    }
  };

  const executeImpersonation = async () => {
    try {
      setProcessingId(targetUser.id);
      const { token } = await adminService.impersonate(targetUser.id);
      localStorage.setItem('admin_token_backup', localStorage.getItem('token')); 
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    } catch (err) {
      addToast('Proxy session failed', 'error');
      setProcessingId(null);
      setActiveModal(null);
    }
  };

  const executeDelete = async () => {
    try {
      setProcessingId(targetUser.id);
      await adminService.deleteUser(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      addToast("Identity purged successfully", "success");
      setActiveModal(null);
    } catch (err) {
      addToast("Purge sequence failed", "error");
    } finally { 
      setProcessingId(null); 
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  // 🟢 FIX: Moved RouteGuard and DashboardLayout inside the component return
  return (
    <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
      <DashboardLayout role="superadmin">
        <Head>
          <title>Identity Registry | HomeRatesYard</title>
        </Head>

        {/* 🟢 FIX: Added responsive padding to match the rest of the dashboard */}
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- EXECUTIVE BANNER --- */}
          <div className="relative overflow-hidden bg-[#0A1128] rounded-3xl p-8 md:p-12 text-white shadow-2xl mt-2 border border-slate-800">
             <div className="absolute inset-0 pointer-events-none opacity-5">
                <Users size={400} className="absolute text-white -right-20 -bottom-20 rotate-6" />
             </div>

             <div className="relative z-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <Database size={14} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Secure Node: Identity_Registry</span>
                   </div>
                   <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">Identity Management</h1>
                   <p className="max-w-2xl text-sm font-normal leading-relaxed text-slate-400">
                     Global governance of platform entities, credential verification, and administrative session overrides.
                   </p>
                </div>

                <div className="flex items-center w-full gap-4 sm:w-auto">
                   <div className="hidden px-8 py-3 text-center border rounded-2xl sm:block bg-white/5 border-white/10 backdrop-blur-md">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Entities</p>
                      <p className="font-mono text-2xl font-bold tracking-tight">{users.length}</p>
                   </div>
                   <button 
                     onClick={() => loadDirectory(true)} 
                     disabled={loading}
                     className="flex items-center justify-center flex-1 gap-3 px-8 text-sm font-bold transition-all bg-red-600 shadow-lg sm:flex-none h-14 text-white rounded-2xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-70"
                   >
                      <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                      Sync Registry
                   </button>
                </div>
             </div>
          </div>

          {/* --- UTILITIES & SEARCH --- */}
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
             <div className="relative w-full max-w-md group">
                <Search className="absolute transition-colors -translate-y-1/2 left-4 top-1/2 text-slate-400 group-focus-within:text-red-500" size={18} />
                <input 
                  type="text"
                  placeholder="Query by identity, email, or access level..."
                  className="w-full h-12 pl-12 pr-4 text-sm font-medium transition-all bg-white border shadow-sm outline-none border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/5 focus:border-red-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={14} /> Last Synced: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
          </div>

          {/* --- DATA GRID --- */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="border-b bg-slate-50/50 border-slate-100">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-8 py-5">Platform Identity</th>
                    <th className="px-8 py-5 text-center">Protocol Status</th>
                    <th className="px-8 py-5 text-center">Authorized Role</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <LoadingSkeletons count={5} />
                  ) : paginatedUsers.length === 0 ? (
                    <EmptyState />
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="transition-all hover:bg-slate-50/30 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-11 h-11 text-xs font-bold text-white shadow-xl rounded-2xl bg-[#0A1128] shrink-0">
                              {(u.name || "U")[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm font-bold transition-colors text-slate-900 group-hover:text-red-600">
                                {u.name || 'Anonymous Entity'}
                                {(u.role === 'superadmin' || u.role === 'super_admin') && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter mt-1 flex items-center gap-1">
                                 <Mail size={10} /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <StatusLabel isVerified={u.isVerified} />
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={cn(
                             "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm transition-all",
                             u.role === 'superadmin' || u.role === 'super_admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                             u.role === 'admin' ? "bg-blue-50 text-blue-700 border-blue-100" :
                             "bg-slate-50 text-slate-600 border-slate-100 group-hover:border-slate-200"
                           )}>
                              {u.role?.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2.5 opacity-40 group-hover:opacity-100 transition-all duration-300">
                            {!u.isVerified && (
                              <IconButton onClick={() => handleVerify(u.id)} icon={ShieldCheck} title="Authorize" variant="success" />
                            )}
                            {u.role !== 'super_admin' && u.role !== 'superadmin' && currentUser?.id !== u.id && (
                              <IconButton onClick={() => { setTargetUser(u); setActiveModal('impersonate'); }} icon={Ghost} title="Shadow Mode" variant="info" />
                            )}
                            {currentUser?.id !== u.id && (
                              <IconButton onClick={() => { setTargetUser(u); setActiveModal('delete'); }} icon={UserMinus} title="Purge Identity" variant="danger" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredUsers.length > 0 && (
               <div className="flex flex-col items-center justify-between gap-4 px-8 py-6 border-t bg-slate-50/30 border-slate-100 sm:flex-row">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Registry Index: <span className="text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}—{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of {filteredUsers.length}
                  </p>
                  <div className="flex items-center gap-3">
                     <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-30"><ArrowLeft size={16} /></button>
                     <div className="px-5 py-2 font-mono text-xs font-black bg-white border shadow-inner text-slate-700 border-slate-200 rounded-xl">PAGE {currentPage} / {totalPages}</div>
                     <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-30"><ArrowRight size={16} /></button>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* --- MODAL ORCHESTRATION --- */}
        
        {activeModal === 'delete' && (
          <ModalWrapper onClose={() => setActiveModal(null)}>
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 text-red-600 shadow-inner bg-red-50 rounded-2xl"><AlertTriangle size={24} /></div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Purge Sequence</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Terminal Action</p>
                </div>
             </div>
             <Alert variant="destructive" className="mb-8 rounded-2xl">
                Purging <strong>{targetUser?.email}</strong> destroys all mapped data and traces. This cannot be reversed.
             </Alert>
             <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setActiveModal(null)}>Abort</Button>
                <Button className="flex-1 font-bold text-white bg-red-600 h-14 rounded-2xl hover:bg-red-700" onClick={executeDelete} disabled={processingId !== null}>
                   {processingId ? <RefreshCw className="animate-spin" size={18} /> : 'Confirm Purge'}
                </Button>
             </div>
          </ModalWrapper>
        )}

        {activeModal === 'impersonate' && (
          <ModalWrapper onClose={() => setActiveModal(null)}>
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 text-blue-600 shadow-inner bg-blue-50 rounded-2xl"><Fingerprint size={24} /></div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Shadow Session</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Access Proxy</p>
                </div>
             </div>
             <Alert variant="info" className="mb-8 rounded-2xl">
                Initializing proxy session for <strong>{targetUser?.name}</strong>. Interactions will be audited under your signature.
             </Alert>
             <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button className="flex-1 h-14 font-bold text-white bg-[#0A1128] rounded-2xl hover:bg-[#14224A]" onClick={executeImpersonation} disabled={processingId !== null}>
                   {processingId ? <RefreshCw className="animate-spin" size={18} /> : 'Authorize Proxy'}
                </Button>
             </div>
          </ModalWrapper>
        )}
      </DashboardLayout>
    </RouteGuard>
  );
}

// --- ATOMS ---

const IconButton = ({ icon: Icon, title, variant, onClick }) => {
    const styles = {
        success: "text-emerald-500 hover:bg-emerald-50 border-emerald-100",
        info: "text-blue-500 hover:bg-blue-50 border-blue-100",
        danger: "text-red-500 hover:bg-red-50 border-red-100",
    };
    return (
        <button onClick={onClick} className={cn("p-2.5 transition-all border rounded-xl bg-white shadow-sm hover:scale-105", styles[variant])} title={title}>
          <Icon size={18} strokeWidth={2.2} />
        </button>
    );
};

const LoadingSkeletons = ({ count }) => (
    <>
      {[...Array(count)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="flex gap-4 px-8 py-6"><div className="w-11 h-11 bg-slate-100 rounded-2xl"/><div className="flex-1 py-1 space-y-2"><div className="w-1/3 h-4 rounded bg-slate-100"/><div className="w-1/2 h-3 rounded bg-slate-50"/></div></td>
            <td className="px-8 py-6"><div className="w-20 h-6 mx-auto rounded-lg bg-slate-100"/></td>
            <td className="px-8 py-6"><div className="w-24 h-6 mx-auto rounded-lg bg-slate-100"/></td>
            <td className="px-8 py-6"><div className="w-32 h-10 ml-auto bg-slate-50 rounded-xl"/></td>
        </tr>
      ))}
    </>
);

const EmptyState = () => (
    <tr>
        <td colSpan="4" className="py-24 text-center bg-slate-50/50 text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold tracking-widest uppercase">Registry node empty</p>
        </td>
    </tr>
);

// 🟢 FIX: Added e.stopPropagation() so clicking inside the modal doesn't trigger the onClose backdrop event
const ModalWrapper = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in" 
    onClick={onClose}
  >
    <div 
      className="w-full max-w-md p-8 bg-white border shadow-2xl rounded-[2rem] border-slate-100 animate-in zoom-in-95" 
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const StatusLabel = ({ isVerified }) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border shadow-inner transition-all",
    isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100 animate-pulse"
  )}>
    {isVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
    {isVerified ? 'Authorized' : 'Review Req'}
  </div>
);