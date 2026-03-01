'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { 
  Settings, Shield, Globe, Landmark, Save, RefreshCw, 
  Lock, Zap, Camera, AlertTriangle, Activity, X
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// EXPLICIT IMPORTS 
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives/Card';

export default function SystemSettingsPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoPreview, setLogoPreview] = useState(null); 
  
  const [config, setConfig] = useState({
    siteName: 'HomeRatesYard', 
    siteEmail: 'admin@homeratesyard.com', 
    platformLogo: null, // 🟢 FIX: Added to state
    maintenance: false,
    twoFactor: true, 
    sessionTimeout: '24h', 
    passwordExpiry: '90', // Stored as string for input editing, parsed on save
    platformFee: '1.5', 
    currency: 'USD', 
    minWithdrawal: '100'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      if (data && Object.keys(data).length > 0) {
        setConfig(prev => ({ ...prev, ...data }));
        // 🟢 FIX: Load existing logo from DB on boot
        if (data.platformLogo) setLogoPreview(data.platformLogo);
      }
    } catch (err) { 
      console.warn("Using default settings. DB fetch returned empty."); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 🟢 FIX: Base64 Logo Processing (End-to-End compatible with Key-Value DB)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      return addToast("File is too large. Maximum size is 2MB.", "error");
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setLogoPreview(base64String);
      setConfig(prev => ({ ...prev, platformLogo: base64String }));
      addToast("Logo staged for upload. Click 'Publish' to save.", "success");
    };
    reader.readAsDataURL(file);
  };

  // 🟢 FIX: Safe Numeric Coercion & Pre-flight Validation
  const validateConfig = () => {
    if (!config.siteName?.trim() || !config.siteEmail?.trim()) {
      addToast("Site Name and Support Email are required.", "error");
      return false;
    }
    
    const fee = Number(config.platformFee);
    const minW = Number(config.minWithdrawal);
    const exp = Number(config.passwordExpiry);

    if (isNaN(fee) || isNaN(minW) || isNaN(exp)) {
      addToast("Financial and Security fields must be valid numbers.", "error");
      return false;
    }

    if (fee < 0 || minW < 0 || exp < 1) {
      addToast("Financial and Security limits cannot be negative or zero.", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateConfig()) return;
    
    setSaving(true);
    try {
      // Ensure we pass clean numbers to the backend
      const payload = {
        ...config,
        platformFee: Number(config.platformFee),
        minWithdrawal: Number(config.minWithdrawal),
        passwordExpiry: Number(config.passwordExpiry)
      };

      await adminService.updateSystemSettings(payload);
      addToast("Platform configuration updated successfully.", "success");
    } catch (err) { 
      addToast(err.message || "Failed to update system settings.", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const tabs = [
    { id: 'general', label: 'Identity', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'finance', label: 'Financial', icon: Landmark }
  ];

  return (
    <RouteGuard allowedRoles={['superadmin', 'admin']}>
      <DashboardLayout role="admin">
        <Head><title>System Settings | HRY Enterprise</title></Head>
        
        {/* Hidden File Input for Logo */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/svg+xml, image/jpeg" 
          onChange={handleLogoUpload} 
        />

        <div className="flex flex-col min-h-screen bg-[#F8FAFC] px-6 py-8 animate-in fade-in duration-500 pb-32">
          
          {config.maintenance && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-100 border border-red-200 rounded-2xl animate-in slide-in-from-top-4">
              <AlertTriangle className="text-red-600 shrink-0" size={24} />
              <div>
                <h4 className="text-sm font-bold text-red-900">Maintenance Mode is ACTIVE</h4>
                <p className="text-xs font-medium text-red-800">All public endpoints are currently returning a 503 status. Only SuperAdmins can bypass this block.</p>
              </div>
            </div>
          )}

          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0A1128] flex items-center gap-3">
                
                System Settings
              </h1>
              <p className="mt-2 font-medium text-slate-500">Global platform configuration and security policies.</p>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loading} className="bg-white shadow-sm">
              <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin text-red-600")} /> Sync DB
            </Button>
          </div>

          <div className="flex gap-8 mb-8 border-b border-slate-200">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn("pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all", activeTab === t.id ? "border-red-600 text-[#0A1128]" : "border-transparent text-slate-400 hover:text-slate-600")}>
                <t.icon size={16}/> {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              
              {activeTab === 'general' && (
                <Card className="shadow-sm border-slate-200 animate-in slide-in-from-left-4">
                  <CardHeader className="p-6 border-b bg-slate-50/50 border-slate-100"><CardTitle className="text-base font-bold">Platform Identity</CardTitle></CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-6 p-6 border border-dashed bg-slate-50 rounded-2xl border-slate-200">
                      
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="relative flex items-center justify-center w-20 h-20 overflow-hidden transition-all bg-white border shadow-sm cursor-pointer rounded-2xl group hover:border-red-300"
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full p-2" />
                        ) : (
                          <Camera size={24} className="transition-colors text-slate-300 group-hover:text-red-500" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-[#0A1128]">Platform Logo</h4>
                        <p className="mt-1 text-xs text-slate-400">PNG or SVG, Max 2MB. Recommended 512x512.</p>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()} className="mt-3 h-8 text-[10px] uppercase font-bold tracking-widest bg-white">Upload New</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                      <Input label="Site Name" value={config.siteName} onChange={e => setConfig({...config, siteName: e.target.value})} required />
                      <Input label="Support Email" type="email" value={config.siteEmail} onChange={e => setConfig({...config, siteEmail: e.target.value})} required />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="shadow-sm border-slate-200 animate-in slide-in-from-left-4">
                  <CardHeader className="p-6 border-b bg-slate-50/50 border-slate-100"><CardTitle className="text-base font-bold">Safety & Compliance</CardTitle></CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-5 border border-red-100 shadow-inner bg-red-50 rounded-xl">
                      <div className="flex items-center gap-3"><Lock className="text-red-600" size={18}/><span className="text-sm font-bold text-red-900">Enforce Multi-Factor Auth (Global)</span></div>
                      <input type="checkbox" checked={config.twoFactor} onChange={e => setConfig({...config, twoFactor: e.target.checked})} className="w-5 h-5 cursor-pointer accent-red-600" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
                      <Select label="Session Timeout" value={config.sessionTimeout} onChange={v => setConfig({...config, sessionTimeout: v})} options={[{label: '12 Hours', value: '12h'}, {label: '24 Hours', value: '24h'}, {label: '7 Days', value: '7d'}]} />
                      {/* 🟢 FIX: Maintained as string state to prevent typing bugs */}
                      <Input label="Password Expiry (Days)" type="number" min="1" value={config.passwordExpiry} onChange={e => setConfig({...config, passwordExpiry: e.target.value})} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'finance' && (
                <Card className="shadow-sm border-slate-200 animate-in slide-in-from-left-4">
                  <CardHeader className="p-6 border-b bg-slate-50/50 border-slate-100"><CardTitle className="text-base font-bold">Wallet & Transaction Defaults</CardTitle></CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Input label="Platform Service Fee (%)" type="number" step="0.1" min="0" value={config.platformFee} onChange={e => setConfig({...config, platformFee: e.target.value})} />
                      <Select label="System Currency" value={config.currency} onChange={v => setConfig({...config, currency: v})} options={[{label: 'USD ($)', value: 'USD'}, {label: 'GBP (£)', value: 'GBP'}, {label: 'EUR (€)', value: 'EUR'}]} />
                    </div>
                    <div className="pt-2">
                       <Input label="Minimum Withdrawal Amount" type="number" min="0" value={config.minWithdrawal} onChange={e => setConfig({...config, minWithdrawal: e.target.value})} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-[#0A1128] text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10"><Zap size={100} /></div>
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-center gap-2 mb-6"><Activity size={16} className="text-red-500"/><h4 className="text-xs font-bold tracking-widest uppercase text-slate-400">System Status</h4></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-bold">Maintenance Mode</span>
                    <button onClick={() => setConfig({...config, maintenance: !config.maintenance})} className={cn("w-14 h-7 rounded-full transition-colors relative shadow-inner", config.maintenance ? "bg-red-600" : "bg-slate-700")}>
                      <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm", config.maintenance ? "left-8" : "left-1")} />
                    </button>
                  </div>
                  
                  <div className="pt-6 space-y-4 border-t border-white/10">
                     <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500"><span>DB Latency</span><span className="text-emerald-400">12ms</span></div>
                     <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-400 w-[85%] h-full animate-pulse" /></div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-4 p-5 border shadow-sm bg-amber-50 rounded-2xl border-amber-200">
                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed">Changes to security and financial policies are logged in the audit trail. Active sessions may be terminated if core auth rules are modified.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 right-0 left-0 lg:left-64 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-end items-center gap-4 z-[40]">
          {/* 🟢 FIX: Added Discard Button to prevent getting stuck with bad unsaved state */}
          <Button variant="ghost" onClick={fetchData} disabled={saving} className="px-6 font-semibold text-slate-500 hover:text-slate-800">
            <X className="mr-2" size={16} /> Discard Changes
          </Button>
          
          <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white h-12 px-10 shadow-lg shadow-red-600/20 font-semibold transition-all active:scale-[0.98]">
            {saving ? <Activity className="mr-2 animate-spin" size={18}/> : <Save className="mr-2" size={18}/>} 
            {saving ? 'Validating & Persisting...' : 'Publish Global Settings'}
          </Button>
        </div>

      </DashboardLayout>
    </RouteGuard>
  );
}