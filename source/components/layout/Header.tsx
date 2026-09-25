'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Building,
  UserCheck,
  LogOut,
  RotateCcw,
  Menu,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { UserRole } from '@/lib/supabase/types';
import { Breadcrumbs } from './Breadcrumbs';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPPLY_CHAIN_MANAGER: 'Supply Chain Manager',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  PRODUCTION_PLANNER: 'Production Planner',
  LOGISTICS_MANAGER: 'Logistics Manager',
  FINANCE_MANAGER: 'Finance Manager',
  ADMIN: 'System Administrator',
};

export interface HeaderProps {
  onMobileMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({
  onMobileMenuClick,
  isMobileMenuOpen = false,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, activeRole, setActiveRole, signOut, user } = useAuth();
  const { resetCrisisWorkflow, workflowState, approvedStrategy, selectedStrategy } = useWorkflow();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isHanaLive, setIsHanaLive] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  // Probe SAP HANA Cloud status once on mount
  useEffect(() => {
    let isMounted = true;
    async function checkHana() {
      try {
        const res = await fetch('/api/hana/disruptions');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setIsHanaLive(Boolean(json?.success));
        } else {
          if (isMounted) setIsHanaLive(false);
        }
      } catch (err) {
        if (isMounted) setIsHanaLive(false);
      }
    }
    checkHana();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setShowRoleMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const handleResetDemo = () => {
    setIsResetting(true);
    resetCrisisWorkflow();
    setResetSuccessMessage(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccessMessage(false);
    }, 2000);
  };

  // Derive screen title based on route
  const getScreenTitle = () => {
    switch (pathname) {
      case '/':
        return 'Executive Dashboard';
      case '/early-warning':
        return 'Early Warning Center';
      case '/integration-hub':
        return 'Integration Hub';
      case '/disruptions':
        return 'Disruption Center';
      case '/supply-chain-map':
        return 'Supply Chain Map';
      case '/crisis-analysis':
        return 'Crisis Analysis';
      case '/ai-command-center':
        return 'AI Command Center';
      case '/recovery-strategies':
        return 'Recovery Strategies';
      case '/conflict-resolution':
        return 'Conflict Resolution';
      case '/what-if-simulator':
        return 'What-If Simulator';
      case '/approval-center':
        return 'Approval Center';
      case '/recovery-execution':
        return 'Recovery Execution';
      case '/resilience-memory':
        return 'Resilience Memory';
      case '/settings':
        return 'System Settings';
      default:
        return 'Executive Dashboard';
    }
  };

  return (
    <header
      role="banner"
      className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs select-none"
    >
      {/* ── Left: Mobile Hamburger & Breadcrumb Navigation ────────── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb + Title area */}
        <div className="min-w-0">
          <Breadcrumbs />
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate hidden sm:block">
            {getScreenTitle()}
          </h1>
        </div>
      </div>

      {/* ── Right: Status Pill, Crisis Context, Reset, Role & Profile ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Primary Crisis Context Pill (DIS-1001) */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="font-mono font-bold text-slate-900">DIS-1001</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Supplier Delay</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px] text-slate-500">PLANT-001</span>
          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
            HIGH
          </span>
        </div>

        {/* Universal Live Data Indicator */}
        <div className="hidden lg:block">
          <LiveDataBadge isLive={isHanaLive} />
        </div>

        {/* Centralized Reset Demo Scenario Action */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden ${
            resetSuccessMessage
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'text-slate-700 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border-slate-200'
          }`}
          title="Reset Workflow & Demo Scenario to DIS-1001 Detected State"
          aria-label="Reset Demo Scenario"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 ${
              isResetting ? 'animate-spin text-rose-600' : 'text-slate-500'
            }`}
          />
          <span className="hidden sm:inline">
            {resetSuccessMessage ? 'Reset Complete' : 'Reset Demo'}
          </span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Role Selector / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            aria-expanded={showRoleMenu}
            aria-haspopup="true"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
            title="Switch Persona / Role for Demo"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold hidden sm:inline max-w-[120px] truncate">
              {ROLE_LABELS[activeRole]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleMenu(false)}
              />
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs transition duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role
                </div>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    role="menuitem"
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      activeRole === r
                        ? 'font-bold text-sky-800 bg-sky-50/80'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {activeRole === r && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          className="relative p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
          title="Crisis Notifications"
          aria-label="View crisis notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Account Avatar & Sign Out */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-1 ring-slate-800 shrink-0"
            title={profile?.full_name || user?.email || 'Authenticated User'}
          >
            {profile?.full_name?.charAt(0) ||
              user?.email?.charAt(0)?.toUpperCase() ||
              'U'}
          </div>

          <button
            onClick={handleSignOut}
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
            title="Sign Out of ResiliNet"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
