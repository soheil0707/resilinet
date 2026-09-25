'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import {
  DEMO_ENTERPRISE_SYSTEMS,
  DEMO_EXTERNAL_INTELLIGENCE,
  DEMO_SAMPLE_NORMALIZED_EVENT,
  DEMO_CONNECTOR_CATEGORIES,
  IntegrationConnector,
} from '@/lib/data/demo-data';
import {
  Layers,
  Database,
  Radio,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Server,
  Cpu,
  CloudRain,
  Truck,
  ShieldAlert,
  Globe,
  Newspaper,
  Code2,
  Workflow,
  Sparkles,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export default function IntegrationHubPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ENTERPRISE' | 'EXTERNAL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ERP');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [hanaStatus, setHanaStatus] = useState<{
    schema: string;
    isLive: boolean;
    checked: boolean;
  }>({
    schema: 'HACKFEST0145',
    isLive: false,
    checked: false,
  });

  React.useEffect(() => {
    fetch('/api/hana/test')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHanaStatus({
            schema: data.schema || 'HACKFEST0145',
            isLive: true,
            checked: true,
          });
        } else {
          setHanaStatus({
            schema: 'HACKFEST0145',
            isLive: false,
            checked: true,
          });
        }
      })
      .catch(() => {
        setHanaStatus({
          schema: 'HACKFEST0145',
          isLive: false,
          checked: true,
        });
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(DEMO_SAMPLE_NORMALIZED_EVENT, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateConnection = () => {
    setTestResult('Schema validation successful. Normalized event pipeline active (Prototype Mode).');
    setTimeout(() => {
      setTestResult(null);
      setShowAddModal(false);
    }, 1800);
  };

  return (
    <EnterpriseShell>
      <div className="space-y-6">

        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                    Vendor-Neutral Integration Layer
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Protocol: Open Event Schema v2.1
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Integration Hub
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Connect enterprise systems and external intelligence to ResiliNet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Data Source</span>
              </button>
            </div>
          </div>

          {/* Positioning & Compliance Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px]">
                Architectural Positioning
              </span>
              <span>
                ResiliNet operates as an independent resilience intelligence and decision layer, compatible with SAP, Oracle, Microsoft Dynamics, WMS/TMS, and multi-source external telemetry.
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              11 Modular Connectors Configured
            </span>
          </div>
        </div>

        {/* ── Real SAP HANA Cloud Connectivity Status Section ── */}
        <div className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    SAP HANA Cloud
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                    hanaStatus.isLive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    Connection: {hanaStatus.isLive ? 'LIVE' : 'UNAVAILABLE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authoritative Operational Single Source of Truth for ResiliNet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Schema:</span>
              <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                {hanaStatus.schema}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Type</span>
              <span className="font-bold text-slate-800 mt-0.5 block">SAP HANA Cloud</span>
              <span className="text-[10px] text-slate-500">Native TLS 1.3 Driver</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Schema</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{hanaStatus.schema}</span>
              <span className="text-[10px] text-slate-500">Production Tenant</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Operational Role</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">Single Source of Truth</span>
              <span className="text-[10px] text-slate-500">Disruptions &amp; Executions</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Connection State</span>
              <span className={`font-mono font-bold mt-0.5 block ${hanaStatus.isLive ? 'text-emerald-700' : 'text-red-600'}`}>
                {hanaStatus.isLive ? 'LIVE' : 'UNAVAILABLE'}
              </span>
              <span className="text-[10px] text-slate-500">Validated via /api/hana/test</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Integration Scope &amp; Architectural Boundaries:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              SAP HANA Cloud (Schema: <strong>{hanaStatus.schema}</strong>) is the active operational database powering live disruption models, strategy rankings, AI consensus decisions, and recovery execution tracking.
              ResiliNet does not claim live SAP S/4HANA integration or live MM/TM/EWM/PP/SD transactions. Enterprise ERP module adapters in the catalog below are conceptual integration templates in prototype mode.
            </p>
          </div>
        </div>

        {/* ── Section 3: Data Flow Architecture (Understood in 5s) ── */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">
                System Topology
              </span>
              <h2 className="text-sm font-bold text-white mt-0.5">
                ResiliNet End-to-End Resilience Pipeline
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Bi-directional normalized data bus
            </span>
          </div>

          {/* Visual Architecture Flow */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {/* Step 1 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">01 INGESTION</span>
              <div className="my-2">
                <p className="text-xs font-bold text-sky-300">Enterprise Systems + External Feeds</p>
                <p className="text-[10px] text-slate-400 mt-1">SAP, Oracle, TMS, Weather, Carrier APIs</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Raw Event Feeds</div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">02 GATEWAY</span>
              <div className="my-2">
                <p className="text-xs font-bold text-white">Integration Hub</p>
                <p className="text-[10px] text-slate-400 mt-1">Modular protocol adapters &amp; webhooks</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Multi-Protocol Adapter</div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">03 TRANSLATION</span>
              <div className="my-2">
                <p className="text-xs font-bold text-white">Data Normalization</p>
                <p className="text-[10px] text-slate-400 mt-1">Canonical supply-chain event standard</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">JSON Canonical Schema</div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">04 DETECTION</span>
              <div className="my-2">
                <p className="text-xs font-bold text-amber-400">ResiliNet Risk Intelligence</p>
                <p className="text-[10px] text-slate-400 mt-1">Early warning score &amp; buffer horizon</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Horizon Evaluation</div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">05 REASONING</span>
              <div className="my-2">
                <p className="text-xs font-bold text-sky-400">AI Agent Layer</p>
                <p className="text-[10px] text-slate-400 mt-1">6 Specialized domain agents</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Multi-Agent Synthesis</div>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">06 GOVERNANCE</span>
              <div className="my-2">
                <p className="text-xs font-bold text-white">Decision Orchestrator</p>
                <p className="text-[10px] text-slate-400 mt-1">Conflict arbitration &amp; manager sign-off</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Multi-Factor Weighting</div>
            </div>

            {/* Step 7 */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">07 EXECUTION</span>
              <div className="my-2">
                <p className="text-xs font-bold text-emerald-400">Recovery / Preventive Actions</p>
                <p className="text-[10px] text-slate-400 mt-1">PO dispatch, STO transfer, memory capture</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">ERP Closed-Loop</div>
            </div>
          </div>
        </div>

        {/* ── Tabs for Connected Systems & External Feeds ────────── */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Connectors (11)
            </button>
            <button
              onClick={() => setActiveTab('ENTERPRISE')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'ENTERPRISE'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Enterprise Systems (6)
            </button>
            <button
              onClick={() => setActiveTab('EXTERNAL')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'EXTERNAL'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              External Intelligence (5)
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium pb-3 hidden sm:inline">
            Status: Prototype Data / Integration Ready
          </span>
        </div>

        {/* ── Section 1: Enterprise Systems Cards ──────────────── */}
        {(activeTab === 'ALL' || activeTab === 'ENTERPRISE') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-700" />
                  <span>Section 1: Enterprise Systems (ERP, WMS, TMS)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core enterprise backbones providing procurement, inventory positions, production schedules, and dispatch data.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_ENTERPRISE_SYSTEMS.map((sys) => (
                <div
                  key={sys.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {sys.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{sys.name}</h3>
                        <p className="text-[11px] text-sky-700 font-medium">{sys.systemType}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-1 rounded border text-right ${
                        sys.status === 'Prototype Data / SAP-Ready'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {sys.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {sys.description}
                    </p>

                    {sys.transparentNotice && (
                      <div className="mt-3 bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] p-2 rounded-lg font-medium">
                        {sys.transparentNotice}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Supported Protocols:</span>
                        <span className="font-mono text-slate-700 font-medium">
                          {sys.protocols.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2 text-slate-500">
                        <span>Data Scope:</span>
                        <span className="text-right text-slate-700 font-medium truncate max-w-[180px]">
                          {sys.dataScope.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">{sys.id}</span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Configure Adapter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2: External Intelligence Cards ─────────────── */}
        {(activeTab === 'ALL' || activeTab === 'EXTERNAL') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-slate-700" />
                  <span>Section 2: External Intelligence Feeds (Third-Party Signals)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Macro signals enriching risk prediction with weather, freight congestion, supplier credit risk, and commodity pricing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_EXTERNAL_INTELLIGENCE.map((ext) => (
                <div
                  key={ext.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                          EXTERNAL INTEL
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{ext.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{ext.systemType}</p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-1 rounded border bg-sky-50 text-sky-800 border-sky-200">
                        {ext.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {ext.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Standard Adapters:</span>
                        <span className="font-mono text-slate-700 font-medium truncate max-w-[180px]">
                          {ext.protocols.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2 text-slate-500">
                        <span>Payload Scope:</span>
                        <span className="text-right text-slate-700 font-medium truncate max-w-[180px]">
                          {ext.dataScope.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">{ext.id}</span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Attach Feed</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 4: Modular Connector Model & Canonical Event ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                  Schema Architecture
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Section 4: Modular Connector Model &amp; Canonical Event Format
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Every external or enterprise connector converts disparate formats into the ResiliNet Canonical Event Schema before triggering agent evaluation.
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Event Schema'}</span>
            </button>
          </div>

          {/* Model Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-around gap-2 text-xs font-medium text-slate-700 text-center">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Input</span>
              Data Source (SAP / Carrier / Sensor)
            </div>
            <span className="text-slate-400 font-bold">→</span>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Adapter</span>
              Connector &amp; Parser
            </div>
            <span className="text-slate-400 font-bold">→</span>
            <div className="bg-white border border-sky-300 bg-sky-50/50 px-3 py-1.5 rounded-md shadow-2xs font-bold text-sky-900">
              <span className="text-[10px] font-bold text-sky-700 uppercase block">Normalized</span>
              Canonical Event Schema
            </div>
            <span className="text-slate-400 font-bold">→</span>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
              ResiliNet Decision Layer
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-900 text-slate-400 text-[11px] font-mono px-4 py-2 rounded-t-lg border-b border-slate-800">
              <span>canonical-event-sample.json</span>
              <span className="text-amber-400 font-bold">ARCHITECTURE EXAMPLE ONLY</span>
            </div>
            <pre className="bg-slate-950 text-sky-300 font-mono text-xs p-4 rounded-b-lg overflow-x-auto leading-relaxed border border-slate-900">
              {JSON.stringify(DEMO_SAMPLE_NORMALIZED_EVENT, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Section 5: + Add Data Source Modal ─────────────────── */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-mono">
                  Connector Provisioning
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Add Enterprise System or Intelligence Connector
                </h3>
                <p className="text-xs text-slate-600">
                  Select a connector category to register in the ResiliNet Integration Hub.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Transparent Prototype Notice */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Connector configuration — prototype:</strong> In this evaluation environment, registration establishes standard data pipeline bindings without requiring live production credentials or API keys.
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                1. Select Connector Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEMO_CONNECTOR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block truncate">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block truncate">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connector Configuration Fields */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-800">
                2. Target Source Endpoint Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Source Name</label>
                  <input
                    type="text"
                    defaultValue={`Enterprise ${selectedCategory} Connector`}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Authentication Method</label>
                  <select className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500">
                    <option>OAuth 2.0 (Client Credentials)</option>
                    <option>Mutual TLS (mTLS Certificate)</option>
                    <option>API Gateway Key</option>
                    <option>Signed Webhook (HMAC-SHA256)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">Webhook / REST Ingestion Endpoint</label>
                <input
                  type="text"
                  defaultValue={`https://api.resilinet.internal/v2/ingest/${selectedCategory.toLowerCase()}-stream`}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {testResult && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">Mode: Architecture Prototype</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulateConnection}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition cursor-pointer"
                >
                  Verify &amp; Register Connector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EnterpriseShell>
  );
}
