'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { 
  Settings, Globe, Percent, ShieldAlert, 
  Database, Save, RefreshCw, Activity, 
  CreditCard, Link as LinkIcon, Eye, EyeOff,
  History, RotateCcw, ShieldCheck
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';

export default function PlatformSettings() {
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeys, setShowApiKeys] = useState(false);

  // --- SETTINGS STATE ---
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null); // For "Undo" capability

  // --- 1. DATA HYDRATION ---
  const fetchSettings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      // Simulate API fetch
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = {
        general: {
          platformName: 'HomeRatesYard',
          supportEmail: 'support@homeratesyard.com',
          maintenanceMode: false,
          betaFeatures: true,
        },
        rates: {
          fixed30: '6.50',
          fixed15: '5.85',
          arm51: '6.10',
          fha: '6.25',
          va: '5.99'
        },
        underwriting: {
          minCreditScore: 620,
          maxDti: 50,
          maxLtv: 97,
          minLoanAmount: 50000,
          maxLoanAmount: 2500000
        },
        integrations: {
          plaidApiKey: '',
          stripeSecret: '',
        },
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: 'SuperAdmin'
        }
      };
      setSettings(mockData);
      setOriginalSettings(JSON.parse(JSON.stringify(mockData)));
      if (isRefresh) addToast('System configuration refreshed', 'success');
    } catch (error) {
      addToast('Critical: Failed to sync configuration nodes', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, [fetchSettings]);

  // --- 2. LOGIC HANDLERS ---
  const handleNestedChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleReset = () => {
    if (window.confirm("Undo all unsaved changes?")) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      addToast('Changes rolled back to last stable state', 'info');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API Save
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      addToast('Platform configuration synchronized globally', 'success');
    } catch (error) {
      addToast('Protocol Error: Changes rejected by registry', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50/50" />;

  return (
    <>
      <Head><title>System Config | HomeRatesYard Enterprise</title></Head>

      <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- EXECUTIVE BANNER --- */}
        <div className="relative overflow-hidden bg-[#0A1128] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl border border-slate-800 mt-2">
           <div className="absolute inset-0 pointer-events-none opacity-5">
              <Settings size={400} className="absolute text-white rotate-45 -right-20 -bottom-20 animate-spin-slow" />
           </div>

           <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Database size={14} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">System Registry</span>
                 </div>
                 <h1 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl">Platform Settings</h1>
                 <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5"><History size={14} /> Last Modified: {new Date(settings?.metadata?.lastModified).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="flex items-center gap-1.5"><User size={14} /> Root Access</span>
                 </div>
              </div>

              {/* 🟢 UPGRADED: High-Visibility Save Action Bar */}
              <div className="flex flex-wrap items-center w-full gap-3 sm:w-auto">
                 <button 
                   onClick={handleReset}
                   className="flex items-center justify-center h-12 gap-2 px-5 text-xs font-bold text-white transition-all border bg-white/5 border-white/10 rounded-2xl hover:bg-white/10 active:scale-95"
                 >
                    <RotateCcw size={16} />
                    Undo
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={isSaving || loading}
                   className="flex items-center justify-center gap-2 px-8 h-12 text-sm font-bold transition-all bg-red-600 shadow-lg shadow-red-600/20 text-white rounded-2xl hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                 >
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    {isSaving ? 'Syncing...' : 'Apply Config'}
                 </button>
              </div>
           </div>
        </div>

        {loading || !settings ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* NAVIGATION SIDEBAR */}
            <div className="lg:col-span-3">
               <div className="sticky p-2 bg-white border shadow-sm top-24 rounded-3xl border-slate-200">
                  <nav className="flex flex-col gap-1">
                     <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Globe} label="Platform Core" />
                     <TabButton active={activeTab === 'rates'} onClick={() => setActiveTab('rates')} icon={Percent} label="Market Rates" />
                     <TabButton active={activeTab === 'underwriting'} onClick={() => setActiveTab('underwriting')} icon={Activity} label="Risk Limits" />
                     <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={LinkIcon} label="Integrations" />
                  </nav>
               </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-9">
               <div className="p-6 bg-white border shadow-sm sm:p-10 rounded-[2.5rem] border-slate-200 min-h-[550px] flex flex-col">
                  
                  {/* --- TAB: CORE --- */}
                  {activeTab === 'general' && (
                    <div className="space-y-8 duration-300 animate-in fade-in slide-in-from-right-2">
                       <SectionHeader title="General Configuration" desc="Core platform branding and maintenance controls." />
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <InputGroup label="Platform Display Name" value={settings.general.platformName} onChange={(e) => handleNestedChange('general', 'platformName', e.target.value)} />
                          <InputGroup label="Admin Support Routing" type="email" value={settings.general.supportEmail} onChange={(e) => handleNestedChange('general', 'supportEmail', e.target.value)} />
                       </div>
                       <div className="space-y-4">
                          <ToggleCard 
                            title="Maintenance Protocol"
                            desc="Locks out all users except Super Admins. Use only for emergency hotfixes."
                            active={settings.general.maintenanceMode}
                            onToggle={() => handleNestedChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                            danger
                          />
                          <ToggleCard 
                            title="Advanced AI Underwriting (Beta)"
                            desc="Enable experimental automated document analysis for new loan files."
                            active={settings.general.betaFeatures}
                            onToggle={() => handleNestedChange('general', 'betaFeatures', !settings.general.betaFeatures)}
                          />
                       </div>
                    </div>
                  )}

                  {/* --- TAB: MARKET RATES --- */}
                  {activeTab === 'rates' && (
                    <div className="space-y-8 duration-300 animate-in fade-in slide-in-from-right-2">
                       <SectionHeader title="Base Interest Rates" desc="platform-wide base rates used for public-facing calculators." />
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <RateInput label="30Y Fixed Standard" value={settings.rates.fixed30} onChange={(e) => handleNestedChange('rates', 'fixed30', e.target.value)} />
                          <RateInput label="15Y Fixed Standard" value={settings.rates.fixed15} onChange={(e) => handleNestedChange('rates', 'fixed15', e.target.value)} />
                          <RateInput label="5/1 ARM Conventional" value={settings.rates.arm51} onChange={(e) => handleNestedChange('rates', 'arm51', e.target.value)} />
                          <RateInput label="FHA Standard" value={settings.rates.fha} onChange={(e) => handleNestedChange('rates', 'fha', e.target.value)} />
                          <RateInput label="VA High-Credit" value={settings.rates.va} onChange={(e) => handleNestedChange('rates', 'va', e.target.value)} />
                       </div>
                    </div>
                  )}

                  {/* --- TAB: UNDERWRITING --- */}
                  {activeTab === 'underwriting' && (
                    <div className="space-y-8 duration-300 animate-in fade-in slide-in-from-right-2">
                       <SectionHeader title="Risk Management" desc="Hard constraints that trigger automatic manual review flags." />
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                          <InputGroup type="number" label="Min Credit Score" value={settings.underwriting.minCreditScore} onChange={(e) => handleNestedChange('underwriting', 'minCreditScore', e.target.value)} />
                          <InputGroup type="number" label="Max DTI Ratio (%)" value={settings.underwriting.maxDti} onChange={(e) => handleNestedChange('underwriting', 'maxDti', e.target.value)} />
                          <InputGroup type="number" label="Max LTV Ratio (%)" value={settings.underwriting.maxLtv} onChange={(e) => handleNestedChange('underwriting', 'maxLtv', e.target.value)} />
                       </div>
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <CurrencyInput label="Asset Floor Limit" value={settings.underwriting.minLoanAmount} onChange={(e) => handleNestedChange('underwriting', 'minLoanAmount', e.target.value)} />
                          <CurrencyInput label="Asset Ceiling Limit" value={settings.underwriting.maxLoanAmount} onChange={(e) => handleNestedChange('underwriting', 'maxLoanAmount', e.target.value)} />
                       </div>
                    </div>
                  )}

                  {/* --- TAB: INTEGRATIONS --- */}
                  {activeTab === 'integrations' && (
                    <div className="space-y-8 duration-300 animate-in fade-in slide-in-from-right-2">
                       <div className="flex items-center justify-between">
                         <SectionHeader title="API Access Keys" desc="Sensitive credential management for 3rd party services." />
                         <button type="button" onClick={() => setShowApiKeys(!showApiKeys)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-95">
                           {showApiKeys ? <EyeOff size={14} /> : <Eye size={14} />}
                           {showApiKeys ? 'Obfuscate' : 'Reveal Credentials'}
                         </button>
                       </div>
                       <div className="space-y-6">
                          <InputGroup type={showApiKeys ? "text" : "password"} label="Plaid Environment Secret" value={settings.integrations.plaidApiKey} onChange={(e) => handleNestedChange('integrations', 'plaidApiKey', e.target.value)} />
                          <InputGroup type={showApiKeys ? "text" : "password"} label="Stripe Production API Key" value={settings.integrations.stripeSecret} onChange={(e) => handleNestedChange('integrations', 'stripeSecret', e.target.value)} />
                       </div>
                    </div>
                  )}

               </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ==========================================
// 🧱 ATOMS & REUSABLE ELEMENTS
// ==========================================

const SectionHeader = ({ title, desc }) => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
    <p className="mt-1 text-sm font-medium text-slate-500">{desc}</p>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-4 text-sm font-bold rounded-2xl transition-all",
      active ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon size={18} className={cn("transition-colors", active ? "text-red-500" : "text-slate-400")} />
    {label}
  </button>
);

const InputGroup = ({ label, type = "text", value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      className="w-full h-12 px-4 font-mono text-sm font-bold transition-all bg-white border shadow-sm outline-none text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
    />
  </div>
);

const RateInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <input 
        type="number" step="0.01" min="0" value={value} onChange={onChange}
        className="w-full h-12 pl-4 font-mono text-sm font-bold transition-all bg-white border shadow-sm outline-none pr-11 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-red-500">
        <Percent size={14} strokeWidth={3} />
      </div>
    </div>
  </div>
);

const CurrencyInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 font-mono font-bold pointer-events-none text-slate-400 group-focus-within:text-red-500">$</div>
      <input 
        type="number" min="0" value={value} onChange={onChange}
        className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all bg-white border shadow-sm outline-none text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
      />
    </div>
  </div>
);

const ToggleCard = ({ title, desc, active, onToggle, danger }) => (
  <div className={cn(
    "flex items-center justify-between p-6 transition-colors bg-white border rounded-3xl",
    danger && active ? "border-red-200 bg-red-50/20 shadow-inner" : "border-slate-200 hover:border-slate-300"
  )}>
    <div className="pr-6">
      <h4 className={cn("text-sm font-bold uppercase tracking-tight", danger && active ? "text-red-700" : "text-slate-900")}>{title}</h4>
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{desc}</p>
    </div>
    <button 
      type="button" onClick={onToggle}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        active ? (danger ? "bg-red-600 shadow-lg shadow-red-200" : "bg-emerald-500 shadow-lg shadow-emerald-200") : "bg-slate-200"
      )}
    >
      <span className={cn("pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200", active ? "translate-x-5" : "translate-x-0")} />
    </button>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-48 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
         <RefreshCw size={48} className="text-slate-200 animate-spin" />
         <Settings size={20} className="absolute inset-0 m-auto text-red-500 animate-pulse" />
      </div>
      <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Decrypting Registry</p>
    </div>
  </div>
);

PlatformSettings.getLayout = (page) => (
  <RouteGuard allowedRoles={['superadmin', 'super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);