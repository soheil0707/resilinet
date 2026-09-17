// Enterprise Demo Dataset for Astra Motors Manufacturing
// Matches the SAP Hackfest 2026 S-104 Global Metals Crisis Scenario exactly

import {
  Supplier,
  Material,
  Plant,
  InventoryItem,
  ProductionOrder,
  CustomerOrder,
  Disruption,
  DashboardMetrics,
  RecoveryStrategy,
  ResilienceMemoryItem,
} from '../supabase/types';

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 'S-101',
    name: 'Apex Precision Castings',
    code: 'SUP-101',
    category: 'Chassis & Engine Blocks',
    location: 'Pune, Maharashtra',
    tier: 1,
    reliability_score: 98.2,
    status: 'HEALTHY',
  },
  {
    id: 'S-102',
    name: 'Tata AutoComp Systems',
    code: 'SUP-102',
    category: 'Interior & Seating',
    location: 'Pune, Maharashtra',
    tier: 1,
    reliability_score: 96.5,
    status: 'HEALTHY',
  },
  {
    id: 'S-103',
    name: 'Minda Industries Ltd',
    code: 'SUP-103',
    category: 'Sensors & Electricals',
    location: 'Gurugram, Haryana',
    tier: 1,
    reliability_score: 94.8,
    status: 'HEALTHY',
  },
  {
    id: 'S-104',
    name: 'Global Metals Ltd.',
    code: 'SUP-104',
    category: 'Steering & Precision Forging',
    location: 'Jamshedpur, Jharkhand',
    tier: 1,
    reliability_score: 88.0,
    status: 'SHUTDOWN',
  },
  {
    id: 'S-105',
    name: 'Sundram Fasteners',
    code: 'SUP-105',
    category: 'High Tensile Fasteners',
    location: 'Chennai, Tamil Nadu',
    tier: 1,
    reliability_score: 99.1,
    status: 'HEALTHY',
  },
  {
    id: 'S-106',
    name: 'Bosch Chassis Systems',
    code: 'SUP-106',
    category: 'ABS & Braking Units',
    location: 'Nashik, Maharashtra',
    tier: 1,
    reliability_score: 97.4,
    status: 'HEALTHY',
  },
  {
    id: 'S-107',
    name: 'Motherson Wiring Ltd',
    code: 'SUP-107',
    category: 'Wiring Harnesses',
    location: 'Noida, Uttar Pradesh',
    tier: 2,
    reliability_score: 95.0,
    status: 'HEALTHY',
  },
  {
    id: 'S-108',
    name: 'Bharat Forge Ltd',
    code: 'SUP-108',
    category: 'Axles & Drivetrain Components',
    location: 'Pune, Maharashtra',
    tier: 1,
    reliability_score: 96.0,
    status: 'HEALTHY',
  },
];

export const DEMO_MATERIALS: Material[] = [
  {
    id: 'M-101',
    code: 'MAT-STR-101',
    name: 'Steering Assembly',
    category: 'Chassis / Control Systems',
    supplier_id: 'S-104',
    unit_cost_inr: 18500,
    lead_time_days: 10,
    criticality: 'CRITICAL',
  },
  {
    id: 'M-102',
    code: 'MAT-BRK-202',
    name: 'Dual Circuit Brake Caliper',
    category: 'Braking Systems',
    supplier_id: 'S-106',
    unit_cost_inr: 7400,
    lead_time_days: 4,
    criticality: 'HIGH',
  },
  {
    id: 'M-103',
    code: 'MAT-ENG-303',
    name: 'Engine Cylinder Block 2.0L',
    category: 'Powertrain',
    supplier_id: 'S-101',
    unit_cost_inr: 42000,
    lead_time_days: 14,
    criticality: 'CRITICAL',
  },
  {
    id: 'M-104',
    code: 'MAT-WRG-404',
    name: 'High-Voltage Wiring Harness',
    category: 'Electrical Architecture',
    supplier_id: 'S-107',
    unit_cost_inr: 12500,
    lead_time_days: 6,
    criticality: 'MEDIUM',
  },
  {
    id: 'M-105',
    code: 'MAT-FST-505',
    name: 'Grade 10.9 Flange Bolts',
    category: 'Hardware',
    supplier_id: 'S-105',
    unit_cost_inr: 85,
    lead_time_days: 2,
    criticality: 'LOW',
  },
];

export const DEMO_PLANTS: Plant[] = [
  {
    id: 'PL-01',
    code: 'PLT-HYD-01',
    name: 'PL-01 Hyderabad Assembly Plant',
    location: 'Hyderabad, Telangana',
    capacity_units_per_day: 120,
    current_utilization_pct: 88.5,
    status: 'DEGRADED',
  },
  {
    id: 'PL-02',
    code: 'PLT-CHN-02',
    name: 'PL-02 Chennai Assembly Plant',
    location: 'Chennai, Tamil Nadu',
    capacity_units_per_day: 150,
    current_utilization_pct: 94.0,
    status: 'OPERATIONAL',
  },
  {
    id: 'PL-03',
    code: 'PLT-PUN-03',
    name: 'PL-03 Pune Powertrain & EV Facility',
    location: 'Pune, Maharashtra',
    capacity_units_per_day: 200,
    current_utilization_pct: 91.2,
    status: 'OPERATIONAL',
  },
];

export const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-101',
    material_id: 'M-101',
    plant_id: 'PL-01',
    current_stock: 240,
    safety_stock: 500,
    daily_consumption: 100,
    coverage_days: 2.4,
  },
  {
    id: 'INV-102',
    material_id: 'M-101',
    plant_id: 'PL-02',
    current_stock: 450,
    safety_stock: 400,
    daily_consumption: 80,
    coverage_days: 5.6,
  },
  {
    id: 'INV-103',
    material_id: 'M-102',
    plant_id: 'PL-01',
    current_stock: 820,
    safety_stock: 600,
    daily_consumption: 100,
    coverage_days: 8.2,
  },
  {
    id: 'INV-104',
    material_id: 'M-103',
    plant_id: 'PL-01',
    current_stock: 510,
    safety_stock: 400,
    daily_consumption: 75,
    coverage_days: 6.8,
  },
];

export const DEMO_CRITICAL_DISRUPTION: Disruption = {
  id: 'DIS-2026-001',
  title: 'Global Metals Ltd. Supplier Shutdown',
  supplier_id: 'S-104',
  material_id: 'M-101',
  plant_id: 'PL-01',
  disruption_type: 'Unplanned Smelter Refractory Stoppage',
  severity: 'CRITICAL',
  duration_days: 10,
  coverage_days: 2.4,
  revenue_at_risk_inr: 2740000, // ₹27.4L
  expected_delay_days: 7,
  affected_production_orders_count: 17,
  affected_customer_orders_count: 20,
  status: 'ACTIVE',
  detected_at: '2026-09-15T08:30:00Z',
  description:
    'Unplanned 10-day shutdown at S-104 Jamshedpur facility due to blast furnace refractory maintenance. Steering Assembly (M-101) shipments to Hyderabad Plant PL-01 halted.',
  supplier: DEMO_SUPPLIERS[3], // S-104
  material: DEMO_MATERIALS[0], // M-101
  plant: DEMO_PLANTS[0],       // PL-01
};

export const DEMO_DASHBOARD_METRICS: DashboardMetrics = {
  activeDisruptions: 1,
  revenueAtRiskInr: 2740000, // ₹27.4L
  productionOrdersAtRisk: 17,
  customerOrdersAtRisk: 20,
  criticalDisruption: DEMO_CRITICAL_DISRUPTION,
  impactChain: {
    supplier: DEMO_SUPPLIERS[3], // Global Metals Ltd. (S-104)
    material: DEMO_MATERIALS[0], // Steering Assembly (M-101)
    plant: DEMO_PLANTS[0],       // PL-01 Hyderabad Assembly Plant
    productionOrdersCount: 17,
    customerOrdersCount: 20,
  },
  inventoryTrend: [
    { day: 'Day -4', stock: 640, safetyStock: 500, coverageDays: 6.4 },
    { day: 'Day -3', stock: 540, safetyStock: 500, coverageDays: 5.4 },
    { day: 'Day -2', stock: 440, safetyStock: 500, coverageDays: 4.4 },
    { day: 'Yesterday', stock: 340, safetyStock: 500, coverageDays: 3.4 },
    { day: 'Today', stock: 240, safetyStock: 500, coverageDays: 2.4 },
  ],
  supplierHealth: DEMO_SUPPLIERS,
  plantUtilization: DEMO_PLANTS,
  recentActivity: [
    {
      id: 'ACT-01',
      timestamp: '12 mins ago',
      type: 'ALERT',
      title: 'SAP Alert: EDI 856 ASN cancellation from Global Metals Ltd (S-104)',
      source: 'SAP Integration Suite',
    },
    {
      id: 'ACT-02',
      timestamp: '35 mins ago',
      type: 'WARNING',
      title: 'Plant PL-01 Hyderabad: M-101 inventory breached safety buffer threshold (2.4 days remaining)',
      source: 'Warehouse Management (SAP EWM)',
    },
    {
      id: 'ACT-03',
      timestamp: '1 hour ago',
      type: 'INFO',
      title: 'Automated impact analysis initiated across 17 active assembly lines',
      source: 'ResiliNet Engine',
    },
    {
      id: 'ACT-04',
      timestamp: '2 hours ago',
      type: 'SUCCESS',
      title: 'PL-02 Chennai: Inbound shipment of Brake Calipers received on schedule (ASN-9082)',
      source: 'Inbound Logistics',
    },
  ],
};

export const DEMO_RECOVERY_STRATEGIES: RecoveryStrategy[] = [
  {
    id: 'STRAT-004',
    disruption_id: 'DIS-2026-001',
    name: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
    strategy_type: 'COMBINED',
    cost_inr: 210000,
    recovery_time_days: 1,
    revenue_protected_inr: 2420000,
    risk_level: 'LOW',
    overall_score: 94.0,
    is_recommended: true,
    description: 'Overnight road express of 120 units from PL-02 Chennai + priority air dispatch of 100 units buffer from S-104.',
    score_breakdown: {
      recovery_time_score: 98,
      revenue_score: 95,
      cost_score: 88,
      risk_score: 92,
      customer_score: 96,
    },
  },
  {
    id: 'STRAT-003',
    disruption_id: 'DIS-2026-001',
    name: 'Expedited Air Logistics',
    strategy_type: 'EXPEDITED_LOGISTICS',
    cost_inr: 260000,
    recovery_time_days: 2,
    revenue_protected_inr: 2150000,
    risk_level: 'LOW',
    overall_score: 86.5,
    is_recommended: false,
    description: 'Charter express air cargo from S-104 finished inventory buffer directly to Hyderabad.',
    score_breakdown: {
      recovery_time_score: 90,
      revenue_score: 88,
      cost_score: 65,
      risk_score: 85,
      customer_score: 90,
    },
  },
  {
    id: 'STRAT-002',
    disruption_id: 'DIS-2026-001',
    name: 'Inventory Transfer (Chennai PL-02)',
    strategy_type: 'STOCK_TRANSFER',
    cost_inr: 80000,
    recovery_time_days: 4,
    revenue_protected_inr: 1920000,
    risk_level: 'LOW',
    overall_score: 82.0,
    is_recommended: false,
    description: 'Transfer 180 safety stock units of M-101 from PL-02 Chennai to PL-01 Hyderabad via road express.',
    score_breakdown: {
      recovery_time_score: 75,
      revenue_score: 80,
      cost_score: 95,
      risk_score: 90,
      customer_score: 80,
    },
  },
  {
    id: 'STRAT-001',
    disruption_id: 'DIS-2026-001',
    name: 'Alternate Supplier (Bharat Precision)',
    strategy_type: 'ALTERNATE_SOURCING',
    cost_inr: 120000,
    recovery_time_days: 7,
    revenue_protected_inr: 1450000,
    risk_level: 'MEDIUM',
    overall_score: 68.5,
    is_recommended: false,
    description: 'Contract emergency batch from qualified secondary supplier Bharat Precision Pune.',
    score_breakdown: {
      recovery_time_score: 50,
      revenue_score: 60,
      cost_score: 90,
      risk_score: 70,
      customer_score: 65,
    },
  },
];

export const DEMO_RESILIENCE_MEMORY: ResilienceMemoryItem[] = [
  {
    id: 'MEM-2025-014',
    crisis_title: 'Q3 Axle Assembly Supplier Delay (Bharat Forge)',
    root_cause: 'Raw material ingot shortage and regional logistics disruption in Maharashtra',
    selected_strategy: 'Alternate Supplier + Inventory Transfer',
    recovery_time_days: 1,
    loss_avoided_inr: 1860000,
    outcome: 'Line stoppage reduced from 6 days to 1 day; preserved OEM delivery SLAs with zero penalties.',
    success_score: 91.0,
    recorded_at: '2025-11-12T14:00:00Z',
  },
];

export interface EarlyWarningRisk {
  riskId: string;
  supplier: {
    id: string;
    name: string;
    code: string;
    location: string;
    status: string;
    reliabilityHistorical: number;
    reliabilityCurrent: number;
  };
  material: {
    id: string;
    code: string;
    name: string;
    category: string;
    criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
  plant: {
    id: string;
    code: string;
    name: string;
    location: string;
  };
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  status: 'EARLY_WARNING_ACTIVE' | 'UNDER_REVIEW' | 'MITIGATION_PREPARED' | 'DISMISSED';
  detectedAt: string;
  signals: Array<{
    id: string;
    name: string;
    value: string;
    baseline: string;
    status: 'CRITICAL' | 'WARNING' | 'ALERT';
    description: string;
  }>;
  dependencyChain: {
    supplier: string;
    material: string;
    inventory: string;
    plant: string;
    production: string;
    customer: string;
  };
  assessment: {
    probabilityPct: number;
    businessImpact: string;
    revenueExposureInr: number;
    productionOrdersCount: number;
    customerOrdersCount: number;
  };
  preventiveRecommendations: Array<{
    id: string;
    title: string;
    category: string;
    action: string;
    leadTime: string;
    costEstimate: string;
    readiness: 'READY' | 'REQUIRES_PO' | 'DISPATCH_PENDING';
  }>;
}

export const DEMO_EARLY_WARNING_RISK: EarlyWarningRisk = {
  riskId: 'EW-2026-089',
  supplier: {
    id: 'S-104',
    name: 'Global Metals Ltd.',
    code: 'SUP-104',
    location: 'Jamshedpur, Jharkhand',
    status: 'SHUTDOWN_RISK',
    reliabilityHistorical: 98.0,
    reliabilityCurrent: 88.0,
  },
  material: {
    id: 'M-101',
    code: 'MAT-STR-101',
    name: 'Steering Assembly',
    category: 'Chassis / Control Systems',
    criticality: 'CRITICAL',
  },
  plant: {
    id: 'PL-01',
    code: 'PLT-HYD-01',
    name: 'PL-01 Hyderabad Assembly Plant',
    location: 'Hyderabad, Telangana',
  },
  severity: 'HIGH',
  status: 'EARLY_WARNING_ACTIVE',
  detectedAt: '16-Sep-2026 14:32 IST (36 hours prior to shutdown)',
  signals: [
    {
      id: 'SIG-01',
      name: 'Supplier Delivery Reliability Deterioration',
      value: '88.0%',
      baseline: '98.0% historical baseline',
      status: 'CRITICAL',
      description: 'Consecutive batch delivery punctuality dropped by 10% over the trailing 3 dispatch cycles from Jamshedpur facility.',
    },
    {
      id: 'SIG-02',
      name: 'Increasing Shipment Delay Trend',
      value: '+2.8 Days',
      baseline: 'Zero delay tolerance',
      status: 'WARNING',
      description: 'Average line-haul transit delay expanded from 0.4 to 3.2 days across eastern freight corridor checkpoints.',
    },
    {
      id: 'SIG-03',
      name: 'Inventory Buffer Coverage',
      value: '2.4 Days',
      baseline: '5.0 Days target safety stock',
      status: 'CRITICAL',
      description: 'On-hand stock at Hyderabad dropped to 240 units against a 100 units/day burn rate, threatening safety buffer breach.',
    },
    {
      id: 'SIG-04',
      name: 'Supplier Operating Status',
      value: 'Warning / Shutdown Risk',
      baseline: 'Healthy operational baseline',
      status: 'ALERT',
      description: 'Preliminary telemetry indicates scheduled furnace overhaul and pending environmental audits at supplier plant.',
    },
    {
      id: 'SIG-05',
      name: 'Component Criticality Level',
      value: 'CRITICAL (Tier-1)',
      baseline: 'Chassis line dependency',
      status: 'CRITICAL',
      description: 'M-101 Steering Assembly is a non-substitutable direct component for all 17 active Hyderabad production orders.',
    },
  ],
  dependencyChain: {
    supplier: 'Global Metals Ltd. (S-104) [Jamshedpur]',
    material: 'Steering Assembly (M-101) [Tier-1]',
    inventory: '240 Units / 2.4 Days [Safety: 5.0 Days]',
    plant: 'PL-01 Hyderabad Assembly [88.5% Util]',
    production: '17 Assembly Orders [Lines 1 & 2]',
    customer: '20 Fleet & Dealership Orders [SLA Risk]',
  },
  assessment: {
    probabilityPct: 78,
    businessImpact: 'Severe Operational Interruption & Potential Customer Penalty Exposure',
    revenueExposureInr: 2740000,
    productionOrdersCount: 17,
    customerOrdersCount: 20,
  },
  preventiveRecommendations: [
    {
      id: 'REC-01',
      title: 'Increase Safety Stock Buffer',
      category: 'Inventory Buffering',
      action: 'Issue emergency purchase requisition to expand buffer threshold from 500 to 700 units across regional hubs.',
      leadTime: 'Immediate (SAP MM)',
      costEstimate: '₹0.5L working capital buffer',
      readiness: 'READY',
    },
    {
      id: 'REC-02',
      title: 'Alternate Supplier Secondary Allocation',
      category: 'Procurement Resiliency',
      action: 'Trigger standby quota allocation with pre-qualified AVL vendor Bharat Precision (Pune) for 220 steering units.',
      leadTime: '48 Hours activation',
      costEstimate: '₹1.2L contracted rate',
      readiness: 'READY',
    },
    {
      id: 'REC-03',
      title: 'Pre-Position Inter-Plant Inventory',
      category: 'Stock Balancing',
      action: 'Issue pre-emptive Stock Transport Order (STO) from PL-02 Chennai (which maintains 5.6 days surplus coverage).',
      leadTime: '36 Hours road express',
      costEstimate: '₹0.8L logistics cost',
      readiness: 'READY',
    },
    {
      id: 'REC-04',
      title: 'Reserve Expedited Logistics Capacity',
      category: 'Freight Readiness',
      action: 'Place tentative air freight charter booking on Jamshedpur → Hyderabad lane to safeguard against total line stoppage.',
      leadTime: '24 Hours charter lock',
      costEstimate: '₹1.3L standby rate',
      readiness: 'REQUIRES_PO',
    },
    {
      id: 'REC-05',
      title: 'Review Production Order Allocation',
      category: 'Shopfloor Scheduling',
      action: 'Re-sequence assembly line scheduling to prioritize high-margin EV-X Prime orders and buffer delivery commitments.',
      leadTime: '12 Hours shift change',
      costEstimate: 'Zero direct cost',
      readiness: 'READY',
    },
  ],
};

