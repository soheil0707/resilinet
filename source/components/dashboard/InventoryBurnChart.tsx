'use client';

import React from 'react';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

interface InventoryBurnProps {
  trendData?: Array<{
    day: string;
    stock: number;
    safetyStock: number;
    coverageDays: number;
  }>;
}

export function InventoryBurnChart({ trendData = [] }: InventoryBurnProps) {
  const maxStock = 700;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Inventory Coverage Trend
              </h3>
              <p className="text-[11px] text-slate-500">
                Steering Assembly (M-101) @ PL-01 Hyderabad
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-red-600 font-mono">
              2.4 Days
            </span>
            <span className="text-[10px] text-slate-400 block">
              Remaining Stock
            </span>
          </div>
        </div>

        {/* Safety buffer alert callout */}
        <div className="mt-3 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold">Safety Stock Breached:</span> Current stock
            (240 units) is below the minimum buffer threshold (500 units / 5.0 days). Line stoppage imminent within 58 hours.
          </div>
        </div>

        {/* Burn-down bar visualization */}
        <div className="mt-4 space-y-3">
          <div className="text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>5-Day Consumption Trajectory</span>
            <span className="text-slate-400 font-normal">Daily Burn: 100 units</span>
          </div>

          <div className="space-y-2">
            {trendData.map((item, idx) => {
              const pct = Math.min(100, Math.round((item.stock / maxStock) * 100));
              const isCritical = item.coverageDays <= 2.5;

              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">{item.day}</span>
                    <span
                      className={`font-mono font-semibold ${
                        isCritical ? 'text-red-600 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {item.stock} units ({item.coverageDays}d)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-500' : 'bg-sky-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>Required Buffer: 500 units</span>
        <span className="font-semibold text-slate-700">Depletion: ~58 hrs</span>
      </div>
    </div>
  );
}
