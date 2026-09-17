'use client';

import React from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import {
  ShieldAlert,
  IndianRupee,
  Boxes,
  Users,
  Clock,
  TrendingDown,
  ArrowRight,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { DEMO_CRITICAL_DISRUPTION } from '@/lib/data/demo-data';

export default function CrisisAnalysisPage() {
  const d = DEMO_CRITICAL_DISRUPTION;

  return (
    <EnterpriseShell>
      <div className="space-y-6">
        {/* Header alert */}
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                  Active Crisis Mode
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Incident: {d.id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {d.title}
              </h2>
              <p className="text-xs text-slate-600">
                Affected Facility: {d.plant?.name} • Component: {d.material?.name} (M-101)
              </p>
            </div>

            <Link
              href="/ai-command-center"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold shadow-xs transition"
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>Launch AI Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Business Impact Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Revenue at Risk
            </span>
            <span className="text-xl font-bold text-red-600 font-mono mt-1 block">
              ₹27.4L
            </span>
            <span className="text-[11px] text-slate-400">Total exposure</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Production Orders
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
              17 Orders
            </span>
            <span className="text-[11px] text-slate-400">Lines halted</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Customer Orders
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
              20 Orders
            </span>
            <span className="text-[11px] text-slate-400">Priority fleet deliveries</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Inventory Coverage
            </span>
            <span className="text-xl font-bold text-amber-600 font-mono mt-1 block">
              2.4 Days
            </span>
            <span className="text-[11px] text-slate-400">Buffer remaining</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Expected Delay
            </span>
            <span className="text-xl font-bold text-red-600 font-mono mt-1 block">
              7 Days
            </span>
            <span className="text-[11px] text-slate-400">Unmitigated stoppage</span>
          </div>
        </div>

        {/* Deep Business Impact Narrative */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Detailed Business Impact Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Operational Bottleneck</h4>
              <p>
                The unplanned 10-day shutdown of Global Metals Ltd. (S-104) halts supplies of Steering Assembly (M-101). Plant PL-01 Hyderabad has only 240 units in stock against a daily consumption rate of 100 units. Line stoppage will occur in 2.4 days unless an intervention occurs.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Financial & Customer Exposure</h4>
              <p>
                17 high-priority assembly orders for Astra EV-X Prime and Sierra SUV will be deferred by at least 7 days. This jeopardizes 20 confirmed customer contracts valued at ₹27.4L, triggering potential OEM penalty clauses and SLA breach liabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
