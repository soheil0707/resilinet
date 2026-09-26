'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/lib/auth/auth-context';
import { NotificationProvider } from '@/lib/hana/notification-context';
import { Loader2 } from 'lucide-react';

export function EnterpriseShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Navigation states for mobile drawer and sidebar compact mode
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 select-none">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <Image
            src="/resilinet-logo.png"
            alt="ResiliNet"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          <span>Connecting to SAP HANA Cloud...</span>
        </div>
        <p className="text-[11px] text-slate-400">ResiliNet • Astra Motors Manufacturing</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
        {/* ── Enterprise Sidebar (Desktop static + Mobile drawer) ── */}
        <Sidebar
          isMobileOpen={isMobileNavOpen}
          onMobileClose={() => setIsMobileNavOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* ── Main Viewport Content ── */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Global Enterprise Header */}
          <Header
            onMobileMenuClick={() => setIsMobileNavOpen(true)}
            isMobileMenuOpen={isMobileNavOpen}
          />

          {/* Page Content Landmark */}
          <main
            id="main-content"
            className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6"
          >
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
