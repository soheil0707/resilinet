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
  kpis: {
    supplyChainRisk: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
    suppliersAtRisk: number;
    materialsAtRisk: number;
    potentialRevenueExposureInr: number;
    potentialRevenueExposureLabel: string;
    earliestRiskHorizonDays: number;
  };
  signals: Array<{
    id: string;
    name: string;
    signalSource: 'Enterprise Signal' | 'External Signal';
    sourceConnection: 'Connected' | 'Integration Ready';
    sourceSystem: string;
    value: string;
    baseline: string;
    status: 'CRITICAL' | 'WARNING' | 'ALERT';
    description: string;
    timestamp: string;
  }>;
  propagationStages: Array<{
    stageNumber: number;
    name: string;
    entity: string;
    detail: string;
    subtext: string;
    status: 'CRITICAL' | 'WARNING' | 'ALERT' | 'INFO';
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
    action: string;
    reason: string;
    expectedPurpose: string;
    status: 'Recommended' | 'Under Review' | 'Ready to Evaluate';
    category: string;
    leadTime: string;
    costEstimate: string;
    readiness: 'READY' | 'REQUIRES_PO' | 'DISPATCH_PENDING';
  }>;
  externalIntelligencePlaceholders: Array<{
    id: string;
    name: string;
    category: string;
    status: 'Integration Ready';
    description: string;
    potentialSignals: string;
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
  kpis: {
    supplyChainRisk: 'HIGH',
    suppliersAtRisk: 1,
    materialsAtRisk: 1,
    potentialRevenueExposureInr: 2740000,
    potentialRevenueExposureLabel: '₹27.4L',
    earliestRiskHorizonDays: 2.4,
  },
  signals: [
    {
      id: 'SIG-01',
      name: 'Supplier Disruption / Shutdown Signal',
      signalSource: 'External Signal',
      sourceConnection: 'Integration Ready',
      sourceSystem: 'Supplier Intelligence Feed (S-104 Telemetry)',
      value: 'Smelter Refractory Anomaly',
      baseline: 'Normal continuous operating state',
      status: 'CRITICAL',
      description: 'Scheduled blast furnace overhaul coupled with regional environmental compliance audit alerts at Jamshedpur facility indicate high probability of smelter stoppage.',
      timestamp: '16-Sep-2026 14:15 IST',
    },
    {
      id: 'SIG-02',
      name: 'Low Inventory Coverage',
      signalSource: 'Enterprise Signal',
      sourceConnection: 'Connected',
      sourceSystem: 'SAP EWM / Inventory Management',
      value: '2.4 Days',
      baseline: '5.0 Days target safety buffer',
      status: 'CRITICAL',
      description: 'On-hand stock at Hyderabad PL-01 has dropped to 240 units of M-101 Steering Assembly against a sustained burn rate of 100 units/day, breaching safety buffer threshold.',
      timestamp: '16-Sep-2026 14:20 IST',
    },
    {
      id: 'SIG-03',
      name: 'Production Line Dependency',
      signalSource: 'Enterprise Signal',
      sourceConnection: 'Connected',
      sourceSystem: 'SAP PP / Production Planning',
      value: '17 Assembly Orders Exposed',
      baseline: '0 delayed work orders',
      status: 'WARNING',
      description: 'Chassis assembly lines 1 (EV-X Prime) and 2 (Sierra Commercial) have 17 active scheduled work orders with 100% direct dependency on M-101 and no inline substitution.',
      timestamp: '16-Sep-2026 14:25 IST',
    },
    {
      id: 'SIG-04',
      name: 'Customer-Order Exposure',
      signalSource: 'Enterprise Signal',
      sourceConnection: 'Connected',
      sourceSystem: 'SAP SD / Sales & Distribution',
      value: '20 Fleet Orders at SLA Risk',
      baseline: 'On-time delivery commitment: 99.2%',
      status: 'WARNING',
      description: 'Contractual delivery schedules for 20 Tier-1 fleet vehicles face potential delay penalties if final assembly line is halted within the next 48 hours.',
      timestamp: '16-Sep-2026 14:28 IST',
    },
    {
      id: 'SIG-05',
      name: 'Increasing Shipment Delay Trend',
      signalSource: 'Enterprise Signal',
      sourceConnection: 'Connected',
      sourceSystem: 'Logistics ASN Tracking (SAP TM)',
      value: '+2.8 Days',
      baseline: '10 Days nominal lead time',
      status: 'WARNING',
      description: 'Average line-haul transit delay expanded from 0.4 to 3.2 days across eastern freight corridor checkpoints (Kolkata-Vizag-Hyderabad).',
      timestamp: '16-Sep-2026 14:30 IST',
    },
  ],
  propagationStages: [
    {
      stageNumber: 1,
      name: 'Supplier',
      entity: 'Global Metals Ltd. (S-104)',
      detail: 'Jamshedpur Smelting Facility',
      subtext: 'Shutdown risk • Reliability 88.0%',
      status: 'CRITICAL',
    },
    {
      stageNumber: 2,
      name: 'Material',
      entity: 'Steering Assembly (M-101)',
      detail: 'Chassis Safety Component',
      subtext: 'Lead Time: 10 + 2.8d delay',
      status: 'CRITICAL',
    },
    {
      stageNumber: 3,
      name: 'Inventory',
      entity: '240 Units On-Hand',
      detail: 'Coverage: 2.4 Days',
      subtext: 'Deficit: -2.6 days vs safety buffer',
      status: 'CRITICAL',
    },
    {
      stageNumber: 4,
      name: 'Plant',
      entity: 'PL-01 Hyderabad Plant',
      detail: 'Lines 1 & 2 Dependent',
      subtext: 'Capacity: 120 u/day • 88.5% Util',
      status: 'WARNING',
    },
    {
      stageNumber: 5,
      name: 'Production',
      entity: '17 Work Orders',
      detail: 'EV-X Prime & Sierra Chassis',
      subtext: 'Halting risk within 48–72 hours',
      status: 'WARNING',
    },
    {
      stageNumber: 6,
      name: 'Customer Orders',
      entity: '20 Fleet Orders',
      detail: 'OEM Fleet Deliveries',
      subtext: 'Strict 72-hour delivery SLA',
      status: 'ALERT',
    },
    {
      stageNumber: 7,
      name: 'Revenue Exposure',
      entity: '₹27.4L Total at Risk',
      detail: '₹2,740,000 INR Exposure',
      subtext: 'Delayed billings + penalty liability',
      status: 'CRITICAL',
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
      action: 'Identify alternate supplier',
      reason: 'S-104 smelting facility vulnerability threatens single-source steering assembly supply.',
      expectedPurpose: 'Activate standby quota allocation with pre-qualified secondary vendor Bharat Precision (Pune) for up to 220 units.',
      status: 'Recommended',
      category: 'Procurement Resiliency',
      leadTime: '48 Hours activation',
      costEstimate: '₹1.2L contracted rate',
      readiness: 'READY',
    },
    {
      id: 'REC-02',
      action: 'Evaluate inventory transfer',
      reason: 'PL-02 Chennai holds 5.6 days safety stock (450 units) of M-101, well above its 400-unit safety threshold.',
      expectedPurpose: 'Draft pre-emptive Stock Transport Order (STO) for 180 units via dedicated road express to rebalance Hyderabad.',
      status: 'Under Review',
      category: 'Inter-Plant Stock Balancing',
      leadTime: '36 Hours road express',
      costEstimate: '₹0.8L logistics cost',
      readiness: 'READY',
    },
    {
      id: 'REC-03',
      action: 'Reserve emergency inventory',
      reason: 'Current 2.4 days on-hand coverage breaches the mandatory 5.0 days safety buffer at PL-01.',
      expectedPurpose: 'Issue emergency purchase requisition to expand buffer threshold from 500 to 700 units across regional hubs.',
      status: 'Ready to Evaluate',
      category: 'Inventory Buffering',
      leadTime: 'Immediate (SAP MM)',
      costEstimate: '₹0.5L working capital buffer',
      readiness: 'READY',
    },
    {
      id: 'REC-04',
      action: 'Evaluate expedited logistics',
      reason: 'Line-haul freight transit delays are expanding by +2.8 days on eastern highway corridors.',
      expectedPurpose: 'Place tentative air freight charter booking on Jamshedpur → Hyderabad lane to safeguard against total line stoppage.',
      status: 'Recommended',
      category: 'Logistics Readiness',
      leadTime: '24 Hours charter lock',
      costEstimate: '₹1.3L standby rate',
      readiness: 'REQUIRES_PO',
    },
    {
      id: 'REC-05',
      action: 'Review exposed production orders',
      reason: '17 scheduled assembly orders across Lines 1 & 2 face work-in-progress hold if parts deplete.',
      expectedPurpose: 'Re-sequence assembly line scheduling to prioritize high-margin EV-X Prime orders and buffer delivery commitments.',
      status: 'Under Review',
      category: 'Production Scheduling',
      leadTime: '12 Hours shift change',
      costEstimate: 'Zero direct cost',
      readiness: 'READY',
    },
    {
      id: 'REC-06',
      action: 'Review exposed customer orders',
      reason: '20 strategic fleet customer orders risk contractual late-delivery penalties under enterprise SLAs.',
      expectedPurpose: 'Coordinate delivery milestone buffers with account managers and proactively engage key dealership groups.',
      status: 'Ready to Evaluate',
      category: 'Customer SLA Protection',
      leadTime: '6 Hours coordination',
      costEstimate: 'Zero direct cost',
      readiness: 'READY',
    },
  ],
  externalIntelligencePlaceholders: [
    {
      id: 'EXT-01',
      name: 'Weather Intelligence',
      category: 'Meteorological Risk',
      status: 'Integration Ready',
      description: 'Monitors monsoon precipitation, severe weather events, and cyclone paths along key freight corridors (Kolkata-Vizag-Hyderabad).',
      potentialSignals: 'Flood warnings, highway washout alerts, airport closures',
    },
    {
      id: 'EXT-02',
      name: 'Logistics Intelligence',
      category: 'Carrier & Transit Telematics',
      status: 'Integration Ready',
      description: 'Consumes real-time GPS fleet telemetry, port congestion indices, and interstate freight checkpoint transit delay metrics.',
      potentialSignals: 'Route ETA deviations, carrier dwell times, toll booth congestion',
    },
    {
      id: 'EXT-03',
      name: 'Supplier Risk Intelligence',
      category: 'Vendor Health & ESG',
      status: 'Integration Ready',
      description: 'Aggregates third-party credit ratings, facility environmental compliance audits, and regional labor dispute notices.',
      potentialSignals: 'Financial distress indicators, factory maintenance shutdowns, strike warnings',
    },
  ],
};

// ─── PHASE 4B: Integration Hub Data Models ─────────────────────────────────────

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'ERP' | 'WMS' | 'TMS' | 'EXTERNAL_INTELLIGENCE' | 'CUSTOM';
  status: 'Prototype Data / SAP-Ready' | 'Integration Ready';
  systemType: string;
  description: string;
  protocols: string[];
  dataScope: string[];
  isSynthetic: boolean;
  transparentNotice?: string;
}

export const DEMO_ENTERPRISE_SYSTEMS: IntegrationConnector[] = [
  {
    id: 'SYS-SAP',
    name: 'SAP S/4HANA',
    category: 'ERP',
    status: 'Prototype Data / SAP-Ready',
    systemType: 'Core Enterprise ERP',
    description: 'Enterprise procurement, inventory, production, and order data.',
    protocols: ['OData v4', 'RFC / BAPI', 'SAP IDoc', 'SAP Event Mesh'],
    dataScope: ['Material Master (MARA)', 'Purchase Orders (EKKO)', 'Production Orders (AFKO)', 'Stock Overview (MARD)'],
    isSynthetic: true,
    transparentNotice: 'SAP-ready architecture — prototype currently uses synthetic enterprise data.',
  },
  {
    id: 'SYS-ORACLE',
    name: 'Oracle ERP Cloud',
    category: 'ERP',
    status: 'Integration Ready',
    systemType: 'Enterprise Resource Planning',
    description: 'Procurement contracts, supplier schedules, and multi-facility financial ledger data.',
    protocols: ['Oracle Integration Cloud (OIC)', 'REST API', 'SOAP Web Services'],
    dataScope: ['Purchase Agreements', 'Item Inventory', 'Cost Accounting'],
    isSynthetic: false,
  },
  {
    id: 'SYS-MSDYN',
    name: 'Microsoft Dynamics 365',
    category: 'ERP',
    status: 'Integration Ready',
    systemType: 'Supply Chain Management',
    description: 'Plant maintenance schedules, vendor bills of material, and purchase requisitions.',
    protocols: ['Dataverse Web API', 'OData Endpoint', 'Azure Service Bus'],
    dataScope: ['Purchase Requisitions', 'Vendor Scorecards', 'Bill of Materials'],
    isSynthetic: false,
  },
  {
    id: 'SYS-CUSTOM-ERP',
    name: 'Custom ERP',
    category: 'ERP',
    status: 'Integration Ready',
    systemType: 'Legacy / In-House ERP',
    description: 'Proprietary production control and local manufacturing execution systems.',
    protocols: ['RESTful Webhook', 'GraphQL', 'Kafka Event Stream', 'gRPC'],
    dataScope: ['Work Order Status', 'BOM Substitutions', 'Internal Material Requests'],
    isSynthetic: false,
  },
  {
    id: 'SYS-WMS',
    name: 'Warehouse Management (WMS)',
    category: 'WMS',
    status: 'Integration Ready',
    systemType: 'Warehouse & Inventory Execution',
    description: 'Bin-level inventory positions, ASN receipts, pick-pack-ship velocity, and safety buffer monitoring.',
    protocols: ['EDI 856 ASN', 'EDI 940/945', 'REST API', 'MQTT Sensor Streams'],
    dataScope: ['Real-time Bin Stock', 'Inbound Gate Receipts', 'Cycle Count Variance'],
    isSynthetic: false,
  },
  {
    id: 'SYS-TMS',
    name: 'Transportation Management (TMS)',
    category: 'TMS',
    status: 'Integration Ready',
    systemType: 'Fleet & Logistics Control',
    description: 'Freight carrier dispatch, GPS telematics milestones, lane transit times, and demurrage tracking.',
    protocols: ['EDI 214 Shipment Status', 'EDI 204 Tender', 'Carrier Telematics Webhooks'],
    dataScope: ['Active In-Transit Shipments', 'Checkpoint Velocity', 'Carrier On-Time SLAs'],
    isSynthetic: false,
  },
];

export const DEMO_EXTERNAL_INTELLIGENCE: IntegrationConnector[] = [
  {
    id: 'EXT-WEATHER',
    name: 'Weather Intelligence',
    category: 'EXTERNAL_INTELLIGENCE',
    status: 'Integration Ready',
    systemType: 'Meteorological Modeling',
    description: 'Severe weather forecasts, flood zone monitoring, and route precipitation risks along interstate freight lanes.',
    protocols: ['REST API (NOAA / OpenWeatherMap)', 'GeoJSON Map Feeds'],
    dataScope: ['Severe Weather Alerts', 'Monsoon Corridor Tracking', 'Highway Flood Warnings'],
    isSynthetic: false,
  },
  {
    id: 'EXT-LOGISTICS',
    name: 'Logistics Intelligence',
    category: 'EXTERNAL_INTELLIGENCE',
    status: 'Integration Ready',
    systemType: 'Supply Chain Visibility Network',
    description: 'Port congestion indexes, national toll plaza congestion velocity, and multimodal freight capacity availability.',
    protocols: ['Project44 / FourKites Webhooks', 'AIS Maritime Telemetry', 'Air Cargo Status API'],
    dataScope: ['Port Waiting Times', 'Corridor Speed Variance', 'Air Freight Capacity Surges'],
    isSynthetic: false,
  },
  {
    id: 'EXT-SUPPLIER-RISK',
    name: 'Supplier Risk Intelligence',
    category: 'EXTERNAL_INTELLIGENCE',
    status: 'Integration Ready',
    systemType: 'Vendor Risk & ESG Monitoring',
    description: 'Supplier financial health indicators, factory operational disruptions, legal filings, and labor dispute signals.',
    protocols: ['Dun & Bradstreet API', 'RapidRatings Webhook', 'EcoVadis Risk Feed'],
    dataScope: ['Financial Viability Ratings', 'Strike & Labor Risk Alerts', 'Facility Environmental Sanctions'],
    isSynthetic: false,
  },
  {
    id: 'EXT-MARKET',
    name: 'Market Intelligence',
    category: 'EXTERNAL_INTELLIGENCE',
    status: 'Integration Ready',
    systemType: 'Commodity & Raw Materials Pricing',
    description: 'Real-time commodity price volatility tracking for raw materials (steel, aluminum, lithium) affecting tier-1 component pricing.',
    protocols: ['London Metal Exchange (LME) API', 'S&P Global Platts Feed'],
    dataScope: ['Steel Ingot Price Indices', 'Alloy Surcharges', 'Currency FX Fluctuations'],
    isSynthetic: false,
  },
  {
    id: 'EXT-NEWS',
    name: 'News / Disruption Intelligence',
    category: 'EXTERNAL_INTELLIGENCE',
    status: 'Integration Ready',
    systemType: 'Global Event & Media Monitoring',
    description: 'NLP-powered geopolitical, environmental, and regional disruption parsing for critical manufacturing hubs.',
    protocols: ['GDELT Global Risk Feed', 'Factiva API', 'Regional News Webhooks'],
    dataScope: ['Regional Factory Fire / Explosion Alerts', 'Transport Strike Notices', 'Geopolitical Border Delays'],
    isSynthetic: false,
  },
];

export const DEMO_SAMPLE_NORMALIZED_EVENT = {
  source: 'external',
  type: 'supplier_risk',
  severity: 'high',
  entity: 'S-104',
  timestamp: '2026-09-16T14:15:00Z',
  confidence: 0.86,
  payload: {
    supplier_name: 'Global Metals Ltd.',
    plant_location: 'Jamshedpur, Jharkhand',
    risk_factor: 'Smelter Refractory Anomaly',
    affected_parts: ['M-101 (Steering Assembly)'],
    expected_delay_days: 7,
    source_attribution: 'Third-party Supplier Risk Intelligence connector (Architecture Prototype)',
  },
};

export const DEMO_CONNECTOR_CATEGORIES = [
  { id: 'ERP', label: 'Enterprise ERP', count: 4, desc: 'SAP S/4HANA, Oracle, Microsoft Dynamics, In-House' },
  { id: 'WMS', label: 'Warehouse Systems (WMS)', count: 1, desc: 'Bin inventory, ASN tracking, safety stock' },
  { id: 'TMS', label: 'Transportation (TMS)', count: 1, desc: 'Carrier telematics, transit milestones, GPS routes' },
  { id: 'Weather', label: 'Weather Intelligence', count: 1, desc: 'Severe storm paths, monsoon flood warnings' },
  { id: 'Logistics', label: 'Logistics Intelligence', count: 1, desc: 'Port congestion, corridor speed indices' },
  { id: 'Supplier Risk', label: 'Supplier Risk Feeds', count: 1, desc: 'Financial health, facility audits, labor disputes' },
  { id: 'Custom API', label: 'Custom Webhook / API', count: 1, desc: 'REST, GraphQL, Kafka, or gRPC connector' },
];

