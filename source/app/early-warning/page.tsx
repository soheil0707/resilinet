'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { DEMO_EARLY_WARNING_RISK, EarlyWarningRisk, DEMO_RECOVERY_STRATEGIES } from '@/lib/data/demo-data';
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

export default function EarlyWarningPage() {
  const router = useRouter();
  const { setWorkflowState } = useWorkflow();
  const [riskData, setRiskData] = useState<EarlyWarningRisk>(DEMO_EARLY_WARNING_RISK);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationHorizon, setSimulationHorizon] = useState<number>(48); // hours
  const [dismissed, setDismissed] = useState(false);
  const [mitigationInitiated, setMitigationInitiated] = useState(false);

  const handlePrepareMitigation = () => {
    setMitigationInitiated(true);
    // Connect to existing workflow without breaking it
    setWorkflowState('CRISIS_ACTIVE');
    router.push('/recovery-strategies');
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
                    ID: {riskData.riskId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Detected: {riskData.detectedAt}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Early Warning Center
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Predict and prepare for supply-chain disruptions before they impact operations.
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
              <span>AI-assisted risk assessment derived from internal SAP inventory &amp; lead-time variance.</span>
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
              <p className="text-2xl font-black text-red-600 font-mono">HIGH</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tier-1 supplier volatility</p>
          </div>

          {/* KPI 2: Suppliers at Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Suppliers at Risk</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono">1</p>
              <span className="text-[11px] text-slate-600 font-medium">S-104 (Global Metals)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Jamshedpur Facility</p>
          </div>

          {/* KPI 3: Materials at Risk */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Materials at Risk</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 font-mono">1</p>
              <span className="text-[11px] text-slate-600 font-medium truncate">M-101 (Steering)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Chassis critical component</p>
          </div>

          {/* KPI 4: Potential Revenue Exposure */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Potential Revenue Exposure</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-red-600 font-mono">₹27.4L</p>
              <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded">At Risk</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">₹2,740,000 INR exposure</p>
          </div>

          {/* KPI 5: Earliest Risk Horizon */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Earliest Risk Horizon</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-black text-amber-600 font-mono">2.4 Days</p>
              <span className="text-[11px] text-amber-700 font-semibold">Stockout</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">240 units / 100 u daily burn</p>
          </div>
        </div>

        {/* ── 7. Risk Status Contrast: Early Warning vs Crisis ──── */}
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
                  <span>3. Risk Signals &amp; Indicator Timeline</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Supplier: S-104 Global Metals Ltd.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise and external signals monitored across the Astra Motors supply chain.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Enterprise Connected (SAP)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                <Radio className="w-3 h-3" /> Integration Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData.signals.map((sig) => (
              <div
                key={sig.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      sig.signalSource === 'Enterprise Signal'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}>
                      {sig.signalSource}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sig.sourceConnection === 'Connected'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {sig.sourceConnection}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h3 className="text-xs font-bold text-slate-900">{sig.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{sig.sourceSystem}</p>
                  </div>

                  <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Observed Value:</span>
                      <span className="text-xs font-mono font-extrabold text-red-600">{sig.value}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>Baseline:</span>
                      <span className="font-medium text-slate-600">{sig.baseline}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {sig.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{sig.timestamp}</span>
                  <span className="font-mono text-slate-500">{sig.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Risk Propagation (7-Stage Value Stream) ──────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>4. Risk Propagation Chain</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Linear propagation path from upstream supplier volatility to final customer revenue exposure.
              </p>
            </div>
            <span className="text-xs text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
              Scenario: S-104 → M-101 → PL-01 Hyderabad
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
            {riskData.propagationStages.map((stage, idx) => (
              <div
                key={stage.stageNumber}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between relative hover:bg-slate-50/80 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Step {stage.stageNumber}
                    </span>
                    {idx < riskData.propagationStages.length - 1 && (
                      <span className="hidden lg:inline text-slate-300 font-bold">→</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{stage.name}</h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">{stage.entity}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stage.detail}</p>
                </div>
                <div className={`mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold ${
                  stage.status === 'CRITICAL' ? 'text-red-700' :
                  stage.status === 'WARNING' ? 'text-amber-700' : 'text-slate-700'
                }`}>
                  {stage.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Preventive Recommendations (BEFORE Crisis) ─────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>5. Recommended Preventive Actions (Pre-Crisis Measures)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactive mitigations evaluated before confirmed shutdown to safeguard assembly continuity.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">6 Countermeasures Evaluated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData.preventiveRecommendations.map((rec, idx) => (
              <div
                key={rec.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      REC-0{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      rec.status === 'Recommended'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rec.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2">{rec.action}</h3>
                  <span className="inline-block text-[10px] font-semibold text-sky-700 mt-0.5">{rec.category}</span>

                  <div className="mt-2 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700 text-[11px]">Reason: </span>
                      <span>{rec.reason}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-[11px]">Expected Purpose: </span>
                      <span>{rec.expectedPurpose}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
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

        {/* ── 8. External Signal Intelligence Section ──────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600" />
                <span>8. External Intelligence (Third-Party Signal Connectors)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                External intelligence connectors can enrich ResiliNet risk detection with third-party signals.
              </p>
            </div>
            <Link
              href="/integration-hub"
              className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-bold"
            >
              <span>Manage in Integration Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskData.externalIntelligencePlaceholders.map((ext) => (
              <div
                key={ext.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{ext.category}</span>
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      {ext.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2">{ext.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ext.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Enriched Telemetry: </span>
                  <span>{ext.potentialSignals}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Note: External feeds are labeled &ldquo;Integration Ready&rdquo; in prototype mode. Synthetic events are ingested through the ResiliNet Normalization Schema without active third-party billing.
          </p>
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
                <span>Signal EW-2026-089 marked as Dismissed. Telemetry returns to passive background monitoring.</span>
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

            {/* Compared Preventive Options */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Ranked Preventive Strategy Options
              </h4>
              <div className="space-y-2">
                {DEMO_RECOVERY_STRATEGIES.map((strat, idx) => (
                  <div
                    key={strat.id}
                    className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      strat.is_recommended
                        ? 'border-sky-300 bg-sky-50/40'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-900">{strat.name}</span>
                        {strat.is_recommended && (
                          <span className="text-[10px] font-extrabold bg-sky-600 text-white px-2 py-0.2 rounded">
                            ★ TOP PICK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-xl">{strat.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-200 sm:pl-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Score</div>
                        <div className="text-sm font-extrabold font-mono text-slate-900">{strat.overall_score}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Protected</div>
                        <div className="text-sm font-extrabold font-mono text-emerald-700">
                          ₹{(strat.revenue_protected_inr / 100000).toFixed(1)}L
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
                <p className="font-bold text-slate-800">Signal Confidence &amp; Model Methodology</p>
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
