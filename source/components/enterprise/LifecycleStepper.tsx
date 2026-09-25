import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export type LifecycleStage = 'MONITOR' | 'ANALYZE' | 'DECIDE' | 'APPROVE' | 'EXECUTE';

export interface LifecycleStepperProps {
  currentStage: LifecycleStage;
  incidentId?: string;
  className?: string;
}

const STAGES: { key: LifecycleStage; label: string; href?: string }[] = [
  { key: 'MONITOR', label: 'Monitor' },
  { key: 'ANALYZE', label: 'Analyze' },
  { key: 'DECIDE', label: 'Decide' },
  { key: 'APPROVE', label: 'Approve' },
  { key: 'EXECUTE', label: 'Execute' },
];

const STAGE_ORDER: Record<LifecycleStage, number> = {
  MONITOR: 1,
  ANALYZE: 2,
  DECIDE: 3,
  APPROVE: 4,
  EXECUTE: 5,
};

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({
  currentStage,
  incidentId = 'DIS-1001',
  className = '',
}) => {
  const currentStepNum = STAGE_ORDER[currentStage] || 1;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`.trim()}
    >
      {/* Context Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Resilience Lifecycle
        </span>
        {incidentId && (
          <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            {incidentId}
          </span>
        )}
      </div>

      {/* Stepper Pipeline */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 md:justify-end">
        {STAGES.map((s, idx) => {
          const stepNum = STAGE_ORDER[s.key];
          const isCompleted = stepNum < currentStepNum;
          const isCurrent = stepNum === currentStepNum;
          const isUpcoming = stepNum > currentStepNum;

          return (
            <React.Fragment key={s.key}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all select-none ${
                  isCurrent
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-200 font-medium'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                {isCurrent && <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                {isUpcoming && <span className="text-[11px] text-slate-400 font-mono">{idx + 1}.</span>}
                <span>{s.label}</span>
              </div>

              {idx < STAGES.length - 1 && (
                <span className="text-slate-300 hidden sm:inline select-none">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
