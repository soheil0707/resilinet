// ResiliNet Data Access Repository
// Connects to Supabase with automatic fallback to Astra Motors Enterprise Demo Data

import { createClient, isSupabaseConfigured } from '../supabase/client';
import {
  DashboardMetrics,
  Disruption,
  Supplier,
  Plant,
  RecoveryStrategy,
  ResilienceMemoryItem,
} from '../supabase/types';
import {
  DEMO_DASHBOARD_METRICS,
  DEMO_SUPPLIERS,
  DEMO_PLANTS,
  DEMO_RECOVERY_STRATEGIES,
  DEMO_RESILIENCE_MEMORY,
  DEMO_CRITICAL_DISRUPTION,
} from './demo-data';

export interface DataSourceStatus {
  isLive: boolean;
  label: string;
}

export async function getDataSourceStatus(): Promise<DataSourceStatus> {
  if (!isSupabaseConfigured()) {
    return {
      isLive: false,
      label: 'Offline Demo Dataset (Astra Motors S-104 Scenario)',
    };
  }
  return {
    isLive: true,
    label: 'Connected: Supabase Cloud Database',
  };
}

/**
 * @deprecated Operational data source has migrated to SAP HANA Cloud.
 * Use GET /api/hana/dashboard instead. Do NOT use for active operational data.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  console.warn('[DEPRECATED] getDashboardMetrics() called. Operational data source is SAP HANA Cloud.');
  return DEMO_DASHBOARD_METRICS;
}

/**
 * @deprecated Operational disruptions have migrated to SAP HANA Cloud (ORCH_DISRUPTION).
 * Use GET /api/hana/disruptions instead. Do NOT use for active operational data.
 */
export async function getDisruptions(): Promise<Disruption[]> {
  console.warn('[DEPRECATED] getDisruptions() called. Operational disruptions are in SAP HANA Cloud.');
  return [DEMO_CRITICAL_DISRUPTION];
}

/**
 * @deprecated Operational strategies have migrated to SAP HANA Cloud (V_ORCH_STRATEGY_RANKING).
 * Use GET /api/hana/recovery-strategies instead. Do NOT use for active operational data.
 */
export async function getRecoveryStrategies(disruptionId?: string): Promise<RecoveryStrategy[]> {
  console.warn('[DEPRECATED] getRecoveryStrategies() called. Operational strategies are in SAP HANA Cloud.');
  return DEMO_RECOVERY_STRATEGIES;
}

export async function getResilienceMemory(): Promise<ResilienceMemoryItem[]> {
  const supabase = createClient();
  if (!supabase) {
    return DEMO_RESILIENCE_MEMORY;
  }

  try {
    const { data, error } = await supabase
      .from('resilience_memory')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEMO_RESILIENCE_MEMORY;
    }
    return data as ResilienceMemoryItem[];
  } catch {
    return DEMO_RESILIENCE_MEMORY;
  }
}
