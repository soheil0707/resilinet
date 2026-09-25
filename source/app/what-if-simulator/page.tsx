'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import type { RecoveryStrategy } from '@/lib/supabase/types';
import {
  Sliders,
  ArrowRight,
  RotateCcw,
  Shield,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  IndianRupee,
  Layers,
  Database,
  Truck,
  Plane,
  Server,
  HelpCircle,
  ExternalLink,
  History,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

// ─── Canonical Baseline & Strategies ──────────────────────────────────────────

interface CanonicalStrategyData {
  id: string;
  name: string;
  strategy_type: 'COMBINED' | 'EXPEDITED_LOGISTICS' | 'ALTERNATE_SOURCING' | 'STOCK_TRANSFER';
  transport_mode: string;
  baseCost: number;
  costFormatted: string;
  transitHours: number;
  recoveryDays: number;
  recoveryScore: number;
  orchestratorScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isRecommended: boolean;
  revenueProtected: number;
  description: string;
}

const CANONICAL_BASELINE: CanonicalStrategyData = {
  id: 'STR-001',
  name: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
  strategy_type: 'COMBINED',
  transport_mode: 'MULTI-MODAL + AIR',
  baseCost: 185000,
  costFormatted: '₹1.85L',
  transitHours: 18,
  recoveryDays: 1,
  recoveryScore: 94.0,
  orchestratorScore: 82.30,
  riskLevel: 'LOW',
  isRecommended: true,
  revenueProtected: 2420000,
  description: 'Multi-modal transit via road express + priority air dispatch buffer. 18 hours transit time.',
};

const CANONICAL_STRATEGIES: CanonicalStrategyData[] = [
  CANONICAL_BASELINE,
  {
    id: 'STR-002',
    name: 'Priority Air Freight',
    strategy_type: 'EXPEDITED_LOGISTICS',
    transport_mode: 'AIR',
    baseCost: 240000,
    costFormatted: '₹2.40L',
    transitHours: 12,
    recoveryDays: 1,
    recoveryScore: 91.0,
    orchestratorScore: 78.50,
    riskLevel: 'LOW',
    isRecommended: false,
    revenueProtected: 2200000,
    description: 'Dedicated charter air freight from S-104 finished inventory buffer directly to Hyderabad.',
  },
  {
    id: 'STR-003',
    name: 'Alternative Supplier',
    strategy_type: 'ALTERNATE_SOURCING',
    transport_mode: 'ROAD + AIR',
    baseCost: 165000,
    costFormatted: '₹1.65L',
    transitHours: 30,
    recoveryDays: 2,
    recoveryScore: 86.0,
    orchestratorScore: 74.20,
    riskLevel: 'MEDIUM',
    isRecommended: false,
    revenueProtected: 1950000,
    description: 'Emergency batch allocation from secondary qualified vendor Bharat Precision (Pune) via road & regional air.',
  },
  {
    id: 'STR-004',
    name: 'Regional Inventory Transfer',
    strategy_type: 'STOCK_TRANSFER',
    transport_mode: 'ROAD',
    baseCost: 95000,
    costFormatted: '₹0.95L',
    transitHours: 36,
    recoveryDays: 2,
    recoveryScore: 78.0,
    orchestratorScore: 68.40,
    riskLevel: 'MEDIUM',
    isRecommended: false,
    revenueProtected: 2100000,
    description: 'Issue Stock Transport Order (STO) from PL-02 Chennai to PL-01 Hyderabad via express highway freight.',
  },
  {
    id: 'STR-005',
    name: 'Alternate Plant Production',
    strategy_type: 'STOCK_TRANSFER',
    transport_mode: 'ROAD + SEA',
    baseCost: 130000,
    costFormatted: '₹1.30L',
    transitHours: 72,
    recoveryDays: 3,
    recoveryScore: 70.0,
    orchestratorScore: 60.10,
    riskLevel: 'HIGH',
    isRecommended: false,
    revenueProtected: 1600000,
    description: 'Shift assembly load to secondary coastal plant with combined multimodal road and maritime transit.',
  },
];

// ─── Simulation Engine ────────────────────────────────────────────────────────

interface SimParams {
  freightPremium: number;      // -50% to +50%
  chennaiBuf: number;          // 0 to 250 units (baseline: 180)
  penaltySensitivity: number;  // 0% to 100% (baseline: 50%)
}

interface SimulatedStrategy {
  id: string;
  name: string;
  transport_mode: string;
  cost: number;
  costFormatted: string;
  transitHours: number;
  recoveryDays: number;
  recoveryScore: number;
  orchestratorScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isRecommended: boolean;
  revenueProtected: number;
  description: string;
}

interface SessionComparisonRecord {
  id: string;
  timestamp: string;
  strategyId: string;
  strategyName: string;
  costDelta: number;
  transitDelta: number;
  scoreDelta: number;
}

function simulateStrategy(
  strat: CanonicalStrategyData,
  params: SimParams
): SimulatedStrategy {
  const freightMultiplier = 1 + params.freightPremium / 100;
  const bufferDelta = (params.chennaiBuf - 180) / 180; // normalized delta against baseline 180

  let cost = strat.baseCost;
  let transit = strat.transitHours;
  let recScore = strat.recoveryScore;
  let orchScore = strat.orchestratorScore;

  // Apply freight premium adjustments to air and multi-modal logistics
  if (strat.transport_mode.includes('AIR')) {
    cost = Math.round(strat.baseCost * freightMultiplier);
  }

  // Adjust transit hours based on buffer stock availability
  if (strat.id === 'STR-004' || strat.id === 'STR-001') {
    if (bufferDelta < 0) {
      // Buffer deficit delays dispatch
      transit = Math.round(strat.transitHours + Math.abs(bufferDelta) * 8);
    } else if (bufferDelta > 0) {
      // Surplus buffer slightly expedites staging
      transit = Math.max(12, Math.round(strat.transitHours - bufferDelta * 4));
    }
  }

  // Penalty sensitivity impacts recovery score weighting
  if (params.penaltySensitivity !== 50) {
    const penaltyFactor = (params.penaltySensitivity - 50) / 50;
    // Faster strategies benefit under high penalty sensitivity; slow strategies lose score
    if (strat.transitHours <= 18) {
      recScore = Math.min(99, Math.round((strat.recoveryScore + penaltyFactor * 2.5) * 10) / 10);
      orchScore = Math.min(95, Math.round((strat.orchestratorScore + penaltyFactor * 1.8) * 100) / 100);
    } else {
      recScore = Math.max(40, Math.round((strat.recoveryScore - penaltyFactor * 3.5) * 10) / 10);
      orchScore = Math.max(35, Math.round((strat.orchestratorScore - penaltyFactor * 2.2) * 100) / 100);
    }
  }

  // Format currency
  const costInLakh = (cost / 100000).toFixed(2);
  const costFormatted = `₹${costInLakh}L`;

  return {
    id: strat.id,
    name: strat.name,
    transport_mode: strat.transport_mode,
    cost,
    costFormatted,
    transitHours: transit,
    recoveryDays: Math.ceil(transit / 24),
    recoveryScore: recScore,
    orchestratorScore: orchScore,
    riskLevel: strat.riskLevel,
    isRecommended: strat.isRecommended,
    revenueProtected: strat.revenueProtected,
    description: strat.description,
  };
}

function formatCurrencyDelta(delta: number): string {
  if (delta === 0) return '₹0';
  const prefix = delta > 0 ? '+₹' : '-₹';
  const abs = Math.abs(delta);
  if (abs >= 100000) {
    return `${prefix}${(abs / 100000).toFixed(2)}L`;
  }
  return `${prefix}${abs.toLocaleString('en-IN')}`;
}

// ─── Main What-If Simulator Workspace ─────────────────────────────────────────

function WhatIfSimulatorInner() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams?.get('disruptionId') || 'DIS-1001';

  const { setSelectedStrategy, setApprovedStrategy, setWorkflowState, isOverride } = useWorkflow();

  const [liveStrategies, setLiveStrategies] = useState<CanonicalStrategyData[]>(CANONICAL_STRATEGIES);
  const [hanaActive, setHanaActive] = useState(false);
  const [hanaError, setHanaError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live strategy rankings from SAP HANA Cloud
  useEffect(() => {
    const fetchHanaStrategies = async () => {
      setIsLoading(true);
      setHanaError(null);
      try {
        const res = await fetch('/api/hana/recovery-strategies');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.strategies) && json.strategies.length > 0) {
          const mapped: CanonicalStrategyData[] = json.strategies.map((s: any) => ({
            id: s.STRATEGY_ID,
            name: s.STRATEGY_NAME,
            strategy_type: s.STRATEGY_ID === 'STR-001' ? 'COMBINED' : s.TRANSPORT_MODE.includes('AIR') ? 'EXPEDITED_LOGISTICS' : 'STOCK_TRANSFER',
            transport_mode: s.TRANSPORT_MODE,
            baseCost: Number(s.ESTIMATED_COST) || 185000,
            costFormatted: `₹${(Number(s.ESTIMATED_COST) / 100000).toFixed(2)}L`,
            transitHours: s.TRANSIT_TIME_HOURS || 18,
            recoveryDays: Math.ceil((s.TRANSIT_TIME_HOURS || 24) / 24),
            recoveryScore: Number(s.RECOVERY_SCORE) || 90,
            orchestratorScore: Number(s.ORCHESTRATOR_SCORE) || 80,
            riskLevel: s.RISK_LEVEL === 'LOW' ? 'LOW' : s.RISK_LEVEL === 'HIGH' ? 'HIGH' : 'MEDIUM',
            isRecommended: Boolean(s.AI_RECOMMENDED || s.STRATEGY_ID === 'STR-001'),
            revenueProtected: 2420000,
            description: s.DESCRIPTION || s.AI_REASON || 'SAP HANA operational strategy record.',
          }));
          setLiveStrategies(mapped);
          setHanaActive(true);
        } else {
          setHanaActive(false);
          setHanaError('SAP HANA Cloud operational service unavailable');
        }
      } catch (err) {
        console.error('Failed to load HANA recovery strategies:', err);
        setHanaActive(false);
        setHanaError('SAP HANA Cloud operational service unavailable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHanaStrategies();
  }, []);

  // Baseline Strategy (STR-001) is strictly constant
  const baseline = useMemo(() => {
    return liveStrategies.find((s) => s.id === 'STR-001') || CANONICAL_BASELINE;
  }, [liveStrategies]);

  // Selected Strategy ID for simulation comparison (defaults to STR-001 or STR-002)
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('STR-002');

  // Simulation Parameters
  const [params, setParams] = useState<SimParams>({
    freightPremium: 0,
    chennaiBuf: 180,
    penaltySensitivity: 50,
  });

  // Local session comparison audit log
  const [sessionHistory, setSessionHistory] = useState<SessionComparisonRecord[]>([]);

  // Override Confirmation Modal for staging non-recommended strategy to approval
  const [pendingOverrideStrategy, setPendingOverrideStrategy] = useState<RecoveryStrategy | null>(null);

  // Compute simulated strategies under current parameters
  const simulatedStrategies = useMemo(() => {
    return liveStrategies.map((strat) => simulateStrategy(strat, params));
  }, [liveStrategies, params]);

  // Current active simulated scenario
  const activeScenario = useMemo(() => {
    return simulatedStrategies.find((s) => s.id === selectedStrategyId) || simulatedStrategies[0];
  }, [simulatedStrategies, selectedStrategyId]);

  // Calculated Deltas
  const costDelta = activeScenario.cost - baseline.baseCost;
  const transitDelta = activeScenario.transitHours - baseline.transitHours;
  const scoreDelta = Math.round((activeScenario.recoveryScore - baseline.recoveryScore) * 10) / 10;
  const orchDelta = Math.round((activeScenario.orchestratorScore - baseline.orchestratorScore) * 100) / 100;

  // Log to local session history when strategy selection changes
  const handleSelectStrategy = useCallback((stratId: string) => {
    setSelectedStrategyId(stratId);
    const target = simulatedStrategies.find((s) => s.id === stratId);
    if (target && stratId !== baseline.id) {
      const cDelta = target.cost - baseline.baseCost;
      const tDelta = target.transitHours - baseline.transitHours;
      const sDelta = Math.round((target.recoveryScore - baseline.recoveryScore) * 10) / 10;
      setSessionHistory((prev) => [
        {
          id: `SIM-LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          strategyId: target.id,
          strategyName: target.name,
          costDelta: cDelta,
          transitDelta: tDelta,
          scoreDelta: sDelta,
        },
        ...prev.slice(0, 4), // keep last 5
      ]);
    }
  }, [simulatedStrategies, baseline]);

  // Reset simulator to canonical baseline
  const handleReset = useCallback(() => {
    setParams({ freightPremium: 0, chennaiBuf: 180, penaltySensitivity: 50 });
    setSelectedStrategyId('STR-001');
  }, []);

  // Staging for Human Approval
  const handleStageForApproval = useCallback(() => {
    const stratObj: RecoveryStrategy = {
      id: activeScenario.id,
      disruption_id: disruptionId,
      name: activeScenario.name,
      strategy_type: (activeScenario.transport_mode.includes('AIR') && activeScenario.transport_mode.includes('ROAD')
        ? 'COMBINED'
        : activeScenario.transport_mode.includes('AIR')
        ? 'EXPEDITED_LOGISTICS'
        : 'STOCK_TRANSFER') as any,
      cost_inr: activeScenario.cost,
      recovery_time_days: activeScenario.recoveryDays,
      revenue_protected_inr: activeScenario.revenueProtected,
      risk_level: activeScenario.riskLevel,
      overall_score: activeScenario.orchestratorScore,
      is_recommended: activeScenario.isRecommended,
      description: activeScenario.description,
    };

    if (activeScenario.id !== 'STR-001' && !activeScenario.isRecommended) {
      setPendingOverrideStrategy(stratObj);
    } else {
      confirmApprovalSelection(stratObj, false);
    }
  }, [activeScenario, disruptionId]);

  const confirmApprovalSelection = useCallback((strat: RecoveryStrategy, overrideFlag: boolean) => {
    setSelectedStrategy(strat, overrideFlag);
    setApprovedStrategy(strat, overrideFlag);
    setWorkflowState('STRATEGY_SELECTED');
    setPendingOverrideStrategy(null);
  }, [setSelectedStrategy, setApprovedStrategy, setWorkflowState]);

  // Semantic badge helpers
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
                Baseline and candidate recovery strategies require live SAP HANA Cloud views V_ORCH_STRATEGY_RANKING and V_ORCH_RECOMMENDATIONS.
              </p>
            </div>
          </section>
        )}

        {/* ── 1. Enterprise Page Header ────────────────────────────────────── */}
        <PageHeader
          title="WHAT-IF SIMULATOR"
          description="Model recovery scenarios and compare simulated operational outcomes before human authorization."
          badge={
            <div className="flex items-center gap-2">
              <LiveDataBadge isLive={hanaActive} />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                <Sliders className="w-3 h-3 text-violet-500" />
                Scenario Simulation
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Reset Scenario
              </Button>
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
                  variant="secondary"
                  size="sm"
                  className="text-xs flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  AI Command Center
                </Button>
              </Link>
            </div>
          }
        />

        {/* Context metadata bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">Incident Context:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
              {disruptionId}
            </span>
            <span className="text-slate-600">Supplier Delay</span>
            <Badge variant="critical" className="text-[10px] py-0 px-2 font-bold">HIGH</Badge>
            <span className="text-slate-500">Plant: <strong className="text-slate-700">PLANT-001 (Hyderabad)</strong></span>
          </div>
          <div className="text-[11px] text-slate-500">
            Read-Only HANA Connection · Scenario Modeling Workspace
          </div>
        </div>

        {/* ── 2. Lifecycle Position ────────────────────────────────────────── */}
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
            <div className="flex items-center gap-1 text-violet-700 font-bold bg-violet-50 px-2 py-1 rounded border border-violet-200">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>WHAT-IF — CURRENT</span>
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
            The What-If Simulator enables side-by-side scenario exploration of canonical recovery strategies prior to formal Supply Chain Manager authorization.
          </p>
        </div>

        {/* ── 3. Baseline Context Card ─────────────────────────────────────── */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  BASELINE / LIVE DECISION CONTEXT (DIS-1001)
                </CardTitle>
              </div>
              <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                LIVE OPERATIONAL ANCHOR
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Crisis Incident</span>
                <p className="text-xs font-bold text-slate-900">DIS-1001 — Supplier Delay</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span>Severity: <strong className="text-red-700">HIGH</strong></span>
                  <span>·</span>
                  <span>East India</span>
                </div>
                <p className="text-[11px] text-slate-500">Plant: PLANT-001 · Duration: 48h</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">AI Recommended Strategy</span>
                <p className="text-xs font-bold text-emerald-950 font-mono">STR-001</p>
                <p className="text-[11px] text-emerald-900 font-medium truncate">Combined Recovery</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  MULTI-MODAL + AIR
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Baseline Scores</span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600">Recovery Score:</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">{baseline.recoveryScore}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Orchestrator Score:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">{baseline.orchestratorScore.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Baseline Logistics & Risk</span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600">Cost:</span>
                  <span className="font-bold text-slate-900 font-mono">{baseline.costFormatted}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Transit / Risk:</span>
                  <span className="font-mono text-slate-900 font-semibold">{baseline.transitHours}h · <span className="text-emerald-700 font-bold">LOW</span></span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 italic">
              Note: Baseline operational parameters are sourced directly from SAP HANA Cloud and remain unchanged during simulation modeling.
            </p>
          </CardContent>
        </Card>

        {/* ── 4. Scenario Builder & Parameter Modifiers ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Parameter Tuning Panel */}
          <Card className="border-slate-200 bg-white lg:col-span-1 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Simulation Parameters
                  </CardTitle>
                </div>
                <button
                  onClick={() => setParams({ freightPremium: 0, chennaiBuf: 180, penaltySensitivity: 50 })}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">

              {/* Parameter 1: Freight Premium */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">Freight Premium Modifier</label>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    params.freightPremium > 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : params.freightPremium < 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {params.freightPremium > 0 ? `+${params.freightPremium}%` : `${params.freightPremium}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={params.freightPremium}
                  onChange={(e) => setParams((p) => ({ ...p, freightPremium: parseInt(e.target.value, 10) }))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Freight Premium Modifier"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-50% (Contract Discount)</span>
                  <span>0% (Base)</span>
                  <span>+50% (Spot Surge)</span>
                </div>
                <p className="text-[11px] text-slate-500">Models charter air and expedited transit surcharge impacts on cost.</p>
              </div>

              {/* Parameter 2: Chennai Buffer */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">Chennai Buffer Availability</label>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    params.chennaiBuf >= 180
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : params.chennaiBuf >= 100
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {params.chennaiBuf} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="10"
                  value={params.chennaiBuf}
                  onChange={(e) => setParams((p) => ({ ...p, chennaiBuf: parseInt(e.target.value, 10) }))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Chennai Buffer Availability"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 units (Depleted)</span>
                  <span>180 (Baseline)</span>
                  <span>250 units (Surplus)</span>
                </div>
                <p className="text-[11px] text-slate-500">M-101 buffer inventory at PL-02 Chennai for STO transfer dispatch.</p>
              </div>

              {/* Parameter 3: Customer Delay Penalty */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">Customer SLA Penalty Weight</label>
                  <span className="font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                    {params.penaltySensitivity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={params.penaltySensitivity}
                  onChange={(e) => setParams((p) => ({ ...p, penaltySensitivity: parseInt(e.target.value, 10) }))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Customer SLA Penalty Weight"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Flexible)</span>
                  <span>50% (Standard)</span>
                  <span>100% (Critical SLA)</span>
                </div>
                <p className="text-[11px] text-slate-500">Weight assigned to rapid recovery vs cost containment.</p>
              </div>

              {/* Parameter Callout Box */}
              <div className="p-3 bg-violet-50/70 border border-violet-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider block">
                  Interactive Sensitivity
                </span>
                <p className="text-slate-700 leading-snug">
                  Adjusting these modifiers recalculates strategy metrics locally. Select any canonical strategy below to compare deltas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Canonical Strategy Selector Cards */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Canonical Recovery Strategy to Model</h3>
                <p className="text-xs text-slate-500">
                  Click a strategy card to select it as the active WHAT-IF scenario for side-by-side comparison.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Active Scenario: <strong className="text-violet-700">{activeScenario.id}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulatedStrategies.map((strat) => {
                const isSelected = strat.id === selectedStrategyId;
                const isBaseline = strat.id === baseline.id;

                return (
                  <div
                    key={strat.id}
                    onClick={() => handleSelectStrategy(strat.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/40 ring-2 ring-violet-200 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{strat.id}</span>
                        {isBaseline && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            AI RECOMMENDED
                          </span>
                        )}
                      </div>
                      {getRiskBadge(strat.riskLevel)}
                    </div>

                    <p className="font-semibold text-slate-900 mt-1 line-clamp-1">{strat.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{strat.transport_mode}</p>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cost</span>
                        <span className="font-mono font-bold text-slate-800">{strat.costFormatted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Transit</span>
                        <span className="font-mono font-bold text-slate-800">{strat.transitHours}h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rec. Score</span>
                        <span className={`font-mono font-bold ${strat.recoveryScore >= 90 ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {strat.recoveryScore}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500 text-[10px]">Orchestrator: {strat.orchestratorScore.toFixed(2)}</span>
                      <span className={`font-bold ${isSelected ? 'text-violet-700' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Modeling Active' : 'Click to Model'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 5. Side-by-Side Scenario Comparison ──────────────────────────── */}
        <Card className="border-slate-200 bg-white overflow-hidden shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  SCENARIO COMPARISON: BASELINE vs WHAT-IF
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  BASELINE: {baseline.id}
                </span>
                <span className="text-slate-400">vs</span>
                <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-800 font-semibold border border-violet-200">
                  WHAT-IF: {activeScenario.id} (SIMULATED)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px] w-1/4">Metric</th>
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px] bg-slate-100/50 w-1/3">
                      BASELINE ({baseline.id})
                    </th>
                    <th className="text-left p-3.5 font-bold uppercase tracking-wider text-[11px] bg-violet-50/40 w-1/3">
                      WHAT-IF SCENARIO ({activeScenario.id})
                    </th>
                    <th className="text-right p-3.5 font-bold uppercase tracking-wider text-[11px] w-1/6">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Strategy Name</td>
                    <td className="p-3.5 bg-slate-50/30 font-bold text-slate-900">{baseline.name}</td>
                    <td className="p-3.5 bg-violet-50/20 font-bold text-violet-950">{activeScenario.name}</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Recovery Score</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-emerald-700 text-sm">{baseline.recoveryScore}</td>
                    <td className="p-3.5 bg-violet-50/20 font-mono font-bold text-violet-900 text-sm">
                      {activeScenario.recoveryScore}
                      <span className="text-[10px] ml-1.5 font-normal text-violet-600">(Simulated)</span>
                    </td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      scoreDelta > 0 ? 'text-emerald-700' : scoreDelta < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Orchestrator Score</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-800">{baseline.orchestratorScore.toFixed(2)}</td>
                    <td className="p-3.5 bg-violet-50/20 font-mono font-bold text-violet-900">
                      {activeScenario.orchestratorScore.toFixed(2)}
                      <span className="text-[10px] ml-1.5 font-normal text-violet-600">(Simulated)</span>
                    </td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      orchDelta > 0 ? 'text-emerald-700' : orchDelta < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {orchDelta > 0 ? `+${orchDelta.toFixed(2)}` : orchDelta.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Estimated Cost</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-900">{baseline.costFormatted}</td>
                    <td className="p-3.5 bg-violet-50/20 font-mono font-bold text-violet-950">
                      {activeScenario.costFormatted}
                      <span className="text-[10px] ml-1.5 font-normal text-violet-600">(Simulated)</span>
                    </td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      costDelta < 0 ? 'text-emerald-700' : costDelta > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {formatCurrencyDelta(costDelta)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Transit Duration</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-bold text-slate-900">{baseline.transitHours}h</td>
                    <td className="p-3.5 bg-violet-50/20 font-mono font-bold text-violet-950">
                      {activeScenario.transitHours}h
                      <span className="text-[10px] ml-1.5 font-normal text-violet-600">(Simulated)</span>
                    </td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      transitDelta < 0 ? 'text-emerald-700' : transitDelta > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {transitDelta > 0 ? `+${transitDelta}h` : `${transitDelta}h`}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Operational Risk Level</td>
                    <td className="p-3.5 bg-slate-50/30">
                      <Badge variant="healthy" className="font-mono text-xs">LOW</Badge>
                    </td>
                    <td className="p-3.5 bg-violet-50/20">
                      {getRiskBadge(activeScenario.riskLevel)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-xs font-semibold text-slate-600">
                      {activeScenario.riskLevel === baseline.riskLevel ? 'MATCH' : 'VARIANCE'}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3.5 font-semibold text-slate-700">Transport Logistics Mode</td>
                    <td className="p-3.5 bg-slate-50/30 font-mono font-semibold text-slate-800">{baseline.transport_mode}</td>
                    <td className="p-3.5 bg-violet-50/20 font-mono font-semibold text-violet-950">{activeScenario.transport_mode}</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── 6. Impact Delta Section ──────────────────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Calculated Operational Impact Delta</h3>
          <p className="text-xs text-slate-500">
            Direct mathematical variances comparing simulated scenario metrics against the canonical baseline (STR-001).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Cost Delta */}
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Cost Delta</span>
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className={`text-xl font-bold font-mono ${costDelta < 0 ? 'text-emerald-700' : costDelta > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {formatCurrencyDelta(costDelta)}
              </p>
              <p className="text-[11px] text-slate-500">
                {costDelta < 0 ? 'Estimated recovery cost reduction' : costDelta > 0 ? 'Additional budget required' : 'Identical to baseline cost'}
              </p>
            </div>

            {/* Transit Delta */}
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Transit Delta</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className={`text-xl font-bold font-mono ${transitDelta < 0 ? 'text-emerald-700' : transitDelta > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {transitDelta > 0 ? `+${transitDelta}h` : `${transitDelta}h`}
              </p>
              <p className="text-[11px] text-slate-500">
                {transitDelta < 0 ? 'Faster material arrival at PLANT-001' : transitDelta > 0 ? 'Extended delivery turnaround' : 'Identical to baseline transit'}
              </p>
            </div>

            {/* Recovery Score Delta */}
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Recovery Score Delta</span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className={`text-xl font-bold font-mono ${scoreDelta > 0 ? 'text-emerald-700' : scoreDelta < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
              </p>
              <p className="text-[11px] text-slate-500">
                {scoreDelta >= 0 ? 'Maintains or exceeds AI confidence' : 'Score reduction relative to baseline'}
              </p>
            </div>

            {/* Orchestrator Score Delta */}
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[10px]">Orchestrator Score Delta</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className={`text-xl font-bold font-mono ${orchDelta > 0 ? 'text-emerald-700' : orchDelta < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {orchDelta > 0 ? `+${orchDelta.toFixed(2)}` : orchDelta.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">
                Composite multi-agent weighted variance
              </p>
            </div>
          </div>
        </div>

        {/* ── 7 & 8. Risk Comparison & Scenario Interpretation ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Risk Comparison */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Risk Comparison
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Baseline Risk Profile</span>
                  <span className="text-xs font-bold text-slate-900">STR-001 (Combined Recovery)</span>
                </div>
                <Badge variant="healthy" className="font-mono text-xs">LOW RISK</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50/50 border border-violet-200">
                <div>
                  <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider block">Scenario Risk Profile</span>
                  <span className="text-xs font-bold text-violet-950">{activeScenario.id} ({activeScenario.name})</span>
                </div>
                {getRiskBadge(activeScenario.riskLevel)}
              </div>

              <div className="text-xs text-slate-600 pt-1 space-y-1">
                <p>
                  <strong>Operational Risk Context:</strong> Baseline strategy uses dual-channel transfer (road buffer + priority air), ensuring redundant capacity. 
                  {activeScenario.riskLevel === 'HIGH' && (
                    <span className="text-rose-700 font-semibold block mt-1">
                      ⚠ Selected scenario carries HIGH risk due to extended maritime transit dependency (72h) and multi-nodal handoffs.
                    </span>
                  )}
                  {activeScenario.riskLevel === 'MEDIUM' && (
                    <span className="text-amber-700 font-semibold block mt-1">
                      ⚠ Selected scenario carries MEDIUM risk due to reliance on single-route highway logistics or secondary supplier validation.
                    </span>
                  )}
                  {activeScenario.riskLevel === 'LOW' && (
                    <span className="text-emerald-700 font-semibold block mt-1">
                      ✓ Selected scenario maintains a LOW risk posture comparable to the baseline.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Interpretation */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Scenario Impact Interpretation
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Transit Time:</strong> Scenario transit time is{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {Math.abs(transitDelta)} hours {transitDelta > 0 ? 'longer' : transitDelta < 0 ? 'faster' : 'equal'}
                    </span>{' '}
                    relative to the baseline strategy (18h).
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Estimated Cost:</strong> Scenario recovery expenditure is{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrencyDelta(costDelta)}
                    </span>{' '}
                    {costDelta > 0 ? 'higher than' : costDelta < 0 ? 'lower than' : 'equal to'} the baseline recommendation (₹1.85L).
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Recovery Confidence:</strong> Algorithmic recovery score delta is{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} points
                    </span>{' '}
                    (Orchestrator variance: {orchDelta > 0 ? `+${orchDelta.toFixed(2)}` : orchDelta.toFixed(2)}).
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Logistics Mode:</strong> Transition from{' '}
                    <span className="font-mono font-semibold text-slate-800">{baseline.transport_mode}</span> to{' '}
                    <span className="font-mono font-semibold text-slate-800">{activeScenario.transport_mode}</span>.
                  </span>
                </li>
              </ul>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 italic mt-2">
                All comparisons represent descriptive arithmetic deltas based exclusively on verified canonical strategy attributes.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 9. AI Decision Context vs What-If Scenario ───────────────────── */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                AI DECISION CONTEXT & DISTINCTION
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  1. Current AI Recommendation (HANA Live)
                </span>
                <p className="text-sm font-bold text-slate-900">STR-001 — Combined Recovery</p>
                <p className="text-xs text-slate-600">
                  Calculated by ResiliNet Multi-Agent System as the optimal balance of recovery speed (18h), cost (₹1.85L), and low operational risk.
                </p>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <span>Recovery Score: <strong className="text-emerald-700 font-mono">94.0</strong></span>
                  <span>·</span>
                  <span>Orchestrator: <strong className="font-mono">82.30</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-violet-50/40 border border-violet-200 space-y-2">
                <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider block">
                  2. Active What-If Scenario (Local Simulation)
                </span>
                <p className="text-sm font-bold text-slate-900">{activeScenario.id} — {activeScenario.name}</p>
                <p className="text-xs text-slate-600">
                  Exploratory model evaluated for contingency analysis under simulated market premiums and stock buffer levels.
                </p>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <span>Recovery Score: <strong className="text-violet-800 font-mono">{activeScenario.recoveryScore}</strong></span>
                  <span>·</span>
                  <span>Orchestrator: <strong className="font-mono">{activeScenario.orchestratorScore.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 10. Human Decision Boundary & Governance ─────────────────────── */}
        <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                GOVERNANCE NOTICE: WHAT-IF SIMULATION ≠ OPERATIONAL APPROVAL
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Running what-if scenarios models alternative possibilities without mutating SAP HANA operational records or authorizing financial spend. 
                Final operational execution requires formal review and human authorization in the Approval Center.
              </p>
            </div>
          </div>
          <Link href={`/recovery-strategies?disruptionId=${disruptionId}`} className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold bg-white text-slate-800 border-amber-300 hover:bg-amber-100/50 cursor-pointer"
            >
              Review Recovery Strategies
            </Button>
          </Link>
        </div>

        {/* ── 11 & 12. Local Session History ──────────────────────────────── */}
        {sessionHistory.length > 0 && (
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Session Comparisons (Local Simulation)
                  </CardTitle>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">In-Memory Audit</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-[10px] uppercase">
                      <th className="text-left py-2 font-bold">Time</th>
                      <th className="text-left py-2 font-bold">Scenario Tested</th>
                      <th className="text-right py-2 font-bold">Cost Delta</th>
                      <th className="text-right py-2 font-bold">Transit Delta</th>
                      <th className="text-right py-2 font-bold">Score Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 font-mono text-slate-500 text-[11px]">{item.timestamp}</td>
                        <td className="py-2 font-semibold text-slate-800">
                          {item.strategyId} — {item.strategyName}
                        </td>
                        <td className={`py-2 text-right font-mono font-bold ${
                          item.costDelta < 0 ? 'text-emerald-700' : item.costDelta > 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}>
                          {formatCurrencyDelta(item.costDelta)}
                        </td>
                        <td className={`py-2 text-right font-mono font-bold ${
                          item.transitDelta < 0 ? 'text-emerald-700' : item.transitDelta > 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}>
                          {item.transitDelta > 0 ? `+${item.transitDelta}h` : `${item.transitDelta}h`}
                        </td>
                        <td className={`py-2 text-right font-mono font-bold ${
                          item.scoreDelta > 0 ? 'text-emerald-700' : item.scoreDelta < 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}>
                          {item.scoreDelta > 0 ? `+${item.scoreDelta}` : item.scoreDelta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── 13. Decision Handoff ─────────────────────────────────────────── */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
            <CardTitle className="text-sm font-bold text-slate-900">
              SCENARIO REVIEW COMPLETE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-700 font-medium">
                  Done evaluating what-if operational tradeoffs? Proceed to compare full strategy breakdowns or submit the desired strategy for human approval sign-off.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Currently modeled strategy: <strong>{activeScenario.id} ({activeScenario.name})</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStageForApproval}
                  className="text-xs font-bold border-violet-300 text-violet-800 bg-violet-50 hover:bg-violet-100 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                  Stage {activeScenario.id} For Approval
                </Button>
                <Link href={`/recovery-strategies?disruptionId=${disruptionId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Compare Recovery Strategies
                  </Button>
                </Link>
                <Link href="/approval-center">
                  <Button
                    size="sm"
                    className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                  >
                    Open Approval Center
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 14. Data Source Transparency ─────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">Data Architecture & Transparency</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] flex-wrap">
              <span>
                <strong className="text-slate-700">LIVE BASELINE:</strong> SAP HANA Cloud (Read-Only)
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-700">SCENARIO:</strong> Local Simulation Engine / Canonical Strategy Model
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-700">PERSISTENCE:</strong> No HANA Mutation
              </span>
            </div>
          </div>
        </div>

        {/* ── Human Override Alert Modal (Preserved for workflow continuity) ── */}
        {pendingOverrideStrategy && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-amber-500 text-white px-5 py-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-100" />
                <div>
                  <h3 className="text-base font-bold">Human Override / Decision Alert</h3>
                  <p className="text-xs text-amber-100">You are staging a strategy different from the AI-recommended strategy.</p>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  {/* AI Recommended Strategy */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">AI RECOMMENDED</span>
                    <p className="font-bold text-slate-900 text-xs">STR-001</p>
                    <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                      <p>⏱ 18h Transit</p>
                      <p>💰 ₹1.85L Cost</p>
                      <p>⭐ Score: 94.0</p>
                      <p>🛡 Low Risk</p>
                    </div>
                  </div>

                  {/* Human Selected Strategy */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">YOUR SELECTION</span>
                    <p className="font-bold text-slate-900 text-xs">{pendingOverrideStrategy.id}</p>
                    <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                      <p>⏱ {pendingOverrideStrategy.recovery_time_days * 24}h Transit</p>
                      <p>💰 ₹{(pendingOverrideStrategy.cost_inr / 100000).toFixed(2)}L Cost</p>
                      <p>⭐ Score: {pendingOverrideStrategy.overall_score.toFixed(1)}</p>
                      <p>🛡 {pendingOverrideStrategy.risk_level} Risk</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Governance Variance Recorded</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Staging an alternative strategy marks this action as a Human Override. The formal sign-off must be completed in the Approval Center by an authorized Supply Chain Manager.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingOverrideStrategy(null)}
                  className="text-xs cursor-pointer"
                >
                  Go Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => confirmApprovalSelection(pendingOverrideStrategy, true)}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue With My Choice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </EnterpriseShell>
  );
}

export default function WhatIfSimulatorPage() {
  return (
    <Suspense
      fallback={
        <EnterpriseShell>
          <div className="p-8 text-center text-xs text-slate-500">
            Loading What-If Simulator workspace...
          </div>
        </EnterpriseShell>
      }
    >
      <WhatIfSimulatorInner />
    </Suspense>
  );
}
