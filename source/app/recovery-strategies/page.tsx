'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { DEMO_RECOVERY_STRATEGIES } from '@/lib/data/demo-data';
import { RecoveryStrategy } from '@/lib/supabase/types';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

const WEIGHTS = [
  { key: 'recovery_time_score', label: 'Recovery Time', weight: 30, color: 'bg-sky-500', textColor: 'text-sky-700' },
  { key: 'revenue_score',        label: 'Revenue Protected', weight: 25, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { key: 'cost_score',           label: 'Cost Efficiency', weight: 20, color: 'bg-violet-500', textColor: 'text-violet-700' },
  { key: 'risk_score',           label: 'Risk Level', weight: 15, color: 'bg-amber-500', textColor: 'text-amber-700' },
  { key: 'customer_score',       label: 'Customer Impact', weight: 10, color: 'bg-rose-500', textColor: 'text-rose-700' },
];

const STRATEGY_DETAILS = [
  { id: 'STRAT-004', costLabel: '₹2.1L', timeLabel: '1 day',  protectedLabel: '₹24.2L', risk: 'LOW',    altLabel: 'Air dispatch (100 u) + Chennai road express (120 u)' },
  { id: 'STRAT-003', costLabel: '₹2.6L', timeLabel: '2 days', protectedLabel: '₹21.5L', risk: 'LOW',    altLabel: 'Priority air cargo from Jamshedpur buffer (100 units)' },
  { id: 'STRAT-002', costLabel: '₹0.8L', timeLabel: '4 days', protectedLabel: '₹19.2L', risk: 'LOW',    altLabel: 'PL-02 Chennai → PL-01 Hyderabad (180 units STO)' },
  { id: 'STRAT-001', costLabel: '₹1.2L', timeLabel: '7 days', protectedLabel: '₹14.5L', risk: 'MEDIUM', altLabel: 'Bharat Precision, Pune (Tier-2 AVL vendor)' },
];

function riskBadge(risk: string) {
  if (risk === 'LOW')    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (risk === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export default function RecoveryStrategiesPage() {
  const { approvedStrategy, selectedStrategy, isOverride, setApprovedStrategy, setSelectedStrategy, setWorkflowState } = useWorkflow();
  const [selectedId, setSelectedId] = useState<string | null>(approvedStrategy?.id || selectedStrategy?.id || null);
  const [pendingOverrideStrategy, setPendingOverrideStrategy] = useState<RecoveryStrategy | null>(null);

  React.useEffect(() => {
    if (approvedStrategy?.id) {
      setSelectedId(approvedStrategy.id);
    } else if (selectedStrategy?.id) {
      setSelectedId(selectedStrategy.id);
    } else {
      setSelectedId(null);
    }
  }, [approvedStrategy, selectedStrategy]);

  const strategies = [...DEMO_RECOVERY_STRATEGIES].sort((a, b) => b.overall_score - a.overall_score);

  function handleSelectForApproval(stratId: string) {
    const strat = strategies.find((s) => s.id === stratId);
    if (!strat) return;

    // If human selects a non-top-recommended strategy, trigger Human Override warning modal
    if (strat.id !== 'STRAT-004') {
      setPendingOverrideStrategy(strat);
    } else {
      confirmSelection(strat, false);
    }
  }

  function confirmSelection(strat: RecoveryStrategy, overrideFlag: boolean) {
    setSelectedId(strat.id);
    setSelectedStrategy(strat, overrideFlag);
    setApprovedStrategy(strat, overrideFlag);
    setWorkflowState('STRATEGY_SELECTED');
    setPendingOverrideStrategy(null);
  }

  const currentSelectedObj = strategies.find((s) => s.id === selectedId);

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
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded transition cursor-pointer ${
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
        {selectedId && currentSelectedObj && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-emerald-900">
                    {currentSelectedObj.name} — Selected for Approval
                  </p>
                  {isOverride && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠ Human Override Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Strategy locked ({currentSelectedObj.recovery_time_days} {currentSelectedObj.recovery_time_days === 1 ? 'day' : 'days'}, ₹{(currentSelectedObj.cost_inr / 100000).toFixed(1)}L cost, ₹{(currentSelectedObj.revenue_protected_inr / 100000).toFixed(1)}L protected). Proceed to Approval Center for sign-off.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/what-if-simulator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-50 transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                What-If Simulator
              </Link>
              <Link
                href="/approval-center"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition cursor-pointer"
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

        {/* ── Human Override / Decision Alert Modal ───────────────────────── */}
        {pendingOverrideStrategy && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-amber-500 text-white px-5 py-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-100" />
                <div>
                  <h3 className="text-base font-bold">Human Override / Decision Alert</h3>
                  <p className="text-xs text-amber-100">You are choosing a strategy different from the AI-recommended strategy.</p>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Strategy Comparison Cards */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* AI Recommended Strategy */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">AI RECOMMENDED STRATEGY</span>
                    <p className="font-bold text-slate-900 text-xs">Combined Recovery</p>
                    <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                      <p>⏱ 1 Day Recovery</p>
                      <p>💰 ₹2.1L Cost</p>
                      <p>🛡 ₹24.2L Protected</p>
                      <p>⭐ Score: 94.0</p>
                    </div>
                  </div>

                  {/* Human Selected Strategy */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">YOUR SELECTED STRATEGY</span>
                    <p className="font-bold text-slate-900 text-xs">{pendingOverrideStrategy.name}</p>
                    <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                      <p>⏱ {pendingOverrideStrategy.recovery_time_days} Day{pendingOverrideStrategy.recovery_time_days > 1 ? 's' : ''} Recovery</p>
                      <p>💰 ₹{(pendingOverrideStrategy.cost_inr / 100000).toFixed(1)}L Cost</p>
                      <p>🛡 ₹{(pendingOverrideStrategy.revenue_protected_inr / 100000).toFixed(1)}L Protected</p>
                      <p>⭐ Score: {pendingOverrideStrategy.overall_score.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Warning Callout */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠ Decision Difference</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    You are choosing a strategy different from the AI-recommended strategy. This may result in:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] font-medium pl-1">
                    <li>Longer recovery time ({pendingOverrideStrategy.recovery_time_days} days vs 1 day)</li>
                    <li>Different recovery cost (₹{(pendingOverrideStrategy.cost_inr / 100000).toFixed(1)}L vs ₹2.1L)</li>
                    <li>Different revenue protection (₹{(pendingOverrideStrategy.revenue_protected_inr / 100000).toFixed(1)}L vs ₹24.2L)</li>
                    <li>Different operational risk ({pendingOverrideStrategy.risk_level} vs LOW)</li>
                  </ul>
                  <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                    The final decision remains with the authorized human approver.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setPendingOverrideStrategy(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-md transition cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  onClick={() => confirmSelection(pendingOverrideStrategy, true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue With My Choice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}
