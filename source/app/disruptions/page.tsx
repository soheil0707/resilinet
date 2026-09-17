'use client';

import React from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { AlertOctagon, ArrowRight, Eye, ShieldAlert, Filter } from 'lucide-react';
import { DEMO_CRITICAL_DISRUPTION } from '@/lib/data/demo-data';

export default function DisruptionsPage() {
  const d = DEMO_CRITICAL_DISRUPTION;

  return (
    <EnterpriseShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Disruption Center</h2>
            <p className="text-xs text-slate-500">
              Active and historical supplier outages, material shortages, and logistics bottlenecks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200">
              1 Active Disruption
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Plant</th>
                  <th className="py-3 px-4">Disruption Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Inventory Coverage</th>
                  <th className="py-3 px-4">Revenue at Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
                      CRITICAL
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {d.supplier?.name}
                    <span className="text-[10px] font-normal text-slate-400 block font-mono">
                      (S-104)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {d.material?.name}
                    <span className="text-[10px] font-normal text-slate-400 block font-mono">
                      (M-101)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {d.plant?.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {d.disruption_type}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                    {d.duration_days} days
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                    {d.coverage_days} days
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                    ₹27.4L
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/crisis-analysis"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Open Crisis</span>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
