'use client';

import React from 'react';
import { Network, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Supplier } from '@/lib/supabase/types';

interface SupplierNetworkHealthProps {
  suppliers?: Supplier[];
}

export function SupplierNetworkHealth({
  suppliers = [],
}: SupplierNetworkHealthProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Supplier Network Health
              </h3>
              <p className="text-[11px] text-slate-500">
                Astra Motors Tier-1 Critical Suppliers (8 Active)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            1 Critical Failure
          </span>
        </div>

        {/* Enterprise Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-2">Supplier</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Reliability</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => {
                const isShutdown = s.status === 'SHUTDOWN';
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isShutdown
                        ? 'bg-red-50/60 font-semibold text-red-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-400">
                          {s.id}
                        </span>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {s.location}
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] text-slate-600">
                      {s.category}
                    </td>
                    <td className="py-2.5 font-mono text-[11px]">
                      <span
                        className={
                          s.reliability_score < 90
                            ? 'text-red-600 font-bold'
                            : 'text-emerald-700 font-medium'
                        }
                      >
                        {s.reliability_score}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {isShutdown ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 uppercase">
                          <XCircle className="w-3 h-3" />
                          Shutdown
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Network Reliability Avg: 95.6%</span>
        <span className="text-slate-400">Updated 10m ago</span>
      </div>
    </div>
  );
}
