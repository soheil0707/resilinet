'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Loader2, Clock, PlayCircle, ShieldCheck, Info } from 'lucide-react';
import { ExecutionStep } from '@/lib/workflow/workflow-context';

export interface ExecutionConsoleProps {
  disruptionId: string; // e.g. DIS-1001
  executionId: string;  // e.g. EXE-1001
  strategyName: string;
  hanaStatus: string;   // e.g. IN_PROGRESS
  steps: ExecutionStep[];
  isApproved: boolean;
  isRunning: boolean;
  isComplete: boolean;
  onExecute?: () => void;
  className?: string;
}

const MODULE_COLORS: Record<string, string> = {
  'SAP MM': 'text-sky-700 bg-sky-50 border-sky-200',
  'SAP EWM': 'text-violet-700 bg-violet-50 border-violet-200',
  'SAP TM': 'text-amber-700 bg-amber-50 border-amber-200',
  'SAP PP': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'SAP SD': 'text-rose-700 bg-rose-50 border-rose-200',
  'SAP QM': 'text-indigo-700 bg-indigo-50 border-indigo-200',
};

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  disruptionId = 'DIS-1001',
  executionId = 'EXE-1001',
  strategyName,
  hanaStatus = 'IN_PROGRESS',
  steps,
  isApproved,
  isRunning,
  isComplete,
  onExecute,
  className = '',
}) => {
  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <Card className={`p-5 space-y-5 ${className}`.trim()}>
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {disruptionId}
            </span>
            <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              HANA {executionId}
            </span>
            <Badge variant={hanaStatus === 'IN_PROGRESS' ? 'info' : 'healthy'} size="sm" dot pulse>
              STATUS: {hanaStatus}
            </Badge>
          </div>
          <h3 className="text-base font-bold text-slate-900">{strategyName}</h3>
          <p className="text-xs text-slate-500">
            Automated SAP ERP execution sequence coordinated via SAP HANA Decision Orchestrator
          </p>
        </div>

        {onExecute && isApproved && !isComplete && (
          <Button
            variant="primary"
            size="md"
            isLoading={isRunning}
            onClick={onExecute}
            leftIcon={!isRunning ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : undefined}
          >
            {isRunning ? 'Executing SAP Actions...' : 'Start Recovery Execution'}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Simulated Action Sequence Progress</span>
          <span className="font-mono text-slate-900">
            {completedCount} / {steps.length} Actions ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Actions List */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const moduleStyle = MODULE_COLORS[step.module] || 'text-slate-700 bg-slate-50 border-slate-200';
          const isProcessing = step.status === 'PROCESSING';
          const isDone = step.status === 'COMPLETED';

          return (
            <div
              key={step.id || idx}
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : isProcessing
                  ? 'border-sky-300 bg-sky-50/40 ring-1 ring-sky-200'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Status Icon */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isProcessing ? (
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Action Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${moduleStyle}`}>
                    [SIMULATED - {step.module.replace('SAP ', '')}]
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{step.reference}</span>
                  {isDone && step.completedAt && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {step.completedAt}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDone ? 'font-semibold text-slate-800' : isProcessing ? 'font-bold text-sky-900' : 'text-slate-600'}`}>
                  {step.action}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 text-xs">
                {isDone && <Badge variant="healthy" size="sm">COMPLETED</Badge>}
                {isProcessing && <Badge variant="info" size="sm" pulse>PROCESSING</Badge>}
                {step.status === 'PENDING' && <Badge variant="neutral" size="sm">QUEUED</Badge>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Read-Only Governance Disclaimer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>Read-only SAP HANA integration. Client simulation does not mutate remote HANA records.</span>
        </span>
        <span className="font-mono font-semibold text-slate-400 shrink-0">HANA {executionId}</span>
      </div>
    </Card>
  );
};
