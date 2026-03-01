'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Home, User, Briefcase, Landmark, FileCheck, 
  ChevronRight, ChevronLeft, ShieldCheck, Lock, 
  Save, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const STEPS = [
  { id: 1, title: 'Loan & Property', icon: Home },
  { id: 2, title: 'Personal Info', icon: User },
  { id: 3, title: 'Employment', icon: Briefcase },
  { id: 4, title: 'Assets', icon: Landmark },
  { id: 5, title: 'Declarations', icon: FileCheck }
];

export default function ApplicationWizard() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1003 FORM STATE ---
  const [formData, setFormData] = useState({
    // Step 1: Property
    purpose: 'purchase',
    homeValue: '',
    downPayment: '',
    loanAmount: '',
    propertyAddress: '',
    propertyType: 'Single Family',
    propertyUse: 'Primary Residence',
    
    // Step 2: Personal
    firstName: '',
    lastName: '',
    dob: '',
    ssn: '',
    maritalStatus: 'Unmarried',
    dependents: 0,
    
    // Step 3: Employment
    employmentStatus: 'Employed',
    employerName: '',
    jobTitle: '',
    yearsEmployed: '',
    monthlyIncome: '',
    
    // Step 4: Assets
    totalAssets: '',
    willUseGiftFunds: false,
    
    // Step 5: Declarations (HMDA)
    isCitizen: 'Yes',
    hasBankruptcy: 'No',
    hasLawsuit: 'No',
    ethnicity: 'Do not wish to provide',
    race: 'Do not wish to provide',
    sex: 'Do not wish to provide'
  });

  // --- ROUTE HYDRATION (URL to State) ---
  useEffect(() => {
    setMounted(true);
    if (router.isReady) {
      const { purpose, homeValue, downPayment, amount } = router.query;
      
      // Auto-fill from Loan Explorer
      setFormData(prev => ({
        ...prev,
        purpose: purpose || 'purchase',
        homeValue: homeValue || '',
        downPayment: downPayment || '',
        loanAmount: amount || ''
      }));
    }
  }, [router.isReady, router.query]);

  // --- NAVIGATION HANDLERS ---
  const handleNext = async (e) => {
    e.preventDefault(); // Catch form submits
    if (currentStep < STEPS.length) {
      setIsSaving(true);
      // Simulate Auto-Save API Call
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsSaving(false);
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    // Simulate Final Underwriting Submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    addToast('Application successfully submitted to underwriting!', 'success');
    router.push('/borrower/applications');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  const ActiveStepIcon = STEPS[currentStep - 1].icon;

  return (
    <>
      <Head><title>New Application | HomeRatesYard</title></Head>

      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        
        {/* --- HEADER & SAVE/EXIT --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
              <ActiveStepIcon className="text-[#B91C1C]" size={28} /> 
              Form 1003 Setup
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <button 
            onClick={() => { addToast('Progress saved securely.', 'success'); router.push('/borrower/applications'); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors bg-white border rounded-lg shadow-sm text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Save size={16} /> Save & Exit
          </button>
        </div>

        {/* --- PROGRESS STEPPER --- */}
        <div className="hidden p-4 overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl md:p-6 md:block">
           <div className="relative flex items-center justify-between w-full">
              <div className="absolute z-0 h-1 -translate-y-1/2 rounded-full left-6 right-6 top-1/2 bg-slate-100" />
              <div 
                className="absolute left-6 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 3rem)` }}
              />
              
              {STEPS.map((step, index) => {
                 const isCompleted = index < currentStep - 1;
                 const isActive = index === currentStep - 1;
                 return (
                   <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 px-2 bg-white">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                        isActive ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-50" :
                        "bg-white border-slate-200 text-slate-400"
                      )}>
                         {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={18} />}
                      </div>
                      <span className={cn(
                        "text-xs font-bold absolute -bottom-6 whitespace-nowrap transition-colors",
                        isCompleted ? "text-emerald-700" : isActive ? "text-blue-700" : "text-slate-400"
                      )}>
                        {step.title}
                      </span>
                   </div>
                 );
              })}
           </div>
        </div>

        {/* --- WIZARD FORM CONTAINER --- */}
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[24px] overflow-hidden">
           
           {/* Animated Step Container */}
           <form onSubmit={handleNext} className="relative w-full">
              
              <div className="p-6 space-y-8 duration-500 md:p-10 animate-in slide-in-from-right-8 fade-in" key={currentStep}>
                 
                 {/* ==========================================
                     STEP 1: PROPERTY & LOAN
                 ========================================== */}
                 {currentStep === 1 && (
                   <>
                     <div className="pb-6 mb-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Property Information</h2>
                        <p className="mt-1 text-sm text-slate-500">Confirm the details of the property you are financing.</p>
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Purchase Price</label>
                           <div className="relative">
                             <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                             <input 
                               type="number" required
                               value={formData.homeValue} onChange={e => setFormData({...formData, homeValue: e.target.value})}
                               className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Down Payment</label>
                           <div className="relative">
                             <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                             <input 
                               type="number" required
                               value={formData.downPayment} onChange={e => setFormData({...formData, downPayment: e.target.value})}
                               className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Requested Loan</label>
                           <div className="flex items-center w-full h-12 px-4 font-mono text-sm font-bold border bg-slate-50 border-slate-200 rounded-xl text-slate-700">
                              {formatCurrency(Math.max(0, formData.homeValue - formData.downPayment))}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Subject Property Address</label>
                        <input 
                          type="text" required placeholder="123 Main St, City, State, Zip"
                          value={formData.propertyAddress} onChange={e => setFormData({...formData, propertyAddress: e.target.value})}
                          className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Property Type</label>
                           <select 
                             value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})}
                             className="w-full h-12 px-4 text-sm font-bold transition-all bg-white border outline-none cursor-pointer border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                           >
                             <option value="Single Family">Single Family</option>
                             <option value="Condominium">Condominium</option>
                             <option value="Townhouse">Townhouse</option>
                             <option value="Multi-Family">Multi-Family</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Property Use</label>
                           <select 
                             value={formData.propertyUse} onChange={e => setFormData({...formData, propertyUse: e.target.value})}
                             className="w-full h-12 px-4 text-sm font-bold transition-all bg-white border outline-none cursor-pointer border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                           >
                             <option value="Primary Residence">Primary Residence</option>
                             <option value="Second Home">Second Home</option>
                             <option value="Investment Property">Investment Property</option>
                           </select>
                        </div>
                     </div>
                   </>
                 )}

                 {/* ==========================================
                     STEP 2: PERSONAL INFO
                 ========================================== */}
                 {currentStep === 2 && (
                   <>
                     <div className="pb-6 mb-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                        <p className="mt-1 text-sm text-slate-500">This information is required to verify your identity and pull your credit history.</p>
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Legal First Name</label>
                           <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Legal Last Name</label>
                           <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                     </div>

                     {/* 🟢 Security Anchor for SSN */}
                     <div className="relative p-6 overflow-hidden border border-blue-100 bg-blue-50/50 rounded-2xl">
                        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5"><ShieldCheck size={100} className="-mt-8 -mr-8" /></div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Lock size={16} className="text-emerald-600" />
                          <span className="text-xs font-bold tracking-widest uppercase text-emerald-800">256-Bit Encrypted Data</span>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 ml-1">Social Security Number</label>
                              <input 
                                type="password" required placeholder="XXX-XX-XXXX" maxLength={9}
                                value={formData.ssn} onChange={e => setFormData({...formData, ssn: e.target.value.replace(/\D/g, '')})} 
                                className="w-full h-12 px-4 font-mono text-sm font-bold tracking-widest transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 ml-1">Date of Birth</label>
                              <input 
                                type="date" required 
                                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} 
                                className="w-full h-12 px-4 text-sm font-bold uppercase transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-700" 
                              />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Marital Status</label>
                           <select 
                             value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                             className="w-full h-12 px-4 text-sm font-bold transition-all bg-white border outline-none cursor-pointer border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                           >
                             <option value="Unmarried">Unmarried</option>
                             <option value="Married">Married</option>
                             <option value="Separated">Separated</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Dependents</label>
                           <input type="number" min="0" required value={formData.dependents} onChange={e => setFormData({...formData, dependents: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                     </div>
                   </>
                 )}

                 {/* ==========================================
                     STEP 3: EMPLOYMENT
                 ========================================== */}
                 {currentStep === 3 && (
                   <>
                     <div className="pb-6 mb-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Current Employment & Income</h2>
                        <p className="mt-1 text-sm text-slate-500">Lenders require a 2-year history of stable income.</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Employment Status</label>
                        <div className="flex w-full p-1 bg-slate-100 rounded-xl sm:w-fit">
                           {['Employed', 'Self-Employed', 'Retired'].map(status => (
                             <button
                               type="button"
                               key={status}
                               onClick={() => setFormData({...formData, employmentStatus: status})}
                               className={cn(
                                 "flex-1 sm:w-32 py-2.5 text-xs font-bold rounded-lg transition-all",
                                 formData.employmentStatus === status ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                               )}
                             >
                               {status}
                             </button>
                           ))}
                        </div>
                     </div>

                     {formData.employmentStatus !== 'Retired' && (
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Employer / Business Name</label>
                             <input type="text" required value={formData.employerName} onChange={e => setFormData({...formData, employerName: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Job Title</label>
                             <input type="text" required value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                          </div>
                       </div>
                     )}

                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Years at this job</label>
                           <input type="number" min="0" step="0.1" required placeholder="e.g. 3.5" value={formData.yearsEmployed} onChange={e => setFormData({...formData, yearsEmployed: e.target.value})} className="w-full h-12 px-4 text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                           <p className="text-[10px] text-slate-400 ml-1 mt-1">If less than 2 years, your loan officer will ask for previous employment history later.</p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Base Monthly Income (Gross)</label>
                           <div className="relative">
                             <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                             <input 
                               type="number" required placeholder="Before taxes"
                               value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}
                               className="w-full h-12 pl-8 pr-4 font-mono text-sm font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                             />
                           </div>
                        </div>
                     </div>
                   </>
                 )}

                 {/* ==========================================
                     STEP 4: ASSETS
                 ========================================== */}
                 {currentStep === 4 && (
                   <>
                     <div className="pb-6 mb-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Assets & Reserves</h2>
                        <p className="mt-1 text-sm text-slate-500">We need to verify you have enough liquid funds for the down payment and closing costs.</p>
                     </div>

                     <div className="p-8 border-2 border-dashed border-slate-300 bg-slate-50 rounded-[24px] text-center mb-8">
                        <Landmark size={32} className="mx-auto mb-3 text-slate-400" />
                        <h3 className="mb-2 text-base font-bold text-slate-900">Automate your verification</h3>
                        <p className="max-w-md mx-auto mb-6 text-sm text-slate-500">Securely link your bank account to auto-fill your assets and bypass paper statements.</p>
                        <button type="button" onClick={() => addToast('Plaid Link Initiated (Demo)', 'info')} className="px-6 py-2.5 bg-[#0A1128] text-white text-sm font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors">
                          Connect Bank Account
                        </button>
                     </div>

                     <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OR ENTER MANUALLY</span>
                        <div className="flex-1 h-px bg-slate-200" />
                     </div>

                     <div className="max-w-sm mx-auto space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">Total Estimated Liquid Assets</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                          <input 
                            type="number" required placeholder="Checking, Savings, Stocks"
                            value={formData.totalAssets} onChange={e => setFormData({...formData, totalAssets: e.target.value})}
                            className="w-full h-12 pl-8 pr-4 font-mono text-sm text-lg font-bold transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                     </div>

                     <div className="p-5 mt-8 border border-blue-100 bg-blue-50/50 rounded-2xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="mt-1">
                            <input 
                              type="checkbox" 
                              checked={formData.willUseGiftFunds} onChange={e => setFormData({...formData, willUseGiftFunds: e.target.value})}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600" 
                            />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-900">I will be using Gift Funds</span>
                            <span className="block mt-1 text-xs leading-relaxed text-slate-500">Check this box if any portion of your down payment is being gifted by a relative. A signed gift letter will be required in underwriting.</span>
                          </div>
                        </label>
                     </div>
                   </>
                 )}

                 {/* ==========================================
                     STEP 5: DECLARATIONS (HMDA)
                 ========================================== */}
                 {currentStep === 5 && (
                   <>
                     <div className="pb-6 mb-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Legal Declarations</h2>
                        <p className="mt-1 text-sm text-slate-500">Federally mandated compliance and background questions.</p>
                     </div>

                     <div className="mb-8 space-y-6">
                        <div className="flex flex-col justify-between gap-4 p-4 border sm:items-center sm:flex-row border-slate-200 rounded-xl bg-slate-50">
                           <span className="text-sm font-semibold text-slate-800">Are you a U.S. Citizen?</span>
                           <select value={formData.isCitizen} onChange={e => setFormData({...formData, isCitizen: e.target.value})} className="h-10 px-3 text-sm font-bold border rounded-lg outline-none cursor-pointer border-slate-200">
                             <option value="Yes">Yes</option>
                             <option value="Permanent Resident">Permanent Resident Alien</option>
                             <option value="Non-Permanent">Non-Permanent Resident Alien</option>
                           </select>
                        </div>
                        <div className="flex flex-col justify-between gap-4 p-4 border sm:items-center sm:flex-row border-slate-200 rounded-xl bg-slate-50">
                           <span className="text-sm font-semibold text-slate-800">Are there any outstanding judgments against you?</span>
                           <select value={formData.hasLawsuit} onChange={e => setFormData({...formData, hasLawsuit: e.target.value})} className="h-10 px-3 text-sm font-bold border rounded-lg outline-none cursor-pointer border-slate-200">
                             <option value="No">No</option>
                             <option value="Yes">Yes</option>
                           </select>
                        </div>
                        <div className="flex flex-col justify-between gap-4 p-4 border sm:items-center sm:flex-row border-slate-200 rounded-xl bg-slate-50">
                           <span className="text-sm font-semibold text-slate-800">Have you declared bankruptcy in the last 7 years?</span>
                           <select value={formData.hasBankruptcy} onChange={e => setFormData({...formData, hasBankruptcy: e.target.value})} className="h-10 px-3 text-sm font-bold border rounded-lg outline-none cursor-pointer border-slate-200">
                             <option value="No">No</option>
                             <option value="Yes">Yes</option>
                           </select>
                        </div>
                     </div>

                     <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[24px]">
                        <div className="flex items-start gap-3 mb-6">
                           <AlertCircle size={24} className="mt-1 text-blue-400 shrink-0" />
                           <div>
                             <h3 className="text-base font-bold">Demographic Information (HMDA)</h3>
                             <p className="mt-1 text-xs leading-relaxed text-slate-400">The Federal Government requests this information to monitor compliance with equal credit opportunity, fair housing, and home mortgage disclosure laws. You are not required to furnish this information.</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">Ethnicity</label>
                             <select value={formData.ethnicity} onChange={e => setFormData({...formData, ethnicity: e.target.value})} className="w-full px-3 text-sm font-semibold text-white border outline-none h-11 bg-slate-800 border-slate-700 rounded-xl">
                               <option value="Hispanic">Hispanic or Latino</option>
                               <option value="Not Hispanic">Not Hispanic or Latino</option>
                               <option value="Do not wish to provide">I do not wish to provide</option>
                             </select>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">Race</label>
                             <select value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} className="w-full px-3 text-sm font-semibold text-white border outline-none h-11 bg-slate-800 border-slate-700 rounded-xl">
                               <option value="Asian">Asian</option>
                               <option value="White">White</option>
                               <option value="Black">Black or African American</option>
                               <option value="Native">American Indian / Alaska Native</option>
                               <option value="Do not wish to provide">I do not wish to provide</option>
                             </select>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">Sex</label>
                             <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full px-3 text-sm font-semibold text-white border outline-none h-11 bg-slate-800 border-slate-700 rounded-xl">
                               <option value="Female">Female</option>
                               <option value="Male">Male</option>
                               <option value="Do not wish to provide">I do not wish to provide</option>
                             </select>
                           </div>
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* --- ACTION FOOTER --- */}
              <div className="flex items-center justify-between px-6 py-6 border-t md:px-10 bg-slate-50 border-slate-200">
                 <button 
                   type="button" 
                   onClick={handleBack}
                   className={cn(
                     "px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2",
                     currentStep === 1 && "opacity-0 pointer-events-none"
                   )}
                 >
                   <ChevronLeft size={16} /> Back
                 </button>
                 
                 {currentStep < STEPS.length ? (
                   <button 
                     type="submit" 
                     disabled={isSaving}
                     className="px-8 py-3 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-70"
                   >
                     {isSaving ? <RefreshCw size={16} className="animate-spin" /> : 'Continue'} 
                     {!isSaving && <ChevronRight size={16} />}
                   </button>
                 ) : (
                   <button 
                     type="button" 
                     onClick={handleSubmitApplication}
                     disabled={isSubmitting}
                     className="px-8 py-3 text-sm font-bold text-white bg-[#B91C1C] hover:bg-red-800 rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center gap-2 disabled:opacity-70"
                   >
                     {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                     {isSubmitting ? 'Authenticating...' : 'Submit Application'}
                   </button>
                 )}
              </div>
           </form>
        </div>
      </div>
    </>
  );
}

ApplicationWizard.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);