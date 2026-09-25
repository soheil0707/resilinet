'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, IndianRupee, ShieldAlert, Award, ArrowRight, Check } from 'lucide-react';

export type CanonicalStrategyId = 'STR-001' | 'STR-002' | 'STR-003' | 'STR-004' | 'STR-005';

export interface StrategyCardProps {
  id: CanonicalStrategyId | string;
  name: string;
  description?: string;
  recoveryScore: number;
  orchestratorScore?: number;
  costInr: number;
  transitHoursOrDays: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  transportMode?: string;
  isRecommended?: boolean;
  isHumanOverride?: boolean;
  isSelected?: boolean;
  isApproved?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  id,
  name,
  description,
  recoveryScore,
  orchestratorScore,
  costInr,
  transitHoursOrDays,
  riskLevel,
  transportMode,
  isRecommended = false,
  isHumanOverride = false,
  isSelected = false,
  isApproved = false,
  onSelect,
  className = '',
}) => {
  const costLakhs = (costInr / 100000).toFixed(2);

  const riskBadgeVariant =
    riskLevel === 'LOW' ? 'healthy' : riskLevel === 'MEDIUM' ? 'warning' : 'critical';

  return (
    <Card
      className={`p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
        isApproved
          ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-xs'
          : isSelected
          ? 'border-2 border-sky-500 bg-sky-50/20 shadow-xs'
          : isRecommended
          ? 'border-2 border-emerald-400/80 shadow-2xs hover:border-emerald-500'
          : 'border border-slate-200 hover:border-slate-300'
      } ${className}`.trim()}
    >
      {/* Top Banner Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {id}
            </span>
            {isRecommended && (
              <Badge variant="healthy" size="sm" icon={<Award className="w-3 h-3 text-emerald-700" />}>
                AI RECOMMENDED
              </Badge>
            )}
            {isHumanOverride && (
              <Badge variant="warning" size="sm">
                ⚠ HUMAN OVERRIDE
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Score: {recoveryScore.toFixed(1)}
            </span>
            {orchestratorScore !== undefined && (
              <span className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200" title="SAP HANA Heuristic Score">
                HANA: {orchestratorScore.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{name}</h4>
          {description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Cost
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3 text-slate-400" />
              {costLakhs}L
            </span>
          </div>

          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Transit
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {transitHoursOrDays}
            </span>
          </div>

          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Risk Level
            </span>
            <span className="mt-0.5 block">
              <Badge variant={riskBadgeVariant} size="sm">
                {riskLevel}
              </Badge>
            </span>
          </div>
        </div>

        {transportMode && (
          <div className="text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-700">Mode: </span>
            <span className="font-mono">{transportMode}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {onSelect && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {isApproved ? 'Approved for Execution' : isSelected ? 'Selected Option' : 'Evaluation Option'}
          </div>
          <Button
            size="sm"
            variant={isApproved ? 'secondary' : isSelected ? 'primary' : 'outline'}
            onClick={onSelect}
            rightIcon={isApproved || isSelected ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          >
            {isApproved ? 'Approved' : isSelected ? 'Selected' : 'Select Strategy'}
          </Button>
        </div>
      )}
    </Card>
  );
};
