import React from 'react';
import Head from 'next/head';
import AuthLayout from '@/components/layout/AuthLayout';
import SignupForm from '@/components/forms/SignupForm';

/**
 * @page RegisterPage
 * @description Entry point for new Borrowers and Lenders to join the platform.
 */
export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Create Account | HomeRatesYard</title>
        <meta name="description" content="Join HomeRatesYard to experience the future of mortgage lending." />
      </Head>
      
      <AuthLayout 
        title="Get Started" 
        subtitle="Join the next generation of digital mortgage lending."
      >
        <SignupForm />
      </AuthLayout>
    </>
  );
}

// 🟢 ROUTING CONFIGURATION
// Marks this as a public page. 
// Prevents authenticated users from creating duplicate accounts by redirecting them to their dashboard.
RegisterPage.authGuard = false;