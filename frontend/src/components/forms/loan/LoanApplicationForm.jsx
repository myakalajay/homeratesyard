import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  ArrowRight, ArrowLeft, Save, CheckCircle2, 
  AlertCircle, Building2, User, DollarSign, FileText 
} from 'lucide-react';
import { useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import { useToast } from '@/context/ToastContext';
import { loanService } from '@/services/loan.service';
import { cn } from '@/utils/utils';

// UI Primitives
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select'; // Assumed component

// ==========================================
// 🧩 SUB-COMPONENTS (STEPS)
// ==========================================

const Step1Borrower = ({ data, update }) => (
  <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-right-4">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
      <User className="w-5 h-5 text-red-600" /> Borrower Information
    </h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input 
        label="First Name" 
        value={data.firstName} 
        onChange={(e) => update({ firstName: e.target.value })} 
        required 
      />
      <Input 
        label="Last Name" 
        value={data.lastName} 
        onChange={(e) => update({ lastName: e.target.value })} 
        required 
      />
      <Input 
        label="Email" 
        type="email" 
        value={data.email} 
        onChange={(e) => update({ email: e.target.value })} 
        required 
      />
      <Input 
        label="Phone" 
        type="tel" 
        value={data.phone} 
        onChange={(e) => update({ phone: e.target.value })} 
        required 
      />
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-700">Marital Status</label>
        <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
            value={data.maritalStatus}
            onChange={(e) => update({ maritalStatus: e.target.value })}
        >
            <option value="">Select Status</option>
            <option value="married">Married</option>
            <option value="unmarried">Unmarried</option>
            <option value="separated">Separated</option>
        </select>
      </div>
    </div>
  </div>
);

const Step2Property = ({ data, update }) => (
  <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-right-4">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
      <Building2 className="w-5 h-5 text-red-600" /> Property Details
    </h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
          <Input 
            label="Street Address" 
            value={data.address} 
            onChange={(e) => update({ address: e.target.value })} 
            placeholder="123 Main St"
          />
      </div>
      <Input 
        label="City" 
        value={data.city} 
        onChange={(e) => update({ city: e.target.value })} 
      />
      <div className="grid grid-cols-2 gap-2">
        <Input 
            label="State" 
            value={data.state} 
            onChange={(e) => update({ state: e.target.value })} 
            maxLength={2}
            placeholder="NY"
        />
        <Input 
            label="Zip Code" 
            value={data.zip} 
            onChange={(e) => update({ zip: e.target.value })} 
            maxLength={5}
        />
      </div>
      <Input 
        label="Estimated Value ($)" 
        type="number" 
        value={data.estimatedValue} 
        onChange={(e) => update({ estimatedValue: parseFloat(e.target.value) || 0 })} 
      />
       <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-700">Loan Purpose</label>
        <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
            value={data.purpose}
            onChange={(e) => update({ purpose: e.target.value })}
        >
            <option value="purchase">Purchase</option>
            <option value="refinance">Refinance</option>
            <option value="heloc">HELOC</option>
        </select>
      </div>
    </div>
  </div>
);

const Step3Financials = ({ data, update }) => (
  <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-right-4">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
      <DollarSign className="w-5 h-5 text-red-600" /> Income & Assets
    </h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input 
        label="Annual Income ($)" 
        type="number" 
        value={data.annualIncome} 
        onChange={(e) => update({ annualIncome: parseFloat(e.target.value) || 0 })} 
      />
      <Input 
        label="Monthly Debt Obligations ($)" 
        type="number" 
        value={data.monthlyDebt} 
        onChange={(e) => update({ monthlyDebt: parseFloat(e.target.value) || 0 })} 
        placeholder="Credit cards, car loans, etc."
      />
      <Input 
        label="Liquid Assets ($)" 
        type="number" 
        value={data.assets} 
        onChange={(e) => update({ assets: parseFloat(e.target.value) || 0 })} 
        placeholder="Savings, Stocks, checking"
      />
       <Input 
        label="Self-Reported Credit Score" 
        type="number" 
        value={data.creditScore} 
        onChange={(e) => update({ creditScore: parseInt(e.target.value) || 0 })} 
        maxLength={3}
      />
    </div>
    <div className="flex items-start gap-2 p-3 text-sm text-blue-800 border border-blue-100 rounded-md bg-blue-50">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>We will verify this information later with documentation (Paystubs, W2s, etc). Please provide your best estimates.</p>
    </div>
  </div>
);

// ==========================================
// 🧙‍♂️ MAIN WIZARD COMPONENT
// ==========================================

export default function LoanApplicationForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const { 
    formData, updateFormData, 
    currentStep, nextStep, prevStep, 
    isSaving, clearDraft 
  } = useLoanApplication();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🛡️ STEP VALIDATION
  const handleNext = () => {
    // Simple validation logic (expand as needed)
    if (currentStep === 1) {
        if (!formData.borrower.firstName || !formData.borrower.lastName || !formData.borrower.email) {
            addToast("Please complete all required borrower fields.", "error");
            return;
        }
    }
    if (currentStep === 2) {
        if (!formData.loan.address || !formData.loan.estimatedValue) {
            addToast("Property address and value are required.", "error");
            return;
        }
    }
    nextStep();
  };

  // 🚀 FINAL SUBMISSION
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        // Transform Context Data to API Payload structure
        const payload = {
            amount: formData.loan.amount || (formData.loan.estimatedValue * 0.8), // Default to 80% LTV if not specified
            term: 360, // Default 30 year
            loanType: 'mortgage', // Or map from formData.loan.purpose
            propertyAddress: `${formData.loan.address}, ${formData.loan.city}, ${formData.loan.state} ${formData.loan.zip}`,
            propertyValue: formData.loan.estimatedValue,
            // Backend will pull user ID from Token
        };

        await loanService.createApplication(payload);
        
        addToast("Application Submitted Successfully!", "success");
        clearDraft(); // Wipe local storage
        router.push('/dashboard?new_application=success');
        
    } catch (error) {
        console.error(error);
        addToast(error.message || "Submission failed. Please try again.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Render Step Content
  const renderStep = () => {
    switch(currentStep) {
        case 1: return <Step1Borrower data={formData.borrower} update={(d) => updateFormData('borrower', d)} />;
        case 2: return <Step2Property data={formData.loan} update={(d) => updateFormData('loan', d)} />;
        case 3: return <Step3Financials data={formData.income} update={(d) => updateFormData('income', d)} />;
        default: return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* 🟢 PROGRESS HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-sm font-medium text-slate-500">
            <span>Step {currentStep} of 3</span>
            <div className="flex items-center gap-2">
                {isSaving && (
                    <span className="flex items-center gap-1 text-xs text-orange-500 animate-pulse">
                        <Save className="w-3 h-3" /> Saving Draft...
                    </span>
                )}
                {!isSaving && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3"/> Draft Saved</span>}
            </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
        </div>
      </div>

      {/* 📝 FORM CARD */}
      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 min-h-[400px] flex flex-col justify-between">
        
        {/* Step Content */}
        <div className="mb-8">
            {renderStep()}
        </div>

        {/* 🧭 NAVIGATION FOOTER */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1 || isSubmitting}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {currentStep < 3 ? (
                <Button 
                    onClick={handleNext}
                    className="text-white bg-slate-900 hover:bg-slate-800"
                >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="text-white bg-red-600 shadow-lg hover:bg-red-700 shadow-red-500/30"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    {!isSubmitting && <FileText className="w-4 h-4 ml-2" />}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}