import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case "coordinate_development":
        return json(await coordinateDevelopment(supabase, params));
      case "route_signals":
        return json(await routeSignals(supabase, params));
      case "control_equilibrium":
        return json(await controlEquilibrium(supabase, params));
      case "compute_prosperity":
        return json(await computeProsperity(supabase, params));
      case "assess_governance":
        return json(await assessGovernance(supabase, params));
      case "dashboard":
        return json(await getDashboard(supabase));
      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── 1) Global Development Coordination ──

async function coordinateDevelopment(sb: any, params?: any) {
  const city = params?.city;

  // Gather supply pipeline data
  const { data: expansionTargets } = await sb
    .from("supply_expansion_targets")
    .select("city, target_listings, current_listings, target_agents, current_agents, demand_score, supply_gap_score, status")
    .order("priority_rank");

  const { data: existingCoord } = await sb
    .from("ceos_development_coordination")
    .select("*")
    .order("synchronization_score", { ascending: false });

  const cityMap = new Map<string, any>();
  for (const t of (expansionTargets || [])) {
    const c = cityMap.get(t.city) || {
      city: t.city, country: "ID",
      pipeline: 0, capacity: 0, supply: 0, demand: 0, gap: 0, count: 0,
    };
    c.pipeline += t.target_listings - t.current_listings;
    c.supply += t.current_listings;
    c.demand += t.demand_score;
    c.gap += t.supply_gap_score;
    c.count++;
    cityMap.set(t.city, c);
  }

  const records: any[] = [];
  for (const [cityName, c] of cityMap) {
    if (city && cityName !== city) continue;

    const supplyDemandRatio = c.demand > 0 ? +(c.supply / c.demand).toFixed(2) : 1.0;
    const pipelineUnits = Math.max(0, c.pipeline);
    const capacityPct = Math.min(100, Math.round((c.supply / Math.max(1, c.supply + pipelineUnits)) * 100));

    // Detect bottlenecks
    let bottleneckType = null;
    let bottleneckSeverity = 0;
    if (supplyDemandRatio < 0.3) { bottleneckType = "capital"; bottleneckSeverity = 90; }
    else if (supplyDemandRatio < 0.5) { bottleneckType = "permits"; bottleneckSeverity = 70; }
    else if (supplyDemandRatio < 0.7) { bottleneckType = "labor"; bottleneckSeverity = 50; }

    // Synchronization score
    const syncScore = Math.round(
      Math.min(100, Math.max(0,
        50 + (supplyDemandRatio >= 0.8 && supplyDemandRatio <= 1.2 ? 30 : -20) +
        (bottleneckSeverity === 0 ? 20 : -bottleneckSeverity * 0.3)
      ))
    );

    const status = bottleneckSeverity >= 80 ? "critical" :
      bottleneckSeverity >= 50 ? "intervention" :
      syncScore < 40 ? "intervention" : "monitoring";

    records.push({
      city: cityName,
      country: "ID",
      construction_pipeline_units: pipelineUnits,
      construction_capacity_pct: capacityPct,
      active_supply_units: c.supply,
      supply_demand_ratio: supplyDemandRatio,
      synchronization_score: syncScore,
      bottleneck_type: bottleneckType,
      bottleneck_severity: bottleneckSeverity,
      coordination_status: status,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) {
    await sb.from("ceos_development_coordination").insert(records);
  }

  return { ok: true, coordinated: records.length };
}

// ── 2) Economic Signal Routing ──

async function routeSignals(sb: any, params?: any) {
  // Gather pending signals and route them
  const { data: pending } = await sb
    .from("ceos_signal_routing")
    .select("*")
    .eq("routing_status", "pending")
    .order("signal_strength", { ascending: false })
    .limit(50);

  let routed = 0;
  const now = new Date().toISOString();

  for (const signal of (pending || [])) {
    // Amplify strong signals
    const amplified = signal.signal_strength >= 80;
    const factor = amplified ? 1.0 + (signal.signal_strength - 80) * 0.05 : 1.0;

    await sb
      .from("ceos_signal_routing")
      .update({
        routing_status: "routed",
        is_amplified: amplified,
        amplification_factor: +factor.toFixed(2),
        routed_at: now,
      })
      .eq("id", signal.id);

    routed++;
  }

  // Auto-generate signals from market equilibrium data
  const { data: eqData } = await sb
    .from("ceos_market_equilibrium")
    .select("*")
    .in("intervention_urgency", ["urgent", "critical"])
    .limit(10);

  const newSignals: any[] = [];
  for (const eq of (eqData || [])) {
    newSignals.push({
      signal_type: "government_policy",
      source_entity_type: "planner",
      target_entity_type: eq.equilibrium_phase === "shortage" ? "developer" : "investor",
      city: eq.city,
      country: eq.country,
      signal_strength: Math.min(100, eq.equilibrium_score > 50 ? 100 - eq.equilibrium_score : eq.equilibrium_score) * 2,
      signal_payload: {
        phase: eq.equilibrium_phase,
        urgency: eq.intervention_urgency,
        supply_action: eq.recommended_supply_action,
        demand_action: eq.recommended_demand_action,
      },
      propagation_speed: eq.intervention_urgency === "critical" ? "instant" : "fast",
      routing_status: "pending",
    });
  }

  if (newSignals.length) {
    await sb.from("ceos_signal_routing").insert(newSignals);
  }

  return { ok: true, routed, new_signals: newSignals.length };
}

// ── 3) Autonomous Market Equilibrium Controller ──

async function controlEquilibrium(sb: any, params?: any) {
  const { data: expansionTargets } = await sb
    .from("supply_expansion_targets")
    .select("*")
    .order("priority_rank");

  const { data: balanceData } = await sb
    .from("district_marketplace_balance")
    .select("*")
    .order("marketplace_balance_score", { ascending: false });

  const cityAgg = new Map<string, any>();
  for (const t of (expansionTargets || [])) {
    const c = cityAgg.get(t.city) || { supply: 0, target: 0, demand: 0, gap: 0 };
    c.supply += t.current_listings;
    c.target += t.target_listings;
    c.demand += t.demand_score;
    c.gap += t.supply_gap_score;
    cityAgg.set(t.city, c);
  }

  const records: any[] = [];
  for (const [city, agg] of cityAgg) {
    const supplyPct = agg.target > 0 ? agg.supply / agg.target : 1;
    const shortageIndex = +((supplyPct - 1) * 100).toFixed(1); // neg = shortage
    const oversupplyRisk = Math.min(100, Math.max(0, Math.round(supplyPct > 1.3 ? (supplyPct - 1.3) * 200 : 0)));
    const affordability = Math.min(100, Math.max(0, Math.round(100 - (agg.gap * 1.2))));
    const investorReturn = Math.min(100, Math.max(0, Math.round(agg.demand * 1.5)));

    // Equilibrium: 50 is perfect
    const eq = Math.round(
      50 + (shortageIndex > 0 ? Math.min(30, shortageIndex * 0.5) : Math.max(-30, shortageIndex * 0.5)) -
      oversupplyRisk * 0.2
    );

    const phase = eq < 25 ? "shortage" : eq < 40 ? "tightening" : eq < 60 ? "balanced" : eq < 75 ? "loosening" : "oversupply";
    const meanReversion = +(50 - eq).toFixed(1);

    const urgency = Math.abs(eq - 50) > 35 ? "critical" :
      Math.abs(eq - 50) > 25 ? "urgent" :
      Math.abs(eq - 50) > 15 ? "moderate" :
      Math.abs(eq - 50) > 5 ? "watch" : "none";

    const supplyAction = phase === "shortage" ? "accelerate_construction" :
      phase === "oversupply" ? "slow_permits" : null;
    const demandAction = phase === "shortage" ? "attract_investment" :
      phase === "oversupply" ? "restrict_speculation" : null;

    const confidence = Math.min(100, Math.round(60 + (agg.supply > 100 ? 20 : 0) + (agg.demand > 50 ? 20 : 0)));

    records.push({
      city, country: "ID",
      housing_shortage_index: shortageIndex,
      speculative_oversupply_risk: oversupplyRisk,
      rental_affordability_index: affordability,
      investor_return_index: investorReturn,
      equilibrium_score: Math.max(0, Math.min(100, eq)),
      equilibrium_phase: phase,
      mean_reversion_pressure: meanReversion,
      intervention_urgency: urgency,
      recommended_supply_action: supplyAction,
      recommended_demand_action: demandAction,
      control_loop_confidence: confidence,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) {
    await sb.from("ceos_market_equilibrium").insert(records);
  }

  return { ok: true, equilibrium_computed: records.length };
}

// ── 4) Societal Prosperity Index ──

async function computeProsperity(sb: any, params?: any) {
  const { data: eqData } = await sb
    .from("ceos_market_equilibrium")
    .select("*")
    .order("computed_at", { ascending: false })
    .limit(50);

  const { data: devData } = await sb
    .from("ceos_development_coordination")
    .select("*")
    .order("computed_at", { ascending: false })
    .limit(50);

  // Group by city, take latest
  const eqByCity = new Map<string, any>();
  for (const e of (eqData || [])) {
    if (!eqByCity.has(e.city)) eqByCity.set(e.city, e);
  }

  const devByCity = new Map<string, any>();
  for (const d of (devData || [])) {
    if (!devByCity.has(d.city)) devByCity.set(d.city, d);
  }

  const allCities = new Set([...eqByCity.keys(), ...devByCity.keys()]);
  const records: any[] = [];

  for (const city of allCities) {
    const eq = eqByCity.get(city);
    const dev = devByCity.get(city);

    const wealthAccess = eq ? Math.min(100, Math.max(0, eq.rental_affordability_index)) : 50;
    const housingStability = eq ? Math.min(100, Math.max(0, 100 - Math.abs(eq.housing_shortage_index))) : 50;
    const livability = dev ? Math.min(100, Math.max(0, dev.synchronization_score + 10)) : 50;
    const resilience = eq ? Math.min(100, Math.max(0, eq.control_loop_confidence)) : 50;

    const composite = Math.round(wealthAccess * 0.3 + housingStability * 0.25 + livability * 0.25 + resilience * 0.2);

    const tier = composite >= 80 ? "thriving" : composite >= 60 ? "growing" :
      composite >= 40 ? "developing" : composite >= 20 ? "struggling" : "crisis";

    const trajectory = composite >= 70 ? "improving" : composite >= 40 ? "stable" :
      composite >= 20 ? "declining" : "critical_decline";

    const forecast5y = Math.min(100, Math.round(composite * 1.1 + (composite > 50 ? 5 : -5)));

    const recommendations: string[] = [];
    if (wealthAccess < 40) recommendations.push("Implement affordable housing subsidies");
    if (housingStability < 40) recommendations.push("Stabilize supply through construction incentives");
    if (livability < 40) recommendations.push("Invest in infrastructure and green spaces");
    if (resilience < 40) recommendations.push("Diversify economic base and attract multi-sector investment");

    records.push({
      city, country: "ID",
      wealth_accessibility_score: wealthAccess,
      housing_stability_score: housingStability,
      urban_livability_score: livability,
      economic_resilience_score: resilience,
      prosperity_composite_score: composite,
      prosperity_tier: tier,
      trajectory,
      forecast_5y_score: forecast5y,
      policy_recommendations: recommendations,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) {
    await sb.from("ceos_prosperity_index").insert(records);
  }

  return { ok: true, prosperity_computed: records.length };
}

// ── 5) Governance Assessment ──

async function assessGovernance(sb: any, params?: any) {
  const { data: regions } = await sb
    .from("global_regions")
    .select("*")
    .eq("is_active", true);

  const records: any[] = [];
  for (const r of (regions || [])) {
    const policyStability = Math.round(50 + (r.market_maturity_level === "mature" ? 30 : r.market_maturity_level === "growing" ? 15 : 0));
    const geoRisk = Math.round(r.risk_multiplier * 20);
    const ownerRestrict = r.foreign_ownership_allowed ? (r.max_foreign_ownership_pct >= 100 ? "open" : "moderate") : "restricted";

    const pppReady = Math.round(
      (policyStability * 0.4) + (r.data_density_score * 0.3) + (r.foreign_ownership_allowed ? 20 : 0) + 10
    );

    const smartCity = r.data_density_score > 80 ? "advanced" : r.data_density_score > 50 ? "partial" :
      r.data_density_score > 20 ? "pilot" : "none";

    const digitalGov = Math.round(r.data_density_score * 0.8 + (r.market_maturity_level === "mature" ? 20 : 0));

    const adoptionPhase = r.is_primary ? "mature" : r.expansion_phase === "active" ? "scaling" :
      r.expansion_phase === "pilot" ? "pilot" : "prospect";

    records.push({
      country: r.country_code,
      country_name: r.country_name,
      ownership_restriction_level: ownerRestrict,
      foreign_ownership_rules: { allowed: r.foreign_ownership_allowed, max_pct: r.max_foreign_ownership_pct },
      tax_regime_summary: { capital_gains: r.capital_gains_tax_pct, stamp_duty: r.stamp_duty_pct },
      zoning_flexibility_score: Math.min(100, Math.round(50 + (r.rental_regulation_level === "low" ? 20 : -10))),
      ppp_readiness_score: Math.min(100, pppReady),
      smart_city_integration_level: smartCity,
      digital_governance_score: Math.min(100, digitalGov),
      platform_adoption_phase: adoptionPhase,
      active_city_count: r.is_primary ? 38 : 0,
      policy_stability_score: policyStability,
      geopolitical_risk_score: Math.min(100, geoRisk),
      is_active: true,
    });
  }

  if (records.length) {
    await sb.from("ceos_governance_modules").insert(records);
  }

  return { ok: true, governance_assessed: records.length };
}

// ── Dashboard ──

async function getDashboard(sb: any) {
  const [devRes, eqRes, prosRes, sigRes, govRes] = await Promise.all([
    sb.from("ceos_development_coordination").select("*").order("synchronization_score", { ascending: false }).limit(20),
    sb.from("ceos_market_equilibrium").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("ceos_prosperity_index").select("*").order("prosperity_composite_score", { ascending: false }).limit(20),
    sb.from("ceos_signal_routing").select("*").order("created_at", { ascending: false }).limit(30),
    sb.from("ceos_governance_modules").select("*").eq("is_active", true).order("ppp_readiness_score", { ascending: false }),
  ]);

  const dev = devRes.data || [];
  const eq = eqRes.data || [];
  const pros = prosRes.data || [];
  const signals = sigRes.data || [];
  const gov = govRes.data || [];

  const criticalCities = eq.filter((e: any) => e.intervention_urgency === "critical").length;
  const avgProsperity = pros.length ? Math.round(pros.reduce((s: number, p: any) => s + p.prosperity_composite_score, 0) / pros.length) : 0;
  const pendingSignals = signals.filter((s: any) => s.routing_status === "pending").length;
  const avgSync = dev.length ? Math.round(dev.reduce((s: number, d: any) => s + d.synchronization_score, 0) / dev.length) : 0;

  return {
    ok: true,
    data: {
      summary: {
        cities_coordinated: dev.length,
        critical_interventions: criticalCities,
        avg_prosperity_score: avgProsperity,
        pending_signals: pendingSignals,
        avg_sync_score: avgSync,
        governance_modules: gov.length,
        sovereign_partners: gov.filter((g: any) => g.platform_adoption_phase === "sovereign_partner").length,
      },
      development: dev,
      equilibrium: eq,
      prosperity: pros,
      signals,
      governance: gov,
    },
  };
}
