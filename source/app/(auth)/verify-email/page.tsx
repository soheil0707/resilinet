'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Mail,
  RefreshCw,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || token.trim().length < 16) {
      setStatus('no-token');
      setMessage('No valid verification token provided in the link. Please check your verification email.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token?.trim() }),
        });

        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your corporate email address has been successfully verified.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification token is invalid, expired, or has already been used.');
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Unable to reach SAP HANA verification service.');
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || !resendEmail.includes('@')) return;

    setResendLoading(true);
    setResendMessage(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      setResendMessage(data.message || 'If an unverified account exists, a new verification link has been sent.');
    } catch {
      setResendMessage('Failed to submit request. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:px-10 space-y-6">
      {/* Loading State */}
      {status === 'loading' && (
        <div className="text-center py-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 mx-auto flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Verifying Corporate Credentials
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Validating verification token against SAP HANA Cloud authoritative repository...
          </p>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              Corporate Email Verified Successfully
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your corporate email address has been successfully verified. Your ResiliNet account is now activated and ready for secure sign-in.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-left text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Email Verification Confirmed</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Your account is now eligible for authentication.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Error or No Token State */}
      {(status === 'error' || status === 'no-token') && (
        <div className="space-y-5">
          <div className="text-center py-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 mx-auto flex items-center justify-center text-red-600">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Verification Notice
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Resend Verification Form */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Request New Verification Link
              </h4>
            </div>

            {resendMessage && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="text-[11px]">{resendMessage}</span>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                  Corporate Email
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="manager@astramotors.com"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
              >
                {resendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>Send Verification Link</span>
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Ready to sign in? </span>
            <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold">
              Return to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <Image
            src="/resilinet-logo.png"
            alt="ResiliNet Logo"
            width={64}
            height={64}
            className="w-16 h-16 object-contain"
            priority
          />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Email Verification
          </h2>
          <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded">
            HANA
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Astra Motors Manufacturing • Corporate Identity Validation
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="bg-white py-12 px-6 shadow-xs rounded-2xl border border-slate-200 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
