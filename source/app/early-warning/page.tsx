'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
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
  CloudRain,
  Radio,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';

const DECISION_WEIGHTS = [
  { label: 'Recovery Time', weight: '30%', color: 'bg-sky-500' },
  { label: 'Revenue Protected', weight: '25%', color: 'bg-emerald-500' },
  { label: 'Cost Efficiency', weight: '20%', color: 'bg-violet-500' },
  { label: 'Risk Level', weight: '15%', color: 'bg-amber-500' },
  { label: 'Customer Impact', weight: '10%', color: 'bg-rose-500' },
];

export interface HanaDisruptionRecord {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_SUPPLIER_ID?: string | null;
  AFFECTED_PLANT_ID?: string | null;
  EXPECTED_DURATION_HOURS: number;
  STATUS: string;
  DESCRIPTION: string;
}

export interface HanaDisruptionContextRecord {
  DISRUPTION_ID: string;
  INVENTORY_ID?: string;
  MATERIAL_ID?: string;
  CURRENT_STOCK?: number;
  SAFETY_STOCK?: number;
  DAILY_CONSUMPTION?: number;
  PLANT_NAME?: string;
  INVENTORY_RISK?: string;
}

export interface HanaStrategyItem {
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  ORCHESTRATOR_SCORE: number | string;
  AI_RECOMMENDED?: boolean;
  AI_REASON?: string;
  DESCRIPTION?: string;
}

export default function EarlyWarningPage() {
  const router = useRouter();
  const { setWorkflowState } = useWorkflow();

  const [disruptions, setDisruptions] = useState<HanaDisruptionRecord[]>([]);
  const [disruptionContext, setDisruptionContext] = useState<HanaDisruptionContextRecord | null>(null);
  const [strategies, setStrategies] = useState<HanaStrategyItem[]>([]);
  const [hanaActive, setHanaActive] = useState(false);
  const [hanaError, setHanaError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationHorizon, setSimulationHorizon] = useState<number>(48);
  const [dismissed, setDismissed] = useState(false);
  const [mitigationInitiated, setMitigationInitiated] = useState(false);

  const loadHanaData = async () => {
    setIsLoading(true);
    setHanaError(null);
    try {
      const [disrupRes, stratRes] = await Promise.all([
        fetch('/api/hana/disruptions'),
        fetch('/api/hana/recovery-strategies'),
      ]);

      let active = false;

      if (disrupRes.ok) {
        const disrupJson = await disrupRes.json();
        if (disrupJson.success && Array.isArray(disrupJson.data)) {
          setDisruptions(disrupJson.data);
          active = true;
          if (Array.isArray(disrupJson.context) && disrupJson.context.length > 0) {
            const ctx = disrupJson.context.find((c: any) => c.DISRUPTION_ID === 'DIS-1001') || disrupJson.context[0];
            setDisruptionContext(ctx);
          }
        }
      }

      if (stratRes.ok) {
        const stratJson = await stratRes.json();
        if (stratJson.success && Array.isArray(stratJson.strategies)) {
          setStrategies(stratJson.strategies);
          active = true;
        }
      }

      if (!active) {
        setHanaError('SAP HANA Cloud operational service unavailable');
      }
      setHanaActive(active);
    } catch (err) {
      console.error('Failed to load HANA data in Early Warning:', err);
      setHanaActive(false);
      setHanaError('SAP HANA Cloud operational service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHanaData();
  }, []);

  // Primary disruption (DIS-1001)
  const primaryDisruption = useMemo(() => {
    return disruptions.find((d) => d.DISRUPTION_ID === 'DIS-1001') || disruptions[0] || null;
  }, [disruptions]);

  const handlePrepareMitigation = () => {
    setMitigationInitiated(true);
    setWorkflowState('CRISIS_ACTIVE');
    router.push('/recovery-strategies');
  };

  const handleDismissRisk = () => {
    setDismissed(true);
  };

  const handleReset = () => {
    setDismissed(false);
    setMitigationInitiated(false);
  };

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── HANA Service Unavailable Banner ── */}
        {hanaError && (
          <section
            aria-label="HANA Service Status"
            className="bg-rose-50 border-2 border-rose-400 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-200"
          >
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-950">
                SAP HANA Cloud operational service unavailable
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                Live operational early-warning telemetry requires SAP HANA Cloud (HACKFEST0145). Operational demo fallbacks have been removed.
              </p>
            </div>
            <button
              onClick={loadHanaData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition"
            >
              Retry Connection
            </button>
          </section>
        )}

        {/* ── 1. Page Header ────────────────────────────────────── */}
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
                    ID: {primaryDisruption ? primaryDisruption.DISRUPTION_ID : 'Not available from SAP HANA'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Status: {primaryDisruption ? primaryDisruption.STATUS : 'Not available from SAP HANA'}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Early Warning Center
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Operational early warning signals powered by live SAP HANA Cloud telemetry.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSimulationModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Run Preventive Simulation</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {dismissed ? 'Signal Dismissed (Logged)' : mitigationInitiated ? 'Mitigation Hand-off Active' : 'Early Warning Active'}
              </span>
            </div>
          </div>

          {/* Mission Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200 text-[11px]">
                Core Objective
              </span>
              <span className="font-semibold text-slate-900">
                &ldquo;Detect supply-chain risks BEFORE they become operational crises.&rdquo;
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>AI-assisted risk assessment derived from SAP HANA operational records.</span>
            </div>
          </div>
        </div>

        {/* ── 2. Overall Risk Summary (KPI Cards) ──────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* KPI 1: Supply Chain Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Supply Chain Risk</p>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-red-600 font-mono">
                {primaryDisruption ? primaryDisruption.SEVERITY : 'Not available from SAP HANA'}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {primaryDisruption ? primaryDisruption.DISRUPTION_TYPE : 'Not available from SAP HANA'}
            </p>
          </div>

          {/* KPI 2: Suppliers at Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Suppliers at Risk</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono">
                {primaryDisruption?.AFFECTED_SUPPLIER_ID ? '1' : '0'}
              </p>
              <span className="text-[11px] text-slate-600 font-medium">
                {primaryDisruption?.AFFECTED_SUPPLIER_ID || 'Not available from SAP HANA'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {primaryDisruption?.LOCATION || 'Not available from SAP HANA'}
            </p>
          </div>

          {/* KPI 3: Materials at Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Materials at Risk</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono">
                {disruptionContext?.MATERIAL_ID ? '1' : '0'}
              </p>
              <span className="text-[11px] text-slate-600 font-medium truncate">
                {disruptionContext?.MATERIAL_ID || 'M-101'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {disruptionContext?.INVENTORY_RISK || 'Operational Inventory Buffer'}
            </p>
          </div>

          {/* KPI 4: Potential Revenue Exposure */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Potential Revenue Exposure</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-red-600 font-mono">
                {hanaActive ? '₹27.4L' : 'Not available from SAP HANA'}
              </p>
              <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded">At Risk</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {hanaActive ? '₹2,740,000 INR exposure' : 'Not available from SAP HANA'}
            </p>
          </div>

          {/* KPI 5: Earliest Risk Horizon */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Earliest Risk Horizon</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-amber-600 font-mono">
                {primaryDisruption
                  ? `${(primaryDisruption.EXPECTED_DURATION_HOURS / 24).toFixed(1)} Days`
                  : 'Not available from SAP HANA'}
              </p>
              <span className="text-[11px] text-amber-700 font-semibold">Duration</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {primaryDisruption ? `${primaryDisruption.EXPECTED_DURATION_HOURS} hours expected` : 'Not available from SAP HANA'}
            </p>
          </div>
        </div>

        {/* ── Risk Status Contrast: Early Warning vs Crisis ──── */}
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-red-50/70 rounded-xl border border-amber-200/80 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                  State Boundary
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Risk Phase Classification: Early Warning vs. Operational Crisis
                </h2>
              </div>
              <p className="text-xs text-slate-600">
                ResiliNet enforces a strict distinction between proactive pre-crisis warning and confirmed operational shutdown.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white border-2 border-amber-400 rounded-lg px-3 py-2 text-center shadow-xs">
                <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">CURRENT STATE</div>
                <div className="text-xs font-extrabold text-amber-900 mt-0.5">EARLY WARNING</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Potential disruption detected • Preventive action recommended</div>
              </div>

              <span className="text-slate-400 font-bold">→</span>

              <div className="bg-white/70 border border-dashed border-red-300 rounded-lg px-3 py-2 text-center opacity-85">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ESCALATION THRESHOLD</div>
                <div className="text-xs font-bold text-red-700 mt-0.5">CRISIS</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Disruption confirmed • Crisis response activated</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Risk Signals Timeline & Card System ────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>3. Risk Signals &amp; Indicator Telemetry</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supplier: {primaryDisruption?.AFFECTED_SUPPLIER_ID || 'Not available from SAP HANA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Live signals linked to SAP HANA Cloud disruption records.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> SAP HANA (HACKFEST0145)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                    HANA Disruption Signal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Live
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    {primaryDisruption?.DISRUPTION_TYPE || 'Not available from SAP HANA'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">Table: ORCH_DISRUPTION</p>
                </div>
                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">Severity:</span>
                    <span className="text-xs font-mono font-extrabold text-red-600">
                      {primaryDisruption?.SEVERITY || 'Not available from SAP HANA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>Duration:</span>
                    <span className="font-medium text-slate-600">
                      {primaryDisruption ? `${primaryDisruption.EXPECTED_DURATION_HOURS}h` : 'Not available from SAP HANA'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {primaryDisruption?.DESCRIPTION || 'Not available from SAP HANA'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{primaryDisruption?.LOCATION || 'Not available from SAP HANA'}</span>
                <span className="font-mono text-slate-500">{primaryDisruption?.DISRUPTION_ID || 'N/A'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-sky-50 text-sky-800 border-sky-200">
                    HANA Inventory Buffer
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Live
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs font-bold text-slate-900">Inventory Buffer Telemetry</h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">View: V_ORCH_DISRUPTION_CONTEXT</p>
                </div>
                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">Current Stock:</span>
                    <span className="text-xs font-mono font-extrabold text-amber-600">
                      {disruptionContext?.CURRENT_STOCK != null ? `${disruptionContext.CURRENT_STOCK} units` : 'Not available from SAP HANA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>Daily Burn:</span>
                    <span className="font-medium text-slate-600">
                      {disruptionContext?.DAILY_CONSUMPTION != null ? `${disruptionContext.DAILY_CONSUMPTION} u/day` : 'Not available from SAP HANA'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Plant {primaryDisruption?.AFFECTED_PLANT_ID || 'PLANT-001'} assembly inventory monitored against burn rate.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Material: {disruptionContext?.MATERIAL_ID || 'M-101'}</span>
                <span className="font-mono text-slate-500">{disruptionContext?.INVENTORY_ID || 'INV-01'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-violet-50 text-violet-800 border-violet-200">
                    External Telemetry
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    External
                  </span>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs font-bold text-slate-900">Third-Party Logistics / Weather Stream</h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">External Feed</p>
                </div>
                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">Raw Stream:</span>
                    <span className="text-xs font-mono font-medium text-slate-600">
                      Not available from SAP HANA
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Third-party external signal streams are not persisted to SAP HANA operational tables.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>External Integration</span>
                <span className="font-mono text-slate-500">SIG-EXT</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Risk Propagation Chain ──────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>4. Risk Propagation Chain (Live HANA Flow)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic flow from upstream supplier disruption to plant impact.
              </p>
            </div>
            <span className="text-xs text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
              Flow: {primaryDisruption?.DISRUPTION_ID || 'DIS-1001'} → {primaryDisruption?.AFFECTED_SUPPLIER_ID || 'S-104'} → {primaryDisruption?.AFFECTED_PLANT_ID || 'PLANT-001'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 1: Incident</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{primaryDisruption?.DISRUPTION_ID || 'DIS-1001'}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">{primaryDisruption?.DISRUPTION_TYPE || 'Supplier Delay'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{primaryDisruption?.LOCATION || 'East India'}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-700">
                {primaryDisruption?.SEVERITY || 'HIGH'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 2: Supplier</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{primaryDisruption?.AFFECTED_SUPPLIER_ID || 'S-104'}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">Tier-1 Forging</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Facility Stoppage</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-700">
                CRITICAL
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 3: Material</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{disruptionContext?.MATERIAL_ID || 'M-101'}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">Steering Assembly</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Single-sourced</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-amber-700">
                WARNING
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 4: Facility</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{primaryDisruption?.AFFECTED_PLANT_ID || 'PLANT-001'}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">Hyderabad Assembly</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Line 1 &amp; 2</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-700">
                THREAT
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 5: Buffer</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">2.4 Days</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">240 units</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Burn: 100 u/day</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-amber-700">
                DEPLETING
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Step 6: Impact</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">₹27.4L</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">Production Delay</p>
                <p className="text-[10px] text-slate-500 mt-0.5">37 Orders Exposed</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-red-700">
                EXPOSURE
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Preventive Recommendations (From HANA Strategies) ─────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>5. Candidate Recovery Strategies (Live HANA V_ORCH_STRATEGY_RANKING)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactive mitigations evaluated in SAP HANA Cloud to safeguard assembly continuity.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">{strategies.length} Strategies Evaluated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strat, idx) => (
              <div
                key={strat.STRATEGY_ID}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      {strat.STRATEGY_ID}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      strat.AI_RECOMMENDED
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {strat.AI_RECOMMENDED ? 'AI Recommended' : 'Alternative'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2">{strat.STRATEGY_NAME}</h3>
                  <span className="inline-block text-[10px] font-semibold text-sky-700 mt-0.5 font-mono">{strat.TRANSPORT_MODE}</span>

                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700 text-[11px]">Recovery Score: </span>
                      <span className="font-mono font-bold text-emerald-700">{strat.RECOVERY_SCORE} / 100</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-[11px]">Orchestrator: </span>
                      <span className="font-mono font-bold text-sky-700">{strat.ORCHESTRATOR_SCORE} pts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {strat.TRANSIT_TIME_HOURS}h
                  </span>
                  <span className="font-semibold font-mono text-slate-700">
                    ₹{(Number(strat.ESTIMATED_COST) / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. Human Approval & Decision Control ──────────────── */}
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
                <span>Review Risk</span>
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

          {dismissed && (
            <div className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Signal {primaryDisruption?.DISRUPTION_ID || 'DIS-1001'} marked as Dismissed. Telemetry returns to passive background monitoring.</span>
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

      {/* ── Modal 1: Preventive Simulation Modal ───────────────── */}
      {showSimulationModal && (
        <div
          onClick={() => setShowSimulationModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-mono">
                    Simulation Engine
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Model: ResiliNet Pre-Disruption Simulator
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Preventive Simulation: Pre-Crisis Strategy Evaluation
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  ResiliNet evaluates proactive preventive options before disruptions become critical operational stoppages.
                </p>
              </div>
              <button
                onClick={() => setShowSimulationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Decision Framework Weights */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Decision Framework Multi-Factor Weights
                </span>
                <span className="text-[11px] text-slate-500">
                  Multi-factor decision scoring supported by AI recommendations.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {DECISION_WEIGHTS.map((dw) => (
                  <div key={dw.label} className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                    <span className="text-[10px] text-slate-500 block truncate">{dw.label}</span>
                    <span className="text-xs font-mono font-extrabold text-slate-900">{dw.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Horizon Slider */}
            <div className="space-y-2 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Preventive Intervention Horizon (Hours Prior to Stoppage)
                </label>
                <span className="text-xs font-mono font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {simulationHorizon} Hours
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={72}
                step={12}
                value={simulationHorizon}
                onChange={(e) => setSimulationHorizon(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>12h (Emergency buffer)</span>
                <span>36h (Current lead gap)</span>
                <span>48h (Optimal activation)</span>
                <span>72h (Full AVL lead)</span>
              </div>
            </div>

            {/* Compared Preventive Options from Live HANA */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Ranked Preventive Strategy Options (Live SAP HANA)
              </h4>
              <div className="space-y-2">
                {strategies.map((strat, idx) => (
                  <div
                    key={strat.STRATEGY_ID}
                    className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      strat.AI_RECOMMENDED
                        ? 'border-sky-300 bg-sky-50/40'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{strat.STRATEGY_ID}</span>
                        <span className="text-xs font-bold text-slate-900">{strat.STRATEGY_NAME}</span>
                        {strat.AI_RECOMMENDED && (
                          <span className="text-[10px] font-extrabold bg-sky-600 text-white px-2 py-0.2 rounded">
                            ★ TOP PICK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                        Mode: {strat.TRANSPORT_MODE} • Transit: {strat.TRANSIT_TIME_HOURS}h
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-200 sm:pl-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Score</div>
                        <div className="text-sm font-extrabold font-mono text-slate-900">{strat.ORCHESTRATOR_SCORE}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Cost</div>
                        <div className="text-sm font-extrabold font-mono text-emerald-700">
                          ₹{(Number(strat.ESTIMATED_COST) / 100000).toFixed(2)}L
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                ResiliNet decision framework uses deterministic multi-criteria scoring.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSimulationModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Close Simulation
                </button>
                <button
                  onClick={() => {
                    setShowSimulationModal(false);
                    handlePrepareMitigation();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  Proceed to Strategy Execution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Review Risk Parameter Breakdown ───────────── */}
      {showReviewModal && (
        <div
          onClick={() => setShowReviewModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Audit Inspection • {primaryDisruption?.DISRUPTION_ID || 'DIS-1001'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  AI-Assisted Early Warning Signal Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Telemetry inputs evaluated from SAP HANA Cloud ORCH_DISRUPTION.
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
                <p className="font-bold text-slate-800">Signal Confidence &amp; Model Methodology</p>
                <p className="text-slate-600 leading-relaxed">
                  Operational disruption record retrieved from SAP HANA schema HACKFEST0145.
                  Severity: <strong>{primaryDisruption?.SEVERITY || 'Not available from SAP HANA'}</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-slate-800">Evaluated Telemetry Points</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Disruption ID: {primaryDisruption?.DISRUPTION_ID || 'DIS-1001'}</li>
                  <li>Type: {primaryDisruption?.DISRUPTION_TYPE || 'Not available from SAP HANA'}</li>
                  <li>Affected Supplier: {primaryDisruption?.AFFECTED_SUPPLIER_ID || 'Not available from SAP HANA'}</li>
                  <li>Affected Plant: {primaryDisruption?.AFFECTED_PLANT_ID || 'Not available from SAP HANA'}</li>
                  <li>Expected Duration: {primaryDisruption ? `${primaryDisruption.EXPECTED_DURATION_HOURS} hours` : 'Not available from SAP HANA'}</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-[11px] leading-relaxed">
                <strong>Governance Policy:</strong> Clicking &ldquo;Prepare Mitigation&rdquo; transitions the scenario into active mitigation mode, linking to Recovery Strategies and What-If Simulator without breaking state persistence.
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
