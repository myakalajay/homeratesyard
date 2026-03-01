import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';
import { cn } from '@/utils/utils';

const QUESTIONS = [
  { id: 'citizen', label: 'Are you a U.S. Citizen?' },
  { id: 'primary_residence', label: 'Do you intend to occupy the property as your primary residence?' },
  { id: 'judgments', label: 'Do you have any outstanding judgments against you?' },
  { id: 'bankruptcy', label: 'Have you declared bankruptcy within the past 7 years?' },
];

export default function Step4Declarations() {
  const { formData, updateFormData, nextStep, prevStep } = useLoanApplication();
  const { setValue, watch, handleSubmit } = useForm({
    defaultValues: formData.declarations,
  });

  const values = watch();

  const onSubmit = (data) => {
    updateFormData('declarations', data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
      <div className="space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
            <p className="pr-4 text-sm font-bold text-slate-900">{q.label}</p>
            <div className="flex p-1 rounded-lg bg-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setValue(q.id, true)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                  values[q.id] === true ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setValue(q.id, false)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                  values[q.id] === false ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50">Back</Button>
        <Button type="submit" className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary-hover">Review Application</Button>
      </div>
    </form>
  );
}