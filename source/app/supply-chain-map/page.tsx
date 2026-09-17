import React from 'react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import {
  Network,
  AlertTriangle,
  Factory,
  Package,
  Truck,
  Users,
  ChevronRight,
  Clock,
  IndianRupee,
} from 'lucide-react';

const nodes = [
  {
    type: 'SUPPLIER',
    icon: Truck,
    title: 'Global Metals Ltd.',
    subtitle: 'S-104',
    detail: 'Supplier Shutdown',
    status: 'CRITICAL',
  },
  {
    type: 'MATERIAL',
    icon: Package,
    title: 'Steering Assembly',
    subtitle: 'M-101',
    detail: 'Inventory: 2.4 days',
    status: 'AT RISK',
  },
  {
    type: 'PLANT',
    icon: Factory,
    title: 'PL-01 Hyderabad',
    subtitle: 'Assembly Plant',
    detail: '17 Production Orders',
    status: 'AT RISK',
  },
  {
    type: 'CUSTOMER',
    icon: Users,
    title: 'Customer Orders',
    subtitle: '20 Fleet Orders',
    detail: 'SLA Impact',
    status: 'AT RISK',
  },
];

export default function SupplyChainMapPage() {
  return (
    <EnterpriseShell>
      <div className="space-y-5">

        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Network className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Supply Chain Dependency Map
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Multi-tier dependency visualization for the active supply-chain crisis
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-700">
                CRISIS PATH ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Crisis Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-6">

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">
                    Global Metals Ltd. Supplier Shutdown
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    CRITICAL
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Incident DIS-2026-001 · Supplier S-104 · Material M-101
                </p>
              </div>
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Shutdown
                </p>
                <p className="text-sm font-bold text-red-600">
                  10 Days
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Revenue at Risk
                </p>
                <p className="text-sm font-bold text-red-600">
                  ₹27.4L
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Expected Delay
                </p>
                <p className="text-sm font-bold text-orange-600">
                  7 Days
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Dependency Map */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                End-to-End Dependency Chain
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supplier → Material → Plant → Production → Customer
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Critical
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                At Risk
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Stable
              </div>
            </div>
          </div>

          {/* Chain */}
          <div className="relative overflow-x-auto">
            <div className="min-w-[1050px]">

              <div className="flex items-center justify-between gap-3">

                {nodes.map((node, index) => {
                  const Icon = node.icon;

                  return (
                    <React.Fragment key={node.type}>

                      <div className="w-[220px] shrink-0">

                        <div
                          className={`rounded-xl border p-4 transition-all ${node.status === 'CRITICAL'
                              ? 'border-red-300 bg-red-50 shadow-sm shadow-red-100'
                              : 'border-orange-200 bg-orange-50'
                            }`}
                        >

                          <div className="flex items-start justify-between">
                            <div
                              className={`p-2 rounded-lg ${node.status === 'CRITICAL'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-orange-100 text-orange-600'
                                }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <span
                              className={`px-2 py-1 rounded-full text-[9px] font-bold ${node.status === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                                }`}
                            >
                              {node.status}
                            </span>
                          </div>

                          <p className="text-[10px] font-semibold tracking-wide text-slate-400 mt-4">
                            {node.type}
                          </p>

                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {node.title}
                          </h4>

                          <p className="text-xs font-medium text-slate-600 mt-1">
                            {node.subtitle}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-200/70">
                            <p className="text-[11px] text-slate-500">
                              {node.detail}
                            </p>
                          </div>

                        </div>

                      </div>

                      {index < nodes.length - 1 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="relative w-full">
                            <div className="h-0.5 bg-slate-300 w-full" />
                            <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 bg-white" />
                          </div>
                        </div>
                      )}

                    </React.Fragment>
                  );
                })}

              </div>

              {/* Downstream impact */}
              <div className="mt-8 grid grid-cols-3 gap-4">

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                    Production Impact
                  </p>

                  <p className="text-2xl font-bold text-red-700 mt-1">
                    17
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    Production orders at risk
                  </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                    Inventory Coverage
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-700">
                      2.4
                    </p>
                    <span className="text-xs text-orange-600">
                      days
                    </span>
                  </div>

                  <p className="text-xs text-orange-600 mt-1">
                    Material M-101 remaining
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                    Financial Exposure
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    <IndianRupee className="w-4 h-4 text-red-600" />
                    <p className="text-2xl font-bold text-red-700">
                      27.4L
                    </p>
                  </div>

                  <p className="text-xs text-red-600 mt-1">
                    Revenue currently at risk
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Dependency explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <Network className="w-5 h-5 text-sky-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dependency Impact Analysis
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-5">
                The S-104 supplier shutdown propagates through material M-101
                into the PL-01 Hyderabad Assembly Plant. With only 2.4 days
                of inventory coverage, 17 production orders and 20 customer
                orders are exposed to the disruption.
              </p>

              <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-sky-700">
                <span>Impact propagation detected</span>
                <ChevronRight className="w-4 h-4" />
                <span>AI agents can evaluate recovery options</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </EnterpriseShell>
  );
}