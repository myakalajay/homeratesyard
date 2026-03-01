import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Lock, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// 🟢 FIX: Correctly importing your custom primitives
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';

// ==========================================
// 🎨 INLINE TOGGLE 
// ==========================================
const ToggleSwitch = ({ label, description, isChecked, onChange }) => (
  <div className="flex items-center justify-between p-4 border rounded-xl border-slate-100 bg-slate-50/50">
    <div>
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={() => onChange(!isChecked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/20",
        isChecked ? "bg-emerald-500" : "bg-slate-300"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        isChecked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
);

// ==========================================
// 🛡️ MAIN MODAL COMPONENT
// ==========================================
export default function EditUserModal({ user, isOpen, onClose, onRefresh }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    role: '',
    nmlsId: '',
    isVerified: false
  });

  // Sync state when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        role: user.role || 'borrower',
        nmlsId: user.nmlsId || '',
        isVerified: !!user.isVerified
      });
    }
  }, [user, isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (formData.role === 'lender' && !formData.nmlsId) {
       return addToast("NMLS ID is required for lenders.", "error");
    }

    setLoading(true);
    try {
      const updates = [];
      if (formData.role !== user.role) {
        updates.push(adminService.updateRole(user.id, formData.role));
      }
      
      if (formData.isVerified !== user.isVerified && formData.isVerified) {
        updates.push(adminService.verifyLender(user.id));
      }
      
      await Promise.all(updates);
      
      addToast("User record synchronized successfully", "success");
      onRefresh();
      onClose();
    } catch (err) {
      addToast(err.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Data Array specifically formatted for YOUR custom Select primitive
  const roleOptions = [
    { value: 'borrower', label: 'Borrower' },
    { value: 'lender', label: 'Lender' },
    { value: 'admin', label: 'Administrator' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose} 
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        // 🟢 CRITICAL UX FIX: Removed overflow-hidden so your custom Select dropdown can break out of the modal boundaries!
        className="w-full max-w-md bg-white border shadow-2xl rounded-2xl border-slate-100 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
                <UserIcon size={20} className="text-red-600" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900">Edit User Identity</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Account Management</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              Primary Identity <Lock size={10} />
            </label>
            <Input 
              type="text" 
              readOnly 
              disabled 
              value={user?.name || 'Unknown User'} 
              className="cursor-not-allowed bg-slate-50 text-slate-500 opacity-80 border-slate-200"
            />
          </div>

          {/* 🟢 THE FIX: Perfectly matched to your custom Select primitive API */}
          {/* Note: I added a high z-index class just in case to ensure it floats above the modal */}
          <Select 
            label="ACCESS LEVEL (ROLE)"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            className="z-[999]" 
          />

          {formData.role === 'lender' && (
            <div className="duration-300 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                NMLS Identifier
              </label>
              <Input 
                type="text" 
                placeholder="e.g. 1234567" 
                value={formData.nmlsId} 
                onChange={(e) => setFormData({...formData, nmlsId: e.target.value})}
                className="border-slate-200"
              />
            </div>
          )}

          <ToggleSwitch 
            label="Verified Status"
            description="Grants full platform access based on role."
            isChecked={formData.isVerified}
            onChange={(val) => setFormData({...formData, isVerified: val})}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t rounded-b-2xl bg-slate-50/80 border-slate-100">
          <Button variant="outline" className="flex-1 font-bold h-11 border-slate-200 hover:bg-white" onClick={onClose}>
            Cancel
          </Button>
          
          <Button 
            className="flex-1 gap-2 font-bold text-white bg-red-600 shadow-lg h-11 hover:bg-red-700 shadow-red-600/20 active:scale-[0.98] transition-all border-none"
            onClick={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}