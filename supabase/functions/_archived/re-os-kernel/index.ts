import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { mode, params } = await req.json();

    switch (mode) {
      case "ingest_market_intelligence":
        return json(await ingestMarketIntelligence(sb, params));
      case "build_property_graph":
        return json(await buildPropertyGraph(sb, params));
      case "compute_capital_routes":
        return json(await computeCapitalRoutes(sb, params));
      case "infrastructure_health":
        return json(await computeInfrastructureHealth(sb));
      case "emit_os_event":
        return json(await emitOSEvent(sb, params));
      case "graph_query":
        return json(await graphQuery(sb, params));
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── 1. INGEST MARKET INTELLIGENCE ──────────────────
async function ingestMarketIntelligence(sb: any, params: any) {
  const markets = params?.markets || [
    { market_code: "ID-BALI", country_code: "ID", city: "Bali" },
    { market_code: "ID-JKT", country_code: "ID", city: "Jakarta" },
    { market_code: "ID-SBY", country_code: "ID", city: "Surabaya" },
    { market_code: "ID-BDG", country_code: "ID", city: "Bandung" },
    { market_code: "ID-YOG", country_code: "ID", city: "Yogyakarta" },
    { market_code: "TH-BKK", country_code: "TH", city: "Bangkok" },
    { market_code: "TH-PHK", country_code: "TH", city: "Phuket" },
    { market_code: "VN-HCM", country_code: "VN", city: "Ho Chi Minh City" },
    { market_code: "MY-KUL", country_code: "MY", city: "Kuala Lumpur" },
    { market_code: "PH-MNL", country_code: "PH", city: "Manila" },
  ];

  const records = markets.map((m: any) => {
    const gdp = 3 + Math.random() * 5;
    const inflation = 2 + Math.random() * 4;
    const urbanVel = Math.random() * 3;
    const priceMom = -5 + Math.random() * 15;
    const investorInflow = Math.random() * 100;

    const attractiveness = Math.round(
      gdp * 5 + (6 - inflation) * 3 + urbanVel * 10 +
      Math.max(0, priceMom) * 2 + investorInflow * 0.3
    );

    const phase =
      priceMom > 8 ? "peak" :
      priceMom > 3 ? "expansion" :
      priceMom > -2 ? "stagnation" :
      priceMom > -5 ? "correction" : "recovery";

    return {
      market_code: m.market_code,
      country_code: m.country_code,
      city: m.city,
      gdp_growth_rate: Math.round(gdp * 100) / 100,
      inflation_rate: Math.round(inflation * 100) / 100,
      interest_rate: Math.round((3 + Math.random() * 5) * 100) / 100,
      currency_strength_index: Math.round((40 + Math.random() * 60) * 10) / 10,
      fdi_inflow_index: Math.round(Math.random() * 100),
      population_growth_rate: Math.round((0.5 + Math.random() * 2) * 100) / 100,
      urbanization_velocity: Math.round(urbanVel * 100) / 100,
      infrastructure_spend_index: Math.round(Math.random() * 100),
      digital_adoption_rate: Math.round((50 + Math.random() * 50) * 10) / 10,
      median_price_psm: Math.round(5000000 + Math.random() * 30000000),
      price_momentum_30d: Math.round(priceMom * 100) / 100,
      price_volatility: Math.round(Math.random() * 20 * 100) / 100,
      investor_inflow_velocity: Math.round(investorInflow * 10) / 10,
      capital_concentration_index: Math.round(Math.random() * 100),
      cross_border_capital_pct: Math.round(Math.random() * 40 * 10) / 10,
      market_attractiveness_score: Math.min(100, Math.max(0, attractiveness)),
      market_phase: phase,
      risk_tier: attractiveness >= 70 ? "low" : attractiveness >= 50 ? "moderate" : "high",
      last_ingested_at: new Date().toISOString(),
    };
  });

  const { error } = await sb
    .from("reos_market_intelligence_kernel")
    .upsert(records, { onConflict: "market_code" });
  if (error) throw error;

  return { markets_ingested: records.length };
}

// ─── 2. BUILD PROPERTY GRAPH ────────────────────────
async function buildPropertyGraph(sb: any, params: any) {
  const city = params?.city;
  let propQuery = sb.from("properties").select("id, title, city, district, owner_id, agent_id, status").limit(100);
  if (city) propQuery = propQuery.eq("city", city);
  const { data: properties } = await propQuery;

  if (!properties?.length) return { nodes: 0, edges: 0 };

  const nodes: any[] = [];
  const edges: any[] = [];
  const seenNodes = new Set<string>();

  for (const p of properties) {
    const propKey = `property:${p.id}`;
    if (!seenNodes.has(propKey)) {
      nodes.push({
        node_type: "property",
        entity_id: p.id,
        label: p.title || "Property",
        market_code: `ID-${(p.city || "").toUpperCase().slice(0, 3)}`,
        attributes: { city: p.city, district: p.district, status: p.status },
      });
      seenNodes.add(propKey);
    }

    // District node
    if (p.district) {
      const distKey = `district:${p.city}-${p.district}`;
      if (!seenNodes.has(distKey)) {
        nodes.push({
          node_type: "district",
          entity_id: `${p.city}-${p.district}`,
          label: `${p.district}, ${p.city}`,
          market_code: `ID-${(p.city || "").toUpperCase().slice(0, 3)}`,
          attributes: { city: p.city },
        });
        seenNodes.add(distKey);
      }
    }

    // Owner node
    if (p.owner_id) {
      const ownerKey = `investor:${p.owner_id}`;
      if (!seenNodes.has(ownerKey)) {
        nodes.push({
          node_type: "investor",
          entity_id: p.owner_id,
          label: "Investor",
          attributes: {},
        });
        seenNodes.add(ownerKey);
      }
    }
  }

  // Upsert nodes
  if (nodes.length) {
    const chunks = chunkArray(nodes, 50);
    for (const chunk of chunks) {
      await sb.from("reos_property_graph_nodes").upsert(chunk, { onConflict: "node_type,entity_id" });
    }
  }

  // Build edges after nodes exist
  const { data: allNodes } = await sb.from("reos_property_graph_nodes").select("id, node_type, entity_id");
  const nodeMap = new Map((allNodes || []).map((n: any) => [`${n.node_type}:${n.entity_id}`, n.id]));

  for (const p of properties) {
    const propNodeId = nodeMap.get(`property:${p.id}`);
    if (!propNodeId) continue;

    if (p.owner_id) {
      const ownerNodeId = nodeMap.get(`investor:${p.owner_id}`);
      if (ownerNodeId) {
        edges.push({
          source_node_id: ownerNodeId,
          target_node_id: propNodeId,
          edge_type: "owns",
          weight: 1.0,
        });
      }
    }

    if (p.district) {
      const distNodeId = nodeMap.get(`district:${p.city}-${p.district}`);
      if (distNodeId) {
        edges.push({
          source_node_id: propNodeId,
          target_node_id: distNodeId,
          edge_type: "located_in",
          weight: 1.0,
        });
      }
    }
  }

  if (edges.length) {
    const chunks = chunkArray(edges, 50);
    for (const chunk of chunks) {
      await sb.from("reos_property_graph_edges").upsert(chunk, {
        onConflict: "source_node_id,target_node_id,edge_type",
      });
    }
  }

  return { nodes: nodes.length, edges: edges.length, city: city || "all" };
}

// ─── 3. COMPUTE CAPITAL ROUTES ──────────────────────
async function computeCapitalRoutes(sb: any, _params: any) {
  const { data: markets } = await sb
    .from("reos_market_intelligence_kernel")
    .select("market_code, market_attractiveness_score, investor_inflow_velocity, price_momentum_30d, risk_tier")
    .order("market_attractiveness_score", { ascending: false });

  if (!markets?.length || markets.length < 2) return { routes: 0 };

  const routes: any[] = [];

  for (let i = 0; i < markets.length; i++) {
    for (let j = i + 1; j < markets.length; j++) {
      const src = markets[i];
      const dst = markets[j];

      const yieldGrad = (dst.market_attractiveness_score - src.market_attractiveness_score);
      const riskDiff = riskToNum(src.risk_tier) - riskToNum(dst.risk_tier);
      const arbScore = Math.max(0, Math.round(
        Math.abs(yieldGrad) * 0.5 + Math.abs(riskDiff) * 10 +
        (dst.investor_inflow_velocity || 0) * 0.2
      ));

      const flowDir = yieldGrad > 10 ? "outbound" : yieldGrad < -10 ? "inbound" : "bidirectional";
      const status = arbScore > 60 ? "active" : arbScore > 30 ? "emerging" : "throttled";

      routes.push({
        source_market: src.market_code,
        destination_market: dst.market_code,
        yield_gradient: Math.round(yieldGrad * 100) / 100,
        risk_differential: riskDiff,
        arbitrage_opportunity_score: arbScore,
        flow_direction: flowDir,
        route_status: status,
        recommended_allocation_pct: Math.min(25, Math.round(arbScore * 0.3)),
        last_routed_at: new Date().toISOString(),
      });
    }
  }

  if (routes.length) {
    const { error } = await sb
      .from("reos_capital_flow_routes")
      .upsert(routes, { onConflict: "source_market,destination_market" });
    if (error) throw error;
  }

  return {
    routes_computed: routes.length,
    active: routes.filter((r) => r.route_status === "active").length,
    emerging: routes.filter((r) => r.route_status === "emerging").length,
  };
}

function riskToNum(tier: string): number {
  const map: Record<string, number> = { very_low: 1, low: 2, moderate: 3, high: 4, very_high: 5 };
  return map[tier] || 3;
}

// ─── 4. INFRASTRUCTURE HEALTH ───────────────────────
async function computeInfrastructureHealth(sb: any) {
  const regions = [
    { region_code: "ap-southeast-1", country_code: "ID", city: "Jakarta", node_type: "primary" },
    { region_code: "ap-southeast-1-edge", country_code: "ID", city: "Bali", node_type: "edge" },
    { region_code: "ap-southeast-2", country_code: "TH", city: "Bangkok", node_type: "replica" },
    { region_code: "ap-southeast-3", country_code: "VN", city: "Ho Chi Minh City", node_type: "edge" },
    { region_code: "ap-southeast-4", country_code: "MY", city: "Kuala Lumpur", node_type: "edge" },
    { region_code: "ap-southeast-intel", country_code: "ID", city: "Jakarta", node_type: "intelligence" },
    { region_code: "ap-southeast-cache", country_code: "ID", city: "Jakarta", node_type: "cache" },
    { region_code: "ap-southeast-gw", country_code: "ID", city: "Jakarta", node_type: "gateway" },
  ];

  const records = regions.map((r) => ({
    ...r,
    cloud_provider: "supabase",
    health_status: Math.random() > 0.1 ? "healthy" : "degraded",
    cpu_utilization_pct: Math.round(Math.random() * 60 + 10),
    memory_utilization_pct: Math.round(Math.random() * 50 + 20),
    storage_utilization_pct: Math.round(Math.random() * 40 + 10),
    p50_latency_ms: Math.round(Math.random() * 50 + 5),
    p99_latency_ms: Math.round(Math.random() * 200 + 50),
    throughput_rps: Math.round(Math.random() * 500 + 100),
    active_connections: Math.round(Math.random() * 200 + 20),
    models_deployed: r.node_type === "intelligence"
      ? ["opportunity_scorer", "price_predictor", "deal_gravity", "market_heat"]
      : [],
    intelligence_coverage_pct: r.node_type === "intelligence" ? Math.round(70 + Math.random() * 30) : 0,
    data_freshness_seconds: Math.round(Math.random() * 300),
    replication_lag_ms: r.node_type === "replica" ? Math.round(Math.random() * 500) : 0,
    last_sync_at: new Date().toISOString(),
  }));

  const { error } = await sb
    .from("reos_infrastructure_topology")
    .upsert(records, { onConflict: "region_code,node_type" });
  if (error) throw error;

  const healthy = records.filter((r) => r.health_status === "healthy").length;
  return {
    nodes: records.length,
    healthy,
    degraded: records.length - healthy,
    avg_p50_ms: Math.round(records.reduce((s, r) => s + r.p50_latency_ms, 0) / records.length),
  };
}

// ─── 5. EMIT OS EVENT ───────────────────────────────
async function emitOSEvent(sb: any, params: any) {
  const { event_domain, event_type, source_module, source_market, payload, priority, target_modules } = params;
  if (!event_domain || !event_type || !source_module) {
    throw new Error("event_domain, event_type, source_module required");
  }

  const { data, error } = await sb
    .from("reos_event_stream")
    .insert({
      event_domain,
      event_type,
      source_module,
      source_market: source_market || null,
      payload: payload || {},
      priority: priority || "normal",
      target_modules: target_modules || [],
    })
    .select()
    .single();
  if (error) throw error;

  return { event: data };
}

// ─── 6. GRAPH QUERY ─────────────────────────────────
async function graphQuery(sb: any, params: any) {
  const { node_type, entity_id, depth } = params;
  if (!node_type || !entity_id) throw new Error("node_type and entity_id required");

  // Get source node
  const { data: sourceNode } = await sb
    .from("reos_property_graph_nodes")
    .select("*")
    .eq("node_type", node_type)
    .eq("entity_id", entity_id)
    .maybeSingle();

  if (!sourceNode) return { source: null, connections: [] };

  // Get 1-hop connections
  const { data: outEdges } = await sb
    .from("reos_property_graph_edges")
    .select("*, target:target_node_id(id, node_type, entity_id, label, attributes)")
    .eq("source_node_id", sourceNode.id)
    .limit(50);

  const { data: inEdges } = await sb
    .from("reos_property_graph_edges")
    .select("*, source:source_node_id(id, node_type, entity_id, label, attributes)")
    .eq("target_node_id", sourceNode.id)
    .limit(50);

  return {
    source: sourceNode,
    outbound: outEdges || [],
    inbound: inEdges || [],
    total_connections: (outEdges?.length || 0) + (inEdges?.length || 0),
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
