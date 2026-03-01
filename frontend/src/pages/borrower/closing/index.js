'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ShieldAlert, CalendarClock, FileSignature, Landmark, 
  Building2, MapPin, CheckCircle2, AlertTriangle, 
  LockKeyhole, KeyRound, ChevronRight, FileText, Download,
  Car, Building
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatDate = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));

export default function ClosingHubPage() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATES ---
  const [isWireModalOpen, setIsWireModalOpen] = useState(false);
  const [wireAuthStep, setWireAuthStep] = useState(1); // 1: 2FA Auth, 2: Reveal Info
  const [authCode, setAuthCode] = useState('');
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ type: 'mobile', date: '', time: '' });

  // --- DB STATE ---
  const [closingData, setClosingData] = useState(null);

  useEffect(() => {
    setMounted(true);
    const fetchClosingData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API
        
        const today = new Date();
        const cdSignedDate = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2); // Signed 2 days ago
        const earliestCloseDate = new Date(cdSignedDate.getTime() + 1000 * 60 * 60 * 24 * 3); // 3-day rule

        setClosingData({
          id: 'APP-902-XQ',
          propertyAddress: '123 Pine Retreat Ln, Austin, TX 78701',
          cashToClose: 114500,
          loanAmount: 450000,
          purchasePrice: 500000,
          status: 'cleared_to_close', // cd_issued, cd_signed, cleared_to_close, scheduled, funded
          timeline: {
            cdIssued: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            cdSigned: cdSignedDate.toISOString(),
            earliestClose: earliestCloseDate.toISOString(),
            scheduledClose: null // null until scheduled
          },
          titleCompany: {
            name: 'Texas Premier Title & Escrow',
            agent: 'Michael Ross',
            phone: '(555) 321-9876',
            email: 'closing@txpremierescrow.com',
            address: '400 Congress Ave, Austin, TX 78701'
          },
          wireDetails: {
            bankName: 'JPMorgan Chase Bank, NA',
            routingAba: '021000021',
            accountNumber: '883920019283',
            beneficiary: 'Texas Premier Title Escrow Trust',
            reference: 'File #APP-902-XQ - Thompson'
          }
        });
      } catch (error) {
        addToast('Failed to load closing data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchClosingData();
  }, [addToast]);

  // --- HANDLERS ---
  const handleVerify2FA = (e) => {
    e.preventDefault();
    if (authCode.length < 6) {
      addToast('Please enter the 6-digit code sent to your phone.', 'error');
      return;
    }
    setWireAuthStep(2);
    addToast('Identity verified. Secure wire instructions unlocked.', 'success');
  };

  const handleScheduleClose = async (e) => {
    e.preventDefault();
    addToast('Processing scheduling request...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setClosingData(prev => ({
      ...prev,
      status: 'scheduled',
      timeline: {
        ...prev.timeline,
        scheduledClose: scheduleForm.date
      }
    }));
    
    setIsScheduleModalOpen(false);
    addToast('Closing appointment successfully locked in!', 'success');
  };

  const handleDownloadCD = () => {
    addToast('Securely downloading Final Closing Disclosure...', 'info');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <>
      <Head><title>Closing Hub | HomeRatesYard</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <Landmark className="text-[#B91C1C]" size={32} /> 
              Closing Hub
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              You are cleared to close! Securely wire your funds and schedule your signing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-200 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            File: {closingData?.id}
          </div>
        </div>

        {/* --- 2. ANTI-FRAUD BANNER --- */}
        <div className="bg-red-50 border-2 border-red-200 rounded-[24px] p-6 sm:p-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5"><ShieldAlert size={150} className="-mt-10 -mr-10 text-red-500" /></div>
           <div className="relative z-10 p-3 mt-1 text-red-600 bg-red-100 rounded-2xl shrink-0">
              <ShieldAlert size={28} />
           </div>
           <div className="relative z-10">
              <h2 className="text-lg font-black tracking-tight text-red-800 uppercase">Wire Fraud Warning</h2>
              <p className="max-w-3xl mt-2 text-sm font-medium leading-relaxed text-red-900">
                Hackers routinely intercept emails and send fake wiring instructions. <strong>We will NEVER email you changes to your wiring instructions.</strong> Before wiring any funds, you must verify the instructions found strictly within this secure portal, or call your title agent directly at a known, verified phone number.
              </p>
           </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- 3. MAIN ACTION COLUMN --- */}
            <div className="space-y-6 lg:col-span-7">
               
               {/* Action Item: Closing Disclosure (Completed) */}
               <div className="bg-white border-2 border-emerald-100 shadow-sm rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-2 bg-emerald-500" />
                  <div className="flex items-center gap-4 pl-4">
                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                       <FileSignature size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900">Closing Disclosure Signed</h3>
                       <p className="text-xs font-semibold text-slate-500 mt-0.5">Mandatory 3-day federal cooling-off period active.</p>
                     </div>
                  </div>
                  <button onClick={handleDownloadCD} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors shrink-0">
                     <Download size={16} /> View Final CD
                  </button>
               </div>

               {/* Action Item: Wire Funds (Pending) */}
               <div className="bg-white border-2 border-blue-200 shadow-md rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-2 bg-blue-500" />
                  <div className="flex items-center gap-4 pl-4">
                     <div className="flex items-center justify-center w-12 h-12 text-blue-600 bg-blue-100 rounded-full shrink-0">
                       <Landmark size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900">Wire Cash to Close</h3>
                       <p className="text-xs font-semibold text-slate-500 mt-0.5">Funds must be received before your signing appointment.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => { setWireAuthStep(1); setAuthCode(''); setIsWireModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A1128] text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all shrink-0"
                  >
                     <LockKeyhole size={16} /> Get Secure Instructions
                  </button>
               </div>

               {/* Action Item: Schedule Notary (Pending/Completed) */}
               <div className={cn("bg-white border-2 shadow-sm rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden", closingData.status === 'scheduled' ? "border-emerald-100" : "border-orange-200 shadow-md")}>
                  <div className={cn("absolute left-0 top-0 bottom-0 w-2", closingData.status === 'scheduled' ? "bg-emerald-500" : "bg-orange-500")} />
                  <div className="flex items-center gap-4 pl-4">
                     <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", closingData.status === 'scheduled' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600")}>
                       <CalendarClock size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900">
                         {closingData.status === 'scheduled' ? 'Closing Scheduled' : 'Schedule Signing Appointment'}
                       </h3>
                       <p className="text-xs font-semibold text-slate-500 mt-0.5">
                         {closingData.status === 'scheduled' ? `Locked in for ${formatDate(new Date(closingData.timeline.scheduledClose))}` : 'Book a mobile notary or sign at the title office.'}
                       </p>
                     </div>
                  </div>
                  {closingData.status !== 'scheduled' && (
                    <button 
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white text-sm font-bold rounded-xl hover:bg-red-800 shadow-md active:scale-95 transition-all shrink-0"
                    >
                       Book Appointment <ChevronRight size={16} />
                    </button>
                  )}
               </div>

               {/* TIMELINE TRACKER */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8 mt-8">
                  <h3 className="mb-6 text-base font-bold text-slate-900">Federal Closing Timeline</h3>
                  
                  <div className="relative ml-4 space-y-8 border-l-2 border-slate-100">
                     
                     <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                        <h4 className="text-sm font-bold text-slate-900">Closing Disclosure Sent</h4>
                        <p className="text-xs font-medium text-slate-500">{formatDate(new Date(closingData.timeline.cdIssued))}</p>
                     </div>

                     <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                        <h4 className="text-sm font-bold text-slate-900">Borrower Acknowledged & Signed CD</h4>
                        <p className="text-xs font-medium text-slate-500">{formatDate(new Date(closingData.timeline.cdSigned))}</p>
                     </div>

                     <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-50 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-900">Federal 3-Day Cooling-Off Period</h4>
                        <p className="max-w-sm mt-1 text-xs font-medium text-slate-500">By law, you must wait 3 business days after signing the CD before you can legally close on the loan.</p>
                     </div>

                     <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200" />
                        <h4 className="text-sm font-bold text-slate-400">Earliest Allowed Closing Date</h4>
                        <p className="text-xs font-medium text-slate-400">{formatDate(new Date(closingData.timeline.earliestClose))}</p>
                     </div>

                  </div>
               </div>

            </div>

            {/* --- 4. RIGHT: NUMBERS & TEAM COLUMN --- */}
            <div className="space-y-6 lg:col-span-5">
               
               {/* Final Numbers Card */}
               <div className="bg-[#0A1128] border border-slate-800 shadow-xl rounded-[24px] overflow-hidden text-white">
                  <div className="relative p-8 pb-6 overflow-hidden border-b border-slate-800">
                     <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5"><Landmark size={120} className="-mt-10 -mr-10" /></div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Final Cash to Close</p>
                     <h2 className="font-mono text-5xl font-black tracking-tighter drop-shadow-md">
                       {formatCurrency(closingData.cashToClose)}
                     </h2>
                     <p className="mt-3 text-xs font-medium leading-relaxed text-slate-400">
                       This is the exact amount you need to wire to the title company. No cashier's checks are accepted.
                     </p>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-slate-900/50">
                     <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-sm font-medium text-slate-300">Purchase Price</span>
                        <span className="font-mono text-sm font-bold text-white">{formatCurrency(closingData.purchasePrice)}</span>
                     </div>
                     <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-sm font-medium text-slate-300">Base Loan Amount</span>
                        <span className="font-mono text-sm font-bold text-white">{formatCurrency(closingData.loanAmount)}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Earnest Money (Already Paid)</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">-{formatCurrency(15000)}</span>
                     </div>
                  </div>
               </div>

               {/* Title Company Details */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <Building2 size={16} className="text-slate-400" /> Settlement Agent
                  </h3>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{closingData.titleCompany.name}</p>
                          <p className="text-xs text-slate-500">Escrow Officer: {closingData.titleCompany.agent}</p>
                        </div>
                     </div>
                     <div className="p-4 mt-2 space-y-3 border bg-slate-50 rounded-xl border-slate-100">
                        <p className="flex items-center gap-2 text-xs text-slate-700"><MapPin size={14} className="text-slate-400" /> {closingData.titleCompany.address}</p>
                        <p className="flex items-center gap-2 text-xs text-slate-700"><Phone size={14} className="text-slate-400" /> {closingData.titleCompany.phone}</p>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* --- 5. 🟢 SECURE WIRE INSTRUCTIONS MODAL (2FA GATED) --- */}
      {isWireModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsWireModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col min-h-[450px] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                  <LockKeyhole size={20} />
                </div>
                <div><h2 className="text-base font-bold text-slate-900">Secure Wire Vault</h2></div>
              </div>
              <button onClick={() => setIsWireModalOpen(false)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-200"><X size={18} /></button>
            </div>
            
            {wireAuthStep === 1 ? (
              <form className="flex flex-col flex-1 p-6 md:p-8" onSubmit={handleVerify2FA}>
                <div className="mb-8 text-center">
                   <KeyRound size={48} className="mx-auto mb-4 text-blue-500" />
                   <h3 className="text-xl font-bold text-slate-900">Verify your Identity</h3>
                   <p className="px-4 mt-2 text-sm text-slate-500">To prevent wire fraud, we require Two-Factor Authentication to view escrow routing numbers.</p>
                </div>

                <div className="mb-8 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1 text-center block">Enter SMS Code sent to ***-***-4567</label>
                   <input 
                     type="text" required maxLength={6} placeholder="000000" autoFocus
                     value={authCode} onChange={e => setAuthCode(e.target.value.replace(/\D/g, ''))}
                     className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono bg-slate-50"
                   />
                </div>

                <div className="mt-auto">
                  <button type="submit" disabled={authCode.length !== 6} className="w-full text-sm font-bold text-white transition-all bg-blue-600 shadow-md h-14 hover:bg-blue-700 rounded-xl active:scale-95 disabled:opacity-50">
                    Authenticate & Reveal
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col flex-1 p-6 md:p-8 animate-in slide-in-from-right-4">
                 <div className="flex gap-3 p-4 mb-6 text-sm font-medium border bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                    <p>Identity verified. These are the official, certified wiring instructions for your closing.</p>
                 </div>

                 <div className="mb-6 space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Receiving Bank</span>
                      <span className="text-sm font-bold text-right text-slate-900">{closingData.wireDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">ABA / Routing Number</span>
                      <span className="font-mono text-sm font-black text-slate-900">{closingData.wireDetails.routingAba}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Account Number</span>
                      <span className="font-mono text-sm font-black text-slate-900">{closingData.wireDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Beneficiary Name</span>
                      <span className="text-sm font-bold text-right text-slate-900">{closingData.wireDetails.beneficiary}</span>
                    </div>
                    <div className="flex justify-between px-3 py-3 border rounded-lg bg-slate-50 border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Reference / Memo</span>
                      <span className="text-xs font-black text-right text-slate-900">{closingData.wireDetails.reference}</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 mt-auto">
                   <button onClick={() => { addToast('Instructions copied to clipboard', 'success'); setIsWireModalOpen(false); }} className="w-full h-12 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95">
                     Copy Instructions
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 6. 🟢 SCHEDULING MODAL --- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsScheduleModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg"><CalendarClock size={20} /></div>
                <div><h2 className="text-base font-bold text-slate-900">Schedule Signing</h2></div>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-200"><X size={18} /></button>
            </div>
            
            <form className="p-6 space-y-6 md:p-8" onSubmit={handleScheduleClose}>
              
              <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Signing Location</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setScheduleForm({...scheduleForm, type: 'mobile'})}
                      className={cn("flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all", scheduleForm.type === 'mobile' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300 text-slate-500")}
                    >
                      <Car size={24} className="mb-2" />
                      <span className="text-xs font-bold">Mobile Notary</span>
                      <span className="text-[9px] mt-1 text-slate-400">We come to you</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setScheduleForm({...scheduleForm, type: 'office'})}
                      className={cn("flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all", scheduleForm.type === 'office' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300 text-slate-500")}
                    >
                      <Building size={24} className="mb-2" />
                      <span className="text-xs font-bold">Title Office</span>
                      <span className="text-[9px] mt-1 text-slate-400">Sign in person</span>
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Date</label>
                    <input 
                      type="date" required 
                      min={closingData?.timeline.earliestClose.split('T')[0]} // Constrain to 3-day rule
                      value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})}
                      className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-700" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Time</label>
                    <input 
                      type="time" required 
                      value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                      className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-700" 
                    />
                 </div>
              </div>

              {scheduleForm.type === 'mobile' && (
                <div className="flex gap-3 p-4 text-xs font-medium border bg-slate-50 border-slate-200 rounded-xl text-slate-600">
                  <MapPin size={16} className="shrink-0 text-slate-400" />
                  <p>The notary will travel to your property address on file: <br/><strong className="text-slate-800">{closingData?.propertyAddress}</strong></p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-5 py-3 text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={!scheduleForm.date || !scheduleForm.time} className="px-8 py-3 text-sm font-bold text-white bg-[#B91C1C] hover:bg-red-800 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
                   Confirm Appointment
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
    <div className="space-y-6 lg:col-span-7">
      <div className="h-[120px] bg-slate-200 rounded-[24px]" />
      <div className="h-[120px] bg-slate-200 rounded-[24px]" />
      <div className="h-[120px] bg-slate-200 rounded-[24px]" />
      <div className="h-[300px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="space-y-6 lg:col-span-5">
      <div className="h-[280px] bg-slate-200 rounded-[24px]" />
      <div className="h-[180px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);

ClosingHubPage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);