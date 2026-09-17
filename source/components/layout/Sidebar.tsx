'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertOctagon,
  Network,
  Activity,
  Bot,
  GitBranch,
  Scale,
  Sliders,
  CheckSquare,
  PlayCircle,
  Database,
  Settings,
  ShieldCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: {
    text: string;
    variant: 'critical' | 'warning' | 'info';
  };
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Executive Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Disruptions',
    href: '/disruptions',
    icon: AlertOctagon,
    badge: { text: '1', variant: 'critical' },
  },
  {
    label: 'Supply Chain Map',
    href: '/supply-chain-map',
    icon: Network,
  },
  {
    label: 'Crisis Analysis',
    href: '/crisis-analysis',
    icon: Activity,
    badge: { text: 'Active', variant: 'critical' },
  },
  {
    label: 'AI Command Center',
    href: '/ai-command-center',
    icon: Bot,
  },
  {
    label: 'Recovery Strategies',
    href: '/recovery-strategies',
    icon: GitBranch,
  },
  {
    label: 'Conflict Resolution',
    href: '/conflict-resolution',
    icon: Scale,
  },
  {
    label: 'What-If Simulator',
    href: '/what-if-simulator',
    icon: Sliders,
  },
  {
    label: 'Approval Center',
    href: '/approval-center',
    icon: CheckSquare,
    badge: { text: '1', variant: 'warning' },
  },
  {
    label: 'Recovery Execution',
    href: '/recovery-execution',
    icon: PlayCircle,
  },
  {
    label: 'Resilience Memory',
    href: '/resilience-memory',
    icon: Database,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConfigured, profile } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-800">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
              ResiliNet
            </span>
            <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
              SAP
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            Astra Motors
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Crisis Orchestration
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-sky-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="truncate flex-1">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    item.badge.variant === 'critical'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : item.badge.variant === 'warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {item.badge.text}
                </span>
              )}

              {isActive && (
                <span className="w-1 h-4 bg-sky-600 rounded-full absolute left-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info / Data Connectivity Indicator */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Data Source:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-700">
              {isConfigured ? 'Supabase Cloud' : 'Demo Dataset'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-2 text-[11px] text-slate-600">
          <div className="font-semibold text-slate-800 truncate">
            {profile?.full_name || 'Rajesh Sharma'}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {profile?.department || 'Supply Chain & Logistics'}
          </div>
        </div>
      </div>
    </aside>
  );
}
