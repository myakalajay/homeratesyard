import React from 'react';
import Head from 'next/head';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Account Recovery | HomeRatesYard</title>
        <meta name="description" content="Securely reset your HomeRatesYard password." />
      </Head>
      
      <AuthLayout 
        title="Account Recovery" 
        subtitle="Let's get you safely back into your dashboard."
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}

// 🟢 CRITICAL ROUTING FIX: 
// Tells the RouteGuard in _app.js that this is a public authentication page.
// If a user is already logged in, RouteGuard will safely bounce them to their dashboard.
ForgotPasswordPage.authGuard = false;