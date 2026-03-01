import React from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Info } from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';

export default function Step6HMDA() {
  const { formData, updateFormData, nextStep, prevStep } = useLoanApplication();
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: formData.hmda || { declined: false },
  });

  const declined = watch('declined');

  const onSubmit = (data) => {
    updateFormData('hmda', data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
      
      {/* DISCLAIMER BOX */}
      <div className="p-5 space-y-2 text-xs border bg-slate-50 border-slate-200 rounded-xl text-slate-500">
        <div className="flex items-center gap-2 mb-1 font-bold text-slate-900">
            <ShieldCheck size={16} /> Government Monitoring Information
        </div>
        <p>
            The following information is requested by the Federal Government for certain types of loans related to a dwelling in order to monitor the lender's compliance with equal credit opportunity, fair housing, and home mortgage disclosure laws.
        </p>
        <p>
            You are not required to furnish this information, but are encouraged to do so. The law provides that a lender may not discriminate either on the basis of this information, or on whether you choose to furnish it.
        </p>
      </div>

      {/* DECLINE TOGGLE */}
      <div className="flex items-center gap-3 p-4 border cursor-pointer border-slate-200 rounded-xl hover:bg-slate-50" onClick={() => setValue('declined', !declined)}>
        <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            {...register('declined')}
        />
        <span className="text-sm font-bold text-slate-900">I do not wish to furnish this information</span>
      </div>

      {/* DEMOGRAPHICS FORM (Hidden if Declined) */}
      {!declined && (
        <div className="pl-2 space-y-6 border-l-2 border-slate-100">
            
            {/* ETHNICITY */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Ethnicity</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="radio" value="hispanic" {...register('ethnicity')} /> Hispanic or Latino
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="radio" value="not_hispanic" {...register('ethnicity')} /> Not Hispanic or Latino
                    </label>
                </div>
            </div>

            {/* RACE */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Race</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White'].map(race => (
                        <label key={race} className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" value={race} {...register('race')} /> {race}
                        </label>
                    ))}
                </div>
            </div>

            {/* SEX */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Sex</label>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="radio" value="female" {...register('sex')} /> Female
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="radio" value="male" {...register('sex')} /> Male
                    </label>
                </div>
            </div>

        </div>
      )}

      {/* FOOTER */}
      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-1/3">Back</Button>
        <Button type="submit" className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary-hover">Next: Review</Button>
      </div>
    </form>
  );
}