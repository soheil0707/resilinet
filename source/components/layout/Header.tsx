'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  CheckCircle2,
  ChevronDown,
  Building,
  UserCheck,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/lib/supabase/types';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPPLY_CHAIN_MANAGER: 'Supply Chain Manager',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  PRODUCTION_PLANNER: 'Production Planner',
  LOGISTICS_MANAGER: 'Logistics Manager',
  FINANCE_MANAGER: 'Finance Manager',
  ADMIN: 'System Administrator',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, activeRole, setActiveRole, signOut, user, isConfigured } =
    useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Derive screen title based on route
  const getScreenTitle = () => {
    switch (pathname) {
      case '/':
        return 'Executive Dashboard';
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

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: Organization & Screen Info */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Astra Motors Manufacturing
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
              <Building className="w-3 h-3 text-slate-500" />
              <span>PL-01 Hyderabad</span>
            </div>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getScreenTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Operational Status, Role Switcher, Alerts & Profile */}
      <div className="flex items-center gap-3">
        {/* System Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: Operational</span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Role Selector / Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition"
            title="Switch Persona / Role for Demo"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold">{ROLE_LABELS[activeRole]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Switch Active Role
              </div>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                    activeRole === r ? 'font-bold text-sky-700 bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{ROLE_LABELS[r]}</span>
                  {activeRole === r && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
          title="Crisis Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Account / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-1 ring-slate-800">
            {profile?.full_name?.charAt(0) || 'R'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-none">
              {profile?.full_name || 'Rajesh Sharma'}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {profile?.company || 'Astra Motors'}
            </div>
          </div>

          {isConfigured && user && (
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
