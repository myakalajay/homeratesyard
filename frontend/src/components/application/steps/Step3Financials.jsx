import React from 'react';
import { useForm } from 'react-hook-form';
import { Briefcase, Home, DollarSign, Wallet, Check } from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';
import { cn } from '@/utils/utils';

// Helper Component
const SelectCard = ({ value, current, onClick, icon: Icon, label, description }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 gap-3 w-full h-full min-h-[120px] relative",
            current === value
                ? "border-primary bg-primary/5 text-primary shadow-md ring-1 ring-primary/20" 
                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
        )}
    >
        <Icon size={28} className={current === value ? "text-primary" : "text-slate-400"} />
        <div className="text-center">
            <span className="block text-sm font-bold">{label}</span>
            {description && <span className="text-[10px] opacity-70 block mt-1 leading-tight">{description}</span>}
        </div>
        {current === value && <div className="absolute top-2 right-2 text-primary"><Check size={14} /></div>}
    </button>
);

export default function Step3Financials() {
    const { formData, updateFormData, nextStep, prevStep } = useLoanApplication();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: { ...formData.income, employmentType: 'employed' },
        mode: "onBlur"
    });

    const employmentType = watch("employmentType");

    const onSubmit = (data) => {
        updateFormData('income', data);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
            
            {/* 1. EMPLOYMENT TYPE */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Employment Status</h3>
                <div className="grid grid-cols-3 gap-4">
                    <SelectCard 
                        value="employed" current={employmentType} onClick={() => setValue("employmentType", "employed")} 
                        icon={Briefcase} label="Employed" description="W-2 Employee"
                    />
                    <SelectCard 
                        value="self-employed" current={employmentType} onClick={() => setValue("employmentType", "self-employed")} 
                        icon={Briefcase} label="Self-Employed" description="Business Owner / 1099"
                    />
                    <SelectCard 
                        value="retired" current={employmentType} onClick={() => setValue("employmentType", "retired")} 
                        icon={Home} label="Retired" description="Pension / Social Security"
                    />
                </div>
            </div>

            {/* 2. INCOME INPUTS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Annual Base Income</label>
                    <div className="relative group">
                        <DollarSign className="absolute top-3 left-3 text-slate-400 group-focus-within:text-green-600" size={18} />
                        <input 
                            type="number"
                            {...register("annualIncome", { required: true, min: 10000 })}
                            placeholder="0.00"
                            className="w-full py-3 pl-10 pr-4 font-bold transition-all bg-white border outline-none border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-slate-900"
                        />
                    </div>
                    <p className="text-xs text-slate-500">Gross income before taxes.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Estimated Cash for Close</label>
                    <div className="relative group">
                        <Wallet className="absolute top-3 left-3 text-slate-400 group-focus-within:text-primary" size={18} />
                        <input 
                            type="number"
                            {...register("assets", { required: true })}
                            placeholder="0.00"
                            className="w-full py-3 pl-10 pr-4 font-bold transition-all bg-white border outline-none border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900"
                        />
                    </div>
                    <p className="text-xs text-slate-500">Checking, Savings, 401k, etc.</p>
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-4 pt-6 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50">Back</Button>
                <Button type="submit" className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary-hover">Next: Declarations</Button>
            </div>
        </form>
    );
}