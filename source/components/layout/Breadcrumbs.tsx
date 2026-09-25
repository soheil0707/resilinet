'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useWorkflow } from '@/lib/workflow/workflow-context';

export interface Crumb {
  label: string;
  href?: string;
  badge?: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { approvedStrategy, selectedStrategy } = useWorkflow();

  const activeStrategyId = approvedStrategy?.id || selectedStrategy?.id || 'STR-001';

  // Construct contextual crumbs based on canonical workflow
  const getCrumbs = (): Crumb[] => {
    switch (pathname) {
      case '/':
        return [{ label: 'Executive Dashboard' }];

      case '/early-warning':
        return [
          { label: 'Monitor & Detect', href: '/' },
          { label: 'Early Warning' },
        ];

      case '/supply-chain-map':
        return [
          { label: 'Monitor & Detect', href: '/' },
          { label: 'Supply Chain Map' },
        ];

      case '/integration-hub':
        return [
          { label: 'Monitor & Detect', href: '/' },
          { label: 'Integration Hub' },
        ];

      case '/disruptions':
        return [
          { label: 'Analyze & Simulate', href: '/disruptions' },
          { label: 'Disruptions', href: '/disruptions' },
          { label: 'DIS-1001', badge: 'CRITICAL' },
        ];

      case '/crisis-analysis':
        return [
          { label: 'Analyze & Simulate', href: '/disruptions' },
          { label: 'Crisis Analysis', href: '/crisis-analysis' },
          { label: 'DIS-1001', badge: 'ACTIVE' },
        ];

      case '/ai-command-center':
        return [
          { label: 'Analyze & Simulate', href: '/disruptions' },
          { label: 'AI Command Center', href: '/ai-command-center' },
          { label: 'DIS-1001' },
        ];

      case '/what-if-simulator':
        return [
          { label: 'Analyze & Simulate', href: '/disruptions' },
          { label: 'What-If Simulator' },
        ];

      case '/recovery-strategies':
        return [
          { label: 'Decide & Approve', href: '/recovery-strategies' },
          { label: 'Recovery Strategies', href: '/recovery-strategies' },
          { label: 'DIS-1001' },
          { label: activeStrategyId },
        ];

      case '/conflict-resolution':
        return [
          { label: 'Decide & Approve', href: '/recovery-strategies' },
          { label: 'Conflict Resolution', href: '/conflict-resolution' },
          { label: 'DIS-1001' },
          { label: activeStrategyId },
        ];

      case '/approval-center':
        return [
          { label: 'Decide & Approve', href: '/recovery-strategies' },
          { label: 'Approval Center', href: '/approval-center' },
          { label: 'DIS-1001' },
          { label: activeStrategyId },
        ];

      case '/recovery-execution':
        return [
          { label: 'Execute & Learn', href: '/recovery-execution' },
          { label: 'Recovery Execution', href: '/recovery-execution' },
          { label: 'DIS-1001' },
          { label: 'EXE-1001' },
        ];

      case '/resilience-memory':
        return [
          { label: 'Execute & Learn', href: '/recovery-execution' },
          { label: 'Resilience Memory', href: '/resilience-memory' },
          { label: 'DIS-1001' },
        ];

      case '/settings':
        return [
          { label: 'Execute & Learn', href: '/' },
          { label: 'Settings' },
        ];

      default:
        return [{ label: 'Executive Dashboard' }];
    }
  };

  const crumbs = getCrumbs();

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center min-w-0">
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden whitespace-nowrap">
        {/* Home icon link */}
        <li className="flex items-center shrink-0">
          <Link
            href="/"
            className="text-slate-400 hover:text-sky-700 transition p-0.5 rounded focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
            title="Go to Executive Dashboard"
            aria-label="Executive Dashboard Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>

        {/* Separator */}
        <li aria-hidden="true" className="text-slate-300 shrink-0">
          <ChevronRight className="w-3 h-3" />
        </li>

        {/* Mobile View: show collapsed parent or leaf crumb only */}
        <div className="flex sm:hidden items-center gap-1.5 min-w-0">
          {crumbs.length > 2 && (
            <>
              <span className="text-slate-400">...</span>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            </>
          )}
          <span className="font-semibold text-slate-900 truncate">
            {crumbs[crumbs.length - 1].label}
          </span>
          {crumbs[crumbs.length - 1].badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">
              {crumbs[crumbs.length - 1].badge}
            </span>
          )}
        </div>

        {/* Desktop / Tablet View: show complete hierarchy */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;

            return (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                <li className="flex items-center gap-1.5 min-w-0">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-slate-500 hover:text-sky-700 transition truncate max-w-[140px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden rounded px-1"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? 'page' : undefined}
                      className={`truncate max-w-[160px] ${
                        isLast
                          ? 'font-semibold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}

                  {crumb.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      {crumb.badge}
                    </span>
                  )}
                </li>

                {!isLast && (
                  <li aria-hidden="true" className="text-slate-300 shrink-0">
                    <ChevronRight className="w-3 h-3" />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </ol>
    </nav>
  );
}
