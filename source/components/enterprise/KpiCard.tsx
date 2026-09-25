import React from 'react';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';

export type KpiStatus = 'critical' | 'warning' | 'healthy' | 'info' | 'neutral';

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: KpiStatus;
  delta?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  tooltip?: string;
  description?: string;
  className?: string;
}

const STATUS_BORDER_MAP: Record<KpiStatus, string> = {
  critical: 'border-l-4 border-l-red-500',
  warning: 'border-l-4 border-l-amber-500',
  healthy: 'border-l-4 border-l-emerald-500',
  info: 'border-l-4 border-l-sky-500',
  neutral: 'border-l-4 border-l-slate-300',
};

const VALUE_COLOR_MAP: Record<KpiStatus, string> = {
  critical: 'text-red-600',
  warning: 'text-amber-600',
  healthy: 'text-emerald-700',
  info: 'text-sky-700',
  neutral: 'text-slate-900',
};

const ICON_BG_MAP: Record<KpiStatus, string> = {
  critical: 'bg-red-50 text-red-600 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  healthy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border border-sky-200',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  icon,
  status = 'neutral',
  delta,
  tooltip,
  description,
  className = '',
}) => {
  const borderHighlight = STATUS_BORDER_MAP[status];
  const valueColor = VALUE_COLOR_MAP[status];
  const iconStyle = ICON_BG_MAP[status];

  return (
    <Card className={`p-4 transition-all hover:shadow-xs ${borderHighlight} ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {label}
            </span>
            {tooltip && <Tooltip content={tooltip} />}
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-2xl font-extrabold tracking-tight font-mono ${valueColor}`}>
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </div>

          {description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed mt-0.5">
              {description}
            </p>
          )}

          {delta && (
            <div className="flex items-center gap-1 text-xs mt-1">
              <span
                className={`font-semibold ${
                  delta.isPositive ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {delta.value}
              </span>
              {delta.label && <span className="text-slate-400">{delta.label}</span>}
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${iconStyle}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
