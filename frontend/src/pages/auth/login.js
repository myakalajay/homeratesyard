import React from 'react';
import Head from 'next/head';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/forms/LoginForm';

/**
 * @page LoginPage
 * @description The primary entry point for authenticated users.
 * Integrated with AuthLayout for high-conversion branding.
 */
export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign In | HomeRatesYard</title>
        <meta name="description" content="Securely access your HomeRatesYard mortgage dashboard." />
      </Head>
      
      <AuthLayout 
        title="Welcome Back" 
        subtitle="Securely sign in to manage your mortgage pipeline."
      >
        <LoginForm />
      </AuthLayout>
    </>
  );
}

// 🟢 ROUTING CONFIGURATION
// Explicitly marks this as a public page. 
// If an authenticated user lands here, RouteGuard will safely redirect them to their dashboard.
LoginPage.authGuard = false;