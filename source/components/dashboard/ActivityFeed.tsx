'use client';

import React from 'react';
import { History, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS' | 'WARNING';
  title: string;
  source: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recent Supply-Chain Activity & SAP Telemetry
            </h3>
            <p className="text-[11px] text-slate-500">
              Live audit stream from SAP Integration Suite, EDI and Plant MES
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Sync: Realtime
        </span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {activities.map((item) => (
          <div key={item.id} className="py-2.5 flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded bg-slate-50 border border-slate-200 shrink-0">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-500">
                  {item.source}
                </span>
                <span>•</span>
                <span>{item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
