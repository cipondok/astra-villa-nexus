
-- ============================================================
-- GLOBAL REAL ESTATE OPERATING SYSTEM (RE-OS)
-- Planet-scale intelligence kernel, property graph,
-- capital routing, and ecosystem API infrastructure
-- ============================================================

-- 1️⃣ GLOBAL MARKET INTELLIGENCE KERNEL
-- Real-time macro and micro signal ingestion
CREATE TABLE IF NOT EXISTS reos_market_intelligence_kernel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  country_code text NOT NULL DEFAULT 'ID',
  city text NOT NULL DEFAULT '',
  -- macro signals
  gdp_growth_rate numeric DEFAULT 0,
  inflation_rate numeric DEFAULT 0,
  interest_rate numeric DEFAULT 0,
  currency_strength_index numeric DEFAULT 0,
  fdi_inflow_index numeric DEFAULT 0,
  -- urban demand
  population_growth_rate numeric DEFAULT 0,
  urbanization_velocity numeric DEFAULT 0,
  infrastructure_spend_index numeric DEFAULT 0,
  digital_adoption_rate numeric DEFAULT 0,
  -- pricing intelligence
  median_price_psm numeric DEFAULT 0,
  price_momentum_30d numeric DEFAULT 0,
  price_volatility numeric DEFAULT 0,
  pricing_inefficiency_cluster_count integer DEFAULT 0,
  -- investor flow
  investor_inflow_velocity numeric DEFAULT 0,
  capital_concentration_index numeric DEFAULT 0,
  cross_border_capital_pct numeric DEFAULT 0,
  -- composite
  market_attractiveness_score integer NOT NULL DEFAULT 50,
  market_phase text DEFAULT 'expansion'
    CHECK (market_phase IN ('expansion','peak','correction','recovery','stagnation')),
  risk_tier text DEFAULT 'moderate'
    CHECK (risk_tier IN ('very_low','low','moderate','high','very_high')),
  last_ingested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(market_code)
);

CREATE INDEX IF NOT EXISTS idx_reos_kernel_country ON reos_market_intelligence_kernel(country_code);
CREATE INDEX IF NOT EXISTS idx_reos_kernel_score ON reos_market_intelligence_kernel(market_attractiveness_score DESC);

ALTER TABLE reos_market_intelligence_kernel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read kernel" ON reos_market_intelligence_kernel FOR SELECT USING (true);

-- 2️⃣ DISTRIBUTED PROPERTY GRAPH
-- Graph-based relationships between all entities
CREATE TABLE IF NOT EXISTS reos_property_graph_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type text NOT NULL
    CHECK (node_type IN ('property','investor','agent','vendor','district','fund_pool','market')),
  entity_id text NOT NULL,
  label text NOT NULL DEFAULT '',
  market_code text,
  -- node attributes
  attributes jsonb NOT NULL DEFAULT '{}',
  -- graph metrics
  degree_centrality numeric DEFAULT 0,
  betweenness_centrality numeric DEFAULT 0,
  pagerank numeric DEFAULT 0,
  cluster_id text,
  is_hub boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(node_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_reos_graph_node_type ON reos_property_graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_reos_graph_cluster ON reos_property_graph_nodes(cluster_id);
CREATE INDEX IF NOT EXISTS idx_reos_graph_hub ON reos_property_graph_nodes(is_hub) WHERE is_hub = true;

ALTER TABLE reos_property_graph_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read graph nodes" ON reos_property_graph_nodes FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS reos_property_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id uuid NOT NULL REFERENCES reos_property_graph_nodes(id) ON DELETE CASCADE,
  target_node_id uuid NOT NULL REFERENCES reos_property_graph_nodes(id) ON DELETE CASCADE,
  edge_type text NOT NULL
    CHECK (edge_type IN (
      'owns','listed_by','invested_in','services','located_in',
      'competes_with','feeds_capital','demands_from','similar_to',
      'referred_by','transacted_with','manages'
    )),
  weight numeric NOT NULL DEFAULT 1.0,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_node_id, target_node_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_reos_graph_edge_source ON reos_property_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_reos_graph_edge_target ON reos_property_graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_reos_graph_edge_type ON reos_property_graph_edges(edge_type);

ALTER TABLE reos_property_graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read graph edges" ON reos_property_graph_edges FOR SELECT USING (true);

-- 3️⃣ CAPITAL FLOW ROUTING ENGINE
-- Routes global capital to optimal markets
CREATE TABLE IF NOT EXISTS reos_capital_flow_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_market text NOT NULL,
  destination_market text NOT NULL,
  -- flow metrics
  capital_volume numeric NOT NULL DEFAULT 0,
  flow_velocity numeric NOT NULL DEFAULT 0,
  avg_ticket_size numeric NOT NULL DEFAULT 0,
  transaction_count integer NOT NULL DEFAULT 0,
  -- routing intelligence
  yield_gradient numeric NOT NULL DEFAULT 0,
  risk_differential numeric NOT NULL DEFAULT 0,
  liquidity_ratio numeric NOT NULL DEFAULT 0,
  arbitrage_opportunity_score numeric NOT NULL DEFAULT 0,
  -- routing decision
  route_status text NOT NULL DEFAULT 'active'
    CHECK (route_status IN ('active','throttled','blocked','emerging','saturated')),
  recommended_allocation_pct numeric DEFAULT 0,
  flow_direction text DEFAULT 'bidirectional'
    CHECK (flow_direction IN ('inbound','outbound','bidirectional')),
  last_routed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_market, destination_market)
);

CREATE INDEX IF NOT EXISTS idx_reos_capital_dest ON reos_capital_flow_routes(destination_market);
CREATE INDEX IF NOT EXISTS idx_reos_capital_arb ON reos_capital_flow_routes(arbitrage_opportunity_score DESC);

ALTER TABLE reos_capital_flow_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read capital routes" ON reos_capital_flow_routes FOR SELECT USING (true);

-- 4️⃣ ECOSYSTEM API REGISTRY
-- Programmable infrastructure for external integrations
CREATE TABLE IF NOT EXISTS reos_api_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL UNIQUE,
  api_version text NOT NULL DEFAULT 'v1',
  -- classification
  domain text NOT NULL
    CHECK (domain IN ('intelligence','transaction','capital','vendor','identity','analytics')),
  consumer_type text NOT NULL DEFAULT 'developer'
    CHECK (consumer_type IN ('developer','bank','fund','government','construction','internal')),
  -- access
  is_public boolean NOT NULL DEFAULT false,
  requires_auth boolean NOT NULL DEFAULT true,
  rate_limit_rpm integer NOT NULL DEFAULT 60,
  pricing_tier text NOT NULL DEFAULT 'free'
    CHECK (pricing_tier IN ('free','starter','professional','enterprise','custom')),
  monthly_price_usd numeric DEFAULT 0,
  -- usage
  total_calls bigint NOT NULL DEFAULT 0,
  total_consumers integer NOT NULL DEFAULT 0,
  avg_latency_ms integer NOT NULL DEFAULT 0,
  error_rate_pct numeric NOT NULL DEFAULT 0,
  uptime_pct numeric NOT NULL DEFAULT 99.9,
  -- documentation
  endpoint_pattern text NOT NULL DEFAULT '',
  description text,
  sample_response jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reos_api_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read API registry" ON reos_api_registry FOR SELECT USING (true);

-- 5️⃣ INFRASTRUCTURE TOPOLOGY STATE
-- Multi-region edge node health and orchestration
CREATE TABLE IF NOT EXISTS reos_infrastructure_topology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code text NOT NULL,
  node_type text NOT NULL DEFAULT 'edge'
    CHECK (node_type IN ('primary','replica','edge','intelligence','cache','gateway')),
  -- location
  country_code text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  cloud_provider text DEFAULT 'supabase',
  availability_zone text,
  -- health
  health_status text NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy','degraded','critical','maintenance','offline')),
  cpu_utilization_pct numeric DEFAULT 0,
  memory_utilization_pct numeric DEFAULT 0,
  storage_utilization_pct numeric DEFAULT 0,
  -- performance
  p50_latency_ms integer DEFAULT 0,
  p99_latency_ms integer DEFAULT 0,
  throughput_rps integer DEFAULT 0,
  active_connections integer DEFAULT 0,
  -- intelligence
  models_deployed text[] DEFAULT '{}',
  intelligence_coverage_pct numeric DEFAULT 0,
  data_freshness_seconds integer DEFAULT 0,
  -- sync
  replication_lag_ms integer DEFAULT 0,
  last_sync_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(region_code, node_type)
);

ALTER TABLE reos_infrastructure_topology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read topology" ON reos_infrastructure_topology FOR SELECT USING (true);

-- 6️⃣ OS EVENT STREAM
-- Planet-scale event streaming for cross-module orchestration
CREATE TABLE IF NOT EXISTS reos_event_stream (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_domain text NOT NULL
    CHECK (event_domain IN ('intelligence','transaction','capital','vendor','identity','infrastructure')),
  event_type text NOT NULL,
  source_market text,
  source_module text NOT NULL,
  -- payload
  payload jsonb NOT NULL DEFAULT '{}',
  -- routing
  target_modules text[] DEFAULT '{}',
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('critical','high','normal','low','batch')),
  -- processing
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed','expired')),
  processed_by text,
  processed_at timestamptz,
  processing_latency_ms integer,
  -- TTL
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reos_event_status ON reos_event_stream(status, priority) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reos_event_domain ON reos_event_stream(event_domain, event_type);
CREATE INDEX IF NOT EXISTS idx_reos_event_created ON reos_event_stream(created_at DESC);

ALTER TABLE reos_event_stream ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON reos_event_stream FOR SELECT USING (true);

-- Trigger: critical OS events propagate to AI signal bus
CREATE OR REPLACE FUNCTION emit_reos_critical_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.priority = 'critical' THEN
    INSERT INTO ai_event_signals (event_type, entity_type, entity_id, priority_level, payload)
    VALUES (
      'reos_' || NEW.event_domain || '_critical',
      'reos_event_stream',
      NEW.id::text,
      'critical',
      jsonb_build_object(
        'domain', NEW.event_domain,
        'event_type', NEW.event_type,
        'source_market', NEW.source_market,
        'source_module', NEW.source_module
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reos_critical_event
  AFTER INSERT ON reos_event_stream
  FOR EACH ROW EXECUTE FUNCTION emit_reos_critical_event();
