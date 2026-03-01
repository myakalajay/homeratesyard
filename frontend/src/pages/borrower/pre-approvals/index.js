'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { 
  BadgeCheck, Download, Clock, AlertTriangle, 
  FileText, Plus, ShieldCheck, CheckCircle2, 
  RefreshCw, Settings2, X, MapPin, Send, History
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- ENTERPRISE FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));

export default function PreApprovalsPage() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Interaction States
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Data States
  const [letters, setLetters] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  
  // Controlled Form State for Modal
  const [requestForm, setRequestForm] = useState({
    price: '',
    downPayment: '',
    income: '',
    location: ''
  });

  // --- DATA HYDRATION ---
  useEffect(() => {
    setMounted(true);
    const fetchLetters = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate Latency
        
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + 45); 
        
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 100);

        setLetters([
          {
            id: 'PA-8829-XQ',
            status: 'active',
            maxAmount: 550000,
            loanType: 'Conventional 30-Year Fixed',
            downPayment: 110000,
            issueDate: today.toISOString(),
            expiryDate: expiryDate.toISOString(),
            verifiedAssets: true,
            verifiedIncome: true,
            verifiedCredit: true
          },
          {
            id: 'PA-1044-ZT',
            status: 'expired',
            maxAmount: 450000,
            loanType: 'FHA 30-Year Fixed',
            downPayment: 15750,
            issueDate: pastDate.toISOString(),
            expiryDate: new Date(pastDate.setDate(pastDate.getDate() + 90)).toISOString(),
            verifiedAssets: true,
            verifiedIncome: true,
            verifiedCredit: true
          }
        ]);
      } catch (error) {
        addToast('Failed to load secure documents.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLetters();
  }, [addToast]);

  const activeLetter = useMemo(() => letters.find(l => l.status === 'active'), [letters]);
  const historicalLetters = useMemo(() => letters.filter(l => l.status !== 'active'), [letters]);

  const daysRemaining = useMemo(() => {
    if (!activeLetter) return 0;
    const diffTime = Math.abs(new Date(activeLetter.expiryDate) - new Date());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [activeLetter]);

  // --- HANDLERS ---
  const handleDownload = async (amount, isHistory = false) => {
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate PDF Generation
    setIsDownloading(false);
    
    if (isHistory) {
      addToast(`Archived Letter downloaded securely.`, 'success');
    } else {
      addToast(`Secure PDF generated for ${formatCurrency(amount)}.`, 'success');
      setCustomAmount(''); // Clear input on success
    }
  };

  const handleShareAgent = async () => {
    setIsSharing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSharing(false);
    addToast('Secure link emailed to your Real Estate Agent.', 'success');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    
    if (amount > activeLetter.maxAmount) {
      addToast(`Amount cannot exceed your max approval of ${formatCurrency(activeLetter.maxAmount)}.`, 'error');
      return;
    }
    if (amount < 50000) {
      addToast('Minimum allowable offer amount is $50,000.', 'warning');
      return;
    }
    handleDownload(amount);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRequestModalOpen(false);
    setRequestForm({ price: '', downPayment: '', income: '', location: '' }); 
    addToast('Request submitted. Our automated underwriting engine is reviewing your file.', 'success');
  };

  // 🟢 FIX: Safe SSR Hydration check
  if (!mounted) return null;

  // 🟢 FIX: Properly wrapped inside RouteGuard and DashboardLayout to prevent crashes
  return (
    <RouteGuard allowedRoles={['borrower']}>
      <DashboardLayout role="borrower">
        <Head><title>Pre-Approvals | HomeRatesYard</title></Head>

        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- 1. HEADER --- */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                <BadgeCheck className="text-[#B91C1C]" size={32} /> 
                Pre-Approval Center
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Manage your buying power and generate custom offer letters instantly.
              </p>
            </div>
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#B91C1C] rounded-xl hover:bg-red-800 transition-all shadow-md shadow-red-200 active:scale-95 w-full sm:w-auto"
            >
               <Plus size={18} /> Request New Letter
            </button>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : letters.length === 0 ? (
            <ZeroState onAction={() => setIsRequestModalOpen(true)} />
          ) : (
            <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
              
              {/* --- 2. ACTIVE LETTER CERTIFICATE --- */}
              <div className="sticky space-y-6 lg:col-span-8 top-24">
                {activeLetter ? (
                  <div className="flex flex-col bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[24px] overflow-hidden">
                    
                    {/* Digital Certificate Top Banner */}
                    <div className="bg-[#0A1128] p-8 md:p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                        <ShieldCheck size={240} className="-mt-12 -mr-12" />
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 border border-emerald-500/30 bg-emerald-500/10 rounded-full shadow-sm backdrop-blur-md">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Active & Verified</span>
                          </div>
                          <p className="mb-1 text-sm font-medium tracking-wide text-slate-400">Maximum Approved Amount</p>
                          <h2 className="text-5xl font-black tracking-tight text-white md:text-6xl font-display drop-shadow-md">
                            {formatCurrency(activeLetter.maxAmount)}
                          </h2>
                        </div>
                        
                        <div className="w-full p-5 text-left text-white border shadow-inner bg-white/5 backdrop-blur-md border-white/10 rounded-2xl md:w-auto shrink-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Certificate ID</p>
                          <p className="font-mono text-base font-bold tracking-tight">{activeLetter.id}</p>
                          <div className="h-px my-3 bg-white/10" />
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Issued On</p>
                          <p className="font-mono text-sm font-semibold">{formatDate(activeLetter.issueDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Verification & Details */}
                    <div className="p-8 bg-white md:p-10">
                      <div className="grid grid-cols-1 gap-10 pb-10 mb-10 border-b md:grid-cols-2 border-slate-100">
                        
                        {/* Underwriting Flags */}
                        <div>
                          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-5">Underwriting Status</h3>
                          <ul className="space-y-4">
                            <VerificationItem label="Identity & SSN" verified={true} />
                            <VerificationItem label="Credit Profile (Soft Pull)" verified={activeLetter.verifiedCredit} />
                            <VerificationItem label="Income & Employment" verified={activeLetter.verifiedIncome} />
                            <VerificationItem label="Assets & Reserves" verified={activeLetter.verifiedAssets} />
                          </ul>
                        </div>
                        
                        {/* Loan Parameters */}
                        <div>
                          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-5">Loan Parameters</h3>
                          <div className="space-y-5">
                            <div className="flex items-center justify-between pb-3 text-sm border-b border-slate-50">
                              <span className="font-medium text-slate-500">Financing Type</span>
                              <span className="text-slate-900 font-bold text-right max-w-[150px] leading-tight">{activeLetter.loanType}</span>
                            </div>
                            <div className="flex items-center justify-between pb-3 text-sm border-b border-slate-50">
                              <span className="font-medium text-slate-500">Est. Down Payment</span>
                              <span className="font-mono font-bold text-slate-900">{formatCurrency(activeLetter.downPayment)}</span>
                            </div>
                            
                            {/* Expiry Warning Widget */}
                            <div className={cn(
                              "flex justify-between items-center text-sm p-4 rounded-xl border",
                              daysRemaining <= 15 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"
                            )}>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className={daysRemaining <= 15 ? "text-orange-500" : "text-slate-400"} />
                                <span className={cn("font-bold", daysRemaining <= 15 ? "text-orange-700" : "text-slate-700")}>
                                  Expires in {daysRemaining} Days
                                </span>
                              </div>
                              <span className="text-xs font-medium text-slate-500">
                                {formatDate(activeLetter.expiryDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Master Action Buttons */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button 
                          onClick={() => handleDownload(activeLetter.maxAmount)}
                          disabled={isDownloading}
                          className="w-full flex items-center justify-center gap-2 h-14 bg-[#B91C1C] text-white text-sm font-bold rounded-xl hover:bg-red-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                        >
                          {isDownloading ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                          Download Full Max Letter
                        </button>
                        <button 
                          onClick={handleShareAgent}
                          disabled={isSharing}
                          className="w-full flex items-center justify-center gap-2 h-14 bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                          {isSharing ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                          Email to Realtor
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-[24px] shadow-sm">
                     <AlertTriangle size={56} className="mx-auto mb-6 text-orange-400" />
                     <h3 className="text-2xl font-bold text-slate-900">Your Pre-Approval Expired</h3>
                     <p className="max-w-md mx-auto mt-2 mb-8 text-sm leading-relaxed text-slate-500">
                       Mortgage markets change rapidly. To ensure accuracy and protect your buying power, pre-approvals must be renewed every 90 days.
                     </p>
                     <button onClick={() => setIsRequestModalOpen(true)} className="px-8 py-3.5 bg-[#B91C1C] text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform">
                       Renew Pre-Approval Now
                     </button>
                  </div>
                )}
              </div>

              {/* --- 3. RIGHT: CUSTOMIZER & HISTORY --- */}
              <div className="space-y-6 lg:col-span-4">
                
                {/* Feature: Custom Letter Generator */}
                {activeLetter && (
                  <form onSubmit={handleCustomSubmit} className="p-6 md:p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 z-0 w-32 h-32 -mt-16 -mr-16 transition-transform duration-500 rounded-bl-full bg-blue-50/50 group-hover:scale-110" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 text-blue-600 rounded-lg bg-blue-50">
                          <Settings2 size={18} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Custom Offer Letter</h3>
                      </div>
                      <p className="mb-6 text-xs font-medium leading-relaxed text-slate-500">
                        Making an offer below your max? Generate a tailored PDF to protect your negotiation leverage.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="relative group/input">
                          <span className="absolute left-4 top-3.5 text-slate-400 font-bold group-focus-within/input:text-blue-600 transition-colors">$</span>
                          {/* 🟢 FIX: Added strict min and step constraints directly to the input to prevent junk data */}
                          <input 
                            type="number"
                            placeholder="Offer Amount"
                            min="50000"
                            step="1000"
                            max={activeLetter.maxAmount}
                            required
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all bg-white border outline-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={isDownloading || !customAmount}
                          className="w-full h-12 flex items-center justify-center gap-2 bg-[#0A1128] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 active:scale-95"
                        >
                          {isDownloading ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
                          Generate PDF
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* History List */}
                <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col max-h-[600px]">
                  <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
                    <History size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900">Letter Archive</h3>
                  </div>
                  
                  <div className="flex-1 pr-2 space-y-3 overflow-y-auto custom-scrollbar">
                    {historicalLetters.length === 0 ? (
                      <div className="mt-10 text-sm text-center text-slate-400">No archived letters.</div>
                    ) : (
                      historicalLetters.map(letter => (
                        <div key={letter.id} className="p-4 transition-all border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md group">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-mono text-sm font-bold tracking-tight text-slate-800">{formatCurrency(letter.maxAmount)}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Expired</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                             <p className="text-[10px] font-semibold text-slate-500">Issued: {formatDate(letter.issueDate)}</p>
                             <button 
                               onClick={() => handleDownload(letter.maxAmount, true)}
                               className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                               title="Download Archived PDF"
                             >
                               <Download size={14} />
                             </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* --- 4. REQUEST NEW LETTER MODAL (Controlled) --- */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsRequestModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Request Pre-Approval</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" /> Soft pull. No impact to credit score.
                  </p>
                </div>
                <button onClick={() => setIsRequestModalOpen(false)} className="p-2 transition-colors bg-white border rounded-full shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-200 border-slate-200"><X size={18} /></button>
              </div>
              
              <form className="p-6 space-y-6 md:p-8" onSubmit={handleRequestSubmit}>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Est. Purchase Price</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">$</span>
                      <input 
                        type="number" min="0" required 
                        value={requestForm.price} onChange={e => setRequestForm({...requestForm, price: e.target.value})}
                        className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Down Payment</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">$</span>
                      <input 
                        type="number" min="0" required 
                        value={requestForm.downPayment} onChange={e => setRequestForm({...requestForm, downPayment: e.target.value})}
                        className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Annual Gross Income</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" min="0" required 
                      value={requestForm.income} onChange={e => setRequestForm({...requestForm, income: e.target.value})}
                      className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Target Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-4 text-slate-400" />
                    <input 
                      type="text" required placeholder="City or Zip Code" 
                      value={requestForm.location} onChange={e => setRequestForm({...requestForm, location: e.target.value})}
                      className="w-full h-12 pl-10 pr-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-8">
                  <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-5 py-3 text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                  <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-[#B91C1C] hover:bg-red-800 rounded-xl transition-all shadow-md active:scale-95">Submit File</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </DashboardLayout>
    </RouteGuard>
  );
}

// ==========================================
// 🧱 MICRO-COMPONENTS
// ==========================================

const VerificationItem = ({ label, verified }) => (
  <li className="flex items-center justify-between text-sm">
    <span className="flex items-center gap-3 font-semibold text-slate-700">
      {verified ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Clock size={18} className="text-amber-500" />}
      {label}
    </span>
    {verified ? (
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm">Verified</span>
    ) : (
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm">Pending</span>
    )}
  </li>
);

const ZeroState = ({ onAction }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 shadow-sm rounded-[24px] mt-8 py-24">
    <div className="flex items-center justify-center w-24 h-24 mb-6 text-blue-600 rounded-full shadow-inner bg-blue-50 ring-8 ring-blue-50/50">
      <FileText size={40} />
    </div>
    <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">No Pre-Approvals Yet</h2>
    <p className="max-w-lg mb-8 text-sm font-medium leading-relaxed text-slate-500">
      A pre-approval letter is your golden ticket to buying a home. It proves to sellers you are serious and locks in your estimated rates. Request yours today with zero impact to your credit score.
    </p>
    <button onClick={onAction} className="flex items-center gap-2 px-8 py-4 bg-[#B91C1C] text-white font-bold rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-red-200 active:scale-95">
      <Plus size={18} /> Start Free Request
    </button>
  </div>
);

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="lg:col-span-8 h-[600px] bg-slate-200 rounded-[24px]" />
    <div className="space-y-6 lg:col-span-4">
      <div className="h-48 bg-slate-200 rounded-[24px]" />
      <div className="h-[350px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);