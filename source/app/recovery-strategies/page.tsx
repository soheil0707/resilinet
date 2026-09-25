'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { StrategyCard } from '@/components/enterprise/StrategyCard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { RecoveryStrategy } from '@/lib/supabase/types';
import type { HanaStrategyRanking, HanaRecommendation, HanaAIDecision } from '@/lib/hana/repository';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Database,
  Bot,
  RefreshCw,
  FileCheck,
  Layers,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Shield,
  AlertCircle,
  Truck,
  Plane,
  Scale,
  Award,
  Check,
} from 'lucide-react';

// ─── 5-Factor Scoring Weights ─────────────────────────────────────────────────

const WEIGHTS = [
  { key: 'recovery_time_score', label: 'Recovery Time', weight: 30, color: 'bg-sky-500', textColor: 'text-sky-700' },
  { key: 'revenue_score', label: 'Revenue Protected', weight: 25, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { key: 'cost_score', label: 'Cost Efficiency', weight: 20, color: 'bg-violet-500', textColor: 'text-violet-700' },
  { key: 'risk_score', label: 'Risk Mitigation', weight: 15, color: 'bg-amber-500', textColor: 'text-amber-700' },
  { key: 'customer_score', label: 'Customer SLAs', weight: 10, color: 'bg-rose-500', textColor: 'text-rose-700' },
];

// ─── Canonical Strategy Reference Data ───────────────────────────────────────

function parseStrategyType(
  typeStr?: string | null
): 'ALTERNATE_SOURCING' | 'STOCK_TRANSFER' | 'EXPEDITED_LOGISTICS' | 'COMBINED' {
  const t = String(typeStr || '').toUpperCase();
  if (t.includes('ALTERNATE') || t.includes('SOURCING')) return 'ALTERNATE_SOURCING';
  if (t.includes('STOCK') || t.includes('TRANSFER')) return 'STOCK_TRANSFER';
  if (t.includes('EXPEDITE') || t.includes('AIR') || t.includes('LOGISTICS')) return 'EXPEDITED_LOGISTICS';
  return 'COMBINED';
}

interface CanonicalStrategy {
  id: string;
  name: string;
  strategy_type: 'ALTERNATE_SOURCING' | 'STOCK_TRANSFER' | 'EXPEDITED_LOGISTICS' | 'COMBINED';
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
  score_breakdown: {
    recovery_time_score: number;
    revenue_score: number;
    cost_score: number;
    risk_score: number;
    customer_score: number;
  };
}

const CANONICAL_STRATEGIES: CanonicalStrategy[] = [
  {
    id: 'STR-001',
    name: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
    strategy_type: 'COMBINED',
    transport_mode: 'MULTI-MODAL + AIR',
    cost_inr: 185000,
    costFormatted: '₹1.85L',
    transit_hours: 18,
    recovery_time_days: 1,
    recovery_score: 94.0,
    orchestrator_score: 82.3,
    risk_level: 'LOW',
    is_recommended: true,
    revenue_protected_inr: 2420000,
    description: 'Multi-modal transit via road express + priority air dispatch buffer. 18 hours transit time.',
    score_breakdown: {
      recovery_time_score: 98,
      revenue_score: 95,
      cost_score: 88,
      risk_score: 92,
      customer_score: 96,
    },
  },
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
    orchestrator_score: 78.5,
    risk_level: 'LOW',
    is_recommended: false,
    revenue_protected_inr: 2200000,
    description: 'Dedicated charter air freight from S-104 finished inventory buffer directly to Hyderabad.',
    score_breakdown: {
      recovery_time_score: 94,
      revenue_score: 90,
      cost_score: 70,
      risk_score: 80,
      customer_score: 92,
    },
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
    orchestrator_score: 74.2,
    risk_level: 'MEDIUM',
    is_recommended: false,
    revenue_protected_inr: 1950000,
    description: 'Emergency batch allocation from secondary qualified vendor Bharat Precision (Pune) via road & regional air.',
    score_breakdown: {
      recovery_time_score: 70,
      revenue_score: 78,
      cost_score: 85,
      risk_score: 75,
      customer_score: 72,
    },
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
    orchestrator_score: 68.4,
    risk_level: 'MEDIUM',
    is_recommended: false,
    revenue_protected_inr: 2100000,
    description: 'Issue Stock Transport Order (STO) from PL-02 Chennai to PL-01 Hyderabad via express highway freight.',
    score_breakdown: {
      recovery_time_score: 80,
      revenue_score: 85,
      cost_score: 92,
      risk_score: 88,
      customer_score: 82,
    },
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
    orchestrator_score: 60.1,
    risk_level: 'HIGH',
    is_recommended: false,
    revenue_protected_inr: 1600000,
    description: 'Shift assembly load to secondary coastal plant with combined multimodal road and maritime transit.',
    score_breakdown: {
      recovery_time_score: 55,
      revenue_score: 65,
      cost_score: 95,
      risk_score: 60,
      customer_score: 55,
    },
  },
];

function formatCostLabel(costNum: number): string {
  if (costNum >= 100000) {
    return `₹${(costNum / 100000).toFixed(2)}L`;
  }
  return `₹${costNum.toLocaleString('en-IN')}`;
}

export type EnhancedRecoveryStrategy = RecoveryStrategy & {
  transport_mode: string;
  orchestrator_score: number;
  transit_hours: number;
};

// ─── Loading Skeleton Component ──────────────────────────────────────────────

function RecoveryStrategiesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading Recovery Strategies">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-14 bg-slate-100 rounded-xl" />
      <div className="h-44 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Main Content Component (Consumes useSearchParams inside Suspense) ──────

function RecoveryStrategiesContent() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const {
    approvedStrategy,
    selectedStrategy,
    isOverride,
    setApprovedStrategy,
    setSelectedStrategy,
    setWorkflowState,
  } = useWorkflow();

  const [hanaRankings, setHanaRankings] = useState<HanaStrategyRanking[] | null>(null);
  const [hanaRecommendations, setHanaRecommendations] = useState<HanaRecommendation[] | null>(null);
  const [hanaAiDecisions, setHanaAiDecisions] = useState<HanaAIDecision[] | null>(null);
  const [dataSource, setDataSource] = useState<'sap-hana' | 'fallback'>('sap-hana');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string>(
    approvedStrategy?.id || selectedStrategy?.id || 'STR-001'
  );
  const [pendingOverrideStrategy, setPendingOverrideStrategy] = useState<EnhancedRecoveryStrategy | null>(null);
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(true);

  // Sync selectedId with workflow context
  useEffect(() => {
    if (approvedStrategy?.id) {
      setSelectedId(approvedStrategy.id);
    } else if (selectedStrategy?.id) {
      setSelectedId(selectedStrategy.id);
    }
  }, [approvedStrategy, selectedStrategy]);

  // Fetch live HANA recovery strategy data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/hana/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();

      if (json.success && Array.isArray(json.strategyRanking) && json.strategyRanking.length > 0) {
        setHanaRankings(json.strategyRanking);
        setHanaRecommendations(json.recommendations || []);
        setHanaAiDecisions(json.aiDecisions || []);
        setDataSource('sap-hana');
      } else {
        setDataSource('fallback');
      }
    } catch (err) {
      console.warn('SAP HANA recovery strategies query fallback:', err);
      setDataSource('fallback');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [disruptionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  // Harmonized strategies list incorporating live HANA data or canonical fallback
  const strategies: EnhancedRecoveryStrategy[] = useMemo(() => {
    if (dataSource === 'sap-hana' && hanaRankings && hanaRankings.length > 0) {
      const topRec = hanaRecommendations && hanaRecommendations.length > 0 ? hanaRecommendations[0] : null;
      const topRecId = topRec?.STRATEGY_ID || 'STR-001';

      return hanaRankings.map((r) => {
        const costNum =
          typeof r.ESTIMATED_COST === 'number'
            ? r.ESTIMATED_COST
            : parseFloat(String(r.ESTIMATED_COST)) || 185000;
        const transitHours = Number(r.TRANSIT_TIME_HOURS) || 18;
        const days = Math.max(1, Math.round(transitHours / 24));
        const recScore =
          typeof r.RECOVERY_SCORE === 'number'
            ? r.RECOVERY_SCORE
            : parseFloat(String(r.RECOVERY_SCORE)) || 90;
        const orchScore =
          typeof r.ORCHESTRATOR_SCORE === 'number'
            ? r.ORCHESTRATOR_SCORE
            : parseFloat(String(r.ORCHESTRATOR_SCORE)) || 82.3;
        const isRec = r.STRATEGY_ID === topRecId;

        const rawRisk = String(r.RISK_LEVEL).toUpperCase();
        const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
          rawRisk === 'HIGH' ? 'HIGH' : rawRisk === 'MEDIUM' ? 'MEDIUM' : 'LOW';

        const revProtected = Math.round(2740000 * (recScore / 100) * 0.94);

        const timeScore = Math.min(100, Math.max(40, Math.round(100 - (transitHours / 72) * 50)));
        const revScore = Math.round(recScore);
        const costScore = Math.min(100, Math.max(40, Math.round(100 - (costNum / 250000) * 40)));
        const riskScore = riskLevel === 'LOW' ? 92 : riskLevel === 'MEDIUM' ? 78 : 55;
        const custScore = Math.round(recScore * 0.6 + timeScore * 0.4);

        return {
          id: r.STRATEGY_ID,
          disruption_id: r.DISRUPTION_ID,
          name: r.STRATEGY_NAME,
          strategy_type: parseStrategyType(r.STRATEGY_TYPE),
          transport_mode: r.TRANSPORT_MODE || 'MULTI-MODAL + AIR',
          cost_inr: costNum,
          transit_hours: transitHours,
          recovery_time_days: days,
          revenue_protected_inr: revProtected,
          risk_level: riskLevel,
          overall_score: recScore,
          orchestrator_score: orchScore,
          is_recommended: isRec,
          description: `${r.STRATEGY_TYPE || 'Combined'} mode via ${r.TRANSPORT_MODE} • Transit: ${transitHours} hrs • Score: ${recScore.toFixed(1)}`,
          score_breakdown: {
            recovery_time_score: timeScore,
            revenue_score: revScore,
            cost_score: costScore,
            risk_score: riskScore,
            customer_score: custScore,
          },
        };
      });
    }

    // Fallback to canonical strategies
    return CANONICAL_STRATEGIES.map((cs) => ({
      id: cs.id,
      disruption_id: disruptionId,
      name: cs.name,
      strategy_type: cs.strategy_type,
      transport_mode: cs.transport_mode,
      cost_inr: cs.cost_inr,
      transit_hours: cs.transit_hours,
      recovery_time_days: cs.recovery_time_days,
      revenue_protected_inr: cs.revenue_protected_inr,
      risk_level: cs.risk_level,
      overall_score: cs.recovery_score,
      orchestrator_score: cs.orchestrator_score,
      is_recommended: cs.is_recommended,
      description: cs.description,
      score_breakdown: cs.score_breakdown,
    }));
  }, [dataSource, disruptionId, hanaRankings, hanaRecommendations]);

  // Top AI recommended strategy (canonical STR-001)
  const topRecommendedStrategy = useMemo(() => {
    return strategies.find((s) => s.is_recommended || s.id === 'STR-001') || strategies[0];
  }, [strategies]);

  // Currently selected strategy object
  const currentSelectedObj = useMemo(() => {
    return strategies.find((s) => s.id === selectedId) || topRecommendedStrategy;
  }, [strategies, selectedId, topRecommendedStrategy]);

  // Live HANA AI decision
  const currentAiDecision = useMemo(() => {
    return hanaAiDecisions && hanaAiDecisions.length > 0 ? hanaAiDecisions[0] : null;
  }, [hanaAiDecisions]);

  // Handle strategy selection (triggering override if non-recommended)
  const handleSelectForApproval = (stratId: string) => {
    const strat = strategies.find((s) => s.id === stratId);
    if (!strat) return;

    if (!strat.is_recommended && strat.id !== 'STR-001') {
      setPendingOverrideStrategy(strat);
    } else {
      confirmSelection(strat, false);
    }
  };

  const confirmSelection = (strat: EnhancedRecoveryStrategy, overrideFlag: boolean) => {
    setSelectedId(strat.id);
    setSelectedStrategy(strat, overrideFlag);
    setApprovedStrategy(strat, overrideFlag);
    setWorkflowState('STRATEGY_SELECTED');
    setPendingOverrideStrategy(null);
  };

  const currentIsOverride = isOverride || (selectedId !== 'STR-001' && !currentSelectedObj.is_recommended);

  if (isLoading) {
    return <RecoveryStrategiesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. ENTERPRISE PAGE HEADER ─────────────────────────────── */}
      <PageHeader
        icon={<GitBranch className="w-5 h-5 text-sky-700" />}
        title="RECOVERY STRATEGIES"
        description="Compare AI-generated recovery options and select the strategy for human approval."
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
              Refresh
            </Button>

            <Link href={`/crisis-analysis?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Analyze Crisis
              </Button>
            </Link>

            <Link href="/approval-center">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                Continue to Approval
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. LIFECYCLE STEPPER ──────────────────────────────────── */}
      <LifecycleStepper currentStage="DECIDE" incidentId={disruptionId} />

      {/* ── 3. CRISIS CONTEXT PANEL ───────────────────────────────── */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
        role="region"
        aria-label="Disruption Context"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disruption:</span>
            <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {disruptionId} — Supplier Delay
            </span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location:</span>
            <span className="text-slate-700 font-medium">East India</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Affected Plant:</span>
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

      {/* ── 4. AI RECOMMENDATION HERO ─────────────────────────────── */}
      <Card className="border-2 border-emerald-400/90 bg-emerald-50/20 overflow-hidden shadow-xs">
        <CardHeader className="bg-emerald-100/60 border-b border-emerald-200/80 py-3.5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    AI RECOMMENDATION HERO
                  </CardTitle>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                    {topRecommendedStrategy.id}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Current top recommendation returned by the SAP HANA Cloud Decision & Ranking layer (V_ORCH_RECOMMENDATIONS)
                </p>
              </div>
            </div>

            <Badge variant="healthy" size="md" className="font-mono text-xs font-bold self-start sm:self-auto">
              AI RECOMMENDED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {topRecommendedStrategy.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {topRecommendedStrategy.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Transport: {topRecommendedStrategy.transport_mode}
                </span>
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚠ Pending Human Approval
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => handleSelectForApproval(topRecommendedStrategy.id)}
                className={`font-semibold text-xs ${
                  selectedId === topRecommendedStrategy.id
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {selectedId === topRecommendedStrategy.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Selected for Review
                  </>
                ) : (
                  'Select Recommendation'
                )}
              </Button>
            </div>
          </div>

          {/* Canonical Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recovery Score
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {Math.round(topRecommendedStrategy.overall_score)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </p>
              <p className="text-[10px] text-slate-500">Tier-1 Optimal</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Orchestrator Score
              </span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                {topRecommendedStrategy.orchestrator_score.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">Weighted Total</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Cost
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatCostLabel(topRecommendedStrategy.cost_inr)}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium">Under ₹5L budget</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transit Time
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {topRecommendedStrategy.transit_hours}h
              </p>
              <p className="text-[10px] text-slate-500">Fastest buffer turnaround</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Risk Level
              </span>
              <div className="mt-1">
                <Badge variant="healthy" size="sm">
                  {topRecommendedStrategy.risk_level}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Dual-mode resilience</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transport Mode
              </span>
              <p className="text-xs font-bold font-mono text-slate-800 mt-1 truncate">
                {topRecommendedStrategy.transport_mode}
              </p>
              <p className="text-[10px] text-slate-500">Road + Air Charter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. STRATEGY COMPARISON (CARDS) ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Available Recovery Strategies ({strategies.length})
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against incident {disruptionId} across recovery time, cost, SLA risk, and throughput
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Selected for Review:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {selectedId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strat) => {
            const isRec = strat.is_recommended || strat.id === 'STR-001';
            const isSelected = selectedId === strat.id;
            const isStratOverride = isSelected && !isRec;

            return (
              <StrategyCard
                key={strat.id}
                id={strat.id}
                name={strat.name}
                description={strat.description}
                recoveryScore={strat.overall_score}
                orchestratorScore={strat.orchestrator_score}
                costInr={strat.cost_inr}
                transitHoursOrDays={`${strat.transit_hours}h`}
                riskLevel={strat.risk_level}
                transportMode={strat.transport_mode}
                isRecommended={isRec}
                isSelected={isSelected}
                isHumanOverride={isStratOverride}
                onSelect={() => handleSelectForApproval(strat.id)}
                className="shadow-2xs hover:shadow-xs transition-shadow"
              />
            );
          })}
        </div>
      </div>

      {/* ── 6. COMPARISON TABLE (MATRIX) ──────────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-600" />
              STRATEGY DECISION MATRIX
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side comparison generated from live SAP HANA Cloud V_ORCH_STRATEGY_RANKING
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Disruption: {disruptionId} • 5 Strategies Ranked
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3">Transport</th>
                <th className="py-2.5 px-3">Recovery Score</th>
                <th className="py-2.5 px-3">Orchestrator Score</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3">Transit</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {strategies.map((strat) => {
                const isRec = strat.is_recommended || strat.id === 'STR-001';
                const isSelected = selectedId === strat.id;
                const riskVariant =
                  strat.risk_level === 'LOW'
                    ? 'healthy'
                    : strat.risk_level === 'MEDIUM'
                    ? 'warning'
                    : 'critical';

                const transitLabel = `${strat.transit_hours}h`;

                return (
                  <tr
                    key={strat.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-sky-50/50 font-medium'
                        : isRec
                        ? 'bg-emerald-50/30'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">{strat.id}</span>
                        <span className="text-slate-800">{strat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{strat.transport_mode}</td>
                    <td className="py-3 px-3 font-mono text-slate-900">
                      <span className={isRec ? 'text-emerald-700 font-bold' : ''}>
                        {strat.overall_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{strat.orchestrator_score.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">{formatCostLabel(strat.cost_inr)}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{transitLabel}</td>
                    <td className="py-3 px-3">
                      <Badge variant={riskVariant} size="sm">
                        {strat.risk_level}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {isRec ? (
                        <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                          AI RECOMMENDED
                        </Badge>
                      ) : isSelected ? (
                        <Badge variant="warning" size="sm" className="font-mono text-[9px]">
                          HUMAN OVERRIDE
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Alternative</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSelectForApproval(strat.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 7. & 8. WHY THIS STRATEGY? & STRATEGY DETAILS ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 7: WHY THIS STRATEGY? */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  WHY THIS STRATEGY?
                </h3>
              </div>
              <button
                onClick={() => setIsWhyExpanded(!isWhyExpanded)}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                aria-expanded={isWhyExpanded}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`} />
                {isWhyExpanded ? 'Hide Evidence' : 'Show Evidence'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                HANA AI Decision Rationale (V_ORCH_AI_DECISION)
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {currentAiDecision?.AI_REASON ||
                  'Combined Recovery selected: balances 94.0 recovery score against low transit time (18h) and minimal risk level (LOW) with cost efficiency (₹1.85L) under the ₹5.0L threshold.'}
              </p>
            </div>

            {isWhyExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
                <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recovery Performance
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    Recovery Score: {Math.round(topRecommendedStrategy.overall_score)} / 100
                  </p>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Orchestrator weighted score of {topRecommendedStrategy.orchestrator_score.toFixed(2)} leads all options.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Transit Time Compliance
                  </span>
                  <p className="text-xs font-semibold text-slate-800">{topRecommendedStrategy.transit_hours}h Transit Time</p>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Well within the 48-hour buffer window, preventing PL-01 line assembly starvation.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Financial Efficiency
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Cost: ₹1.85L vs ₹27.4L Risk</p>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Delivers 12.1x net ROI, preserving ₹24.2L in high-margin vehicle deliveries.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Operational Fit & SLAs
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Zero OEM Penalty Activation</p>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Protects 8 Tier-1 fleet contract milestones within the critical 3-day window.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Verified by SAP HANA Multi-Modal Transport Optimization
            </span>
            <span className="font-mono text-[11px]">DIS-1001 → STR-001</span>
          </div>
        </Card>

        {/* Section 8: STRATEGY DETAILS INSPECTOR */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  STRATEGY DETAILS
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentSelectedObj.id}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{currentSelectedObj.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{currentSelectedObj.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mode</span>
                  <span className="font-mono text-slate-800 font-bold">{currentSelectedObj.transport_mode}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cost</span>
                  <span className="font-mono text-slate-800 font-bold">{formatCostLabel(currentSelectedObj.cost_inr)}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Transit</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {currentSelectedObj.transit_hours}h ({currentSelectedObj.recovery_time_days} {currentSelectedObj.recovery_time_days === 1 ? 'day' : 'days'})
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Risk</span>
                  <span className="font-mono text-slate-800 font-bold">{currentSelectedObj.risk_level}</span>
                </div>
              </div>

              {/* 5-Factor Score Breakdown */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scoring Breakdown
                </span>
                {WEIGHTS.map((w) => {
                  const score =
                    currentSelectedObj.score_breakdown?.[
                      w.key as keyof typeof currentSelectedObj.score_breakdown
                    ] ?? 0;
                  return (
                    <div key={w.key} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">{w.label}</span>
                        <span className="font-mono text-slate-800 font-bold">{score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${w.color}`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Recovery Score:</span>
            <span className="font-mono font-bold text-base text-slate-900">
              {Math.round(currentSelectedObj.overall_score)} / 100
            </span>
          </div>
        </Card>
      </div>

      {/* ── 9. & 10. HUMAN OVERRIDE & APPROVAL HANDOFF ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 9: HUMAN DECISION CONTROL */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Sliders className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                HUMAN DECISION CONTROL
              </h3>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              ResiliNet enforces strict human-in-the-loop decision autonomy. The AI orchestrator recommends, but authorized supply chain managers hold final selection authority.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Workflow Sequence
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 flex-wrap">
                <span className="text-emerald-700">AI Recommendation</span>
                <span>→</span>
                <span className="text-sky-700">Human Review</span>
                <span>→</span>
                <span className="text-amber-700">Human Approval</span>
                <span>→</span>
                <span className="text-slate-900">Execution</span>
              </div>
            </div>

            {currentIsOverride ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>HUMAN OVERRIDE ACTIVE</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  You have selected {currentSelectedObj.id} ({currentSelectedObj.name}) instead of the AI recommendation (STR-001). This will be flagged for senior review in the Approval Center.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Aligned with AI recommendation ({topRecommendedStrategy.id}). No override active.
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            Audit Trail: User override status preserved in Workflow Context
          </div>
        </Card>

        {/* Section 10: APPROVAL HANDOFF */}
        <Card className="lg:col-span-2 p-5 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    DECISION READY FOR HUMAN REVIEW
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Selected strategy is locked and ready for formal governance authorization
                  </p>
                </div>
              </div>

              <Badge variant="healthy" size="sm" className="font-mono">
                STAGE: DECIDE → APPROVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recommended Strategy
                </span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{currentSelectedObj.id}</p>
                <p className="text-[11px] text-slate-700 truncate">{currentSelectedObj.name}</p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Decision Source
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {currentIsOverride ? 'Human Override' : 'SAP HANA AI Decision Layer'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentIsOverride ? 'Manual Selection' : 'V_ORCH_RECOMMENDATIONS'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Approval Status
                </span>
                <p className="font-bold text-amber-700 mt-0.5">PENDING HUMAN REVIEW</p>
                <p className="text-[11px] text-slate-500">Awaiting SCM Sign-Off</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Moving forward to the Approval Center allows the authorized Supply Chain Manager to review delegated financial limits (Cost Center 5104-HYD-SCM), examine step-by-step SAP ERP transactions, and approve execution dispatch.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <Link href="/approval-center">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                REVIEW & APPROVE
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={`/ai-command-center?disruptionId=${encodeURIComponent(disruptionId)}`}>
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs">
                  <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                  VIEW AI COMMAND CENTER
                </Button>
              </Link>

              <Link href="/what-if-simulator">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs">
                  <Sliders className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                  What-If Simulator
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 11. EXECUTION BOUNDARY ────────────────────────────────── */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Governance Boundary: Strategy Selection ≠ Approval · Approval ≠ Execution
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecting a strategy here locks the recommendation into the session context. Operational execution commands are only dispatched after explicit sign-off in the Approval Center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase">HANA Pipeline:</span>
            <span className="font-mono font-bold text-slate-800 text-[11px]">EXE-1001</span>
            <span className="h-2.5 w-px bg-slate-200" />
            <Badge variant="healthy" size="sm" dot pulse>
              IN_PROGRESS
            </Badge>
          </div>
        </div>
      </Card>

      {/* ── HUMAN OVERRIDE MODAL ──────────────────────────────────── */}
      {pendingOverrideStrategy && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="override-modal-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-amber-500 text-white px-5 py-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0 text-amber-100" />
              <div>
                <h3 id="override-modal-title" className="text-base font-bold">
                  Human Override Confirmation
                </h3>
                <p className="text-xs text-amber-100">
                  You are selecting a strategy different from the AI recommendation.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Strategy Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* AI Recommended Strategy */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    AI RECOMMENDATION
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{topRecommendedStrategy.name}</p>
                  <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                    <p>⏱ {topRecommendedStrategy.transit_hours}h Transit ({topRecommendedStrategy.recovery_time_days} Day)</p>
                    <p>💰 {formatCostLabel(topRecommendedStrategy.cost_inr)} Cost</p>
                    <p>🛡 {formatCostLabel(topRecommendedStrategy.revenue_protected_inr)} Protected</p>
                    <p>⭐ Score: {Math.round(topRecommendedStrategy.overall_score)}</p>
                  </div>
                </div>

                {/* Human Selected Strategy */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    YOUR SELECTION
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{pendingOverrideStrategy.name}</p>
                  <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                    <p>
                      ⏱ {pendingOverrideStrategy.transit_hours}h Transit ({pendingOverrideStrategy.recovery_time_days} Day
                      {pendingOverrideStrategy.recovery_time_days > 1 ? 's' : ''})
                    </p>
                    <p>💰 {formatCostLabel(pendingOverrideStrategy.cost_inr)} Cost</p>
                    <p>🛡 {formatCostLabel(pendingOverrideStrategy.revenue_protected_inr)} Protected</p>
                    <p>⭐ Score: {Math.round(pendingOverrideStrategy.overall_score)}</p>
                  </div>
                </div>
              </div>

              {/* Warning Callout */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Decision Variance Impact</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Selecting this option will label the plan as <strong>HUMAN OVERRIDE</strong>. This will require special acknowledgment in the Approval Center:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] font-medium pl-1">
                  <li>
                    Recovery Lead Time: {pendingOverrideStrategy.transit_hours}h ({pendingOverrideStrategy.recovery_time_days} days) vs{' '}
                    {topRecommendedStrategy.transit_hours}h ({topRecommendedStrategy.recovery_time_days} day)
                  </li>
                  <li>
                    Cost: {formatCostLabel(pendingOverrideStrategy.cost_inr)} vs{' '}
                    {formatCostLabel(topRecommendedStrategy.cost_inr)}
                  </li>
                  <li>
                    Operational Risk: {pendingOverrideStrategy.risk_level} vs {topRecommendedStrategy.risk_level}
                  </li>
                </ul>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                  The authorized human approver holds final decision authority.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingOverrideStrategy(null)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
              >
                Go Back
              </Button>
              <Button
                size="sm"
                onClick={() => confirmSelection(pendingOverrideStrategy, true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                <span>Continue With My Choice</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Default Page Export (Wrapped in EnterpriseShell & Suspense) ─────────────

export default function RecoveryStrategiesPage() {
  return (
    <EnterpriseShell>
      <Suspense fallback={<RecoveryStrategiesSkeleton />}>
        <RecoveryStrategiesContent />
      </Suspense>
    </EnterpriseShell>
  );
}
