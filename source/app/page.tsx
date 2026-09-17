'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  IndianRupee,
  Layers,
  Users,
  ShieldCheck,
  RefreshCw,
  Server,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { CriticalDisruptionBanner } from '@/components/dashboard/CriticalDisruptionBanner';
import { ImpactChain } from '@/components/dashboard/ImpactChain';
import { InventoryBurnChart } from '@/components/dashboard/InventoryBurnChart';
import { SupplierNetworkHealth } from '@/components/dashboard/SupplierNetworkHealth';
import { PlantUtilization } from '@/components/dashboard/PlantUtilization';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { getDashboardMetrics, getDataSourceStatus, DataSourceStatus } from '@/lib/data/repository';
import { DashboardMetrics } from '@/lib/supabase/types';
import { DEMO_DASHBOARD_METRICS } from '@/lib/data/demo-data';
import { useWorkflow } from '@/lib/workflow/workflow-context';

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEMO_DASHBOARD_METRICS);
  const [status, setStatus] = useState<DataSourceStatus>({
    isLive: false,
    label: 'Checking connection...',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { workflowState, resetCrisisWorkflow } = useWorkflow();
  const isRecovered = workflowState === 'RECOVERED';

  const loadData = async () => {
    try {
      const [metricsData, statusData] = await Promise.all([
        getDashboardMetrics(),
        getDataSourceStatus(),
      ]);
      setMetrics(metricsData);
      setStatus(statusData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  return (
    <EnterpriseShell>
      {/* ── Recovery Banner (shown when RECOVERED) ────────── */}
      {isRecovered && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Recovery In Progress — DIS-2026-001 Mitigated</p>
              <p className="text-xs text-emerald-700">
                Combined Recovery strategy approved & executed. Delay reduced: 7 Days → 1 Day. ₹24.2L protected.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/recovery-execution"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition"
            >
              View Execution Console
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={resetCrisisWorkflow}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Scenario
            </button>
          </div>
        </div>
      )}

      {/* ── Top Controls & Status Bar ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Server className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-700">Data Architecture:</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              status.isLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            Auto-refresh: 30s
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isRecovered ? (
          // Mitigated state KPIs
          <>
            <KpiCard
              title="Active Disruptions"
              value="Mitigated"
              subtitle="S-104 recovery in progress"
              icon={ShieldCheck}
              variant="healthy"
              badgeText="RECOVERED"
            />
            <KpiCard
              title="Revenue at Risk"
              value="₹3.2L"
              subtitle="₹24.2L protected by recovery"
              icon={IndianRupee}
              variant="warning"
              badgeText="₹24.2L SAVED"
            />
            <KpiCard
              title="Production Orders at Risk"
              value={2}
              subtitle="15 orders restored to schedule"
              icon={Layers}
              variant="warning"
              badgeText="15 RECOVERED"
            />
            <KpiCard
              title="Customer Orders at Risk"
              value={2}
              subtitle="18 fleet orders re-confirmed"
              icon={Users}
              variant="warning"
              badgeText="18 CONFIRMED"
            />
          </>
        ) : (
          // Crisis state KPIs
          <>
            <KpiCard
              title="Active Disruptions"
              value={metrics.activeDisruptions}
              subtitle="1 Supplier Shutdown in progress"
              icon={AlertOctagon}
              variant="critical"
              badgeText="CRITICAL"
            />
            <KpiCard
              title="Revenue at Risk"
              value="₹27.4L"
              subtitle="₹2,740,000 unmitigated loss"
              icon={IndianRupee}
              variant="critical"
              badgeText="EXPOSURE"
            />
            <KpiCard
              title="Production Orders at Risk"
              value={metrics.productionOrdersAtRisk}
              subtitle="17 Hyderabad assembly orders"
              icon={Layers}
              variant="warning"
              badgeText="7-DAY DELAY"
            />
            <KpiCard
              title="Customer Orders at Risk"
              value={metrics.customerOrdersAtRisk}
              subtitle="20 Fleet & Dealership commitments"
              icon={Users}
              variant="warning"
              badgeText="SLA BREACH"
            />
          </>
        )}
      </div>

      {/* ── Critical Disruption Banner & Primary Action ──── */}
      <CriticalDisruptionBanner disruption={metrics.criticalDisruption} />

      {/* ── 5-Node Cascading Impact Chain ────────────────── */}
      <ImpactChain
        supplier={metrics.impactChain.supplier}
        material={metrics.impactChain.material}
        plant={metrics.impactChain.plant}
        productionOrdersCount={metrics.impactChain.productionOrdersCount}
        customerOrdersCount={metrics.impactChain.customerOrdersCount}
      />

      {/* ── Analytics & Operational Health Grid ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventoryBurnChart trendData={metrics.inventoryTrend} />
        <SupplierNetworkHealth suppliers={metrics.supplierHealth} />
        <PlantUtilization plants={metrics.plantUtilization} />
      </div>

      {/* ── Recent Supply Chain Activity Feed ────────────── */}
      <ActivityFeed activities={metrics.recentActivity} />
    </EnterpriseShell>
  );
}
