import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

/**
 * @page ResetPasswordPage
 * @description Dynamic route that captures the secure token from the URL to reset a user's password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  // 🟢 HYDRATION & ROUTER CHECK:
  if (!router.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 rounded-full border-slate-200 border-t-red-600 animate-spin" />
      </div>
    );
  }

  // 🟢 SECURITY FIX: Prevent Array Manipulation Crashes
  // If a malicious actor passes multiple tokens, force it to read only the first one as a string.
  const secureToken = Array.isArray(token) ? token[0] : token;

  // Edge case: If somehow the token is completely missing from the URL params
  if (!secureToken) {
    router.push('/auth/login');
    return null; 
  }

  return (
    <>
      <Head>
        <title>Set New Password | HomeRatesYard</title>
        <meta name="robots" content="noindex, nofollow" /> {/* Security: Don't index reset pages */}
      </Head>
      
      <AuthLayout 
        title="Set New Password" 
        subtitle="Ensure your account is secure with a strong new password."
      >
        <ResetPasswordForm token={secureToken} />
      </AuthLayout>
    </>
  );
}

// 🟢 ROUTING CONFIGURATION
ResetPasswordPage.authGuard = false;