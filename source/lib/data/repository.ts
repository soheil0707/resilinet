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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();
  if (!supabase) {
    return DEMO_DASHBOARD_METRICS;
  }

  try {
    // 1. Fetch active disruptions
    const { data: disruptions, error: dError } = await supabase
      .from('disruptions')
      .select('*, supplier:suppliers(*), material:materials(*), plant:plants(*)')
      .eq('status', 'ACTIVE')
      .order('detected_at', { ascending: false });

    if (dError || !disruptions || disruptions.length === 0) {
      console.warn('Supabase disruptions query returned no records or failed. Using demo data:', dError?.message);
      return DEMO_DASHBOARD_METRICS;
    }

    const critical = disruptions[0] as Disruption;

    // 2. Fetch suppliers
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .order('tier', { ascending: true });

    // 3. Fetch plants
    const { data: plants } = await supabase
      .from('plants')
      .select('*')
      .order('code', { ascending: true });

    // Build metrics from Supabase
    return {
      activeDisruptions: disruptions.length,
      revenueAtRiskInr: critical.revenue_at_risk_inr || DEMO_DASHBOARD_METRICS.revenueAtRiskInr,
      productionOrdersAtRisk: critical.affected_production_orders_count || 17,
      customerOrdersAtRisk: critical.affected_customer_orders_count || 20,
      criticalDisruption: critical,
      impactChain: {
        supplier: critical.supplier || DEMO_DASHBOARD_METRICS.impactChain.supplier,
        material: critical.material || DEMO_DASHBOARD_METRICS.impactChain.material,
        plant: critical.plant || DEMO_DASHBOARD_METRICS.impactChain.plant,
        productionOrdersCount: critical.affected_production_orders_count || 17,
        customerOrdersCount: critical.affected_customer_orders_count || 20,
      },
      inventoryTrend: DEMO_DASHBOARD_METRICS.inventoryTrend,
      supplierHealth: (suppliers && suppliers.length > 0) ? (suppliers as Supplier[]) : DEMO_SUPPLIERS,
      plantUtilization: (plants && plants.length > 0) ? (plants as Plant[]) : DEMO_PLANTS,
      recentActivity: DEMO_DASHBOARD_METRICS.recentActivity,
    };
  } catch (err) {
    console.error('Error querying Supabase, falling back to demo data:', err);
    return DEMO_DASHBOARD_METRICS;
  }
}

export async function getDisruptions(): Promise<Disruption[]> {
  const supabase = createClient();
  if (!supabase) {
    return [DEMO_CRITICAL_DISRUPTION];
  }

  try {
    const { data, error } = await supabase
      .from('disruptions')
      .select('*, supplier:suppliers(*), material:materials(*), plant:plants(*)')
      .order('severity', { ascending: false });

    if (error || !data || data.length === 0) {
      return [DEMO_CRITICAL_DISRUPTION];
    }
    return data as Disruption[];
  } catch {
    return [DEMO_CRITICAL_DISRUPTION];
  }
}

export async function getRecoveryStrategies(disruptionId?: string): Promise<RecoveryStrategy[]> {
  const supabase = createClient();
  if (!supabase) {
    return DEMO_RECOVERY_STRATEGIES;
  }

  try {
    let query = supabase.from('recovery_strategies').select('*');
    if (disruptionId) {
      query = query.eq('disruption_id', disruptionId);
    }
    const { data, error } = await query.order('overall_score', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEMO_RECOVERY_STRATEGIES;
    }
    return data as RecoveryStrategy[];
  } catch {
    return DEMO_RECOVERY_STRATEGIES;
  }
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
