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

const DEFAULT_STRATEGY = DEMO_RECOVERY_STRATEGIES[3]; // Combined Recovery

const AGENT_CONSENSUS = [
  { agent: 'Procurement',      vote: 'COMBINED (Secondary)', confidence: 87, note: 'Alternate supplier 7-day lead time is a constraint; endorses combined.' },
  { agent: 'Inventory',        vote: 'COMBINED',             confidence: 94, note: 'Chennai STO of 120 units is immediately actionable.' },
  { agent: 'Production',       vote: 'COMBINED',             confidence: 91, note: 'Prioritization of EV-X Prime lines aligned with combined approach.' },
  { agent: 'Logistics',        vote: 'COMBINED',             confidence: 89, note: 'Air + overnight road is the only dual-mode option within the buffer window.' },
  { agent: 'Finance',          vote: 'COMBINED',             confidence: 96, note: '11.5x ROI is the highest across all scenarios modeled.' },
  { agent: 'Customer Impact',  vote: 'COMBINED',             confidence: 93, note: 'Only strategy that satisfies all 8 OEM Tier-1 SLA deadlines.' },
];

const GOVERNANCE_POINTS = [
  'Human verification is mandatory. Autonomous execution is disabled.',
  'This approval constitutes a formal digital sign-off under Astra Motors SCM Policy 4.2.',
  'All SAP actions executed post-approval are tagged as SIMULATED for this demonstration.',
  'Approval is logged in the audit trail with timestamp, role, and justification.',
];

export default function ApprovalCenterPage() {
  const router = useRouter();
  const { approvedStrategy, setWorkflowState } = useWorkflow();
  const strategy = approvedStrategy || DEFAULT_STRATEGY;

  const [decision, setDecision] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES'>('PENDING');
  const [comment, setComment] = useState('');
  const [approvedAt, setApprovedAt] = useState<string>('');

  function handleApprove() {
    const ts = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    setApprovedAt(ts);
    setDecision('APPROVED');
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
            <div className="ml-auto">
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
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Recovery Strategy Under Review</h3>
            <p className="text-xs text-slate-500">Decision Orchestrator Score: {strategy.overall_score.toFixed(1)} / 100</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-slate-900">{strategy.name}</p>
              {strategy.is_recommended && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  ★ AI RECOMMENDED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">{strategy.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: IndianRupee, label: 'Total Cost',        value: '₹2.1L',   color: 'text-slate-700' },
                { icon: Clock,       label: 'Recovery Time',     value: '1 Day',    color: 'text-emerald-700' },
                { icon: TrendingUp,  label: 'Revenue Protected', value: '₹24.2L',  color: 'text-emerald-700' },
                { icon: ShieldCheck, label: 'ROI',               value: '11.5x',   color: 'text-sky-700' },
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
                and triggering ₹27.4L in unmitigated losses. The Combined Recovery strategy deploys air cargo (100 units, 2 days)
                and overnight road express from PL-02 Chennai (120 units, 36 hrs), delivering materials before line stoppage.
                This protects ₹24.2L in revenue and preserves all 8 Tier-1 OEM SLA commitments at a net ROI of 11.5x.
              </p>
            </div>
          </div>
        </div>

        {/* ── Agent Consensus Breakdown ────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">AI Agent Consensus Breakdown</h3>
            <p className="text-xs text-slate-500">6 specialized agents — all endorsing Combined Recovery</p>
          </div>
          <div className="p-5 space-y-3">
            {AGENT_CONSENSUS.map((ac) => (
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
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition"
              >
                <ShieldCheck className="w-4 h-4" />
                APPROVE RECOVERY
              </button>
              <button
                onClick={handleRequestChanges}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 text-sm font-bold rounded-md transition"
              >
                <MessageSquare className="w-4 h-4" />
                Request Changes
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-sm font-bold rounded-md transition"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )}

        {/* ── Approved State ────────────────────────────────────── */}
        {decision === 'APPROVED' && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-base font-bold text-emerald-900">Recovery Strategy Approved</p>
                <p className="text-xs text-emerald-700">
                  Approved by: Supply Chain Manager · {approvedAt} · Ref: APR-2026-S104-001
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-800">
              Combined Recovery strategy is formally authorized. The Recovery Execution engine is now enabled. All 5 simulated SAP actions are queued and ready to execute.
            </p>
            <Link
              href="/recovery-execution"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
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
                className="px-4 py-2 bg-white border border-red-300 text-red-700 text-xs font-bold rounded hover:bg-red-50 transition"
              >
                Reconsider
              </button>
              <Link href="/ai-command-center" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition">
                Return to AI Command Center
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
                className="px-4 py-2 bg-white border border-amber-300 text-amber-700 text-xs font-bold rounded hover:bg-amber-50 transition"
              >
                Cancel
              </button>
              <Link
                href="/ai-command-center"
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition"
              >
                Send to Agents & Re-analyze
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
