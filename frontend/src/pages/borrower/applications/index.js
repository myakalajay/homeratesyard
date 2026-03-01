'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ClipboardList, Plus, CheckCircle2, Clock, 
  AlertCircle, FileText, UploadCloud, User, 
  Phone, Mail, Building, Search, Download,
  X, RefreshCw, ShieldCheck, FileCheck, Trash2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// 🟢 FIX: Imported standard Button primitive
import { Button } from '@/components/ui/primitives/Button';

// --- ENTERPRISE FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
const getTermInMonths = (loanType) => loanType.includes('15-Year') ? 180 : 360;

export default function ApplicationTracker() {
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'closed'

  // --- TASK RESOLUTION STATES ---
  const [activeTask, setActiveTask] = useState(null);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  
  // Staged Data for Tasks
  const [selectedFile, setSelectedFile] = useState(null);
  const [esignConsent, setEsignConsent] = useState(false);
  const fileInputRef = useRef(null);

  // --- MOCK DB STATE ---
  const [applications, setApplications] = useState({ active: [], closed: [] });

  useEffect(() => {
    setMounted(true);
    const fetchApplications = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        setApplications({
          active: [
            {
              id: 'APP-902-XQ',
              propertyAddress: '123 Pine Retreat Ln, Austin, TX 78701',
              loanType: '30-Year Fixed Conventional',
              loanAmount: 450000,
              purchasePrice: 500000,
              lockedRate: 6.500,
              submittedDate: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
              estClosingDate: new Date(new Date().setDate(new Date().getDate() + 18)).toISOString(),
              status: 'underwriting', 
              progress: 60,
              history: {
                processing: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
                underwriting: null, 
                conditionally_approved: null,
                clear_to_close: null
              },
              tasks: [
                { id: 1, title: 'Upload 2023 W-2 Forms', type: 'document', required: true, desc: 'Your underwriter needs your most recent W-2 to verify base income.' },
                { id: 2, title: 'E-Sign Updated Loan Estimate', type: 'signature', required: true, desc: 'Rates shifted slightly. Please acknowledge the updated estimate.' }
              ],
              team: {
                lo: { name: 'Sarah Jenkins', role: 'Senior Loan Officer', phone: '(555) 123-4567', email: 's.jenkins@homeratesyard.com' },
                processor: { name: 'David Chen', role: 'Loan Processor', phone: '(555) 987-6543', email: 'd.chen@homeratesyard.com' }
              }
            }
          ],
          closed: [
            {
              id: 'APP-204-ZB',
              propertyAddress: '88 Oak Avenue, Seattle, WA 78102',
              loanType: '15-Year Fixed Refinance',
              loanAmount: 320000,
              lockedRate: 5.125,
              closedDate: new Date(new Date().setDate(new Date().getDate() - 400)).toISOString(),
              status: 'funded',
              documents: [
                { id: 'doc-1', name: 'Final Closing Disclosure (CD)', date: 'Oct 12, 2024' },
                { id: 'doc-2', name: '1098 Tax Interest Statement', date: 'Jan 31, 2025' }
              ]
            }
          ]
        });
      } catch (error) {
        addToast('Failed to load application data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [addToast]);

  const displayData = activeTab === 'active' ? applications.active : applications.closed;
  const pendingTasksCount = useMemo(() => applications.active.reduce((acc, app) => acc + (app.tasks?.length || 0), 0), [applications.active]);

  // --- TASK WORKFLOW HANDLERS ---
  const handleOpenTask = (task) => {
    setActiveTask(task);
    setSelectedFile(null);
    setEsignConsent(false);
  };

  const handleCloseTaskModal = (force = false) => {
    if (!force && (selectedFile || esignConsent)) return; 
    setActiveTask(null);
    setSelectedFile(null);
    setEsignConsent(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('File exceeds 10MB limit.', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  // 🟢 FIX: Wrapped in strict Try/Catch/Finally to prevent UI freezing
  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (activeTask.type === 'document' && !selectedFile) return;
    if (activeTask.type === 'signature' && !esignConsent) return;

    setIsProcessingTask(true);
    
    try {
      // Simulate secure network transaction to Underwriting API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setApplications(prev => {
        const updatedActive = prev.active.map(app => ({
          ...app,
          tasks: app.tasks.filter(t => t.id !== activeTask.id),
          progress: app.tasks.length === 1 ? app.progress + 15 : app.progress 
        }));
        return { ...prev, active: updatedActive };
      });

      handleCloseTaskModal(true);
      addToast('Task completed securely. Underwriting has been notified.', 'success');
    } catch (error) {
      addToast('Network error: Failed to process task.', 'error');
    } finally {
      setIsProcessingTask(false);
    }
  };

  const handleDownloadHistoricalDoc = (docName) => {
    addToast(`Securely downloading ${docName}...`, 'info');
  };

  // 🟢 FIX: Safe SSR check
  if (!mounted) return null;

  // 🟢 FIX: Wrapped in RouteGuard and DashboardLayout
  return (
    <RouteGuard allowedRoles={['borrower']}>
      <DashboardLayout role="borrower">
        <Head><title>Application Tracker | HomeRatesYard</title></Head>

        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* --- 1. HEADER --- */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                <ClipboardList className="text-[#B91C1C]" size={32} /> 
                Application Tracker
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Monitor your loan pipeline, resolve underwriting conditions, and access closing documents.
              </p>
            </div>
            <Link href="/borrower/explore" className="w-full sm:w-auto">
              <Button className="w-full gap-2 bg-[#B91C1C] hover:bg-red-800 shadow-md shadow-red-200 rounded-xl h-12">
                 <Plus size={18} /> Start New Application
              </Button>
            </Link>
          </div>

          {/* --- 2. DYNAMIC TABS --- */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('active')}
              className={cn(
                "relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
                activeTab === 'active' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Active Pipeline ({applications.active.length})
              {pendingTasksCount > 0 && (
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('closed')}
              className={cn(
                "px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
                activeTab === 'closed' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Funded & Closed ({applications.closed.length})
            </button>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : displayData.length === 0 ? (
            <ZeroState activeTab={activeTab} />
          ) : (
            <div className="space-y-10">
              {displayData.map((app) => (
                <div key={app.id} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  
                  {/* --- MAIN TRACKER COLUMN (LEFT) --- */}
                  <div className="space-y-6 lg:col-span-8">
                     
                     {/* Primary App Card */}
                     <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                        <div className="flex flex-col justify-between gap-4 p-6 border-b md:p-8 border-slate-100 sm:flex-row sm:items-start bg-slate-50/50">
                           <div>
                              <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 mb-3 border rounded-full font-bold uppercase tracking-[0.15em] text-[10px]",
                                activeTab === 'active' ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                              )}>
                                 <span className={cn("w-1.5 h-1.5 rounded-full", activeTab === 'active' ? "bg-blue-500 animate-pulse" : "bg-emerald-500")} />
                                 {activeTab === 'active' ? 'In Progress' : 'Funded'} • File: {app.id}
                              </div>
                              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                                 <Building size={20} className="text-slate-400 shrink-0" /> {app.propertyAddress}
                              </h2>
                              <p className="mt-2 text-sm font-semibold text-slate-500">{app.loanType}</p>
                           </div>
                           <div className="text-left sm:text-right shrink-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Amount</p>
                              <p className="font-mono text-3xl font-black tracking-tight text-slate-900">{formatCurrency(app.loanAmount)}</p>
                           </div>
                        </div>

                        {/* Timeline Stepper */}
                        {activeTab === 'active' && (
                          <div className="p-6 md:p-8">
                             <h3 className="mb-6 text-sm font-bold text-slate-900">Underwriting Progress</h3>
                             <ApplicationPipelineStepper currentStatus={app.status} history={app.history} />
                          </div>
                        )}

                        {/* Footer Details */}
                        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs font-semibold border-t bg-slate-50 text-slate-500 border-slate-100">
                           <span className="flex items-center gap-1.5"><Clock size={14} /> {activeTab === 'active' ? 'Submitted' : 'Closed'}: {formatDate(app.submittedDate || app.closedDate)}</span>
                           {activeTab === 'active' && (
                             <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={14} /> Est. Closing: {formatDate(app.estClosingDate)}</span>
                           )}
                        </div>
                     </div>

                     {/* Action Required Widget */}
                     {activeTab === 'active' && app.tasks?.length > 0 && (
                       <div className="bg-white border-2 border-orange-200 shadow-md rounded-[24px] p-6 md:p-8 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 z-0 w-32 h-32 -mt-16 -mr-16 rounded-bl-full bg-orange-50" />
                          <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl shadow-inner">
                                  <AlertCircle size={24} />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-slate-900">Action Required</h3>
                                  <p className="text-xs font-medium text-slate-500">Your file is paused until these tasks are completed.</p>
                                </div>
                             </div>
                             
                             <div className="space-y-3">
                                {app.tasks.map(task => (
                                  <div key={task.id} className="flex flex-col justify-between gap-4 p-4 transition-all border sm:flex-row sm:items-center border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-orange-300 hover:shadow-sm group/task">
                                     <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400 group-hover/task:text-orange-500 transition-colors mt-0.5">
                                           {task.type === 'document' ? <UploadCloud size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div>
                                          <span className="block text-sm font-bold text-slate-900">{task.title}</span>
                                          <span className="text-xs font-medium text-slate-500 block mt-0.5">{task.desc}</span>
                                        </div>
                                     </div>
                                     <button 
                                       onClick={() => handleOpenTask(task)}
                                       className="w-full sm:w-auto shrink-0 px-6 py-2.5 text-xs font-bold text-center text-white bg-[#B91C1C] rounded-xl hover:bg-red-800 transition-all shadow-md active:scale-95"
                                     >
                                        {task.type === 'document' ? 'Secure Upload' : 'Review & Sign'}
                                     </button>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                     )}

                     {/* Post-Closing Documents Widget */}
                     {activeTab === 'closed' && app.documents?.length > 0 && (
                       <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8">
                         <h3 className="flex items-center gap-2 mb-4 text-base font-bold text-slate-900">
                           <FileText size={18} className="text-blue-600" /> Post-Closing Documents
                         </h3>
                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                           {app.documents.map(doc => (
                             <button 
                               key={doc.id}
                               onClick={() => handleDownloadHistoricalDoc(doc.name)}
                               className="flex items-center justify-between p-4 transition-all border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm group"
                             >
                               <div className="text-left">
                                 <p className="text-sm font-bold transition-colors text-slate-700 group-hover:text-blue-700">{doc.name}</p>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Generated: {doc.date}</p>
                               </div>
                               <Download size={18} className="transition-colors text-slate-400 group-hover:text-blue-600" />
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>

                  {/* --- SIDEBAR COLUMN (RIGHT) --- */}
                  <div className="space-y-6 lg:col-span-4">
                     
                     {/* Rate & Terms Summary */}
                     <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Loan Terms</h3>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                             <span className="text-sm font-medium text-slate-500">Locked Rate</span>
                             <span className="font-mono text-lg font-black tracking-tighter text-slate-900">{app.lockedRate.toFixed(3)}%</span>
                           </div>
                           {app.purchasePrice && (
                             <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                               <span className="text-sm font-medium text-slate-500">Purchase Price</span>
                               <span className="font-mono text-sm font-bold text-slate-900">{formatCurrency(app.purchasePrice)}</span>
                             </div>
                           )}
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-500">Term Length</span>
                             <span className="text-sm font-bold text-slate-900">{getTermInMonths(app.loanType)} Months</span>
                           </div>
                        </div>
                     </div>

                     {/* Dedicated Loan Team */}
                     {app.team && (
                       <div className="bg-[#0A1128] border border-slate-800 shadow-xl rounded-[24px] p-6 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                             <User size={120} className="-mt-10 -mr-10" />
                          </div>
                          <div className="relative z-10">
                             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Your Dedicated Team</h3>
                             
                             <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-400 border rounded-full bg-blue-600/20 border-blue-500/30 shrink-0">
                                    {app.team.lo.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{app.team.lo.name}</p>
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 mb-2">{app.team.lo.role}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-300">
                                      <a href={`tel:${app.team.lo.phone}`} className="hover:text-white transition-colors flex items-center gap-1.5"><Phone size={12} /> {app.team.lo.phone}</a>
                                    </div>
                                  </div>
                                </div>

                                <div className="h-px bg-slate-800" />

                                <div className="flex items-start gap-4">
                                  <div className="flex items-center justify-center w-10 h-10 font-bold border rounded-full bg-emerald-600/20 border-emerald-500/30 text-emerald-400 shrink-0">
                                    {app.team.processor.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{app.team.processor.name}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 mb-2">{app.team.processor.role}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-300">
                                      <a href={`mailto:${app.team.processor.email}`} className="hover:text-white transition-colors flex items-center gap-1.5"><Mail size={12} /> Email</a>
                                    </div>
                                  </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. 🟢 TASK RESOLUTION MODAL --- */}
        {activeTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => handleCloseTaskModal(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                    {activeTask.type === 'document' ? <UploadCloud size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{activeTask.type === 'document' ? 'Secure File Upload' : 'e-Signature Required'}</h2>
                  </div>
                </div>
                <button disabled={isProcessingTask} onClick={() => handleCloseTaskModal(true)} className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-200 disabled:opacity-50"><X size={18} /></button>
              </div>
              
              <form className="p-6 overflow-y-auto md:p-8" onSubmit={handleCompleteTask}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{activeTask.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{activeTask.desc}</p>
                </div>

                {/* UPLOAD WORKFLOW */}
                {activeTask.type === 'document' && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                    />
                    
                    {!selectedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-10 text-center transition-colors border-2 border-dashed cursor-pointer border-slate-300 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 group"
                      >
                         <UploadCloud size={36} className="mx-auto mb-4 transition-colors text-slate-400 group-hover:text-blue-500" />
                         <p className="text-sm font-bold text-slate-700">Click to browse your device</p>
                         <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50 rounded-2xl">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <FileCheck size={24} className="text-emerald-500 shrink-0" />
                            <div className="truncate">
                               <p className="text-sm font-bold truncate text-emerald-900">{selectedFile.name}</p>
                               <p className="text-xs text-emerald-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                         </div>
                         <button 
                           type="button" 
                           onClick={() => setSelectedFile(null)} 
                           className="p-2 transition-colors rounded-lg text-emerald-600 hover:bg-emerald-100 shrink-0"
                           title="Remove file"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    )}
                  </>
                )}

                {/* ESIGN WORKFLOW */}
                {activeTask.type === 'signature' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50">
                       <div className="flex items-center gap-3">
                         <FileText size={24} className="text-blue-500" />
                         <div>
                           <p className="text-sm font-bold text-slate-900">Loan_Estimate_Rev2.pdf</p>
                           <p className="text-xs text-slate-500">2 Pages • Standard Disclosure</p>
                         </div>
                       </div>
                       <a href="#" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">View PDF</a>
                    </div>

                    <label className="flex items-start gap-3 p-4 transition-colors border cursor-pointer border-slate-200 rounded-xl hover:bg-slate-50">
                      <div className="mt-0.5">
                        <input 
                          type="checkbox" 
                          required
                          checked={esignConsent}
                          onChange={(e) => setEsignConsent(e.target.checked)}
                          className="w-4 h-4 text-[#B91C1C] border-slate-300 rounded focus:ring-[#B91C1C]"
                        />
                      </div>
                      <span className="text-xs leading-relaxed text-slate-600">
                        By checking this box, I acknowledge that I have reviewed the attached document and consent to sign it electronically under the ESIGN Act.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-8 shrink-0">
                  <button type="button" disabled={isProcessingTask} onClick={() => handleCloseTaskModal(true)} className="px-5 py-3 text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50">Cancel</button>
                  <Button 
                    type="submit" 
                    disabled={isProcessingTask || (activeTask.type === 'document' && !selectedFile) || (activeTask.type === 'signature' && !esignConsent)} 
                    className="px-8 py-3 text-sm font-bold text-white bg-[#B91C1C] hover:bg-red-800 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessingTask ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    {isProcessingTask ? 'Encrypting...' : activeTask.type === 'document' ? 'Upload Securely' : 'Sign & Complete'}
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
// 🧱 PIPELINE STEPPER COMPONENT
// ==========================================

const ApplicationPipelineStepper = ({ currentStatus, history }) => {
  const steps = [
    { id: 'processing', label: 'Processing' },
    { id: 'underwriting', label: 'Underwriting' },
    { id: 'conditionally_approved', label: 'Conditions Met' },
    { id: 'clear_to_close', label: 'Clear to Close' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="relative">
       <div className="absolute hidden h-1 rounded-full top-5 left-6 right-6 bg-slate-100 sm:block" />
       
       <div 
         className="absolute top-5 left-6 h-1 bg-emerald-500 rounded-full hidden sm:block transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
         style={{ width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 3rem)` }} 
       />

       <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:gap-0">
         {steps.map((step, index) => {
           const isCompleted = index < currentIndex;
           const isCurrent = index === currentIndex;
           const completedDate = history?.[step.id];

           return (
             <div key={step.id} className="flex items-center flex-1 gap-4 sm:flex-col sm:gap-3 group">
               <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 bg-white",
                 isCompleted ? "border-emerald-500 text-emerald-500 shadow-sm" :
                 isCurrent ? "border-blue-600 text-blue-600 ring-4 ring-blue-50" :
                 "border-slate-200 text-slate-300"
               )}>
                 {isCompleted ? <CheckCircle2 size={20} /> : 
                  isCurrent ? <RefreshCw size={18} className="animate-spin" /> : 
                  <span className="text-sm font-bold">{index + 1}</span>}
               </div>
               
               <div className="w-full text-left sm:text-center sm:w-auto">
                 <p className={cn(
                   "text-sm font-bold tracking-tight",
                   isCompleted ? "text-slate-900" : isCurrent ? "text-blue-700" : "text-slate-400"
                 )}>
                   {step.label}
                 </p>
                 
                 {isCompleted && completedDate && (
                   <p className="text-[10px] font-semibold text-slate-400 mt-1 hidden sm:block">{formatDate(completedDate)}</p>
                 )}
                 {isCurrent && (
                   <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-500 mt-1 hidden sm:block">In Review</p>
                 )}
               </div>
             </div>
           );
         })}
       </div>
    </div>
  );
};

// ==========================================
// 🧱 ZERO STATE & SKELETON
// ==========================================

const ZeroState = ({ activeTab }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 shadow-sm rounded-[24px] mt-8 py-24">
    <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full shadow-inner bg-slate-50 text-slate-400 ring-8 ring-slate-50/50">
      <Search size={32} />
    </div>
    <h2 className="mb-2 text-xl font-bold text-slate-900">No {activeTab} applications found</h2>
    <p className="max-w-md mb-8 text-sm leading-relaxed text-slate-500">
      {activeTab === 'active' 
        ? "You don't have any loans currently in processing. Explore live market rates to start a new application." 
        : "You don't have any historically closed or funded loans in our system."}
    </p>
    {activeTab === 'active' && (
      <Link href="/borrower/explore" className="flex items-center gap-2 w-fit">
        <Button className="px-8 py-6 bg-[#B91C1C] hover:bg-red-800 rounded-xl gap-2 text-base">
           <Search size={18} /> Explore Loan Options
        </Button>
      </Link>
    )}
  </div>
);

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="space-y-6 lg:col-span-8">
      <div className="h-[300px] bg-slate-200 rounded-[24px]" />
      <div className="h-[200px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="space-y-6 lg:col-span-4">
      <div className="h-[150px] bg-slate-200 rounded-[24px]" />
      <div className="h-[250px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);