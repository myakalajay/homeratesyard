import React from 'react';
import Head from 'next/head';

// --- CONTEXT & LAYOUT ---
import { LoanApplicationProvider, useLoanApplication } from '@/components/providers/LoanApplicationProvider';
import WizardLayout from '@/components/layout/WizardLayout';

// --- STEP COMPONENTS ---
import Step1Borrower from '@/components/application/steps/Step1Borrower';
import Step2Property from '@/components/application/steps/Step2Property';
import Step3Financials from '@/components/application/steps/Step3Financials';
import Step4Declarations from '@/components/application/steps/Step4Declarations';
import Step6HMDA from '@/components/application/steps/Step6HMDA'; // HMDA comes before review
import Step5Review from '@/components/application/steps/Step5Review';

// --- ORCHESTRATOR COMPONENT ---
const ApplicationWizard = () => {
    const { currentStep } = useLoanApplication();

    // Render logic based on step
    const renderStep = () => {
        switch(currentStep) {
            case 1: return <Step1Borrower />;
            case 2: return <Step2Property />;
            case 3: return <Step3Financials />;
            case 4: return <Step4Declarations />;
            case 5: return <Step6HMDA />;
            case 6: return <Step5Review />;
            default: return <Step1Borrower />;
        }
    };

    // Dynamic Headers based on current step
    const getTitles = () => {
        switch(currentStep) {
            case 1: 
                return { title: "Let's get started.", subtitle: "First, tell us a bit about yourself." };
            case 2: 
                return { title: "Property Details", subtitle: "Tell us about the home you want to buy." };
            case 3: 
                return { title: "Financials", subtitle: "We need to verify your income eligibility." };
            case 4: 
                return { title: "Declarations", subtitle: "Standard legal questions required for all loans." };
            case 5: 
                return { title: "Government Monitoring", subtitle: "Federal compliance information (Optional)." };
            case 6: 
                return { title: "Review Application", subtitle: "Please verify your information before submitting." };
            default: 
                return { title: "Application", subtitle: "" };
        }
    };

    const { title, subtitle } = getTitles();

    return (
        <WizardLayout title={title} subtitle={subtitle}>
            {renderStep()}
        </WizardLayout>
    );
};

// --- MAIN PAGE WRAPPER ---
export default function ApplicationPage() {
  return (
    <LoanApplicationProvider>
      <Head>
        <title>Apply Now | HomeRatesYard</title>
      </Head>
      <ApplicationWizard />
    </LoanApplicationProvider>
  );
}