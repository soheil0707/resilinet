'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'critical' | 'warning' | 'info' | 'neutral' | 'healthy';
  badgeText?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  badgeText,
}: KpiCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          border: 'border-red-200 hover:border-red-300',
          iconBg: 'bg-red-50 text-red-600 ring-1 ring-red-200',
          badgeBg: 'bg-red-100 text-red-800 border-red-200',
          indicator: 'bg-red-600',
        };
      case 'warning':
        return {
          border: 'border-amber-200 hover:border-amber-300',
          iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          indicator: 'bg-amber-500',
        };
      case 'info':
        return {
          border: 'border-sky-200 hover:border-sky-300',
          iconBg: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          indicator: 'bg-sky-600',
        };
      case 'healthy':
        return {
          border: 'border-emerald-200 hover:border-emerald-300',
          iconBg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-500',
        };
      default:
        return {
          border: 'border-slate-200 hover:border-slate-300',
          iconBg: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          indicator: 'bg-slate-400',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`bg-white rounded-lg border ${styles.border} p-5 shadow-xs transition hover:shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </span>
            {badgeText && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles.badgeBg}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${styles.indicator}`} />
    </div>
  );
}
