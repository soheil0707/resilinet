'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock,
  Database,
  Filter,
  Layers,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { PageHeader } from '@/components/enterprise/PageHeader';
import { LiveDataBadge } from '@/components/enterprise/LiveDataBadge';
import { KpiCard } from '@/components/enterprise/KpiCard';
import { LifecycleStepper } from '@/components/enterprise/LifecycleStepper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { HanaDisruption } from '@/lib/hana/repository';
import { useWorkflow } from '@/lib/workflow/workflow-context';

function DisruptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDisruptionId = searchParams.get('disruptionId') || 'DIS-1001';

  const [hanaDisruptions, setHanaDisruptions] = useState<HanaDisruption[] | null>(null);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string>(queryDisruptionId);
  const [dataSource, setDataSource] = useState<'sap-hana' | 'fallback'>('sap-hana');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters state
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { workflowState } = useWorkflow();

  const loadDisruptions = async () => {
    try {
      const res = await fetch('/api/hana/disruptions');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const result = await res.json();

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setHanaDisruptions(result.data);
        setDataSource('sap-hana');
        return;
      }
      throw new Error(result.error || 'Empty or invalid response from SAP HANA API');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('SAP HANA API unavailable, engaging local fallback:', message);
      setDataSource('fallback');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDisruptions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDisruptions();
  };

  const isHana = dataSource === 'sap-hana' && hanaDisruptions !== null && hanaDisruptions.length > 0;

  // Fallback disruptions dataset
  const fallbackDisruptions: HanaDisruption[] = [
    {
      DISRUPTION_ID: 'DIS-1001',
      DISRUPTION_TYPE: 'Supplier Delay',
      SEVERITY: 'HIGH',
      LOCATION: 'East India',
      AFFECTED_SUPPLIER_ID: 'S-104',
      AFFECTED_PLANT_ID: 'PLANT-001',
      START_TIME: '2026-09-20T08:00:00Z',
      EXPECTED_DURATION_HOURS: 48,
      STATUS: 'ACTIVE',
      DESCRIPTION: 'Tier-1 Supplier S-104 Global Metals production stoppage delaying critical steering assemblies (M-101).',
    },
    {
      DISRUPTION_ID: 'DIS-1002',
      DISRUPTION_TYPE: 'Port Congestion',
      SEVERITY: 'CRITICAL',
      LOCATION: 'West Coast',
      AFFECTED_SUPPLIER_ID: 'S-105',
      AFFECTED_PLANT_ID: 'PLANT-002',
      START_TIME: '2026-09-21T04:30:00Z',
      EXPECTED_DURATION_HOURS: 72,
      STATUS: 'ACTIVE',
      DESCRIPTION: 'Severe container terminal backlog delaying high-tensile chassis fastener consignments.',
    },
    {
      DISRUPTION_ID: 'DIS-1003',
      DISRUPTION_TYPE: 'Component Defect',
      SEVERITY: 'MEDIUM',
      LOCATION: 'North India',
      AFFECTED_SUPPLIER_ID: 'S-101',
      AFFECTED_PLANT_ID: 'PLANT-001',
      START_TIME: '2026-09-22T10:15:00Z',
      EXPECTED_DURATION_HOURS: 24,
      STATUS: 'MONITORING',
      DESCRIPTION: 'Batch metallurgical hardness test anomaly on cast aluminium engine brackets placed on quality hold.',
    },
    {
      DISRUPTION_ID: 'DIS-1004',
      DISRUPTION_TYPE: 'Logistics Strike',
      SEVERITY: 'HIGH',
      LOCATION: 'South India',
      AFFECTED_SUPPLIER_ID: 'S-106',
      AFFECTED_PLANT_ID: 'PLANT-002',
      START_TIME: '2026-09-22T14:00:00Z',
      EXPECTED_DURATION_HOURS: 60,
      STATUS: 'ACTIVE',
      DESCRIPTION: 'Regional commercial vehicle interstate toll transport strike impeding ABS braking unit transit corridors.',
    },
    {
      DISRUPTION_ID: 'DIS-1005',
      DISRUPTION_TYPE: 'Plant Maintenance',
      SEVERITY: 'LOW',
      LOCATION: 'Central India',
      AFFECTED_SUPPLIER_ID: 'INTERNAL',
      AFFECTED_PLANT_ID: 'PLANT-003',
      START_TIME: '2026-09-23T06:00:00Z',
      EXPECTED_DURATION_HOURS: 12,
      STATUS: 'RESOLVED',
      DESCRIPTION: 'Scheduled hydraulic stamping press calibration completed ahead of line shift change.',
    },
  ];

  const allDisruptions = isHana ? hanaDisruptions! : fallbackDisruptions;

  // Filtered disruptions
  const filteredDisruptions = useMemo(() => {
    return allDisruptions.filter((d) => {
      const matchSeverity =
        severityFilter === 'ALL' || d.SEVERITY?.toUpperCase() === severityFilter;
      const matchStatus =
        statusFilter === 'ALL' || d.STATUS?.toUpperCase() === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        d.DISRUPTION_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.DISRUPTION_TYPE.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.LOCATION.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.AFFECTED_PLANT_ID && d.AFFECTED_PLANT_ID.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.AFFECTED_SUPPLIER_ID && d.AFFECTED_SUPPLIER_ID.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSeverity && matchStatus && matchSearch;
    });
  }, [allDisruptions, severityFilter, statusFilter, searchQuery]);

  // Compute live summary KPIs
  const totalCount = allDisruptions.length;
  const criticalCount = allDisruptions.filter((d) => d.SEVERITY?.toUpperCase() === 'CRITICAL').length;
  const highCount = allDisruptions.filter((d) => d.SEVERITY?.toUpperCase() === 'HIGH').length;
  const monitoringCount = allDisruptions.filter(
    (d) => d.STATUS?.toUpperCase() === 'MONITORING' || d.STATUS?.toUpperCase() === 'RESOLVED'
  ).length;
  const activeCount = allDisruptions.filter((d) => d.STATUS?.toUpperCase() === 'ACTIVE').length;

  // Currently selected disruption
  const activeDisruption =
    allDisruptions.find((d) => d.DISRUPTION_ID === selectedDisruptionId) ||
    allDisruptions[0] ||
    fallbackDisruptions[0];

  const handleSelectDisruption = (id: string) => {
    setSelectedDisruptionId(id);
    router.replace(`/disruptions?disruptionId=${id}`, { scroll: false });
  };

  return (
    <EnterpriseShell>
      {/* ── Page Header ─────────────────────────────────── */}
      <PageHeader
        icon={<AlertOctagon className="w-5 h-5 text-sky-700" />}
        title="DISRUPTION CENTER"
        description="Live supply-chain disruption monitoring, multi-tier node telemetry, and crisis incident triage."
        badge={<LiveDataBadge isLive={isHana} />}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              title="Refresh live incident telemetry from SAP HANA Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <Link
              href="/crisis-analysis"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
            >
              <span>Analyze Crisis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {/* ── Workflow Stepper ─────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
        <LifecycleStepper currentStage="MONITOR" incidentId="DIS-1001" />
      </div>

      {/* ── Disruption Summary KPI Row ──────────────────── */}
      <section aria-label="Disruption Summary Metrics">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard
              label="Total Disruptions"
              value={totalCount}
              status="neutral"
              icon={<Layers className="w-4 h-4" />}
              delta={{ value: '5 Recorded', isPositive: true, label: 'in SAP HANA' }}
              tooltip="Total disruption events currently logged in ORCH_DISRUPTION"
            />
            <KpiCard
              label="Critical"
              value={criticalCount}
              status="critical"
              icon={<ShieldAlert className="w-4 h-4" />}
              delta={{ value: 'Immediate', isPositive: false, label: 'executive action' }}
              tooltip="Disruptions with CRITICAL severity grade"
            />
            <KpiCard
              label="High Severity"
              value={highCount}
              status="warning"
              icon={<AlertTriangle className="w-4 h-4" />}
              delta={{ value: 'DIS-1001', isPositive: false, label: 'primary crisis' }}
              tooltip="Disruptions with HIGH severity grade"
            />
            <KpiCard
              label="Monitoring"
              value={monitoringCount}
              status="info"
              icon={<Activity className="w-4 h-4" />}
              delta={{ value: 'Stable', isPositive: true, label: 'containment' }}
              tooltip="Incidents in MONITORING or RESOLVED status"
            />
            <KpiCard
              label="Active Disruptions"
              value={activeCount}
              status="critical"
              icon={<AlertOctagon className="w-4 h-4" />}
              delta={{ value: '4 Active', isPositive: false, label: 'requiring mitigation' }}
              tooltip="Incidents actively impacting supply chain throughput"
            />
          </div>
        )}
      </section>

      {/* ── Primary Crisis Spotlight (DIS-1001) ─────────── */}
      <section aria-labelledby="primary-incident-heading">
        <Card className="p-5 border-l-4 border-l-rose-500 bg-rose-50/20 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  PRIMARY ACTIVE CRISIS
                </span>
                <span className="font-mono text-xs font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                  DIS-1001
                </span>
                <Badge variant="warning" size="sm">
                  HIGH SEVERITY
                </Badge>
                <Badge variant="critical" size="sm" pulse dot>
                  ACTIVE
                </Badge>
              </div>

              <div>
                <h3 id="primary-incident-heading" className="text-base sm:text-lg font-bold text-slate-900">
                  Supplier Delay — Global Metals Ltd. Shutdown
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                  Tier-1 Supplier S-104 (Jamshedpur, East India) unplanned stoppage halting critical Steering Assembly (M-101) shipments to PLANT-001 (Hyderabad). Unmitigated line stoppage occurs in 2.4 days.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                <span>Location: <strong className="text-slate-800 font-semibold">East India</strong></span>
                <span>•</span>
                <span>Plant: <strong className="text-slate-800 font-mono">PLANT-001</strong></span>
                <span>•</span>
                <span>Duration: <strong className="text-slate-800 font-mono">48 hours</strong></span>
                <span>•</span>
                <span>Revenue at Risk: <strong className="text-rose-700 font-mono font-bold">₹27.4L</strong></span>
              </div>
            </div>

            <div className="shrink-0 self-start lg:self-center">
              <Link
                href="/crisis-analysis"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
              >
                <span>Analyze Crisis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Filters & Search Bar ─────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, supplier, plant, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-hidden transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Severity:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Status:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
            {['ALL', 'ACTIVE', 'MONITORING', 'RESOLVED'].map((stat) => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === stat
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Disruption List + Detail Panel ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Disruption List / Table (Cols 7) ────────────── */}
        <section aria-label="Disruption Register" className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Disruption Register ({filteredDisruptions.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Click row to inspect operational context
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">ID / Severity</th>
                    <th className="py-2.5 px-3">Disruption Type</th>
                    <th className="py-2.5 px-3">Plant / Location</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisruptions.map((row) => {
                    const isSelected = row.DISRUPTION_ID === selectedDisruptionId;
                    const isPrimary = row.DISRUPTION_ID === 'DIS-1001';
                    const sevVariant =
                      row.SEVERITY?.toUpperCase() === 'CRITICAL'
                        ? 'critical'
                        : row.SEVERITY?.toUpperCase() === 'HIGH'
                        ? 'warning'
                        : 'info';

                    return (
                      <tr
                        key={row.DISRUPTION_ID}
                        onClick={() => handleSelectDisruption(row.DISRUPTION_ID)}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-l-4 border-l-sky-600 font-medium'
                            : isPrimary
                            ? 'bg-rose-50/30 hover:bg-rose-50/60'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {row.DISRUPTION_ID}
                            </span>
                            <Badge variant={sevVariant} size="sm">
                              {row.SEVERITY}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 truncate max-w-[140px]">
                            {row.DISRUPTION_TYPE}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {row.AFFECTED_SUPPLIER_ID || 'Internal'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="font-mono font-medium">{row.AFFECTED_PLANT_ID || 'PLANT-001'}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                            {row.LOCATION}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {row.EXPECTED_DURATION_HOURS}h
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              row.STATUS?.toUpperCase() === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : row.STATUS?.toUpperCase() === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {row.STATUS}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ChevronRight
                            className={`w-4 h-4 inline transition ${
                              isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-400'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Incident Context Detail Panel (Cols 5) ──────── */}
        <section aria-labelledby="detail-panel-heading" className="lg:col-span-5 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Incident Context Detail
            </span>
            <span className="font-mono text-xs font-bold text-sky-700">
              {activeDisruption.DISRUPTION_ID}
            </span>
          </div>

          <Card className="p-5 flex flex-col justify-between flex-1 shadow-2xs border-slate-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {activeDisruption.DISRUPTION_ID}
                    </span>
                    <Badge
                      variant={
                        activeDisruption.SEVERITY === 'CRITICAL'
                          ? 'critical'
                          : activeDisruption.SEVERITY === 'HIGH'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {activeDisruption.SEVERITY}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-600 font-mono">
                      {activeDisruption.STATUS}
                    </span>
                  </div>
                  <h4 id="detail-panel-heading" className="text-base font-bold text-slate-900 mt-2">
                    {activeDisruption.DISRUPTION_TYPE}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Facility: {activeDisruption.AFFECTED_PLANT_ID || 'PLANT-001'} • {activeDisruption.LOCATION}
                  </p>
                </div>
              </div>

              {/* Operational Detail Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supplier
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {activeDisruption.AFFECTED_SUPPLIER_ID === 'S-104'
                      ? 'S-104 / Global Metals Ltd.'
                      : activeDisruption.AFFECTED_SUPPLIER_ID || 'Internal Operations'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Expected Duration
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {activeDisruption.EXPECTED_DURATION_HOURS} hours
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Plant
                  </span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                    {activeDisruption.AFFECTED_PLANT_ID || 'PLANT-001'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Location
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {activeDisruption.LOCATION}
                  </span>
                </div>
              </div>

              {/* Live Inventory & Buffer Context (V_ORCH_DISRUPTION_CONTEXT) */}
              {activeDisruption.DISRUPTION_ID === 'DIS-1001' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sky-600" />
                    Buffer & Consumption Telemetry (M-101)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Current Stock</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">240 units</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Safety Stock</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">500 units</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Daily Run-rate</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">100/day</span>
                    </div>
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] text-rose-700 block font-bold">Buffer Left</span>
                      <span className="font-mono font-extrabold text-rose-800 text-xs">2.4 days</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <span className="font-semibold">Plant Capacity: 1,000 u/day</span>
                    <span className="font-bold text-amber-800">Utilization: 85%</span>
                  </div>
                </div>
              )}

              {/* Narrative description */}
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold block text-slate-900 mb-0.5">Description:</span>
                {activeDisruption.DESCRIPTION}
              </div>
            </div>

            {/* Panel Footer CTA */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Next Stage: Multi-Layer Impact Analysis
              </span>
              <Link
                href="/crisis-analysis"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition shadow-2xs focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:outline-hidden"
              >
                <span>ANALYZE CRISIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function DisruptionsPage() {
  return (
    <Suspense
      fallback={
        <EnterpriseShell>
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
            <span>Loading Disruption Center...</span>
          </div>
        </EnterpriseShell>
      }
    >
      <DisruptionsContent />
    </Suspense>
  );
}
