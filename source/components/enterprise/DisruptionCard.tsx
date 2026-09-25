import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertOctagon, Building2, Package, Clock, IndianRupee } from 'lucide-react';

export interface DisruptionCardProps {
  id: string; // e.g. DIS-1001
  title: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  plant: string;
  material: string;
  supplier: string;
  revenueAtRisk?: string | number;
  bufferDays?: number;
  durationHours?: number;
  status?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const DisruptionCard: React.FC<DisruptionCardProps> = ({
  id,
  title,
  type,
  severity,
  plant,
  material,
  supplier,
  revenueAtRisk,
  bufferDays,
  durationHours,
  status = 'ACTIVE',
  actions,
  className = '',
}) => {
  const badgeVariant =
    severity === 'CRITICAL' ? 'critical' : severity === 'HIGH' ? 'warning' : 'info';

  return (
    <Card className={`p-5 border-l-4 border-l-red-500 space-y-4 ${className}`.trim()}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {id}
            </span>
            <Badge variant={badgeVariant} size="sm">
              {severity} SEVERITY
            </Badge>
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              Status: {status}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 font-medium">Type: {type}</p>
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* Affected Entity Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" /> Plant
          </span>
          <p className="font-semibold text-slate-800">{plant}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Package className="w-3 h-3 text-slate-400" /> Material
          </span>
          <p className="font-semibold text-slate-800">{material}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Supplier
          </span>
          <p className="font-semibold text-slate-800 truncate">{supplier}</p>
        </div>
      </div>

      {/* Impact Indicators */}
      {(revenueAtRisk !== undefined || bufferDays !== undefined || durationHours !== undefined) && (
        <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
          {revenueAtRisk !== undefined && (
            <div className="flex items-center gap-1 text-slate-700">
              <IndianRupee className="w-3.5 h-3.5 text-red-500" />
              <span>Revenue at risk: </span>
              <strong className="font-mono text-red-600">{revenueAtRisk}</strong>
            </div>
          )}

          {bufferDays !== undefined && (
            <div className="flex items-center gap-1 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Buffer coverage: </span>
              <strong className="font-mono text-amber-600">{bufferDays} Days</strong>
            </div>
          )}

          {durationHours !== undefined && (
            <div className="flex items-center gap-1 text-slate-700">
              <AlertOctagon className="w-3.5 h-3.5 text-slate-400" />
              <span>Duration: </span>
              <strong className="font-mono text-slate-800">{durationHours} Hours</strong>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
