'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  User, Shield, Users, Bell, Save, Smartphone, 
  Laptop, Mail, CheckCircle2, AlertTriangle, 
  LockKeyhole, LogOut, Plus, X, RefreshCw, 
  FileSignature, Camera, KeyRound, Trash2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

export default function SettingsPage() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); 
  const [isSaving, setIsSaving] = useState(false);
  
  // --- MODAL STATES ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Forms
  const [inviteForm, setInviteForm] = useState({ email: '', relation: 'Spouse' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // --- DB STATES ---
  const [profileData, setProfileData] = useState({
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.thompson@example.com',
    phone: '(555) 123-4567',
    address: '123 Pine Retreat Ln',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: true,
    lastPasswordChange: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString(),
    sessions: [
      { id: 1, device: 'MacBook Pro (macOS)', browser: 'Chrome', location: 'Austin, TX', current: true, time: 'Active now' },
      { id: 2, device: 'iPhone 13 (iOS)', browser: 'Safari', location: 'Austin, TX', current: false, time: 'Last active 2 hours ago' }
    ]
  });

  const [coBorrowers, setCoBorrowers] = useState([
    { id: 'cb-1', name: 'Jordan Thompson', email: 'jordan.t@example.com', status: 'active', relation: 'Spouse' },
    { id: 'cb-2', name: 'Pending User', email: 'jordan.work@example.com', status: 'pending', relation: 'Spouse' }
  ]);

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: true,
    marketing: false,
    eConsent: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast('Profile information successfully updated.', 'success');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSaving(false);
    setIsPasswordModalOpen(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setSecurityData(prev => ({ ...prev, lastPasswordChange: new Date().toISOString() }));
    addToast('Password successfully updated.', 'success');
  };

  // 🟢 UPGRADED: Full Lifecycle Co-Borrower Management
  const handleInviteCoBorrower = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setCoBorrowers(prev => [...prev, {
      id: `cb-${Date.now()}`,
      name: 'Pending Invite',
      email: inviteForm.email,
      status: 'pending',
      relation: inviteForm.relation
    }]);
    
    setIsSaving(false);
    setIsInviteModalOpen(false);
    setInviteForm({ email: '', relation: 'Spouse' });
    addToast(`Secure invitation sent to ${inviteForm.email}.`, 'success');
  };

  const handleRemoveCoBorrower = (id, name, status) => {
    if (status === 'pending') {
      setCoBorrowers(prev => prev.filter(cb => cb.id !== id));
      addToast('Pending invitation revoked.', 'info');
      return;
    }

    if (window.confirm(`WARNING: Removing an active Co-Borrower (${name}) from your file will require the loan to be fully re-underwritten based solely on your personal income and assets. Are you sure you want to proceed?`)) {
      setCoBorrowers(prev => prev.filter(cb => cb.id !== id));
      addToast(`${name} has been unlinked from your application.`, 'warning');
    }
  };

  const handleRevokeSession = (sessionId) => {
    setSecurityData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));
    addToast('Remote session forcefully terminated.', 'info');
  };

  const toggleEConsent = () => {
    if (preferences.eConsent) {
      if (window.confirm("Warning: Revoking E-Consent means we must legally mail physical documents to you. This will slow down your loan closing by 5-7 business days. Are you sure?")) {
        setPreferences(prev => ({ ...prev, eConsent: false }));
        addToast('E-Consent revoked. Mail delivery activated.', 'warning');
      }
    } else {
      setPreferences(prev => ({ ...prev, eConsent: true }));
      addToast('E-Consent digitally signed and activated.', 'success');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  const TABS = [
    { id: 'profile', label: 'Personal Details', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'coborrower', label: 'Co-Borrowers', icon: Users },
    { id: 'preferences', label: 'Preferences & Legal', icon: Bell }
  ];

  // Derive masked phone for UI clarity
  const maskedPhone = profileData.phone ? `***-***-${profileData.phone.slice(-4)}` : 'your mobile device';

  return (
    <>
      <Head><title>Account Settings | HomeRatesYard</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <User className="text-[#B91C1C]" size={32} /> 
              Account Settings
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage your profile, security protocols, and joint applicants.
            </p>
          </div>
        </div>

        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- 2. SIDEBAR NAVIGATION --- */}
            <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-[24px] p-3 flex flex-col gap-1 lg:sticky lg:top-24 overflow-x-auto lg:overflow-visible flex-row lg:flex-col">
               {TABS.map(tab => {
                 const isActive = activeTab === tab.id;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                       "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal text-left",
                       isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                     )}
                   >
                     <tab.icon size={18} className={isActive ? "text-blue-400" : "text-slate-400"} />
                     {tab.label}
                   </button>
                 );
               })}
            </div>

            {/* --- 3. MAIN CONTENT AREA --- */}
            <div className="space-y-6 lg:col-span-9">
               
               {/* --- TAB: PROFILE --- */}
               {activeTab === 'profile' && (
                 <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* 🟢 NEW: Visual Profile Header */}
                    <div className="flex flex-col gap-6 p-6 border-b md:p-8 border-slate-100 bg-slate-50/50 sm:flex-row sm:items-center">
                       <div className="relative cursor-pointer group w-fit">
                          <div className="flex items-center justify-center w-20 h-20 text-2xl font-black text-blue-600 bg-blue-100 rounded-full shadow-inner">
                            {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 bg-slate-900/60 group-hover:opacity-100 backdrop-blur-sm">
                            <Camera size={20} className="text-white" />
                          </div>
                       </div>
                       <div>
                         <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                         <p className="mt-1 text-sm text-slate-500">This information must exactly match your government ID for underwriting.</p>
                       </div>
                    </div>
                    
                    <form className="p-6 space-y-6 md:p-8" onSubmit={handleSaveProfile}>
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Legal First Name</label>
                           <input type="text" required value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Legal Last Name</label>
                           <input type="text" required value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                       </div>

                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                           <input type="email" disabled value={profileData.email} className="w-full h-12 px-4 text-sm font-bold border cursor-not-allowed border-slate-200 rounded-xl bg-slate-100 text-slate-500" title="Email changes require security verification" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                           <input type="tel" required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                       </div>

                       <div className="h-px my-4 bg-slate-100" />

                       <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Current Home Address</label>
                         <input type="text" required value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                       </div>

                       <div className="grid grid-cols-3 gap-6">
                         <div className="col-span-2 space-y-2 sm:col-span-1">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                           <input type="text" required value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                         <div className="col-span-1 space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">State</label>
                           <input type="text" required value={profileData.state} maxLength={2} onChange={e => setProfileData({...profileData, state: e.target.value})} className="w-full h-12 px-4 text-sm font-bold text-center uppercase transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                         <div className="col-span-3 space-y-2 sm:col-span-1">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Zip Code</label>
                           <input type="text" required value={profileData.zip} onChange={e => setProfileData({...profileData, zip: e.target.value.replace(/\D/g, '')})} maxLength={5} className="w-full h-12 px-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
                         </div>
                       </div>

                       <div className="flex justify-end pt-6 border-t border-slate-100">
                         <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#0A1128] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2">
                           {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                           Save Changes
                         </button>
                       </div>
                    </form>
                 </div>
               )}

               {/* --- TAB: SECURITY --- */}
               {activeTab === 'security' && (
                 <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
                    
                    {/* 🟢 NEW: Password Management Widget */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                       <div className="flex items-start gap-4">
                          <div className="p-3 text-blue-600 bg-blue-50 rounded-xl">
                            <KeyRound size={24} />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-slate-900">Account Password</h2>
                            <p className="mt-1 text-xs text-slate-500">Last changed on {new Date(securityData.lastPasswordChange).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setIsPasswordModalOpen(true)}
                         className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors shrink-0"
                       >
                         Update Password
                       </button>
                    </div>

                    {/* 2FA Widget */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8">
                       <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                         <div>
                           <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                             <Shield className="text-emerald-500" size={24} /> Two-Factor Authentication
                           </h2>
                           <p className="max-w-lg mt-1 text-sm text-slate-500">
                             Codes will be securely sent to <strong className="text-slate-700">{maskedPhone}</strong> when logging in from unrecognized devices.
                           </p>
                         </div>
                         <div className={cn("px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 shrink-0", securityData.twoFactorEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500")}>
                            {securityData.twoFactorEnabled ? <CheckCircle2 size={18} className="text-emerald-500"/> : <AlertTriangle size={18} className="text-slate-400"/>}
                            {securityData.twoFactorEnabled ? '2FA Active' : '2FA Disabled'}
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={() => {
                             setSecurityData(prev => ({...prev, twoFactorEnabled: !prev.twoFactorEnabled}));
                             addToast(securityData.twoFactorEnabled ? '2FA Disabled. Your account is less secure.' : '2FA Enabled successfully.', securityData.twoFactorEnabled ? 'warning' : 'success');
                           }}
                           className={cn(
                             "px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95",
                             securityData.twoFactorEnabled ? "bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-blue-600 text-white hover:bg-blue-700"
                           )}
                         >
                           {securityData.twoFactorEnabled ? 'Disable 2FA' : 'Enable SMS 2FA'}
                         </button>
                       </div>
                    </div>

                    {/* Active Sessions Widget */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                       <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                         <h3 className="text-base font-bold text-slate-900">Active Device Sessions</h3>
                       </div>
                       <div className="divide-y divide-slate-100">
                          {securityData.sessions.map(session => (
                            <div key={session.id} className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                    {session.device.includes('Mac') || session.device.includes('Windows') ? <Laptop size={20} /> : <Smartphone size={20} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{session.device}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{session.browser} • {session.location}</p>
                                    <p className={cn("text-[10px] font-bold mt-1.5 uppercase tracking-widest", session.current ? "text-emerald-500" : "text-slate-400")}>
                                      {session.time}
                                    </p>
                                  </div>
                               </div>
                               {!session.current && (
                                 <button 
                                   onClick={() => handleRevokeSession(session.id)}
                                   className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 shrink-0"
                                 >
                                   <LogOut size={14} /> Revoke Access
                                 </button>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {/* --- TAB: CO-BORROWER --- */}
               {activeTab === 'coborrower' && (
                 <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col justify-between gap-4 p-6 border-b md:p-8 border-slate-100 bg-slate-50/50 sm:flex-row sm:items-center">
                       <div>
                         <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                           <Users className="text-blue-600" size={24} /> Joint Applicants
                         </h2>
                         <p className="mt-1 text-sm text-slate-500">Manage co-borrowers securely attached to your active file.</p>
                       </div>
                       <button 
                         onClick={() => setIsInviteModalOpen(true)}
                         className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B91C1C] text-white text-sm font-bold rounded-xl hover:bg-red-800 transition-all shadow-md active:scale-95 shrink-0"
                       >
                         <Plus size={16} /> Invite Co-Borrower
                       </button>
                    </div>
                    
                    <div className="p-6 md:p-8">
                       {coBorrowers.length === 0 ? (
                         <div className="py-10 text-center opacity-60">
                           <Users size={48} className="mx-auto mb-4 text-slate-300" />
                           <h3 className="text-lg font-bold text-slate-900">Applying alone?</h3>
                           <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">If you are buying a home with a spouse or partner, invite them here to securely link their credit and income to your file.</p>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           {coBorrowers.map(cb => (
                             <div key={cb.id} className="flex flex-col justify-between gap-4 p-5 border sm:flex-row sm:items-center border-slate-100 rounded-2xl bg-slate-50 group">
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-blue-600 bg-blue-100 rounded-full shrink-0">
                                     {cb.name.charAt(0)}
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-slate-900">{cb.name}</p>
                                     <p className="text-xs text-slate-500 mt-0.5">{cb.email}</p>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between w-full gap-6 pt-4 border-t sm:w-auto sm:border-0 border-slate-200 sm:pt-0">
                                   <div className="flex flex-col gap-1 sm:items-end">
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{cb.relation}</span>
                                     <span className={cn(
                                       "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border w-fit",
                                       cb.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"
                                     )}>
                                       {cb.status === 'active' ? 'Linked' : 'Invite Sent'}
                                     </span>
                                   </div>
                                   
                                   {/* 🟢 NEW: Remove/Revoke Action */}
                                   <button 
                                     onClick={() => handleRemoveCoBorrower(cb.id, cb.name, cb.status)}
                                     className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                     title={cb.status === 'active' ? 'Remove Co-Borrower' : 'Revoke Invite'}
                                   >
                                     <Trash2 size={18} />
                                   </button>
                                </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
               )}

               {/* --- TAB: PREFERENCES & LEGAL --- */}
               {activeTab === 'preferences' && (
                 <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
                    
                    {/* Communications */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                       <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                         <h3 className="text-base font-bold text-slate-900">Communication Preferences</h3>
                       </div>
                       <div className="p-6 space-y-6">
                          <ToggleRow 
                            title="Underwriting & Critical Alerts" 
                            desc="SMS and Email alerts regarding tasks, required documents, and closing disclosures."
                            checked={preferences.smsAlerts}
                            locked={true} // You can't turn off critical operational alerts
                          />
                          <div className="h-px bg-slate-100" />
                          <ToggleRow 
                            title="Marketing & Rate Updates" 
                            desc="Occasional emails when interest rates drop or new cash-out refinance options become available."
                            checked={preferences.marketing}
                            onChange={() => {
                              setPreferences(prev => ({...prev, marketing: !prev.marketing}));
                              addToast('Marketing preferences updated.', 'success');
                            }}
                          />
                       </div>
                    </div>

                    {/* E-Consent (Legal) */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                       <div className="flex flex-col justify-between gap-4 p-6 border-b border-slate-100 bg-slate-50/50 sm:flex-row sm:items-center">
                         <div>
                           <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                             <FileSignature size={18} className="text-blue-600" /> E-Sign Consent
                           </h3>
                         </div>
                         <span className={cn(
                           "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                           preferences.eConsent ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                         )}>
                           {preferences.eConsent ? 'Consented' : 'Revoked'}
                         </span>
                       </div>
                       <div className="p-6 md:p-8">
                          <p className="mb-6 text-sm leading-relaxed text-slate-600">
                            By maintaining Electronic Consent, you agree to receive all legal disclosures, loan estimates, and closing documents digitally via this secure portal. Revoking this consent requires HomeRatesYard to physically mail paper documents to your address on file, which typically delays the underwriting and closing process by 5-7 business days.
                          </p>
                          <button 
                            onClick={toggleEConsent}
                            className={cn(
                              "px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95",
                              preferences.eConsent ? "bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            {preferences.eConsent ? 'Revoke E-Consent (Not Recommended)' : 'Re-Activate Electronic Delivery'}
                          </button>
                       </div>
                    </div>

                 </div>
               )}

            </div>
        </div>
      </div>

      {/* --- 4. 🟢 INVITE CO-BORROWER MODAL --- */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsInviteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Secure Link Invite</h2>
                </div>
              </div>
              <button disabled={isSaving} onClick={() => setIsInviteModalOpen(false)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-200 disabled:opacity-50"><X size={18} /></button>
            </div>
            
            <form className="p-6 space-y-5 md:p-8" onSubmit={handleInviteCoBorrower}>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                We will email your co-borrower a secure link to create their own portal login to safely upload their income and assets.
              </p>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Relationship</label>
                 <select 
                   required
                   value={inviteForm.relation} onChange={e => setInviteForm({...inviteForm, relation: e.target.value})}
                   className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none appearance-none cursor-pointer border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
                 >
                   <option value="Spouse">Spouse</option>
                   <option value="Unmarried Partner">Unmarried Partner</option>
                   <option value="Non-Occupant Co-Signer">Non-Occupant Co-Signer</option>
                 </select>
              </div>

              <div className="mb-8 space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Co-Borrower Email</label>
                 <div className="relative">
                   <Mail size={16} className="absolute left-4 top-4 text-slate-400" />
                   <input 
                     type="email" required placeholder="spouse@example.com"
                     value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                     className="w-full h-12 pl-10 pr-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white"
                   />
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={isSaving} onClick={() => setIsInviteModalOpen(false)} className="px-5 py-3 text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving || !inviteForm.email} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl active:scale-95 disabled:opacity-70">
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 5. 🟢 PASSWORD RESET MODAL --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Update Password</h2>
                </div>
              </div>
              <button disabled={isSaving} onClick={() => setIsPasswordModalOpen(false)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-200 disabled:opacity-50"><X size={18} /></button>
            </div>
            
            <form className="p-6 space-y-5 md:p-8" onSubmit={handlePasswordChange}>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Current Password</label>
                 <div className="relative">
                   <LockKeyhole size={16} className="absolute left-4 top-4 text-slate-400" />
                   <input 
                     type="password" required placeholder="••••••••"
                     value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                     className="w-full h-12 pl-10 pr-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white"
                   />
                 </div>
              </div>

              <div className="h-px my-2 bg-slate-100" />

              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                 <input 
                   type="password" required minLength={8} placeholder="8+ characters"
                   value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                   className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white"
                 />
              </div>

              <div className="mb-8 space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm New Password</label>
                 <input 
                   type="password" required minLength={8} placeholder="Repeat new password"
                   value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                   className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white"
                 />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={isSaving} onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-3 text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving || !passwordForm.current || !passwordForm.new || !passwordForm.confirm} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl active:scale-95 disabled:opacity-70">
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}

// --- MICRO COMPONENT ---
const ToggleRow = ({ title, desc, checked, onChange, locked }) => (
  <div className="flex items-start justify-between gap-6">
    <div>
      <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {title} 
        {locked && <LockKeyhole size={12} className="text-slate-400" title="Required for account operation" />}
      </p>
      <p className="max-w-md mt-1 text-xs text-slate-500">{desc}</p>
    </div>
    <button 
      type="button"
      onClick={onChange}
      disabled={locked}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors shrink-0",
        checked ? "bg-emerald-500" : "bg-slate-300",
        locked && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
        checked && "translate-x-6"
      )} />
    </button>
  </div>
);

SettingsPage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);