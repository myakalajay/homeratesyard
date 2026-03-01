import React from 'react';
import { useForm } from 'react-hook-form';
import { Home, MapPin, Building, Check } from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';
import { cn } from '@/utils/utils';

// Helper Component
const SelectCard = ({ value, current, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 gap-3 w-full h-32 relative",
      current === value
        ? "border-primary bg-primary/5 text-primary shadow-md ring-1 ring-primary/20" 
        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
    )}
  >
    <Icon size={28} className={current === value ? "text-primary" : "text-slate-400"} />
    <span className="text-sm font-bold">{label}</span>
    {current === value && <div className="absolute top-2 right-2 text-primary"><Check size={14} /></div>}
  </button>
);

export default function Step2Property() {
  const { formData, updateFormData, nextStep, prevStep } = useLoanApplication();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: formData.loan,
    mode: "onBlur"
  });

  const propertyType = watch("propertyType");
  const usage = watch("usage");

  const onSubmit = (data) => {
    updateFormData('loan', data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
      
      {/* 1. PROPERTY TYPE */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">What type of property is this?</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SelectCard value="single-family" current={propertyType} onClick={() => setValue("propertyType", "single-family")} icon={Home} label="Single Family" />
          <SelectCard value="condo" current={propertyType} onClick={() => setValue("propertyType", "condo")} icon={Building} label="Condo" />
          <SelectCard value="townhouse" current={propertyType} onClick={() => setValue("propertyType", "townhouse")} icon={Home} label="Townhouse" />
          <SelectCard value="multi-family" current={propertyType} onClick={() => setValue("propertyType", "multi-family")} icon={Building} label="Multi-Family" />
        </div>
      </div>

      {/* 2. USAGE */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">How will you use this property?</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Primary Residence', 'Second Home', 'Investment'].map((type) => {
            const val = type.toLowerCase().split(' ')[0];
            return (
              <button
                key={val}
                type="button"
                onClick={() => setValue("usage", val)}
                className={cn("p-4 border rounded-xl text-left transition-all relative", usage === val ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300')}
              >
                <span className="block font-bold text-slate-900">{type}</span>
                <span className="text-xs text-slate-500">
                  {val === 'primary' ? 'I will live here full-time.' : val === 'second' ? 'Vacation or part-time.' : 'Rental property.'}
                </span>
                {usage === val && <Check size={16} className="absolute top-4 right-4 text-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. ADDRESS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Property Address</h3>
        <div className="relative group">
          <MapPin className="absolute transition-colors top-3 left-3 text-slate-400 group-focus-within:text-primary" size={18} />
          <input 
            {...register("address", { required: "Address is required" })}
            placeholder="Enter address (e.g. 123 Main St)"
            className="w-full py-3 pl-10 pr-4 transition-all bg-white border outline-none border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input {...register("city", { required: true })} placeholder="City" className="w-full px-4 py-3 bg-white border outline-none border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <input {...register("zip", { required: true })} placeholder="Zip Code" className="w-full px-4 py-3 bg-white border outline-none border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50">Back</Button>
        <Button type="submit" className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary-hover">Next: Income</Button>
      </div>
    </form>
  );
}