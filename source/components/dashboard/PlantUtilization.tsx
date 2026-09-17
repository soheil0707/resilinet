'use client';

import React from 'react';
import { Factory, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Plant } from '@/lib/supabase/types';

interface PlantUtilizationProps {
  plants?: Plant[];
}

export function PlantUtilization({ plants = [] }: PlantUtilizationProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Production Line Utilization
              </h3>
              <p className="text-[11px] text-slate-500">
                Astra Motors Major Assembly & Powertrain Sites
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            1 Plant Degraded
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {plants.map((plant) => {
            const isDegraded = plant.status === 'DEGRADED';
            return (
              <div
                key={plant.id}
                className={`p-3 rounded-lg border transition ${
                  isDegraded
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {plant.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      [{plant.location}]
                    </span>
                  </div>
                  {isDegraded ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Degraded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Operational
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Capacity: {plant.capacity_units_per_day} units/day</span>
                  <span className="font-mono font-bold text-slate-800">
                    {plant.current_utilization_pct}%
                  </span>
                </div>

                <div className="mt-1.5 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isDegraded ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${plant.current_utilization_pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Fleet Capacity: 470 units/day</span>
        <span className="font-semibold text-slate-700">Avg Utilization: 91.2%</span>
      </div>
    </div>
  );
}
