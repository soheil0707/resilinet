'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import {
  Scale,
  ShoppingCart,
  Truck,
  Users,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  XCircle,
  CircleDot,
  TrendingUp,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONFLICTS = [
  {
    agent: 'Procurement Agent',
    icon: ShoppingCart,
    position: 'Alternate Supplier (Bharat Precision)',
    rationale: 'Lowest procurement surcharge at ₹1.2L. Fully qualified Tier-2 vendor on AVL. This is the most cost-efficient path.',
    concern: 'Road transit from Bharat Precision (Pune) to Hyderabad is 7 days — 4.6 days beyond the 2.4-day inventory buffer.',
    kpiImpact: { cost: 'LOW (₹1.2L)', time: 'HIGH (7 days)', sla: 'FAIL (breach in 3 days)' },
    color: 'sky',
    outcome: 'SECONDARY',
  },
  {
    agent: 'Logistics Agent',
    icon: Truck,
    position: 'Express Air Cargo (S-104 Buffer)',
    rationale: 'Air freight from Jamshedpur buffer delivers 100 units in 2 days. Only option that beats the inventory clock.',
    concern: 'Air freight cost is ₹2.6L — highest per-unit logistics cost. Cannot fully cover the 220-unit gap alone.',
    kpiImpact: { cost: 'HIGH (₹2.6L)', time: 'LOW (2 days)', sla: 'PASS (with partial coverage)' },
    color: 'amber',
    outcome: 'COMPONENT',
  },
  {
    agent: 'Customer Impact Agent',
    icon: Users,
    position: 'Tier-1 OEM SLA Protection is Non-Negotiable',
    rationale: '8 Tier-1 OEM fleet accounts have contract penalty clauses activating in 3 days. ₹12L in penalties at risk.',
    concern: 'Any strategy with a 7-day lead time will trigger all OEM penalty clauses regardless of cost savings.',
    kpiImpact: { cost: 'PENALTY ₹12L', time: 'DEADLINE: 3 days', sla: 'ZERO tolerance' },
    color: 'teal',
    outcome: 'CONSTRAINT',
  },
];

const TRADEOFF_MATRIX = [
  {
    strategy: 'Alternate Supplier Only',
    cost: '₹1.2L',
    time: '7 days',
    sla: 'FAIL',
    score: 68.5,
    verdict: 'Too slow',
    verdictColor: 'text-red-600',
  },
  {
    strategy: 'Air Freight Only',
    cost: '₹2.6L',
    time: '2 days',
    sla: 'PARTIAL',
    score: 86.5,
    verdict: 'Insufficient volume',
    verdictColor: 'text-amber-600',
  },
  {
    strategy: 'Inventory Transfer Only',
    cost: '₹0.8L',
    time: '4 days',
    sla: 'PARTIAL',
    score: 82.0,
    verdict: 'Misses Tier-1 deadline',
    verdictColor: 'text-amber-600',
  },
  {
    strategy: 'Combined Recovery ✓',
    cost: '₹2.1L',
    time: '1 day',
    sla: 'PASS',
    score: 94.0,
    verdict: 'All constraints satisfied',
    verdictColor: 'text-emerald-600',
  },
];

const CONSENSUS_STEPS = [
  'Procurement conflict noted: Road transit from Bharat Precision exceeds 2.4-day buffer by 4.6 days.',
  'Logistics solution: Charter air cargo from S-104 Jamshedpur buffer covers 100 units in 2 days.',
  'Inventory Agent supplements with 120-unit STO from PL-02 Chennai via overnight road express (36 hrs).',
  'Combined coverage: 220 units arrive within 1–2 days — fully satisfies Tier-1 OEM deadlines.',
  'Finance confirms ₹2.1L combined cost delivers 11.5x ROI vs ₹27.4L exposure.',
  'Customer Impact constraint satisfied: all 8 OEM penalty clauses avoided.',
];

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  sky:   { bg: 'bg-sky-50',   border: 'border-sky-200',   text: 'text-sky-800',   icon: 'text-sky-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' },
  teal:  { bg: 'bg-teal-50',  border: 'border-teal-200',  text: 'text-teal-800',  icon: 'text-teal-600' },
};

export default function ConflictResolutionPage() {
  const [showResolution, setShowResolution] = useState(false);

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Conflict Resolution — Multi-Agent Trade-off Arbitration</h2>
              <p className="text-xs text-slate-500">
                Orchestrator mediating conflicting recommendations between Procurement, Logistics, and Customer Impact agents
              </p>
            </div>
          </div>
        </div>

        {/* ── Conflict Scenario Banner ────────────────────────── */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">3 Agents — Conflicting Positions Detected</p>
              <p className="text-xs text-amber-700 mt-1">
                Procurement Agent advocates for lowest-cost alternate supplier, but Logistics Agent warns road transit is too slow for the 2.4-day inventory buffer. Customer Impact Agent establishes a hard 3-day OEM SLA deadline. Orchestrator must resolve the trade-off.
              </p>
            </div>
          </div>
        </div>

        {/* ── Conflicting Agent Positions ─────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Conflicting Agent Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONFLICTS.map((c) => {
              const Icon = c.icon;
              const colors = colorMap[c.color];
              return (
                <div key={c.agent} className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                      <span className="text-xs font-bold text-slate-900">{c.agent}</span>
                      <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        c.outcome === 'SECONDARY' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        c.outcome === 'COMPONENT' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {c.outcome}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Position</p>
                      <p className="text-xs font-semibold text-slate-800">{c.position}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Rationale</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.rationale}</p>
                    </div>
                    <div className="rounded bg-red-50 border border-red-200 p-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase mb-0.5">Concern / Conflict</p>
                      <p className="text-xs text-red-700">{c.concern}</p>
                    </div>

                    {/* KPI Impact */}
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { k: 'Cost', v: c.kpiImpact.cost },
                        { k: 'Time', v: c.kpiImpact.time },
                        { k: 'SLA', v: c.kpiImpact.sla },
                      ].map((kpi) => (
                        <div key={kpi.k} className="text-center bg-white rounded border border-slate-100 p-1.5">
                          <p className="text-[9px] text-slate-400 uppercase">{kpi.k}</p>
                          <p className={`text-[10px] font-bold ${
                            kpi.v === 'FAIL' || kpi.v.includes('PENALTY') ? 'text-red-600' :
                            kpi.v === 'PASS' ? 'text-emerald-600' : 'text-slate-700'
                          }`}>{kpi.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Trade-off Decision Matrix ───────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Orchestrator Trade-off Decision Matrix</h3>
            <p className="text-xs text-slate-500">Evaluating all strategy permutations against cost, time, and SLA constraints</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3 font-bold text-slate-600 bg-slate-50">Strategy</th>
                  <th className="text-center p-3 font-bold text-slate-600 bg-slate-50">Cost</th>
                  <th className="text-center p-3 font-bold text-slate-600 bg-slate-50">Lead Time</th>
                  <th className="text-center p-3 font-bold text-slate-600 bg-slate-50">OEM SLA</th>
                  <th className="text-center p-3 font-bold text-slate-600 bg-slate-50">Score</th>
                  <th className="text-left p-3 font-bold text-slate-600 bg-slate-50">Orchestrator Verdict</th>
                </tr>
              </thead>
              <tbody>
                {TRADEOFF_MATRIX.map((row) => (
                  <tr
                    key={row.strategy}
                    className={`border-b border-slate-100 ${
                      row.strategy.includes('✓') ? 'bg-emerald-50' : 'bg-white'
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-800">{row.strategy}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{row.cost}</td>
                    <td className="p-3 text-center font-mono">
                      <span className={parseInt(row.time) <= 2 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        {row.time}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {row.sla === 'PASS' ? (
                        <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : row.sla === 'FAIL' ? (
                        <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                          <CircleDot className="w-3 h-3" /> PARTIAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">{row.score}</td>
                    <td className={`p-3 font-semibold ${row.verdictColor}`}>{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Orchestrator Resolution ─────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Orchestrator Resolution Logic</h3>
              <p className="text-xs text-slate-500">Step-by-step reasoning chain producing the final consensus</p>
            </div>
            {!showResolution && (
              <button
                onClick={() => setShowResolution(true)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded hover:bg-slate-800 transition"
              >
                Show Resolution
              </button>
            )}
          </div>

          {showResolution && (
            <div className="p-5 space-y-3">
              {CONSENSUS_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}

              <div className="mt-4 p-4 rounded-lg bg-emerald-50 border-2 border-emerald-300">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-900">Final Consensus: Combined Recovery</p>
                </div>
                <p className="text-xs text-emerald-800">
                  Air cargo (100 units, 2 days) + Overnight road express from Chennai (120 units, 36 hrs) satisfies both the 2.4-day buffer constraint and all 8 Tier-1 OEM SLA deadlines. Total cost ₹2.1L protects ₹24.2L — Score: 94.0
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/recovery-strategies"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
          >
            <TrendingUp className="w-4 h-4 text-sky-300" />
            Compare Recovery Strategies
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/ai-command-center"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
          >
            ← Back to AI Command Center
          </Link>
        </div>
      </div>
    </EnterpriseShell>
  );
}
