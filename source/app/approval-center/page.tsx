'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { DEMO_RECOVERY_STRATEGIES } from '@/lib/data/demo-data';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  MessageSquare,
  ArrowRight,
  Clock,
  IndianRupee,
  Users,
  Lock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const GOVERNANCE_POINTS = [
  'Human verification is mandatory. Autonomous execution is disabled.',
  'This approval constitutes a formal digital sign-off under Astra Motors SCM Policy 4.2.',
  'All SAP actions executed post-approval are tagged as SIMULATED for this demonstration.',
  'Approval is logged in the audit trail with timestamp, role, and justification.',
];

export default function ApprovalCenterPage() {
  const router = useRouter();
  const { approvedStrategy, selectedStrategy, isOverride, setApprovedStrategy, setWorkflowState, workflowState } = useWorkflow();

  // Use the exact strategy selected by the user, or fall back to the recommended strategy only if none selected
  const strategy = approvedStrategy || selectedStrategy || DEMO_RECOVERY_STRATEGIES[0];
  const isHumanOverride = isOverride || strategy.id !== 'STRAT-004';

  const [decision, setDecision] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES'>(() =>
    workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED'
      ? 'APPROVED'
      : 'PENDING'
  );
  const [comment, setComment] = useState('');
  const [approvedAt, setApprovedAt] = useState<string>(() =>
    workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED'
      ? new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : ''
  );

  React.useEffect(() => {
    if (workflowState === 'APPROVED' || workflowState === 'EXECUTING' || workflowState === 'RECOVERED') {
      setDecision('APPROVED');
    }
  }, [workflowState]);

  const costLabel = '₹' + (strategy.cost_inr / 100000).toFixed(1) + 'L';
  const timeLabel = strategy.recovery_time_days + (strategy.recovery_time_days === 1 ? ' Day' : ' Days');
  const revenueLabel = '₹' + (strategy.revenue_protected_inr / 100000).toFixed(1) + 'L';
  const roiLabel = strategy.cost_inr > 0 ? (strategy.revenue_protected_inr / strategy.cost_inr).toFixed(1) + 'x' : 'N/A';

  const agentConsensus = [
    {
      agent: 'Procurement',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 87 : strategy.id === 'STRAT-003' ? 92 : strategy.id === 'STRAT-002' ? 90 : 85,
      note: `Evaluated supplier response window; endorses ${strategy.name} to minimize downtime.`,
    },
    {
      agent: 'Inventory',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 94 : strategy.id === 'STRAT-002' ? 96 : 88,
      note: `Confirmed stock buffer availability and logistics readiness for ${strategy.name}.`,
    },
    {
      agent: 'Production',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 91 : strategy.id === 'STRAT-003' ? 93 : 86,
      note: `Aligned shift schedules to accommodate the ${timeLabel} turnaround time.`,
    },
    {
      agent: 'Logistics',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 89 : strategy.id === 'STRAT-003' ? 95 : 88,
      note: `Carrier capacity and lane-haul routing secured within projected ${costLabel} cost.`,
    },
    {
      agent: 'Finance',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 96 : strategy.id === 'STRAT-002' ? 93 : 89,
      note: `${roiLabel} projected return on capital; protects ${revenueLabel} at risk.`,
    },
    {
      agent: 'Customer Impact',
      vote: strategy.name,
      confidence: strategy.id === 'STRAT-004' ? 93 : strategy.id === 'STRAT-003' ? 94 : 84,
      note: `Preserves primary OEM Tier-1 SLA fulfillment commitments for 20 fleet orders.`,
    },
  ];

  function handleApprove() {
    const ts = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    setApprovedAt(ts);
    setDecision('APPROVED');
    setApprovedStrategy(strategy, isHumanOverride);
    setWorkflowState('APPROVED');
  }

  function handleReject() {
    setDecision('REJECTED');
    setWorkflowState('CRISIS_ACTIVE');
  }

  function handleRequestChanges() {
    setDecision('CHANGES');
  }

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Human-in-the-Loop Approval Center</h2>
              <p className="text-xs text-slate-500">
                Supply Chain Manager formal sign-off — Incident DIS-2026-001 · S-104 Global Metals Crisis
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isHumanOverride && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠ Human Override Active
                </span>
              )}
              {decision === 'APPROVED' && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ APPROVED
                </span>
              )}
              {decision === 'REJECTED' && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-red-100 text-red-800 border border-red-300">
                  ✗ REJECTED
                </span>
              )}
              {decision === 'CHANGES' && (
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  ⚑ CHANGES REQUESTED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Strategy Summary ─────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Selected Strategy for Approval</h3>
              <p className="text-xs text-slate-500">
                Decision Orchestrator Score: {strategy.overall_score.toFixed(1)} / 100
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700">
                Approved Strategy:{' '}
                <span className="text-sky-700 font-extrabold">{strategy.name}</span>
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-slate-900">{strategy.name}</p>
                {isHumanOverride && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Human Choice
                  </span>
                )}
              </div>
              {strategy.is_recommended ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  ★ TOP PICK
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  ⚠ HUMAN OVERRIDE
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">{strategy.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: IndianRupee, label: 'Total Cost',        value: costLabel,    color: 'text-slate-700' },
                { icon: Clock,       label: 'Recovery Time',     value: timeLabel,    color: 'text-emerald-700' },
                { icon: TrendingUp,  label: 'Revenue Protected', value: revenueLabel, color: 'text-emerald-700' },
                { icon: ShieldCheck, label: 'Risk Level',        value: strategy.risk_level, color: strategy.risk_level === 'LOW' ? 'text-emerald-700' : 'text-amber-700' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${kpi.color}`} />
                    <p className={`text-base font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-[10px] text-slate-400">{kpi.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Business justification */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-bold text-sky-800">Business Justification</p>
              <p className="text-xs text-sky-800 leading-relaxed">
                Without intervention, PL-01 Hyderabad will exhaust M-101 inventory in 2.4 days, halting 17 production orders
                and triggering ₹27.4L in unmitigated losses. The <strong>{strategy.name}</strong> strategy mitigates the
                disruption within <strong>{timeLabel}</strong> at an estimated investment of <strong>{costLabel}</strong>, protecting <strong>{revenueLabel}</strong> in customer order value and securing OEM Tier-1 SLA milestones.
              </p>
            </div>
          </div>
        </div>

        {/* ── Agent Consensus Breakdown ────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">AI Agent Consensus Breakdown</h3>
            <p className="text-xs text-slate-500">6 specialized agents evaluating {strategy.name}</p>
          </div>
          <div className="p-5 space-y-3">
            {agentConsensus.map((ac) => (
              <div key={ac.agent} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{ac.agent} Agent</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">{ac.confidence}% confidence</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">{ac.vote}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ac.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Governance Disclaimer ────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-slate-700">Governance & Compliance Notice</p>
          </div>
          <ul className="space-y-2">
            {GOVERNANCE_POINTS.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 shrink-0 mt-0.5">›</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Decision Actions ─────────────────────────────────── */}
        {decision === 'PENDING' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Supply Chain Manager Decision</h3>
            <p className="text-xs text-slate-500">
              This action constitutes a formal approval and will be recorded in the audit log. Autonomous execution is disabled — you retain full control.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                APPROVE RECOVERY STRATEGY
              </button>
              <button
                onClick={handleRequestChanges}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 text-sm font-bold rounded-md transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Request Changes
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-sm font-bold rounded-md transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )}

        {/* ── Approved State ──────────────────────────────────────── */}
        {decision === 'APPROVED' && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-base font-bold text-emerald-900">
                  Approved Strategy: {strategy.name}
                </p>
                <p className="text-xs text-emerald-700">
                  Formal sign-off recorded at {approvedAt} by Authorized Supply Chain Manager.
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-800">
              {strategy.name} strategy is formally authorized. Recovery Execution engine is now armed and synchronized with actual strategy parameters ({timeLabel} recovery time, {costLabel} cost, {revenueLabel} protected).
            </p>
            <Link
              href="/recovery-execution"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition cursor-pointer"
            >
              Launch Recovery Execution Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── Rejected State ─────────────────────────────────────── */}
        {decision === 'REJECTED' && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-bold text-red-900">Strategy Rejected — Workflow Halted</p>
            </div>
            <p className="text-xs text-red-700">
              Recovery execution is blocked. Please return to the AI Command Center to re-analyze with updated constraints or select an alternate strategy.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDecision('PENDING')}
                className="px-4 py-2 bg-white border border-red-300 text-red-700 text-xs font-bold rounded hover:bg-red-50 transition cursor-pointer"
              >
                Reconsider
              </button>
              <Link href="/recovery-strategies" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition">
                Return to Recovery Strategies
              </Link>
            </div>
          </div>
        )}

        {/* ── Changes Requested ──────────────────────────────────── */}
        {decision === 'CHANGES' && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-bold text-amber-900">Changes Requested</p>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the changes required for the agents to re-analyze..."
              className="w-full border border-amber-300 rounded-lg p-3 text-xs text-slate-700 bg-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setDecision('PENDING')}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-700 text-xs font-bold rounded hover:bg-amber-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href="/what-if-simulator"
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition"
              >
                Simulate Scenarios & Re-analyze
              </Link>
            </div>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────── */}
        {decision === 'PENDING' && (
          <div className="flex gap-3">
            <Link
              href="/recovery-strategies"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              ← Recovery Strategies
            </Link>
            <Link
              href="/what-if-simulator"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              What-If Simulator
            </Link>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}
