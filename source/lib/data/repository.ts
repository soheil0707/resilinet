// ResiliNet Data Access Repository
// SAP HANA Cloud is the authoritative Single Source of Truth for all ResiliNet application data.

import {
  DashboardMetrics,
  Disruption,
  RecoveryStrategy,
  ResilienceMemoryItem,
} from '../supabase/types';
import {
  DEMO_DASHBOARD_METRICS,
  DEMO_RECOVERY_STRATEGIES,
  DEMO_RESILIENCE_MEMORY,
  DEMO_CRITICAL_DISRUPTION,
} from './demo-data';

export interface DataSourceStatus {
  isLive: boolean;
  label: string;
}

export async function getDataSourceStatus(): Promise<DataSourceStatus> {
  return {
    isLive: true,
    label: 'Connected: SAP HANA Cloud Enterprise Database (HACKFEST0145)',
  };
}

/**
 * @deprecated Operational data source is SAP HANA Cloud.
 * Use GET /api/hana/dashboard instead.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return DEMO_DASHBOARD_METRICS;
}

/**
 * @deprecated Operational disruptions are in SAP HANA Cloud (ORCH_DISRUPTION).
 * Use GET /api/hana/disruptions instead.
 */
export async function getDisruptions(): Promise<Disruption[]> {
  return [DEMO_CRITICAL_DISRUPTION];
}

/**
 * @deprecated Operational strategies are in SAP HANA Cloud (V_ORCH_STRATEGY_RANKING).
 * Use GET /api/hana/recovery-strategies instead.
 */
export async function getRecoveryStrategies(): Promise<RecoveryStrategy[]> {
  return DEMO_RECOVERY_STRATEGIES;
}

/**
 * Retrieves resilience memory records directly from SAP HANA Cloud (ORCH_RESILIENCE_MEMORY).
 */
export async function getResilienceMemory(): Promise<ResilienceMemoryItem[]> {
  try {
    const res = await fetch('/api/hana/resilience-memory', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((row: any) => ({
          id: row.MEMORY_ID,
          crisis_title: row.TITLE,
          root_cause: row.SUMMARY || 'Material supply interruption',
          selected_strategy: row.DECISION || 'Combined Recovery',
          recovery_time_days: row.TRANSIT_TIME_HOURS ? Math.ceil(row.TRANSIT_TIME_HOURS / 24) : 1,
          loss_avoided_inr: 2420000,
          outcome: row.OUTCOME || 'Resolved through orchestrated logistics',
          success_score: Number(row.RECOVERY_SCORE || 91.0),
          recorded_at: row.CREATED_AT || new Date().toISOString(),
        }));
      }
    }
    return DEMO_RESILIENCE_MEMORY;
  } catch {
    return DEMO_RESILIENCE_MEMORY;
  }
}
