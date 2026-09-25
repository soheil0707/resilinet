'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import {
  Scale,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Database,
  Truck,
  Users,
  ShoppingCart,
  IndianRupee,
  Clock,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  Info,
  Server,
  TrendingUp,
} from 'lucide-react';

// ─── Canonical Strategy Reference Data ───────────────────────────────────────

interface CanonicalStrategy {
  id: string;
  name: string;
  strategy_type: 'COMBINED' | 'EXPEDITED_LOGISTICS' | 'ALTERNATE_SOURCING' | 'STOCK_TRANSFER';
  transport_mode: string;
  cost_inr: number;
  costFormatted: string;
  transit_hours: number;
  recovery_time_days: number;
  recovery_score: number;
  orchestrator_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  is_recommended: boolean;
  revenue_protected_inr: number;
  description: string;
}

const AI_RECOMMENDED_BASELINE: CanonicalStrategy = {
  id: 'STR-001',
  name: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
  strategy_type: 'COMBINED',
  transport_mode: 'MULTI-MODAL + AIR',
  cost_inr: 185000,
  costFormatted: '₹1.85L',
  transit_hours: 18,
  recovery_time_days: 1,
  recovery_score: 94.0,
  orchestrator_score: 82.30,
  risk_level: 'LOW',
  is_recommended: true,
  revenue_protected_inr: 2420000,
  description: 'Multi-modal transit via road express + priority air dispatch buffer. 18 hours transit time.',
};

const CANONICAL_STRATEGIES: CanonicalStrategy[] = [
  AI_RECOMMENDED_BASELINE,
  {
    id: 'STR-002',
    name: 'Priority Air Freight',
    strategy_type: 'EXPEDITED_LOGISTICS',
    transport_mode: 'AIR',
    cost_inr: 240000,
    costFormatted: '₹2.40L',
    transit_hours: 12,
    recovery_time_days: 1,
    recovery_score: 91.0,
    orchestrator_score: 78.50,
    risk_level: 'LOW',
    is_recommended: false,
    revenue_protected_inr: 2200000,
    description: 'Dedicated charter air freight from S-104 finished inventory buffer directly to Hyderabad.',
  },
  {
    id: 'STR-003',
    name: 'Alternative Supplier',
    strategy_type: 'ALTERNATE_SOURCING',
    transport_mode: 'ROAD + AIR',
    cost_inr: 165000,
    costFormatted: '₹1.65L',
    transit_hours: 30,
    recovery_time_days: 2,
    recovery_score: 86.0,
    orchestrator_score: 74.20,
    risk_level: 'MEDIUM',
    is_recommended: false,
    revenue_protected_inr: 1950000,
    description: 'Emergency batch allocation from secondary qualified vendor Bharat Precision (Pune) via road & regional air.',
  },
  {
    id: 'STR-004',
    name: 'Regional Inventory Transfer',
    strategy_type: 'STOCK_TRANSFER',
    transport_mode: 'ROAD',
    cost_inr: 95000,
    costFormatted: '₹0.95L',
    transit_hours: 36,
    recovery_time_days: 2,
    recovery_score: 78.0,
    orchestrator_score: 68.40,
    risk_level: 'MEDIUM',
    is_recommended: false,
    revenue_protected_inr: 2100000,
    description: 'Issue Stock Transport Order (STO) from PL-02 Chennai to PL-01 Hyderabad via express highway freight.',
  },
  {
    id: 'STR-005',
    name: 'Alternate Plant Production',
    strategy_type: 'STOCK_TRANSFER',
    transport_mode: 'ROAD + SEA',
    cost_inr: 130000,
    costFormatted: '₹1.30L',
    transit_hours: 72,
    recovery_time_days: 3,
    recovery_score: 70.0,
    orchestrator_score: 60.10,
    risk_level: 'HIGH',
    is_recommended: false,
    revenue_protected_inr: 1600000,
    description: 'Shift assembly load to secondary coastal plant with combined multimodal road and maritime transit.',
  },
];

// Multi-Agent Consensus Evidence Chain
const AGENT_EVIDENCE = [
  {
    agent: 'Procurement Agent',
    icon: ShoppingCart,
    position: 'Alternate Supplier Surcharge Review',
    finding: 'Lowest purchase surcharge at ₹1.2L via Bharat Precision (Pune). Tier-2 qualified supplier on approved vendor list.',
    constraint: 'Road transit alone requires 7 days, which exceeds the critical 2.4-day plant inventory threshold.',
  },
  {
    agent: 'Logistics Agent',
    icon: Truck,
    position: 'Priority Air Buffer Analysis',
    finding: 'Charter air dispatch from Jamshedpur delivers 100 units in 18 hours. Only transit mode beating the line stoppage clock.',
    constraint: 'Air freight alone incurs ₹2.40L and cannot supply all 220 required units without secondary transfer.',
  },
  {
    agent: 'Customer Impact Agent',
    icon: Users,
    position: 'OEM SLA Protection Mandate',
    finding: '8 Tier-1 OEM customer contracts carry penalty clauses commencing within 72 hours. Total exposure is ₹27.4L.',
    constraint: 'Strategies taking longer than 48 hours risk triggering customer liquidated damages.',
  },
];

function formatCurrencyDelta(delta: number): string {
  if (delta === 0) return '₹0';
  const prefix = delta > 0 ? '+₹' : '-₹';
  const abs = Math.abs(delta);
  if (abs >= 100000) {
    return `${prefix}${(abs / 100000).toFixed(2)}L`;
  }
  return `${prefix}${abs.toLocaleString('en-IN')}`;
}

// ─── Main Conflict Resolution Workspace ───────────────────────────────────────

function ConflictResolutionInner() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams?.get('disruptionId') || 'DIS-1001';

  const { selectedStrategy, isOverride } = useWorkflow();

  // Local acknowledgement state for human override review
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);

  const [aiDecisionRecord, setAiDecisionRecord] = useState<any | null>(null);
  const [liveStrategies, setLiveStrategies] = useState<CanonicalStrategy[]>(CANONICAL_STRATEGIES);
  const [hanaActive, setHanaActive] = useState(false);
  const [hanaError, setHanaError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch AI Decision and Recovery Strategies from SAP HANA Cloud
  React.useEffect(() => {
    const fetchHanaData = async () => {
      setIsLoading(true);
      setHanaError(null);
      try {
        const [decisionRes, stratRes] = await Promise.all([
          fetch(`/api/hana/ai-decisions?disruptionId=${disruptionId}`),
          fetch('/api/hana/recovery-strategies'),
        ]);

        let hasHana = false;

        if (decisionRes.ok) {
          const decJson = await decisionRes.json();
          if (decJson.success && Array.isArray(decJson.data) && decJson.data.length > 0) {
            setAiDecisionRecord(decJson.data[0]);
            hasHana = true;
          }
        }

        if (stratRes.ok) {
          const stratJson = await stratRes.json();
          if (stratJson.success && Array.isArray(stratJson.strategies) && stratJson.strategies.length > 0) {
            const mapped: CanonicalStrategy[] = stratJson.strategies.map((s: any) => ({
              id: s.STRATEGY_ID,
              name: s.STRATEGY_NAME,
              strategy_type: s.STRATEGY_ID === 'STR-001' ? 'COMBINED' : s.TRANSPORT_MODE.includes('AIR') ? 'EXPEDITED_LOGISTICS' : 'STOCK_TRANSFER',
              transport_mode: s.TRANSPORT_MODE,
              cost_inr: Number(s.ESTIMATED_COST) || 185000,
              costFormatted: `₹${(Number(s.ESTIMATED_COST) / 100000).toFixed(2)}L`,
              transit_hours: s.TRANSIT_TIME_HOURS || 18,
              recovery_time_days: Math.ceil((s.TRANSIT_TIME_HOURS || 24) / 24),
              recovery_score: Number(s.RECOVERY_SCORE) || 90,
              orchestrator_score: Number(s.ORCHESTRATOR_SCORE) || 80,
              risk_level: s.RISK_LEVEL === 'LOW' ? 'LOW' : s.RISK_LEVEL === 'HIGH' ? 'HIGH' : 'MEDIUM',
              is_recommended: Boolean(s.AI_RECOMMENDED || s.STRATEGY_ID === 'STR-001'),
              revenue_protected_inr: 2420000,
              description: s.DESCRIPTION || s.AI_REASON || 'SAP HANA operational strategy record.',
            }));
            setLiveStrategies(mapped);
            hasHana = true;
          }
        }

        if (!hasHana) {
          setHanaError('SAP HANA Cloud operational service unavailable');
        }
        setHanaActive(hasHana);
      } catch (err) {
        console.error('Failed to load HANA AI decision & strategies:', err);
        setHanaActive(false);
        setHanaError('SAP HANA Cloud operational service unavailable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHanaData();
  }, [disruptionId]);

  // AI Recommendation dynamically sourced from HANA V_ORCH_AI_DECISION
  const aiRecommendation: CanonicalStrategy = useMemo(() => {
    if (aiDecisionRecord) {
      return {
        id: aiDecisionRecord.STRATEGY_ID || 'STR-001',
        name: aiDecisionRecord.STRATEGY_NAME || 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
        strategy_type: 'COMBINED',
        transport_mode: aiDecisionRecord.TRANSPORT_MODE || 'MULTI-MODAL + AIR',
        cost_inr: Number(aiDecisionRecord.ESTIMATED_COST) || 185000,
        costFormatted: `₹${(Number(aiDecisionRecord.ESTIMATED_COST) / 100000).toFixed(2)}L`,
        transit_hours: aiDecisionRecord.TRANSIT_TIME_HOURS || 18,
        recovery_time_days: Math.ceil((aiDecisionRecord.TRANSIT_TIME_HOURS || 24) / 24),
        recovery_score: Number(aiDecisionRecord.RECOVERY_SCORE) || 94.0,
        orchestrator_score: Number(aiDecisionRecord.ORCHESTRATOR_SCORE) || 82.30,
        risk_level: aiDecisionRecord.RISK_LEVEL === 'LOW' ? 'LOW' : aiDecisionRecord.RISK_LEVEL === 'HIGH' ? 'HIGH' : 'MEDIUM',
        is_recommended: true,
        revenue_protected_inr: 2420000,
        description: aiDecisionRecord.AI_REASON || 'SAP HANA consensus recommended recovery strategy.',
      };
    }
    const found = liveStrategies.find((s) => s.is_recommended || s.id === 'STR-001');
    return found || AI_RECOMMENDED_BASELINE;
  }, [aiDecisionRecord, liveStrategies]);

  // Resolve Human Selected Strategy from workflow context or live strategies
  const humanStrategy: CanonicalStrategy | null = useMemo(() => {
    if (!selectedStrategy) {
      return null;
    }
    const match = liveStrategies.find((s) => s.id === selectedStrategy.id);
    if (match) return match;

    // Fallback normalization if loaded from legacy or custom object
    return {
      id: selectedStrategy.id,
      name: selectedStrategy.name,
      strategy_type: (selectedStrategy.strategy_type as any) || 'COMBINED',
      transport_mode: selectedStrategy.id === 'STR-002' ? 'AIR' : selectedStrategy.id === 'STR-003' ? 'ROAD + AIR' : 'MULTI-MODAL',
      cost_inr: selectedStrategy.cost_inr,
      costFormatted: `₹${(selectedStrategy.cost_inr / 100000).toFixed(2)}L`,
      transit_hours: selectedStrategy.recovery_time_days * 24,
      recovery_time_days: selectedStrategy.recovery_time_days,
      recovery_score: selectedStrategy.overall_score,
      orchestrator_score: selectedStrategy.overall_score * 0.88,
      risk_level: (selectedStrategy.risk_level as any) || 'LOW',
      is_recommended: selectedStrategy.is_recommended || false,
      revenue_protected_inr: selectedStrategy.revenue_protected_inr || 2000000,
      description: selectedStrategy.description || '',
    };
  }, [selectedStrategy, liveStrategies]);

  // Determine Conflict State
  const hasOverride = isOverride || (humanStrategy !== null && humanStrategy.id !== aiRecommendation.id);
  const isAligned = humanStrategy !== null && humanStrategy.id === aiRecommendation.id;
  const isAwaiting = humanStrategy === null;

  // Calculated Deltas
  const activeHuman = humanStrategy || aiRecommendation;
  const costDelta = activeHuman.cost_inr - aiRecommendation.cost_inr;
  const transitDelta = activeHuman.transit_hours - aiRecommendation.transit_hours;
  const scoreDelta = Math.round((activeHuman.recovery_score - aiRecommendation.recovery_score) * 10) / 10;
  const orchDelta = Math.round((activeHuman.orchestrator_score - aiRecommendation.orchestrator_score) * 100) / 100;

  // Semantic badge helper
  const getRiskBadge = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (risk === 'LOW') {
      return <Badge variant="healthy" className="font-mono text-xs">LOW RISK</Badge>;
    }
    if (risk === 'MEDIUM') {
      return <Badge variant="warning" className="font-mono text-xs">MEDIUM RISK</Badge>;
    }
    return <Badge variant="critical" className="font-mono text-xs">HIGH RISK</Badge>;
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
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-950">
                SAP HANA Cloud operational service unavailable
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                AI consensus baseline requires SAP HANA Cloud view V_ORCH_AI_DECISION and strategy rankings from V_ORCH_STRATEGY_RANKING.
              </p>
            </div>
          </section>
        )}

        {/* ── 1. Enterprise Page Header ────────────────────────────────────── */}
        <PageHeader
          title="CONFLICT RESOLUTION"
          description="Review strategy divergence, operational evidence, and human decision rationale."
          badge={
            <div className="flex items-center gap-2">
              <LiveDataBadge isLive={hanaActive} />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Scale className="w-3 h-3 text-slate-500" />
                GOVERNANCE REVIEW
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/recovery-strategies?disruptionId=${disruptionId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  View Recovery Strategies
                </Button>
              </Link>
              <Link href="/ai-command-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  AI Command Center
                </Button>
              </Link>
              <Link href="/approval-center">
                <Button
                  size="sm"
                  disabled={hasOverride && !isAcknowledged}
                  className="text-xs flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Continue to Approval
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          }
        />

        {/* ── 2. Decision Lifecycle ────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>MONITOR</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>ANALYZE</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>DECIDE</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>CONFLICT REVIEW — CURRENT</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">5</span>
              <span>APPROVE</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">6</span>
              <span>EXECUTE</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pl-1">
            Governance audit stage: reviews any variance between AI recommendation and human operational choices prior to authorization.
          </p>
        </div>

        {/* ── 3. Crisis Context & Live Incident ────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-900">Live Disruption Anchor:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
              {disruptionId}
            </span>
            <span className="text-slate-700">Supplier Delay</span>
            <Badge variant="critical" className="font-bold text-[10px] py-0 px-2">HIGH</Badge>
            <span className="text-slate-500">Location: <strong className="text-slate-700">East India</strong></span>
            <span className="text-slate-500">Plant: <strong className="text-slate-700">PLANT-001 (Hyderabad)</strong></span>
            <span className="text-slate-500">Duration: <strong className="text-slate-700">48h</strong></span>
            <Badge variant="warning" className="font-bold text-[10px] py-0 px-2">STATUS: ACTIVE</Badge>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Operational Execution: <strong className="font-mono text-slate-700">EXE-1001 (IN_PROGRESS)</strong></span>
          </div>
        </div>

        {/* ── 4. Conflict Status Banner ────────────────────────────────────── */}
        {hasOverride ? (
          <div className="p-4 rounded-lg bg-amber-50/70 border-2 border-amber-300 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                    HUMAN OVERRIDE DETECTED
                  </h3>
                  <Badge variant="warning" className="text-[10px] font-bold py-0">GOVERNANCE AUDIT REQUIRED</Badge>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  The human decision maker selected strategy <strong className="font-mono font-bold text-amber-950">{humanStrategy?.id} ({humanStrategy?.name})</strong>, which diverges from the AI-recommended strategy <strong className="font-mono font-bold text-amber-950">{aiRecommendation.id} ({aiRecommendation.name})</strong>. Review the trade-off evidence below before proceeding to approval.
                </p>
                <div className="flex items-center gap-4 text-xs pt-1 text-amber-900 font-mono">
                  <span>AI Recommendation: <strong>{aiRecommendation.id}</strong> (Score {aiRecommendation.recovery_score})</span>
                  <span>·</span>
                  <span>Human Selection: <strong>{humanStrategy?.id}</strong> (Score {humanStrategy?.recovery_score})</span>
                </div>
              </div>
            </div>
          </div>
        ) : isAligned ? (
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                    NO STRATEGY CONFLICT
                  </h3>
                  <Badge variant="healthy" className="text-[10px] font-bold py-0">ALIGNED</Badge>
                </div>
                <p className="text-xs text-emerald-900">
                  The AI recommendation and the human workflow selection are fully aligned on <strong className="font-mono">{aiRecommendation.id} ({aiRecommendation.name})</strong>. No governance divergence exists.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Awaiting formal human selection. Baseline AI recommendation is primed for review.</span>
            </div>
            <Link href={`/recovery-strategies?disruptionId=${disruptionId}`}>
              <Button size="sm" variant="outline" className="text-xs font-semibold cursor-pointer">
                Select Strategy
              </Button>
            </Link>
          </div>
        )}

        {/* ── 5 & 6. Side-by-Side: AI Recommendation vs Human Selection ────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* AI Recommendation Card */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-emerald-50/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    AI RECOMMENDATION
                  </CardTitle>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI RECOMMENDED
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800">{aiRecommendation.id}</span>
                <h4 className="text-sm font-bold text-slate-900">{aiRecommendation.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{aiRecommendation.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-100">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Recovery Score</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">{aiRecommendation.recovery_score}</span>
                  <span className="text-[10px] text-slate-500 block">Orch: {aiRecommendation.orchestrator_score.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Estimated Cost</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{aiRecommendation.costFormatted}</span>
                  <span className="text-[10px] text-slate-500 block">Total surcharge</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Transit Time</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{aiRecommendation.transit_hours}h</span>
                  <span className="text-[10px] text-slate-500 block">Lead time</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Risk Profile:</span>
                  {getRiskBadge(aiRecommendation.risk_level)}
                </div>
                <div className="text-slate-600">
                  Mode: <strong className="font-mono">{aiRecommendation.transport_mode}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Source: <strong>SAP HANA Cloud Decision Layer</strong></span>
                <span className="font-mono text-emerald-700 font-semibold">Rank #1 Consensus</span>
              </div>
            </CardContent>
          </Card>

          {/* Human Selection Card */}
          <Card className={`border-slate-200 bg-white shadow-2xs ${hasOverride ? 'border-amber-300' : ''}`}>
            <CardHeader className={`pb-3 border-b border-slate-100 ${hasOverride ? 'bg-amber-50/50' : 'bg-slate-50/70'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    HUMAN SELECTION
                  </CardTitle>
                </div>
                {hasOverride ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    HUMAN OVERRIDE
                  </span>
                ) : isAligned ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ALIGNED WITH AI
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    AWAITING DECISION
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {activeHuman ? (
                <>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800">{activeHuman.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{activeHuman.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{activeHuman.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-100">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Recovery Score</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{activeHuman.recovery_score}</span>
                      <span className="text-[10px] text-slate-500 block">Orch: {activeHuman.orchestrator_score.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Estimated Cost</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{activeHuman.costFormatted}</span>
                      <span className="text-[10px] text-slate-500 block">Total surcharge</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Transit Time</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{activeHuman.transit_hours}h</span>
                      <span className="text-[10px] text-slate-500 block">Lead time</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Risk Profile:</span>
                      {getRiskBadge(activeHuman.risk_level)}
                    </div>
                    <div className="text-slate-600">
                      Mode: <strong className="font-mono">{activeHuman.transport_mode}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Source: <strong>Local Workflow State</strong></span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {hasOverride ? 'Alternative SCM Choice' : 'Baseline Selected'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No strategy has been selected by human operator yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Defaulting comparison against AI recommendation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 7. Side-by-Side Delta Comparison Table ───────────────────────── */}
        <Card className="border-slate-200 bg-white overflow-hidden shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                DECISION DIVERGENCE & FACTUAL DELTAS
              </CardTitle>
              <div className="text-xs text-slate-500">
                Mathematical comparison: Human Selection vs AI Baseline
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px]">Decision Dimension</th>
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px] bg-emerald-50/40">
                      AI Recommendation ({aiRecommendation.id})
                    </th>
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px] bg-slate-100/50">
                      Human Selection ({activeHuman.id})
                    </th>
                    <th className="text-right p-3.5 font-bold uppercase tracking-wider text-[11px]">Factual Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Recovery Score</td>
                    <td className="p-3.5 bg-emerald-50/20 font-mono font-bold text-emerald-700">{aiRecommendation.recovery_score}</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-900">{activeHuman.recovery_score}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      scoreDelta > 0 ? 'text-emerald-700' : scoreDelta < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta === 0 ? '0.0' : scoreDelta}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Orchestrator Score</td>
                    <td className="p-3.5 bg-emerald-50/20 font-mono font-bold text-slate-800">{aiRecommendation.orchestrator_score.toFixed(2)}</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-800">{activeHuman.orchestrator_score.toFixed(2)}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      orchDelta > 0 ? 'text-emerald-700' : orchDelta < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {orchDelta > 0 ? `+${orchDelta.toFixed(2)}` : orchDelta === 0 ? '0.00' : orchDelta.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Estimated Cost</td>
                    <td className="p-3.5 bg-emerald-50/20 font-mono font-bold text-slate-900">{aiRecommendation.costFormatted}</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-900">{activeHuman.costFormatted}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      costDelta < 0 ? 'text-emerald-700' : costDelta > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {formatCurrencyDelta(costDelta)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Transit Duration</td>
                    <td className="p-3.5 bg-emerald-50/20 font-mono font-bold text-slate-900">{aiRecommendation.transit_hours}h</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-900">{activeHuman.transit_hours}h</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      transitDelta < 0 ? 'text-emerald-700' : transitDelta > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {transitDelta > 0 ? `+${transitDelta}h` : transitDelta === 0 ? '0h' : `${transitDelta}h`}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Operational Risk</td>
                    <td className="p-3.5 bg-emerald-50/20">
                      <Badge variant="healthy" className="font-mono text-xs">LOW</Badge>
                    </td>
                    <td className="p-3.5 bg-slate-50/30">
                      {getRiskBadge(activeHuman.risk_level)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600 font-semibold">
                      {activeHuman.risk_level === aiRecommendation.risk_level ? 'EQUAL' : 'VARIANCE'}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Transport Mode</td>
                    <td className="p-3.5 bg-emerald-50/20 font-mono text-slate-800">{aiRecommendation.transport_mode}</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono text-slate-800">{activeHuman.transport_mode}</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── 8 & 9. Evidence Analysis & Human Rationale ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI Decision Rationale from HANA */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Why AI Recommended STR-001
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block text-xs">1. Balanced Recovery Performance (94.0 Score)</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Combines 98/100 time score and 95/100 revenue protection score, delivering the highest multi-agent composite ranking.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block text-xs">2. Rapid 18-Hour Transit Lead Time</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Arrives well within the 48-hour disruption window and beats the 2.4-day inventory buffer clock at PLANT-001.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block text-xs">3. Redundant Dual-Channel Architecture</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    100 units via charter air freight buffer + 120 units via STO road express from Chennai ensures zero single-point transit failure.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block text-xs">4. High Return on Investment (12.1x)</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Total recovery outlay of ₹1.85L protects ₹24.2L in revenue at risk, preventing ₹12L in contractual Tier-1 customer penalties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Human Rationale & Multi-Agent Findings */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Human Decision Rationale & Agent Evidence
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              {/* Human Rationale Recording */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 text-xs block uppercase tracking-wider text-[10px]">
                  Recorded Human SCM Rationale
                </span>
                {hasOverride ? (
                  <p className="text-slate-600 italic">
                    Human rationale not recorded in workflow state. Supply Chain Manager override active.
                  </p>
                ) : (
                  <p className="text-slate-600">
                    Human selection is currently aligned with AI recommendation (STR-001).
                  </p>
                )}
              </div>

              {/* Multi-Agent Background Constraints */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  Multi-Agent Operational Evidence
                </span>
                {AGENT_EVIDENCE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.agent} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                        <span>{item.agent}</span>
                      </div>
                      <p className="text-slate-600">{item.finding}</p>
                      <p className="text-amber-800 font-medium text-[11px]">Constraint: {item.constraint}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 10. Neutral Conflict Dimensions ──────────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Neutral Operational Evidence Dimensions</h3>
          <p className="text-xs text-slate-500">
            Factual side-by-side assessment across the 6 core supply chain evaluation dimensions. No automated winner declared.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* Cost Dimension */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">1. COST DIMENSION</span>
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="font-mono text-slate-900">{aiRecommendation.costFormatted}</strong></p>
                <p className="text-slate-700">Human: <strong className="font-mono text-slate-900">{activeHuman.costFormatted}</strong></p>
                <p className="font-mono text-slate-500 text-[11px]">Variance: {formatCurrencyDelta(costDelta)}</p>
              </div>
            </div>

            {/* Transit Dimension */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">2. TRANSIT DIMENSION</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="font-mono text-slate-900">{aiRecommendation.transit_hours}h</strong></p>
                <p className="text-slate-700">Human: <strong className="font-mono text-slate-900">{activeHuman.transit_hours}h</strong></p>
                <p className="font-mono text-slate-500 text-[11px]">Variance: {transitDelta > 0 ? `+${transitDelta}h` : `${transitDelta}h`}</p>
              </div>
            </div>

            {/* Recovery Score Dimension */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">3. RECOVERY SCORE</span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="font-mono text-emerald-700">{aiRecommendation.recovery_score}</strong></p>
                <p className="text-slate-700">Human: <strong className="font-mono text-slate-900">{activeHuman.recovery_score}</strong></p>
                <p className="font-mono text-slate-500 text-[11px]">Variance: {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}</p>
              </div>
            </div>

            {/* Risk Dimension */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">4. OPERATIONAL RISK</span>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="text-emerald-700">LOW</strong></p>
                <p className="text-slate-700">Human: <strong>{activeHuman.risk_level}</strong></p>
                <p className="text-slate-500 text-[11px]">
                  {activeHuman.risk_level === 'LOW' ? 'Matched risk levels' : 'Risk level difference detected'}
                </p>
              </div>
            </div>

            {/* Operational Fit Dimension */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">5. OPERATIONAL FIT</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="font-mono text-slate-900">{aiRecommendation.transport_mode}</strong></p>
                <p className="text-slate-700">Human: <strong className="font-mono text-slate-900">{activeHuman.transport_mode}</strong></p>
                <p className="text-slate-500 text-[11px]">Dispatch protocol</p>
              </div>
            </div>

            {/* Customer SLA Impact */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">6. CUSTOMER IMPACT</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-700">AI: <strong className="text-emerald-700">0 OEM Penalties</strong></p>
                <p className="text-slate-700">
                  Human: <strong>{activeHuman.transit_hours <= 48 ? 'SLA Maintained' : 'SLA Breach Risk'}</strong>
                </p>
                <p className="text-slate-500 text-[11px]">Contract SLA target: ≤ 48 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 11 & 12. Governance Decision & Acknowledgement ───────────────── */}
        <Card className="border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-700" />
              <CardTitle className="text-sm font-bold text-slate-900">
                GOVERNANCE DECISION & ACKNOWLEDGEMENT
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs pb-3 border-b border-slate-100">
              <span className="text-slate-600">Current Governance Status:</span>
              {hasOverride && !isAcknowledged ? (
                <Badge variant="warning" className="font-bold text-xs py-0.5 px-2.5">
                  OVERRIDE UNDER REVIEW (ACKNOWLEDGEMENT PENDING)
                </Badge>
              ) : hasOverride && isAcknowledged ? (
                <Badge variant="healthy" className="font-bold text-xs py-0.5 px-2.5">
                  READY FOR APPROVAL (OVERRIDE ACKNOWLEDGED)
                </Badge>
              ) : (
                <Badge variant="healthy" className="font-bold text-xs py-0.5 px-2.5">
                  ALIGNED (READY FOR APPROVAL)
                </Badge>
              )}
            </div>

            {hasOverride ? (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2.5">
                <div
                  onClick={() => setIsAcknowledged(!isAcknowledged)}
                  className="flex items-start gap-2.5 cursor-pointer select-none"
                >
                  <div className="mt-0.5">
                    {isAcknowledged ? (
                      <CheckSquare className="w-4 h-4 text-amber-700" />
                    ) : (
                      <Square className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950">
                      I understand the difference between the AI recommendation ({aiRecommendation.id}) and my selected strategy ({humanStrategy?.id}).
                    </span>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      Acknowledging confirms that this variance has been reviewed against operational constraints before proceeding to formal sign-off.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                No override acknowledgement required. The human selection matches the AI recommendation. You may proceed directly to the Approval Center.
              </p>
            )}

            {/* ── 13. Approval Handoff Actions ── */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Authorized human sign-off takes place in the Approval Center.
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/recovery-strategies?disruptionId=${disruptionId}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold cursor-pointer">
                    Change Strategy Selection
                  </Button>
                </Link>
                <Link href="/approval-center">
                  <Button
                    size="sm"
                    disabled={hasOverride && !isAcknowledged}
                    className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue to Approval</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 14. Operational Execution Boundary ───────────────────────────── */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Operational Execution Boundary</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Conflict review does not approve a strategy. Approval does not complete recovery. Execution remains a separate operational stage managed under <strong className="font-mono text-slate-800">EXE-1001 (IN_PROGRESS)</strong>. No SAP HANA operational tables are mutated during this review.
          </p>
        </div>

        {/* ── 15. Data Source Transparency ─────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">Data Architecture & Source Transparency</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] flex-wrap">
              <span>
                <strong className="text-slate-700">AI RECOMMENDATION:</strong> SAP HANA Cloud (Live)
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-700">HUMAN SELECTION:</strong> Local Workflow State
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-700">EXECUTION:</strong> SAP HANA Cloud (EXE-1001, Read-Only)
              </span>
            </div>
          </div>
        </div>

      </div>
    </EnterpriseShell>
  );
}

export default function ConflictResolutionPage() {
  return (
    <Suspense
      fallback={
        <EnterpriseShell>
          <div className="p-8 text-center text-xs text-slate-500">
            Loading Conflict Resolution governance workspace...
          </div>
        </EnterpriseShell>
      }
    >
      <ConflictResolutionInner />
    </Suspense>
  );
}
