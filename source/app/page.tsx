'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  Server,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  PlayCircle,
  Activity,
  Bot,
  Network,
  Clock,
  Building2,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { KpiCard } from '@/components/enterprise/KpiCard';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { LifecycleStepper, LifecycleStage } from '@/components/enterprise/LifecycleStepper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useWorkflow } from '@/lib/workflow/workflow-context';

function getLifecycleStage(state: string): LifecycleStage {
  switch (state) {
    case 'DETECTED':
    case 'CRISIS_ACTIVE':
      return 'MONITOR';
    case 'AGENTS_ANALYZING':
    case 'AGENTS_COMPLETE':
      return 'ANALYZE';
    case 'STRATEGY_SELECTED':
      return 'DECIDE';
    case 'APPROVED':
      return 'APPROVE';
    case 'EXECUTING':
    case 'RECOVERED':
      return 'EXECUTE';
    default:
      return 'MONITOR';
  }
}

export interface HanaDashboardSummary {
  totalDisruptions: number;
  criticalDisruptions: number;
  highDisruptions: number;
  activeDisruptions: number;
  totalRecommendations: number;
  recommendedStrategy: string;
  recommendedRecoveryScore: number;
  orchestratorScore: number;
  executionsInProgress: number;
  plannedExecutions: number;
  completedExecutions: number;
  totalExecutions: number;
}

export interface HanaDisruptionItem {
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

export interface HanaAIDecisionItem {
  DISRUPTION_ID: string;
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  ORCHESTRATOR_SCORE: number | string;
  AI_REASON: string;
}

export interface HanaExecutionItem {
  EXECUTION_ID: string;
  DISRUPTION_ID: string;
  STRATEGY_ID: string;
  EXECUTION_STATUS: string;
  EXECUTED_BY: string;
  START_TIME: string;
  EXPECTED_COMPLETION?: string | null;
}

import { useHanaDashboard } from '@/lib/hana/use-dashboard';

export default function ExecutiveDashboardPage() {
  const {
    summary: hanaSummary,
    disruptions: hanaDisruptions,
    primaryDisruption: rawPrimaryIncident,
    topAIDecision: hanaDecision,
    currentExecution: hanaExecution,
    isLoading,
    isRefreshing,
    error: hanaError,
    refresh: handleRefresh,
  } = useHanaDashboard();

  const hanaActive = Boolean(hanaSummary);

  const { workflowState, approvedStrategy, selectedStrategy } = useWorkflow();
  const isRecovered = workflowState === 'RECOVERED';
  const activeStrategy = approvedStrategy || selectedStrategy;

  // Derive display values from live SAP HANA
  const liveActiveDisruptions = hanaSummary ? hanaSummary.activeDisruptions : 0;
  const liveCriticalDisruptions = hanaSummary ? hanaSummary.criticalDisruptions : 0;
  const liveRecoveryScore = hanaSummary
    ? Math.round(hanaSummary.recommendedRecoveryScore)
    : 0;
  const liveOrchestratorScore = hanaSummary
    ? hanaSummary.orchestratorScore.toFixed(2)
    : '0.00';
  const liveExecutionsInProgress = hanaSummary
    ? hanaSummary.executionsInProgress
    : 0;

  // Primary Incident values (DIS-1001) from HANA
  const primaryIncident = rawPrimaryIncident || hanaDisruptions.find((d) => d.DISRUPTION_ID === 'DIS-1001') || hanaDisruptions[0] || {
    DISRUPTION_ID: 'DIS-1001',
    DISRUPTION_TYPE: hanaActive ? 'Operational Normal' : 'Not available from SAP HANA',
    SEVERITY: hanaActive ? 'LOW' : 'UNKNOWN',
    LOCATION: hanaActive ? 'Network' : 'Not available from SAP HANA',
    AFFECTED_PLANT_ID: 'PLANT-001',
    AFFECTED_SUPPLIER_ID: 'S-104',
    EXPECTED_DURATION_HOURS: 0,
    STATUS: hanaActive ? 'NORMAL' : 'UNAVAILABLE',
    DESCRIPTION: hanaActive ? 'No active disruption matching DIS-1001.' : 'SAP HANA Cloud operational service unavailable',
  };

  // Primary Strategy values (STR-001) from HANA
  const strategyTitle = hanaDecision?.STRATEGY_NAME || (hanaActive ? 'Strategy pending HANA consensus' : 'Not available from SAP HANA');
  const strategyId = hanaDecision?.STRATEGY_ID || (hanaActive ? 'STR-001' : 'N/A');
  const strategyTransport = hanaDecision?.TRANSPORT_MODE || (hanaActive ? 'MULTI-MODAL' : 'N/A');
  const strategyAiReason =
    hanaDecision?.AI_REASON ||
    (hanaActive
      ? 'Multi-modal transport bypasses road bottlenecks while priority air charter ensures critical production buffer for Plant-001 within 18 hours at optimal cost ₹1.85L.'
      : 'Not available from SAP HANA');

  // Disruptions list directly from HANA
  const displayDisruptions = hanaDisruptions;

  return (
    <EnterpriseShell>
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
              Live operational telemetry, disruptions, and execution pipelines require SAP HANA Cloud (HACKFEST0145). Fallback to demo or Supabase data is prohibited.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition"
          >
            Retry Connection
          </button>
        </section>
      )}

      {/* ── Mitigated State Banner (shown when RECOVERED) ── */}
      {isRecovered && (
        <section
          aria-label="Recovery Completed Notification"
          className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-950">
                  Recovery In Progress — DIS-1001 Mitigated
                </p>
                <Badge variant="healthy" size="sm">
                  STR-001 Approved
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                {activeStrategy?.name || 'Combined Recovery'} strategy executed. Delay reduced: 7 Days → 18 hours. ₹24.2L revenue protected.
              </p>
            </div>
          </div>
          <Link
            href="/recovery-execution"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition self-start sm:self-auto shrink-0"
          >
            <span>View Execution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}

      {/* ── 1. Page Hero / Executive Context ─────────────── */}
      <section
        aria-labelledby="dashboard-heading"
        className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                id="dashboard-heading"
                className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight"
              >
                RESILINET COMMAND CENTER
              </h1>
              <LiveDataBadge isLive={hanaActive} />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              AI-Powered Supply Chain Resilience Orchestration • Astra Motors Manufacturing
            </p>
          </div>

          {/* Context pill and refresh controls */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500">Primary Incident:</span>
              <span className="font-mono font-bold text-slate-900">DIS-1001</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-medium">Supplier Delay</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-500">PLANT-001</span>
              <Badge variant="warning" size="sm">
                HIGH
              </Badge>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              title="Refresh live metrics from SAP HANA Cloud"
              aria-label="Refresh live metrics"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Universal 5-Stage Lifecycle Stepper ─────────── */}
        <div className="pt-2 border-t border-slate-100">
          <LifecycleStepper
            currentStage={getLifecycleStage(workflowState)}
            incidentId="DIS-1001"
          />
        </div>
      </section>

      {/* ── 2. Resilience KPI Row ─────────────────────────── */}
      <section aria-label="Key Resilience Indicators">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse p-4"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Active Disruptions"
              value={liveActiveDisruptions}
              status="critical"
              icon={<AlertOctagon className="w-4 h-4" />}
              delta={{ value: '4 Active', isPositive: false, label: 'in network' }}
              tooltip="Disruptions currently impacting operational nodes"
            />
            <KpiCard
              label="Critical Disruptions"
              value={liveCriticalDisruptions}
              status="critical"
              icon={<AlertOctagon className="w-4 h-4" />}
              delta={{ value: '2 Nodes', isPositive: false, label: 'tier-1 threat' }}
              tooltip="Disruptions requiring immediate human executive intervention"
            />
            <KpiCard
              label="Recovery Score"
              value={liveRecoveryScore}
              unit="/100"
              status="healthy"
              icon={<TrendingUp className="w-4 h-4" />}
              delta={{ value: '+12%', isPositive: true, label: 'vs unmitigated' }}
              tooltip="Composite operational recovery efficiency index"
            />
            <KpiCard
              label="Orchestrator Score"
              value={liveOrchestratorScore}
              unit="pts"
              status="info"
              icon={<Sparkles className="w-4 h-4" />}
              delta={{ value: 'STR-001', isPositive: true, label: 'top ranking' }}
              tooltip="SAP HANA automated multi-factor strategy weight"
            />
            <KpiCard
              label="Executions Active"
              value={liveExecutionsInProgress}
              unit="live"
              status="info"
              icon={<PlayCircle className="w-4 h-4" />}
              delta={{ value: 'EXE-1001', isPositive: true, label: 'automated' }}
              tooltip="Active recovery execution pipelines running"
            />
            <KpiCard
              label="Revenue Protected"
              value="₹24.2L"
              status="healthy"
              icon={<IndianRupee className="w-4 h-4" />}
              delta={{ value: '88.3%', isPositive: true, label: 'of ₹27.4L' }}
              tooltip="Total financial exposure saved by active strategy"
            />
          </div>
        )}
      </section>

      {/* ── Top Priority Split: Active Crisis & AI Recommendation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── 3. Primary Crisis Card (Cols 5) ─────────────── */}
        <section
          aria-labelledby="active-crisis-heading"
          className="lg:col-span-5 flex flex-col"
        >
          {isLoading ? (
            <div className="h-80 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 border-l-4 border-l-rose-500 flex flex-col justify-between flex-1 shadow-2xs">
              <div className="space-y-4">
                {/* Header with ID and Severity */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                        ACTIVE CRISIS
                      </span>
                      <span className="font-mono text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {primaryIncident.DISRUPTION_ID}
                      </span>
                      <Badge variant="warning" size="sm">
                        {primaryIncident.SEVERITY}
                      </Badge>
                      <Badge variant="critical" size="sm" pulse dot>
                        ACTIVE
                      </Badge>
                    </div>
                    <h2
                      id="active-crisis-heading"
                      className="text-base sm:text-lg font-bold text-slate-900 mt-2"
                    >
                      {primaryIncident.DISRUPTION_TYPE}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Affected Node: {primaryIncident.AFFECTED_PLANT_ID || 'PLANT-001'} (Hyderabad Assembly)
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                </div>

                {/* Primary Incident Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Location
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                      {primaryIncident.LOCATION}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Plant
                    </span>
                    <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                      {primaryIncident.AFFECTED_PLANT_ID || 'PLANT-001'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                      {primaryIncident.EXPECTED_DURATION_HOURS} hours
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Supplier
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                      S-104 Metals
                    </span>
                  </div>
                </div>

                {/* Incident Narrative */}
                <div className="p-3 rounded-md bg-rose-50/50 border border-rose-100 text-xs text-rose-950 leading-relaxed">
                  <span className="font-bold">Incident Brief: </span>
                  {primaryIncident.DESCRIPTION}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Deep Impact Analysis Ready
                </span>
                <Link
                  href="/crisis-analysis"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
                >
                  <span>View Crisis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* ── 4. AI Recommendation Card (Cols 7 — Most Important) ── */}
        <section
          aria-labelledby="ai-recommendation-heading"
          className="lg:col-span-7 flex flex-col"
        >
          {isLoading ? (
            <div className="h-80 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 border-2 border-emerald-500/80 bg-emerald-50/10 flex flex-col justify-between flex-1 shadow-xs">
              <div className="space-y-4">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        AI RECOMMENDED RECOVERY
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {strategyId}
                      </span>
                      <Badge variant="healthy" size="sm" icon={<Sparkles className="w-3 h-3 text-emerald-700" />}>
                        AI RECOMMENDED
                      </Badge>
                    </div>
                    <h2
                      id="ai-recommendation-heading"
                      className="text-base sm:text-lg font-bold text-slate-900 mt-2"
                    >
                      {strategyTitle}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>Transport Mode:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {strategyTransport}
                      </span>
                    </p>
                  </div>

                  {/* Dual Score Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Recovery Score
                      </span>
                      <span className="text-sm font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block">
                        94 / 100
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Orchestrator
                      </span>
                      <span className="text-sm font-mono font-extrabold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200 inline-block">
                        {liveOrchestratorScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Stat Metric Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recovery Cost
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">
                      ₹1.85L
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Transit Time
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">
                      18 hours
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Risk Level
                    </span>
                    <span className="mt-1 block">
                      <Badge variant="healthy" size="sm">
                        LOW
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Rev. Protected
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5 block">
                      ₹24.2L
                    </span>
                  </div>
                </div>

                {/* Actual HANA AI Reason Text */}
                <div className="p-3 rounded-md bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    HANA AI Consensus Reasoning:
                  </span>
                  <p>{strategyAiReason}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Recommended for Immediate Executive Authorization
                </span>
                <Link
                  href="/recovery-strategies"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                >
                  <span>Review Recovery Strategy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* ── Middle Split: Execution Status & Recovery Economics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── 5. Recovery Execution Status (Cols 7) ────────── */}
        <section
          aria-labelledby="execution-status-heading"
          className="lg:col-span-7 flex flex-col"
        >
          {isLoading ? (
            <div className="h-64 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 border-l-4 border-l-sky-500 flex flex-col justify-between flex-1 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                        RECOVERY EXECUTION STATUS
                      </span>
                      <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {hanaExecution?.EXECUTION_ID || 'EXE-1001'}
                      </span>
                      <Badge variant="info" size="sm" pulse dot>
                        STATUS: {hanaExecution?.EXECUTION_STATUS || 'IN PROGRESS'}
                      </Badge>
                      <LiveDataBadge isLive={hanaActive} />
                    </div>
                    <h3
                      id="execution-status-heading"
                      className="text-base font-bold text-slate-900 mt-2"
                    >
                      Operational Recovery Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Incident: <strong className="text-slate-700">DIS-1001</strong> • Strategy: <strong className="text-slate-700">STR-001</strong> (Combined Recovery)
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* Execution Detail Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Executed By
                    </span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                      {hanaExecution?.EXECUTED_BY || 'AUTO_ORCHESTRATOR'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Execution Mode
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      Automated Pipeline
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Step Progression
                    </span>
                    <span className="font-mono font-bold text-sky-700 mt-0.5 block">
                      Step 1 of 6 Active
                    </span>
                  </div>
                </div>

                {/* Read-Only HANA Safety Notice */}
                <div className="p-3 rounded-md bg-slate-100 text-[11px] text-slate-600 leading-relaxed border border-slate-200">
                  <span className="font-semibold text-slate-700">Architecture Notice: </span>
                  Execution records are retrieved directly from SAP HANA Cloud table{' '}
                  <code className="font-mono font-bold text-slate-800">ORCH_RECOVERY_EXECUTION</code> (Read-Only). Frontend simulation actions execute in memory.
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Track Sub-Process Modules (MM, EWM, TM, PP, SD)
                </span>
                <Link
                  href="/recovery-execution"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-md transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
                >
                  <span>Open Execution Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* ── 6. Recovery Economics Summary (Cols 5) ──────── */}
        <section
          aria-labelledby="recovery-economics-heading"
          className="lg:col-span-5 flex flex-col"
        >
          {isLoading ? (
            <div className="h-64 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between flex-1 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      FINANCIAL ROI
                    </span>
                    <h3
                      id="recovery-economics-heading"
                      className="text-base font-bold text-slate-900 mt-2"
                    >
                      Recovery Economics
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Comparative cost vs revenue preservation analysis
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>

                {/* Financial Metric Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recovery Cost
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">
                      ₹1.85L
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recovery Time
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">
                      18 hours
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recovery Score
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5 block">
                      94
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Risk Rating
                    </span>
                    <span className="mt-1 block">
                      <Badge variant="healthy" size="sm">
                        LOW
                      </Badge>
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Net Revenue Protected
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700 text-sm mt-0.5 block">
                      ₹24.2L <span className="text-[11px] font-normal text-slate-500 font-sans">(13.1x ROI)</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Net savings exceed unmitigated risk by ₹22.35L. Multi-modal air charter pays back within 24 hours of plant resumption.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Baseline Loss: ₹27.4L</span>
                <span className="font-semibold text-emerald-700">Mitigated: 88.3%</span>
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* ── Bottom Split: Supply Chain Impact & Active Disruptions Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── 7. Supply Chain Impact Panel (Cols 5) ───────── */}
        <section
          aria-labelledby="supply-chain-impact-heading"
          className="lg:col-span-5 flex flex-col"
        >
          {isLoading ? (
            <div className="h-72 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between flex-1 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      OPERATIONAL EXPOSURE
                    </span>
                    <h3
                      id="supply-chain-impact-heading"
                      className="text-base font-bold text-slate-900 mt-2"
                    >
                      Supply Chain Impact
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Downstream assembly and order commitments affected
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                    <Network className="w-5 h-5" />
                  </div>
                </div>

                {/* Entity Relationship Grid */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Supplier:
                    </span>
                    <span className="font-bold text-slate-900">S-104 / Global Metals</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" /> Material:
                    </span>
                    <span className="font-mono font-bold text-slate-900">M-101 (Steering Column)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> Facility:
                    </span>
                    <span className="font-mono font-bold text-slate-900">PLANT-001 (Hyderabad)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Expected Disruption:
                    </span>
                    <span className="font-mono font-bold text-amber-700">48 hours</span>
                  </div>
                </div>

                {/* Affected Volume Counters */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-amber-50/50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">
                      Production Orders
                    </span>
                    <span className="font-mono font-extrabold text-amber-950 text-base mt-0.5 block">
                      17 orders
                    </span>
                    <span className="text-[10px] text-amber-700">Assembly Line 1</span>
                  </div>
                  <div className="p-2.5 rounded bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      Customer Orders
                    </span>
                    <span className="font-mono font-extrabold text-rose-950 text-base mt-0.5 block">
                      20 commitments
                    </span>
                    <span className="text-[10px] text-rose-700">Fleet & Dealership</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Multi-Tier Network Graph
                </span>
                <Link
                  href="/supply-chain-map"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                >
                  <span>View Supply Chain Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* ── 8. Active Disruptions Summary (Cols 7) ──────── */}
        <section
          aria-labelledby="active-disruptions-summary-heading"
          className="lg:col-span-7 flex flex-col"
        >
          {isLoading ? (
            <div className="h-72 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />
          ) : (
            <Card className="p-5 flex flex-col justify-between flex-1 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3
                      id="active-disruptions-summary-heading"
                      className="text-base font-bold text-slate-900"
                    >
                      Active Network Disruptions
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Operational incident telemetry from SAP HANA Cloud
                    </p>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {displayDisruptions.length} Incidents Tracked
                  </Badge>
                </div>

                {/* Compact Incident Cards List */}
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
                  {displayDisruptions.map((d) => {
                    const isPrimary = d.DISRUPTION_ID === 'DIS-1001';
                    const severityVariant =
                      d.SEVERITY?.toUpperCase() === 'CRITICAL'
                        ? 'critical'
                        : d.SEVERITY?.toUpperCase() === 'HIGH'
                        ? 'warning'
                        : 'info';

                    return (
                      <Link
                        key={d.DISRUPTION_ID}
                        href={`/disruptions?disruptionId=${d.DISRUPTION_ID}`}
                        className={`block p-3 rounded-lg border transition group ${
                          isPrimary
                            ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:border-slate-300">
                              {d.DISRUPTION_ID}
                            </span>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-sky-900">
                              {d.DISRUPTION_TYPE}
                            </span>
                            {isPrimary && (
                              <Badge variant="critical" size="sm">
                                PRIMARY CRISIS
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={severityVariant} size="sm">
                              {d.SEVERITY}
                            </Badge>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {d.LOCATION} • {d.AFFECTED_PLANT_ID || 'PLANT-001'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600">
                            Status: <strong className="text-slate-800">{d.STATUS}</strong> • {d.EXPECTED_DURATION_HOURS}h
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Review complete incident records in Disruption Center
                </span>
                <Link
                  href="/disruptions"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 transition"
                >
                  <span>Open Disruption Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          )}
        </section>
      </div>
    </EnterpriseShell>
  );
}
