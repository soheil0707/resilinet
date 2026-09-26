'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import type { ExecutionStep, ExecutionStepStatus } from '@/lib/workflow/workflow-context';
import type { HanaRecoveryExecution } from '@/lib/hana/repository';
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  AlertTriangle,
  Server,
  Activity,
  FileText,
  User,
  Info,
  Layers,
  Bot,
  RefreshCw,
  RotateCcw,
  Check,
  Building,
  Truck,
  IndianRupee,
  Shield,
  Sliders,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';

// ─── Module Color Tokens ──────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  'SAP MM': 'text-sky-700 bg-sky-50 border-sky-200',
  'SAP EWM': 'text-violet-700 bg-violet-50 border-violet-200',
  'SAP TM': 'text-amber-700 bg-amber-50 border-amber-200',
  'SAP PP': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'SAP SD': 'text-rose-700 bg-rose-50 border-rose-200',
  'SAP QM': 'text-indigo-700 bg-indigo-50 border-indigo-200',
};

// ─── Canonical Strategy Reference Data ───────────────────────────────────────

const STRATEGY_NAMES: Record<string, string> = {
  'STR-001': 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
  'STR-002': 'Priority Air Freight',
  'STR-003': 'Alternative Supplier',
  'STR-004': 'Regional Inventory Transfer',
  'STR-005': 'Alternate Plant Production',
};

// ─── Fallback HANA Recovery Execution Records ─────────────────────────────────

const FALLBACK_EXECUTIONS: HanaRecoveryExecution[] = [
  {
    EXECUTION_ID: 'EXE-1001',
    DISRUPTION_ID: 'DIS-1001',
    STRATEGY_ID: 'STR-001',
    EXECUTION_STATUS: 'IN_PROGRESS',
    START_TIME: '2026-09-25 14:45:00',
    EXPECTED_COMPLETION: '2026-09-26 08:45:00',
    ACTUAL_COMPLETION: null,
    EXECUTED_BY: 'AUTO_ORCHESTRATOR',
    NOTES: 'Multi-modal transit initiated; priority air buffer leg dispatched',
  },
  {
    EXECUTION_ID: 'EXE-1002',
    DISRUPTION_ID: 'DIS-1002',
    STRATEGY_ID: 'STR-002',
    EXECUTION_STATUS: 'PLANNED',
    START_TIME: '2026-09-25 15:30:00',
    EXPECTED_COMPLETION: '2026-09-26 12:00:00',
    ACTUAL_COMPLETION: null,
    EXECUTED_BY: 'SYSTEM_PLANNER',
    NOTES: 'Awaiting secondary customs clearance release at airport hub',
  },
  {
    EXECUTION_ID: 'EXE-1003',
    DISRUPTION_ID: 'DIS-1003',
    STRATEGY_ID: 'STR-003',
    EXECUTION_STATUS: 'PLANNED',
    START_TIME: '2026-09-25 16:00:00',
    EXPECTED_COMPLETION: '2026-09-27 18:00:00',
    ACTUAL_COMPLETION: null,
    EXECUTED_BY: 'SYSTEM_PLANNER',
    NOTES: 'Supplier capacity reallocation scheduled with vendor Bharat Precision',
  },
  {
    EXECUTION_ID: 'EXE-1004',
    DISRUPTION_ID: 'DIS-1004',
    STRATEGY_ID: 'STR-004',
    EXECUTION_STATUS: 'PLANNED',
    START_TIME: '2026-09-26 09:00:00',
    EXPECTED_COMPLETION: '2026-09-28 17:00:00',
    ACTUAL_COMPLETION: null,
    EXECUTED_BY: 'SYSTEM_PLANNER',
    NOTES: 'Secondary plant buffer STO queued from PL-02 Chennai to PL-01',
  },
  {
    EXECUTION_ID: 'EXE-1005',
    DISRUPTION_ID: 'DIS-1005',
    STRATEGY_ID: 'STR-005',
    EXECUTION_STATUS: 'PLANNED',
    START_TIME: '2026-09-26 14:00:00',
    EXPECTED_COMPLETION: '2026-09-29 18:00:00',
    ACTUAL_COMPLETION: null,
    EXECUTED_BY: 'SYSTEM_PLANNER',
    NOTES: 'Coastal multimodal transit contingency scheduled',
  },
];

// ─── Loading Skeleton Component ──────────────────────────────────────────────

function RecoveryExecutionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading Recovery Execution">
      <div className="h-24 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-14 bg-slate-100 rounded-xl" />
      <div className="h-44 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-100 rounded-xl" />
        <div className="h-80 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Content Component (Consumes useSearchParams inside Suspense) ──────

function RecoveryExecutionContent() {
  const searchParams = useSearchParams();
  const disruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const {
    approvedStrategy,
    selectedStrategy,
    isOverride,
    workflowState,
    executionSteps,
    completeExecution,
    setWorkflowState,
  } = useWorkflow();

  const [steps, setSteps] = useState<ExecutionStep[]>(executionSteps);
  const [running, setRunning] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>('');
  const [completedAt, setCompletedAt] = useState<string>('');

  // Live SAP HANA Execution State
  const [hanaExecutions, setHanaExecutions] = useState<HanaRecoveryExecution[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>('EXE-1001');
  const [dataSource, setDataSource] = useState<'hana' | 'fallback'>('fallback');
  const [isLoadingHana, setIsLoadingHana] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Controlled HANA Write-Back State (Phase 32C-A)
  const [isCompletingHana, setIsCompletingHana] = useState<boolean>(false);
  const [writeBackError, setWriteBackError] = useState<string | null>(null);
  const [writeBackSuccess, setWriteBackSuccess] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch live execution records from SAP HANA Cloud ORCH_RECOVERY_EXECUTION
  const fetchExecutions = useCallback(async () => {
    try {
      const res = await fetch('/api/hana/recovery-execution');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setHanaExecutions(json.data);
          setDataSource('hana');
          return;
        }
      }
      setDataSource('fallback');
    } catch (err) {
      console.warn('Failed to load HANA recovery executions, using fallback:', err);
      setDataSource('fallback');
    } finally {
      setIsLoadingHana(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchExecutions();
  };

  // Sync steps whenever executionSteps changes in context
  useEffect(() => {
    if (!running && executionSteps && executionSteps.length > 0) {
      setSteps(executionSteps);
    }
  }, [executionSteps, running]);

  const executionList = hanaExecutions.length > 0 ? hanaExecutions : FALLBACK_EXECUTIONS;
  const activeExecution =
    executionList.find((e) => e.EXECUTION_ID === selectedExecutionId) ||
    executionList.find((e) => e.DISRUPTION_ID === disruptionId) ||
    executionList[0];

  const isApproved =
    workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED';
  const isComplete = steps.length > 0 && steps.every((s) => s.status === 'COMPLETED');

  // Client-side sequential action simulator
  const runExecution = useCallback(async () => {
    if (running || isComplete || steps.length === 0) return;
    setRunning(true);
    setWorkflowState('EXECUTING');
    const startStr = new Date().toLocaleTimeString('en-IN');
    setStartedAt(startStr);

    const currentSteps = [...steps];

    for (let i = 0; i < currentSteps.length; i++) {
      if (!isMountedRef.current) return;

      currentSteps[i] = { ...currentSteps[i], status: 'PROCESSING' };
      setSteps([...currentSteps]);

      const delayMs = 1100 + (i % 3) * 400;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      if (!isMountedRef.current) return;

      currentSteps[i] = {
        ...currentSteps[i],
        status: 'COMPLETED',
        completedAt: new Date().toLocaleTimeString('en-IN'),
      };
      setSteps([...currentSteps]);
    }

    if (!isMountedRef.current) return;

    setRunning(false);
    const endStr = new Date().toLocaleTimeString('en-IN');
    setCompletedAt(endStr);
    completeExecution(currentSteps);
  }, [running, isComplete, steps, completeExecution, setWorkflowState]);

  const handleResetSimulation = () => {
    if (running) return;
    const resetSteps = steps.map((s) => ({
      ...s,
      status: 'PENDING' as ExecutionStepStatus,
      completedAt: undefined,
    }));
    setSteps(resetSteps);
    setStartedAt('');
    setCompletedAt('');
  };

  const handleExecuteHanaCompletion = async () => {
    if (!isApproved) {
      setWriteBackError('Human approval is required before completing recovery execution.');
      setShowConfirmModal(false);
      return;
    }

    if (activeExecution.EXECUTION_ID !== 'EXE-1001') {
      setWriteBackError('Only execution record EXE-1001 is eligible for completion write-back in this phase.');
      setShowConfirmModal(false);
      return;
    }

    if (activeExecution.EXECUTION_STATUS !== 'IN_PROGRESS') {
      setWriteBackError(`Cannot complete execution: current HANA status is ${activeExecution.EXECUTION_STATUS}.`);
      setShowConfirmModal(false);
      return;
    }

    setIsCompletingHana(true);
    setWriteBackError(null);
    setWriteBackSuccess(null);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/hana/recovery-execution', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executionId: 'EXE-1001',
          notes: 'Execution completed via ResiliNet SCM Cockpit',
        }),
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        setWriteBackSuccess('Execution record EXE-1001 status updated to COMPLETED in SAP HANA Cloud.');
        // 1. Refresh live HANA execution records
        await fetchExecutions();
        // 2. Update local workflow state only after confirmed HANA success
        setWorkflowState('RECOVERED');
        // 3. Invalidate/revalidate dashboard and notifications across the platform
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('resilinet:dashboard-refresh'));
          window.dispatchEvent(new CustomEvent('resilinet:notifications-refresh'));
        }
      } else if (res.status === 401) {
        setWriteBackError('Authentication required.');
      } else if (res.status === 403) {
        setWriteBackError('You are not authorized to complete this execution.');
      } else if (res.status === 409) {
        setWriteBackError('This execution changed before your action completed. Refreshing live HANA state.');
        await fetchExecutions();
      } else if (res.status === 400) {
        setWriteBackError(data.error || 'Invalid request.');
      } else {
        setWriteBackError('Unable to update SAP HANA execution state. No completion was recorded.');
      }
    } catch (err) {
      console.error('SAP HANA write-back network error:', err);
      setWriteBackError('Unable to update SAP HANA execution state. No completion was recorded.');
    } finally {
      setIsCompletingHana(false);
    }
  };

  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // 7 Operational Execution Phases mapped to application/step state
  const executionPhases = useMemo(() => {
    const p1Status = isApproved ? 'COMPLETED' : 'READY';
    const p2Status =
      steps[0]?.status === 'COMPLETED'
        ? 'COMPLETED'
        : steps[0]?.status === 'PROCESSING'
        ? 'IN_PROGRESS'
        : isApproved
        ? 'READY'
        : 'PENDING';
    const p3Status =
      steps[2]?.status === 'COMPLETED'
        ? 'COMPLETED'
        : steps[2]?.status === 'PROCESSING'
        ? 'IN_PROGRESS'
        : 'PENDING';
    const p4Status =
      steps[1]?.status === 'COMPLETED'
        ? 'COMPLETED'
        : steps[1]?.status === 'PROCESSING'
        ? 'IN_PROGRESS'
        : 'PENDING';
    const p5Status =
      steps[3]?.status === 'COMPLETED'
        ? 'COMPLETED'
        : steps[3]?.status === 'PROCESSING'
        ? 'IN_PROGRESS'
        : 'PENDING';
    const p6Status =
      steps[4]?.status === 'COMPLETED'
        ? 'COMPLETED'
        : steps[4]?.status === 'PROCESSING'
        ? 'IN_PROGRESS'
        : 'PENDING';
    const p7Status = isComplete || workflowState === 'RECOVERED' ? 'COMPLETED' : 'PENDING';

    return [
      { id: 1, name: 'Recovery Plan Validated', status: p1Status, detail: 'AI recommendation & SCM approval verified' },
      { id: 2, name: 'Procurement Coordination', status: p2Status, detail: 'SAP MM purchase requisitions & vendor dispatch' },
      { id: 3, name: 'Inventory Allocation', status: p3Status, detail: 'SAP MM stock transfer reservation & buffer hold' },
      { id: 4, name: 'Multimodal Logistics', status: p4Status, detail: 'SAP TM carrier route & air dispatch confirmation' },
      { id: 5, name: 'Production Recovery', status: p5Status, detail: 'SAP PP shift schedules & material staging at PL-01' },
      { id: 6, name: 'Customer Commitment Protection', status: p6Status, detail: 'SAP SD order priority & OEM SLA fulfillment' },
      { id: 7, name: 'Recovery Confirmed', status: p7Status, detail: 'SAP EWM goods receipt confirmation & line restart' },
    ];
  }, [isApproved, steps, isComplete, workflowState]);

  if (isLoadingHana) {
    return <RecoveryExecutionSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. ENTERPRISE PAGE HEADER ─────────────────────────────── */}
      <PageHeader
        icon={<Activity className="w-5 h-5 text-sky-700" />}
        title="RECOVERY EXECUTION"
        description="Operational execution monitoring for approved supply-chain recovery actions."
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {disruptionId}
            </span>
            <LiveDataBadge isLive={dataSource === 'hana'} />
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
              Refresh Execution
            </Button>

            <Link href="/approval-center">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Back to Approval Center
              </Button>
            </Link>

            <Link href="/ai-command-center">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-800 hover:bg-slate-100">
                <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                AI Command Center
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. LIFECYCLE STEPPER ──────────────────────────────────── */}
      <LifecycleStepper currentStage="EXECUTE" incidentId={disruptionId} />

      {/* ── 3. EXECUTION STATUS HERO ──────────────────────────────── */}
      <Card className="border-2 border-sky-400 bg-sky-50/20 overflow-hidden shadow-xs">
        <CardHeader className="bg-sky-100/60 border-b border-sky-200/80 py-3.5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-600 text-white shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-sky-950 uppercase tracking-wider">
                    OPERATIONAL EXECUTION STATUS HERO
                  </CardTitle>
                  <span className="font-mono text-xs font-bold text-sky-900 bg-white/80 px-2 py-0.5 rounded border border-sky-300">
                    {activeExecution.EXECUTION_ID}
                  </span>
                </div>
                <p className="text-[11px] text-sky-800">
                  Live orchestration pipeline for incident <span className="font-mono font-bold">{activeExecution.DISRUPTION_ID}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge
                variant={activeExecution.EXECUTION_STATUS === 'COMPLETED' ? 'healthy' : 'info'}
                size="md"
                dot
                pulse={activeExecution.EXECUTION_STATUS !== 'COMPLETED'}
                className="font-mono text-xs font-bold"
              >
                {activeExecution.EXECUTION_STATUS === 'COMPLETED' ? 'EXECUTION COMPLETED' : 'EXECUTION IN PROGRESS'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {STRATEGY_NAMES[activeExecution.STRATEGY_ID] || activeExecution.STRATEGY_ID}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {activeExecution.STRATEGY_ID}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {activeExecution.NOTES || 'Multi-modal transit initiated; road express & air-freight buffer leg actively dispatched.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Orchestrator Mode</span>
                <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block">
                  {activeExecution.EXECUTED_BY || 'AUTO_ORCHESTRATOR'}
                </span>
              </div>
            </div>
          </div>

          {/* Canonical Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Execution ID
              </span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {activeExecution.EXECUTION_ID}
              </p>
              <p className="text-[10px] text-slate-500">Pipeline Ref</p>
            </div>

            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Disruption
              </span>
              <p className="text-lg font-bold font-mono text-red-700 mt-0.5">
                {activeExecution.DISRUPTION_ID}
              </p>
              <p className="text-[10px] text-slate-500">Supplier Delay</p>
            </div>

            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                HANA Status
              </span>
              <div className="mt-1">
                <Badge
                  variant={activeExecution.EXECUTION_STATUS === 'COMPLETED' ? 'healthy' : 'info'}
                  size="sm"
                  dot={activeExecution.EXECUTION_STATUS !== 'COMPLETED'}
                  pulse={activeExecution.EXECUTION_STATUS !== 'COMPLETED'}
                >
                  {activeExecution.EXECUTION_STATUS}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Live Database State</p>
            </div>

            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Execution Mode
              </span>
              <p className="text-xs font-bold font-mono text-slate-800 mt-1.5 truncate">
                {activeExecution.EXECUTED_BY}
              </p>
              <p className="text-[10px] text-slate-500">Automated Dispatch</p>
            </div>

            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Start Time
              </span>
              <p className="text-xs font-bold font-mono text-slate-900 mt-1.5 truncate">
                {activeExecution.START_TIME || '2026-09-25 14:45'}
              </p>
              <p className="text-[10px] text-slate-500">Initial Dispatch</p>
            </div>

            <div className="bg-white rounded-lg border border-sky-200/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {activeExecution.ACTUAL_COMPLETION ? 'Actual Completion' : 'Expected Completion'}
              </span>
              <p className="text-xs font-bold font-mono text-slate-900 mt-1.5 truncate">
                {activeExecution.ACTUAL_COMPLETION || activeExecution.EXPECTED_COMPLETION || '2026-09-26 08:45'}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                {activeExecution.ACTUAL_COMPLETION ? 'Authoritative HANA UTC' : '18h Window'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. APPROVAL & GOVERNANCE CONTEXT ───────────────────────── */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              DECISION-TO-EXECUTION GOVERNANCE CONTEXT
            </h4>
            <p className="text-xs text-slate-500">
              Operational commands are bound to formal human sign-off recorded in the Approval Center.
            </p>
          </div>

          {/* 3-Stage Visual Pipeline */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
            {/* Stage 1 */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                1
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Decision</span>
                <span className="font-bold text-emerald-800">COMPUTED (STR-001)</span>
              </div>
            </div>

            <span className="text-slate-400 font-bold">→</span>

            {/* Stage 2 */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                2
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Human Approval</span>
                {isApproved ? (
                  <span className="font-bold text-sky-800">AUTHORIZED (SCM)</span>
                ) : (
                  <span className="font-bold text-amber-700">AWAITING APPROVAL</span>
                )}
              </div>
            </div>

            <span className="text-slate-400 font-bold">→</span>

            {/* Stage 3 */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 border border-sky-200">
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
                3
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-sky-600 block">Execution Pipeline</span>
                <span className="font-mono font-bold text-slate-900">EXE-1001 • IN PROGRESS</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 5. EXECUTION PIPELINE (7 PHASES) ───────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              END-TO-END OPERATIONAL EXECUTION TIMELINE (7 PHASES)
            </h3>
            <p className="text-xs text-slate-500">
              Real-world progression from plan authorization to line replenishment at PL-01 Hyderabad
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Pipeline: EXE-1001 • Status: IN_PROGRESS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {executionPhases.map((phase) => {
            const isPhaseDone = phase.status === 'COMPLETED';
            const isPhaseActive = phase.status === 'IN_PROGRESS';
            const isPhaseReady = phase.status === 'READY';

            return (
              <div
                key={phase.id}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                  isPhaseDone
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : isPhaseActive
                    ? 'border-sky-300 bg-sky-50/50 ring-1 ring-sky-300'
                    : isPhaseReady
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50/50 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-slate-400">
                    PHASE 0{phase.id}
                  </span>
                  {isPhaseDone ? (
                    <Badge variant="healthy" size="sm">
                      COMPLETED
                    </Badge>
                  ) : isPhaseActive ? (
                    <Badge variant="info" size="sm" dot pulse>
                      IN PROGRESS
                    </Badge>
                  ) : isPhaseReady ? (
                    <Badge variant="neutral" size="sm">
                      READY
                    </Badge>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">PENDING</span>
                  )}
                </div>

                <p className="font-bold text-slate-900 text-xs">{phase.name}</p>
                <p className="text-[11px] text-slate-500 leading-normal">{phase.detail}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 9. & 10. STRATEGY CONTEXT & OPERATIONAL IMPACT ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 9: RECOVERY STRATEGY CONTEXT */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  STRATEGY DECISION METRICS (STR-001)
                </h3>
              </div>
              <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                TIER-1 OPTIMAL
              </Badge>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Baseline parameters computed by SAP HANA AI Decision Layer for strategy <strong className="font-mono text-slate-800">STR-001 — Combined Recovery</strong>:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recovery Score</span>
                <span className="font-mono text-emerald-700 font-bold text-base mt-0.5 block">94 / 100</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Orchestrator Score</span>
                <span className="font-mono text-slate-800 font-bold text-base mt-0.5 block">82.30</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Cost</span>
                <span className="font-mono text-slate-800 font-bold text-base mt-0.5 block">₹1.85L</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transit Window</span>
                <span className="font-mono text-slate-800 font-bold text-base mt-0.5 block">18h</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Level</span>
                <span className="mt-1 block">
                  <Badge variant="healthy" size="sm">LOW</Badge>
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transport Mode</span>
                <span className="font-mono text-slate-800 font-bold text-[11px] mt-1 block truncate">MULTI-MODAL + AIR</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 italic">
            Note: Figures represent initial optimization constraints, not finalized settlement costs.
          </div>
        </Card>

        {/* Section 10: OPERATIONAL IMPACT */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  OPERATIONAL RESILIENCE IMPACT
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Plant: PLANT-001 (HYD)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Revenue Protected
                </span>
                <p className="text-lg font-bold font-mono text-emerald-700">₹24.2L</p>
                <p className="text-[11px] text-slate-600">
                  Customer order value safeguarded against line shutdown
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Inventory Buffer Impact
                </span>
                <p className="text-lg font-bold font-mono text-slate-800">M-101 Replenished</p>
                <p className="text-[11px] text-slate-600">
                  Stock replenishment prevents buffer exhaustion at 2.4 days
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Commitments
                </span>
                <p className="text-lg font-bold font-mono text-slate-800">20 Fleet Deliveries</p>
                <p className="text-[11px] text-slate-600">
                  Tier-1 fleet contracts preserved; 0 OEM penalty activations
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Production Impact
                </span>
                <p className="text-lg font-bold font-mono text-slate-800">17 Orders Secured</p>
                <p className="text-[11px] text-slate-600">
                  Zero shift cancelations at Hyderabad Main Assembly
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Validated against live SAP HANA incident context DIS-1001.
          </div>
        </Card>
      </div>

      {/* ── 8. & 11. EXECUTION DETAIL CONSOLE (ACTION STEPS) ──────── */}
      <Card className="p-5 border-2 border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {activeExecution.DISRUPTION_ID}
              </span>
              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {activeExecution.EXECUTION_ID}
              </span>
              <Badge variant="info" size="sm" dot pulse>
                STATUS: {activeExecution.EXECUTION_STATUS}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {STRATEGY_NAMES[activeExecution.STRATEGY_ID] || activeExecution.STRATEGY_ID}
            </h3>
            <p className="text-xs text-slate-500">
              Simulated SAP ERP action pipeline coordinating procurement, freight, warehousing, and shop floor scheduling
            </p>
          </div>

          {/* Execution Simulation Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isComplete && (
              <Button
                onClick={runExecution}
                disabled={running}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Executing Pipeline…
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Start Execution Simulation
                  </>
                )}
              </Button>
            )}

            {completedCount > 0 && !running && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSimulation}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Reset
              </Button>
            )}

            {activeExecution.EXECUTION_STATUS === 'COMPLETED' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                HANA STATUS: COMPLETED
              </div>
            ) : isComplete && workflowState !== 'RECOVERED' ? (
              <Button
                size="sm"
                onClick={() => setShowConfirmModal(true)}
                disabled={isCompletingHana || !isApproved}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {isCompletingHana ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Updating SAP HANA…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Mark Recovered (HANA Write-Back)
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Write-Back Status Feedback Banners */}
        {writeBackSuccess && (
          <div className="p-3 my-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>HANA Write-Back Confirmed:</strong> {writeBackSuccess}
              </span>
            </div>
            <button
              onClick={() => setWriteBackSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {writeBackError && (
          <div className="p-3 my-2 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>HANA Write-Back Error:</strong> {writeBackError}
              </span>
            </div>
            <button
              onClick={() => setWriteBackError(null)}
              className="text-rose-700 hover:text-rose-900 text-[11px] font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Progress Bar & Banner */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Simulated Action Sequence Progress</span>
            <span className="font-mono text-slate-900">
              {completedCount} / {steps.length} Actions ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isComplete ? 'bg-emerald-500' : 'bg-sky-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <strong>CONTROLLED WRITE-BACK:</strong> Live SAP HANA execution state transitions for EXE-1001 upon marking recovered.
            </span>
            {startedAt && (
              <span className="font-mono text-slate-600">
                Started: {startedAt} {completedAt && `• Completed: ${completedAt}`}
              </span>
            )}
          </div>
        </div>

        {/* Step-by-Step Action List */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
          {steps.map((step, idx) => {
            const moduleColor = MODULE_COLORS[step.module] || 'text-slate-700 bg-slate-50 border-slate-200';
            const isStepDone = step.status === 'COMPLETED';
            const isStepProcessing = step.status === 'PROCESSING';

            return (
              <div
                key={step.id}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  isStepDone
                    ? 'bg-emerald-50/50'
                    : isStepProcessing
                    ? 'bg-sky-50/80 border-l-4 border-l-sky-500'
                    : 'bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isStepDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isStepProcessing ? (
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center text-[9px] font-bold text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${moduleColor}`}>
                      [SIMULATED SAP ACTION - {step.module.replace('SAP ', '')}]
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{step.reference}</span>
                    {isStepDone && step.completedAt && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {step.completedAt}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isStepDone
                        ? 'text-slate-800 font-medium'
                        : isStepProcessing
                        ? 'text-sky-950 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.action}
                  </p>
                </div>

                <div className="shrink-0 text-[10px] font-bold">
                  {isStepDone && (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                      COMPLETED
                    </span>
                  )}
                  {isStepProcessing && (
                    <span className="text-sky-700 bg-sky-100 px-2 py-0.5 rounded animate-pulse font-mono">
                      PROCESSING
                    </span>
                  )}
                  {step.status === 'PENDING' && (
                    <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      QUEUED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 7. EXECUTION REGISTER (TABLE) ─────────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-600" />
              SAP HANA EXECUTION REGISTER (ORCH_RECOVERY_EXECUTION)
            </h3>
            <p className="text-xs text-slate-500">
              Query results from live SAP HANA Cloud table. Select any row to inspect execution details.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {executionList.length} Execution Records • Schema: HACKFEST0145
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Execution ID</th>
                <th className="py-2.5 px-3">Disruption</th>
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Execution Mode</th>
                <th className="py-2.5 px-3">Started</th>
                <th className="py-2.5 px-3">Expected Completion</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {executionList.map((exe) => {
                const isSelected = activeExecution.EXECUTION_ID === exe.EXECUTION_ID;
                const statusBadgeVariant =
                  exe.EXECUTION_STATUS === 'IN_PROGRESS'
                    ? 'info'
                    : exe.EXECUTION_STATUS === 'COMPLETED'
                    ? 'healthy'
                    : exe.EXECUTION_STATUS === 'FAILED'
                    ? 'critical'
                    : 'warning';

                return (
                  <tr
                    key={exe.EXECUTION_ID}
                    onClick={() => setSelectedExecutionId(exe.EXECUTION_ID)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/60 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {exe.EXECUTION_ID}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {exe.DISRUPTION_ID}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-900 font-bold">{exe.STRATEGY_ID}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {STRATEGY_NAMES[exe.STRATEGY_ID] || 'Active Strategy'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={statusBadgeVariant} size="sm" dot={exe.EXECUTION_STATUS === 'IN_PROGRESS'}>
                        {exe.EXECUTION_STATUS}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {exe.EXECUTED_BY}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      {exe.START_TIME || 'Pending'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      {exe.EXPECTED_COMPLETION || 'Open'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExecutionId(exe.EXECUTION_ID);
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 12., 13. & 14. BOUNDARY & AUDIT SUMMARY ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 12 & 13: COMPLETION BOUNDARY */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  GOVERNANCE & COMPLETION BOUNDARY
                </h3>
              </div>
              <Badge variant="healthy" size="sm" className="font-mono text-[9px]">
                AUDIT ENFORCED
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              To prevent operational ambiguity, ResiliNet strictly separates lifecycle states:
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs mb-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans">1. Strategy Selected:</span>
                <span className="font-bold text-slate-900">DECIDE Stage Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans">2. Strategy Approved:</span>
                <span className="font-bold text-emerald-800">APPROVE Stage Signed Off</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans">3. Execution Started:</span>
                <span className="font-bold text-sky-800">EXECUTE Pipeline Dispatching</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans">4. Recovery Completed:</span>
                <span className="font-bold text-slate-700">Goods Ingested at Plant</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              <strong>Architecture Note:</strong> Controlled write-back updates live SAP HANA Cloud table ORCH_RECOVERY_EXECUTION (EXE-1001). Local workflow state synchronizes only after authoritative HANA confirmation.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            Audit Boundary: Astra Motors SCM Policy 4.2
          </div>
        </Card>

        {/* Section 14: EXECUTION AUDIT SUMMARY */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  EXECUTION AUDIT SUMMARY
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Ref: EXE-1001</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Execution ID:</span>
                <span className="font-mono font-bold text-slate-900">{activeExecution.EXECUTION_ID}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Disruption ID:</span>
                <span className="font-mono font-bold text-red-700">{activeExecution.DISRUPTION_ID}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Strategy:</span>
                <span className="font-mono font-bold text-slate-900">{activeExecution.STRATEGY_ID}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Approval State:</span>
                <span>
                  {isApproved ? (
                    <Badge variant="healthy" size="sm">Human Approved</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Awaiting Human Approval</Badge>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Execution State:</span>
                <span className="font-mono font-bold text-sky-800">{activeExecution.EXECUTION_STATUS}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Execution Mode:</span>
                <span className="font-mono text-slate-800">{activeExecution.EXECUTED_BY}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Start Time:</span>
                <span className="font-mono text-slate-800">{activeExecution.START_TIME}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Expected Completion:</span>
                <span className="font-mono text-slate-800">{activeExecution.EXPECTED_COMPLETION}</span>
              </div>

              {activeExecution.ACTUAL_COMPLETION && (
                <div className="flex justify-between py-1 border-b border-slate-100 bg-emerald-50/60 px-1.5 rounded">
                  <span className="text-emerald-800 font-semibold">Actual Completion (HANA):</span>
                  <span className="font-mono text-emerald-800 font-bold">{activeExecution.ACTUAL_COMPLETION}</span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Data Source:</span>
                <span className="font-medium text-slate-800">
                  {dataSource === 'hana' ? 'SAP HANA Cloud (Live)' : 'Canonical Fallback Record'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Audit Trail Verified</span>
            <span className="font-mono text-[10px]">Log ID: AUD-EXE-1001</span>
          </div>
        </Card>
      </div>

      {/* ── 15. NAVIGATION ACTIONS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <Link href="/approval-center" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              VIEW APPROVAL CENTER
            </Button>
          </Link>

          <Link href={`/recovery-strategies?disruptionId=${encodeURIComponent(disruptionId)}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs w-full sm:w-auto">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              VIEW RECOVERY STRATEGIES
            </Button>
          </Link>
        </div>

        <Link href="/ai-command-center" className="w-full sm:w-auto">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold w-full sm:w-auto">
            <Bot className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            <span>RETURN TO COMMAND CENTER</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* ── 16. CONFIRMATION MODAL FOR SAP HANA WRITE-BACK ─────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isCompletingHana && setShowConfirmModal(false)}
        title="Confirm SAP HANA Execution Completion"
        description="Formal operational write-back to SAP HANA Cloud (Schema: HACKFEST0145)"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isCompletingHana}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteHanaCompletion}
              disabled={isCompletingHana}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              {isCompletingHana ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Writing to SAP HANA…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Confirm & Write to SAP HANA
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed">
            You are about to commit an operational completion write-back to SAP HANA Cloud for execution record <strong className="font-mono text-slate-900">EXE-1001</strong>.
          </p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Execution ID:</span>
              <span className="font-bold text-slate-900">EXE-1001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Disruption / Strategy:</span>
              <span className="font-bold text-slate-800">DIS-1001 / STR-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Current Status:</span>
              <span className="font-bold text-sky-700">IN_PROGRESS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Target Status:</span>
              <span className="font-bold text-emerald-700">COMPLETED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Timestamp Source:</span>
              <span className="text-slate-700">HANA CURRENT_UTCTIMESTAMP</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Optimistic Locking Enforced:</strong> This transaction will succeed only if the execution status in SAP HANA Cloud is currently <code className="font-bold">IN_PROGRESS</code>. If another coordinator modified this record, the update will be rejected.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Default Page Export (Wrapped in EnterpriseShell & Suspense) ─────────────

export default function RecoveryExecutionPage() {
  return (
    <EnterpriseShell>
      <Suspense fallback={<RecoveryExecutionSkeleton />}>
        <RecoveryExecutionContent />
      </Suspense>
    </EnterpriseShell>
  );
}
