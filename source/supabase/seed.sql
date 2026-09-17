-- ResiliNet Supabase Seed Data
-- Astra Motors Manufacturing Demo Scenario: Global Metals Ltd. (S-104) Shutdown

-- Suppliers
INSERT INTO suppliers (id, name, code, category, location, tier, reliability_score, status) VALUES
('S-101', 'Apex Precision Castings', 'SUP-101', 'Chassis & Engine Blocks', 'Pune, Maharashtra', 1, 98.2, 'HEALTHY'),
('S-102', 'Tata AutoComp Systems', 'SUP-102', 'Interior & Seating', 'Pune, Maharashtra', 1, 96.5, 'HEALTHY'),
('S-103', 'Minda Industries Ltd', 'SUP-103', 'Sensors & Electricals', 'Gurugram, Haryana', 1, 94.8, 'HEALTHY'),
('S-104', 'Global Metals Ltd.', 'SUP-104', 'Steering & Precision Forging', 'Jamshedpur, Jharkhand', 1, 88.0, 'SHUTDOWN'),
('S-105', 'Sundram Fasteners', 'SUP-105', 'High Tensile Fasteners', 'Chennai, Tamil Nadu', 1, 99.1, 'HEALTHY'),
('S-106', 'Bosch Chassis Systems', 'SUP-106', 'ABS & Braking Units', 'Nashik, Maharashtra', 1, 97.4, 'HEALTHY'),
('S-107', 'Motherson Wiring Ltd', 'SUP-107', 'Wiring Harnesses', 'Noida, Uttar Pradesh', 2, 95.0, 'HEALTHY'),
('S-108', 'Bharat Forge Ltd', 'SUP-108', 'Axles & Drivetrain Components', 'Pune, Maharashtra', 1, 96.0, 'HEALTHY')
ON CONFLICT (id) DO NOTHING;

-- Materials
INSERT INTO materials (id, code, name, category, supplier_id, unit_cost_inr, lead_time_days, criticality) VALUES
('M-101', 'MAT-STR-101', 'Steering Assembly', 'Chassis / Control Systems', 'S-104', 18500, 10, 'CRITICAL'),
('M-102', 'MAT-BRK-202', 'Dual Circuit Brake Caliper', 'Braking Systems', 'S-106', 7400, 4, 'HIGH'),
('M-103', 'MAT-ENG-303', 'Engine Cylinder Block 2.0L', 'Powertrain', 'S-101', 42000, 14, 'CRITICAL'),
('M-104', 'MAT-WRG-404', 'High-Voltage Wiring Harness', 'Electrical Architecture', 'S-107', 12500, 6, 'MEDIUM'),
('M-105', 'MAT-FST-505', 'Grade 10.9 Flange Bolts', 'Hardware', 'S-105', 85, 2, 'LOW')
ON CONFLICT (id) DO NOTHING;

-- Plants
INSERT INTO plants (id, code, name, location, capacity_units_per_day, current_utilization_pct, status) VALUES
('PL-01', 'PLT-HYD-01', 'PL-01 Hyderabad Assembly Plant', 'Hyderabad, Telangana', 120, 88.5, 'DEGRADED'),
('PL-02', 'PLT-CHN-02', 'PL-02 Chennai Assembly Plant', 'Chennai, Tamil Nadu', 150, 94.0, 'OPERATIONAL'),
('PL-03', 'PLT-PUN-03', 'PL-03 Pune Powertrain & EV Facility', 'Pune, Maharashtra', 200, 91.2, 'OPERATIONAL')
ON CONFLICT (id) DO NOTHING;

-- Inventory
INSERT INTO inventory (id, material_id, plant_id, current_stock, safety_stock, daily_consumption, coverage_days) VALUES
('INV-101', 'M-101', 'PL-01', 240, 500, 100, 2.4),
('INV-102', 'M-101', 'PL-02', 450, 400, 80, 5.6),
('INV-103', 'M-102', 'PL-01', 820, 600, 100, 8.2),
('INV-104', 'M-103', 'PL-01', 510, 400, 75, 6.8),
('INV-105', 'M-104', 'PL-01', 940, 700, 100, 9.4)
ON CONFLICT (id) DO NOTHING;

-- Disruptions (The core scenario)
INSERT INTO disruptions (
  id, title, supplier_id, material_id, plant_id, disruption_type, severity,
  duration_days, coverage_days, revenue_at_risk_inr, expected_delay_days,
  affected_production_orders_count, affected_customer_orders_count, status, description
) VALUES (
  'DIS-2026-001',
  'Global Metals Ltd. Supplier Shutdown',
  'S-104',
  'M-101',
  'PL-01',
  'Unplanned Smelter Maintenance & Environmental Inspection',
  'CRITICAL',
  10,
  2.4,
  2740000, -- ₹27.4L
  7,
  17,
  20,
  'ACTIVE',
  'Unscheduled 10-day shutdown at S-104 Jamshedpur facility due to blast furnace hearth refractories issue. Directly halts Steering Assembly (M-101) shipments to Hyderabad Plant PL-01.'
) ON CONFLICT (id) DO NOTHING;

-- 17 Affected Production Orders
INSERT INTO production_orders (id, order_code, plant_id, material_id, product_model, quantity, status, scheduled_date, delay_days) VALUES
('PO-101', 'PO-2026-HYD-101', 'PL-01', 'M-101', 'Astra EV-X Prime', 10, 'AT_RISK', CURRENT_DATE + 3, 7),
('PO-102', 'PO-2026-HYD-102', 'PL-01', 'M-101', 'Astra EV-X Prime', 12, 'AT_RISK', CURRENT_DATE + 3, 7),
('PO-103', 'PO-2026-HYD-103', 'PL-01', 'M-101', 'Astra Sierra SUV 4WD', 8, 'AT_RISK', CURRENT_DATE + 4, 7),
('PO-104', 'PO-2026-HYD-104', 'PL-01', 'M-101', 'Astra Sierra SUV 4WD', 15, 'AT_RISK', CURRENT_DATE + 4, 7),
('PO-105', 'PO-2026-HYD-105', 'PL-01', 'M-101', 'Astra Urban EV Pro', 14, 'AT_RISK', CURRENT_DATE + 5, 7),
('PO-106', 'PO-2026-HYD-106', 'PL-01', 'M-101', 'Astra Urban EV Pro', 10, 'AT_RISK', CURRENT_DATE + 5, 7),
('PO-107', 'PO-2026-HYD-107', 'PL-01', 'M-101', 'Astra EV-X Prime', 12, 'AT_RISK', CURRENT_DATE + 6, 7),
('PO-108', 'PO-2026-HYD-108', 'PL-01', 'M-101', 'Astra Sierra SUV 4WD', 10, 'AT_RISK', CURRENT_DATE + 6, 7),
('PO-109', 'PO-2026-HYD-109', 'PL-01', 'M-101', 'Astra Cruiser Sedan', 16, 'AT_RISK', CURRENT_DATE + 7, 7),
('PO-110', 'PO-2026-HYD-110', 'PL-01', 'M-101', 'Astra Cruiser Sedan', 14, 'AT_RISK', CURRENT_DATE + 7, 7),
('PO-111', 'PO-2026-HYD-111', 'PL-01', 'M-101', 'Astra EV-X Prime', 10, 'AT_RISK', CURRENT_DATE + 8, 7),
('PO-112', 'PO-2026-HYD-112', 'PL-01', 'M-101', 'Astra Sierra SUV 4WD', 12, 'AT_RISK', CURRENT_DATE + 8, 7),
('PO-113', 'PO-2026-HYD-113', 'PL-01', 'M-101', 'Astra Urban EV Pro', 15, 'AT_RISK', CURRENT_DATE + 9, 7),
('PO-114', 'PO-2026-HYD-114', 'PL-01', 'M-101', 'Astra Cruiser Sedan', 8, 'AT_RISK', CURRENT_DATE + 9, 7),
('PO-115', 'PO-2026-HYD-115', 'PL-01', 'M-101', 'Astra EV-X Prime', 12, 'AT_RISK', CURRENT_DATE + 10, 7),
('PO-116', 'PO-2026-HYD-116', 'PL-01', 'M-101', 'Astra Sierra SUV 4WD', 10, 'AT_RISK', CURRENT_DATE + 10, 7),
('PO-117', 'PO-2026-HYD-117', 'PL-01', 'M-101', 'Astra Urban EV Pro', 14, 'AT_RISK', CURRENT_DATE + 11, 7)
ON CONFLICT (id) DO NOTHING;

-- 20 Affected Customer Orders (Total Value: ₹27,40,000 = ₹27.4L)
INSERT INTO customer_orders (id, order_code, customer_name, vehicle_model, quantity, value_inr, due_date, priority, status) VALUES
('CO-8901', 'CO-AP-8901', 'South Region Mobility Fleet', 'Astra EV-X Prime', 8, 185000, CURRENT_DATE + 4, 'CRITICAL', 'AT_RISK'),
('CO-8902', 'CO-TS-8902', 'Telangana State Transport Corp', 'Astra Sierra SUV', 6, 160000, CURRENT_DATE + 5, 'CRITICAL', 'AT_RISK'),
('CO-8903', 'CO-KA-8903', 'Metro City Rides Bengaluru', 'Astra Urban EV Pro', 10, 195000, CURRENT_DATE + 5, 'HIGH', 'AT_RISK'),
('CO-8904', 'CO-MH-8904', 'Apex Corporate Fleet Mumbai', 'Astra Cruiser Sedan', 5, 120000, CURRENT_DATE + 6, 'HIGH', 'AT_RISK'),
('CO-8905', 'CO-HY-8905', 'Hyderabad Green Cabs', 'Astra EV-X Prime', 6, 145000, CURRENT_DATE + 6, 'CRITICAL', 'AT_RISK'),
('CO-8906', 'CO-CH-8906', 'Southern Express Logistics', 'Astra Sierra SUV', 8, 175000, CURRENT_DATE + 7, 'HIGH', 'AT_RISK'),
('CO-8907', 'CO-DL-8907', 'National Executive Car Rentals', 'Astra Cruiser Sedan', 4, 98000, CURRENT_DATE + 7, 'MEDIUM', 'AT_RISK'),
('CO-8908', 'CO-BL-8908', 'TechPark Shuttles India', 'Astra Urban EV Pro', 7, 135000, CURRENT_DATE + 8, 'HIGH', 'AT_RISK'),
('CO-8909', 'CO-KL-8909', 'Kerala Eco Tours', 'Astra EV-X Prime', 5, 115000, CURRENT_DATE + 8, 'MEDIUM', 'AT_RISK'),
('CO-8910', 'CO-TN-8910', 'Coastal Drive Dealership Chennai', 'Astra Sierra SUV', 9, 210000, CURRENT_DATE + 8, 'CRITICAL', 'AT_RISK'),
('CO-8911', 'CO-GO-8911', 'Goa Hospitality Fleet', 'Astra Urban EV Pro', 4, 88000, CURRENT_DATE + 9, 'MEDIUM', 'AT_RISK'),
('CO-8912', 'CO-WB-8912', 'Kolkata Urban Mobility', 'Astra EV-X Prime', 6, 140000, CURRENT_DATE + 9, 'HIGH', 'AT_RISK'),
('CO-8913', 'CO-OR-8913', 'Eastern Mining Logistics Corp', 'Astra Sierra SUV', 5, 130000, CURRENT_DATE + 10, 'HIGH', 'AT_RISK'),
('CO-8914', 'CO-GJ-8914', 'Gujarat Industrial Movers', 'Astra Cruiser Sedan', 4, 92000, CURRENT_DATE + 10, 'MEDIUM', 'AT_RISK'),
('CO-8915', 'CO-RJ-8915', 'Royal Rajasthan Transit', 'Astra Sierra SUV', 7, 168000, CURRENT_DATE + 11, 'HIGH', 'AT_RISK'),
('CO-8916', 'CO-MP-8916', 'Central India Fleet Solutions', 'Astra Urban EV Pro', 5, 105000, CURRENT_DATE + 11, 'MEDIUM', 'AT_RISK'),
('CO-8917', 'CO-UP-8917', 'NCR Greenways Ride Corp', 'Astra EV-X Prime', 6, 142000, CURRENT_DATE + 12, 'HIGH', 'AT_RISK'),
('CO-8918', 'CO-PB-8918', 'Punjab Agro Logistics', 'Astra Sierra SUV', 4, 96000, CURRENT_DATE + 12, 'MEDIUM', 'AT_RISK'),
('CO-8919', 'CO-TN-8919', 'Coimbatore Auto Hub', 'Astra Cruiser Sedan', 5, 118000, CURRENT_DATE + 13, 'LOW', 'AT_RISK'),
('CO-8920', 'CO-AP-8920', 'Vizag Port Executive Transport', 'Astra EV-X Prime', 5, 123000, CURRENT_DATE + 13, 'HIGH', 'AT_RISK')
ON CONFLICT (id) DO NOTHING;

-- Recovery Strategies
INSERT INTO recovery_strategies (
  id, disruption_id, name, strategy_type, cost_inr, recovery_time_days,
  revenue_protected_inr, risk_level, overall_score, is_recommended, description, score_breakdown
) VALUES
(
  'STRAT-001',
  'DIS-2026-001',
  'Alternate Supplier (Bharat Precision)',
  'ALTERNATE_SOURCING',
  120000, -- ₹1.2L
  7,
  1450000,
  'MEDIUM',
  68.5,
  FALSE,
  'Contract emergency batch of 200 Steering Assemblies from secondary qualified vendor Bharat Precision Pune. Lowest piece surcharge but high qualification lead time.',
  '{"recovery_time_score": 50, "revenue_score": 60, "cost_score": 90, "risk_score": 70, "customer_score": 65}'
),
(
  'STRAT-002',
  'DIS-2026-001',
  'Inventory Transfer (Chennai PL-02)',
  'STOCK_TRANSFER',
  80000, -- ₹0.8L
  4,
  1920000,
  'LOW',
  82.0,
  FALSE,
  'Reallocate 180 safety stock units of M-101 from PL-02 Chennai to PL-01 Hyderabad via scheduled road express.',
  '{"recovery_time_score": 75, "revenue_score": 80, "cost_score": 95, "risk_score": 90, "customer_score": 80}'
),
(
  'STRAT-003',
  'DIS-2026-001',
  'Expedited Air Logistics (Jamshedpur)',
  'EXPEDITED_LOGISTICS',
  260000, -- ₹2.6L
  2,
  2150000,
  'LOW',
  86.5,
  FALSE,
  'Charter air freight from S-104 finished goods quarantine buffer in Ranchi airport direct to Hyderabad RGIA.',
  '{"recovery_time_score": 90, "revenue_score": 88, "cost_score": 65, "risk_score": 85, "customer_score": 90}'
),
(
  'STRAT-004',
  'DIS-2026-001',
  'Combined Recovery (Multi-Modal Transfer + Priority Sourcing)',
  'COMBINED',
  210000, -- ₹2.1L
  1,
  2420000, -- ₹24.2L
  'LOW',
  94.0,
  TRUE,
  'Optimal orchestrated response: Immediate night express transfer of 120 units from PL-02 Chennai + priority air dispatch of 100 units from S-104 finished inventory buffer. Reduces delay to 24 hours while preserving customer commitments.',
  '{"recovery_time_score": 98, "revenue_score": 95, "cost_score": 88, "risk_score": 92, "customer_score": 96}'
) ON CONFLICT (id) DO NOTHING;

-- Resilience Memory (Previous Incident)
INSERT INTO resilience_memory (
  id, crisis_title, root_cause, selected_strategy, recovery_time_days,
  loss_avoided_inr, outcome, success_score, recorded_at
) VALUES (
  'MEM-2025-014',
  'Q3 Axle Assembly Supplier Delay (Bharat Forge)',
  'Raw material ingot shortage and regional transport strike in Maharashtra',
  'Alternate Supplier + Inventory Transfer',
  1,
  1860000, -- ₹18.6L
  'Successfully mitigated 6-day projected line stoppage down to 1 day. Preserved Tier-1 OEM SLA obligations with 100% customer retention.',
  91.0,
  NOW() - INTERVAL '4 months'
) ON CONFLICT (id) DO NOTHING;
