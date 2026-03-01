import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Lock, Save } from 'lucide-react';
import Logo from '@/components/navigation/shared/Logo';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { cn } from '@/utils/utils';

const STEPS = [
  { id: 1, label: 'Borrower Info' },
  { id: 2, label: 'Property' },
  { id: 3, label: 'Income & Assets' },
  { id: 4, label: 'Declarations' },
  { id: 5, label: 'Review' },
];

const WizardLayout = ({ children, title, subtitle }) => {
  const { currentStep, isSaving } = useLoanApplication();
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      
      {/* 1. Minimal Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:px-8">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 transition-colors rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <ChevronLeft size={20} />
            </Link>
            <Logo />
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className={cn("flex items-center gap-1.5 transition-opacity", isSaving ? "opacity-100" : "opacity-0")}>
                <Save size={12} className="animate-spin" /> Saving...
            </span>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                <Lock size={12} /> Bank-Level Security (256-bit)
            </div>
        </div>
      </header>

      {/* 2. Progress Bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
            className="h-full transition-all duration-500 ease-out bg-primary" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* 3. Main Content */}
      <main className="flex-1 w-full max-w-2xl p-6 mx-auto md:p-12">
        
        {/* Step Indicator */}
        <div className="mb-8">
            <span className="text-xs font-bold tracking-wider uppercase text-primary">
                Step {currentStep} of {STEPS.length}
            </span>
            <h1 className="mt-2 mb-2 text-2xl font-bold md:text-3xl font-display text-slate-900">
                {title}
            </h1>
            {subtitle && (
                <p className="text-lg text-slate-500">{subtitle}</p>
            )}
        </div>

        {/* Form Content */}
        <div className="p-6 duration-500 bg-white border shadow-sm rounded-2xl border-slate-200 md:p-8 animate-in fade-in slide-in-from-bottom-4">
            {children}
        </div>

      </main>

      {/* 4. Footer */}
      <footer className="py-6 text-xs text-center text-slate-400">
        <p>© {new Date().getFullYear()} HomeRatesYard. NMLS #123456.</p>
      </footer>

    </div>
  );
};

export default WizardLayout;