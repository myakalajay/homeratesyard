'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { 
  User, Shield, Bell, Save, Mail, Phone, 
  Lock, RefreshCw, CheckCircle2, ShieldCheck, 
  Smartphone, Activity, Key
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

export default function SuperAdminProfile() {
  const { user } = useAuthContext();
  const { addToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    mfaEnabled: true,
    loginNotifications: false
  });

  // Hydrate form with user data once mounted
  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 (555) 000-0000', // Fallback for UI visualization
      });
    }
  }, [user]);

  // Safe Initials Extractor
  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name]);

  // --- SUBMIT HANDLERS ---
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 🟢 Replace with your actual API call: await api.put('/users/profile', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      addToast('Profile information updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return addToast('New passwords do not match', 'error');
    }
    setIsSaving(true);
    try {
      // 🟢 Replace with your actual API call: await api.put('/users/password', securityData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Security credentials updated securely', 'success');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast('Failed to update security credentials', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      addToast('Preference updated', 'success');
      return next;
    });
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  return (
    <>
      <Head><title>Security Profile | HomeRatesYard Enterprise</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. EXECUTIVE BANNER --- */}
        <div className="relative overflow-hidden bg-[#0A1128] rounded-3xl p-8 md:p-10 text-white shadow-xl border border-slate-800 mt-2">
           <div className="absolute inset-0 pointer-events-none opacity-5">
              <Shield size={400} className="absolute text-white -right-10 -bottom-20 rotate-12" />
           </div>

           <div className="relative z-10 flex flex-col items-center gap-8 sm:flex-row">
              {/* Avatar Ring */}
              <div className="relative flex items-center justify-center shrink-0 w-24 h-24 text-3xl font-black bg-white rounded-full text-slate-900 shadow-[0_0_0_4px_rgba(255,255,255,0.1)]">
                 {initials}
                 <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 text-white bg-emerald-500 border-4 border-[#0A1128] rounded-full">
                    <CheckCircle2 size={14} strokeWidth={3} />
                 </div>
              </div>

              <div className="text-center sm:text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 border rounded-full bg-blue-500/10 border-blue-500/20">
                    <ShieldCheck size={12} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Verified Identity</span>
                 </div>
                 <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">{user?.name}</h1>
                 <p className="flex items-center justify-center gap-2 mt-2 text-sm font-medium text-slate-400 sm:justify-start">
                    <Mail size={14} /> {user?.email}
                 </p>
              </div>
           </div>
        </div>

        {/* --- 2. PROFILE WORKSPACE --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* NAVIGATION SIDEBAR */}
          <div className="lg:col-span-3">
             <div className="sticky p-2 bg-white border shadow-sm top-24 rounded-2xl border-slate-200">
                <nav className="flex flex-col gap-1">
                   <TabButton 
                     active={activeTab === 'personal'} 
                     onClick={() => setActiveTab('personal')} 
                     icon={User} 
                     label="Personal Info" 
                   />
                   <TabButton 
                     active={activeTab === 'security'} 
                     onClick={() => setActiveTab('security')} 
                     icon={Key} 
                     label="Security & Access" 
                   />
                   <TabButton 
                     active={activeTab === 'preferences'} 
                     onClick={() => setActiveTab('preferences')} 
                     icon={Bell} 
                     label="Notifications" 
                   />
                </nav>
             </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-9">
             <div className="p-6 bg-white border shadow-sm sm:p-8 rounded-3xl border-slate-200 min-h-[500px]">
                
                {/* --- TAB: PERSONAL INFO --- */}
                {activeTab === 'personal' && (
                  <form onSubmit={handleSavePersonal} className="space-y-8 animate-in fade-in slide-in-from-right-2">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">Update your identity and contact details.</p>
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                           <div className="relative">
                              <User size={16} className="absolute text-slate-400 left-4 top-3.5" />
                              <input 
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full h-12 pr-4 text-sm font-bold transition-all bg-white border shadow-sm outline-none pl-11 text-slate-900 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                           <div className="relative">
                              <Mail size={16} className="absolute text-slate-400 left-4 top-3.5" />
                              <input 
                                disabled
                                type="email"
                                value={formData.email}
                                className="w-full h-12 pr-4 text-sm font-bold border outline-none cursor-not-allowed pl-11 text-slate-500 bg-slate-50 border-slate-200 rounded-xl"
                                title="Contact IT to change your primary registry email."
                              />
                           </div>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                           <div className="relative">
                              <Phone size={16} className="absolute text-slate-400 left-4 top-3.5" />
                              <input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full h-12 pr-4 text-sm font-bold transition-all bg-white border shadow-sm outline-none pl-11 text-slate-900 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button type="submit" disabled={isSaving} className="h-12 px-8 font-bold text-white transition-all bg-red-600 shadow-lg rounded-xl hover:bg-red-700 shadow-red-200">
                           {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                           {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                     </div>
                  </form>
                )}

                {/* --- TAB: SECURITY & ACCESS --- */}
                {activeTab === 'security' && (
                  <form onSubmit={handleSaveSecurity} className="space-y-8 animate-in fade-in slide-in-from-right-2">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">Security & Password</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">Manage your credentials and access protocols.</p>
                     </div>

                     <div className="flex items-start gap-4 p-5 border border-purple-100 bg-purple-50 rounded-2xl">
                        <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl shrink-0"><Smartphone size={20} /></div>
                        <div>
                           <h4 className="text-sm font-bold text-purple-900">Two-Factor Authentication (2FA)</h4>
                           <p className="mt-1 text-xs font-medium text-purple-700">Your account is secured with mandatory administrative MFA.</p>
                        </div>
                     </div>

                     <div className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Current Password</label>
                           <div className="relative">
                              <Lock size={16} className="absolute text-slate-400 left-4 top-3.5" />
                              <input 
                                required
                                type="password"
                                value={securityData.currentPassword}
                                onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                className="w-full h-12 pr-4 text-sm font-bold transition-all bg-white border shadow-sm outline-none pl-11 text-slate-900 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                           <div className="space-y-2">
                              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">New Password</label>
                              <div className="relative">
                                 <Lock size={16} className="absolute text-slate-400 left-4 top-3.5" />
                                 <input 
                                   required
                                   type="password"
                                   value={securityData.newPassword}
                                   onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                   className="w-full h-12 pr-4 text-sm font-bold transition-all bg-white border shadow-sm outline-none pl-11 text-slate-900 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confirm New Password</label>
                              <div className="relative">
                                 <Lock size={16} className="absolute text-slate-400 left-4 top-3.5" />
                                 <input 
                                   required
                                   type="password"
                                   value={securityData.confirmPassword}
                                   onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                   className="w-full h-12 pr-4 text-sm font-bold transition-all bg-white border shadow-sm outline-none pl-11 text-slate-900 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button type="submit" disabled={isSaving} className="h-12 px-8 font-bold text-white transition-all shadow-lg bg-slate-900 rounded-xl hover:bg-slate-800 shadow-slate-200">
                           {isSaving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Shield size={18} className="mr-2" />}
                           {isSaving ? 'Updating Protocol...' : 'Update Password'}
                        </Button>
                     </div>
                  </form>
                )}

                {/* --- TAB: NOTIFICATIONS --- */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">Control how you receive system alerts and audit logs.</p>
                     </div>

                     <div className="space-y-4">
                        <ToggleCard 
                          icon={Mail}
                          title="Email Alert Digests"
                          desc="Receive daily summaries of system activity and new loan applications."
                          active={preferences.emailAlerts}
                          onToggle={() => togglePreference('emailAlerts')}
                        />
                        <ToggleCard 
                          icon={Activity}
                          title="Login Anomaly Alerts"
                          desc="Get instant notifications for unrecognized IP logins or failed attempts."
                          active={preferences.loginNotifications}
                          onToggle={() => togglePreference('loginNotifications')}
                        />
                     </div>
                  </div>
                )}

             </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ==========================================
// 🧱 ATOMS & SUB-COMPONENTS
// ==========================================

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all",
      active 
        ? "bg-red-50 text-red-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon size={18} className={cn("transition-colors", active ? "text-red-500" : "text-slate-400")} />
    {label}
  </button>
);

const ToggleCard = ({ icon: Icon, title, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 transition-colors bg-white border border-slate-200 rounded-2xl hover:border-slate-300">
    <div className="flex items-start gap-4">
      <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", active ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400")}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
    
    {/* Custom Tailwind Toggle Switch */}
    <button 
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        active ? "bg-red-500" : "bg-slate-200"
      )}
    >
      <span className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          active ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  </div>
);

// 🟢 ROUTING: Locked down to Super Admin
SuperAdminProfile.getLayout = (page) => (
  <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);