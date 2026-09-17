-- ResiliNet Supabase PostgreSQL Schema
-- Astra Motors Manufacturing — Supply Chain Crisis Orchestrator

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'SUPPLY_CHAIN_MANAGER',
    'PROCUREMENT_MANAGER',
    'PRODUCTION_PLANNER',
    'LOGISTICS_MANAGER',
    'FINANCE_MANAGER',
    'ADMIN'
  )),
  department TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'Astra Motors Manufacturing',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  tier INTEGER DEFAULT 1,
  reliability_score NUMERIC DEFAULT 95.0,
  status TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL', 'SHUTDOWN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id),
  unit_cost_inr NUMERIC NOT NULL,
  lead_time_days INTEGER NOT NULL,
  criticality TEXT NOT NULL CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Manufacturing Plants
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity_units_per_day INTEGER NOT NULL,
  current_utilization_pct NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPERATIONAL', 'DEGRADED', 'HALTED'))
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id),
  plant_id TEXT NOT NULL REFERENCES plants(id),
  current_stock INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  daily_consumption INTEGER NOT NULL,
  coverage_days NUMERIC NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Production Orders
CREATE TABLE IF NOT EXISTS production_orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  plant_id TEXT NOT NULL REFERENCES plants(id),
  material_id TEXT NOT NULL REFERENCES materials(id),
  product_model TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ON_SCHEDULE', 'AT_RISK', 'DELAYED', 'COMPLETED', 'HALTED')),
  scheduled_date DATE NOT NULL,
  delay_days INTEGER DEFAULT 0
);

-- Customer Orders
CREATE TABLE IF NOT EXISTS customer_orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  value_inr NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL CHECK (status IN ('CONFIRMED', 'AT_RISK', 'DELAYED', 'FULFILLED'))
);

-- Dependencies (Multi-tier graph mapping)
CREATE TABLE IF NOT EXISTS dependencies (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  dependency_level TEXT NOT NULL
);

-- Disruptions
CREATE TABLE IF NOT EXISTS disruptions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  material_id TEXT NOT NULL REFERENCES materials(id),
  plant_id TEXT NOT NULL REFERENCES plants(id),
  disruption_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  duration_days INTEGER NOT NULL,
  coverage_days NUMERIC NOT NULL,
  revenue_at_risk_inr NUMERIC NOT NULL,
  expected_delay_days INTEGER NOT NULL,
  affected_production_orders_count INTEGER NOT NULL,
  affected_customer_orders_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'UNDER_INVESTIGATION', 'STRATEGY_PENDING', 'RESOLVING', 'RESOLVED')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- AI Agent Recommendations
CREATE TABLE IF NOT EXISTS agent_recommendations (
  id TEXT PRIMARY KEY,
  disruption_id TEXT NOT NULL REFERENCES disruptions(id),
  agent_name TEXT NOT NULL,
  finding TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  estimated_impact TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Strategies
CREATE TABLE IF NOT EXISTS recovery_strategies (
  id TEXT PRIMARY KEY,
  disruption_id TEXT NOT NULL REFERENCES disruptions(id),
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL,
  cost_inr NUMERIC NOT NULL,
  recovery_time_days INTEGER NOT NULL,
  revenue_protected_inr NUMERIC NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  overall_score NUMERIC NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  score_breakdown JSONB,
  description TEXT
);

-- Approvals (Human-in-the-loop)
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL REFERENCES recovery_strategies(id),
  approver_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Resilience Memory (Organizational Knowledge)
CREATE TABLE IF NOT EXISTS resilience_memory (
  id TEXT PRIMARY KEY,
  crisis_title TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  selected_strategy TEXT NOT NULL,
  recovery_time_days INTEGER NOT NULL,
  loss_avoided_inr NUMERIC NOT NULL,
  outcome TEXT NOT NULL,
  success_score NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE resilience_memory ENABLE ROW LEVEL SECURITY;

-- Public read access policies for authenticated users
CREATE POLICY "Allow authenticated read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user update profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow authenticated read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read materials" ON materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read plants" ON plants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read production_orders" ON production_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read customer_orders" ON customer_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read disruptions" ON disruptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read agent_recommendations" ON agent_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read recovery_strategies" ON recovery_strategies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read approvals" ON approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update approvals" ON approvals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read resilience_memory" ON resilience_memory FOR SELECT TO authenticated USING (true);
