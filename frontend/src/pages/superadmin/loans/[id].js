import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, Shield, CheckCircle2, AlertOctagon, 
  FileText, Download, User, Home, DollarSign, 
  Activity, Clock, Briefcase, Ban
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

export default function LoanAuditDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- DATA SYNCHRONIZATION ---
  const fetchAsset = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminService.getLoanById(id);
      if (!data) throw new Error("Asset not found");
      setLoan(data);
    } catch (err) {
      console.error(err);
      addToast('Critical: Asset retrieval failed', 'error');
      // Optional: Redirect after a delay, or show error state
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => { fetchAsset(); }, [fetchAsset]);

  // --- ACTIONS ---
  const executeDecision = async (decision) => {
    const isRejection = decision === 'rejected';
    const reason = window.prompt(isRejection 
      ? "REQUIRED: Enter rejection risk factors:" 
      : "Confirm asset funding authorization:");
      
    if (reason === null) return;

    setActionLoading(true);
    try {
      await adminService.updateLoanStatus(id, decision, reason);
      addToast(`Asset status migrated to ${decision.toUpperCase()}`, 'success');
      fetchAsset();
    } catch (err) {
      addToast('Decision execution failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 1. LOADING STATE
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 border-4 rounded-full border-slate-100" />
        <div className="w-12 h-12 border-4 border-transparent rounded-full border-t-red-600 animate-spin" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Retrieving Asset Logic</p>
    </div>
  );

  // 2. ERROR / NOT FOUND STATE (Fixes the crash)
  if (!loan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="p-4 bg-slate-50 rounded-2xl">
         <AlertOctagon size={48} className="text-slate-300" />
      </div>
      <div className="text-center">
         <h3 className="text-lg font-bold text-slate-900">Asset Telemetry Unavailable</h3>
         <p className="mt-1 text-xs text-slate-500">The requested asset ID could not be located in the registry.</p>
      </div>
      <button 
        onClick={() => router.push('/super-admin/loans')}
        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline"
      >
        Return to Command
      </button>
    </div>
  );

  return (
    <>
      <Head><title>Audit: {id?.slice(0,8)} | HomeRatesYard</title></Head>

      <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* --- EXECUTIVE BANNER --- */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl border border-slate-800">
           <div className="absolute inset-0 pointer-events-none opacity-10">
              <Shield size={400} className="absolute -right-20 -bottom-20 text-white/20 rotate-12" />
           </div>

           <div className="relative z-10 flex flex-col items-start justify-between gap-10 xl:flex-row xl:items-center">
              <div className="flex items-start gap-6">
                 <button 
                   onClick={() => router.back()}
                   className="p-3.5 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-white/80"
                 >
                    <ArrowLeft size={20} />
                 </button>
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Asset Audit Terminal</span>
                       {/* 🟢 SAFE ACCESSOR */}
                       <StatusPill status={loan?.status} />
                    </div>
                    <h1 className="flex items-center gap-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                       <span className="text-2xl opacity-50">#</span>
                       <span className="font-mono tracking-tighter">{id}</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                       Borrower Identity: <span className="text-white">{loan?.borrower?.name || 'Unknown'}</span>
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button 
                   disabled={actionLoading || loan?.status === 'rejected'}
                   onClick={() => executeDecision('rejected')}
                   className="h-12 px-8 flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                 >
                    <Ban size={14} /> Flag Risk
                 </button>
                 <button 
                   disabled={actionLoading || loan?.status === 'approved'}
                   onClick={() => executeDecision('approved')}
                   className="h-12 px-8 flex items-center gap-2 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all active:scale-95 disabled:opacity-50"
                 >
                    <CheckCircle2 size={14} /> Authorize Funding
                 </button>
              </div>
           </div>
        </div>

        {/* --- TELEMETRY GRID --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
           <AuditTile label="Principal Value" value={`$${Number(loan?.amount || 0).toLocaleString()}`} icon={DollarSign} sub="Requested Allocation" />
           <AuditTile label="Collateral Value" value={`$${Number(loan?.propertyValue || 0).toLocaleString()}`} icon={Home} sub="Market Estimate" />
           <AuditTile label="Risk Ratio (LTV)" value={`${loan?.ltv || 'N/A'}%`} icon={Activity} sub="Loan-to-Value" highlight={Number(loan?.ltv) > 80} />
           <AuditTile label="Debt Ratio (DTI)" value={`${loan?.dti || 'N/A'}%`} icon={Briefcase} sub="Debt-to-Income" highlight={Number(loan?.dti) > 43} />
        </div>

        {/* --- DEEP DIVE SECTIONS --- */}
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
           
           <section className="space-y-10 xl:col-span-2">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                 <SectionHeader icon={Briefcase} title="Underwriting Parameters" />
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
                    <DataPoint label="Interest Rate" value={`${loan?.interestRate || 'TBD'}%`} />
                    <DataPoint label="Amortization" value={`${loan?.term || 360} Months`} />
                    <DataPoint label="Occupancy" value={loan?.occupancyType || 'Primary'} />
                    <DataPoint label="Credit Score" value={loan?.creditScore || '720+'} />
                    <DataPoint label="Product" value={loan?.loanType?.replace('_', ' ') || 'CONVENTIONAL'} />
                    <DataPoint label="Lender ID" value={`#${loan?.lenderId?.slice(0,8) || 'SYSTEM'}`} />
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                 <SectionHeader icon={FileText} title="Verified Artifacts" />
                 <div className="mt-6 space-y-4">
                    {loan?.documents?.length > 0 ? loan.documents.map(doc => (
                      <ArtifactRow key={doc.id} doc={doc} />
                    )) : (
                      <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                         <FileText size={32} className="mx-auto mb-2 text-slate-200" />
                         <p className="text-xs font-bold tracking-wide uppercase text-slate-400">No artifacts in digital vault</p>
                      </div>
                    )}
                 </div>
              </div>
           </section>

           <aside className="space-y-10">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-10">
                 <SectionHeader icon={Clock} title="Transactional Audit" />
                 <div className="mt-8 space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200/50">
                    <TimelineNode label="Application Drafted" date={loan?.createdAt} status="done" />
                    <TimelineNode label="Submission Locked" date={loan?.updatedAt} status="done" />
                    <TimelineNode label="Underwriting Review" date="Current Stage" status="active" />
                    {loan?.status === 'funded' && <TimelineNode label="Assets Disbursed" date="Finalized" status="done" />}
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                 <SectionHeader icon={Home} title="Collateral Location" />
                 <div className="relative z-10 mt-6">
                    <p className="text-lg font-bold leading-snug text-slate-900">
                       {loan?.propertyAddress || 'Address data unavailable'}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">Zip Code: {loan?.propertyZip || 'N/A'}</p>
                 </div>
                 <Home size={150} className="absolute transition-colors duration-500 -right-6 -bottom-6 text-slate-50 group-hover:text-emerald-50" />
              </div>
           </aside>
        </div>
      </div>
    </>
  );
}

// --- COMPONENTS ---

const AuditTile = ({ label, value, icon: Icon, sub, highlight }) => (
  <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
     <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <Icon size={18} className="transition-colors text-slate-200 group-hover:text-slate-900" />
     </div>
     <h3 className={cn("text-2xl font-bold tracking-tight font-mono", highlight && "text-red-600")}>{value}</h3>
     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{sub}</p>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
     <Icon size={16} className="text-slate-400" />
     <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">{title}</h3>
  </div>
);

const DataPoint = ({ label, value }) => (
  <div>
     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">{label}</p>
     <p className="text-sm font-bold text-slate-900">{value}</p>
  </div>
);

const ArtifactRow = ({ doc }) => (
  <div className="flex items-center justify-between p-5 transition-all border bg-slate-50/50 border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 group">
     <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:text-red-500 transition-colors">
           <FileText size={18} strokeWidth={1.5} />
        </div>
        <div>
           <p className="text-xs font-bold tracking-wide uppercase text-slate-900">{doc.type?.replace(/_/g, ' ')}</p>
           <p className="text-[10px] font-medium text-slate-400 mt-0.5">Status: <span className="uppercase">{doc.status}</span></p>
        </div>
     </div>
     <button className="p-2 transition-colors text-slate-300 hover:text-slate-900">
        <Download size={18} />
     </button>
  </div>
);

const TimelineNode = ({ label, date, status }) => (
  <div className="relative flex gap-5">
     <div className={cn(
       "w-6 h-6 rounded-full border-2 bg-white z-10 flex items-center justify-center shrink-0 shadow-sm",
       status === 'done' ? "border-emerald-500 text-emerald-500" : "border-slate-300 text-slate-300"
     )}>
        {status === 'done' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" />}
     </div>
     <div className="pb-1">
        <p className="text-xs font-bold text-slate-900">{label}</p>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 font-mono">
           {status === 'active' ? 'IN_PROGRESS' : date ? new Date(date).toLocaleDateString() : 'PENDING'}
        </p>
     </div>
  </div>
);

const StatusPill = ({ status }) => {
  const styles = {
    approved: "bg-emerald-500 text-slate-900",
    rejected: "bg-red-500 text-white",
    pending: "bg-orange-500 text-white",
    default: "bg-slate-700 text-white"
  };
  const current = styles[status?.toLowerCase()] || styles.default;
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", current)}>
      {status || 'UNKNOWN'}
    </span>
  );
};

LoanAuditDetail.getLayout = (page) => (
  <RouteGuard roles={['super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);