'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { getResilienceMemory } from '@/lib/data/repository';
import type { ResilienceMemoryItem } from '@/lib/supabase/types';
import type { HanaRecoveryExecution } from '@/lib/hana/repository';
import {
  Database,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Server,
  Layers,
  Shield,
  Activity,
  Search,
  Bot,
  Clock,
  IndianRupee,
  Sliders,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
  CheckSquare,
} from 'lucide-react';

// ─── Canonical Strategy Reference Data ───────────────────────────────────────

const CANONICAL_STRATEGY = {
  id: 'STR-001',
  name: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
  recovery_score: 94.0,
  orchestrator_score: 82.30,
  cost_inr: 185000,
  costFormatted: '₹1.85L',
  transit_hours: 18,
  risk_level: 'LOW' as const,
  transport_mode: 'MULTI-MODAL + AIR',
  revenue_protected_inr: 2420000,
  revenueFormatted: '₹24.2L',
  description: 'Multi-modal transit via road express + priority air dispatch buffer. 18 hours transit time.',
};

const SYSTEM_LEARNING_DIMENSIONS = [
  {
    dimension: 'Disruption Pattern',
    observation: 'Single-source bottleneck at Jamshedpur (S-104) halted M-101 Steering Assemblies with 2.4 days buffer inventory at PL-01.',
    implication: 'Immediate buffer exhaustion window requires rapid multi-modal dispatch rather than single-lane standard freight.',
  },
  {
    dimension: 'Decision Pattern',
    observation: 'Dual-modal transfer (air charter + road express) scored 94.0 vs 86.0 for single alternate supplier and 78.0 for standard STO.',
    implication: 'Slightly higher logistics cost (₹1.85L vs ₹0.95L) yields massive net ROI (12.1x) by preserving ₹24.2L in OEM deliveries.',
  },
  {
    dimension: 'Recovery Pattern',
    observation: 'Priority air buffer leg guarantees 18-hour line-side delivery, keeping downtime well under the 48-hour critical starvation mark.',
    implication: 'Prevents shutdown across 17 active assembly lines and preserves zero OEM Tier-1 penalty status.',
  },
  {
    dimension: 'Operational Constraint',
    observation: 'Inter-plant STO transfers and charter flights require pre-delegated sign-off thresholds to eliminate approval latency.',
    implication: 'Cost center 5104-HYD-SCM delegation enables sub-hour authorization for emergencies under ₹5.0L.',
  },
  {
    dimension: 'Risk Signal',
    observation: 'EDI 856 ASN cancellation from S-104 served as early trigger before physical stock-out occurred.',
    implication: 'Automated early warning ingestion provides 2.4 days of reaction buffer rather than emergency line-stop firefighting.',
  },
];

const INSTITUTIONAL_PLAYBOOKS = [
  'Dual-modal logistics (air + road express) reliably beats single-mode strategies when inventory buffers are below 3 days.',
  'Inter-plant STO authorization should be pre-delegated to SCM level to reduce approval latency by 4–6 hours.',
  'Pre-qualified alternate vendors (like Bharat Precision) must be maintained in SAP AVL with up-to-date capacity confirmations for T+7 emergency activation.',
  'Tier-1 OEM SLA penalty clauses require a 3-day early warning trigger, not the standard 5-day buffer.',
  'Combined Recovery strategies consistently score 8–12 points higher than single-mode solutions when customer SLA constraints are active.',
];

function formatInr(val: number): string {
  return `₹${(val / 100000).toFixed(1)}L`;
}

// ─── Loading Skeleton Component ──────────────────────────────────────────────

function ResilienceMemorySkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading Resilience Memory">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-44 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Content Component (Consumes useSearchParams inside Suspense) ──────

function ResilienceMemoryContent() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const {
    workflowState,
    approvedStrategy,
    selectedStrategy,
    isOverride,
    resilienceRecords,
    executionSteps,
    resetCrisisWorkflow,
  } = useWorkflow();

  const [memoryItems, setMemoryItems] = useState<ResilienceMemoryItem[]>([]);
  const [hanaExecution, setHanaExecution] = useState<HanaRecoveryExecution | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('fallback');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'DELAY' | 'CAPACITY'>('ALL');

  const isLocalWorkflowRecovered = workflowState === 'RECOVERED';
  const activeStrategy = approvedStrategy || selectedStrategy || null;
  const isCandidateOverride = isOverride || (activeStrategy ? activeStrategy.id !== 'STR-001' : false);

  // Load Supabase resilience memory and live HANA execution state
  const loadData = useCallback(async () => {
    try {
      // 1. Load memory items from Supabase (or demo fallback repository)
      const memoryData = await getResilienceMemory();
      setMemoryItems(memoryData || []);

      // 2. Fetch live execution record from SAP HANA Cloud
      const res = await fetch('/api/hana/recovery-execution');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const match = json.data.find(
            (e: HanaRecoveryExecution) => e.DISRUPTION_ID === disruptionId
          );
          if (match) {
            setHanaExecution(match);
            setDataSource('live');
            return;
          }
        }
      }
      setDataSource('fallback');
    } catch (err) {
      console.warn('Failed to load resilience memory data, using fallback:', err);
      setDataSource('fallback');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [disruptionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  // Filtered memory list
  const filteredMemoryItems = useMemo(() => {
    return memoryItems.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.crisis_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.selected_strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.root_cause.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === 'ALL' ||
        (selectedFilter === 'DELAY' && item.crisis_title.toLowerCase().includes('delay')) ||
        (selectedFilter === 'CAPACITY' && item.root_cause.toLowerCase().includes('shortage'));

      return matchesSearch && matchesFilter;
    });
  }, [memoryItems, searchQuery, selectedFilter]);

  if (isLoading) {
    return <ResilienceMemorySkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. ENTERPRISE PAGE HEADER ─────────────────────────────── */}
      <PageHeader
        icon={<Database className="w-5 h-5 text-sky-700" />}
        title="RESILIENCE MEMORY"
        description="Institutional learning from disruption decisions, recovery outcomes, and operational experience."
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {disruptionId}
            </span>
            <LiveDataBadge isLive={dataSource === 'live'} />
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

            <Link href={`/recovery-execution?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                Back to Recovery Execution
              </Button>
            </Link>

            <Link href={`/crisis-analysis?disruptionId=${encodeURIComponent(disruptionId)}`}>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                View Crisis Analysis
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. LIFECYCLE / LEARNING POSITION ──────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resilience Lifecycle
          </span>
          <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            {disruptionId}
          </span>
          <Badge variant="healthy" size="sm" className="font-mono text-[10px]">
            POST-EXECUTION LEARNING
          </Badge>
        </div>

        {/* 6-Stage Visual Stepper Flow */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 md:justify-end text-xs font-semibold">
          {['MONITOR', 'ANALYZE', 'DECIDE', 'APPROVE', 'EXECUTE'].map((stage) => (
            <React.Fragment key={stage}>
              <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                <Check className="w-3 h-3 text-emerald-600" />
                {stage}
              </span>
              <span className="text-slate-300">→</span>
            </React.Fragment>
          ))}
          <span className="flex items-center gap-1.5 text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-300 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            LEARN — CURRENT
          </span>
        </div>
      </div>

      {/* ── 3. PRIMARY INCIDENT MEMORY CARD ───────────────────────── */}
      <Card className="border-2 border-slate-300 bg-white overflow-hidden shadow-xs">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-3.5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-900 text-white shrink-0">
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    PRIMARY INCIDENT MEMORY RECORD
                  </CardTitle>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    DIS-1001
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Institutional record of supplier delay event at Global Metals Ltd (S-104)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="critical" size="sm">
                SEVERITY: HIGH
              </Badge>
              <Badge
                variant={hanaExecution?.EXECUTION_STATUS === 'COMPLETED' ? 'healthy' : 'info'}
                size="sm"
                dot={hanaExecution?.EXECUTION_STATUS !== 'COMPLETED'}
                pulse={hanaExecution?.EXECUTION_STATUS !== 'COMPLETED'}
              >
                LIVE HANA: {hanaExecution?.EXECUTION_STATUS || 'IN_PROGRESS'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Disruption
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">DIS-1001</p>
              <p className="text-[10px] text-slate-500">Supplier Delay</p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Location
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">East India</p>
              <p className="text-[10px] text-slate-500">Jamshedpur S-104</p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Affected Plant
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">PLANT-001</p>
              <p className="text-[10px] text-slate-500">Hyderabad Assembly</p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Expected Duration
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">48h</p>
              <p className="text-[10px] text-slate-500">Buffer Threshold</p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Executing Strategy
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">STR-001</p>
              <p className="text-[10px] text-slate-500 truncate">Combined Recovery</p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                HANA Execution
              </span>
              <p className="text-sm font-bold font-mono text-sky-800 mt-0.5">
                {hanaExecution?.EXECUTION_ID || 'EXE-1001'}
              </p>
              <p className={`text-[10px] font-semibold ${
                hanaExecution?.EXECUTION_STATUS === 'COMPLETED' ? 'text-emerald-700' : 'text-sky-700'
              }`}>
                {hanaExecution?.EXECUTION_STATUS || 'IN_PROGRESS'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-200 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <strong>State Boundary:</strong> SAP HANA operational execution state:{' '}
              <strong className="font-mono text-slate-900">{hanaExecution?.EXECUTION_STATUS || 'IN_PROGRESS'}</strong>
              {hanaExecution?.ACTUAL_COMPLETION ? ` (Actual Completion: ${hanaExecution.ACTUAL_COMPLETION})` : ''}.
              Institutional memory tracks historical learnings and cannot override operational execution state.
            </span>
            <span className="font-mono text-[10px] text-slate-500">Source: ORCH_RECOVERY_EXECUTION</span>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. RECOVERY DECISION MEMORY ───────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              RECOVERY DECISION MEMORY (STR-001)
            </h3>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Decision Layer: SAP HANA Cloud</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Strategy Specifications */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                AI Recommendation
              </span>
              <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                {CANONICAL_STRATEGY.id}
              </Badge>
            </div>
            <p className="font-bold text-slate-900 text-sm">{CANONICAL_STRATEGY.name}</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">{CANONICAL_STRATEGY.description}</p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Cost</span>
                {CANONICAL_STRATEGY.costFormatted}
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Transit</span>
                {CANONICAL_STRATEGY.transit_hours}h
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">Score</span>
                {Math.round(CANONICAL_STRATEGY.recovery_score)} / 100
              </div>
            </div>
          </div>

          {/* Governance & Human Authorization Memory */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Governance & Authorization State
            </span>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Orchestrator Weighted Score:</span>
                <span className="font-bold text-slate-800">{CANONICAL_STRATEGY.orchestrator_score.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Human Approval State:</span>
                <span>
                  {workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED' ? (
                    <Badge variant="healthy" size="sm">
                      AUTHORIZED
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      AWAITING SIGN-OFF
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Human Override Status:</span>
                <span>
                  {isCandidateOverride ? (
                    <span className="font-bold text-amber-700">HUMAN OVERRIDE ACTIVE</span>
                  ) : (
                    <span className="font-bold text-emerald-700">ALIGNED WITH AI RECOMMENDATION</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Transport Redundancy:</span>
                <span className="font-bold text-slate-900">{CANONICAL_STRATEGY.transport_mode}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 5. WHAT THE SYSTEM LEARNED ────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              WHAT THE SYSTEM LEARNED (INSTITUTIONAL OBSERVATIONS)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">5 Learning Vectors Captured</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_LEARNING_DIMENSIONS.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                {item.dimension}
              </span>
              <p className="font-semibold text-slate-800 leading-snug">{item.observation}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/80">
                <strong>Operational Implication:</strong> {item.implication}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 6. RECOVERY OUTCOME & SIMULATION ───────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              RECOVERY OUTCOME STATE
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Live HANA Record:</span>
            <Badge
              variant={hanaExecution?.EXECUTION_STATUS === 'COMPLETED' ? 'healthy' : 'info'}
              size="sm"
              dot={hanaExecution?.EXECUTION_STATUS !== 'COMPLETED'}
              pulse={hanaExecution?.EXECUTION_STATUS !== 'COMPLETED'}
            >
              {hanaExecution?.EXECUTION_STATUS === 'COMPLETED' ? 'RECOVERY COMPLETED' : 'RECOVERY IN PROGRESS'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live HANA Execution Status */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Live SAP HANA Status (ORCH_RECOVERY_EXECUTION)
            </span>
            <p className="text-sm font-bold text-slate-900">
              Pipeline {hanaExecution?.EXECUTION_ID || 'EXE-1001'} — {hanaExecution?.EXECUTION_STATUS === 'COMPLETED' ? 'Fully Completed' : 'Actively In Progress'}
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {hanaExecution?.EXECUTION_STATUS === 'COMPLETED'
                ? `Recovery execution completed at ${hanaExecution.ACTUAL_COMPLETION || 'recorded timestamp'}. Operational inventory replenished at PL-01 Hyderabad.`
                : 'Started 2026-09-25 14:45. Air-freight buffer leg and road express transport are progressing within the 18-hour window. The recovery cannot be marked completed in live data until physical delivery and goods receipt are finalized at PL-01 Hyderabad.'}
            </p>
          </div>

          {/* Local Workflow Simulation State */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Local Workflow Simulation Context
              </span>
              <span className="font-mono text-[10px] text-slate-400">Client State: {workflowState}</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {isLocalWorkflowRecovered ? (
                <span className="text-emerald-700">Simulated Steps Completed (Local State)</span>
              ) : (
                <span>Action Sequence Active in Demo Console</span>
              )}
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isLocalWorkflowRecovered
                ? 'All simulated SAP ERP action steps have finished locally. This demonstrates how historical entries are ingested into organizational memory.'
                : 'Execution simulation can be stepped through on the Recovery Execution page to simulate line replenishment.'}
            </p>
          </div>
        </div>
      </Card>

      {/* ── 9. LEARNING INSIGHT CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Disruption Class', value: 'Supplier Delay', detail: 'Critical S-104 stoppage' },
          { label: 'Risk Rating', value: 'High Severity', detail: 'Immediate line starvation risk' },
          { label: 'Optimal Strategy', value: 'Combined Recovery', detail: 'STR-001 dual-modal' },
          { label: 'Logistics Mode', value: 'Road + Air Charter', detail: 'Dual-mode resilience' },
          { label: 'Turnaround Window', value: '18h Transit', detail: 'Well within 48h buffer' },
          { label: 'Risk Level', value: 'Low Risk', detail: 'Minimal operational exposure' },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs text-xs space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{c.label}</span>
            <p className="font-bold text-slate-900 leading-snug">{c.value}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{c.detail}</p>
          </div>
        ))}
      </div>

      {/* ── 7. & 8. RESILIENCE MEMORY REGISTER ─────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              INSTITUTIONAL RESILIENCE MEMORY REGISTER
            </h3>
            <p className="text-xs text-slate-500">
              Verified crisis playbooks, root causes, and recovery outcomes stored in Supabase resilience memory
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memory records..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              {(['ALL', 'DELAY', 'CAPACITY'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Memory Records List */}
        <div className="space-y-4">
          {/* New Simulated Entry if locally marked recovered */}
          {isLocalWorkflowRecovered && (
            <div className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-xs font-bold text-slate-900">MEM-2026-001</span>
                  <Badge variant="healthy" size="sm">
                    LOCAL SIMULATION ENTRY
                  </Badge>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Score: 94.0 / 100
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Global Metals Ltd. (S-104) Blast Furnace Shutdown — DIS-1001
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Material: Steering Assembly (M-101) • Plant: PL-01 Hyderabad • Root Cause: Refractory maintenance delay
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Strategy</span>
                  <span className="font-semibold text-slate-800">{activeStrategy?.name || 'Combined Recovery'}</span>
                </div>
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Lead Time</span>
                  <span className="font-mono font-semibold text-slate-800">18h (vs 7 days delay)</span>
                </div>
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Loss Avoided</span>
                  <span className="font-mono font-semibold text-emerald-700">₹24.2L</span>
                </div>
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operational Risk</span>
                  <span className="font-mono font-semibold text-slate-800">LOW</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded border border-emerald-200">
                &ldquo;Multi-modal express routing and buffer air dispatch safeguarded line continuity with zero OEM penalty activation.&rdquo;
              </p>
            </div>
          )}

          {/* Historical Supabase Records */}
          {filteredMemoryItems.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.crisis_title}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Score: {item.success_score.toFixed(1)} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Root Cause</span>
                  <span className="text-slate-800 font-medium line-clamp-1">{item.root_cause}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Strategy</span>
                  <span className="text-slate-800 font-medium line-clamp-1">{item.selected_strategy}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolution Lead Time</span>
                  <span className="font-mono font-medium text-slate-800">{item.recovery_time_days} Day(s)</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Loss Avoided</span>
                  <span className="font-mono font-bold text-emerald-700">{formatInr(item.loss_avoided_inr)}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-100">
                &ldquo;{item.outcome}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Recorded in Supabase Vector Memory</span>
                <span className="font-mono">
                  {new Date(item.recorded_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 10. KNOWLEDGE REUSE CONCEPTUAL FLOW ────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              INSTITUTIONAL KNOWLEDGE REUSE ARCHITECTURE
            </h3>
          </div>
          <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
            DECISION SUPPORT
          </Badge>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          ResiliNet links past disruptions with future decision support through closed-loop learning:
        </p>

        {/* 5-Step Knowledge Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Ingest</span>
            <p className="font-bold text-slate-800 mt-1">Past Disruption</p>
            <p className="text-[10px] text-slate-500">Root cause & impact</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Capture</span>
            <p className="font-bold text-slate-800 mt-1">Recorded Decision</p>
            <p className="text-[10px] text-slate-500">AI & Human choice</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Track</span>
            <p className="font-bold text-slate-800 mt-1">Recovery Outcome</p>
            <p className="text-[10px] text-slate-500">Execution lead times</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Distill</span>
            <p className="font-bold text-slate-800 mt-1">Playbook Lesson</p>
            <p className="text-[10px] text-slate-500">Extracted insights</p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">5. Support</span>
            <p className="font-bold text-emerald-950 mt-1">Future Decisions</p>
            <p className="text-[10px] text-emerald-700">Heuristic weighting</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic mt-3 pt-2.5 border-t border-slate-100">
          Note: This illustrates the platform&apos;s decision-support knowledge loop; it does not autonomously mutate SAP HANA production ERP configurations.
        </p>
      </Card>

      {/* ── 11. & 12. DATA SOURCE TRANSPARENCY & GOVERNANCE ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 11: DATA SOURCE TRANSPARENCY */}
        <Card className="p-4 bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              DATA SOURCE TRANSPARENCY
            </h4>
          </div>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-slate-700">SAP HANA Cloud:</span>
              <span className="font-mono text-[11px]">Disruption, Execution & Strategy data (Read-Only)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-slate-700">Supabase:</span>
              <span className="font-mono text-[11px]">Institutional memory records (resilience_memory table)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-700">Local Workflow State:</span>
              <span className="font-mono text-[11px]">Simulation session state (client workflow context)</span>
            </div>
          </div>
        </Card>

        {/* Section 12: GOVERNANCE NOTICE */}
        <Card className="p-4 bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              GOVERNANCE & COMPLIANCE PRINCIPLE
            </h4>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Resilience Memory records operational experience for future decision support. Human governance remains strictly responsible for evaluating recommendations and approving operational recovery strategies.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
            <span>Core Principle: <strong>AI recommends. Human approves. Operations execute.</strong></span>
          </div>
        </Card>
      </div>

      {/* ── 13. NAVIGATION ACTIONS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <Link href={`/recovery-execution?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              BACK TO RECOVERY EXECUTION
            </Button>
          </Link>

          <Link href={`/crisis-analysis?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              VIEW CRISIS ANALYSIS
            </Button>
          </Link>

          <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              VIEW RECOVERY STRATEGIES
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isLocalWorkflowRecovered && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetCrisisWorkflow}
              className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Demo Scenario
            </Button>
          )}

          <Link href="/ai-command-center" className="w-full sm:w-auto">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold w-full sm:w-auto">
              <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
              <span>RETURN TO COMMAND CENTER</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Default Page Export (Wrapped in EnterpriseShell & Suspense) ─────────────

export default function ResilienceMemoryPage() {
  return (
    <EnterpriseShell>
      <Suspense fallback={<ResilienceMemorySkeleton />}>
        <ResilienceMemoryContent />
      </Suspense>
    </EnterpriseShell>
  );
}
