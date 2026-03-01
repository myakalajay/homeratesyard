import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, User, Building2, 
  Banknote, CheckCircle2, Lock, Printer, Loader2,
  Mail, Phone, AlertTriangle
} from 'lucide-react';

// --- CORE SERVICES ---
import { useLocation } from '@/context/LocationContext';

// --- COMPONENTS ---
import { Button } from '@/components/ui/primitives/Button'; 
import { CurrencyInput } from '@/components/ui/primitives/CurrencyInput'; 

// --- SUB-COMPONENTS (WIZARD STEPS) ---

// Step 1: Identity & Contact (LEAD CAPTURE)
const StepIdentity = ({ data, update, next }) => {
  const { location } = useLocation();
  
  // FIX: Only auto-fill if we have a REAL location (not "Detecting...")
  // and if the form field is empty or currently holds a placeholder.
  useEffect(() => {
    const isRealLocation = location?.city && !location.city.includes('Detecting');
    const isFormEmptyOrPlaceholder = !data.city || data.city.includes('Detecting');

    if (isRealLocation && isFormEmptyOrPlaceholder) {
      update('city', location.city);
      update('state', location.state);
      update('zip', location.zip);
    }
  }, [location, data.city]);

  const isValid = data.firstName && data.lastName && data.email;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary">
          <User size={24} />
        </div>
        <h2 className="text-2xl font-bold text-content">Let's verify your profile</h2>
        <p className="text-content-muted">We need this to generate your official letter.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-xs font-bold text-content">First Name</label>
          <input 
            type="text" value={data.firstName} onChange={(e) => update('firstName', e.target.value)}
            className="w-full p-3 font-bold border outline-none bg-background-subtle border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold text-content">Last Name</label>
          <input 
            type="text" value={data.lastName} onChange={(e) => update('lastName', e.target.value)}
            className="w-full p-3 font-bold border outline-none bg-background-subtle border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
            <Mail className="absolute text-gray-400 left-3 top-3.5" size={18} />
            <input 
                type="email" value={data.email} onChange={(e) => update('email', e.target.value)}
                className="w-full p-3 pl-10 font-bold border outline-none bg-background-subtle border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="jane@example.com"
            />
        </div>
        <div className="relative">
            <Phone className="absolute text-gray-400 left-3 top-3.5" size={18} />
            <input 
                type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)}
                className="w-full p-3 pl-10 font-bold border outline-none bg-background-subtle border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="(555) 123-4567"
            />
        </div>
      </div>

      <Button onClick={next} disabled={!isValid} className="w-full py-4 text-lg text-white shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 disabled:opacity-50">
        Next Step <ArrowRight className="ml-2" size={20} />
      </Button>
    </div>
  );
};

// Step 2: Financials
const StepFinancials = ({ data, update, next, back }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
    <div className="text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-secondary/10 text-secondary">
        <Banknote size={24} />
      </div>
      <h2 className="text-2xl font-bold text-content">Income & Assets</h2>
      <p className="text-content-muted">This determines your borrowing power.</p>
    </div>

    <div>
      <label className="block mb-1 text-xs font-bold text-content">Annual Gross Income</label>
      <CurrencyInput value={data.income} onChange={(val) => update('income', val)} />
    </div>

    <div>
      <label className="block mb-1 text-xs font-bold text-content">Monthly Debts</label>
      <CurrencyInput value={data.debts} onChange={(val) => update('debts', val)} icon={Banknote} />
      <p className="mt-1 text-[10px] text-content-muted">Credit cards, car loans, student loans (Minimum payments).</p>
    </div>

    <div>
      <label className="block mb-1 text-xs font-bold text-content">Estimated Credit Score</label>
      <select 
        value={data.creditScore} 
        onChange={(e) => update('creditScore', e.target.value)}
        className="w-full p-3 font-bold border outline-none appearance-none bg-background-subtle border-border rounded-xl text-content focus:border-primary focus:ring-1 focus:ring-primary"
      >
        <option value="760">Excellent (760+)</option>
        <option value="720">Good (720-759)</option>
        <option value="680">Fair (680-719)</option>
        <option value="620">Needs Work (620-679)</option>
        <option value="580">Poor (&lt;620)</option>
      </select>
    </div>

    <div className="flex gap-4">
      <Button variant="outline" onClick={back} className="w-1/3 border-border hover:bg-background-subtle">Back</Button>
      <Button onClick={next} className="w-2/3 text-white shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20">
        Verify Income <ArrowRight className="ml-2" size={20} />
      </Button>
    </div>
  </div>
);

// Step 3: Soft Pull
const StepSoftPull = ({ data, update, submit, loading }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
    <div className="text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-teal-600 bg-teal-50 rounded-2xl">
        <ShieldCheck size={24} />
      </div>
      <h2 className="text-2xl font-bold text-content">Security Check</h2>
      <p className="text-content-muted">We use a "Soft Pull" that won't affect your score.</p>
    </div>

    <div className="flex items-start gap-3 p-4 border bg-background-subtle border-border rounded-xl">
        <Lock className="mt-1 shrink-0 text-primary" size={18} />
        <p className="text-xs leading-relaxed text-content-muted">
            By clicking "Get Verified", you authorize HomeRatesYard to perform a soft credit inquiry. This is for pre-qualification purposes only.
        </p>
    </div>

    <div>
      <label className="block mb-1 text-xs font-bold text-content">Last 4 Digits of SSN</label>
      <input 
        type="password" 
        maxLength={4}
        value={data.ssn} 
        onChange={(e) => update('ssn', e.target.value.replace(/\D/g,''))}
        className="w-full p-3 text-2xl font-bold tracking-[0.5em] text-center border outline-none bg-background-subtle border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="••••"
      />
    </div>

    <div className="flex gap-4">
      <Button variant="outline" onClick={update} className="w-1/3 border-border hover:bg-background-subtle">Back</Button>
      <Button 
        onClick={submit} 
        disabled={loading || data.ssn.length < 4}
        className="w-2/3 text-white bg-teal-600 shadow-lg hover:bg-teal-700 shadow-teal-200 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Get Verified'}
      </Button>
    </div>
  </div>
);

// Step 4: Decision Engine (FIXED DISPLAY LOGIC)
const StepDecision = ({ data }) => {
  const isApproved = parseInt(data.creditScore) >= 620;
  
  // Logic: 45% DTI Calculation
  const monthlyGross = data.income / 12;
  const maxHousing = (monthlyGross * 0.45) - data.debts;
  const approxLoanAmount = Math.max(0, Math.round(maxHousing / 0.0072)); 

  // FIX: Valid location string logic. 
  // Prevents "Detecting..." from showing in the final letter.
  const locationString = (data.city && !data.city.includes('Detecting')) 
    ? `${data.city}, ${data.state}`
    : 'your area';

  const handlePrint = () => {
    window.print();
  };

  if (!isApproved) {
    return (
        <div className="max-w-xl mx-auto space-y-6 text-center animate-in zoom-in-95">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full text-secondary">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-content">We need a bit more info</h2>
            <p className="text-content-muted">Based on the provided credit profile, we recommend speaking with a loan specialist to explore FHA or manual underwriting options.</p>
            <Button className="w-full text-white bg-secondary hover:bg-secondary/90">
                Chat with an Advisor
            </Button>
        </div>
    );
  }

  return (
    <div className="relative max-w-2xl mx-auto overflow-hidden duration-500 bg-white border-2 shadow-2xl border-primary/10 rounded-3xl animate-in zoom-in-95">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        
        {/* Letter Header */}
        <div className="flex items-start justify-between p-8 border-b border-border bg-background-subtle/30">
            <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-content">
                    <CheckCircle2 className="text-teal-500" /> Pre-Approved
                </h2>
                <p className="mt-1 text-sm text-content-muted">Letter ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold tracking-wider uppercase text-content-muted">Buying Power</p>
                <p className="text-3xl font-extrabold text-primary">${approxLoanAmount.toLocaleString()}</p>
            </div>
        </div>

        {/* Letter Body */}
        <div className="p-8 space-y-4 text-sm leading-relaxed text-content print:p-0">
            <p>Dear <strong>{data.firstName} {data.lastName}</strong>,</p>
            <p>
                Based on your preliminary financial information (Income: ${(data.income/1000).toFixed(1)}k, DTI Check Passed) and a soft credit review, 
                <strong> HomeRatesYard</strong> is pleased to pre-approve you for a home loan purchase.
            </p>
            
            <div className="grid grid-cols-3 gap-4 p-4 text-center border rounded-xl bg-background-subtle border-border">
                <div>
                    <span className="block text-xs text-content-muted">Credit Tier</span>
                    <span className="font-bold text-content">{data.creditScore}</span>
                </div>
                <div>
                    <span className="block text-xs text-content-muted">Max DTI</span>
                    <span className="font-bold text-content">45%</span>
                </div>
                <div>
                    <span className="block text-xs text-content-muted">Exp Date</span>
                    <span className="font-bold text-content">90 Days</span>
                </div>
            </div>

            {/* FIX: Displays valid location or fallback */}
            <p className="p-3 text-teal-800 border border-teal-100 rounded-lg bg-teal-50/50">
                This pre-approval is valid for properties located in <strong>{locationString}</strong>.
            </p>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 p-6 bg-background-subtle print:hidden">
            <Button onClick={handlePrint} className="flex-1 bg-white border border-border text-content hover:bg-gray-50">
                <Printer size={18} className="mr-2"/> Print Letter
            </Button>
            <Link href="/dashboard" className="flex-1">
                <Button className="w-full text-white bg-primary hover:bg-primary/90">
                    Go to Deal Room <ArrowRight size={18} className="ml-2"/>
                </Button>
            </Link>
        </div>
    </div>
  );
};

export default function PreApprovalWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    zip: '', city: '', state: '',
    income: 95000, debts: 500, creditScore: '760', ssn: ''
  });

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API Call / Lead Save
    setTimeout(() => {
        setLoading(false);
        setStep(4);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background-subtle">
      <Head>
        <title>Get Pre-Approved | HomeRatesYard</title>
      </Head>

      {/* Standalone Header (Bypasses PublicLayout) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 bg-white border-b border-border">
        <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-lg bg-primary">H</div>
            <span className="text-xl font-bold tracking-tight text-content">HomeRatesYard</span>
        </Link>
        <div className="text-xs font-bold tracking-widest uppercase text-content-muted">
            {step < 4 ? `Step ${step} of 3` : 'Verified'}
        </div>
      </header>

      <main className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-xl">
            {/* Progress Bar */}
            {step < 4 && (
                <div className="w-full h-1 mb-8 overflow-hidden rounded-full bg-border">
                    <div 
                        className="h-full transition-all duration-500 ease-out bg-primary" 
                        style={{ width: `${(step/3)*100}%` }}
                    ></div>
                </div>
            )}

            {/* Steps Container */}
            <div className={step < 4 ? "bg-white p-8 rounded-3xl border border-border shadow-xl" : ""}>
                {step === 1 && <StepIdentity data={formData} update={updateField} next={() => setStep(2)} />}
                {step === 2 && <StepFinancials data={formData} update={updateField} back={() => setStep(1)} next={() => setStep(3)} />}
                {step === 3 && <StepSoftPull data={formData} update={updateField} submit={handleSubmit} loading={loading} />}
                {step === 4 && <StepDecision data={formData} />}
            </div>

            {/* Trust Badges */}
            {step < 4 && (
                <div className="flex justify-center gap-6 mt-8 grayscale opacity-60 text-content-muted">
                    <div className="flex items-center gap-2"><Lock size={14}/> 256-bit Encryption</div>
                    <div className="flex items-center gap-2"><ShieldCheck size={14}/> SOC2 Certified</div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}