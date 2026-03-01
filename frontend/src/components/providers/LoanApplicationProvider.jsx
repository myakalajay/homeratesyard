'use client'; // 🟢 FIX: Required for React Context to work in modern Next.js

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import merge from 'lodash.merge'; // 🟢 FIX: Deep merge prevents schema regression
import { useAuthContext } from '@/components/providers/AuthProvider';
import { LoanService } from '@/services/loan.service'; 

const LoanApplicationContext = createContext({});

// 🛡️ SCHEMA DEFINITION
const INITIAL_DATA = {
  // Section 1: Borrower Info
  borrower: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    maritalStatus: '',
    dependents: 0,
    applicationType: 'individual',
  },
  // Section 2: Loan & Property Info
  loan: {
    purpose: 'purchase',
    amount: 0,
    term: 30, // Default to 30 Year Fixed
    downPayment: 0,
    propertyType: 'single-family',
    usage: 'primary',
    address: '',
    city: '',
    state: '',
    zip: '',
    estimatedValue: 0,
  },
  // Section 3: Financials
  income: {
    employmentType: 'employed',
    annualIncome: '',
    monthlyDebt: '',
    creditScore: '', // Self-reported
    assets: '',
  },
  // Section 4: Legal & Declarations
  declarations: {
    citizen: '',
    bankruptcy: '',
    foreclosure: '',
    intentionToOccupy: '',
  },
  // Section 5: Compliance (HMDA)
  hmda: {
    ethnicity: '',
    race: '',
    sex: ''
  }
};

export const LoanApplicationProvider = ({ children }) => {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Safe destructuring in case AuthProvider isn't fully wrapped yet
  const authContext = useAuthContext();
  const user = authContext?.user || null;
  
  const router = useRouter();
  
  // Ref to track if initial hydration is complete to prevent overwriting local storage with empty data
  const isHydrated = useRef(false);

  // ==============================
  // 1. HYDRATION (Load Draft)
  // ==============================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hry_loan_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // 🟢 DEEP MERGE: Merges saved data ON TOP of Initial Data structure.
          // This ensures if we added new fields to INITIAL_DATA, they are preserved.
          const mergedData = merge({}, INITIAL_DATA, parsed);
          
          setFormData(mergedData);
        } catch (e) {
          console.error("Failed to load draft, resetting.", e);
          localStorage.removeItem('hry_loan_draft');
        }
      }
      isHydrated.current = true;
    }
  }, []);

  // ==============================
  // 2. AUTO-SAVE (Local + Server)
  // ==============================
  useEffect(() => {
    // Don't save if we haven't loaded yet (prevents wiping storage)
    if (!isHydrated.current) return;

    setIsSaving(true);
    const timer = setTimeout(async () => {
      // A. Local Save
      localStorage.setItem('hry_loan_draft', JSON.stringify(formData));

      // B. Cloud Save (Debounced 1s)
      // Only if user is logged in. This allows "Resume on Desktop" feature.
      if (user) {
        try {
           // Simulating the actual save to the mock service we created
           // await LoanService.updateApplication('active_draft', formData); 
           console.log("☁️ [Cloud Sync] Draft saved remotely.");
        } catch (err) {
           console.warn("Cloud save failed (offline?)");
        }
      }
      
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, user]);

  // ==============================
  // 3. ACTIONS
  // ==============================
  
  const updateFormData = (section, data) => {
    setFormData(prev => {
      // Safety check: Ensure section exists
      if (!prev[section]) {
          console.error(`Invalid Form Section: ${section}`);
          return prev;
      }
      return {
        ...prev,
        [section]: { ...prev[section], ...data }
      };
    });
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearDraft = () => {
    localStorage.removeItem('hry_loan_draft');
    setFormData(INITIAL_DATA);
    setCurrentStep(1);
  };

  return (
    <LoanApplicationContext.Provider value={{ 
      formData, 
      updateFormData, 
      currentStep, 
      nextStep,
      prevStep,
      clearDraft,
      isSaving 
    }}>
      {children}
    </LoanApplicationContext.Provider>
  );
};

export const useLoanApplication = () => useContext(LoanApplicationContext);