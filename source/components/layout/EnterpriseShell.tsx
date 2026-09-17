'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2, ShieldCheck } from 'lucide-react';

export function EnterpriseShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md ring-1 ring-slate-800">
          <ShieldCheck className="w-7 h-7 text-sky-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          <span>Verifying Enterprise Session...</span>
        </div>
        <p className="text-[11px] text-slate-400">ResiliNet • Astra Motors Manufacturing</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
