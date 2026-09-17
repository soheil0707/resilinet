'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { DEMO_RECOVERY_STRATEGIES } from '@/lib/data/demo-data';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';

const WEIGHTS = [
  { key: 'recovery_time_score', label: 'Recovery Time', weight: 30, color: 'bg-sky-500', textColor: 'text-sky-700' },
  { key: 'revenue_score',        label: 'Revenue Protected', weight: 25, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { key: 'cost_score',           label: 'Cost Efficiency', weight: 20, color: 'bg-violet-500', textColor: 'text-violet-700' },
  { key: 'risk_score',           label: 'Risk Level', weight: 15, color: 'bg-amber-500', textColor: 'text-amber-700' },
  { key: 'customer_score',       label: 'Customer Impact', weight: 10, color: 'bg-rose-500', textColor: 'text-rose-700' },
];

const STRATEGY_DETAILS = [
  { id: 'STRAT-001', costLabel: '₹1.2L', timeLabel: '7 days', protectedLabel: '₹14.5L', risk: 'MEDIUM', altLabel: 'Bharat Precision, Pune (Tier-2 AVL vendor)' },
  { id: 'STRAT-002', costLabel: '₹0.8L', timeLabel: '4 days', protectedLabel: '₹19.2L', risk: 'LOW',    altLabel: 'PL-02 Chennai → PL-01 Hyderabad (180 units STO)' },
  { id: 'STRAT-003', costLabel: '₹2.6L', timeLabel: '2 days', protectedLabel: '₹21.5L', risk: 'LOW',    altLabel: 'Priority air cargo from Jamshedpur buffer (100 units)' },
  { id: 'STRAT-004', costLabel: '₹2.1L', timeLabel: '1 day',  protectedLabel: '₹24.2L', risk: 'LOW',    altLabel: 'Air dispatch (100 u) + Chennai road express (120 u)' },
];

function riskBadge(risk: string) {
  if (risk === 'LOW')    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (risk === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export default function RecoveryStrategiesPage() {
  const { setApprovedStrategy, setWorkflowState } = useWorkflow();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const strategies = DEMO_RECOVERY_STRATEGIES;

  function handleSelectForApproval(stratId: string) {
    const strat = strategies.find((s) => s.id === stratId);
    if (!strat) return;
    setSelectedId(stratId);
    setApprovedStrategy(strat);
    setWorkflowState('STRATEGY_SELECTED');
  }

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-sky-50 text-sky-700 border border-sky-200">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recovery Strategies & Ranking</h2>
              <p className="text-xs text-slate-500">
                Deterministic Decision Orchestrator — 5-factor weighted scoring framework
              </p>
            </div>
          </div>
        </div>

        {/* ── Scoring Weights Legend ─────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-700 mb-3">Scoring Framework (Weighted)</p>
          <div className="flex flex-wrap gap-4">
            {WEIGHTS.map((w) => (
              <div key={w.key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${w.color}`} />
                <span className="text-xs text-slate-600">{w.label}</span>
                <span className="text-[10px] font-bold text-slate-400">{w.weight}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="h-2 flex-1 rounded-full overflow-hidden flex">
              {WEIGHTS.map((w) => (
                <div key={w.key} className={`${w.color}`} style={{ width: `${w.weight}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Strategy Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map((strat, idx) => {
            const detail = STRATEGY_DETAILS.find((d) => d.id === strat.id) || STRATEGY_DETAILS[0];
            const isSelected = selectedId === strat.id;

            return (
              <div
                key={strat.id}
                className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${
                  strat.is_recommended
                    ? 'border-emerald-400 shadow-md'
                    : isSelected
                    ? 'border-sky-400'
                    : 'border-slate-200'
                }`}
              >
                {/* Card header */}
                <div
                  className={`p-4 border-b border-slate-100 ${
                    strat.is_recommended ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-sm font-bold text-slate-900">{strat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {strat.is_recommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                          ★ TOP PICK
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${riskBadge(detail.risk)}`}>
                        {detail.risk} RISK
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{detail.altLabel}</p>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                  {[
                    { icon: IndianRupee, label: 'Cost', value: detail.costLabel, color: 'text-slate-700' },
                    { icon: Clock,        label: 'Lead Time', value: detail.timeLabel, color: strat.recovery_time_days <= 2 ? 'text-emerald-700' : strat.recovery_time_days <= 4 ? 'text-amber-600' : 'text-red-600' },
                    { icon: TrendingUp,   label: 'Protected', value: detail.protectedLabel, color: 'text-emerald-700' },
                  ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={kpi.label} className="p-3 text-center">
                        <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${kpi.color}`} />
                        <p className={`text-base font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                        <p className="text-[10px] text-slate-400">{kpi.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Score bars */}
                <div className="p-4 space-y-2">
                  {WEIGHTS.map((w) => {
                    const score = strat.score_breakdown?.[w.key as keyof typeof strat.score_breakdown] ?? 0;
                    return (
                      <div key={w.key} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-28 shrink-0">{w.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${w.color}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 w-6 text-right">{score}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Overall score + actions */}
                <div className="px-4 pb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</p>
                    <p className={`text-2xl font-bold font-mono ${strat.is_recommended ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {strat.overall_score.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/what-if-simulator"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition"
                    >
                      <Sliders className="w-3 h-3" />
                      Simulate
                    </Link>
                    <button
                      onClick={() => handleSelectForApproval(strat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border border-emerald-600'
                          : strat.is_recommended
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? <><CheckCircle2 className="w-3 h-3" /> Selected</> : 'Select for Approval'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Selected Strategy Banner ─────────────────────────── */}
        {selectedId && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  {strategies.find((s) => s.id === selectedId)?.name} — Selected for Approval
                </p>
                <p className="text-xs text-emerald-700">
                  Strategy locked. Proceed to Approval Center for Supply Chain Manager sign-off.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/what-if-simulator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-50 transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                What-If Simulator
              </Link>
              <Link
                href="/approval-center"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
              >
                Proceed to Approval
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Bottom Navigation ──────────────────────────────── */}
        {!selectedId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/what-if-simulator"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              Open What-If Simulator
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/conflict-resolution"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              ← Back to Conflict Resolution
            </Link>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}
