'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import {
  Bot,
  ShoppingCart,
  Package,
  Factory,
  Truck,
  DollarSign,
  Users,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  Scale,
  ChevronRight,
} from 'lucide-react';

// ─── Agent Definitions ────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'PROCUREMENT',
    icon: ShoppingCart,
    name: 'Procurement Agent',
    color: 'sky',
    finding:
      'Secondary qualified vendor Bharat Precision (Pune) identified via SAP Approved Vendor List (AVL). Emergency batch of 220 units can be dispatched within 7 days at a 6.5% procurement surcharge (₹1.2L). Vendor quality certification confirmed.',
    recommendation: 'Activate emergency purchase order with Bharat Precision (Pune) for 220 units at ₹18,500 + ₹1,200 per unit surcharge.',
    confidence: 87,
    estimatedImpact: '₹1.2L cost • 7-day lead time',
    badge: 'ALT VENDOR LOCATED',
    badgeColor: 'sky',
    vote: 'ALTERNATE_SOURCING',
    voteLabel: 'Alternate Supplier',
    keyFindings: [
      'Bharat Precision (Pune): Tier-2 vendor, ISO 9001:2015 certified',
      'Emergency batch capacity: 220 units confirmed by Vendor Mgr',
      'Surcharge: ₹1,200/unit (6.5%) — within authority limit',
      'Transit: Road freight, Pune → Hyderabad (6 days)',
    ],
  },
  {
    id: 'INVENTORY',
    icon: Package,
    name: 'Inventory Agent',
    color: 'emerald',
    finding:
      'PL-02 Chennai holds 450 units of M-101 Steering Assembly with 5.6 days coverage above safety stock threshold. 180 units can be released for inter-plant transfer without endangering Chennai operations. SAP EWM STO can be issued immediately.',
    recommendation: 'Issue Stock Transport Order (STO) from PL-02 Chennai to PL-01 Hyderabad for 180 units of M-101.',
    confidence: 94,
    estimatedImpact: '₹0.8L cost • 4-day lead time',
    badge: '180 UNITS AVAILABLE',
    badgeColor: 'emerald',
    vote: 'STOCK_TRANSFER',
    voteLabel: 'Inventory Transfer',
    keyFindings: [
      'PL-02 Chennai: 450 units on hand, 5.6 days coverage',
      'Safe release quantity: 180 units (above safety stock)',
      'Express road freight: Chennai → Hyderabad ≈ 36 hrs',
      'STO authorization: Supply Chain Manager required',
    ],
  },
  {
    id: 'PRODUCTION',
    icon: Factory,
    name: 'Production Agent',
    color: 'violet',
    finding:
      '17 production orders at PL-01 Hyderabad analyzed. 12 orders for high-margin Astra EV-X Prime lines are prioritized. 5 lower-priority Sierra SUV orders can be rescheduled by 5 days without SLA breach. Partial throughput continuity possible with 120 priority units.',
    recommendation: 'Reschedule 5 low-priority Sierra SUV orders by 5 days. Reserve incoming M-101 inventory exclusively for EV-X Prime lines.',
    confidence: 91,
    estimatedImpact: '5 orders deferred • 12 orders protected',
    badge: '12 ORDERS PROTECTED',
    badgeColor: 'violet',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      '17 orders affected: 12 EV-X Prime (high margin), 5 Sierra SUV',
      'EV-X Prime daily margin: ₹18,400/vehicle — must protect',
      'Sierra SUV: Customer SLA allows 5-day flexibility',
      'Line capacity: 100 units/day; new plan: 120 units/day burst',
    ],
  },
  {
    id: 'LOGISTICS',
    icon: Truck,
    name: 'Logistics Agent',
    color: 'amber',
    finding:
      'Road transit from Bharat Precision (Pune) takes 7 days — too slow for 2.4-day buffer. Express air cargo from S-104 Jamshedpur finished goods buffer (100 units) can arrive in Hyderabad within 2 days at ₹2.6L. Combined air + inter-plant transfer is optimal.',
    recommendation: 'Charter priority air freight from Jamshedpur buffer (100 units) + overnight road express from Chennai (120 units). Alternate supplier road freight is secondary.',
    confidence: 89,
    estimatedImpact: '₹2.6L air cost • 2-day delivery',
    badge: 'AIR FREIGHT VIABLE',
    badgeColor: 'amber',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      'Jamshedpur buffer: 100 finished units available (S-104)',
      'Air freight (ATR-72 charter): Jamshedpur → Hyderabad in 2 days',
      'Road express (Chennai): 36–40 hours, ₹0.8L',
      'Road from Bharat Precision: 7 days — exceeds buffer window',
    ],
  },
  {
    id: 'FINANCE',
    icon: DollarSign,
    name: 'Finance Agent',
    color: 'rose',
    finding:
      'Unmitigated loss exposure is ₹27.4L. Combined Recovery (₹2.1L total cost) protects ₹24.2L — a net ROI of 11.5x. Budget authority for supply chain emergency actions up to ₹5L has been confirmed. All actions are within delegated financial authority.',
    recommendation: 'Combined Recovery strategy at ₹2.1L cost is financially justified. Proceed with formal budget allocation against Cost Center 5104-HYD-SCM.',
    confidence: 96,
    estimatedImpact: '₹24.2L protected • 11.5x ROI',
    badge: '11.5x ROI',
    badgeColor: 'rose',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      'Revenue at risk (unmitigated): ₹27.4L',
      'Combined Recovery cost: ₹2.1L (air ₹1.3L + road ₹0.8L)',
      'Net revenue protected: ₹24.2L',
      'ROI: 11.5x — strongest return across all strategies',
    ],
  },
  {
    id: 'CUSTOMER',
    icon: Users,
    name: 'Customer Impact Agent',
    color: 'teal',
    finding:
      '20 customer orders analyzed. 8 Tier-1 OEM fleet orders (4,000+ vehicles YTD) have contract milestone deadlines in 3–4 days — delay beyond this triggers ₹12L in penalty clauses. 4 enterprise dealership orders have SLA tolerance of 5 days. Immediate action required.',
    recommendation: 'Prioritize inventory allocation to 8 Tier-1 OEM fleet accounts. Re-confirm delivery dates within 24 hours to preserve SLA compliance and avoid penalty activation.',
    confidence: 93,
    estimatedImpact: '8 Tier-1 accounts protected • ₹12L penalties avoided',
    badge: '8 OEM ACCOUNTS AT RISK',
    badgeColor: 'teal',
    vote: 'COMBINED',
    voteLabel: 'Combined Recovery',
    keyFindings: [
      '8 Tier-1 OEM accounts: Penalty clauses trigger in 3 days',
      '4 enterprise dealerships: 5-day SLA tolerance',
      '8 consumer orders: Flexible, can accommodate 7-day delay',
      'Penalty exposure: ₹12L if Tier-1 SLAs breached',
    ],
  },
];

const STRATEGY_SCORES = [
  {
    id: 'STRAT-001',
    name: 'Alternate Supplier',
    scores: { time: 50, revenue: 60, cost: 90, risk: 70, customer: 65 },
    total: 68.5,
    color: 'slate',
    recommended: false,
  },
  {
    id: 'STRAT-002',
    name: 'Inventory Transfer',
    scores: { time: 75, revenue: 80, cost: 95, risk: 90, customer: 80 },
    total: 82.0,
    color: 'sky',
    recommended: false,
  },
  {
    id: 'STRAT-003',
    name: 'Expedited Air Logistics',
    scores: { time: 90, revenue: 88, cost: 65, risk: 85, customer: 90 },
    total: 86.5,
    color: 'violet',
    recommended: false,
  },
  {
    id: 'STRAT-004',
    name: 'Combined Recovery',
    scores: { time: 98, revenue: 95, cost: 88, risk: 92, customer: 96 },
    total: 94.0,
    color: 'emerald',
    recommended: true,
  },
];

const WEIGHTS = [
  { key: 'time', label: 'Recovery Time', weight: 30, color: 'bg-sky-500' },
  { key: 'revenue', label: 'Revenue Protected', weight: 25, color: 'bg-emerald-500' },
  { key: 'cost', label: 'Cost Efficiency', weight: 20, color: 'bg-violet-500' },
  { key: 'risk', label: 'Risk Level', weight: 15, color: 'bg-amber-500' },
  { key: 'customer', label: 'Customer Impact', weight: 10, color: 'bg-rose-500' },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  sky:     { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  emerald: { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  violet:  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800 border-violet-200' },
  amber:   { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  rose:    { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  teal:    { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   badge: 'bg-teal-100 text-teal-800 border-teal-200' },
};

type Phase = 'IDLE' | 'ANALYZING' | 'COMPLETE';

export default function AiCommandCenterPage() {
  const { setWorkflowState } = useWorkflow();
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [revealedCount, setRevealedCount] = useState(0);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const runAnalysis = useCallback(() => {
    setPhase('ANALYZING');
    setRevealedCount(0);
    setWorkflowState('AGENTS_ANALYZING');

    // Sequentially reveal agents
    AGENTS.forEach((_, idx) => {
      setTimeout(() => {
        setRevealedCount(idx + 1);
        if (idx === AGENTS.length - 1) {
          setTimeout(() => {
            setPhase('COMPLETE');
            setWorkflowState('AGENTS_COMPLETE');
          }, 600);
        }
      }, 900 * (idx + 1));
    });
  }, [setWorkflowState]);

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">AI Command Center</h2>
                <p className="text-xs text-slate-500">
                  6 specialized agents collaborating on S-104 crisis resolution — Incident DIS-2026-001
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {phase === 'COMPLETE' && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Analysis Complete
                </span>
              )}
              <button
                onClick={runAnalysis}
                disabled={phase === 'ANALYZING'}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-md transition"
              >
                <PlayCircle className="w-4 h-4" />
                {phase === 'ANALYZING' ? 'Agents Running…' : phase === 'COMPLETE' ? 'Re-run Analysis' : 'Run Multi-Agent Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Crisis Context Bar ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Disruption', value: 'DIS-2026-001', sub: 'S-104 Global Metals', color: 'text-red-600' },
            { label: 'Inventory Buffer', value: '2.4 Days', sub: 'PL-01 Hyderabad', color: 'text-amber-600' },
            { label: 'Revenue at Risk', value: '₹27.4L', sub: 'Unmitigated', color: 'text-red-600' },
            { label: 'Agents Assigned', value: '6 / 6', sub: 'All roles covered', color: 'text-sky-700' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 p-3.5">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{kpi.label}</p>
              <p className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-500">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Agent Panels Grid ────────────────────────────── */}
        {phase === 'IDLE' && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <Bot className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">6 Specialized Agents Ready</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Run Multi-Agent Analysis&quot; to deploy all agents against the S-104 crisis scenario.
            </p>
          </div>
        )}

        {(phase === 'ANALYZING' || phase === 'COMPLETE') && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {AGENTS.map((agent, idx) => {
              const visible = idx < revealedCount;
              const colors = colorMap[agent.color] || colorMap.sky;
              const Icon = agent.icon;
              const isExpanded = expandedAgent === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`bg-white rounded-lg border border-slate-200 overflow-hidden transition-all duration-500 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {/* Agent header */}
                  <div className={`p-4 border-b border-slate-100 ${colors.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded border ${colors.border} ${colors.text} bg-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                          <p className="text-[10px] text-slate-500">Confidence: {agent.confidence}%</p>
                        </div>
                      </div>
                      {visible && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Finding</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{agent.finding}</p>
                    </div>

                    <div className={`rounded px-2.5 py-2 border ${colors.border} ${colors.bg}`}>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Recommendation</p>
                      <p className="text-xs font-semibold text-slate-800">{agent.recommendation}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors.badge}`}>
                        {agent.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{agent.estimatedImpact}</span>
                    </div>

                    {/* Expand/Collapse key findings */}
                    <button
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      {isExpanded ? 'Hide' : 'View'} Key Findings
                    </button>

                    {isExpanded && (
                      <ul className="space-y-1">
                        {agent.keyFindings.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <span className="text-sky-400 mt-0.5 shrink-0">›</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Decision Orchestrator ─────────────────────────── */}
        {phase === 'COMPLETE' && (
          <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <Scale className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Decision Orchestrator — Strategy Ranking</h3>
                    <p className="text-[11px] text-slate-500">
                      Deterministic 5-factor weighted scoring: Time 30% · Revenue 25% · Cost 20% · Risk 15% · Customer 10%
                    </p>
                  </div>
                </div>
              </div>

              {/* Scoring weights legend */}
              <div className="px-5 pt-4 flex flex-wrap gap-3">
                {WEIGHTS.map((w) => (
                  <div key={w.key} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${w.color}`} />
                    {w.label} ({w.weight}%)
                  </div>
                ))}
              </div>

              {/* Strategy rows */}
              <div className="p-5 space-y-3">
                {STRATEGY_SCORES.map((strat) => (
                  <div
                    key={strat.id}
                    className={`rounded-lg border p-4 ${
                      strat.recommended
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{strat.name}</span>
                        {strat.recommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                            ★ RECOMMENDED
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-lg font-bold font-mono ${
                          strat.recommended ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {strat.total.toFixed(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {WEIGHTS.map((w) => {
                        const score = strat.scores[w.key as keyof typeof strat.scores];
                        return (
                          <div key={w.key}>
                            <p className="text-[9px] text-slate-400 uppercase mb-1">{w.label.split(' ')[0]}</p>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${w.color}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <p className="text-[10px] font-mono text-slate-600 mt-0.5">{score}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Agent Vote Summary ─────────────────────────── */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Agent Consensus</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {AGENTS.map((agent) => {
                  const Icon = agent.icon;
                  const colors = colorMap[agent.color] || colorMap.sky;
                  return (
                    <div key={agent.id} className={`rounded-lg border ${colors.border} ${colors.bg} p-3 text-center`}>
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${colors.text}`} />
                      <p className="text-[10px] font-bold text-slate-700">{agent.name.replace(' Agent', '')}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{agent.voteLabel}</p>
                      <p className="text-[10px] font-mono text-emerald-600 font-bold mt-1">{agent.confidence}%</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                ✓ 5 of 6 agents vote for Combined Recovery — Orchestrator consensus achieved (83% alignment)
              </div>
            </div>

            {/* ── Navigation ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/conflict-resolution"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                View Conflict Resolution
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/recovery-strategies"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
              >
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Compare Recovery Strategies
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </EnterpriseShell>
  );
}
