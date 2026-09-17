'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Package,
  Factory,
  Layers,
  Users2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your corporate email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during authentication.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="relative w-64 h-32 sm:w-80 sm:h-40 mx-auto flex items-center justify-center -mb-0.5">
          <Image
            src="/resilinet-logo.png"
            alt="ResiliNet - AI-Powered Supply Chain Resilience"
            width={320}
            height={160}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Astra Motors Manufacturing • Enterprise Crisis Orchestration Platform
        </p>
      </div>

      {/* Main Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          
          {/* Subtle Enterprise Supply Chain Pipeline Animation */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              <span>Supply Chain Orchestration Flow</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Autonomous Sync
              </span>
            </div>

            {/* Pipeline Visual with CSS Animated Pulses */}
            <div className="relative">
              <div className="grid grid-cols-5 gap-1.5 text-center relative z-10">
                {/* Node 1: Supplier */}
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 relative">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 motion-reduce:hidden" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 leading-tight">Supplier</span>
                  <span className="text-[9px] text-slate-400 font-mono">Tier-1 S-104</span>
                </div>

                {/* Node 2: Material */}
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700">
                    <Package className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 leading-tight">Material</span>
                  <span className="text-[9px] text-slate-400 font-mono">M-101 Critical</span>
                </div>

                {/* Node 3: Plant */}
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700">
                    <Factory className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 leading-tight">Plant</span>
                  <span className="text-[9px] text-slate-400 font-mono">PL-01 HYD</span>
                </div>

                {/* Node 4: Production */}
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700">
                    <Layers className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 leading-tight">Production</span>
                  <span className="text-[9px] text-slate-400 font-mono">17 Orders</span>
                </div>

                {/* Node 5: Customer */}
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 relative">
                    <Users2 className="w-4 h-4 text-emerald-600" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 leading-tight">Customer</span>
                  <span className="text-[9px] text-slate-400 font-mono">20 Fleets</span>
                </div>
              </div>

              {/* Connecting Flow Track */}
              <div className="absolute top-4.5 left-6 right-6 h-0.5 bg-slate-200 z-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-[flow_2.5s_ease-in-out_infinite] motion-reduce:animate-none" />
              </div>
            </div>
          </div>

          {/* Configuration Warning (if Supabase env keys missing) */}
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Supabase Authentication Setup Required</p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Configure <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">source/.env.local</code> to enable live authentication.
                </p>
              </div>
            </div>
          )}

          {/* Validation Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-red-700 text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Corporate Email
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@astramotors.com"
                  suppressHydrationWarning
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  suppressHydrationWarning
                  className="block w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  tabIndex={-1}
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Authenticating with Supabase...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </>
              )}
            </button>
          </form>

          {/* Account Registration Link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New Astra Motors personnel?</span>
            <Link
              href="/signup"
              className="text-sky-600 hover:text-sky-800 font-semibold transition"
            >
              Register Corporate Account →
            </Link>
          </div>
        </div>

        {/* Security / Enterprise Notice */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Authorized personnel only. Protected under Astra Motors IT Security Policy & Supabase RLS.
        </p>
      </div>

      {/* Scoped CSS animation for connecting line */}
      <style jsx>{`
        @keyframes flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\[flow_2\.5s_ease-in-out_infinite\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
