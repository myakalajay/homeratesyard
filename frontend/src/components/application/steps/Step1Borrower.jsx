import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Users, Heart } from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';
import { cn } from '@/utils/utils';

// --- SUB-COMPONENT: Input Field ---
const FormInput = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <div className="relative group">
      <div className="absolute transition-colors left-3 top-3 text-slate-400 group-focus-within:text-primary">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className={cn(
          "w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none transition-all font-medium text-slate-900",
          error 
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
            : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-slate-300"
        )}
      />
    </div>
    {error && <p className="text-xs font-bold text-red-600 animate-in slide-in-from-top-1">{error.message}</p>}
  </div>
);

// --- SUB-COMPONENT: Selection Card ---
const SelectCard = ({ icon: Icon, label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 gap-2 w-full",
      selected 
        ? "border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]" 
        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
    )}
  >
    <Icon size={24} className={selected ? "fill-current" : ""} />
    <span className="text-sm font-bold">{label}</span>
  </button>
);

export default function Step1Borrower() {
  const { formData, updateFormData, nextStep } = useLoanApplication();
  
  // Initialize React Hook Form with Context Data
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: formData.borrower,
    mode: "onBlur"
  });

  const maritalStatus = watch("maritalStatus");
  const applicationType = watch("applicationType"); // Watch for joint vs individual

  const onSubmit = (data) => {
    updateFormData('borrower', data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
      
      {/* 1. PERSONAL DETAILS */}
      <div className="space-y-6">
        <h3 className="pb-2 text-lg font-bold border-b text-slate-900 border-slate-100">
            Personal Details
        </h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput 
                label="First Name" 
                icon={User}
                placeholder="e.g. Alex"
                error={errors.firstName}
                {...register("firstName", { required: "First name is required" })}
            />
            <FormInput 
                label="Last Name" 
                icon={User}
                placeholder="e.g. Morgan"
                error={errors.lastName}
                {...register("lastName", { required: "Last name is required" })}
            />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput 
                label="Email Address" 
                icon={Mail}
                type="email"
                placeholder="alex@example.com"
                error={errors.email}
                {...register("email", { 
                    required: "Email is required",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                    }
                })}
            />
            <FormInput 
                label="Phone Number" 
                icon={Phone}
                type="tel"
                placeholder="(555) 000-0000"
                error={errors.phone}
                {...register("phone", { 
                    required: "Phone is required",
                    pattern: {
                        value: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                        message: "Invalid phone format"
                    }
                })}
            />
        </div>
      </div>

      {/* 2. MARITAL STATUS */}
      <div className="space-y-4">
        <h3 className="pb-2 text-lg font-bold border-b text-slate-900 border-slate-100">
            Marital Status
        </h3>
        <p className="-mt-2 text-sm text-slate-500">This affects how we calculate your household income eligibility.</p>
        
        <div className="grid grid-cols-3 gap-4">
            {['Married', 'Unmarried', 'Separated'].map((status) => (
                <SelectCard 
                    key={status}
                    icon={Heart}
                    label={status}
                    selected={maritalStatus === status}
                    onClick={() => setValue("maritalStatus", status)}
                />
            ))}
        </div>
        <input type="hidden" {...register("maritalStatus", { required: true })} />
        {errors.maritalStatus && <p className="text-xs font-bold text-red-600">Please select a status.</p>}
      </div>

      {/* 3. DEPENDENTS */}
      <div className="space-y-4">
        <h3 className="pb-2 text-lg font-bold border-b text-slate-900 border-slate-100">
            Dependents
        </h3>
        
        <div className="flex items-center justify-between p-4 border bg-slate-50 rounded-xl border-slate-200">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm text-slate-500">
                    <Users size={24} />
                </div>
                <div>
                    <p className="font-bold text-slate-900">Number of Dependents</p>
                    <p className="text-xs text-slate-500">Excluding yourself and spouse.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    type="button"
                    onClick={() => setValue("dependents", Math.max(0, (watch("dependents") || 0) - 1))}
                    className="flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-lg border-slate-300 text-slate-600 hover:border-primary hover:text-primary"
                >
                    -
                </button>
                <span className="w-8 text-lg font-bold text-center text-slate-900">
                    {watch("dependents") || 0}
                </span>
                <button 
                    type="button"
                    onClick={() => setValue("dependents", (watch("dependents") || 0) + 1)}
                    className="flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-lg border-slate-300 text-slate-600 hover:border-primary hover:text-primary"
                >
                    +
                </button>
                <input type="hidden" {...register("dependents")} />
            </div>
        </div>
      </div>

      {/* 4. CO-BORROWER TOGGLE (NEW) */}
      <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
            <div className="p-2 mt-1 text-blue-600 bg-white rounded-lg shadow-sm">
                <Users size={20} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-900">Applying with someone else?</h4>
                <p className="mt-1 mb-3 text-xs text-blue-700">Adding a co-borrower can help improve your borrowing power if they have income.</p>
                
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="radio" 
                                value="individual" 
                                {...register("applicationType")} 
                                className="sr-only peer" 
                            />
                            <div className="w-4 h-4 transition-all bg-white border-2 border-blue-300 rounded-full peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                        </div>
                        <span className="text-sm font-medium text-blue-900 group-hover:text-blue-700">Individual Credit</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="radio" 
                                value="joint" 
                                {...register("applicationType")} 
                                className="sr-only peer" 
                            />
                            <div className="w-4 h-4 transition-all bg-white border-2 border-blue-300 rounded-full peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                        </div>
                        <span className="text-sm font-medium text-blue-900 group-hover:text-blue-700">Joint Application</span>
                    </label>
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-2">
        <Button 
            type="submit" 
            className="w-full py-4 text-base shadow-xl bg-primary hover:bg-primary-hover shadow-primary/20"
        >
            Save & Continue
        </Button>
      </div>

    </form>
  );
}