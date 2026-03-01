'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { 
  ShieldCheck, UploadCloud, Lock, FileText, 
  Trash2, Eye, CheckCircle2, Clock, AlertCircle, 
  Search, FolderOpen, FileImage, X, Download, RefreshCw
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS & CONSTANTS ---
const formatDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
const formatSize = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';
const VALID_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const DOCUMENT_CATEGORIES = ['Income', 'Assets', 'Identity', 'Property', 'Disclosures'];

export default function SecureVaultPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- UPLOAD STATES ---
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadQueueText, setUploadQueueText] = useState('');
  const [replacingDocId, setReplacingDocId] = useState(null); 
  
  // --- INTERACTION STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // --- DB STATE ---
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    setMounted(true);
    const fetchDocuments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setDocuments([
          { id: 'doc-1', name: '2023_W2_Form.pdf', category: 'Income', size: 1250000, uploadDate: new Date().toISOString(), status: 'verified' },
          { id: 'doc-2', name: 'Chase_Bank_Statement_Oct.pdf', category: 'Assets', size: 3400000, uploadDate: new Date().toISOString(), status: 'review' },
          { id: 'doc-3', name: 'Drivers_License_Front.jpg', category: 'Identity', size: 2100000, uploadDate: new Date().toISOString(), status: 'rejected', note: 'Image is too blurry. Please ensure all text is legible and corners are visible.' },
          { id: 'doc-4', name: 'Paystub_Recent.pdf', category: 'Income', size: 850000, uploadDate: new Date().toISOString(), status: 'verified' }
        ]);
      } catch (error) {
        addToast('Failed to load secure vault data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [addToast]);

  // --- ESCAPE KEY HANDLER ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewDoc) setPreviewDoc(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDoc]);

  // --- DRAG & DROP HANDLERS ---
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleBatchUpload(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) handleBatchUpload(e.target.files);
    e.target.value = ''; 
  };

  const handleReplaceSelect = (e) => {
    if (e.target.files.length > 0 && replacingDocId) {
      processUpload(e.target.files[0], replacingDocId);
    }
    e.target.value = ''; 
  };

  // --- BATCH UPLOAD ENGINE ---
  const handleBatchUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Prevent massive dumps
    if (fileArray.length > 10) {
      addToast('Please upload a maximum of 10 files at a time.', 'error');
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadQueueText(`Encrypting ${i + 1} of ${fileArray.length}...`);
      await processUpload(file);
    }

    setIsUploading(false);
    setUploadQueueText('');
    setUploadProgress(0);
  };

  // --- INDIVIDUAL UPLOAD LOGIC ---
  const processUpload = async (file, replaceId = null) => {
    // Strict Validation
    if (!VALID_MIME_TYPES.includes(file.type)) {
      addToast(`${file.name} is an invalid file type. Only PDF, JPG, and PNG are allowed.`, 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      addToast(`${file.name} exceeds 15MB size limit.`, 'error');
      return;
    }

    setUploadProgress(0);

    // Simulate encryption & upload progress
    for (let i = 15; i <= 100; i += 25) {
      await new Promise(r => setTimeout(r, 200)); // Slightly faster per file in batch mode
      setUploadProgress(i);
    }

    if (replaceId) {
      setDocuments(prev => prev.map(doc => 
        doc.id === replaceId 
          ? { ...doc, name: file.name, size: file.size, uploadDate: new Date().toISOString(), status: 'review', note: null }
          : doc
      ));
      addToast(`Replacement file securely uploaded.`, 'success');
      setReplacingDocId(null);
    } else {
      const newDoc = {
        id: `doc-${Date.now()}-${Math.random()}`, // Unique ID for batch processing
        name: file.name,
        category: 'Uncategorized', 
        size: file.size,
        uploadDate: new Date().toISOString(),
        status: 'review'
      };
      setDocuments(prev => [newDoc, ...prev]);
      addToast(`${file.name} securely stored.`, 'success');
    }
  };

  // --- MUTATION HANDLERS ---
  const handleDelete = (id, name, status) => {
    if (status === 'verified') {
      addToast('Verified documents are locked for compliance and cannot be deleted.', 'warning');
      return;
    }
    if (window.confirm(`Permanently delete ${name}?`)) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      addToast('Document permanently deleted.', 'info');
    }
  };

  const handleUpdateCategory = (id, newCategory) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, category: newCategory } : doc));
    addToast('Document categorized successfully.', 'success');
  };

  // --- DERIVED STATE & FILTERING ---
  const filteredDocs = useMemo(() => 
    documents.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [documents, searchQuery]
  );
  
  const groupedDocs = useMemo(() => {
    // Sort logic: Newest first within categories
    const sorted = [...filteredDocs].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return sorted.reduce((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    }, {});
  }, [filteredDocs]);

  const isVaultEmpty = documents.length === 0;
  const isSearchEmpty = !isVaultEmpty && filteredDocs.length === 0;

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <>
      <Head><title>Secure Vault | HomeRatesYard</title></Head>

      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- 1. HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <Lock className="text-[#B91C1C]" size={32} /> 
              Secure Document Vault
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Upload, organize, and securely store your sensitive financial documents.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-200 shadow-sm">
            <ShieldCheck size={16} className="text-emerald-500" />
            AES-256 Bit Encryption
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- 2. LEFT: DROPZONE & SECURITY --- */}
            <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
               
               {/* Drag & Drop Upload Widget */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h2 className="text-base font-bold text-slate-900">Upload Documents</h2>
                     <p className="mt-1 text-xs text-slate-500">Accepted: PDF, JPG, PNG (Max 15MB)</p>
                  </div>
                  
                  <div className="p-6">
                     <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                     {/* Hidden input strictly for replacing rejected files (Single file only) */}
                     <input type="file" ref={replaceInputRef} onChange={handleReplaceSelect} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                     
                     <div 
                       onDragOver={handleDragOver}
                       onDragLeave={handleDragLeave}
                       onDrop={handleDrop}
                       onClick={() => !isUploading && fileInputRef.current?.click()}
                       className={cn(
                         "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300",
                         isDragging ? "border-blue-500 bg-blue-50/50 scale-[0.98]" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30",
                         isUploading ? "pointer-events-none opacity-80" : "cursor-pointer group"
                       )}
                     >
                        {isUploading ? (
                          <>
                            <div className="flex items-center justify-center w-12 h-12 mb-4 text-blue-600 bg-blue-100 rounded-full">
                              <UploadCloud size={24} className="animate-bounce" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">{uploadQueueText || 'Encrypting File...'}</h3>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                              <div className="h-full transition-all duration-300 bg-blue-600" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300", isDragging ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 shadow-sm group-hover:text-blue-500 group-hover:shadow-md")}>
                               <UploadCloud size={28} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Click or drag files here</h3>
                            <p className="mt-2 text-xs font-semibold text-slate-500">Multiple files supported</p>
                          </>
                        )}
                     </div>
                  </div>
               </div>

               {/* Security Assurance Widget */}
               <div className="bg-[#0A1128] border border-slate-800 shadow-xl rounded-[24px] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                     <ShieldCheck size={120} className="-mt-10 -mr-10" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                       <Lock size={16} className="text-blue-400" /> Bank-Level Security
                     </h3>
                     <ul className="space-y-3">
                        <SecurityItem title="AES-256 Encryption" desc="Files are encrypted at rest and in transit." />
                        <SecurityItem title="Restricted Access" desc="Only your verified underwriter can view files." />
                        <SecurityItem title="Immutable Ledger" desc="Verified files are locked for compliance." />
                     </ul>
                  </div>
               </div>

            </div>

            {/* --- 3. RIGHT: DOCUMENT LEDGER --- */}
            <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden flex flex-col min-h-[600px]">
               
               {/* Ledger Header & Search */}
               <div className="flex flex-col justify-between gap-4 p-6 border-b md:p-8 border-slate-100 sm:flex-row sm:items-center">
                  <h2 className="text-lg font-bold text-slate-900">Your File Ledger</h2>
                  <div className="relative w-full sm:w-64 group">
                     <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search documents..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full h-10 pl-10 pr-4 text-sm font-medium transition-all border outline-none border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white"
                     />
                  </div>
               </div>

               {/* Document List Engine */}
               <div className="flex-1 p-6 overflow-y-auto md:p-8 bg-slate-50/30">
                 {isVaultEmpty ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                     <FolderOpen size={48} className="mb-4 text-slate-300" />
                     <h3 className="text-lg font-bold text-slate-900">Vault is Empty</h3>
                     <p className="max-w-sm mt-1 text-sm text-slate-500">Drag and drop files on the left to securely store them in your permanent ledger.</p>
                   </div>
                 ) : isSearchEmpty ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                     <Search size={40} className="mb-4 text-slate-300" />
                     <h3 className="text-base font-bold text-slate-900">No matching documents</h3>
                     <p className="mt-1 text-sm text-slate-500">Try adjusting your search terms.</p>
                   </div>
                 ) : (
                   <div className="space-y-8">
                     {/* Uncategorized section floats to top to encourage tagging */}
                     {groupedDocs['Uncategorized'] && (
                       <DocumentCategoryBlock 
                         category="Uncategorized" 
                         docs={groupedDocs['Uncategorized']} 
                         onPreview={setPreviewDoc}
                         onDelete={handleDelete}
                         onUpdateCategory={handleUpdateCategory}
                       />
                     )}
                     
                     {Object.entries(groupedDocs).map(([category, docs]) => {
                       if (category === 'Uncategorized') return null; 
                       return (
                         <DocumentCategoryBlock 
                           key={category}
                           category={category} 
                           docs={docs} 
                           onPreview={setPreviewDoc}
                           onDelete={handleDelete}
                           onReplace={(id) => { setReplacingDocId(id); replaceInputRef.current?.click(); }}
                         />
                       );
                     })}
                   </div>
                 )}
               </div>

            </div>
          </div>
        )}
      </div>

      {/* --- 4. SECURE PREVIEW MODAL --- */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewDoc(null)} />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center min-w-0 gap-3 pr-4 text-white">
                 <FileText size={20} className="text-blue-400 shrink-0" />
                 <h3 className="text-sm font-bold truncate">{previewDoc.name}</h3>
                 <span className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md hidden sm:block shrink-0">Secure Preview</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <button onClick={() => { addToast('Downloading decrypted file...', 'info'); setPreviewDoc(null); }} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                   <Download size={14} /> <span className="hidden sm:block">Download</span>
                 </button>
                 <button onClick={() => setPreviewDoc(null)} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><X size={20} /></button>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center flex-1 p-8 overflow-hidden bg-slate-800">
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                 <ShieldCheck size={400} />
               </div>
               
               <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-2xl p-10 text-center bg-white rounded-lg shadow-2xl">
                  {previewDoc.name.endsWith('.pdf') ? <FileText size={64} className="mb-4 text-slate-300" /> : <FileImage size={64} className="mb-4 text-slate-300" />}
                  <p className="text-lg font-bold text-slate-800">Secure Document Preview</p>
                  <p className="max-w-md mt-2 text-sm text-slate-500">For security reasons, actual file rendering is disabled in this demo environment. In production, this renders the decrypted blob.</p>
                  
                  <div className="w-full max-w-xs pt-8 mt-8 space-y-3 text-left border-t border-slate-100">
                     <div className="flex justify-between overflow-hidden text-xs">
                       <span className="text-slate-500 shrink-0">File Name</span>
                       <span className="pl-4 font-mono font-bold truncate text-slate-900">{previewDoc.name}</span>
                     </div>
                     <div className="flex justify-between text-xs"><span className="text-slate-500">File Size</span><span className="font-mono font-bold text-slate-900">{formatSize(previewDoc.size)}</span></div>
                     <div className="flex justify-between text-xs"><span className="text-slate-500">Uploaded</span><span className="font-mono font-bold text-slate-900">{formatDate(previewDoc.uploadDate)}</span></div>
                     <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="font-bold uppercase text-slate-900">{previewDoc.status}</span></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

// ==========================================
// 🧱 MICRO-COMPONENTS
// ==========================================

const DocumentCategoryBlock = ({ category, docs, onPreview, onDelete, onReplace, onUpdateCategory }) => (
  <div className="duration-500 animate-in fade-in">
    <div className="flex items-center gap-3 mb-4">
      <h3 className={cn(
        "text-xs font-black uppercase tracking-[0.2em]",
        category === 'Uncategorized' ? "text-orange-500" : "text-slate-400"
      )}>
        {category}
      </h3>
      <span className="px-2 py-0.5 bg-slate-200/50 rounded-md text-slate-500 text-[10px] font-bold">{docs.length}</span>
    </div>
    
    <div className="space-y-3">
       {docs.map(doc => (
         <DocumentRow 
           key={doc.id} 
           doc={doc} 
           onPreview={() => onPreview(doc)}
           onDelete={() => onDelete(doc.id, doc.name, doc.status)} 
           onReplace={() => onReplace(doc.id)}
           onUpdateCategory={onUpdateCategory}
         />
       ))}
    </div>
  </div>
);

const DocumentRow = ({ doc, onPreview, onDelete, onReplace, onUpdateCategory }) => {
  const statusConfig = {
    verified: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Verified' },
    review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'In Review' },
    rejected: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Action Required' }
  };

  const config = statusConfig[doc.status] || statusConfig.review;
  const isLocked = doc.status === 'verified';
  const isRejected = doc.status === 'rejected';

  return (
    <div className={cn(
      "group flex flex-col p-4 border rounded-2xl transition-all shadow-sm",
      isRejected ? "border-red-300 bg-white shadow-md shadow-red-100/50" : "border-slate-200 bg-white hover:border-slate-300"
    )}>
       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          
          <div className="flex items-start flex-1 min-w-0 gap-4">
             <div className={cn("p-3 rounded-xl flex-shrink-0 mt-0.5", config.bg, config.color)}>
               {doc.name.endsWith('.pdf') ? <FileText size={20} /> : <FileImage size={20} />}
             </div>
             <div className="flex-1 min-w-0">
               <h4 className="text-sm font-bold truncate text-slate-900" title={doc.name}>{doc.name}</h4>
               <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>{formatSize(doc.size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.uploadDate)}</span>
               </div>
               
               {/* Inline Categorization for Uncategorized files */}
               {doc.category === 'Uncategorized' && onUpdateCategory && (
                 <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-semibold text-slate-500 shrink-0">Label as:</span>
                    <select 
                      onChange={(e) => onUpdateCategory(doc.id, e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold text-blue-700 transition-colors border border-blue-200 rounded-md outline-none cursor-pointer bg-blue-50 hover:bg-blue-100 sm:w-auto"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Type...</option>
                      {DOCUMENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
               )}

               {/* Rejection Note */}
               {isRejected && doc.note && (
                 <div className="p-3 mt-3 border border-red-100 bg-red-50 rounded-xl">
                   <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-1"><AlertCircle size={14} /> Underwriter Note:</p>
                   <p className="text-xs font-medium leading-relaxed text-red-700">{doc.note}</p>
                 </div>
               )}
             </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t sm:justify-end sm:ml-4 border-slate-100 sm:border-0 sm:pt-0 shrink-0">
             
             {isRejected ? (
               <button 
                 onClick={onReplace}
                 className="flex items-center gap-2 px-4 py-2 bg-[#B91C1C] text-white text-xs font-bold rounded-xl hover:bg-red-800 transition-all shadow-md active:scale-95"
               >
                 <UploadCloud size={14} /> Replace File
               </button>
             ) : (
               <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold", config.bg, config.color, config.border)}>
                  <config.icon size={14} />
                  <span className="hidden sm:inline-block">{config.label}</span>
               </div>
             )}

             <div className="flex items-center gap-1 ml-2">
                <button onClick={onPreview} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Preview Document">
                  <Eye size={18} />
                </button>
                {isLocked ? (
                  <button className="p-2 cursor-not-allowed text-slate-300" title="Locked by Underwriter">
                    <Lock size={18} />
                  </button>
                ) : (
                  <button onClick={onDelete} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete Document">
                    <Trash2 size={18} />
                  </button>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

const SecurityItem = ({ title, desc }) => (
  <li className="flex items-start gap-3">
    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md shrink-0 mt-0.5">
      <CheckCircle2 size={12} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-100">{title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
    </div>
  </li>
);

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="space-y-6 lg:col-span-4">
      <div className="h-[250px] bg-slate-200 rounded-[24px]" />
      <div className="h-[200px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="lg:col-span-8">
      <div className="h-[600px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);

SecureVaultPage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);