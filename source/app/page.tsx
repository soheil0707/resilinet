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
  AlertTriangle,
  GitBranch,
  Sliders,
  CheckSquare,
  PlayCircle,
  Database,
  Activity,
  Bot,
  Network,
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

  const { workflowState, approvedStrategy, selectedStrategy, resetCrisisWorkflow } = useWorkflow();
  const isRecovered = workflowState === 'RECOVERED';
  const activeStrategy = approvedStrategy || selectedStrategy;
  const delayDays = activeStrategy?.recovery_time_days ?? 1;
  const revSaved = activeStrategy ? (activeStrategy.revenue_protected_inr / 100000).toFixed(1) : '24.2';
  const revRemaining = activeStrategy ? ((2740000 - activeStrategy.revenue_protected_inr) / 100000).toFixed(1) : '3.2';

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
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-900">Recovery In Progress — DIS-2026-001 Mitigated</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Approved Strategy: {activeStrategy?.name || 'Combined Recovery'}
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                {activeStrategy?.name || 'Combined Recovery'} strategy executed. Delay reduced: 7 Days → {delayDays} {delayDays === 1 ? 'Day' : 'Days'}. ₹{revSaved}L protected.
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
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded transition cursor-pointer"
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
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-medium text-slate-500">
            Lifecycle: <span className="font-bold text-slate-700">{workflowState}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCrisisWorkflow}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded transition cursor-pointer"
            title="Reset Workflow & Demo Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Auto-refresh: 30s
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition cursor-pointer"
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

      {/* ── Quick Workflow Navigation Console ─────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ResiliNet Orchestration Pipeline & Quick Navigation
            </span>
            <p className="text-[11px] text-slate-500">
              Direct access to all pre-crisis, real-time crisis orchestration, and recovery workflows
            </p>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 self-start sm:self-auto">
            10 Workflows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <Link
            href="/early-warning"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Pre-Crisis</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Early Warning</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Risk horizon & alerts</p>
            </div>
          </Link>

          <Link
            href="/crisis-analysis"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Activity className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">Active</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-red-900">Crisis Analysis</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Deep impact breakdown</p>
            </div>
          </Link>

          <Link
            href="/ai-command-center"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Bot className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">AI Agents</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-sky-900">AI Command</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Multi-agent consensus</p>
            </div>
          </Link>

          <Link
            href="/what-if-simulator"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Sliders className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">Simulate</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">What-If Simulator</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Scenario trade-offs</p>
            </div>
          </Link>

          <Link
            href="/recovery-strategies"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <GitBranch className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Ranked</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Recovery Strategies</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">4 multi-factor options</p>
            </div>
          </Link>

          <Link
            href="/approval-center"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <CheckSquare className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-100 text-violet-800">Sign-Off</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-violet-900">Approval Center</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Cross-functional consensus</p>
            </div>
          </Link>

          <Link
            href="/recovery-execution"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <PlayCircle className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">Execute</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-sky-900">Recovery Execution</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Live action pipeline</p>
            </div>
          </Link>

          <Link
            href="/resilience-memory"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Database className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800">Learn</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-cyan-900">Resilience Memory</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Post-mortem & SOPs</p>
            </div>
          </Link>

          <Link
            href="/supply-chain-map"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Network className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">Topology</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900">Network Map</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">Multi-tier facilities</p>
            </div>
          </Link>

          <Link
            href="/integration-hub"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Layers className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">Connect</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900">Integration Hub</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">ERP & intelligence feeds</p>
            </div>
          </Link>
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
              value={`₹${revRemaining}L`}
              subtitle={`₹${revSaved}L protected by recovery`}
              icon={IndianRupee}
              variant="warning"
              badgeText={`₹${revSaved}L SAVED`}
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
