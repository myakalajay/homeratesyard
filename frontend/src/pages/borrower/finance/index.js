'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { 
  Landmark, ShieldCheck, Plus, RefreshCw, AlertCircle, 
  CreditCard, CheckCircle2, X, Lock, TrendingUp, TrendingDown,
  Building, Activity, Unlink, PieChart, DollarSign
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatTime = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(dateString));

// --- MOCK INSTITUTIONS FOR PLAID SIMULATOR ---
const POPULAR_BANKS = [
  { id: 'chase', name: 'Chase', color: 'bg-[#117aca]', text: 'text-white' },
  { id: 'bofa', name: 'Bank of America', color: 'bg-[#e31837]', text: 'text-white' },
  { id: 'wf', name: 'Wells Fargo', color: 'bg-[#d71e28]', text: 'text-white' },
  { id: 'citi', name: 'Citi', color: 'bg-[#003b70]', text: 'text-white' },
  { id: 'capone', name: 'Capital One', color: 'bg-[#004977]', text: 'text-white' },
  { id: 'adp', name: 'ADP Payroll', color: 'bg-[#d0271d]', text: 'text-white' },
];

export default function FinancialProfilePage() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingCredit, setIsRefreshingCredit] = useState(false);
  
  // --- PLAID SIMULATOR STATES ---
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkStep, setLinkStep] = useState(1); 
  const [selectedBank, setSelectedBank] = useState(null);

  // --- DB STATE ---
  const [financialData, setFinancialData] = useState({
    credit: { score: 0, status: '', lastUpdated: '', utilization: 0 },
    income: { monthlyVerified: 0, monthlyStated: 0 },
    connections: [],
    liabilities: []
  });

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setFinancialData({
          credit: { 
            score: 742, 
            status: 'Excellent', 
            lastUpdated: new Date().toISOString(),
            utilization: 12
          },
          income: {
            monthlyVerified: 0,
            monthlyStated: 8500 // User stated income on application
          },
          connections: [
            {
              id: 'conn-1',
              institution: 'Chase',
              type: 'depository',
              accounts: [
                { name: 'Total Checking', mask: 'x4092', balance: 45200 },
                { name: 'Premier Savings', mask: 'x8812', balance: 125000 }
              ],
              lastSync: new Date().toISOString(),
              status: 'active'
            }
          ],
          liabilities: [
            { id: 'liab-1', creditor: 'Toyota Financial', type: 'Auto Loan', balance: 18500, monthlyPayment: 450 },
            { id: 'liab-2', creditor: 'Amex Platinum', type: 'Credit Card', balance: 2100, monthlyPayment: 150 },
            { id: 'liab-3', creditor: 'Navient', type: 'Student Loan', balance: 32000, monthlyPayment: 320 }
          ]
        });
      } catch (error) {
        addToast('Failed to load financial profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // --- DERIVED METRICS (UNDERWRITING MATH) ---
  const totalAssets = useMemo(() => 
    financialData.connections.reduce((sum, conn) => 
      sum + conn.accounts.reduce((accSum, acc) => accSum + acc.balance, 0)
    , 0)
  , [financialData.connections]);

  const totalMonthlyDebt = useMemo(() => 
    financialData.liabilities.reduce((sum, liab) => sum + liab.monthlyPayment, 0)
  , [financialData.liabilities]);

  // Use verified income if available, otherwise fallback to stated income
  const activeIncome = financialData.income.monthlyVerified > 0 ? financialData.income.monthlyVerified : financialData.income.monthlyStated;
  
  // DTI Calculation: (Total Debt / Total Income) * 100
  const dtiRatio = activeIncome > 0 ? ((totalMonthlyDebt / activeIncome) * 100) : 0;
  
  // DTI Risk thresholds (Standard mortgage rules)
  const isDtiHigh = dtiRatio > 43; 
  const isDtiWarning = dtiRatio > 36 && dtiRatio <= 43;

  // --- HANDLERS ---
  const handleGlobalSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFinancialData(prev => ({
      ...prev,
      connections: prev.connections.map(conn => ({ ...conn, lastSync: new Date().toISOString() }))
    }));
    setIsSyncing(false);
    addToast('All financial connections securely synchronized.', 'success');
  };

  const handleRefreshCredit = async () => {
    setIsRefreshingCredit(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFinancialData(prev => ({
      ...prev,
      credit: {
        ...prev.credit,
        score: prev.credit.score + Math.floor(Math.random() * 5), // Slight bump
        lastUpdated: new Date().toISOString()
      }
    }));
    setIsRefreshingCredit(false);
    addToast('Credit profile updated via secure soft pull.', 'success');
  };

  // 🟢 NEW: Unlink Institution Flow
  const handleUnlink = (id, name) => {
    if (window.confirm(`Are you sure you want to disconnect ${name}? We will no longer receive automated balance or deposit updates.`)) {
      setFinancialData(prev => {
        const isPayroll = prev.connections.find(c => c.id === id)?.type === 'payroll';
        return {
          ...prev,
          connections: prev.connections.filter(conn => conn.id !== id),
          // If they remove payroll, wipe the verified income
          income: isPayroll ? { ...prev.income, monthlyVerified: 0 } : prev.income
        };
      });
      addToast(`${name} disconnected and data wiped from active memory.`, 'info');
    }
  };

  // --- PLAID MOCK WORKFLOW ---
  const openLinkModal = () => {
    setLinkStep(1);
    setSelectedBank(null);
    setIsLinkModalOpen(true);
  };

  const handleBankAuthSubmit = async (e) => {
    e.preventDefault();
    setLinkStep(3); 
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isPayroll = selectedBank.id === 'adp';
    const newConnection = {
      id: `conn-${Date.now()}`,
      institution: selectedBank.name,
      type: isPayroll ? 'payroll' : 'depository',
      accounts: [
        { name: isPayroll ? 'Primary Income' : 'Everyday Checking', mask: `x${Math.floor(1000 + Math.random() * 9000)}`, balance: isPayroll ? 0 : Math.floor(Math.random() * 50000) + 5000 }
      ],
      lastSync: new Date().toISOString(),
      status: 'active'
    };

    setFinancialData(prev => ({
      ...prev,
      connections: [newConnection, ...prev.connections],
      // If ADP, simulate fetching a verified monthly gross income
      income: isPayroll ? { ...prev.income, monthlyVerified: 9200 } : prev.income
    }));
    
    setIsLinkModalOpen(false);
    addToast(`${selectedBank.name} securely linked.`, 'success');
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && linkStep !== 3) setIsLinkModalOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [linkStep]);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <>
      <Head><title>Financial Profile | HomeRatesYard</title></Head>

      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <Landmark className="text-[#B91C1C]" size={32} /> 
              Financial Profile
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Manage connected accounts, review liabilities, and monitor your underwriting status.
            </p>
          </div>
          <div className="flex items-center w-full gap-3 sm:w-auto">
             <button 
               onClick={handleGlobalSync}
               disabled={isSyncing || financialData.connections.length === 0}
               className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex-1 sm:flex-none"
             >
                <RefreshCw size={16} className={cn(isSyncing && "animate-spin")} /> 
                <span className="hidden sm:block">Sync Data</span>
             </button>
             <button 
               onClick={openLinkModal}
               className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0A1128] rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 flex-1 sm:flex-none"
             >
                <Plus size={18} /> Link Institution
             </button>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- 2. LEFT: CONNECTED INSTITUTIONS & ASSETS --- */}
            <div className="space-y-6 lg:col-span-8">
               
               {/* 🟢 NEW: Unified Asset & Income Rollup */}
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> Verified Assets</p>
                      <h2 className="font-mono text-3xl font-black tracking-tight text-slate-900">{formatCurrency(totalAssets)}</h2>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5"><DollarSign size={80} className="-mt-4 -mr-4"/></div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        {financialData.income.monthlyVerified > 0 ? <ShieldCheck size={12} className="text-emerald-500"/> : <AlertCircle size={12} className="text-orange-400"/>}
                        {financialData.income.monthlyVerified > 0 ? 'Verified Monthly Income' : 'Stated Monthly Income'}
                      </p>
                      <h2 className="font-mono text-3xl font-black tracking-tight text-slate-900">{formatCurrency(activeIncome)}</h2>
                    </div>
                 </div>
               </div>

               {/* Connections Ledger */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b md:p-8 border-slate-100 bg-slate-50/50">
                     <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                       <Building className="text-blue-600" size={20} /> Linked Accounts
                     </h2>
                  </div>

                  <div className="p-6 space-y-6 md:p-8 bg-slate-50/30">
                     {financialData.connections.length === 0 ? (
                        <div className="py-12 text-center">
                           <Landmark size={48} className="mx-auto mb-4 text-slate-300" />
                           <h3 className="text-base font-bold text-slate-900">No Linked Accounts</h3>
                           <p className="max-w-sm mx-auto mt-1 mb-6 text-sm text-slate-500">Connect your bank or payroll provider to instantly verify your finances and bypass document uploads.</p>
                           <button onClick={openLinkModal} className="px-6 py-2.5 bg-[#B91C1C] text-white font-bold rounded-xl shadow-md text-sm hover:bg-red-800 transition-colors">
                             Securely Connect
                           </button>
                        </div>
                     ) : (
                        financialData.connections.map(conn => (
                           <div key={conn.id} className="relative p-5 transition-shadow bg-white border shadow-sm border-slate-200 rounded-2xl hover:shadow-md group">
                              <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
                                 <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 font-bold border rounded-xl bg-slate-50 border-slate-200 text-slate-500 shrink-0">
                                       <Building size={20} />
                                    </div>
                                    <div>
                                       <h3 className="text-base font-bold leading-tight text-slate-900">{conn.institution}</h3>
                                       <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-1">
                                          <CheckCircle2 size={10} /> Auto-Verified
                                       </span>
                                    </div>
                                 </div>
                                 
                                 {/* 🟢 NEW: Unlink Action */}
                                 <div className="flex flex-col items-end gap-2">
                                    <button 
                                      onClick={() => handleUnlink(conn.id, conn.institution)}
                                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                      title="Unlink Institution"
                                    >
                                      <Unlink size={16} />
                                    </button>
                                    <p className="text-[10px] font-semibold text-slate-400">Sync: {formatTime(conn.lastSync)}</p>
                                 </div>
                              </div>
                              
                              <div className="space-y-3">
                                 {conn.accounts.map((acc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border bg-slate-50 rounded-xl border-slate-100">
                                       <div>
                                          <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                                          <p className="text-xs text-slate-500 font-mono mt-0.5">•••• {acc.mask}</p>
                                       </div>
                                       {conn.type === 'depository' ? (
                                         <span className="font-mono font-bold text-slate-900">{formatCurrency(acc.balance)}</span>
                                       ) : (
                                         <span className="px-2 py-1 text-xs font-bold rounded text-emerald-600 bg-emerald-50">Payroll Active</span>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

            </div>

            {/* --- 3. RIGHT: CREDIT & LIABILITIES (UNDERWRITING METRICS) --- */}
            <div className="space-y-6 lg:col-span-4">
               
               {/* 🟢 NEW: DTI Engine Widget */}
               <div className={cn(
                 "bg-white border shadow-sm rounded-[24px] p-6 relative overflow-hidden transition-colors",
                 isDtiHigh ? "border-red-300" : isDtiWarning ? "border-orange-300" : "border-slate-200"
               )}>
                  <div className="relative z-10 flex items-center justify-between mb-4">
                     <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                       <PieChart size={18} className={isDtiHigh ? "text-red-500" : "text-blue-500"} /> Debt-to-Income (DTI)
                     </h3>
                  </div>
                  
                  <div className="relative z-10 flex items-end justify-between">
                     <div>
                       <h4 className={cn("text-4xl font-black tracking-tighter font-mono", isDtiHigh ? "text-red-600" : "text-slate-900")}>
                         {dtiRatio.toFixed(1)}%
                       </h4>
                       <p className={cn("text-xs font-bold mt-1", isDtiHigh ? "text-red-600" : isDtiWarning ? "text-orange-600" : "text-emerald-600")}>
                         {isDtiHigh ? 'Exceeds limits' : isDtiWarning ? 'Action recommended' : 'Healthy ratio'}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Monthly Debt</p>
                       <p className="font-mono text-sm font-bold text-slate-900">{formatCurrency(totalMonthlyDebt)}</p>
                     </div>
                  </div>

                  {/* DTI Progress Bar */}
                  <div className="flex w-full h-2 mt-6 overflow-hidden rounded-full bg-slate-100">
                     <div className="h-full bg-emerald-500" style={{ width: '36%' }} />
                     <div className="h-full bg-orange-400" style={{ width: '7%' }} />
                     <div className="h-full bg-red-500" style={{ width: '57%' }} />
                  </div>
                  {/* Indicator Pip */}
                  <div className="relative w-full h-3">
                     <div className="absolute top-0 w-1 h-3 transition-all duration-1000 border border-white rounded-full shadow bg-slate-900" style={{ left: `clamp(0%, ${dtiRatio}%, 100%)` }} />
                  </div>
               </div>

               {/* Credit Profile Widget */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="text-sm font-bold text-slate-900">Credit Profile</h3>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 shadow-sm px-2 py-1 rounded">Soft Pull</span>
                  </div>
                  
                  <div className="relative p-6 overflow-hidden text-center">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 border-[24px] border-emerald-50 rounded-full -mt-20 z-0" />
                     <div className="relative z-10 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">FICO® Score 8</p>
                        <h4 className="text-6xl font-black tracking-tighter text-emerald-600 drop-shadow-sm">{financialData.credit.score}</h4>
                        
                        <div className="flex flex-col items-center gap-2 mt-4">
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                              <TrendingUp size={12} className="text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-700">{financialData.credit.status}</span>
                           </div>
                           {/* 🟢 NEW: Explicit Refresh Credit Action */}
                           <button 
                             onClick={handleRefreshCredit}
                             disabled={isRefreshingCredit}
                             className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 mt-2"
                           >
                             <RefreshCw size={10} className={cn(isRefreshingCredit && "animate-spin")} />
                             {isRefreshingCredit ? 'Pulling Data...' : `Last updated: ${formatTime(financialData.credit.lastUpdated)}`}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 🟢 UPGRADED: Liabilities Widget (Focused on Monthly Payment) */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                       <CreditCard size={18} className="text-slate-400" /> Discovered Liabilities
                     </h3>
                  </div>

                  <div className="space-y-3">
                     {financialData.liabilities.map(liab => (
                        <div key={liab.id} className="flex items-center justify-between p-4 transition-colors border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-slate-300 group">
                           <div>
                              <p className="text-sm font-bold text-slate-900">{liab.creditor}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{liab.type}</p>
                           </div>
                           <div className="text-right">
                              {/* Emphasize Monthly Payment for Underwriting UX */}
                              <p className="text-sm font-black text-[#B91C1C] font-mono group-hover:scale-105 transition-transform origin-right">
                                {formatCurrency(liab.monthlyPayment)}<span className="text-[10px] text-slate-400 font-sans">/mo</span>
                              </p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Bal: {formatCurrency(liab.balance)}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* --- 4. PLAID-STYLE INSTITUTION LINK MODAL --- */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-in fade-in" onClick={() => linkStep !== 3 && setIsLinkModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 shrink-0">
               <div className="flex items-center gap-2 font-bold text-slate-900">
                 <ShieldCheck size={20} className="text-emerald-500" /> Secure Connection
               </div>
               {linkStep !== 3 && (
                 <button onClick={() => setIsLinkModalOpen(false)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-100"><X size={18} /></button>
               )}
            </div>

            {/* STEP 1: SELECT INSTITUTION */}
            {linkStep === 1 && (
              <div className="flex flex-col flex-1 p-6 pt-0 animate-in slide-in-from-right-4">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Select your institution</h2>
                <p className="mb-6 text-sm leading-relaxed text-slate-500">HomeRatesYard uses bank-level encryption to securely verify your accounts. We never store your credentials.</p>
                
                <div className="grid flex-1 grid-cols-2 gap-3 pb-4 overflow-y-auto custom-scrollbar">
                  {POPULAR_BANKS.map(bank => (
                    <button 
                      key={bank.id}
                      onClick={() => { setSelectedBank(bank); setLinkStep(2); }}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl transition-all shadow-sm active:scale-95 group",
                        bank.color, bank.text,
                        "hover:shadow-lg hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                      )}
                    >
                      <Building size={28} className="mb-3 transition-transform opacity-90 group-hover:scale-110" />
                      <span className="text-xs font-bold text-center">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: AUTHENTICATE */}
            {linkStep === 2 && selectedBank && (
              <div className="flex flex-col flex-1 p-6 pt-0 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0", selectedBank.color, selectedBank.text)}>
                    <Building size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold leading-tight text-slate-900">Connect to {selectedBank.name}</h2>
                    <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-0.5"><Lock size={12} /> Encrypted Tokenization</p>
                  </div>
                </div>
                
                <form onSubmit={handleBankAuthSubmit} className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">User ID</label>
                    <input type="text" required className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                    <input type="password" required className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50" />
                  </div>

                  <div className="pt-6 mt-auto">
                    <button type="submit" className="w-full h-12 flex items-center justify-center gap-2 bg-[#0A1128] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
                       Secure Login
                    </button>
                    <button type="button" onClick={() => setLinkStep(1)} className="w-full py-2 mt-3 text-xs font-bold transition-colors text-slate-500 hover:text-slate-800">
                       &larr; Choose a different bank
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: SYNCING / LOADING */}
            {linkStep === 3 && (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center animate-in fade-in zoom-in-95">
                 <div className="relative mb-6">
                    <div className="flex items-center justify-center w-20 h-20 border-4 rounded-full border-slate-100">
                       <RefreshCw size={32} className="text-blue-600 animate-spin" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-sm">
                      <ShieldCheck size={20} className="text-emerald-500" />
                    </div>
                 </div>
                 <h2 className="mb-2 text-xl font-bold text-slate-900">Establishing Secure Link</h2>
                 <p className="text-sm text-slate-500">Handshaking with {selectedBank?.name}. This usually takes a few seconds.</p>
              </div>
            )}

            {/* Global Modal Footer Trust Banner */}
            {linkStep !== 3 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                <span className="flex items-center gap-1"><Lock size={12} /> Private</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye size={12} /> Read-Only</span>
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
}

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="space-y-6 lg:col-span-8">
      <div className="h-[120px] bg-slate-200 rounded-[24px]" />
      <div className="h-[400px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="space-y-6 lg:col-span-4">
      <div className="h-[180px] bg-slate-200 rounded-[24px]" />
      <div className="h-[250px] bg-slate-200 rounded-[24px]" />
      <div className="h-[250px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);

FinancialProfilePage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);