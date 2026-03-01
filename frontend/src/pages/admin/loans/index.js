'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Briefcase, Search, Filter as FilterIcon, 
  RefreshCw, DollarSign, Activity, ShieldAlert, 
  ChevronRight, FileText, CheckCircle, Clock, XCircle, FileSignature
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- DICTIONARY FOR PIPELINE STATUS BADGES ---
const STATUS_CONFIG = {
  draft: { label: 'Application Draft', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: FileSignature },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
  approved: { label: 'AUS Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
  funded: { label: 'Clear to Close / Funded', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: DollarSign },
  rejected: { label: 'Declined', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  default: { label: 'Unknown Status', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: Activity }
};

export default function LoanPipelinePage() {
  const { addToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await adminService.getAllLoans();
      // Ensure we extract the array securely (whether the API returns { loans: [] } or just [])
      const data = response?.loans || response?.data || response; 
      
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pipeline data:", err);
      setError(true);
      addToast("Failed to synchronize loan pipeline.", "error");
      setLoans([]); 
    } finally {
      setLoading(false);
    }
  };

  // 🟢 SAFE MULTI-FILTER LOGIC (Search + Dropdown)
  const filteredLoans = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return (loans || []).filter(loan => {
      const matchesSearch = 
        (loan?.borrowerName || "").toLowerCase().includes(term) || 
        (loan?.loanId || "").toLowerCase().includes(term) ||
        (loan?.email || "").toLowerCase().includes(term);
      
      const matchesStatus = statusFilter === 'all' || loan?.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [loans, searchTerm, statusFilter]);

  // 🟢 DYNAMIC KPI CALCULATIONS (Strict mathematical parsing)
  const totalVolume = (loans || []).reduce((sum, loan) => sum + Number(loan?.loanAmount || 0), 0);
  const activeLoans = (loans || []).filter(l => l.status !== 'funded' && l.status !== 'rejected').length;
  const pendingReview = (loans || []).filter(l => l.status === 'under_review').length;

  return (
    <DashboardLayout>
      <RouteGuard allowedRoles={['admin', 'superadmin', 'super_admin']}>
        <Head>
          <title>Global Pipeline | HRY Enterprise</title>
        </Head>

        <div className="flex flex-col min-h-full bg-[#F4F7FA] px-4 sm:px-8 pt-8 pb-12 font-sans">
        
        {/* --- 1. CORPORATE HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">

              <h1 className="text-3xl font-bold text-[#0A1128] tracking-tight">Global Pipeline</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Manage borrower applications, underwriting statuses, and overall loan volume.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLoans}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all bg-white border shadow-sm border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-[#0A1128] disabled:opacity-70"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-slate-400"} />
              {loading ? "Syncing..." : "Refresh Pipeline"}
            </button>
          </div>
        </div>

        {/* --- 2. DYNAMIC KPI METRICS --- */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 sm:gap-6">
          <KPIStoreCard 
            title="Total Pipeline Volume" 
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalVolume)} 
            icon={<DollarSign className="text-emerald-600" />} 
            loading={loading}
          />
          <KPIStoreCard 
            title="Active Applications" 
            value={(activeLoans || 0).toLocaleString()} 
            icon={<Activity className="text-blue-600" />} 
            loading={loading}
          />
          <KPIStoreCard 
            title="Pending Underwriting" 
            value={(pendingReview || 0).toLocaleString()} 
            icon={<Clock className="text-amber-600" />} 
            highlight={pendingReview > 0}
            loading={loading}
          />
        </div>

        {/* --- 3. CONTROLS & SEARCH --- */}
        <div className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
          <div className="flex items-center w-full gap-3 sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search borrower, email, or Loan ID..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A1128]/10 focus:border-[#0A1128] outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Native Select for Pipeline Filtering */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#0A1128] hover:bg-slate-50 transition-all shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#0A1128]/10"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Application Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">AUS Approved</option>
                <option value="funded">Clear to Close</option>
                <option value="rejected">Declined</option>
              </select>
              <FilterIcon size={14} className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Activity size={14} className="text-slate-400" /> Pipeline Live Sync
          </div>
        </div>

        {/* --- 4. DATA TABLE --- */}
        <div className="flex-1 overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#FBFCFD] border-b border-slate-100">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-4 sm:p-6 w-[30%]">Borrower Identity</th>
                  <th className="p-4 sm:p-6 w-[25%]">Loan Details</th>
                  <th className="p-4 sm:p-6 w-[25%]">Pipeline Status</th>
                  <th className="p-4 sm:p-6 w-[20%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                
                {loading && loans.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <RefreshCw size={32} className="mx-auto mb-4 text-slate-200 animate-spin" />
                      <p className="text-sm font-bold text-slate-500">Decrypting financial pipeline...</p>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <ShieldAlert size={32} className="mx-auto mb-4 text-red-300" />
                      <p className="text-sm font-bold text-red-600">Secure connection to pipeline failed.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <FileText size={32} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-sm font-bold text-slate-500">No applications match your criteria.</p>
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredLoans.map((loan) => {
                  const statusStyle = STATUS_CONFIG[loan.status] || STATUS_CONFIG.default;
                  const StatusIcon = statusStyle.icon;

                  return (
                    <tr 
                      key={loan.id || loan.loanId} 
                      className="transition-all cursor-pointer hover:bg-slate-50 group"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-[#0A1128] shrink-0 text-xs shadow-sm">
                            {(loan?.borrowerName || 'B').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0A1128]">
                              {loan.borrowerName || 'Incomplete Profile'}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {loan.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(loan.loanAmount || 0)}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            {loan.loanType || 'Conventional'} • {loan.term || 30} Yr
                          </span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                          statusStyle.bg, statusStyle.text, statusStyle.border
                        )}>
                          <StatusIcon size={12} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="p-4 text-right sm:p-6">
                        <button className="inline-flex items-center justify-center px-4 py-2 transition-colors rounded-lg text-slate-500 font-bold text-xs group-hover:bg-white group-hover:text-[#0A1128] group-hover:shadow-sm border border-transparent group-hover:border-slate-200">
                          Review File
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 5. SLIDE-OVER DRAWER FOR LOAN DETAILS --- */}
      <LoanDetailDrawer 
        isOpen={!!selectedLoan} 
        onClose={() => {
          setSelectedLoan(null);
          fetchLoans(); // Refresh pipeline when drawer closes in case actions were taken
        }} 
        loan={selectedLoan} 
      />

      </RouteGuard>
    </DashboardLayout>
  );
}

// --- SUBCOMPONENTS ---

function KPIStoreCard({ title, value, icon, highlight, loading }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm transition-all relative overflow-hidden",
      highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
    )}>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", highlight ? "text-amber-800" : "text-slate-400")}>
            {title}
          </p>
          {loading ? (
            <div className="w-24 h-10 mt-1 rounded-lg bg-slate-100 animate-pulse"></div>
          ) : (
            <h4 className={cn("text-4xl font-bold tracking-tighter", highlight ? "text-amber-700" : "text-[#0A1128]")}>
              {value}
            </h4>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          highlight ? "bg-amber-100" : "bg-slate-50 border border-slate-100"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoanDetailDrawer({ isOpen, onClose, loan }) {
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!loan) return null;

  const statusStyle = STATUS_CONFIG[loan.status] || STATUS_CONFIG.default;

  // Handler mapped to your adminService
  const handleRunAUS = async () => {
    setIsProcessing(true);
    try {
      await adminService.runAus(loan.id || loan.loanId);
      addToast("Automated Underwriting Engine completed successfully.", "success");
      onClose(); // Close to refresh parent state
    } catch (err) {
      addToast(err.message || "AUS execution failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-lg bg-[#F8FAFC] shadow-2xl z-[101] transition-transform duration-500 ease-in-out transform flex flex-col border-l border-slate-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0A1128]">Loan File: {loan.loanId || 'Draft'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                {statusStyle.label}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors border border-transparent rounded-xl text-slate-400 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-700 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Borrower Data</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Primary Applicant</p>
                <p className="text-sm font-bold text-[#0A1128]">{loan.borrowerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Credit Score</p>
                <p className="text-sm font-bold text-[#0A1128]">{loan.creditScore || 'Pending Pull'}</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Financial Scenario</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Purchase Price</p>
                <p className="text-sm font-bold text-[#0A1128]">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(loan.propertyValue || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Loan Amount</p>
                <p className="text-sm font-bold text-[#0A1128]">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(loan.loanAmount || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">LTV Ratio</p>
                <p className="text-sm font-bold text-[#0A1128]">
                  {loan.propertyValue ? Math.round((loan.loanAmount / loan.propertyValue) * 100) : 0}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">DTI Ratio</p>
                <p className="text-sm font-bold text-[#0A1128]">{loan.dti || 'N/A'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200 shrink-0">
          <div className="flex flex-col gap-3">
             <button 
                onClick={handleRunAUS}
                disabled={isProcessing || loan.status === 'funded'}
                className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold text-white transition-all bg-[#0A1128] border border-[#0A1128] rounded-xl hover:bg-[#14224A] active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isProcessing ? <Activity size={16} className="animate-spin" /> : <Activity size={16} />}
                {isProcessing ? 'Executing Engine...' : 'Run AUS Engine'}
             </button>
             
             {loan.status === 'approved' && (
               <button 
                  onClick={() => adminService.downloadPreApproval(loan.id || loan.loanId)}
                  className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold transition-all bg-white border shadow-sm rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95"
               >
                  <FileText size={16} className="text-red-600" /> Download Pre-Approval PDF
               </button>
             )}
          </div>
        </div>
      </div>
    </>
  );
}