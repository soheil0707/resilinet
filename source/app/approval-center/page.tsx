'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { RecoveryStrategy } from '@/lib/supabase/types';
import type { HanaStrategyRanking, HanaRecommendation, HanaAIDecision } from '@/lib/hana/repository';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  MessageSquare,
  ArrowRight,
  Clock,
  IndianRupee,
  Shield,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ChevronDown,
  Sparkles,
  Lock,
  RefreshCw,
  Sliders,
  FileCheck,
  Check,
  Bot,
  AlertCircle,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

// ─── Canonical Strategy Reference Data ───────────────────────────────────────

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
    orchestrator_score: 82.30,
    risk_level: 'LOW',
    is_recommended: true,
    revenue_protected_inr: 2420000,
    description: 'Multi-modal transit via road express + priority air dispatch buffer. 18 hours transit time.',
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

const AGENT_CONSENSUS = [
  {
    agent: 'Procurement',
    confidence: 87,
    vote: 'Combined Recovery',
    note: 'Evaluated supplier response window; endorses multi-modal sourcing to prevent buffer starvation.',
  },
  {
    agent: 'Inventory',
    confidence: 94,
    vote: 'Combined Recovery',
    note: 'Confirmed stock buffer availability and logistics readiness across PL-01 and transit hubs.',
  },
  {
    agent: 'Production',
    confidence: 91,
    vote: 'Combined Recovery',
    note: 'Aligned shift schedules at PL-01 Hyderabad to accommodate the 18-hour turnaround window.',
  },
  {
    agent: 'Logistics',
    confidence: 89,
    vote: 'Combined Recovery',
    note: 'Carrier capacity and lane-haul routing secured within projected ₹1.85L cost boundary.',
  },
  {
    agent: 'Finance',
    confidence: 96,
    vote: 'Combined Recovery',
    note: '12.1x projected return on capital; protects ₹24.2L in high-margin vehicle deliveries.',
  },
  {
    agent: 'Customer Impact',
    confidence: 93,
    vote: 'Combined Recovery',
    note: 'Preserves primary OEM Tier-1 SLA fulfillment commitments for 20 fleet vehicle orders.',
  },
];

const GOVERNANCE_POINTS = [
  'Human verification is mandatory. Autonomous execution is disabled.',
  'This approval constitutes a formal digital sign-off under Astra Motors SCM Policy 4.2.',
  'All SAP actions executed post-approval are tagged as SIMULATED for this demonstration.',
  'Approval is logged in the audit trail with timestamp, role, and justification.',
];

function formatCostLabel(costNum: number): string {
  if (costNum >= 100000) {
    return `₹${(costNum / 100000).toFixed(2)}L`;
  }
  return `₹${costNum.toLocaleString('en-IN')}`;
}

// ─── Loading Skeleton Component ──────────────────────────────────────────────

function ApprovalCenterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading Approval Center">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-14 bg-slate-100 rounded-xl" />
      <div className="h-28 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-slate-100 rounded-xl" />
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Content Component (Consumes useSearchParams inside Suspense) ──────

function ApprovalCenterContent() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const {
    approvedStrategy,
    selectedStrategy,
    isOverride,
    setApprovedStrategy,
    setSelectedStrategy,
    setWorkflowState,
    workflowState,
  } = useWorkflow();

  const [hanaRankings, setHanaRankings] = useState<HanaStrategyRanking[] | null>(null);
  const [hanaRecommendations, setHanaRecommendations] = useState<HanaRecommendation[] | null>(null);
  const [hanaAiDecisions, setHanaAiDecisions] = useState<HanaAIDecision[] | null>(null);
  const [dataSource, setDataSource] = useState<'sap-hana' | 'fallback'>('sap-hana');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Decision & State
  const [decision, setDecision] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES'>(() =>
    workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED'
      ? 'APPROVED'
      : 'PENDING'
  );
  const [comment, setComment] = useState<string>('');
  const [approvedAt, setApprovedAt] = useState<string>(() =>
    workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED'
      ? new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : ''
  );

  // Strategy picker state
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [candidateStrategyId, setCandidateStrategyId] = useState<string>(
    approvedStrategy?.id || selectedStrategy?.id || 'STR-001'
  );

  // Confirmation modal state
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(true);

  // Sync state if workflow changes externally
  useEffect(() => {
    if (workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED') {
      setDecision('APPROVED');
    }
  }, [workflowState]);

  useEffect(() => {
    if (approvedStrategy?.id) {
      setCandidateStrategyId(approvedStrategy.id);
    } else if (selectedStrategy?.id) {
      setCandidateStrategyId(selectedStrategy.id);
    }
  }, [approvedStrategy, selectedStrategy]);

  // Fetch live HANA data
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
      console.warn('SAP HANA recovery strategies query fallback in Approval Center:', err);
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

  // Harmonized strategies list
  const strategies = useMemo<CanonicalStrategy[]>(() => {
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

        return {
          id: r.STRATEGY_ID,
          name: r.STRATEGY_NAME,
          strategy_type: (r.STRATEGY_TYPE as any) || 'COMBINED',
          transport_mode: r.TRANSPORT_MODE || 'MULTI-MODAL + AIR',
          cost_inr: costNum,
          costFormatted: formatCostLabel(costNum),
          transit_hours: transitHours,
          recovery_time_days: days,
          recovery_score: recScore,
          orchestrator_score: orchScore,
          risk_level: riskLevel,
          is_recommended: isRec,
          revenue_protected_inr: revProtected,
          description: `${r.STRATEGY_TYPE || 'Combined'} mode via ${r.TRANSPORT_MODE} • Transit: ${transitHours}h • Score: ${recScore.toFixed(1)}`,
        };
      });
    }

    return CANONICAL_STRATEGIES;
  }, [dataSource, hanaRankings, hanaRecommendations]);

  // AI Recommended Strategy (STR-001)
  const aiRecommendedStrategy = useMemo(() => {
    return strategies.find((s) => s.is_recommended || s.id === 'STR-001') || strategies[0];
  }, [strategies]);

  // Current Human Selected Candidate Strategy
  const selectedCandidateStrategy = useMemo(() => {
    return strategies.find((s) => s.id === candidateStrategyId) || aiRecommendedStrategy;
  }, [strategies, candidateStrategyId, aiRecommendedStrategy]);

  // Is candidate an override?
  const isCandidateOverride =
    selectedCandidateStrategy.id !== 'STR-001' && !selectedCandidateStrategy.is_recommended;

  // Live AI reasoning
  const currentAiDecision = useMemo(() => {
    return hanaAiDecisions && hanaAiDecisions.length > 0 ? hanaAiDecisions[0] : null;
  }, [hanaAiDecisions]);

  // Handlers
  const handleSelectDifferentStrategy = (stratId: string) => {
    setCandidateStrategyId(stratId);
    setIsPickerOpen(false);
  };

  const handleOpenConfirmModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmApproval = () => {
    const ts = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    setApprovedAt(ts);
    setDecision('APPROVED');

    // Convert candidate to RecoveryStrategy shape for workflow context
    const fullStrat: RecoveryStrategy = {
      id: selectedCandidateStrategy.id,
      disruption_id: disruptionId,
      name: selectedCandidateStrategy.name,
      strategy_type: selectedCandidateStrategy.strategy_type,
      cost_inr: selectedCandidateStrategy.cost_inr,
      recovery_time_days: selectedCandidateStrategy.recovery_time_days,
      revenue_protected_inr: selectedCandidateStrategy.revenue_protected_inr,
      risk_level: selectedCandidateStrategy.risk_level,
      overall_score: selectedCandidateStrategy.recovery_score,
      is_recommended: selectedCandidateStrategy.id === 'STR-001' || selectedCandidateStrategy.is_recommended,
      description: selectedCandidateStrategy.description,
    };

    setApprovedStrategy(fullStrat, isCandidateOverride);
    setSelectedStrategy(fullStrat, isCandidateOverride);
    setWorkflowState('APPROVED');
    setIsConfirmationModalOpen(false);
  };

  const handleReject = () => {
    setDecision('REJECTED');
    setWorkflowState('CRISIS_ACTIVE');
  };

  const handleRequestChanges = () => {
    setDecision('CHANGES');
  };

  const handleResetToPending = () => {
    setDecision('PENDING');
  };

  if (isLoading) {
    return <ApprovalCenterSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. ENTERPRISE PAGE HEADER ─────────────────────────────── */}
      <PageHeader
        icon={<CheckSquare className="w-5 h-5 text-sky-700" />}
        title="APPROVAL CENTER"
        description="Human governance and authorization for AI-generated recovery decisions."
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

            <Link href="/ai-command-center">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                AI Command Center
              </Button>
            </Link>

            <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                View Recovery Strategies
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. LIFECYCLE STEPPER ──────────────────────────────────── */}
      <LifecycleStepper currentStage="APPROVE" incidentId={disruptionId} />

      {/* ── 3. CRISIS CONTEXT PANEL ───────────────────────────────── */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
        role="region"
        aria-label="Incident Context"
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
            <span className="font-mono font-bold text-slate-900">48h</span>
          </div>

          <Badge variant="critical" size="sm" dot pulse>
            ACTIVE
          </Badge>
        </div>
      </div>

      {/* ── 4. APPROVAL STATUS BANNER ──────────────────────────────── */}
      {decision === 'PENDING' && (
        <Card className="border-2 border-amber-400 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                    PENDING HUMAN APPROVAL
                  </h3>
                  <Badge variant="warning" size="sm" dot>
                    AUTHORIZATION REQUIRED
                  </Badge>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed max-w-3xl">
                  The AI orchestration layer has generated a recovery recommendation. Operational execution requires explicit human authorization. The AI system does not approve its own decisions.
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenConfirmModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              AUTHORIZE DECISION
            </Button>
          </div>
        </Card>
      )}

      {decision === 'APPROVED' && (
        <Card className="border-2 border-emerald-500 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    FORMALLY AUTHORIZED BY HUMAN SCM
                  </h3>
                  <Badge variant="healthy" size="sm" dot>
                    APPROVED
                  </Badge>
                  {isCandidateOverride && (
                    <Badge variant="warning" size="sm">
                      HUMAN OVERRIDE
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed max-w-3xl">
                  Strategy <strong className="font-mono">{selectedCandidateStrategy.id}</strong> ({selectedCandidateStrategy.name}) has been authorized at <strong>{approvedAt}</strong>. Operational execution pipeline <strong className="font-mono">EXE-1001</strong> is armed and ready for dispatch.
                </p>
              </div>
            </div>

            <Link href={`/recovery-execution?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto">
                <span>Continue to Recovery Execution</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {decision === 'REJECTED' && (
        <Card className="border-2 border-red-400 bg-red-50/40 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-red-950 uppercase tracking-wider">
                    STRATEGY REJECTED — WORKFLOW HALTED
                  </h3>
                  <Badge variant="critical" size="sm">
                    REJECTED
                  </Badge>
                </div>
                <p className="text-xs text-red-900 leading-relaxed max-w-3xl">
                  Recovery execution is blocked by Supply Chain Management sign-off denial. Autonomous dispatch has been suspended. Reconsider strategy or return to analysis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToPending}
                className="border-red-300 text-red-700 hover:bg-red-100 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reconsider
              </Button>
              <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`}>
                <Button size="sm" className="bg-slate-900 text-white text-xs">
                  Return to Strategies
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {decision === 'CHANGES' && (
        <Card className="border-2 border-amber-400 bg-amber-50/50 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                CHANGES REQUESTED BY SCM
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Provide notes on operational or budgetary adjustments required before final sign-off.
              </p>
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Specify required operational constraints (e.g. max transit window 14h, cap budget at ₹1.5L)..."
            className="w-full border border-amber-300 rounded-lg p-3 text-xs text-slate-800 bg-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToPending}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
            >
              Cancel Request
            </Button>

            <Link href="/what-if-simulator">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                Simulate Scenario in What-If Simulator
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── 5. AI RECOMMENDATION CARD ──────────────────────────────── */}
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
                    AI RECOMMENDATION
                  </CardTitle>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                    {aiRecommendedStrategy.id}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Source: SAP HANA Cloud Decision Layer (V_ORCH_RECOMMENDATIONS)
                </p>
              </div>
            </div>

            <Badge variant="healthy" size="md" className="font-mono text-xs font-bold self-start sm:self-auto">
              AI RECOMMENDED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {aiRecommendedStrategy.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {aiRecommendedStrategy.description}
            </p>
          </div>

          {/* Canonical Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recovery Score
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {Math.round(aiRecommendedStrategy.recovery_score)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </p>
              <p className="text-[10px] text-slate-500">Tier-1 Optimal</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Orchestrator Score
              </span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                {aiRecommendedStrategy.orchestrator_score.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">Weighted Total</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cost
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatCostLabel(aiRecommendedStrategy.cost_inr)}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium">Under ₹5L budget</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transit
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {aiRecommendedStrategy.transit_hours}h
              </p>
              <p className="text-[10px] text-slate-500">Fastest buffer turnaround</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Risk
              </span>
              <div className="mt-1">
                <Badge variant="healthy" size="sm">
                  {aiRecommendedStrategy.risk_level}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Dual-mode resilience</p>
            </div>

            <div className="bg-white rounded-lg border border-emerald-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transport
              </span>
              <p className="text-xs font-bold font-mono text-slate-800 mt-1 truncate">
                {aiRecommendedStrategy.transport_mode}
              </p>
              <p className="text-[10px] text-slate-500">Road + Air Charter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. AI REASONING ("WHY THIS DECISION?") ─────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              WHY THIS DECISION? (AI REASONING)
            </h3>
          </div>

          <button
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
            aria-expanded={isWhyExpanded}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`} />
            {isWhyExpanded ? 'Collapse Evidence' : 'Expand Evidence'}
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
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Supporting evidence grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recovery Performance
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  Recovery Score: {Math.round(aiRecommendedStrategy.recovery_score)} / 100
                </p>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Orchestrator weighted score of {aiRecommendedStrategy.orchestrator_score.toFixed(2)} leads all available options.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transit Compliance
                </span>
                <p className="text-xs font-semibold text-slate-800">{aiRecommendedStrategy.transit_hours}h Transit Time</p>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Well within the 48-hour buffer window, preventing assembly line starvation at PL-01.
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
                <p className="text-xs font-semibold text-slate-800">Zero OEM Penalties</p>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Secures fulfillment for 20 fleet vehicle contract milestones within the critical 3-day window.
                </p>
              </div>
            </div>

            {/* AI Agent Consensus Breakdown */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Multi-Agent Consensus Endorsement (6 Specialized Subagents)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {AGENT_CONSENSUS.map((ag) => (
                  <div key={ag.agent} className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{ag.agent} Agent</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {ag.confidence}% conf.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ag.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── 7. APPROVAL DECISION WORKSPACE ─────────────────────────── */}
      <Card className="p-5 border-2 border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              HUMAN DECISION WORKSPACE
            </h3>
            <p className="text-xs text-slate-500">
              Review AI recommendation against candidate selection. Final execution authorization rests with human leadership.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            {decision === 'APPROVED' ? (
              <Badge variant="healthy" size="sm">
                APPROVED
              </Badge>
            ) : decision === 'REJECTED' ? (
              <Badge variant="critical" size="sm">
                REJECTED
              </Badge>
            ) : decision === 'CHANGES' ? (
              <Badge variant="warning" size="sm">
                CHANGES REQUESTED
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                PENDING REVIEW
              </Badge>
            )}
          </div>
        </div>

        {/* Comparison: AI Recommendation vs Human Selected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* AI Recommendation Column */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                1. AI RECOMMENDATION
              </span>
              <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                STR-001
              </Badge>
            </div>
            <p className="font-bold text-slate-900 text-sm">{aiRecommendedStrategy.name}</p>
            <p className="text-xs text-slate-600">{aiRecommendedStrategy.description}</p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-700">
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="text-[9px] text-slate-400 block font-sans">Cost</span>
                {aiRecommendedStrategy.costFormatted}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="text-[9px] text-slate-400 block font-sans">Transit</span>
                {aiRecommendedStrategy.transit_hours}h
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="text-[9px] text-slate-400 block font-sans">Score</span>
                {Math.round(aiRecommendedStrategy.recovery_score)} / 100
              </div>
            </div>
          </div>

          {/* Human Selected Candidate Column */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isCandidateOverride
                ? 'border-amber-300 bg-amber-50/30'
                : 'border-sky-200 bg-sky-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isCandidateOverride ? 'text-amber-800' : 'text-sky-800'
                }`}
              >
                2. HUMAN SELECTION
              </span>
              {isCandidateOverride ? (
                <Badge variant="warning" size="sm" className="font-mono text-[9px]">
                  ⚠ HUMAN OVERRIDE
                </Badge>
              ) : (
                <Badge variant="info" size="sm" className="font-mono text-[9px]">
                  AI RECOMMENDATION ACCEPTED
                </Badge>
              )}
            </div>
            <p className="font-bold text-slate-900 text-sm">{selectedCandidateStrategy.name}</p>
            <p className="text-xs text-slate-600">{selectedCandidateStrategy.description}</p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-700">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Cost</span>
                {selectedCandidateStrategy.costFormatted}
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Transit</span>
                {selectedCandidateStrategy.transit_hours}h
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Score</span>
                {Math.round(selectedCandidateStrategy.recovery_score)} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Picker Dropdown / Drawer */}
        {isPickerOpen && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Alternative Strategy from SAP HANA Catalogue (5 Strategies Available)
              </span>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Close Picker
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {strategies.map((strat) => {
                const isStratRec = strat.id === 'STR-001' || strat.is_recommended;
                const isStratSelected = strat.id === candidateStrategyId;

                return (
                  <div
                    key={strat.id}
                    onClick={() => handleSelectDifferentStrategy(strat.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-xs space-y-2 ${
                      isStratSelected
                        ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-300'
                        : isStratRec
                        ? 'border-emerald-300 bg-white hover:border-emerald-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{strat.id}</span>
                      {isStratRec ? (
                        <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                          AI RECOMMENDED
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="font-mono text-[9px]">
                          HUMAN CHOICE
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{strat.name}</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                      <span>{strat.costFormatted}</span>
                      <span>{strat.transit_hours}h</span>
                      <span className="font-bold text-slate-800">{Math.round(strat.recovery_score)} / 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Human Action Controls */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleOpenConfirmModal}
              disabled={decision === 'APPROVED'}
              className={`text-xs font-bold ${
                decision === 'APPROVED'
                  ? 'bg-emerald-700 text-white cursor-not-allowed opacity-90'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {decision === 'APPROVED' ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  APPROVED FOR EXECUTION
                </>
              ) : isCandidateOverride ? (
                <>
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  APPROVE HUMAN OVERRIDE ({selectedCandidateStrategy.id})
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  APPROVE RECOMMENDATION (STR-001)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {isPickerOpen ? 'Hide Alternative Strategies' : 'Choose Different Strategy'}
            </Button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {decision !== 'APPROVED' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestChanges}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Request Changes
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── 10. & 11. EXECUTION BOUNDARY & AUDIT SUMMARY ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 10: EXECUTION BOUNDARY */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  GOVERNANCE & EXECUTION BOUNDARY
                </h3>
              </div>
              <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                3-STAGE PIPELINE
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              ResiliNet strictly enforces separation of concerns across the decision-to-execution pipeline:
            </p>

            <div className="space-y-3">
              {/* Stage 1 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">AI Decision Layer</p>
                    <p className="text-[11px] text-slate-500 font-mono">SAP HANA Heuristic Ranking (V_ORCH_RECOMMENDATIONS)</p>
                  </div>
                </div>
                <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                  COMPUTED
                </Badge>
              </div>

              {/* Stage 2 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[11px]">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Human Approval Gate</p>
                    <p className="text-[11px] text-slate-500">Authorized SCM Digital Sign-off</p>
                  </div>
                </div>
                {decision === 'APPROVED' ? (
                  <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                    APPROVED
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm" className="font-mono text-[9px]">
                    PENDING SIGN-OFF
                  </Badge>
                )}
              </div>

              {/* Stage 3 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[11px]">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Execution Pipeline</p>
                    <p className="text-[11px] text-slate-500 font-mono">EXE-1001 Operational Dispatch Sequence</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-600 font-bold">EXE-1001</span>
                  <Badge variant="healthy" size="sm" dot pulse className="font-mono text-[9px]">
                    IN_PROGRESS
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
            <strong>Governance Notice:</strong> Clicking approval authorizes operational staging into ERP pipeline EXE-1001 without directly writing or mutating SAP HANA source records.
          </div>
        </Card>

        {/* Section 11: APPROVAL AUDIT SUMMARY */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  APPROVAL AUDIT SUMMARY
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Policy Ref: Astra SCM 4.2</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Incident:</span>
                <span className="font-mono font-bold text-slate-900">{disruptionId} (Supplier Delay)</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">AI Recommendation:</span>
                <span className="font-mono font-semibold text-emerald-800">
                  {aiRecommendedStrategy.id} ({aiRecommendedStrategy.name.split(' ')[0]})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Human Decision:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedCandidateStrategy.id} ({selectedCandidateStrategy.name.split(' ')[0]})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Decision Type:</span>
                <span className="font-medium text-slate-800">
                  {isCandidateOverride ? (
                    <span className="text-amber-800 font-bold">Human Override Active</span>
                  ) : (
                    <span className="text-emerald-800 font-bold">AI Recommendation Accepted</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Approval Status:</span>
                <span>
                  {decision === 'APPROVED' ? (
                    <Badge variant="healthy" size="sm" className="font-mono">
                      APPROVED
                    </Badge>
                  ) : decision === 'REJECTED' ? (
                    <Badge variant="critical" size="sm" className="font-mono">
                      REJECTED
                    </Badge>
                  ) : decision === 'CHANGES' ? (
                    <Badge variant="warning" size="sm" className="font-mono">
                      CHANGES REQUESTED
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm" className="font-mono">
                      PENDING HUMAN REVIEW
                    </Badge>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Execution Reference:</span>
                <span className="font-mono font-bold text-slate-900">EXE-1001 — IN_PROGRESS</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Sign-off Authority:</span>
                <span className="text-slate-800 font-medium">SCM Directorate (Cost Center 5104-HYD-SCM)</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Approval Timestamp:</span>
                <span className="font-mono text-slate-800">
                  {approvedAt || <span className="text-slate-400 italic">Pending formal sign-off</span>}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Logged in Resilience Memory</span>
            <span className="font-mono text-[10px]">Audit ID: AUD-1001-APP</span>
          </div>
        </Card>
      </div>

      {/* ── 12. GOVERNANCE INFORMATION PANEL ──────────────────────── */}
      <Card className="p-4 bg-slate-50 border border-slate-300">
        <div className="flex items-start gap-2.5 mb-2.5">
          <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              ENTERPRISE GOVERNANCE & SCM COMPLIANCE NOTICE
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Core Architecture Principle: <strong>AI recommends. Human approves. Operations execute.</strong>
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200">
          {GOVERNANCE_POINTS.map((pt, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">›</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── 13. NAVIGATION ACTIONS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <Link href="/ai-command-center" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              BACK TO AI COMMAND CENTER
            </Button>
          </Link>

          <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              VIEW RECOVERY STRATEGIES
            </Button>
          </Link>
        </div>

        <Link href={`/recovery-execution?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
          <Button
            size="sm"
            className={`w-full sm:w-auto text-xs font-bold ${
              decision === 'APPROVED'
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span>CONTINUE TO RECOVERY EXECUTION</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* ── 8. APPROVAL CONFIRMATION MODAL ────────────────────────── */}
      {isConfirmationModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-modal-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
              <div>
                <h3 id="approval-modal-title" className="text-base font-bold">
                  CONFIRM HUMAN APPROVAL
                </h3>
                <p className="text-xs text-slate-300">
                  Authorized digital sign-off for operational recovery dispatch.
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Incident:</span>
                  <span className="font-bold text-slate-900">{disruptionId} (Supplier Delay)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Strategy:</span>
                  <span className="font-bold text-slate-900">
                    {selectedCandidateStrategy.id} — {selectedCandidateStrategy.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Decision source:</span>
                  <span className="font-bold text-slate-800 font-sans">Human approval</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">AI recommendation:</span>
                  <span className="font-semibold text-emerald-800">STR-001 (Combined Recovery)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Human override:</span>
                  <span className="font-bold">
                    {isCandidateOverride ? (
                      <span className="text-amber-700">YES (Manual Alternative)</span>
                    ) : (
                      <span className="text-emerald-700">NO (AI Recommended)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Information Notice */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Operational Governance Confirmation</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Approval authorizes the selected recovery strategy for the next operational stage. It does not itself represent completion of recovery. Execution commands will be staged into pipeline EXE-1001.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmationModalOpen(false)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
              >
                CANCEL
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApproval}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                CONFIRM APPROVAL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Default Page Export (Wrapped in EnterpriseShell & Suspense) ─────────────

export default function ApprovalCenterPage() {
  return (
    <EnterpriseShell>
      <Suspense fallback={<ApprovalCenterSkeleton />}>
        <ApprovalCenterContent />
      </Suspense>
    </EnterpriseShell>
  );
}
