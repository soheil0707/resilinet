'use client';

import React from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { useWorkflow } from '@/lib/workflow/workflow-context';
import { DEMO_RESILIENCE_MEMORY } from '@/lib/data/demo-data';
import {
  Database,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const LEARNINGS = [
  'Dual-modal logistics (air + road express) reliably beats single-mode strategies when inventory buffers are below 3 days.',
  'Inter-plant STO authorization should be pre-delegated to SCM level to reduce approval latency by 4–6 hours.',
  'Pre-qualified alternate vendors (like Bharat Precision) must be maintained in SAP AVL with up-to-date capacity confirmations for T+7 emergency activation.',
  'Tier-1 OEM SLA penalty clauses require a 3-day early warning trigger, not the standard 5-day buffer.',
  'Combined Recovery strategies consistently score 8–12 points higher than single-mode solutions when customer SLA constraints are active.',
];

function formatInr(val: number): string {
  return `₹${(val / 100000).toFixed(1)}L`;
}

export default function ResilienceMemoryPage() {
  const { workflowState, approvedStrategy, resetCrisisWorkflow } = useWorkflow();

  const priorMemory = DEMO_RESILIENCE_MEMORY;
  const showNewEntry = workflowState === 'RECOVERED';

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-sky-50 text-sky-700 border border-sky-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Resilience Memory & Organizational Learning</h2>
              <p className="text-xs text-slate-500">
                Institutional vector knowledge base — prior crisis decisions, root causes, and validated playbooks
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Crisis Records', value: showNewEntry ? '2' : '1', color: 'text-slate-800' },
            { label: 'Avg Success Score', value: showNewEntry ? '92.5' : '91.0', color: 'text-emerald-700' },
            { label: 'Total Loss Avoided', value: showNewEntry ? '₹43.0L' : '₹18.6L', color: 'text-emerald-700' },
            { label: 'Playbooks Extracted', value: showNewEntry ? '10' : '5', color: 'text-sky-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3.5 text-center">
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── NEW ENTRY — S-104 Crisis ──────────────────────────── */}
        {showNewEntry && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-emerald-200 bg-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">NEW ENTRY — Just Recorded</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                Success Score: 94.0 / 100
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-bold text-slate-900">Global Metals Ltd. (S-104) Supplier Shutdown — DIS-2026-001</p>
                <span className="text-[10px] text-slate-400">Recorded: {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Root Cause',         value: 'Unplanned blast furnace refractory stoppage at Jamshedpur' },
                  { label: 'Selected Strategy',  value: approvedStrategy?.name || 'Combined Recovery (Multi-Modal)' },
                  { label: 'Delay Mitigated',    value: '7 Days → 1 Day' },
                  { label: 'Loss Avoided',       value: formatInr(approvedStrategy?.revenue_protected_inr || 2420000) },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded border border-emerald-200 p-3">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-slate-800 leading-snug">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* SAP Actions Executed */}
              <div className="bg-white rounded-lg border border-emerald-200 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">SAP Actions Executed</p>
                {[
                  { module: 'SAP MM',  ref: 'PR-45009101',   desc: 'Alternate Sourcing PR — Bharat Precision (Pune)' },
                  { module: 'SAP EWM', ref: 'STO-881203',    desc: 'Stock Transport Order — Chennai → Hyderabad (120 units)' },
                  { module: 'SAP TM',  ref: 'FO-9021-AIR',   desc: 'Priority Air Freight — Jamshedpur Buffer (100 units)' },
                  { module: 'SAP PP',  ref: 'CO02-HYD-7710', desc: 'Assembly Line Reschedule — PL-01 Hyderabad' },
                  { module: 'SAP SD',  ref: 'VA02-ALLOC-221', desc: 'Customer Order Re-confirmation — 20 Fleet Orders' },
                ].map((a) => (
                  <div key={a.ref} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="font-mono text-slate-400 w-20 shrink-0">{a.module}</span>
                    <span className="font-mono text-slate-500 w-28 shrink-0">{a.ref}</span>
                    <span className="text-slate-700">{a.desc}</span>
                  </div>
                ))}
              </div>

              {/* Key Learnings for this crisis */}
              <div className="bg-white rounded-lg border border-emerald-200 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-bold text-slate-700">Key Learnings Extracted</p>
                </div>
                {LEARNINGS.map((l, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-emerald-500 shrink-0 mt-0.5">›</span>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Prior Memory Entry — Bharat Forge ────────────────── */}
        {priorMemory.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">{item.crisis_title}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Score: {item.success_score} / 100
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Root Cause',        value: item.root_cause },
                  { label: 'Selected Strategy', value: item.selected_strategy },
                  { label: 'Delay Reduction',   value: `6 Days → ${item.recovery_time_days} Day` },
                  { label: 'Loss Avoided',       value: formatInr(item.loss_avoided_inr) },
                ].map((kpi) => (
                  <div key={kpi.label}>
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">{kpi.label}</p>
                    <p className="font-semibold text-slate-800 text-xs leading-snug">{kpi.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-3">
                &ldquo;{item.outcome}&rdquo;
              </p>
              <p className="text-[10px] text-slate-400">
                Recorded: {new Date(item.recorded_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>
        ))}

        {/* ── Demo Reset & Navigation ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition"
          >
            <TrendingUp className="w-4 h-4 text-sky-300" />
            View Updated Executive Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {showNewEntry && (
            <button
              onClick={resetCrisisWorkflow}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Scenario
            </button>
          )}
        </div>
      </div>
    </EnterpriseShell>
  );
}
