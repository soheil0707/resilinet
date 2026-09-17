'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { DEMO_RECOVERY_STRATEGIES } from '@/lib/data/demo-data';
import { RecoveryStrategy } from '@/lib/supabase/types';
import {
  Sliders,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

// ─── Simulation Engine ────────────────────────────────────────────────────────

interface SimParams {
  freightPremium: number;   // -50 to +50 (%)
  chennaiBuf: number;       // 0 to 250 units
  penaltySensitivity: number; // 0 to 100
}

interface SimResult {
  id: string;
  name: string;
  cost: number;
  recoveryDays: number;
  revenueProtected: number;
  netROI: number;
  score: number;
  recommended: boolean;
}

const BASE_STRATEGIES = [
  { id: 'STRAT-001', name: 'Alternate Supplier',     baseCost: 120000, baseTime: 7, baseProtected: 1450000, baseScore: 68.5 },
  { id: 'STRAT-002', name: 'Inventory Transfer',     baseCost: 80000,  baseTime: 4, baseProtected: 1920000, baseScore: 82.0 },
  { id: 'STRAT-003', name: 'Expedited Air Logistics', baseCost: 260000, baseTime: 2, baseProtected: 2150000, baseScore: 86.5 },
  { id: 'STRAT-004', name: 'Combined Recovery',       baseCost: 210000, baseTime: 1, baseProtected: 2420000, baseScore: 94.0 },
];

const TOTAL_REVENUE_AT_RISK = 2740000;

function simulate(params: SimParams): SimResult[] {
  const freightMultiplier = 1 + params.freightPremium / 100;
  const bufferFactor = params.chennaiBuf / 180; // 180 is the base STO amount
  const penaltyFactor = params.penaltySensitivity / 100;

  return BASE_STRATEGIES.map((strat) => {
    let cost = strat.baseCost;
    let time = strat.baseTime;
    let protected_ = strat.baseProtected;

    // Apply freight premium to logistics-heavy strategies
    if (strat.id === 'STRAT-003' || strat.id === 'STRAT-004') {
      cost = cost * freightMultiplier;
    }

    // Chennai buffer availability affects transfer-based strategies
    if (strat.id === 'STRAT-002' || strat.id === 'STRAT-004') {
      const bufferEffect = Math.min(bufferFactor, 1.4);
      protected_ = Math.min(strat.baseProtected * bufferEffect, TOTAL_REVENUE_AT_RISK - 320000);
      time = Math.max(1, time - Math.floor((bufferFactor - 1) * 0.5));
    }

    // Penalty sensitivity amplifies revenue protected for fast strategies
    if (strat.id === 'STRAT-004' || strat.id === 'STRAT-003') {
      protected_ = protected_ * (1 + penaltyFactor * 0.05);
    }

    protected_ = Math.min(protected_, TOTAL_REVENUE_AT_RISK);

    // Recalculate score based on time/protected/cost
    const timeScore = Math.max(0, 100 - (time - 1) * 10);
    const revenueScore = (protected_ / TOTAL_REVENUE_AT_RISK) * 100;
    const costScore = Math.max(0, 100 - (cost / 3000));
    const score = timeScore * 0.30 + revenueScore * 0.25 + costScore * 0.20 + 80 * 0.15 + revenueScore * 0.10;

    return {
      id: strat.id,
      name: strat.name,
      cost: Math.round(cost),
      recoveryDays: Math.round(time),
      revenueProtected: Math.round(protected_),
      netROI: Math.round((protected_ - cost) / cost * 10) / 10,
      score: Math.round(Math.min(score, 99) * 10) / 10,
      recommended: strat.id === 'STRAT-004',
    };
  }).sort((a, b) => b.score - a.score);
}

function formatInr(val: number) {
  const lakh = val / 100000;
  return `₹${lakh.toFixed(1)}L`;
}

export default function WhatIfSimulatorPage() {
  const { setSelectedStrategy, setApprovedStrategy, setWorkflowState, isOverride } = useWorkflow();

  const [params, setParams] = useState<SimParams>({
    freightPremium: 0,
    chennaiBuf: 180,
    penaltySensitivity: 50,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingOverrideStrategy, setPendingOverrideStrategy] = useState<RecoveryStrategy | null>(null);

  const results = useMemo(() => simulate(params), [params]);

  const recommendedResult = results.find((r) => r.recommended);

  function handleSelectForApproval(resultId: string) {
    const strategy = DEMO_RECOVERY_STRATEGIES.find((s) => s.id === resultId);
    if (!strategy) return;

    if (strategy.id !== 'STRAT-004') {
      setPendingOverrideStrategy(strategy);
    } else {
      confirmSelection(strategy, false);
    }
  }

  function confirmSelection(strat: RecoveryStrategy, overrideFlag: boolean) {
    setSelectedId(strat.id);
    setSelectedStrategy(strat, overrideFlag);
    setApprovedStrategy(strat, overrideFlag);
    setWorkflowState('STRATEGY_SELECTED');
    setPendingOverrideStrategy(null);
  }

  function handleReset() {
    setParams({ freightPremium: 0, chennaiBuf: 180, penaltySensitivity: 50 });
    setSelectedId(null);
  }

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">What-If Scenario Simulator</h2>
                <p className="text-xs text-slate-500">
                  Adjust parameters to model real-time impact on recovery time, revenue protected, and ROI
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Parameter Panel ──────────────────────────────── */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-6 lg:col-span-1">
            <p className="text-sm font-bold text-slate-900">Simulation Parameters</p>

            {/* Freight Premium */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Freight Premium Modifier</label>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  params.freightPremium > 0 ? 'bg-red-50 text-red-700' :
                  params.freightPremium < 0 ? 'bg-emerald-50 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {params.freightPremium > 0 ? '+' : ''}{params.freightPremium}%
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={params.freightPremium}
                onChange={(e) => setParams((p) => ({ ...p, freightPremium: parseInt(e.target.value) }))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-50% (discount)</span>
                <span>+50% (surge)</span>
              </div>
              <p className="text-[11px] text-slate-500">Affects air freight and logistics-heavy strategies</p>
            </div>

            {/* Chennai Buffer */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Chennai Buffer Availability</label>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  params.chennaiBuf >= 180 ? 'bg-emerald-50 text-emerald-700' :
                  params.chennaiBuf >= 100 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {params.chennaiBuf} units
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={params.chennaiBuf}
                onChange={(e) => setParams((p) => ({ ...p, chennaiBuf: parseInt(e.target.value) }))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 units</span>
                <span>250 units</span>
              </div>
              <p className="text-[11px] text-slate-500">M-101 units available at PL-02 Chennai for STO</p>
            </div>

            {/* Penalty Sensitivity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Customer Delay Penalty Weight</label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {params.penaltySensitivity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={params.penaltySensitivity}
                onChange={(e) => setParams((p) => ({ ...p, penaltySensitivity: parseInt(e.target.value) }))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (ignore)</span>
                <span>100% (critical)</span>
              </div>
              <p className="text-[11px] text-slate-500">Amplifies revenue protection for fast-delivery strategies</p>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-sky-700 uppercase">Optimal Under Current Parameters</p>
              {recommendedResult && (
                <>
                  <p className="text-sm font-bold text-slate-900">{recommendedResult.name}</p>
                  <p className="text-xs text-slate-600">
                    Score: <span className="font-bold text-emerald-700">{recommendedResult.score}</span> · ROI: {recommendedResult.netROI}x
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Results Table ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-bold text-slate-900">Live Simulation Results</p>
                <p className="text-xs text-slate-500">Recalculated in real-time as parameters change</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left p-3 font-bold text-slate-600">Strategy</th>
                      <th className="text-right p-3 font-bold text-slate-600">Cost</th>
                      <th className="text-right p-3 font-bold text-slate-600">Recovery</th>
                      <th className="text-right p-3 font-bold text-slate-600">Protected</th>
                      <th className="text-right p-3 font-bold text-slate-600">ROI</th>
                      <th className="text-right p-3 font-bold text-slate-600">Score</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => {
                      const isTopRanked = idx === 0;
                      const isSelected = selectedId === result.id;
                      return (
                        <tr
                          key={result.id}
                          className={`border-b border-slate-100 ${
                            isTopRanked ? 'bg-emerald-50' : isSelected ? 'bg-sky-50' : 'bg-white'
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {isTopRanked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">TOP</span>}
                              <span className="font-semibold text-slate-800">{result.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700">{formatInr(result.cost)}</td>
                          <td className={`p-3 text-right font-mono font-bold ${
                            result.recoveryDays <= 2 ? 'text-emerald-700' : result.recoveryDays <= 4 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {result.recoveryDays}d
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatInr(result.revenueProtected)}</td>
                          <td className="p-3 text-right font-mono text-slate-700">{result.netROI}x</td>
                          <td className={`p-3 text-right font-mono font-bold text-lg ${isTopRanked ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {result.score}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleSelectForApproval(result.id)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded transition cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : isTopRanked
                                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Score bar chart */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-700">Score Comparison</p>
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-600 w-36 shrink-0">{r.name}</span>
                  <div className="flex-1 h-4 rounded bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${r.recommended ? 'bg-emerald-500' : 'bg-sky-400'}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-10 text-right">{r.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Selected Banner ─────────────────────────────────── */}
        {selectedId && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-emerald-900">
                    {results.find((r) => r.id === selectedId)?.name} — Selected from Simulation
                  </p>
                  {isOverride && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠ Human Override Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Proceed to Approval Center for formal Supply Chain Manager sign-off.
                </p>
              </div>
            </div>
            <Link
              href="/approval-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition cursor-pointer"
            >
              Submit for Approval
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {!selectedId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/recovery-strategies"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              ← Back to Recovery Strategies
            </Link>
            <Link
              href="/approval-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Go to Approval Center
              <ArrowRight className="w-3.5 h-3.5" />
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
