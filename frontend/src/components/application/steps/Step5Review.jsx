import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Edit2, Loader2 } from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { Button } from '@/components/ui/primitives/Button';

const SectionSummary = ({ title, data, onEdit }) => (
  <div className="p-4 border bg-slate-50 rounded-xl border-slate-200">
    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <button onClick={onEdit} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <Edit2 size={10} /> Edit
      </button>
    </div>
    <div className="grid grid-cols-2 text-xs gap-y-2">
      {Object.entries(data).map(([key, value]) => {
         if (!value || typeof value === 'object') return null;
         return (
            <React.Fragment key={key}>
                <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-bold text-right text-slate-800">{value.toString()}</span>
            </React.Fragment>
         )
      })}
    </div>
  </div>
);

export default function Step5Review() {
  const { formData, prevStep, setCurrentStep } = useLoanApplication();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-8">
      
      <div className="flex items-start gap-3 p-4 border border-green-100 bg-green-50 rounded-xl">
        <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
        <div>
            <h3 className="text-sm font-bold text-green-800">Ready to Submit</h3>
            <p className="mt-1 text-xs text-green-700">Please review your information below. Once submitted, your loan officer will be notified.</p>
        </div>
      </div>

      <div className="space-y-4">
        <SectionSummary title="Borrower Info" data={formData.borrower} onEdit={() => setCurrentStep(1)} />
        <SectionSummary title="Property" data={formData.loan} onEdit={() => setCurrentStep(2)} />
        <SectionSummary title="Financials" data={formData.income} onEdit={() => setCurrentStep(3)} />
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isSubmitting}>Back</Button>
        <Button onClick={handleSubmit} className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary-hover" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}