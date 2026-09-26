'use client';

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { AgentConsensusCard } from '@/components/enterprise/AgentConsensusCard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import type { HanaAIDecision, HanaStrategyRanking } from '@/lib/hana/repository';
import {
  Bot,
  ShoppingCart,
  Package,
  Factory,
  Truck,
  DollarSign,
  Users,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  Scale,
  ChevronDown,
  Database,
  ShieldCheck,
  Layers,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Cpu,
  ChevronRight,
  Shield,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

// ─── Domain Agent Definitions (Enterprise Grounded Data) ──────────────────────

interface DomainAgent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  themeColor: 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal';
  finding: string;
  recommendation: string;
  confidence: number;
  estimatedImpact: string;
  badge: string;
  vote: string;
  voteLabel: string;
  keyFindings: string[];
}

const AGENTS: DomainAgent[] = [
  {
    id: 'PROCUREMENT',
    name: 'Procurement Agent',
    role: 'Sourcing & AVL Qualification',
    icon: ShoppingCart,
    themeColor: 'sky',
    finding:
      'Secondary qualified vendor Bharat Precision (Pune) identified via SAP Approved Vendor List (AVL). Emergency batch of 220 units can be dispatched within 7 days at a 6.5% procurement surcharge (₹1.2L). Vendor quality certification confirmed.',
    recommendation:
      'Activate emergency purchase order with Bharat Precision (Pune) for 220 units at ₹18,500 + ₹1,200 per unit surcharge.',
    confidence: 87,
    estimatedImpact: '₹1.2L cost • 7-day lead time',
    badge: 'ALT VENDOR LOCATED',
    vote: 'ALTERNATE_SOURCING',
    voteLabel: 'Alternate Supplier',
    keyFindings: [
      'Bharat Precision (Pune): Tier-2 vendor, ISO 9001:2015 certified',
      'Emergency batch capacity: 220 units confirmed by Vendor Manager',
      'Surcharge: ₹1,200/unit (6.5%) — within local authority limit',
      'Transit: Road freight, Pune → Hyderabad (6 days transit)',
    ],
  },
  {
    id: 'INVENTORY',
    name: 'Inventory Agent',
    role: 'Stock Coverage & Allocation',
    icon: Package,
    themeColor: 'emerald',
    finding:
      'PL-02 Chennai holds 450 units of M-101 Steering Assembly with 5.6 days coverage above safety stock threshold. 180 units can be released for inter-plant transfer without endangering Chennai operations. SAP EWM STO can be issued immediately.',
    recommendation:
      'Issue Stock Transport Order (STO) from PL-02 Chennai to PL-01 Hyderabad for 180 units of M-101 Steering Assemblies.',
    confidence: 94,
    estimatedImpact: '₹0.8L cost • 4-day lead time',
    badge: '180 UNITS AVAILABLE',
    vote: 'STOCK_TRANSFER',
    voteLabel: 'Inventory Transfer',
    keyFindings: [
      'PL-02 Chennai: 450 units on hand, 5.6 days coverage headroom',
      'Safe release quantity: 180 units (above critical safety stock)',
      'Express road freight: Chennai → Hyderabad ≈ 36 hrs',
      'STO authorization: Supply Chain Manager required',
    ],
  },
  {
    id: 'PRODUCTION',
    name: 'Production Agent',
    role: 'Assembly Schedules & Line Balancing',
    icon: Factory,
    themeColor: 'violet',
    finding:
      '17 production orders at PL-01 Hyderabad analyzed. 12 orders for high-margin Astra EV-X Prime lines are prioritized. 5 lower-priority Sierra SUV orders can be rescheduled by 5 days without SLA breach. Partial throughput continuity possible with 120 priority units.',
    recommendation:
      'Reschedule 5 low-priority Sierra SUV orders by 5 days. Reserve incoming M-101 inventory exclusively for EV-X Prime lines.',
    confidence: 91,
    estimatedImpact: '5 orders deferred • 12 orders protected',
    badge: '12 ORDERS PROTECTED',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      '17 orders affected: 12 EV-X Prime (high margin), 5 Sierra SUV',
      'EV-X Prime daily margin: ₹18,400/vehicle — SLA critical',
      'Sierra SUV: Customer SLA allows 5-day rescheduling flexibility',
      'Line throughput: 100 units/day; recovery burst: 120 units/day',
    ],
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics Agent',
    role: 'Multimodal Routing & Expedited Freight',
    icon: Truck,
    themeColor: 'amber',
    finding:
      'Road transit from Bharat Precision (Pune) takes 7 days — too slow for 2.4-day buffer. Express air cargo from S-104 Jamshedpur finished goods buffer (100 units) can arrive in Hyderabad within 2 days at ₹2.6L. Combined air + inter-plant transfer is optimal.',
    recommendation:
      'Charter priority air freight from Jamshedpur buffer (100 units) + overnight road express from Chennai (120 units). Alternate supplier road freight is secondary.',
    confidence: 89,
    estimatedImpact: '₹2.6L air cost • 2-day delivery',
    badge: 'AIR CARGO VIABLE',
    vote: 'EXPEDITED_LOGISTICS',
    voteLabel: 'Air Freight',
    keyFindings: [
      'Jamshedpur buffer: 100 finished units ready at airfield',
      'Charter cargo: ATR-72 freight, JSR → HYD (28 hrs turnaround)',
      'Freight cost: ₹2.6L — emergency tariff approved',
      'Combined route: 100 units air + 120 units express road',
    ],
  },
  {
    id: 'FINANCE',
    name: 'Finance Agent',
    role: 'Cost-Benefit & Authority Governance',
    icon: DollarSign,
    themeColor: 'rose',
    finding:
      'Unmitigated loss exposure is ₹27.4L. Combined Recovery (₹1.85L total cost) protects ₹24.2L — a net ROI of 12.1x. Budget authority for supply chain emergency actions up to ₹5L has been confirmed. All actions are within delegated financial authority.',
    recommendation:
      'Combined Recovery strategy at ₹1.85L cost is financially justified. Proceed with formal budget allocation against Cost Center 5104-HYD-SCM.',
    confidence: 96,
    estimatedImpact: '₹24.2L protected • 12.1x ROI',
    badge: '12.1x ROI',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      'Revenue at risk (unmitigated): ₹27.4L exposure',
      'Combined Recovery cost: ₹1.85L (air ₹1.05L + road ₹0.8L)',
      'Net revenue protected: ₹24.2L preserved',
      'ROI: 12.1x — strongest return across all recovery options',
    ],
  },
  {
    id: 'CUSTOMER',
    name: 'Customer Impact Agent',
    role: 'SLA Protection & OEM Fleet Contracts',
    icon: Users,
    themeColor: 'teal',
    finding:
      '20 customer orders analyzed. 8 Tier-1 OEM fleet orders (4,000+ vehicles YTD) have contract milestone deadlines in 3–4 days — delay beyond this triggers ₹12L in penalty clauses. 4 enterprise dealership orders have SLA tolerance of 5 days. Immediate action required.',
    recommendation:
      'Prioritize inventory allocation to 8 Tier-1 OEM fleet accounts. Re-confirm delivery dates within 24 hours to preserve SLA compliance and avoid penalty activation.',
    confidence: 93,
    estimatedImpact: '8 Tier-1 accounts protected • ₹12L penalties avoided',
    badge: '8 OEM ACCOUNTS AT RISK',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      '8 Tier-1 OEM accounts: Penalty clauses trigger in 3 days',
      '4 enterprise dealerships: 5-day SLA tolerance confirmed',
      '8 consumer orders: Flexible, can accommodate 7-day delay',
      'Penalty exposure: ₹12L if Tier-1 fleet SLAs breached',
    ],
  },
];

// ─── Default Strategy Benchmark Data ──────────────────────────────────────────

const DEFAULT_STRATEGY_SCORES = [
  {
    id: 'STR-001',
    name: 'Combined Recovery',
    transportMode: 'MULTI-MODAL + AIR',
    scores: { time: 98, revenue: 95, cost: 88, risk: 92, customer: 96 },
    total: 94.0,
    orchestratorScore: 82.3,
    cost: 185000,
    costFormatted: '₹1.85L',
    transitHours: 18,
    transitFormatted: '18 hrs',
    riskLevel: 'LOW' as const,
    recommended: true,
  },
  {
    id: 'STR-002',
    name: 'Air Expedite Only',
    transportMode: 'AIR CHARTER',
    scores: { time: 90, revenue: 88, cost: 65, risk: 85, customer: 90 },
    total: 86.5,
    orchestratorScore: 74.2,
    cost: 260000,
    costFormatted: '₹2.60L',
    transitHours: 12,
    transitFormatted: '12 hrs',
    riskLevel: 'MEDIUM' as const,
    recommended: false,
  },
  {
    id: 'STR-003',
    name: 'Multi-Supplier Allocation',
    transportMode: 'ROAD FREIGHT',
    scores: { time: 50, revenue: 60, cost: 90, risk: 70, customer: 65 },
    total: 68.5,
    orchestratorScore: 61.5,
    cost: 120000,
    costFormatted: '₹1.20L',
    transitHours: 48,
    transitFormatted: '48 hrs',
    riskLevel: 'HIGH' as const,
    recommended: false,
  },
  {
    id: 'STR-004',
    name: 'Secondary Plant Buffer',
    transportMode: 'INTER-PLANT EXPRESS',
    scores: { time: 75, revenue: 80, cost: 95, risk: 90, customer: 80 },
    total: 82.0,
    orchestratorScore: 72.8,
    cost: 80000,
    costFormatted: '₹0.80L',
    transitHours: 36,
    transitFormatted: '36 hrs',
    riskLevel: 'LOW' as const,
    recommended: false,
  },
  {
    id: 'STR-005',
    name: 'Standard Rail Logistics',
    transportMode: 'DEDICATED RAIL',
    scores: { time: 40, revenue: 50, cost: 80, risk: 60, customer: 50 },
    total: 54.0,
    orchestratorScore: 48.0,
    cost: 45000,
    costFormatted: '₹0.45L',
    transitHours: 72,
    transitFormatted: '72 hrs',
    riskLevel: 'HIGH' as const,
    recommended: false,
  },
];

const WEIGHTS = [
  { key: 'time', label: 'Recovery Time', weight: 30, color: 'bg-sky-500' },
  { key: 'revenue', label: 'Revenue Protected', weight: 25, color: 'bg-emerald-500' },
  { key: 'cost', label: 'Cost Efficiency', weight: 20, color: 'bg-violet-500' },
  { key: 'risk', label: 'Risk Mitigation', weight: 15, color: 'bg-amber-500' },
  { key: 'customer', label: 'Customer SLAs', weight: 10, color: 'bg-rose-500' },
];

type Phase = 'IDLE' | 'ANALYZING' | 'COMPLETE';

// ─── Loading Skeleton Component ──────────────────────────────────────────────

function CommandCenterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading AI Command Center">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-14 bg-slate-100 rounded-xl" />
      <div className="h-64 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Main Content Component (Consumes useSearchParams inside Suspense) ──────

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const { setWorkflowState } = useWorkflow();
  const [phase, setPhase] = useState<Phase>('COMPLETE');
  const [revealedCount, setRevealedCount] = useState<number>(AGENTS.length);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState<boolean>(false);

  const [hanaDecision, setHanaDecision] = useState<HanaAIDecision | null>(null);
  const [strategyRankings, setStrategyRankings] = useState<HanaStrategyRanking[] | null>(null);
  const [dataSource, setDataSource] = useState<'sap-hana' | 'fallback'>('sap-hana');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isMountedRef = React.useRef(true);
  const timersRef = React.useRef<NodeJS.Timeout[]>([]);
  const fetchAbortRef = React.useRef<AbortController | null>(null);

  // Load live SAP HANA AI Decision & Strategy Rankings data
  const fetchData = useCallback(async () => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      const strategiesRes = await fetch(
        `/api/hana/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`,
        { signal: controller.signal }
      );

      let decisionData: HanaAIDecision | null = null;
      let strategiesData: HanaStrategyRanking[] | null = null;

      if (strategiesRes.ok) {
        const sJson = await strategiesRes.json();
        if (sJson.success) {
          if (Array.isArray(sJson.aiDecisions) && sJson.aiDecisions.length > 0) {
            decisionData = sJson.aiDecisions[0];
          }
          if (Array.isArray(sJson.strategyRanking) && sJson.strategyRanking.length > 0) {
            strategiesData = sJson.strategyRanking;
          }
        }
      }

      if (!isMountedRef.current) return;

      if (decisionData) {
        setHanaDecision(decisionData);
        if (strategiesData) {
          setStrategyRankings(strategiesData);
        }
        setDataSource('sap-hana');
      } else {
        setDataSource('fallback');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.warn('SAP HANA AI decisions query fallback:', err);
      if (isMountedRef.current) {
        setDataSource('fallback');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [disruptionId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
      // Clear all active animation timers on unmount
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  // Run or re-run multi-agent sequential orchestration analysis with safe timer management
  const runAnalysis = useCallback(() => {
    // Clear any previous ongoing timers before starting a new run
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    setPhase('ANALYZING');
    setRevealedCount(0);
    setWorkflowState('AGENTS_ANALYZING');

    AGENTS.forEach((_, idx) => {
      const timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        setRevealedCount(idx + 1);
        if (idx === AGENTS.length - 1) {
          const completionTimer = setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase('COMPLETE');
            setWorkflowState('AGENTS_COMPLETE');
          }, 400);
          timersRef.current.push(completionTimer);
        }
      }, 350 * (idx + 1));
      timersRef.current.push(timer);
    });
  }, [setWorkflowState]);

  // Toggle individual card expansion
  const toggleAgentExpand = (id: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllEvidence = () => {
    const nextState = !expandAll;
    setExpandAll(nextState);
    const updated: Record<string, boolean> = {};
    AGENTS.forEach((a) => {
      updated[a.id] = nextState;
    });
    setExpandedAgents(updated);
  };

  // Canonical metrics derived dynamically from live HANA or canonical fallback
  const canonicalDecision = useMemo(() => {
    const isLive = dataSource === 'sap-hana' && hanaDecision !== null;
    const strategyId = isLive && hanaDecision ? hanaDecision.STRATEGY_ID : 'STR-001';
    const strategyName = isLive && hanaDecision ? hanaDecision.STRATEGY_NAME : 'Combined Recovery';
    const transportMode = isLive && hanaDecision ? hanaDecision.TRANSPORT_MODE : 'MULTI-MODAL + AIR';
    const recoveryScore =
      isLive && hanaDecision
        ? parseFloat(String(hanaDecision.RECOVERY_SCORE)) || 94.0
        : 94.0;
    const orchestratorScore =
      isLive && hanaDecision
        ? parseFloat(String(hanaDecision.ORCHESTRATOR_SCORE)) || 82.3
        : 82.3;
    const rawCost = isLive && hanaDecision ? parseFloat(String(hanaDecision.ESTIMATED_COST)) : 185000;
    const costInLakhs = (rawCost / 100000).toFixed(2);
    const transitHours = isLive && hanaDecision ? hanaDecision.TRANSIT_TIME_HOURS : 18;
    const riskLevel = isLive && hanaDecision ? hanaDecision.RISK_LEVEL : 'LOW';
    const aiReason =
      isLive && hanaDecision?.AI_REASON
        ? hanaDecision.AI_REASON
        : 'Combined Recovery selected: balances 94.0 recovery score against low transit time (18h) and minimal risk level (LOW) with cost efficiency (₹1.85L) under the ₹5.0L delegated authority threshold.';

    return {
      strategyId,
      strategyName,
      transportMode,
      recoveryScore,
      orchestratorScore,
      costInLakhs,
      rawCost,
      transitHours,
      riskLevel,
      aiReason,
    };
  }, [dataSource, hanaDecision]);

  // Reconciled strategy list for comparison table
  const strategiesList = useMemo(() => {
    if (strategyRankings && strategyRankings.length > 0) {
      return strategyRankings.map((sr) => {
        const costNum = parseFloat(String(sr.ESTIMATED_COST)) || 0;
        const recScore = parseFloat(String(sr.RECOVERY_SCORE)) || 0;
        const orchScore = parseFloat(String(sr.ORCHESTRATOR_SCORE)) || 0;
        return {
          id: sr.STRATEGY_ID,
          name: sr.STRATEGY_NAME,
          transportMode: sr.TRANSPORT_MODE,
          recoveryScore: recScore,
          orchestratorScore: orchScore,
          costFormatted: `₹${(costNum / 100000).toFixed(2)}L`,
          transitFormatted: `${sr.TRANSIT_TIME_HOURS} hrs`,
          riskLevel: sr.RISK_LEVEL,
          recommended: sr.STRATEGY_ID === 'STR-001',
        };
      });
    }

    return DEFAULT_STRATEGY_SCORES.map((s) => ({
      id: s.id,
      name: s.name,
      transportMode: s.transportMode,
      recoveryScore: s.total,
      orchestratorScore: s.orchestratorScore,
      costFormatted: s.costFormatted,
      transitFormatted: s.transitFormatted,
      riskLevel: s.riskLevel,
      recommended: s.recommended,
    }));
  }, [strategyRankings]);

  if (isLoading) {
    return <CommandCenterSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. PAGE HEADER ────────────────────────────────────────── */}
      <PageHeader
        icon={<Bot className="w-5 h-5 text-sky-700" />}
        title="AI COMMAND CENTER"
        description="Multi-agent AI orchestration and recovery decision intelligence."
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {disruptionId}
            </span>
            <LiveDataBadge isLive={dataSource === 'sap-hana'} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync HANA
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={phase === 'ANALYZING'}
              className="border-slate-300 text-slate-800 hover:bg-slate-100"
            >
              <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              {phase === 'ANALYZING' ? 'Orchestrating…' : 'Re-run Analysis'}
            </Button>

            <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                Review Recovery Strategy
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. CRISIS CONTEXT STRIP ──────────────────────────────── */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
        role="region"
        aria-label="Active Crisis Context"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disruption:</span>
            <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {disruptionId}
            </span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            <span className="font-semibold text-slate-800">Supplier Delay</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
            <Badge variant="critical" size="sm">
              HIGH
            </Badge>
          </div>

          <div className="hidden sm:block h-3 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region:</span>
            <span className="text-slate-700 font-medium">East India</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target:</span>
            <span className="font-mono text-slate-700 font-semibold">PLANT-001</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-500 font-medium">Expected Duration:</span>
            <span className="font-mono font-bold text-slate-900">48 hours</span>
          </div>

          <Badge variant="critical" size="sm" dot pulse>
            ACTIVE
          </Badge>
        </div>
      </div>

      {/* ── 3. LIFECYCLE STEPPER ─────────────────────────────────── */}
      <LifecycleStepper currentStage="DECIDE" incidentId={disruptionId} />

      {/* ── 4. ORCHESTRATION OVERVIEW ────────────────────────────── */}
      <Card className="p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Multi-Agent Orchestration Architecture
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deterministic synthesis connecting domain operational evidence into unified consensus
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500">Alignment:</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              5 of 6 (83.3%)
            </span>
          </div>
        </div>

        {/* Visual Architecture Flow */}
        <div className="relative py-2">
          {/* Top Node: Orchestrator */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-900 text-white rounded-xl px-5 py-2.5 shadow-xs border border-slate-800 flex items-center gap-3 max-w-md w-full justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">RESILINET AI ORCHESTRATOR</p>
                  <p className="text-[10px] text-slate-400 font-mono">SAP HANA Cloud Decision Engine</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Connective SVG Lines (Accessible & Responsive) */}
          <div className="hidden lg:block absolute left-0 right-0 top-14 h-12 pointer-events-none" aria-hidden="true">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 50">
              <path
                d="M 500 0 L 500 25 M 83 25 L 917 25 M 83 25 L 83 50 M 250 25 L 250 50 M 417 25 L 417 50 M 583 25 L 583 50 M 750 25 L 750 50 M 917 25 L 917 50"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Middle Tier: 6 Domain Agents */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            {AGENTS.map((agent, idx) => {
              const isRevealed = idx < revealedCount;
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className={`rounded-lg border p-2.5 transition-all duration-300 flex flex-col justify-between ${
                    isRevealed
                      ? 'bg-slate-50/80 border-slate-200 shadow-2xs opacity-100'
                      : 'bg-slate-50/30 border-slate-100 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-white border border-slate-200 text-slate-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {agent.confidence}%
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                      {agent.name.replace(' Agent', '')}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{agent.voteLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connective SVG Lines Down to Consensus */}
          <div className="hidden lg:block relative h-10 pointer-events-none mt-2" aria-hidden="true">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
              <path
                d="M 83 0 L 83 20 M 250 0 L 250 20 M 417 0 L 417 20 M 583 0 L 583 20 M 750 0 L 750 20 M 917 0 L 917 20 M 83 20 L 917 20 M 500 20 L 500 40"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Bottom Node: Consensus to STR-001 */}
          <div className="flex justify-center mt-3 lg:mt-0">
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl px-4 py-2.5 max-w-md w-full flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      AI Consensus Recommendation
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-950 font-mono">
                    {canonicalDecision.strategyId} • {canonicalDecision.strategyName}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-emerald-700 block font-medium">Recovery Score</span>
                <span className="text-sm font-bold font-mono text-emerald-900">
                  {canonicalDecision.recoveryScore.toFixed(1)} / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 5. & 6. AGENT CARDS & PROGRESSIVE DISCLOSURE FINDINGS ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Specialized Domain Agents (6 Active)
            </h3>
            <p className="text-xs text-slate-500">
              Independent evaluations based on ERP inventory levels, supplier SLAs, plant capacities, and logistics routes
            </p>
          </div>

          <button
            onClick={toggleAllEvidence}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-1.5 py-0.5"
            aria-expanded={expandAll}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {expandAll ? 'Collapse All Evidence' : 'Expand All Evidence'}
          </button>
        </div>

        {/* 6 Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent, idx) => {
            const isVisible = idx < revealedCount;
            const isExpanded = !!expandedAgents[agent.id];
            const Icon = agent.icon;

            return (
              <div
                key={agent.id}
                className={`transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                {/* Reusable AgentConsensusCard with Progressive Disclosure Toggle */}
                <div className="relative">
                  <AgentConsensusCard
                    id={agent.id}
                    name={agent.name}
                    roleIcon={<Icon className="w-4 h-4" />}
                    finding={agent.finding}
                    recommendation={agent.recommendation}
                    confidence={agent.confidence}
                    badge={agent.badge}
                    voteLabel={agent.voteLabel}
                    themeColor={agent.themeColor}
                    keyFindings={isExpanded ? agent.keyFindings : undefined}
                    className="shadow-2xs hover:shadow-xs transition-shadow"
                  />

                  {/* Expand/Collapse Toggle Button for Evidence */}
                  <div className="px-4 pb-3 -mt-1 bg-white rounded-b-xl border-x border-b border-slate-200">
                    <button
                      onClick={() => toggleAgentExpand(agent.id)}
                      className="w-full text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center justify-center gap-1 py-1 rounded bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                      aria-expanded={isExpanded}
                      aria-controls={`evidence-${agent.id}`}
                    >
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-sky-700' : ''
                        }`}
                      />
                      <span>{isExpanded ? 'Hide Key Findings & Evidence' : 'View Key Findings & Evidence'}</span>
                    </button>

                    {/* Operational Evidence Panel */}
                    {isExpanded && (
                      <div
                        id={`evidence-${agent.id}`}
                        className="mt-2.5 pt-2 border-t border-slate-100 text-xs space-y-2 animate-in fade-in duration-200"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Domain Evidence Summary
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-700 font-normal">
                            {agent.keyFindings.map((finding, fi) => (
                              <li key={fi} className="flex items-start gap-1.5">
                                <span className="text-sky-500 font-bold shrink-0">›</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                          <span>Impact:</span>
                          <span className="font-semibold text-slate-700">{agent.estimatedImpact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. CONSENSUS PANEL ───────────────────────────────────── */}
      <Card className="border-2 border-emerald-400/90 bg-emerald-50/30 overflow-hidden shadow-xs">
        <CardHeader className="bg-emerald-100/60 border-b border-emerald-200/80 py-3.5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  AI CONSENSUS
                </CardTitle>
                <p className="text-[11px] text-emerald-800">
                  Synthesized multi-domain recommendation confirmed by SAP HANA Cloud Decision Orchestrator
                </p>
              </div>
            </div>

            <Badge variant="healthy" size="md" className="font-mono text-xs font-bold self-start sm:self-auto">
              AI RECOMMENDED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recommended Strategy
              </span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{canonicalDecision.strategyId}</p>
              <p className="text-[11px] text-emerald-800 font-semibold truncate">{canonicalDecision.strategyName}</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recovery Score
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {canonicalDecision.recoveryScore.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </p>
              <p className="text-[11px] text-slate-500">Tier-1 Optimal</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Orchestrator Score
              </span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                {canonicalDecision.orchestratorScore.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">Weighted Total</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Cost
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">₹{canonicalDecision.costInLakhs}L</p>
              <p className="text-[11px] text-emerald-700 font-medium">Under ₹5L budget</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transit Time
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{canonicalDecision.transitHours} hrs</p>
              <p className="text-[11px] text-slate-500">Within buffer window</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/70 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Risk & Transport
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="healthy" size="sm">
                  {canonicalDecision.riskLevel}
                </Badge>
              </div>
              <p className="text-[10px] font-mono text-slate-600 mt-1 truncate">{canonicalDecision.transportMode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 8. & 9. AI DECISION REASONING & DECISION FACTORS ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 8: AI Decision Reasoning */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  WHY THIS STRATEGY?
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Source: {dataSource === 'sap-hana' ? 'SAP HANA Cloud V_ORCH_AI_DECISION' : 'Canonical Synthesis'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {canonicalDecision.aiReason}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Primary Decision Drivers
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li>Protects 12 high-margin EV-X Prime lines (₹18.4K/day margin)</li>
                  <li>Overnight road transfer (180 units) from PL-02 Chennai STO</li>
                  <li>Air cargo charter (100 units) from JSR airport buffer</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mitigation Economics
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li>₹24.2L revenue protected against ₹27.4L unmitigated exposure</li>
                  <li>Net recovery ROI of 12.1x on ₹1.85L recovery cost</li>
                  <li>Zero Tier-1 OEM SLA breach penalty triggers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Pre-validated against SAP ERP S/4HANA Master Data
            </span>
            <span className="font-mono text-[11px]">DIS-1001 → STR-001</span>
          </div>
        </Card>

        {/* Section 9: Decision Factors */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Scale className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                DECISION FACTORS
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              5-Factor deterministic scoring weights applied by the HANA orchestrator:
            </p>

            <div className="space-y-2.5">
              {WEIGHTS.map((factor) => {
                const defaultScore =
                  DEFAULT_STRATEGY_SCORES[0].scores[
                    factor.key as keyof (typeof DEFAULT_STRATEGY_SCORES)[0]['scores']
                  ];

                return (
                  <div key={factor.key} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-slate-700">
                        {factor.label}{' '}
                        <span className="text-slate-400 font-mono text-[10px]">({factor.weight}%)</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">{defaultScore} / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${factor.color}`}
                        style={{ width: `${defaultScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-sky-900 font-medium">
            Deterministic weights optimize for SLA continuity without exceeding risk thresholds.
          </div>
        </Card>
      </div>

      {/* ── 10. STRATEGY COMPARISON ───────────────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              STRATEGY COMPARISON & RANKING
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against incident {disruptionId} across recovery score, cost, transit duration, and risk level
            </p>
          </div>

          <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`}>
            <span className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              Full Comparison Matrix
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3">Transport Mode</th>
                <th className="py-2.5 px-3">Recovery Score</th>
                <th className="py-2.5 px-3">Orchestrator Score</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3">Transit</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {strategiesList.map((strat) => {
                const isRec = strat.recommended || strat.id === 'STR-001';
                const riskVariant =
                  strat.riskLevel === 'LOW'
                    ? 'healthy'
                    : strat.riskLevel === 'MEDIUM'
                    ? 'warning'
                    : 'critical';

                return (
                  <tr
                    key={strat.id}
                    className={`transition-colors ${
                      isRec ? 'bg-emerald-50/40 font-semibold' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">{strat.id}</span>
                        <span className="text-slate-700">{strat.name}</span>
                        {isRec && (
                          <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                            AI RECOMMENDED
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{strat.transportMode}</td>
                    <td className="py-3 px-3 font-mono text-slate-900">
                      <span className={isRec ? 'text-emerald-700 font-bold' : ''}>
                        {strat.recoveryScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{strat.orchestratorScore.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">{strat.costFormatted}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{strat.transitFormatted}</td>
                    <td className="py-3 px-3">
                      <Badge variant={riskVariant} size="sm">
                        {strat.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isRec ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Rank #1
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Alternative</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 11. & 12. HUMAN-IN-THE-LOOP GOVERNANCE & EXECUTION BOUNDARY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 11: Human-in-the-Loop Governance Panel */}
        <Card className="lg:col-span-2 p-5 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI RECOMMENDATION READY FOR HUMAN REVIEW
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mandatory human authorization required prior to SAP execution trigger
                </p>
              </div>
            </div>

            <Badge variant="info" size="sm" className="font-mono">
              STAGE: DECIDE
            </Badge>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <p className="leading-relaxed">
              The AI orchestrator has generated a verified recovery recommendation ({canonicalDecision.strategyId} —{' '}
              {canonicalDecision.strategyName}). Autonomous execution is restricted: formal human review and approval
              remain part of the mandatory governance workflow before execution orders are dispatched.
            </p>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Next Action Required:</span> Proceed to the Approval Center to validate
                budget release (₹{canonicalDecision.costInLakhs}L) and dispatch operational execution commands.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/approval-center">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                  REVIEW & APPROVE
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>

              <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`}>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs">
                  VIEW RECOVERY STRATEGIES
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Section 12: Execution Boundary */}
        <Card className="p-5 flex flex-col justify-between border border-slate-200">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Shield className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                EXECUTION BOUNDARY
              </h3>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              AI Command Center serves strictly as the decision intelligence layer. It computes optimal strategies but
              does NOT autonomously trigger SAP ERP mutations without human authorization.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">1. AI Decision Layer:</span>
                <span className="font-mono text-emerald-700 font-bold text-[11px]">COMPUTED</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">2. Human Approval:</span>
                <span className="font-mono text-amber-700 font-bold text-[11px]">PENDING REVIEW</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">3. Execution Pipeline:</span>
                <span className="font-mono text-slate-700 font-bold text-[11px]">EXE-1001 • IN_PROGRESS</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            HANA Execution Record: EXE-1001 (Auto-Orchestrator Tracking)
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Default Page Export (Wrapped in EnterpriseShell & Suspense) ─────────────

export default function AiCommandCenterPage() {
  return (
    <EnterpriseShell>
      <Suspense fallback={<CommandCenterSkeleton />}>
        <CommandCenterContent />
      </Suspense>
    </EnterpriseShell>
  );
}
