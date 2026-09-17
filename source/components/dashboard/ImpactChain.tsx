'use client';

import React from 'react';
import {
  Factory,
  Cog,
  Building2,
  Boxes,
  Users,
  AlertOctagon,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Supplier, Material, Plant } from '@/lib/supabase/types';

interface ImpactChainProps {
  supplier?: Supplier;
  material?: Material;
  plant?: Plant;
  productionOrdersCount?: number;
  customerOrdersCount?: number;
}

export function ImpactChain({
  supplier,
  material,
  plant,
  productionOrdersCount = 17,
  customerOrdersCount = 20,
}: ImpactChainProps) {
  const nodes = [
    {
      step: '1. Supplier',
      title: supplier?.name || 'Global Metals Ltd. (S-104)',
      subtitle: 'Steering & Precision Forging',
      badge: 'Shutdown (10 Days)',
      badgeVariant: 'critical',
      icon: Factory,
      highlight: 'border-red-400 bg-red-50/40',
    },
    {
      step: '2. Material',
      title: material?.name || 'Steering Assembly (M-101)',
      subtitle: 'Critical Assembly Component',
      badge: '2.4 Days Buffer',
      badgeVariant: 'warning',
      icon: Cog,
      highlight: 'border-amber-400 bg-amber-50/30',
    },
    {
      step: '3. Affected Plant',
      title: plant?.name || 'PL-01 Hyderabad Assembly Plant',
      subtitle: 'Primary Chassis Assembly Line',
      badge: 'Degraded Status',
      badgeVariant: 'warning',
      icon: Building2,
      highlight: 'border-amber-400 bg-amber-50/30',
    },
    {
      step: '4. Production Orders',
      title: `${productionOrdersCount} Production Orders`,
      subtitle: 'Astra EV-X Prime & Sierra SUV',
      badge: '7-Day Delay Projected',
      badgeVariant: 'critical',
      icon: Boxes,
      highlight: 'border-red-400 bg-red-50/40',
    },
    {
      step: '5. Customer Orders',
      title: `${customerOrdersCount} Customer Orders`,
      subtitle: 'Key Fleet & Regional Transport',
      badge: '₹27.4L at Risk',
      badgeVariant: 'critical',
      icon: Users,
      highlight: 'border-red-500 bg-red-50/50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>End-to-End Cascading Disruption Impact Chain</span>
          </h3>
          <p className="text-xs text-slate-500">
            Automated multi-tier dependency propagation from tier-1 supplier shutdown to customer fulfillment
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Propagation Depth: 5 Tiers
        </span>
      </div>

      {/* Horizontal / Responsive Chain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div key={node.step} className="flex flex-col relative group">
              <div
                className={`flex-1 rounded-lg border p-3.5 space-y-2.5 transition shadow-2xs hover:shadow-sm ${node.highlight}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {node.step}
                  </span>
                  <div className="p-1.5 rounded bg-white shadow-2xs border border-slate-200 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {node.subtitle}
                  </p>
                </div>

                <div className="pt-1">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      node.badgeVariant === 'critical'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {node.badge}
                  </span>
                </div>
              </div>

              {/* Arrow connector for desktop */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400 shadow-2xs">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
