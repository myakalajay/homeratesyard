'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { 
  User, MapPin, Briefcase, ShieldCheck, 
  AlertCircle, CheckCircle2, Plus, Edit, 
  Trash2, Clock, Building, Landmark, X, Save, ShieldAlert
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatMonthYear = (dateStr) => {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  const date = new Date(year, month - 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

export default function BorrowerProfilePage() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- MODAL & FORM STATES ---
  const [activeModal, setActiveModal] = useState(null); // 'address' | 'employment' | 'demographics' | null
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- DB STATES ---
  const [profile, setProfile] = useState({
    personal: {
      firstName: 'Alex', lastName: 'Thompson', dob: '1985-08-15', ssnLast4: '4092',
      phone: '(555) 123-4567', maritalStatus: 'Married', dependents: 2
    },
    kyc: { status: 'verified', verifiedOn: '2025-10-12T08:00:00Z' }, 
    addresses: [],
    employment: []
  });

  // Controlled Forms
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', startDate: '', endDate: '', isCurrent: false, housingType: 'Rent', monthlyPayment: '' });
  const [jobForm, setJobForm] = useState({ employer: '', title: '', startDate: '', endDate: '', isCurrent: false, income: '' });
  const [demographicsForm, setDemographicsForm] = useState({ phone: '', maritalStatus: '', dependents: '' });

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProfile(prev => ({
          ...prev,
          addresses: [
            { id: 'addr-1', street: '123 Pine Retreat Ln', city: 'Austin', state: 'TX', zip: '78701', startDate: '2023-01', endDate: '', isCurrent: true, housingType: 'Rent', monthlyPayment: 2400 }
          ],
          employment: [
            { id: 'job-1', employer: 'TechFlow Solutions', title: 'Senior Engineer', startDate: '2022-06', endDate: '', isCurrent: true, income: 12500 }
          ]
        }));
      } catch (error) {
        addToast('Failed to load profile data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // --- ESCAPE KEY HANDLER ---
  const closeModal = useCallback(() => {
    if (isSaving) return;
    setActiveModal(null);
    setEditingId(null);
  }, [isSaving]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && activeModal) closeModal(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  // --- 2-YEAR UNDERWRITING VALIDATORS ---
  const calculateMonths = (start, end) => {
    if (!start) return 0;
    const d1 = new Date(start + '-01'); // Force valid date parse
    const d2 = end ? new Date(end + '-01') : new Date();
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  };

  const addressMonths = useMemo(() => profile.addresses.reduce((sum, addr) => sum + calculateMonths(addr.startDate, addr.endDate), 0), [profile.addresses]);
  const jobMonths = useMemo(() => profile.employment.reduce((sum, job) => sum + calculateMonths(job.startDate, job.endDate), 0), [profile.employment]);

  const needsMoreAddressHistory = addressMonths < 24;
  const needsMoreJobHistory = jobMonths < 24;

  // Profile Completeness Engine
  const completeness = useMemo(() => {
    let score = 20; // Base info
    if (profile.kyc.status === 'verified') score += 20;
    if (!needsMoreAddressHistory) score += 30; else if (profile.addresses.length > 0) score += 15;
    if (!needsMoreJobHistory) score += 30; else if (profile.employment.length > 0) score += 15;
    return Math.min(100, score);
  }, [profile, needsMoreAddressHistory, needsMoreJobHistory]);

  // --- MODAL TRIGGERS ---
  const openDemographicsModal = () => {
    setDemographicsForm({
      phone: profile.personal.phone,
      maritalStatus: profile.personal.maritalStatus,
      dependents: profile.personal.dependents
    });
    setActiveModal('demographics');
  };

  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingId(addr.id);
      setAddressForm({ ...addr });
    } else {
      setEditingId(null);
      setAddressForm({ street: '', city: '', state: '', zip: '', startDate: '', endDate: '', isCurrent: false, housingType: 'Rent', monthlyPayment: '' });
    }
    setActiveModal('address');
  };

  const openJobModal = (job = null) => {
    if (job) {
      setEditingId(job.id);
      setJobForm({ ...job });
    } else {
      setEditingId(null);
      setJobForm({ employer: '', title: '', startDate: '', endDate: '', isCurrent: false, income: '' });
    }
    setActiveModal('employment');
  };

  // --- SAVE HANDLERS ---
  const handleSaveDemographics = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, ...demographicsForm }
    }));
    closeModal();
    setIsSaving(false);
    addToast('Demographics successfully updated.', 'success');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingId) {
      setProfile(prev => ({ ...prev, addresses: prev.addresses.map(a => a.id === editingId ? { ...addressForm, id: editingId } : a) }));
      addToast('Address history updated.', 'success');
    } else {
      setProfile(prev => ({ ...prev, addresses: [{ ...addressForm, id: `addr-${Date.now()}` }, ...prev.addresses] }));
      addToast('New address added to history.', 'success');
    }
    closeModal();
    setIsSaving(false);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingId) {
      setProfile(prev => ({ ...prev, employment: prev.employment.map(j => j.id === editingId ? { ...jobForm, id: editingId } : j) }));
      addToast('Employment history updated.', 'success');
    } else {
      setProfile(prev => ({ ...prev, employment: [{ ...jobForm, id: `job-${Date.now()}` }, ...prev.employment] }));
      addToast('New employment record added.', 'success');
    }
    closeModal();
    setIsSaving(false);
  };

  const handleDelete = (type, id) => {
    if (window.confirm('Are you sure you want to completely remove this record from your underwriting file?')) {
      setProfile(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
      addToast('Record removed.', 'info');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <>
      <Head><title>Borrower Identity | HomeRatesYard</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. HEADER & COMPLETENESS ENGINE --- */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <User className="text-[#B91C1C]" size={32} /> 
              Underwriting Identity
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage your verified personal details, housing history, and employment records.
            </p>
          </div>

          <div className="w-full p-4 bg-white border shadow-sm rounded-2xl border-slate-200 md:w-72 shrink-0">
             <div className="flex items-center justify-between mb-2 text-sm font-bold">
               <span className="text-slate-700">Profile Strength</span>
               <span className={completeness === 100 ? "text-emerald-600" : "text-blue-600"}>{completeness}%</span>
             </div>
             <div className="w-full h-2 overflow-hidden border rounded-full bg-slate-100 border-slate-200">
                <div 
                  className={cn("h-full transition-all duration-1000", completeness === 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-blue-600")}
                  style={{ width: `${completeness}%` }}
                />
             </div>
             {completeness < 100 && <p className="text-[10px] text-slate-500 mt-2 font-medium">Complete your 2-year histories to hit 100%.</p>}
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- 2. LEFT COLUMN: IDENTITY & PERSONAL --- */}
            <div className="space-y-6 lg:col-span-5">
               
               {/* Identity Verification (KYC) */}
               <div className="bg-[#0A1128] text-white border border-slate-800 shadow-xl rounded-[24px] overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5"><ShieldCheck size={100} className="-mt-8 -mr-8" /></div>
                  <div className="relative z-10 p-6 md:p-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-16 h-16 text-xl font-black text-blue-400 border rounded-full shadow-inner bg-blue-600/20 border-blue-500/30 shrink-0">
                          {profile.personal.firstName.charAt(0)}{profile.personal.lastName.charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-lg font-bold tracking-tight">{profile.personal.firstName} {profile.personal.lastName}</h2>
                           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded border text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm">
                             <CheckCircle2 size={12} /> Identity Verified
                           </div>
                        </div>
                     </div>
                     
                     <div className="pt-4 space-y-4 border-t border-slate-800/50">
                        <div className="flex justify-between text-sm">
                           <span className="font-medium text-slate-400">Gov ID on File</span>
                           <span className="font-semibold text-slate-200">State Driver's License</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="font-medium text-slate-400">SSN (Masked)</span>
                           <span className="font-mono font-bold text-slate-200">***-**-{profile.personal.ssnLast4}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="font-medium text-slate-400">Date of Birth</span>
                           <span className="font-semibold text-slate-200">{profile.personal.dob}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Personal Demographics */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                     <h3 className="text-base font-bold text-slate-900">Demographics</h3>
                     <button onClick={openDemographicsModal} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1.5 transition-colors">
                       <Edit size={14}/> Edit
                     </button>
                  </div>
                  <div className="space-y-5">
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Phone Number</p>
                       <p className="text-sm font-bold text-slate-900">{profile.personal.phone}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Marital Status</p>
                       <p className="text-sm font-bold text-slate-900">{profile.personal.maritalStatus}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Declared Dependents</p>
                       <p className="text-sm font-bold text-slate-900">{profile.personal.dependents}</p>
                     </div>
                  </div>
               </div>

            </div>

            {/* --- 3. RIGHT COLUMN: 2-YEAR HISTORIES --- */}
            <div className="space-y-6 lg:col-span-7">
               
               {/* 🟢 HOUSING / ADDRESS HISTORY */}
               <div className={cn("bg-white border shadow-sm rounded-[24px] overflow-hidden transition-colors", needsMoreAddressHistory ? "border-orange-300" : "border-slate-200")}>
                  <div className={cn("p-6 md:p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4", needsMoreAddressHistory ? "bg-orange-50/50 border-orange-100" : "bg-slate-50/50 border-slate-100")}>
                     <div>
                       <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                         <MapPin className="text-blue-600" size={20} /> Residential History
                       </h3>
                       {needsMoreAddressHistory ? (
                         <p className="text-xs font-bold text-orange-600 flex items-center gap-1 mt-1.5"><AlertCircle size={14}/> Underwriting requires {24 - addressMonths} more months of history.</p>
                       ) : (
                         <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1.5"><CheckCircle2 size={14}/> 2-Year history requirement met.</p>
                       )}
                     </div>
                     <button onClick={() => openAddressModal()} className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
                       <Plus size={14} /> Add Address
                     </button>
                  </div>

                  <div className="relative p-6 md:p-8">
                     {/* Timeline Line */}
                     <div className="absolute left-[42px] top-8 bottom-8 w-0.5 bg-slate-100 z-0 hidden sm:block" />
                     
                     <div className="relative z-10 space-y-6">
                        {profile.addresses.length === 0 ? (
                          <div className="py-8 text-center opacity-60">
                             <MapPin size={32} className="mx-auto mb-3 text-slate-400" />
                             <p className="text-sm font-bold text-slate-900">No residential history</p>
                             <p className="mt-1 text-xs text-slate-500">Add your current address to begin.</p>
                          </div>
                        ) : (
                          profile.addresses.map((addr) => (
                             <div key={addr.id} className="flex gap-4 group">
                                <div className="flex-col items-center hidden mt-1 sm:flex">
                                   <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white", addr.isCurrent ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-300")}>
                                     {addr.isCurrent ? <MapPin size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                   </div>
                                </div>
                                <div className="relative flex-1 p-5 transition-colors bg-white border shadow-sm border-slate-200 rounded-2xl group-hover:border-blue-300">
                                   <div className="flex items-start justify-between pr-12 mb-2">
                                      <div>
                                        <p className="text-sm font-bold text-slate-900">{addr.street}</p>
                                        <p className="text-xs text-slate-500">{addr.city}, {addr.state} {addr.zip}</p>
                                      </div>
                                   </div>
                                   
                                   {/* Quick Actions (Edit/Delete) */}
                                   <div className="absolute flex items-center gap-1 pl-2 transition-opacity bg-white opacity-0 top-4 right-4 group-hover:opacity-100">
                                      <button onClick={() => openAddressModal(addr)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Edit"><Edit size={16} /></button>
                                      <button onClick={() => handleDelete('addresses', addr.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
                                   </div>

                                   <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-slate-100">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> {formatMonthYear(addr.startDate)} to {formatMonthYear(addr.endDate)}</div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Building size={12} className="text-slate-400"/> {addr.housingType}</div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Landmark size={12} className="text-slate-400"/> {formatCurrency(addr.monthlyPayment)}/mo</div>
                                   </div>
                                </div>
                             </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>

               {/* 🟢 EMPLOYMENT HISTORY */}
               <div className={cn("bg-white border shadow-sm rounded-[24px] overflow-hidden transition-colors", needsMoreJobHistory ? "border-orange-300" : "border-slate-200")}>
                  <div className={cn("p-6 md:p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4", needsMoreJobHistory ? "bg-orange-50/50 border-orange-100" : "bg-slate-50/50 border-slate-100")}>
                     <div>
                       <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                         <Briefcase className="text-blue-600" size={20} /> Employment History
                       </h3>
                       {needsMoreJobHistory ? (
                         <p className="text-xs font-bold text-orange-600 flex items-center gap-1 mt-1.5"><AlertCircle size={14}/> Underwriting requires {24 - jobMonths} more months of history.</p>
                       ) : (
                         <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1.5"><CheckCircle2 size={14}/> 2-Year history requirement met.</p>
                       )}
                     </div>
                     <button onClick={() => openJobModal()} className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
                       <Plus size={14} /> Add Job
                     </button>
                  </div>

                  <div className="relative p-6 md:p-8">
                     <div className="absolute left-[42px] top-8 bottom-8 w-0.5 bg-slate-100 z-0 hidden sm:block" />
                     
                     <div className="relative z-10 space-y-6">
                        {profile.employment.length === 0 ? (
                          <div className="py-8 text-center opacity-60">
                             <Briefcase size={32} className="mx-auto mb-3 text-slate-400" />
                             <p className="text-sm font-bold text-slate-900">No employment history</p>
                             <p className="mt-1 text-xs text-slate-500">Add your current employer to begin.</p>
                          </div>
                        ) : (
                          profile.employment.map((job) => (
                             <div key={job.id} className="flex gap-4 group">
                                <div className="flex-col items-center hidden mt-1 sm:flex">
                                   <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white", job.isCurrent ? "border-blue-500 text-blue-500" : "border-slate-300 text-slate-300")}>
                                     {job.isCurrent ? <Briefcase size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                   </div>
                                </div>
                                <div className="relative flex-1 p-5 transition-colors bg-white border shadow-sm border-slate-200 rounded-2xl group-hover:border-blue-300">
                                   <div className="flex items-start justify-between pr-12 mb-2">
                                      <div>
                                        <p className="text-sm font-bold text-slate-900">{job.employer}</p>
                                        <p className="text-xs font-medium text-slate-500">{job.title}</p>
                                      </div>
                                   </div>

                                   {/* Quick Actions (Edit/Delete) */}
                                   <div className="absolute flex items-center gap-1 pl-2 transition-opacity bg-white opacity-0 top-4 right-4 group-hover:opacity-100">
                                      <button onClick={() => openJobModal(job)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Edit"><Edit size={16} /></button>
                                      <button onClick={() => handleDelete('employment', job.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
                                   </div>

                                   <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-slate-100">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> {formatMonthYear(job.startDate)} to {formatMonthYear(job.endDate)}</div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5"><Landmark size={12} className="text-emerald-500"/> {formatCurrency(job.income)}/mo Gross</div>
                                   </div>
                                </div>
                             </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* --- 4. MODALS --- */}
      
      {/* 🟢 DEMOGRAPHICS EDIT MODAL */}
      {activeModal === 'demographics' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
               <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><User className="text-blue-600" size={18}/> Edit Demographics</h2>
               <button disabled={isSaving} onClick={closeModal} className="p-2 rounded-full text-slate-400 hover:bg-slate-200"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveDemographics} className="p-6 space-y-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                  <input type="tel" required value={demographicsForm.phone} onChange={e => setDemographicsForm({...demographicsForm, phone: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Marital Status</label>
                  <select required value={demographicsForm.maritalStatus} onChange={e => setDemographicsForm({...demographicsForm, maritalStatus: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none appearance-none cursor-pointer h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white">
                    <option value="Unmarried">Unmarried</option>
                    <option value="Married">Married</option>
                    <option value="Separated">Separated</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Declared Dependents</label>
                  <input type="number" min="0" required value={demographicsForm.dependents} onChange={e => setDemographicsForm({...demographicsForm, dependents: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white" />
               </div>
               
               <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                 <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                 <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                   {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 ADDRESS MODAL */}
      {activeModal === 'address' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
               <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><MapPin className="text-blue-600" size={18}/> {editingId ? 'Edit Address' : 'Add Address History'}</h2>
               <button disabled={isSaving} onClick={closeModal} className="p-2 rounded-full text-slate-400 hover:bg-slate-200"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Street Address</label>
                  <input type="text" required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                    <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">State</label>
                       <input type="text" maxLength={2} required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 text-sm font-semibold text-center uppercase transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Zip</label>
                       <input type="text" maxLength={5} required value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value.replace(/\D/g, '')})} className="w-full px-3 font-mono text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
                    </div>
                 </div>
               </div>

               <div className="h-px my-2 bg-slate-100" />

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
                    <input type="month" required value={addressForm.startDate} onChange={e => setAddressForm({...addressForm, startDate: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">End Date</label>
                    <input type="month" disabled={addressForm.isCurrent} required={!addressForm.isCurrent} value={addressForm.endDate} onChange={e => setAddressForm({...addressForm, endDate: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700 disabled:opacity-50" />
                 </div>
               </div>
               
               <label className="flex items-center gap-2 mt-2">
                 <input type="checkbox" checked={addressForm.isCurrent} onChange={e => setAddressForm({...addressForm, isCurrent: e.target.checked, endDate: ''})} className="w-4 h-4 text-blue-600 rounded cursor-pointer focus:ring-blue-500" />
                 <span className="text-sm font-bold cursor-pointer text-slate-700">I currently live here</span>
               </label>

               <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Housing Status</label>
                    <select value={addressForm.housingType} onChange={e => setAddressForm({...addressForm, housingType: e.target.value})} className="w-full px-4 text-sm font-semibold border outline-none appearance-none cursor-pointer h-11 border-slate-200 rounded-xl focus:border-blue-500 bg-slate-50">
                      <option value="Rent">Rent</option>
                      <option value="Own">Own</option>
                      <option value="Living Rent-Free">Living Rent-Free</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Monthly Payment</label>
                    <div className="relative group/input">
                      <span className="absolute font-bold transition-colors left-3 top-3 text-slate-400 group-focus-within/input:text-blue-500">$</span>
                      <input type="number" required={addressForm.housingType !== 'Living Rent-Free'} disabled={addressForm.housingType === 'Living Rent-Free'} value={addressForm.monthlyPayment} onChange={e => setAddressForm({...addressForm, monthlyPayment: e.target.value})} className="w-full pr-4 font-mono text-sm font-semibold transition-all border outline-none h-11 pl-7 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 disabled:opacity-50" />
                    </div>
                 </div>
               </div>

               <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                 <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                 <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                   {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {editingId ? 'Update Record' : 'Save Record'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 EMPLOYMENT MODAL */}
      {activeModal === 'employment' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
               <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Briefcase className="text-blue-600" size={18}/> {editingId ? 'Edit Employment' : 'Add Employment'}</h2>
               <button disabled={isSaving} onClick={closeModal} className="p-2 rounded-full text-slate-400 hover:bg-slate-200"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveJob} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Employer / Company Name</label>
                  <input type="text" required value={jobForm.employer} onChange={e => setJobForm({...jobForm, employer: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Job Title</label>
                  <input type="text" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
               </div>

               <div className="h-px my-2 bg-slate-100" />

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
                    <input type="month" required value={jobForm.startDate} onChange={e => setJobForm({...jobForm, startDate: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">End Date</label>
                    <input type="month" disabled={jobForm.isCurrent} required={!jobForm.isCurrent} value={jobForm.endDate} onChange={e => setJobForm({...jobForm, endDate: e.target.value})} className="w-full px-4 text-sm font-semibold transition-all border outline-none h-11 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-700 disabled:opacity-50" />
                 </div>
               </div>
               
               <label className="flex items-center gap-2 mt-2 mb-4">
                 <input type="checkbox" checked={jobForm.isCurrent} onChange={e => setJobForm({...jobForm, isCurrent: e.target.checked, endDate: ''})} className="w-4 h-4 text-blue-600 rounded cursor-pointer focus:ring-blue-500" />
                 <span className="text-sm font-bold cursor-pointer text-slate-700">I currently work here</span>
               </label>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Gross Monthly Income</label>
                  <div className="relative group/input">
                    <span className="absolute font-bold transition-colors left-3 top-3 text-slate-400 group-focus-within/input:text-emerald-500">$</span>
                    <input type="number" required placeholder="Before taxes" value={jobForm.income} onChange={e => setJobForm({...jobForm, income: e.target.value})} className="w-full pr-4 font-mono text-sm font-semibold transition-all border outline-none h-11 pl-7 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50" />
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                 <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                 <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                   {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {editingId ? 'Update Record' : 'Save Record'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="space-y-6 lg:col-span-5">
      <div className="h-[250px] bg-slate-200 rounded-[24px]" />
      <div className="h-[300px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="space-y-6 lg:col-span-7">
      <div className="h-[300px] bg-slate-200 rounded-[24px]" />
      <div className="h-[300px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);

BorrowerProfilePage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);