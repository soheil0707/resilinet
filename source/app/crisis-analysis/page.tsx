'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Boxes,
  Building2,
  Clock,
  Database,
  Factory,
  FileText,
  IndianRupee,
  Layers,
  Package,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  Truck,
  Users,
  Bot,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { KpiCard } from '@/components/enterprise/KpiCard';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { HanaDisruption } from '@/lib/hana/repository';
import { useWorkflow } from '@/lib/workflow/workflow-context';

export default function CrisisAnalysisPage() {
  const [hanaDisruptions, setHanaDisruptions] = useState<HanaDisruption[] | null>(null);
  const [dataSource, setDataSource] = useState<'sap-hana' | 'fallback'>('sap-hana');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { workflowState } = useWorkflow();

  const loadData = async () => {
    try {
      const res = await fetch('/api/hana/disruptions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setHanaDisruptions(json.data);
        setDataSource('sap-hana');
        return;
      }
      throw new Error('Invalid response');
    } catch (err) {
      console.warn('HANA disruption query fallback in Crisis Analysis:', err);
      setDataSource('fallback');
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

  const isHana = dataSource === 'sap-hana' && hanaDisruptions !== null && hanaDisruptions.length > 0;

  // Primary disruption record (DIS-1001)
  const primaryIncident = hanaDisruptions?.find((d) => d.DISRUPTION_ID === 'DIS-1001') || {
    DISRUPTION_ID: 'DIS-1001',
    DISRUPTION_TYPE: 'Supplier Delay',
    SEVERITY: 'HIGH',
    LOCATION: 'East India',
    AFFECTED_SUPPLIER_ID: 'S-104',
    AFFECTED_PLANT_ID: 'PLANT-001',
    START_TIME: '2026-09-20T08:00:00Z',
    EXPECTED_DURATION_HOURS: 48,
    STATUS: 'ACTIVE',
    DESCRIPTION: 'Tier-1 Supplier S-104 (Global Metals Ltd.) unplanned blast furnace refractory stoppage halting Steering Assembly (M-101) consignments to PLANT-001 Hyderabad.',
  };

  return (
    <EnterpriseShell>
      {/* ── Page Header ─────────────────────────────────── */}
      <PageHeader
        icon={<AlertOctagon className="w-5 h-5 text-rose-600" />}
        title="CRISIS ANALYSIS"
        description="Multi-layer operational impact assessment, inventory depletion models, and cascading supply-chain exposure."
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              DIS-1001
            </span>
            <LiveDataBadge isLive={isHana} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              title="Refresh live analysis data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <Link
              href="/ai-command-center?disruptionId=DIS-1001"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition shadow-2xs focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:outline-hidden"
            >
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              <span>Launch AI Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {/* ── Lifecycle Stepper (ANALYZE is current) ───────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
        <LifecycleStepper currentStage="ANALYZE" incidentId="DIS-1001" />
      </div>

      {/* ── 2. Crisis Hero Section ──────────────────────── */}
      <section aria-labelledby="crisis-hero-heading">
        <Card className="p-5 border-l-4 border-l-rose-500 bg-rose-50/25 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
                  {primaryIncident.DISRUPTION_ID}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                  {primaryIncident.DISRUPTION_TYPE}
                </span>
                <Badge variant="warning" size="sm">
                  {primaryIncident.SEVERITY} SEVERITY
                </Badge>
                <Badge variant="critical" size="sm" pulse dot>
                  {primaryIncident.STATUS}
                </Badge>
              </div>

              <div>
                <h2 id="crisis-hero-heading" className="text-base sm:text-lg font-bold text-slate-900">
                  Global Metals Ltd. — Tier-1 Steering Assembly Supply Halt
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
                  Supplier <strong className="text-slate-900">S-104 / Global Metals Ltd.</strong> (Jamshedpur, East India) is offline for an expected duration of <strong className="text-slate-900">48 hours</strong>. Shipments of critical Steering Assembly (<strong className="text-slate-900 font-mono">M-101</strong>) to Plant <strong className="text-slate-900 font-mono">PLANT-001</strong> (Hyderabad) are completely stopped.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1 font-medium">
                <span>Facility: <strong className="text-slate-900 font-mono">{primaryIncident.AFFECTED_PLANT_ID || 'PLANT-001'}</strong> (Assembly Line 1)</span>
                <span>•</span>
                <span>Region: <strong className="text-slate-900">{primaryIncident.LOCATION}</strong></span>
                <span>•</span>
                <span>Exposure: <strong className="text-rose-700 font-mono font-bold">₹27.4L</strong></span>
                <span>•</span>
                <span>Buffer Depletion: <strong className="text-amber-700 font-mono font-bold">2.4 Days</strong></span>
              </div>
            </div>

            <div className="shrink-0 self-start lg:self-center">
              <Link
                href="/ai-command-center?disruptionId=DIS-1001"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-xs focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:outline-hidden"
              >
                <Bot className="w-4 h-4 text-sky-400" />
                <span>Evaluate Strategies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ── 3. Impact Overview KPI Row ───────────────────── */}
      <section aria-label="Crisis Impact Metrics">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Revenue at Risk"
              value="₹27.4L"
              status="critical"
              icon={<IndianRupee className="w-4 h-4" />}
              delta={{ value: '₹2,740,000', isPositive: false, label: 'exposure' }}
              tooltip="Unmitigated financial loss across 20 affected customer orders"
            />
            <KpiCard
              label="Inventory Risk"
              value="CRITICAL"
              status="critical"
              icon={<ShieldAlert className="w-4 h-4" />}
              delta={{ value: '2.4 Days', isPositive: false, label: 'buffer left' }}
              tooltip="Stock buffer will be completely depleted in 2.4 days"
            />
            <KpiCard
              label="Stock on Hand"
              value={240}
              unit="units"
              status="warning"
              icon={<Package className="w-4 h-4" />}
              delta={{ value: '500 Safety', isPositive: false, label: 'threshold' }}
              tooltip="Physical inventory currently available in Hyderabad warehouse"
            />
            <KpiCard
              label="Daily Consumption"
              value={100}
              unit="u/day"
              status="neutral"
              icon={<Layers className="w-4 h-4" />}
              delta={{ value: 'Full shift', isPositive: true, label: 'burn rate' }}
              tooltip="Average daily consumption of M-101 components on Assembly Line 1"
            />
            <KpiCard
              label="Orders at Risk"
              value={17}
              unit="orders"
              status="warning"
              icon={<Factory className="w-4 h-4" />}
              delta={{ value: '12 EV-X Prime', isPositive: false, label: 'high margin' }}
              tooltip="Production work orders scheduled within the 7-day unmitigated window"
            />
            <KpiCard
              label="Customer Commitments"
              value={20}
              unit="orders"
              status="warning"
              icon={<Users className="w-4 h-4" />}
              delta={{ value: '8 OEM Fleets', isPositive: false, label: 'penalties' }}
              tooltip="Confirmed customer deliveries exposed to contractual delay clauses"
            />
          </div>
        )}
      </section>

      {/* ── 5. Operational Cascading Impact Chain ─────────── */}
      <section aria-labelledby="impact-chain-heading">
        <Card className="p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                DEPENDENCY GRAPH
              </span>
              <h3 id="impact-chain-heading" className="text-sm font-bold text-slate-900">
                6-Stage Cascading Operational Impact Chain
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Downstream Failure Cascade
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            {/* Stage 1: Supplier */}
            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-1 relative">
              <div className="flex items-center justify-between text-rose-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 1. Supplier
                </span>
                <Badge variant="critical" size="sm">SHUTDOWN</Badge>
              </div>
              <p className="font-bold text-slate-900 mt-1">S-104 Global Metals</p>
              <p className="text-[11px] text-slate-500">Jamshedpur • 48h halt</p>
            </div>

            {/* Stage 2: Material */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-500" /> 2. Material
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-500">M-101</span>
              </div>
              <p className="font-bold text-slate-900 mt-1">Steering Assembly</p>
              <p className="text-[11px] text-slate-500">Zero replenishment</p>
            </div>

            {/* Stage 3: Plant */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-slate-500" /> 3. Plant
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-500">PL-01</span>
              </div>
              <p className="font-bold text-slate-900 mt-1">PLANT-001 Hyderabad</p>
              <p className="text-[11px] text-slate-500">Utilization: 85%</p>
            </div>

            {/* Stage 4: Inventory */}
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between text-amber-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" /> 4. Inventory
                </span>
                <Badge variant="warning" size="sm">2.4 DAYS</Badge>
              </div>
              <p className="font-bold text-slate-900 mt-1">240 Units in Stock</p>
              <p className="text-[11px] text-slate-500">Burn: 100 units/day</p>
            </div>

            {/* Stage 5: Production */}
            <div className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-200 space-y-1">
              <div className="flex items-center justify-between text-rose-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> 5. Production
                </span>
                <Badge variant="critical" size="sm">HALT</Badge>
              </div>
              <p className="font-bold text-slate-900 mt-1">17 Orders Delayed</p>
              <p className="text-[11px] text-slate-500">EV-X Prime lines blocked</p>
            </div>

            {/* Stage 6: Customer */}
            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-300 space-y-1">
              <div className="flex items-center justify-between text-rose-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> 6. Customer
                </span>
                <Badge variant="critical" size="sm">PENALTY</Badge>
              </div>
              <p className="font-bold text-slate-900 mt-1">20 Fleet Orders</p>
              <p className="text-[11px] text-rose-700 font-bold">₹27.4L revenue at risk</p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Middle Split: Root Cause Narrative & Inventory/Buffer View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── 4. Root Cause / Incident Context (Cols 7) ───── */}
        <section aria-labelledby="root-cause-heading" className="lg:col-span-7 flex flex-col">
          <Card className="p-5 flex flex-col justify-between flex-1 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    TELEMETRY DIAGNOSIS
                  </span>
                  <h3 id="root-cause-heading" className="text-sm font-bold text-slate-900">
                    Incident Root Cause & Facility Context
                  </h3>
                </div>
                <Badge variant="warning" size="sm">
                  PLANT-001 EXPOSURE
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Disruption Type
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    Supplier Delay
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Affected Supplier
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    S-104 Global Metals
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Geographic Region
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    East India (Jamshedpur)
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Receiving Facility
                  </span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                    PLANT-001 (Hyderabad)
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Expected Duration
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    48 hours
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Unmitigated Delay
                  </span>
                  <span className="font-mono font-bold text-rose-700 mt-0.5 block">
                    7 Days
                  </span>
                </div>
              </div>

              {/* Verified Narrative */}
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                <p>
                  <strong className="text-slate-900">Operational Breakdown:</strong> An unplanned blast furnace refractory brick maintenance stoppage occurred at Global Metals Ltd. (S-104) in Jamshedpur. This has completely halted dispatches of raw forging billets and finished Steering Assembly units (M-101).
                </p>
                <p>
                  <strong className="text-slate-900">Line Vulnerability:</strong> Plant PLANT-001 in Hyderabad operates on lean JIT inventory holding 240 units on hand against a continuous daily run-rate of 100 units. Without expedited logistics or stock reallocation, the assembly line faces total shutdown within 58 hours (2.4 days).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Incident Detected: 2026-09-20 08:00 UTC</span>
              <span className="font-semibold text-slate-700">Diagnosis Confidence: 96%</span>
            </div>
          </Card>
        </section>

        {/* ── 6. Inventory & Buffer Depletion View (Cols 5) ─ */}
        <section aria-labelledby="inventory-view-heading" className="lg:col-span-5 flex flex-col">
          <Card className="p-5 flex flex-col justify-between flex-1 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    STOCK TELEMETRY
                  </span>
                  <h3 id="inventory-view-heading" className="text-sm font-bold text-slate-900">
                    Inventory & Buffer Gauge (M-101)
                  </h3>
                </div>
                <Badge variant="critical" size="sm">
                  CRITICAL DEFICIT
                </Badge>
              </div>

              {/* Progress gauge representation */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Stock Buffer Consumption</span>
                  <span className="font-mono font-bold text-rose-700">240 / 500 units</span>
                </div>
                {/* Visual bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-rose-500 h-full" style={{ width: '48%' }} title="Current Stock (240)" />
                  <div className="bg-amber-300 h-full" style={{ width: '52%' }} title="Deficit below Safety Stock (260)" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Current: 240 units (48%)</span>
                  <span>Safety Threshold: 500 units</span>
                </div>
              </div>

              {/* Telemetry numbers */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Stock
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    240 units
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Safety Stock
                  </span>
                  <span className="font-mono font-bold text-slate-700 text-sm mt-0.5 block">
                    500 units
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reorder Level
                  </span>
                  <span className="font-mono font-bold text-slate-700 text-sm mt-0.5 block">
                    600 units
                  </span>
                </div>
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Depletion Zero
                  </span>
                  <span className="font-mono font-extrabold text-rose-800 text-sm mt-0.5 block">
                    2.4 Days
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-rose-50 text-xs text-rose-950 border border-rose-200">
                <span className="font-bold block mb-0.5">Safety Stock Breach:</span>
                Inventory is currently 260 units below safety tolerance. Stockout occurs before Supplier S-104 refractory work concludes.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Source: SAP EWM (PLANT-001)</span>
              <span className="font-mono font-bold text-rose-600">Coverage: 58 hrs</span>
            </div>
          </Card>
        </section>
      </div>

      {/* ── 7. Structured Risk Signals Panel ─────────────── */}
      <section aria-labelledby="risk-signals-heading">
        <Card className="p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                MULTI-FACTOR VULNERABILITY
              </span>
              <h3 id="risk-signals-heading" className="text-sm font-bold text-slate-900">
                Structured Operational Risk Signals
              </h3>
            </div>
            <Badge variant="critical" size="sm">
              5 RISK DOMAINS EVALUATED
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Supplier Risk */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Supplier Risk</span>
                <Badge variant="warning" size="sm">HIGH</Badge>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Unplanned 10-day shutdown at S-104 exceeds available safety buffer by 7.6 days.
              </p>
            </div>

            {/* 2. Inventory Risk */}
            <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">Inventory Risk</span>
                <Badge variant="critical" size="sm">CRITICAL</Badge>
              </div>
              <p className="text-[11px] text-rose-950 leading-relaxed">
                2.4 days stock remaining at 100 units/day. Immediate stock reallocation required.
              </p>
            </div>

            {/* 3. Plant Risk */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Plant Risk</span>
                <Badge variant="warning" size="sm">HIGH</Badge>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Line 1 assembly at PLANT-001 faces immediate stoppage; idle capacity cost ₹3.2L/day.
              </p>
            </div>

            {/* 4. Production Risk */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Production Risk</span>
                <Badge variant="warning" size="sm">HIGH</Badge>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                17 high-priority orders for Astra EV-X Prime deferred without multi-modal expediting.
              </p>
            </div>

            {/* 5. Customer Impact */}
            <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">Customer Impact</span>
                <Badge variant="critical" size="sm">CRITICAL</Badge>
              </div>
              <p className="text-[11px] text-rose-950 leading-relaxed">
                20 OEM fleet deliveries face SLA breach; contract penalty clauses trigger in 72 hours.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── 8. Next Action Callout ────────────────────────── */}
      <section aria-label="Next Workflow Action">
        <Card className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950 text-white border-0 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-300 bg-sky-900/60 px-2 py-0.5 rounded border border-sky-700/50">
                  NEXT STAGE • DECISION ORCHESTRATION
                </span>
                <span className="text-xs text-slate-400">• Multi-Agent Consensus Ready</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Crisis Analysis Complete — Ready for Autonomous Agent Strategy Ranking
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Operational impact parameters are verified. Five specialized domain AI agents (Inventory, Procurement, Production, Logistics, Finance) can now evaluate and rank mitigation alternatives.
              </p>
            </div>

            <div className="shrink-0 self-start md:self-center">
              <Link
                href="/ai-command-center?disruptionId=DIS-1001"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold rounded-lg transition shadow-md focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-hidden"
              >
                <Bot className="w-4 h-4 text-slate-950" />
                <span>OPEN AI COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </EnterpriseShell>
  );
}
