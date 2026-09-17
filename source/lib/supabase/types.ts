// Supabase Database TypeScript Definitions for ResiliNet

export type UserRole =
  | 'SUPPLY_CHAIN_MANAGER'
  | 'PROCUREMENT_MANAGER'
  | 'PRODUCTION_PLANNER'
  | 'LOGISTICS_MANAGER'
  | 'FINANCE_MANAGER'
  | 'ADMIN';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  department: string;
  company: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  tier: number;
  reliability_score: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'SHUTDOWN';
  created_at?: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  supplier_id: string;
  unit_cost_inr: number;
  lead_time_days: number;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Plant {
  id: string;
  code: string;
  name: string;
  location: string;
  capacity_units_per_day: number;
  current_utilization_pct: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'HALTED';
}

export interface InventoryItem {
  id: string;
  material_id: string;
  plant_id: string;
  current_stock: number;
  safety_stock: number;
  daily_consumption: number;
  coverage_days: number;
  last_updated?: string;
  material?: Material;
  plant?: Plant;
}

export interface ProductionOrder {
  id: string;
  order_code: string;
  plant_id: string;
  material_id: string;
  product_model: string;
  quantity: number;
  status: 'ON_SCHEDULE' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'HALTED';
  scheduled_date: string;
  delay_days: number;
}

export interface CustomerOrder {
  id: string;
  order_code: string;
  customer_name: string;
  vehicle_model: string;
  quantity: number;
  value_inr: number;
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'CONFIRMED' | 'AT_RISK' | 'DELAYED' | 'FULFILLED';
}

export interface Disruption {
  id: string;
  title: string;
  supplier_id: string;
  material_id: string;
  plant_id: string;
  disruption_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  duration_days: number;
  coverage_days: number;
  revenue_at_risk_inr: number;
  expected_delay_days: number;
  affected_production_orders_count: number;
  affected_customer_orders_count: number;
  status: 'ACTIVE' | 'UNDER_INVESTIGATION' | 'STRATEGY_PENDING' | 'RESOLVING' | 'RESOLVED';
  detected_at: string;
  description: string;
  supplier?: Supplier;
  material?: Material;
  plant?: Plant;
}

export interface AgentRecommendation {
  id: string;
  disruption_id: string;
  agent_name: string;
  finding: string;
  recommendation: string;
  confidence_score: number;
  estimated_impact: string;
  status: string;
  created_at?: string;
}

export interface RecoveryStrategy {
  id: string;
  disruption_id: string;
  name: string;
  strategy_type: 'ALTERNATE_SOURCING' | 'STOCK_TRANSFER' | 'EXPEDITED_LOGISTICS' | 'COMBINED';
  cost_inr: number;
  recovery_time_days: number;
  revenue_protected_inr: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  overall_score: number;
  is_recommended: boolean;
  description: string;
  score_breakdown?: {
    recovery_time_score: number;
    revenue_score: number;
    cost_score: number;
    risk_score: number;
    customer_score: number;
  };
}

export interface Approval {
  id: string;
  strategy_id: string;
  approver_id?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  comments?: string;
  created_at?: string;
  reviewed_at?: string;
}

export interface ResilienceMemoryItem {
  id: string;
  crisis_title: string;
  root_cause: string;
  selected_strategy: string;
  recovery_time_days: number;
  loss_avoided_inr: number;
  outcome: string;
  success_score: number;
  recorded_at: string;
}

export interface DashboardMetrics {
  activeDisruptions: number;
  revenueAtRiskInr: number;
  productionOrdersAtRisk: number;
  customerOrdersAtRisk: number;
  criticalDisruption: Disruption;
  impactChain: {
    supplier: Supplier;
    material: Material;
    plant: Plant;
    productionOrdersCount: number;
    customerOrdersCount: number;
  };
  inventoryTrend: Array<{
    day: string;
    stock: number;
    safetyStock: number;
    coverageDays: number;
  }>;
  supplierHealth: Supplier[];
  plantUtilization: Plant[];
  recentActivity: Array<{
    id: string;
    timestamp: string;
    type: 'ALERT' | 'INFO' | 'SUCCESS' | 'WARNING';
    title: string;
    source: string;
  }>;
}
