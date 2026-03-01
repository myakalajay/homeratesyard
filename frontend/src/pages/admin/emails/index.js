'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Mail, Settings, LayoutTemplate, Save, 
  RefreshCw, Send, Edit, Code, Search,
  CheckCircle, ChevronRight, Activity, AlertCircle, 
  Shield, Eye, Smartphone, Monitor, Info
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// UI Primitives
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Badge } from '@/components/ui/primitives/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/primitives/Card';
import { Select } from '@/components/ui/primitives/Select'; 

export default function EmailAutomationPage() {
  const { addToast } = useToast();
  
  // Page State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false); 
  const [activeTab, setActiveTab] = useState('config'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [settings, setSettings] = useState({ 
    provider: 'brevo', fromName: '', fromEmail: '', smtpUser: '', smtpPass: '' 
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchEmailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmailData = async () => {
    setLoading(true); 
    try {
      const [settingsRes, templatesRes] = await Promise.all([
        adminService.getEmailSettings(), 
        adminService.getEmailTemplates()
      ]);
      
      setSettings({
        provider: settingsRes?.provider || 'brevo',
        fromName: settingsRes?.fromName || '',
        fromEmail: settingsRes?.fromEmail || '',
        smtpUser: settingsRes?.smtpUser || '',
        smtpPass: settingsRes?.smtpPass || ''
      });
      
      setTemplates(Array.isArray(templatesRes) ? templatesRes : (templatesRes?.data || []));
    } catch (err) {
      addToast("Connection to mail server interrupted. Check backend logs.", "error");
    } finally { setLoading(false); }
  };

  // Search/Filter Logic
  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => 
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tpl.triggerType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, templates]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await adminService.updateEmailSettings(settings);
      addToast("SMTP configuration securely persisted to disk.", "success");
    } catch (err) {
      addToast(err.message || "Failed to save configuration.", "error");
    } finally { setIsSaving(false); }
  };

  const handleTestEmail = async () => {
    if (!settings.fromEmail) {
      addToast("Recipient email is required for diagnostic test.", "warning");
      return;
    }
    setIsTesting(true);
    try {
      const res = await adminService.sendTestEmail({ 
        testEmail: settings.fromEmail, 
        provider: settings.provider 
      });
      addToast(res?.message || `Diagnostic email dispatched!`, "success");
    } catch (err) {
      addToast("SMTP routing failed. Verify your .env credentials.", "error");
    } finally { setIsTesting(false); }
  };

  return (
    <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
      <DashboardLayout role="admin">
        <Head><title>Email Automation | HRY Enterprise</title></Head>

        <div className="flex flex-col min-h-screen bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg shadow-sm">
                  <Mail className="text-white" size={18} />
                </div>
                <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">Email Automation</h1>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Manage transactional triggers, filesystem templates, and SMTP routing.
              </p>
            </div>
            <Button variant="outline" onClick={fetchEmailData} disabled={loading} className="gap-2 text-[#0A1128] shadow-sm bg-white">
              <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-400"} />
              Sync Engine
            </Button>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-6 mb-6 border-b border-slate-200">
            <button onClick={() => setActiveTab('config')} className={cn("pb-4 text-sm font-bold transition-all border-b-2", activeTab === 'config' ? "border-[#0A1128] text-[#0A1128]" : "border-transparent text-slate-400 hover:text-slate-600")}>
              <div className="flex items-center gap-2"><Settings size={16} /> SMTP & Routing</div>
            </button>
            <button onClick={() => setActiveTab('templates')} className={cn("pb-4 text-sm font-bold transition-all border-b-2", activeTab === 'templates' ? "border-[#0A1128] text-[#0A1128]" : "border-transparent text-slate-400 hover:text-slate-600")}>
              <div className="flex items-center gap-2"><LayoutTemplate size={16} /> Templates</div>
            </button>
          </div>

          {/* TAB: Configuration */}
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 gap-6 duration-300 lg:grid-cols-3 animate-in fade-in">
              <Card className="overflow-visible lg:col-span-2">
                <CardHeader className="border-b bg-slate-50/50 border-slate-100">
                  <CardTitle className="text-base text-[#0A1128]">Mail Server Routing</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Select label="Service Provider" value={settings.provider} onChange={(val) => setSettings({ ...settings, provider: val })} options={[
                        { label: "Brevo SMTP (Recommended)", value: "brevo" },
                        { label: "Mailjet SMTP", value: "mailjet" },
                        { label: "SendGrid API", value: "sendgrid" },
                      ]} 
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 pt-4 border-t sm:grid-cols-2 border-slate-100">
                    <Input label="SMTP Server Login" value={settings.smtpUser} onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} />
                    <Input label="SMTP Password (Key)" type="password" value={settings.smtpPass} onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-6 pt-4 border-t sm:grid-cols-2 border-slate-100">
                    <Input label="Default 'From' Name" value={settings.fromName} onChange={(e) => setSettings({ ...settings, fromName: e.target.value })} />
                    <Input label="Default 'From' Email" value={settings.fromEmail} onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-6 border-t bg-slate-50 border-slate-100 rounded-b-2xl">
                  <Button variant="outline" onClick={handleTestEmail} disabled={isTesting} className="gap-2 bg-white text-slate-700">
                    {isTesting ? <Activity size={14} className="animate-spin" /> : <Send size={14} />} Dispatch Test
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2 text-white bg-red-600 shadow-sm hover:bg-red-700">
                    {isSaving ? <Activity size={14} className="animate-spin" /> : <Save size={14} />} Save Configuration
                  </Button>
                </CardFooter>
              </Card>

              <div className="lg:col-span-1">
                 <div className="relative flex flex-col h-full p-8 overflow-hidden text-white shadow-xl bg-gradient-to-br from-[#0A1128] to-[#1A2C5B] rounded-2xl">
                    <Shield className="mb-6 text-red-400" size={32} />
                    <h3 className="mb-2 text-xl font-bold">Enterprise Grade Delivery</h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-300">
                      Automated communications are secured by AES-256 encryption and routed through high-deliverability SMTP relays.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: Template List */}
          {activeTab === 'templates' && (
            <div className="space-y-4 duration-500 animate-in fade-in">
               {/* Search Bar */}
               <div className="flex items-center gap-4 p-3 bg-white border shadow-sm rounded-2xl border-slate-200">
                  <div className="relative flex-1">
                    <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search templates by name or trigger..." 
                      className="w-full py-2 pl-10 pr-4 text-sm font-medium transition-all border-none outline-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-red-500/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Badge className="px-3 py-1 border-none bg-slate-100 text-slate-600">{filteredTemplates.length} Templates Found</Badge>
               </div>

               <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-[#FBFCFD] border-b border-slate-100">
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <th className="p-6">Event Trigger</th>
                        <th className="p-6">Subject Line</th>
                        <th className="p-6 text-center">Status</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTemplates.map((tpl) => (
                        <tr key={tpl.id} className="transition-all hover:bg-slate-50 group">
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-[#0A1128]">{tpl.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{tpl.triggerType}</span>
                            </div>
                          </td>
                          <td className="p-6"><p className="max-w-sm text-sm font-medium truncate text-slate-600">{tpl.subject}</p></td>
                          <td className="p-6 text-center">
                            <Badge variant={tpl.isActive ? "success" : "secondary"}>{tpl.isActive ? 'Active' : 'Disabled'}</Badge>
                          </td>
                          <td className="p-6 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(tpl)} className="gap-2 text-slate-500 hover:text-[#0A1128]">
                              <Edit size={14} /> Open Builder
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Builder Drawer Overlay */}
        <TemplateEditorDrawer 
          isOpen={!!selectedTemplate} 
          onClose={() => { setSelectedTemplate(null); fetchEmailData(); }} 
          template={selectedTemplate} 
        />
      </DashboardLayout>
    </RouteGuard>
  );
}

// ==========================================
// 🎨 TEMPLATE BUILDER WITH DUAL PREVIEW
// ==========================================
function TemplateEditorDrawer({ isOpen, onClose, template }) {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('code'); 
  const [previewDevice, setPreviewDevice] = useState('desktop'); 
  const [formData, setFormData] = useState({ subject: '', htmlBody: '' });

  useEffect(() => {
    if (template) setFormData({ subject: template.subject || '', htmlBody: template.htmlBody || '' });
  }, [template]);

  if (!template) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminService.updateEmailTemplate(template.id, formData);
      addToast("Changes successfully written to server filesystem.", "success");
      onClose();
    } catch (err) { 
      addToast("Write error: Verify filesystem permissions.", "error"); 
    } finally { setIsSaving(false); }
  };

  const getAvailableVariables = (type) => {
    const common = ['{{user_name}}', '{{action_url}}', '{{current_year}}'];
    if (type?.includes('loan')) return [...common, '{{loan_amount}}', '{{loan_id}}', '{{interest_rate}}'];
    return common;
  };

  const generatePreview = () => {
    return formData.htmlBody
      .replace(/{{user_name}}/g, '<strong>Alex Borrower</strong>')
      .replace(/{{loan_amount}}/g, '<strong>$450,000</strong>')
      .replace(/{{action_url}}/g, '#')
      .replace(/{{current_year}}/g, new Date().getFullYear());
  };

  return (
    <>
      <div className={cn("fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      
      <div className={cn("fixed inset-y-0 right-0 w-full max-w-5xl bg-[#F8FAFC] shadow-2xl z-[101] transition-transform duration-500 flex flex-col border-l border-slate-200", isOpen ? "translate-x-0" : "translate-x-full")}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-slate-100"><LayoutTemplate className="text-slate-600" size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1128] leading-none">Email Builder: {template.name}</h2>
              <p className="mt-1 text-[10px] font-bold tracking-widest uppercase text-slate-400">{template.triggerType}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100"><ChevronRight size={20} /></Button>
        </div>

        {/* Drawer Body */}
        <div className="flex flex-1 gap-6 p-6 overflow-hidden">
          
          {/* Main Workspace */}
          <div className="flex flex-col flex-1 space-y-4 overflow-hidden">
            <div className="p-4 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
               <Input label="Subject Line" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
               
               <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button onClick={() => setViewMode('code')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition-all", viewMode === 'code' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                      <Code size={14}/> Source Editor
                    </button>
                    <button onClick={() => setViewMode('preview')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition-all", viewMode === 'preview' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                      <Eye size={14}/> Live Preview
                    </button>
                  </div>

                  {viewMode === 'preview' && (
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
                       <button onClick={() => setPreviewDevice('desktop')} className={cn("p-1.5 rounded-md", previewDevice === 'desktop' ? "bg-white shadow-sm text-red-600" : "text-slate-400")}><Monitor size={14}/></button>
                       <button onClick={() => setPreviewDevice('mobile')} className={cn("p-1.5 rounded-md", previewDevice === 'mobile' ? "bg-white shadow-sm text-red-600" : "text-slate-400")}><Smartphone size={14}/></button>
                    </div>
                  )}
               </div>
            </div>

            <div className="relative flex-1 overflow-hidden group">
              {viewMode === 'code' ? (
                <Textarea 
                  value={formData.htmlBody}
                  onChange={(e) => setFormData({...formData, htmlBody: e.target.value})}
                  // 🟢 FIX: Locked height with scroll, Dark Border Fix, Emerald Syntax theme
                  className="w-full h-full p-8 bg-[#0A1128] text-emerald-400 font-mono text-sm rounded-2xl builder-editor custom-scrollbar leading-relaxed resize-none outline-none border-none shadow-2xl"
                  placeholder="Paste your HTML content here..."
                />
              ) : (
                // 🟢 FIX: Visibility-hardened preview container
                <div className="flex justify-center w-full h-full p-8 overflow-y-auto bg-slate-200 rounded-2xl custom-scrollbar">
                   <div className={cn(
                     "bg-white shadow-2xl transition-all duration-500 overflow-hidden rounded-lg border border-slate-300",
                     previewDevice === 'mobile' ? "w-[375px]" : "w-full max-w-[600px]"
                   )}>
                      {/* Brand Header Mock */}
                      <div className="bg-[#0A1128] p-6 text-center border-b-4 border-red-600">
                         <h3 className="m-0 font-bold tracking-tight text-white">HomeRatesYard</h3>
                      </div>
                      <div className="p-8 min-h-[400px]">
                         <div dangerouslySetInnerHTML={{ __html: generatePreview() }} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Variables Helper */}
          <div className="flex-col hidden w-56 gap-4 shrink-0 xl:flex">
             <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                   <Info size={16} />
                   <h4 className="text-[11px] font-bold uppercase tracking-widest">Variable Tags</h4>
                </div>
                <div className="space-y-2">
                   {getAvailableVariables(template.triggerType).map(tag => (
                     <div key={tag} className="relative group">
                        <code className="block text-[10px] p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-mono cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                           {tag}
                        </code>
                     </div>
                   ))}
                </div>
                <p className="mt-6 text-[10px] text-slate-400 leading-relaxed italic">
                  Tags are automatically replaced by server data during dispatch.
                </p>
             </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-white border-t shrink-0">
           <Button onClick={handleSave} disabled={isSaving} className="w-full py-7 text-base font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 rounded-2xl transition-all active:scale-[0.99]">
              {isSaving ? (
                <span className="flex items-center gap-2"><Activity size={18} className="animate-spin" /> Publishing to Server Filesystem...</span>
              ) : (
                <span className="flex items-center gap-2"><Save size={18} /> Save & Publish Template</span>
              )}
           </Button>
        </div>
      </div>
    </>
  );
}