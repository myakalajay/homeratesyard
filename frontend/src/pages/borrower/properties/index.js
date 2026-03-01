'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Home, Plus, MapPin, TrendingUp, TrendingDown, Building, 
  Edit, Trash2, Activity, Wallet, ChevronRight, 
  RefreshCw, X, CheckCircle2, AlertTriangle
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// 🟢 FIX: Imported the standard Button primitive
import { Button } from '@/components/ui/primitives/Button';

// --- ENTERPRISE FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));

export default function MyPropertiesPage() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  // --- DB STATE ---
  const [properties, setProperties] = useState([]);
  
  const [formData, setFormData] = useState({
    type: 'Primary Residence',
    address: '',
    zipCode: '',
    estimatedValue: '',
    loanBalance: ''
  });

  useEffect(() => {
    setMounted(true);
    const fetchProperties = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        setProperties([
          {
            id: 'prop-1',
            type: 'Primary Residence',
            address: '123 Pine Retreat Ln',
            zipCode: '78701',
            estimatedValue: 550000,
            originalPurchasePrice: 450000,
            loanBalance: 345000,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'prop-2',
            type: 'Investment Property',
            address: '88 Oak Avenue, Unit 4B',
            zipCode: '98101',
            estimatedValue: 420000,
            originalPurchasePrice: 350000,
            loanBalance: 180000,
            lastUpdated: new Date().toISOString()
          }
        ]);
      } catch (error) {
        addToast('Failed to load portfolio data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [addToast]);

  // --- PORTFOLIO MATH ENGINE ---
  const portfolioStats = useMemo(() => {
    const totalValue = properties.reduce((sum, p) => sum + Number(p.estimatedValue || 0), 0);
    const totalDebt = properties.reduce((sum, p) => sum + Number(p.loanBalance || 0), 0);
    const totalEquity = totalValue - totalDebt;
    const globalLTV = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;
    const isGlobalUnderwater = totalEquity < 0;

    return { totalValue, totalDebt, totalEquity, globalLTV, isGlobalUnderwater };
  }, [properties]);

  // --- ESCAPE KEY HANDLER (UX Polish) ---
  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: 'Primary Residence', address: '', zipCode: '', estimatedValue: '', loanBalance: '' });
  }, [isSubmitting]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  // --- HANDLERS ---
  const handleRefreshAVM = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setProperties(prev => prev.map(p => ({
      ...p,
      // Simulate real estate market fluctuations (-$5k to +$10k)
      estimatedValue: Math.max(0, p.estimatedValue + (Math.random() * 15000 - 5000)), 
      lastUpdated: new Date().toISOString()
    })));
    
    setIsRefreshing(false);
    addToast('Property values successfully synced with live market data.', 'success');
  };

  const openModal = (propToEdit = null) => {
    if (propToEdit) {
      setEditingId(propToEdit.id);
      setFormData({
        type: propToEdit.type,
        address: propToEdit.address,
        zipCode: propToEdit.zipCode,
        estimatedValue: propToEdit.estimatedValue.toString(),
        loanBalance: propToEdit.loanBalance.toString()
      });
    } else {
      setEditingId(null);
      setFormData({ type: 'Primary Residence', address: '', zipCode: '', estimatedValue: '', loanBalance: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const propPayload = {
      type: formData.type,
      address: formData.address,
      zipCode: formData.zipCode,
      estimatedValue: Number(formData.estimatedValue),
      loanBalance: Number(formData.loanBalance),
      lastUpdated: new Date().toISOString()
    };

    if (editingId) {
      setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...propPayload } : p));
      addToast('Property details updated successfully.', 'success');
    } else {
      setProperties([{ id: `prop-${Date.now()}`, originalPurchasePrice: propPayload.estimatedValue, ...propPayload }, ...properties]);
      addToast('New property added to your portfolio.', 'success');
    }

    setIsSubmitting(false);
    closeModal();
  };

  const handleDeleteProperty = (id, address) => {
    if (window.confirm(`Are you sure you want to remove ${address} from tracking? This cannot be undone.`)) {
      setProperties(prev => prev.filter(p => p.id !== id));
      addToast('Property removed from tracking.', 'info');
    }
  };

  // 🟢 FIX: Safe SSR Hydration check
  if (!mounted) return null;

  // 🟢 FIX: Properly wrapped inside RouteGuard and DashboardLayout
  return (
    <RouteGuard allowedRoles={['borrower']}>
      <DashboardLayout role="borrower">
        <Head><title>My Properties | HomeRatesYard</title></Head>

        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- 1. HEADER --- */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                <Home className="text-[#B91C1C]" size={32} /> 
                Real Estate Portfolio
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Track your property values, monitor home equity, and uncover financial opportunities.
              </p>
            </div>
            <div className="flex items-center w-full gap-3 sm:w-auto">
               <Button 
                 variant="outline"
                 onClick={handleRefreshAVM}
                 disabled={isRefreshing || properties.length === 0}
                 className="flex-1 gap-2 h-11 sm:flex-none border-slate-200 text-slate-700"
               >
                 <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} /> 
                 <span className="hidden sm:block">Sync Values</span>
               </Button>
               <Button 
                 onClick={() => openModal()}
                 className="flex-1 gap-2 text-white bg-red-600 shadow-md h-11 hover:bg-red-700 shadow-red-200 sm:flex-none"
               >
                 <Plus size={18} /> Add Property
               </Button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* --- 2. GLOBAL PORTFOLIO STATS --- */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                 <StatCard 
                   title="Total Portfolio Value" 
                   value={formatCurrency(portfolioStats.totalValue)} 
                   icon={Building} 
                   trend="+2.4% this year"
                   theme="blue"
                 />
                 <StatCard 
                   title="Total Mortgage Debt" 
                   value={formatCurrency(portfolioStats.totalDebt)} 
                   icon={Wallet} 
                   subtitle={`${portfolioStats.globalLTV.toFixed(1)}% Global LTV`}
                   theme="orange"
                 />
                 <StatCard 
                   title={portfolioStats.isGlobalUnderwater ? "Underwater Portfolio" : "Total Home Equity"} 
                   value={formatCurrency(Math.abs(portfolioStats.totalEquity))} 
                   icon={portfolioStats.isGlobalUnderwater ? TrendingDown : TrendingUp} 
                   trend={portfolioStats.isGlobalUnderwater ? "Market adjustment needed" : "Ready for Cash-Out"}
                   theme={portfolioStats.isGlobalUnderwater ? "red" : "emerald"}
                   highlight
                   prefix={portfolioStats.isGlobalUnderwater ? "-" : ""}
                 />
              </div>

              {/* --- 3. PROPERTY CARDS GRID --- */}
              {properties.length === 0 ? (
                <ZeroState onAdd={() => openModal()} />
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                   {properties.map(property => (
                      <PropertyCard 
                        key={property.id} 
                        property={property} 
                        onEdit={() => openModal(property)}
                        onDelete={() => handleDeleteProperty(property.id, property.address)}
                      />
                   ))}
                </div>
              )}
            </>
          )}

        </div>

        {/* --- 4. DYNAMIC ADD/EDIT MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSubmitting && closeModal()} />
            <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                    {editingId ? <Edit size={20} /> : <MapPin size={20} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Update Property' : 'Add to Portfolio'}</h2>
                    <p className="text-xs font-medium text-slate-500">{editingId ? 'Modify your tracking details.' : 'Enter details to track valuation.'}</p>
                  </div>
                </div>
                <button disabled={isSubmitting} onClick={closeModal} className="p-2 transition-colors bg-white border rounded-full shadow-sm text-slate-400 hover:bg-slate-200 disabled:opacity-50 border-slate-200"><X size={18} /></button>
              </div>
              
              <form className="p-6 space-y-5 overflow-y-auto md:p-8 custom-scrollbar" onSubmit={handleSaveProperty}>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Property Type</label>
                   <select 
                     required
                     value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                     className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none appearance-none cursor-pointer border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-slate-50"
                   >
                     <option value="Primary Residence">Primary Residence</option>
                     <option value="Investment Property">Investment Property</option>
                     <option value="Second Home">Second Home</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Street Address</label>
                   <input 
                     type="text" required placeholder="e.g. 123 Main St"
                     value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                     className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Zip Code</label>
                   <input 
                     type="text" required placeholder="12345" maxLength={5} pattern="\d*"
                     value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value.replace(/\D/g, '')})}
                     className="w-full h-12 px-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                   />
                </div>

                <div className="h-px my-2 bg-slate-100" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Est. Value</label>
                      <div className="relative group/input">
                        <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold group-focus-within/input:text-emerald-500 transition-colors">$</span>
                        <input 
                          type="number" min="0" required 
                          value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})}
                          className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Current Loan Balance</label>
                      <div className="relative group/input">
                        <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold group-focus-within/input:text-orange-500 transition-colors">$</span>
                        <input 
                          type="number" min="0" required 
                          value={formData.loanBalance} onChange={e => setFormData({...formData, loanBalance: e.target.value})}
                          className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" 
                        />
                      </div>
                   </div>
                </div>

                {/* Dynamic Warning for Underwater input */}
                {Number(formData.loanBalance) > Number(formData.estimatedValue) && Number(formData.estimatedValue) > 0 && (
                   <div className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-700 border border-red-200 bg-red-50 rounded-xl">
                     <AlertTriangle size={16} className="shrink-0" />
                     Loan balance exceeds estimated value (Underwater Property).
                   </div>
                )}

                <div className="flex justify-end gap-3 pt-6 shrink-0">
                  <Button variant="ghost" type="button" disabled={isSubmitting} onClick={closeModal} className="font-bold text-slate-600 h-11">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2 text-white bg-red-600 h-11 hover:bg-red-700">
                     {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                     {isSubmitting ? 'Saving...' : editingId ? 'Update Details' : 'Track Property'}
                  </Button>
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

const StatCard = ({ title, value, icon: Icon, trend, subtitle, theme, highlight, prefix = "" }) => {
  const themes = {
    blue: 'text-blue-600 bg-blue-50',
    orange: 'text-orange-600 bg-orange-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-500 bg-red-50' 
  };

  const highlighThemes = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400'
  };

  return (
    <div className={cn(
      "p-6 rounded-[24px] border relative overflow-hidden transition-all",
      highlight ? "bg-[#0A1128] text-white border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm"
    )}>
      {highlight && <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-10 -mt-10 blur-2xl pointer-events-none", theme === 'red' ? 'bg-red-500/20' : 'bg-emerald-500/10')} />}
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className={cn("text-sm font-bold", highlight ? "text-slate-300" : "text-slate-500")}>{title}</h3>
        <div className={cn("p-2.5 rounded-xl", highlight ? highlighThemes[theme] : themes[theme])}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-[32px] text-red-700 font-bold tracking-tight font-mono">{prefix}{value}</h4>
        {(trend || subtitle) && (
          <p className={cn("text-xs font-semibold mt-2", highlight ? highlighThemes[theme].split(' ')[1] : "text-slate-500")}>
            {trend || subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const equity = property.estimatedValue - property.loanBalance;
  const isUnderwater = equity < 0;
  const equityPercent = property.estimatedValue > 0 ? ((equity / property.estimatedValue) * 100).toFixed(1) : 0;
  
  // UX Logic: Suggest Cash-out Refi if equity is high (> 30%)
  const isRefiCandidate = !isUnderwater && equityPercent >= 30;

  // Dynamic Theme mapping based on Underwater Status
  const EquityIcon = isUnderwater ? TrendingDown : TrendingUp;
  const equityTextColor = isUnderwater ? "text-red-600" : "text-emerald-600";
  const progressBgColor = isUnderwater ? "bg-red-500" : "bg-emerald-500";
  const progressShadow = isUnderwater ? "shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "shadow-[0_0_8px_rgba(16,185,129,0.5)]";

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-[24px] shadow-sm hover:shadow-lg transition-all group overflow-hidden">
       
       <div className="relative w-full h-32 overflow-hidden border-b bg-slate-100 border-slate-100">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="absolute z-20 flex items-end justify-between bottom-4 left-5 right-5">
             <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md mb-2 inline-block">
                  {property.type}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-white truncate">{property.address}</h3>
             </div>
          </div>

          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
             <button onClick={onEdit} className="p-2 transition-colors rounded-lg shadow-sm bg-white/90 backdrop-blur-sm text-slate-700 hover:text-blue-600" title="Edit Property"><Edit size={14} /></button>
             <button onClick={onDelete} className="p-2 transition-colors rounded-lg shadow-sm bg-white/90 backdrop-blur-sm text-slate-700 hover:text-red-600" title="Remove Property"><Trash2 size={14} /></button>
          </div>
       </div>

       <div className="flex flex-col flex-1 p-6">
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Value</p>
                <p className="font-mono text-xl font-black tracking-tight text-slate-900">{formatCurrency(property.estimatedValue)}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Balance</p>
                <p className="font-mono text-xl font-bold tracking-tight text-slate-700">{formatCurrency(property.loanBalance)}</p>
             </div>
          </div>

          <div className="mt-auto mb-8 space-y-2">
             <div className="flex items-center justify-between text-xs font-bold">
               <span className={cn("flex items-center gap-1.5", equityTextColor)}>
                 <EquityIcon size={14} /> 
                 {isUnderwater ? `-${formatCurrency(Math.abs(equity))} Underwater` : `${formatCurrency(equity)} Equity`}
               </span>
               <span className="text-slate-500">{isUnderwater ? '0.0%' : `${equityPercent}%`}</span>
             </div>
             <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", progressBgColor, progressShadow)}
                  style={{ width: isUnderwater ? '0%' : `${Math.min(100, Math.max(0, equityPercent))}%` }}
                />
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100">
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <Activity size={12} /> Sync: {formatDate(property.lastUpdated)}
             </div>
             
             {isRefiCandidate ? (
               <Link href="/borrower/explore?purpose=refinance" className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-blue-600 border border-blue-100 rounded-md hover:text-blue-800 group/link bg-blue-50">
                 Cash-out Refi <ChevronRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
               </Link>
             ) : (
               <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                 {isUnderwater ? <AlertTriangle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-emerald-500" />} 
                 {isUnderwater ? 'Negative Equity' : 'Tracked'}
               </span>
             )}
          </div>
       </div>
    </div>
  );
};

const ZeroState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 shadow-sm rounded-[24px] mt-8 py-24 xl:col-span-3 md:col-span-2">
    <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full shadow-inner bg-slate-50 text-slate-400 ring-8 ring-slate-50/50">
      <Home size={32} />
    </div>
    <h2 className="mb-2 text-2xl font-bold text-slate-900">No Properties Tracked</h2>
    <p className="max-w-md mb-8 text-sm font-medium leading-relaxed text-slate-500">
      Add your primary residence or investment properties to start tracking real-time equity, market values, and cash-out refinance opportunities.
    </p>
    <Button onClick={onAdd} className="h-12 gap-2 px-8 text-white bg-red-600 shadow-md hover:bg-red-700 shadow-red-200">
      <Plus size={18} /> Add Your First Property
    </Button>
  </div>
);

const SkeletonLoader = () => (
  <div className="mt-8 space-y-8 animate-pulse">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="h-[160px] bg-slate-200 rounded-[24px]" />
      <div className="h-[160px] bg-slate-200 rounded-[24px]" />
      <div className="h-[160px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="h-[350px] bg-slate-200 rounded-[24px]" />
      <div className="h-[350px] bg-slate-200 rounded-[24px]" />
      <div className="h-[350px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);