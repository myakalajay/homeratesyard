import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FileText, User, Calendar, DollarSign, Shield, 
  CheckCircle, XCircle, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { useAuthContext } from '@/components/providers/AuthProvider';
import RouteGuard from '@/components/auth/RouteGuard';
import { cn } from '@/utils/utils';
import Link from 'next/link';

export default function AdminLoanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();
  const { user: currentUser } = useAuthContext();
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    if (id) loadLoanDetails();
  }, [id]);

  const loadLoanDetails = async () => {
    try {
      const data = await adminService.getLoanById(id);
      setLoan(data);
    } catch (err) {
      addToast('Error loading file', 'error');
      router.push('/admin/loans');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`⚠️ Are you sure you want to force this loan to ${newStatus.toUpperCase()}?`)) return;
    
    setUpdating(true);
    try {
      await adminService.updateLoanStatus(id, newStatus, "Admin Override");
      setLoan({ ...loan, status: newStatus });
      addToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading file details...</div>;
  if (!loan) return <div className="p-8 text-center">File not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Back Button */}
      <Link href="/admin/loans" className="flex items-center gap-2 text-sm transition-colors text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to Pipeline
      </Link>

      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 p-6 bg-white border shadow-sm rounded-xl border-slate-200 md:flex-row md:items-center">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold text-slate-900">Loan #{loan.id.toString().slice(0,8)}...</h1>
             <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
             )}>
                {loan.status}
             </span>
           </div>
           <p className="flex items-center gap-2 text-sm text-slate-500">
             <Calendar size={14} /> Created on {new Date(loan.createdAt).toLocaleDateString()}
           </p>
        </div>

        {/* Super Admin Actions */}
        {isSuperAdmin && (
          <div className="flex gap-2">
            <button 
                onClick={() => handleStatusChange('approved')} 
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-green-700 transition-colors rounded-lg bg-green-50 hover:bg-green-100"
            >
                <CheckCircle size={16} /> Approve
            </button>
            <button 
                onClick={() => handleStatusChange('rejected')} 
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-700 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
            >
                <XCircle size={16} /> Reject
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Left Column: Loan Info */}
        <div className="space-y-6 md:col-span-2">
            
            {/* Financial Details */}
            <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">
                <h3 className="flex items-center gap-2 mb-4 font-bold text-slate-800">
                    <DollarSign size={20} className="text-blue-500" /> Financial Overview
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Requested Amount</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.amount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Loan Type</p>
                        <p className="text-lg font-medium capitalize text-slate-900">{loan.loanType || 'General Mortgage'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Term Length</p>
                        <p className="text-lg font-medium text-slate-900">{loan.term || '30'} Years</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Property Value</p>
                        <p className="text-lg font-medium text-slate-900">
                           {loan.propertyValue ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.propertyValue) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Documents Section (Mocked if no document model yet) */}
            <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">
                <h3 className="flex items-center gap-2 mb-4 font-bold text-slate-800">
                    <FileText size={20} className="text-orange-500" /> Documents
                </h3>
                <div className="space-y-3">
                    {/* Placeholder for document list */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 border-slate-100">
                        <span className="text-sm font-medium text-slate-700">W-2 Form (2025).pdf</span>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Download</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 border-slate-100">
                        <span className="text-sm font-medium text-slate-700">Credit Report.pdf</span>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Download</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Borrower Info */}
        <div className="space-y-6">
            <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">
                <h3 className="flex items-center gap-2 mb-4 font-bold text-slate-800">
                    <User size={20} className="text-purple-500" /> Borrower
                </h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 text-xl font-bold rounded-full bg-slate-100 text-slate-500">
                        {loan.borrower?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{loan.borrower?.name}</p>
                        <p className="text-xs text-slate-500">{loan.borrower?.email}</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Contact Phone</p>
                        <p className="text-sm font-medium text-slate-700">{loan.borrower?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500">Member Since</p>
                        <p className="text-sm font-medium text-slate-700">
                             {loan.borrower?.createdAt ? new Date(loan.borrower.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100">
                    <button className="w-full py-2 text-sm font-bold transition-colors rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100">
                        Contact Borrower
                    </button>
                </div>
            </div>

            {/* Admin Audit Box */}
            <div className="p-6 text-white shadow-lg bg-slate-900 rounded-xl">
                <h3 className="flex items-center gap-2 mb-2 font-bold">
                    <Shield size={18} className="text-red-500" /> Admin Zone
                </h3>
                <p className="mb-4 text-xs text-slate-400">
                    Actions taken here are logged and irreversible.
                </p>
                <div className="space-y-2 font-mono text-xs text-slate-300">
                    <p>ID: {loan.id}</p>
                    <p>Status: {loan.status.toUpperCase()}</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// Protected Route
AdminLoanDetail.getLayout = (page) => (
  <RouteGuard roles={['admin', 'super_admin']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);