'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth/auth-context';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { useNotifications } from '@/lib/hana/notification-context';
import { Breadcrumbs } from './Breadcrumbs';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPPLY_CHAIN_MANAGER: 'Supply Chain Manager',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  PRODUCTION_PLANNER: 'Production Planner',
  LOGISTICS_MANAGER: 'Logistics Manager',
  FINANCE_MANAGER: 'Finance Manager',
  ADMIN: 'System Administrator',
  ANALYST: 'Supply Chain Analyst',
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
  const { resetCrisisWorkflow } = useWorkflow();
  const { notifications, counts, markAsRead, markAllAsRead } = useNotifications();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isHanaLive, setIsHanaLive] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Probe SAP HANA Cloud status
  useEffect(() => {
    let isMounted = true;
    async function checkHana() {
      try {
        const res = await fetch('/api/hana/test');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setIsHanaLive(Boolean(json?.success));
        } else {
          if (isMounted) setIsHanaLive(false);
        }
      } catch {
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

  const handleNotificationClick = async (notif: (typeof notifications)[0]) => {
    if (!notif.IS_READ) {
      await markAsRead(notif.NOTIFICATION_ID);
    }
    setShowNotificationMenu(false);

    // Navigate to target route based on category / disruption
    const cat = (notif.CATEGORY || '').toUpperCase();
    if (cat === 'EARLY_WARNING') {
      router.push('/early-warning');
    } else if (cat === 'CRISIS') {
      router.push('/disruptions');
    } else if (cat === 'DECISION') {
      router.push('/recovery-strategies');
    } else if (cat === 'APPROVAL') {
      router.push('/approval-center');
    } else if (cat === 'EXECUTION' || cat === 'RECOVERY') {
      router.push('/recovery-execution');
    } else {
      router.push('/');
    }
  };

  return (
    <header
      role="banner"
      className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs select-none"
    >
      {/* ── Left: Mobile Hamburger & Breadcrumb Navigation ────────── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>

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
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden cursor-pointer"
            title="Switch Persona / Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold hidden sm:inline max-w-[120px] truncate">
              {ROLE_LABELS[activeRole] || activeRole}
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

        {/* Notifications Icon Button & Interactive Panel */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden cursor-pointer"
            title="HANA Crisis Notifications"
            aria-label="View crisis notifications"
          >
            <Bell className="w-4 h-4" />
            {counts.totalUnread > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold font-mono text-white bg-rose-600 rounded-full ring-2 ring-white">
                {counts.totalUnread}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotificationMenu(false)}
              />
              <div
                role="dialog"
                aria-label="HANA Notifications"
                className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs transition duration-150 max-h-[85vh] flex flex-col"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      HANA Notifications
                    </span>
                    {counts.totalUnread > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {counts.totalUnread} unread
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">All clear</span>
                    )}
                  </div>
                  {counts.totalUnread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[380px]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications recorded in SAP HANA Cloud.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.NOTIFICATION_ID}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex flex-col gap-1 ${
                          !n.IS_READ ? 'bg-sky-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                n.SEVERITY === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : n.SEVERITY === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {n.SEVERITY}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-500">
                              {n.CATEGORY}
                            </span>
                          </div>
                          {!n.IS_READ && (
                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                          )}
                        </div>
                        <p className="font-bold text-slate-900 text-xs leading-snug">
                          {n.TITLE}
                        </p>
                        {n.MESSAGE && (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {n.MESSAGE}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span className="font-mono">
                            {n.DISRUPTION_ID ? `Incident: ${n.DISRUPTION_ID}` : ''}
                          </span>
                          <span>
                            {new Date(n.CREATED_AT).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

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
