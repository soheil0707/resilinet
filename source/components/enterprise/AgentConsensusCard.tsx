import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface AgentConsensusCardProps {
  id: string;
  name: string;
  roleIcon: React.ReactNode;
  finding: string;
  recommendation: string;
  confidence: number;
  badge?: string;
  voteLabel: string;
  keyFindings?: string[];
  themeColor?: 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal';
  className?: string;
}

const THEME_CLASSES = {
  sky: { border: 'border-sky-200', bg: 'bg-sky-50/50', icon: 'bg-sky-50 text-sky-700 border-sky-200' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/50', icon: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  violet: { border: 'border-violet-200', bg: 'bg-violet-50/50', icon: 'bg-violet-50 text-violet-700 border-violet-200' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50/50', icon: 'bg-amber-50 text-amber-700 border-amber-200' },
  rose: { border: 'border-rose-200', bg: 'bg-rose-50/50', icon: 'bg-rose-50 text-rose-700 border-rose-200' },
  teal: { border: 'border-teal-200', bg: 'bg-teal-50/50', icon: 'bg-teal-50 text-teal-700 border-teal-200' },
};

export const AgentConsensusCard: React.FC<AgentConsensusCardProps> = ({
  id,
  name,
  roleIcon,
  finding,
  recommendation,
  confidence,
  badge,
  voteLabel,
  keyFindings,
  themeColor = 'sky',
  className = '',
}) => {
  const theme = THEME_CLASSES[themeColor] || THEME_CLASSES.sky;

  return (
    <Card className={`p-4 border ${theme.border} space-y-3 flex flex-col justify-between ${className}`.trim()}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg border shrink-0 ${theme.icon}`}>
              {roleIcon}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{name}</h4>
              <p className="text-[11px] text-slate-400 font-mono">Agent ID: {id}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {confidence}% conf.
            </span>
          </div>
        </div>

        {/* Finding & Recommendation */}
        <div className="space-y-1.5 text-xs">
          <p className="text-slate-600 leading-relaxed text-[12px]">{finding}</p>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Agent Recommendation
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Key Findings List */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Operational Evidence
            </span>
            <ul className="space-y-0.5 text-[11px] text-slate-600 list-disc list-inside">
              {keyFindings.map((kf, i) => (
                <li key={i} className="truncate">{kf}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Vote */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">Voted Strategy:</span>
        <Badge variant="info" size="sm">
          {voteLabel}
        </Badge>
      </div>
    </Card>
  );
};
