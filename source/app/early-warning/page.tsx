'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { DEMO_EARLY_WARNING_RISK, EarlyWarningRisk } from '@/lib/data/demo-data';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Clock,
  IndianRupee,
  Layers,
  Users,
  Building2,
  Package,
  Factory,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  RotateCcw,
  Warehouse,
  Truck,
} from 'lucide-react';

export default function EarlyWarningPage() {
  const router = useRouter();
  const { setWorkflowState } = useWorkflow();
  const [riskData, setRiskData] = useState<EarlyWarningRisk>(DEMO_EARLY_WARNING_RISK);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mitigationInitiated, setMitigationInitiated] = useState(false);

  const handlePrepareMitigation = () => {
    setMitigationInitiated(true);
    // Connect to existing workflow without breaking it
    setWorkflowState('CRISIS_ACTIVE');
    setTimeout(() => {
      router.push('/recovery-strategies');
    }, 600);
  };

  const handleDismissRisk = () => {
    setDismissed(true);
    setRiskData((prev) => ({
      ...prev,
      status: 'DISMISSED',
    }));
  };

  const handleReset = () => {
    setDismissed(false);
    setMitigationInitiated(false);
    setRiskData(DEMO_EARLY_WARNING_RISK);
  };

  return (
    <EnterpriseShell>
      <div className="space-y-6">
        {/* ── Top Header & Context Banner ─────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    Early Warning Signal
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    ID: {riskData.riskId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Detected: {riskData.detectedAt}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Pre-Crisis Risk Detection & Early Warning
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  AI-assisted risk assessment synthesizing internal enterprise signals from SAP ERP, inventory coverage rates, and carrier transit times to highlight emerging supplier volatility prior to total shutdown.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {dismissed ? 'Signal Dismissed (Logged)' : mitigationInitiated ? 'Mitigation Hand-off Active' : 'Signal Active: Elevated Risk'}
              </span>
            </div>
          </div>

          {/* Compliance & Methodological Note */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Methodology Note:</strong> This early warning signal represents an AI-assisted risk assessment derived from historical dispatch patterns and threshold variance. No external unverified feeds or deterministic future predictions are claimed.
            </span>
          </div>
        </div>

        {/* ── Section 1: Risk Overview ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              <span>1. Risk Overview</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Corpus: Astra Motors Manufacturing (PL-01 Hyderabad)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk ID</p>
              <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{riskData.riskId}</p>
              <p className="text-[10px] text-slate-500 mt-1">Pre-crisis registry</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Supplier</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{riskData.supplier.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">{riskData.supplier.id} • {riskData.supplier.location.split(',')[0]}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Material</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{riskData.material.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">{riskData.material.code}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assembly Plant</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">PL-01 Hyderabad</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Lines 1 & 2</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Severity Level</p>
              <span className="inline-block mt-0.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                HIGH SEVERITY
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Criticality tier 1</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Operating Status</p>
              <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded border ${
                dismissed
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {dismissed ? 'DISMISSED' : 'EARLY_WARNING'}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Telemetry active</p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Risk Signals ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>2. Risk Signals & Indicators</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed enterprise variances triggering early warning escalation
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">5 Confluent Signals Detected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Signal 1: Reliability Deterioration */}
            <div className="border border-red-200 bg-red-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-800 bg-red-100 px-2 py-0.5 rounded">
                  Reliability Drop
                </span>
                <span className="text-xs font-mono font-extrabold text-red-700">98.0% → 88.0%</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Supplier Delivery Reliability Deterioration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Global Metals Ltd. (S-104) delivery punctuality deteriorated by 10.0% across the trailing 3 consecutive dispatch cycles, signaling operational strain at their Jamshedpur smelting unit.
              </p>
              <div className="pt-2 border-t border-red-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Baseline: 98.0%</span>
                <span className="font-semibold text-red-600">-10.0% delta</span>
              </div>
            </div>

            {/* Signal 2: Delay Trend */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Delay Trend
                </span>
                <span className="text-xs font-mono font-extrabold text-amber-700">+2.8 Days</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Increasing Shipment Delay Trend
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Freight line-haul delay averaged +2.8 days over normal lead time (10 days). Recurring carrier exceptions reported on the eastern corridor checkpoint (Kolkata-Vizag-Hyderabad).
              </p>
              <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Expected: 10 Days</span>
                <span className="font-semibold text-amber-700">Actual: 12.8 Days</span>
              </div>
            </div>

            {/* Signal 3: Inventory Coverage */}
            <div className="border border-red-200 bg-red-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-800 bg-red-100 px-2 py-0.5 rounded">
                  Buffer Exposure
                </span>
                <span className="text-xs font-mono font-extrabold text-red-700">2.4 Days</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Inventory Coverage Buffer Depletion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hyderabad plant on-hand stock is down to 240 units of M-101. At current 100 units/day burn rate, inventory coverage is 2.4 days against an enterprise safety target of 5.0 days.
              </p>
              <div className="pt-2 border-t border-red-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Target: 5.0 Days</span>
                <span className="font-semibold text-red-600">Deficit: -2.6 Days</span>
              </div>
            </div>

            {/* Signal 4: Supplier Status */}
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                  Supplier Status
                </span>
                <span className="text-xs font-bold text-slate-800">Warning State</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Supplier Operational Vulnerability
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advance maintenance indicators show S-104 entering unplanned furnace repair and state environmental compliance audits, heightening probability of complete line shutdown.
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Entity: S-104</span>
                <span className="font-semibold text-slate-700">Category: Steering Tier-1</span>
              </div>
            </div>

            {/* Signal 5: Material Criticality */}
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-2 md:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-800 bg-red-100 px-2 py-0.5 rounded">
                  Bottleneck Component
                </span>
                <span className="text-xs font-bold text-red-700">Criticality: CRITICAL</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Material Criticality & Line Interdependence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                M-101 Steering Assembly is a non-substitutable direct assembly input. A stockout directly halts both EV-X Prime (Line 1) and Sierra Commercial (Line 2), impacting 17 scheduled work orders with zero in-process bypass.
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Unit Cost: ₹18,500</span>
                <span className="font-semibold text-slate-700">Chassis Safety-Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Dependency Impact Chain ──────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>3. Dependency Impact Chain</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Propagation path of the potential impact across the manufacturing hierarchy
              </p>
            </div>
            <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
              6-Stage Value Stream
            </span>
          </div>

          {/* Value stream visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
            {/* Stage 1: Supplier */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 1</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Supplier</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">Global Metals (S-104)</p>
                <p className="text-[10px] text-slate-500">Jamshedpur Smelter</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-amber-700">
                Reliability: 88.0%
              </div>
            </div>

            {/* Stage 2: Material */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 2</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Material</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">Steering Assembly</p>
                <p className="text-[10px] text-slate-500 font-mono">M-101 • Critical</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-600">
                Lead Time: 10+2.8d
              </div>
            </div>

            {/* Stage 3: Inventory */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Warehouse className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 3</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Inventory</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">240 Units On-Hand</p>
                <p className="text-[10px] text-slate-500">Burn: 100 units/day</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-600">
                Coverage: 2.4 Days
              </div>
            </div>

            {/* Stage 4: Plant */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Factory className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 4</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Plant</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">PL-01 Hyderabad</p>
                <p className="text-[10px] text-slate-500">Capacity: 120 u/day</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600">
                Util: 88.5% Degraded
              </div>
            </div>

            {/* Stage 5: Production */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 5</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Production</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">17 Work Orders</p>
                <p className="text-[10px] text-slate-500">EV-X & Sierra Lines</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-amber-700">
                Risk of 7-Day Delay
              </div>
            </div>

            {/* Stage 6: Customer */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between relative">
              <div>
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 6</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Customer</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1">20 Fleet Orders</p>
                <p className="text-[10px] text-slate-500">Commercial Fleets</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-700">
                Exposure: ₹27.4L
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Risk Assessment ──────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>4. AI-Assisted Risk Assessment</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated probabilistic exposure based on current inventory depletion and delay velocity
              </p>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
              High Disruption Probability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Probability Metric */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Disruption Probability
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold font-mono text-amber-600">
                  {riskData.assessment.probabilityPct}%
                </p>
                <span className="text-xs font-semibold text-amber-700">High Risk</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${riskData.assessment.probabilityPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                78% likelihood of assembly line pause within 48–72 hours without preventive intervention.
              </p>
            </div>

            {/* Revenue Exposure */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Potential Revenue Exposure
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold font-mono text-red-600">₹27.4L</p>
                <span className="text-xs font-semibold text-red-700">At Risk</span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-3">₹2,740,000 INR</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct finished vehicle delayed billings + contractual SLA late-delivery penalties.
              </p>
            </div>

            {/* Production Exposure */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Production Exposure
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold font-mono text-slate-900">
                  {riskData.assessment.productionOrdersCount}
                </p>
                <span className="text-xs font-semibold text-slate-600">Work Orders</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-3">Lines 1 & 2 at PL-01</p>
              <p className="text-[11px] text-slate-500 mt-1">
                12 EV-X Prime + 5 Sierra Commercial chassis assembly orders scheduled this week.
              </p>
            </div>

            {/* Customer Exposure */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Customer Commitments
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold font-mono text-slate-900">
                  {riskData.assessment.customerOrdersCount}
                </p>
                <span className="text-xs font-semibold text-slate-600">Fleet Orders</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-3">Tier-1 Logistics Accounts</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes 8 strategic OEM fleet contracts with strict 72-hour milestone deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 5: Recommended Preventive Actions ───────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>5. Recommended Preventive Actions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-assisted proactive countermeasures to mitigate the early warning before crisis onset
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">5 Actionable Mitigations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData.preventiveRecommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      REC-0{index + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      rec.readiness === 'READY'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {rec.readiness.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{rec.title}</h3>
                  <p className="text-[11px] font-semibold text-sky-700 mt-0.5">{rec.category}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.action}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {rec.leadTime}
                  </span>
                  <span className="font-semibold text-slate-700">{rec.costEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 6: Human Approval & Decision Control ─────── */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded">
                  Human-in-the-Loop Governance
                </span>
                <span className="text-xs text-slate-400">
                  Astra Motors Autonomous Operations Policy
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Preventive action requires authorized manager review.
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Autonomous agent execution remains paused until an authorized Supply Chain Manager confirms or escalates preventive actions. All decisions are captured in the enterprise audit log.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Authority Level: SCM-II+</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Review Risk Details</span>
              </button>

              <button
                onClick={handleDismissRisk}
                disabled={dismissed}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>{dismissed ? 'Risk Dismissed' : 'Dismiss Risk'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {dismissed ? (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Early Warning</span>
                </button>
              ) : (
                <button
                  onClick={handlePrepareMitigation}
                  disabled={mitigationInitiated}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  {mitigationInitiated ? (
                    <span>Transitioning to Recovery Workflow...</span>
                  ) : (
                    <>
                      <span>Prepare Mitigation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Feedback banners */}
          {dismissed && (
            <div className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Signal EW-2026-089 marked as Dismissed. Ongoing telemetry will continue in passive monitoring mode.</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-sky-400 hover:underline font-semibold"
              >
                Undo
              </button>
            </div>
          )}

          {mitigationInitiated && (
            <div className="bg-sky-950/80 border border-sky-700 text-sky-200 text-xs rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Connecting early warning telemetry to crisis orchestration... Redirecting to Recovery Strategies.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Review Risk Parameter Breakdown Modal ───────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Audit Inspection • {riskData.riskId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  AI-Assisted Early Warning Signal Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed telemetry inputs evaluated across Astra Motors supply chain models.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                <p className="font-bold text-slate-800">Signal Confidence & Model Version</p>
                <p className="text-slate-600 leading-relaxed">
                  Early warning score is generated via 5-factor weighted multivariate scoring against 24-month SAP historical dispatch baselines. Confidence index: <strong>84.2%</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-slate-800">Evaluated Telemetry Points</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>EDI 856 Advanced Shipping Notice lag: +2.8 days over lead time SLA.</li>
                  <li>Jamshedpur outbound line-haul checkpoint velocity variance: 22% delay.</li>
                  <li>Hyd plant inventory burn rate: 100 units/day against 240 units remaining stock.</li>
                  <li>Secondary supplier ready capacity (Bharat Precision): 220 units on 48h call-off.</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-[11px] leading-relaxed">
                <strong>Governance Policy:</strong> Clicking &quot;Prepare Mitigation&quot; transitions the scenario into active mitigation mode, linking to Recovery Strategies and What-If Simulator without breaking state persistence.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Close Audit View
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  handlePrepareMitigation();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Proceed to Prepare Mitigation
              </button>
            </div>
          </div>
        </div>
      )}
    </EnterpriseShell>
  );
}
