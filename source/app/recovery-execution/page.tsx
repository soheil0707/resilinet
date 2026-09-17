'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import type { ExecutionStep, ExecutionStepStatus } from '@/lib/workflow/workflow-context';
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const MODULE_COLORS: Record<string, string> = {
  'SAP MM':  'text-sky-700 bg-sky-50 border-sky-200',
  'SAP EWM': 'text-violet-700 bg-violet-50 border-violet-200',
  'SAP TM':  'text-amber-700 bg-amber-50 border-amber-200',
  'SAP PP':  'text-emerald-700 bg-emerald-50 border-emerald-200',
  'SAP SD':  'text-rose-700 bg-rose-50 border-rose-200',
};

const STEP_DELAYS_MS = [1800, 2400, 3000, 2200, 2000];

export default function RecoveryExecutionPage() {
  const { approvedStrategy, workflowState, executionSteps, completeExecution } = useWorkflow();

  const [steps, setSteps] = useState<ExecutionStep[]>(executionSteps);
  const [running, setRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string>('');
  const [completedAt, setCompletedAt] = useState<string>('');

  const isApproved = workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED';
  const isComplete = steps.every((s) => s.status === 'COMPLETED');

  const runExecution = useCallback(async () => {
    if (running || isComplete) return;
    setRunning(true);
    setStartedAt(new Date().toLocaleTimeString('en-IN'));

    const updatedSteps = [...steps];
    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStepIdx(i);
      updatedSteps[i] = { ...updatedSteps[i], status: 'PROCESSING' };
      setSteps([...updatedSteps]);

      await new Promise((r) => setTimeout(r, STEP_DELAYS_MS[i]));

      updatedSteps[i] = {
        ...updatedSteps[i],
        status: 'COMPLETED',
        completedAt: new Date().toLocaleTimeString('en-IN'),
      };
      setSteps([...updatedSteps]);
    }

    setCurrentStepIdx(null);
    setRunning(false);
    setCompletedAt(new Date().toLocaleTimeString('en-IN'));
    completeExecution(updatedSteps);
  }, [running, isComplete, steps, completeExecution]);

  function getStatusIcon(status: ExecutionStepStatus, idx: number) {
    if (status === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'PROCESSING') return <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />;
    return (
      <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
        <span className="text-[9px] font-bold text-slate-400">{idx + 1}</span>
      </div>
    );
  }

  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded border ${isComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                {isComplete ? <ShieldCheck className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Recovery Execution & SAP Orchestration Console</h2>
                <p className="text-xs text-slate-500">
                  Live execution of 5 simulated SAP actions — Incident DIS-2026-001
                </p>
              </div>
            </div>
            {isComplete && (
              <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ ALL ACTIONS COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* ── Approval Gate ─────────────────────────────────────── */}
        {!isApproved && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">Approval Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Recovery execution is locked until Supply Chain Manager approval is obtained. Complete the formal sign-off in the Approval Center to enable this console.
                </p>
                <Link
                  href="/approval-center"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition"
                >
                  Go to Approval Center
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Strategy Reminder ─────────────────────────────────── */}
        {isApproved && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Executing Strategy</p>
                <p className="text-sm font-bold text-slate-900">
                  {approvedStrategy?.name || 'Combined Recovery (Multi-Modal Transfer + Priority Air)'}
                </p>
              </div>
              <div className="flex gap-4 text-xs">
                {[
                  { label: 'Cost', value: '₹2.1L' },
                  { label: 'Recovery Time', value: '1 Day' },
                  { label: 'Revenue Protected', value: '₹24.2L' },
                  { label: 'Score', value: '94.0' },
                ].map((kpi) => (
                  <div key={kpi.label} className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase">{kpi.label}</p>
                    <p className="text-sm font-bold font-mono text-slate-800">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Execution Progress Bar ────────────────────────────── */}
        {isApproved && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">Execution Progress</p>
              <p className="text-xs font-mono text-slate-600">{completedCount} / {steps.length} actions</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {startedAt && (
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Started: {startedAt}</span>
                {completedAt && <span>Completed: {completedAt}</span>}
              </div>
            )}
          </div>
        )}

        {/* ── SAP Action Steps ─────────────────────────────────── */}
        {isApproved && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Simulated SAP Action Pipeline</p>
                <p className="text-xs text-slate-500">
                  Actions executed sequentially. All operations are tagged <code className="bg-slate-100 px-1 rounded text-[10px]">[SIMULATED SAP ACTION]</code> for demonstration purposes.
                </p>
              </div>
              {!isComplete && (
                <button
                  onClick={runExecution}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-md transition"
                >
                  {running ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…</>
                  ) : (
                    <><PlayCircle className="w-3.5 h-3.5" /> Execute Simulated SAP Recovery</>
                  )}
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {steps.map((step, idx) => {
                const moduleColor = MODULE_COLORS[step.module] || 'text-slate-700 bg-slate-50 border-slate-200';
                return (
                  <div
                    key={step.id}
                    className={`p-4 flex items-start gap-4 transition-all ${
                      step.status === 'COMPLETED' ? 'bg-emerald-50' :
                      step.status === 'PROCESSING' ? 'bg-sky-50' :
                      'bg-white'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getStatusIcon(step.status, idx)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${moduleColor}`}>
                          [SIMULATED SAP ACTION - {step.module.replace('SAP ', '')}]
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{step.reference}</span>
                        {step.status === 'COMPLETED' && step.completedAt && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.completedAt}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${
                        step.status === 'COMPLETED' ? 'text-slate-700' :
                        step.status === 'PROCESSING' ? 'text-sky-800 font-semibold' :
                        'text-slate-400'
                      }`}>
                        {step.action}
                      </p>
                    </div>

                    <div className="shrink-0 text-[10px] font-bold">
                      {step.status === 'COMPLETED' && <span className="text-emerald-600">DONE</span>}
                      {step.status === 'PROCESSING' && <span className="text-sky-600">RUNNING</span>}
                      {step.status === 'PENDING' && <span className="text-slate-300">QUEUED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Completion Actions ─────────────────────────────────── */}
        {isComplete && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-base font-bold text-emerald-900">Recovery Execution Complete</p>
                <p className="text-xs text-emerald-700">
                  All 5 SAP actions executed successfully. Delay mitigated: 7 Days → 1 Day. Revenue protected: ₹24.2L.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/resilience-memory"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
              >
                <Database className="w-4 h-4 text-sky-300" />
                Record in Resilience Memory
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-md transition"
              >
                View Updated Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {!isComplete && isApproved && !running && completedCount === 0 && (
          <div className="flex gap-3">
            <Link
              href="/approval-center"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              ← Back to Approval Center
            </Link>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}
