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
  User,
  Phone,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, UserRole, SUPPORTED_ROLES } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SUPPLY_CHAIN_MANAGER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, {
        fullName,
        role,
        phoneNumber,
        department: 'Global Supply Chain & Logistics',
        company: 'ResiliNet',
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else if (result.requiresVerification) {
        setRegisteredEmail(result.email || email);
        setLoading(false);
      } else {
        // Clear any stale local routing state
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('resilinet_last_route');
          } catch {
            // ignore
          }
        }
        window.location.href = '/';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
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
            Enterprise Account Registration
          </h2>
          <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-1.5 py-0.5 rounded">
            HANA
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          SAP HANA Cloud Single Source of Truth • ResiliNet
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        {registeredEmail ? (
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-sky-50 border border-sky-100 mx-auto flex items-center justify-center text-sky-600">
              <Mail className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Verify Corporate Email
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your enterprise account has been created in SAP HANA Cloud. A secure activation link has been dispatched to:
              </p>
              <p className="text-xs font-mono font-bold text-slate-900 bg-slate-100 py-1.5 px-3 rounded-lg inline-block border border-slate-200">
                {registeredEmail}
              </p>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Verification Mandatory Before Sign In</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                SAP HANA Cloud policy requires all enterprise users to confirm corporate email ownership before authentication. You will not be able to log in until your email is verified.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/login"
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </Link>

              <div className="text-xs text-slate-500">
                <span>Did not receive the verification link? </span>
                <Link
                  href="/verify-email"
                  className="text-sky-600 hover:text-sky-700 font-semibold"
                >
                  Resend Verification Email
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Registration Notice</p>
                  <p className="text-red-700 text-[11px]">{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Corporate Email
                </label>
                <div className="mt-1 relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Enterprise Role
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white"
                >
                  <option value="SUPPLY_CHAIN_MANAGER">Supply Chain Manager (Cockpit Authority)</option>
                  <option value="ADMIN">System Administrator (Full Access)</option>
                  <option value="ANALYST">Supply Chain Analyst (Read & Simulation)</option>
                  <option value="PROCUREMENT_MANAGER">Procurement Manager</option>
                  <option value="PRODUCTION_PLANNER">Production Planner</option>
                  <option value="LOGISTICS_MANAGER">Logistics Manager</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Registering in SAP HANA Cloud...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Enter Platform</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an authorized account? </span>
            <Link
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

        <p className="mt-4 text-center text-[11px] text-slate-400">
          SAP HANA Cloud Protected • Parameterized SQL & Bcrypt Password Hashing
        </p>
      </div>
    </div>
  );
}
