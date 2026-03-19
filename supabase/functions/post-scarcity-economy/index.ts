import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();
    switch (mode) {
      case "sync_supply": return json(await syncSupply(sb, params));
      case "evaluate_ownership": return json(await evaluateOwnership(sb, params));
      case "stabilize_prices": return json(await stabilizePrices(sb, params));
      case "compute_habitat": return json(await computeHabitat(sb, params));
      case "spin_flywheel": return json(await spinFlywheel(sb, params));
      case "dashboard": return json(await getDashboard(sb));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ── 1) Intelligent Supply Synchronization ──
async function syncSupply(sb: any, params?: any) {
  const { data: targets } = await sb.from("supply_expansion_targets")
    .select("*").order("priority_rank");
  const { data: devCoord } = await sb.from("ceos_development_coordination")
    .select("*").order("computed_at", { ascending: false }).limit(50);

  const cityMap = new Map<string, any>();
  for (const t of (targets || [])) {
    const c = cityMap.get(t.city) || { supply: 0, target: 0, demand: 0, gap: 0, agents: 0 };
    c.supply += t.current_listings; c.target += t.target_listings;
    c.demand += t.demand_score; c.gap += t.supply_gap_score;
    c.agents += t.current_agents;
    cityMap.set(t.city, c);
  }

  const devByCity = new Map<string, any>();
  for (const d of (devCoord || [])) {
    if (!devByCity.has(d.city)) devByCity.set(d.city, d);
  }

  const records: any[] = [];
  for (const [city, agg] of cityMap) {
    const dev = devByCity.get(city);
    const supplyPct = agg.target > 0 ? agg.supply / agg.target : 1;
    const pipelineUnits = Math.max(0, agg.target - agg.supply);
    const housingNeeded5y = Math.round(pipelineUnits * 2.5);

    const infraReady = dev ? dev.infrastructure_readiness_score || 50 : 50;
    const landBanking = supplyPct < 0.5 ? Math.round((1 - supplyPct) * 60) : Math.round((1 - supplyPct) * 20);

    // Sync score: how well supply matches demand trajectory
    const syncScore = Math.min(100, Math.max(0, Math.round(
      (supplyPct >= 0.7 && supplyPct <= 1.1 ? 50 : 20) +
      (infraReady * 0.3) +
      (agg.agents > 5 ? 15 : 5) -
      (landBanking * 0.3)
    )));

    // Artificial scarcity: high when demand exists but supply is artificially constrained
    const scarcity = Math.min(100, Math.max(0, Math.round(
      (agg.demand > 50 && supplyPct < 0.5 ? 40 : 0) +
      landBanking * 0.4 +
      (100 - infraReady) * 0.2 +
      (agg.gap * 0.3)
    )));

    const status = scarcity >= 70 ? "misaligned" : syncScore >= 70 ? "synchronized" :
      syncScore >= 40 ? "correcting" : "misaligned";

    const intervention = scarcity >= 70 ? "Release land banks and fast-track permits" :
      syncScore < 40 ? "Accelerate infrastructure to unlock development" : null;

    records.push({
      city, country: "ID",
      construction_capacity_units_yr: Math.round(pipelineUnits * 0.4),
      active_construction_units: Math.round(pipelineUnits * 0.2),
      avg_build_cycle_months: 18,
      labor_availability_index: Math.min(100, 40 + agg.agents * 2),
      utilized_land_pct: Math.round(supplyPct * 80),
      land_banking_pct: landBanking,
      housing_units_needed_5y: housingNeeded5y,
      migration_net_annual: Math.round(agg.demand * 100),
      infra_readiness_score: infraReady,
      supply_sync_score: syncScore,
      artificial_scarcity_index: scarcity,
      sync_status: status,
      recommended_intervention: intervention,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("psre_supply_sync").insert(records);
  return { ok: true, cities_synced: records.length };
}

// ── 2) Adaptive Ownership Structures ──
async function evaluateOwnership(sb: any, params?: any) {
  const { data: stability } = await sb.from("psre_price_stability")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: sync } = await sb.from("psre_supply_sync")
    .select("*").order("computed_at", { ascending: false }).limit(30);

  const stabByCity = new Map<string, any>();
  for (const s of (stability || [])) { if (!stabByCity.has(s.city)) stabByCity.set(s.city, s); }
  const syncByCity = new Map<string, any>();
  for (const s of (sync || [])) { if (!syncByCity.has(s.city)) syncByCity.set(s.city, s); }

  const allCities = new Set([...stabByCity.keys(), ...syncByCity.keys()]);
  const modelTypes = ["fractional_token", "rental_to_equity", "co_investment_pool", "shared_equity"];
  const records: any[] = [];

  for (const city of allCities) {
    const stab = stabByCity.get(city);
    const syn = syncByCity.get(city);
    const affordability = stab ? 100 - (stab.rental_burden_pct || 30) : 50;

    for (const model of modelTypes) {
      const isToken = model === "fractional_token";
      const isRTE = model === "rental_to_equity";
      const isCIP = model === "co_investment_pool";

      const accessibility = Math.min(100, Math.round(
        (isToken ? 80 : isRTE ? 70 : isCIP ? 40 : 60) +
        (affordability > 60 ? 10 : -10)
      ));

      const destabRisk = Math.min(100, Math.round(
        (isToken ? 25 : isRTE ? 10 : isCIP ? 15 : 20) +
        (stab?.speculative_heat_index || 0) * 0.2
      ));

      const maturity = accessibility > 70 && destabRisk < 30 ? "scaling" :
        accessibility > 50 ? "pilot" : "experimental";

      records.push({
        city, country: "ID", model_type: model,
        active_participants: Math.round(accessibility * 10),
        total_units_covered: Math.round(accessibility * 5),
        avg_entry_cost_usd: isToken ? 500 : isRTE ? 200 : isCIP ? 10000 : 5000,
        avg_equity_accumulation_rate_pct: isRTE ? 3.5 : isToken ? 8 : 6,
        accessibility_score: accessibility,
        income_bracket_coverage: accessibility > 70 ? "broad" : accessibility > 50 ? "middle" : "upper_middle",
        first_time_buyer_pct: isRTE ? 65 : isToken ? 45 : 30,
        market_destabilization_risk: destabRisk,
        liquidity_provision_score: isToken ? 85 : isRTE ? 40 : isCIP ? 60 : 50,
        regulatory_compliance_score: isToken ? 60 : 80,
        avg_participant_roi_pct: isToken ? 12 : isRTE ? 8 : isCIP ? 15 : 10,
        default_rate_pct: isRTE ? 2.5 : 1.5,
        satisfaction_score: Math.min(100, Math.round(accessibility * 0.8 + 20)),
        model_maturity: maturity,
        computed_at: new Date().toISOString(),
      });
    }
  }

  if (records.length) await sb.from("psre_ownership_models").insert(records);
  return { ok: true, models_evaluated: records.length };
}

// ── 3) Price Stability & Volatility Dampening ──
async function stabilizePrices(sb: any, params?: any) {
  const { data: eqData } = await sb.from("ceos_market_equilibrium")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: sync } = await sb.from("psre_supply_sync")
    .select("*").order("computed_at", { ascending: false }).limit(30);

  const eqByCity = new Map<string, any>();
  for (const e of (eqData || [])) { if (!eqByCity.has(e.city)) eqByCity.set(e.city, e); }
  const syncByCity = new Map<string, any>();
  for (const s of (sync || [])) { if (!syncByCity.has(s.city)) syncByCity.set(s.city, s); }

  const allCities = new Set([...eqByCity.keys(), ...syncByCity.keys()]);
  const records: any[] = [];

  for (const city of allCities) {
    const eq = eqByCity.get(city);
    const syn = syncByCity.get(city);

    const specHeat = eq ? Math.min(100, Math.max(0, Math.round(
      (eq.speculative_oversupply_risk || 0) * 0.5 +
      (100 - (eq.rental_affordability_index || 50)) * 0.3 +
      (eq.equilibrium_score > 70 ? 20 : 0)
    ))) : 30;

    const priceToIncome = 8 + (specHeat * 0.1);
    const affordableStock = Math.max(5, Math.round(80 - specHeat * 0.6));
    const rentalBurden = Math.min(60, Math.round(25 + specHeat * 0.2));

    const trajectory = specHeat >= 70 ? "crisis" : specHeat >= 50 ? "worsening" :
      specHeat >= 30 ? "stable" : "improving";

    const vol30 = +(2 + specHeat * 0.1).toFixed(1);
    const vol90 = +(1.5 + specHeat * 0.08).toFixed(1);

    const dampening = Math.min(100, Math.max(0, Math.round(100 - specHeat - vol30 * 2)));
    const mechanism = specHeat >= 70 ? "speculation_tax" :
      specHeat >= 50 ? "lending_tightening" :
      syn?.artificial_scarcity_index > 50 ? "supply_release" : null;

    const urgency = specHeat >= 80 ? "critical" : specHeat >= 60 ? "urgent" :
      specHeat >= 40 ? "moderate" : specHeat >= 20 ? "watch" : "none";

    records.push({
      city, country: "ID",
      speculative_heat_index: specHeat,
      flip_transaction_pct: +(specHeat * 0.3).toFixed(1),
      price_income_divergence: +(priceToIncome - 5).toFixed(1),
      supply_incentive_active: specHeat >= 50 || (syn?.artificial_scarcity_index || 0) > 50,
      incentive_type: mechanism,
      incentive_effectiveness_score: mechanism ? Math.round(60 + Math.random() * 20) : 0,
      median_price_to_income: +priceToIncome.toFixed(1),
      affordable_stock_pct: affordableStock,
      rental_burden_pct: rentalBurden,
      affordability_trajectory: trajectory,
      volatility_30d: vol30,
      volatility_90d: vol90,
      dampening_score: dampening,
      dampening_mechanism: mechanism,
      intervention_urgency: urgency,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("psre_price_stability").insert(records);
  return { ok: true, cities_stabilized: records.length };
}

// ── 4) Global Habitat Quality Index ──
async function computeHabitat(sb: any, params?: any) {
  const { data: prosperity } = await sb.from("ceos_prosperity_index")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: sync } = await sb.from("psre_supply_sync")
    .select("*").order("computed_at", { ascending: false }).limit(30);

  const prosByCity = new Map<string, any>();
  for (const p of (prosperity || [])) { if (!prosByCity.has(p.city)) prosByCity.set(p.city, p); }
  const syncByCity = new Map<string, any>();
  for (const s of (sync || [])) { if (!syncByCity.has(s.city)) syncByCity.set(s.city, s); }

  const allCities = new Set([...prosByCity.keys(), ...syncByCity.keys()]);
  const records: any[] = [];

  for (const city of allCities) {
    const pros = prosByCity.get(city);
    const syn = syncByCity.get(city);

    const livability = pros ? Math.round(pros.urban_livability_score || 50) : 50;
    const connectivity = syn ? Math.min(100, Math.round((syn.infra_readiness_score || 50) * 1.1)) : 50;
    const econOpp = pros ? Math.round(pros.economic_resilience_score || 50) : 50;
    const envSustain = Math.min(100, Math.round(40 + (livability * 0.3)));

    const composite = Math.round(livability * 0.30 + connectivity * 0.25 + econOpp * 0.25 + envSustain * 0.20);
    const tier = composite >= 80 ? "world_class" : composite >= 65 ? "excellent" :
      composite >= 50 ? "good" : composite >= 35 ? "developing" : "underserved";

    const priority = tier === "underserved" ? "critical" : tier === "developing" ? "high" :
      tier === "good" ? "standard" : tier === "excellent" ? "low" : "saturated";

    const impactMult = tier === "underserved" ? 3.0 : tier === "developing" ? 2.0 :
      tier === "good" ? 1.5 : 1.0;

    records.push({
      city, country: "ID",
      livability_score: livability, connectivity_score: connectivity,
      economic_opportunity_score: econOpp, environmental_sustainability_score: envSustain,
      healthcare_access: Math.round(livability * 0.9),
      education_quality: Math.round(livability * 0.85),
      safety_index: Math.round(livability * 0.95),
      digital_infrastructure: Math.round(connectivity * 0.9),
      public_transit_coverage: Math.round(connectivity * 0.7),
      employment_density: Math.round(econOpp * 0.8),
      startup_ecosystem: Math.round(econOpp * 0.5),
      air_quality_index: Math.round(envSustain * 0.9),
      green_coverage_pct: Math.round(envSustain * 0.4),
      renewable_energy_pct: Math.round(envSustain * 0.3),
      habitat_quality_index: composite,
      habitat_tier: tier,
      capital_deployment_priority: priority,
      improvement_trajectory: pros?.trajectory || "stable",
      investment_impact_multiplier: impactMult,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("psre_habitat_quality").insert(records);
  return { ok: true, habitats_scored: records.length };
}

// ── 5) Abundance Flywheel ──
async function spinFlywheel(sb: any, params?: any) {
  const { data: sync } = await sb.from("psre_supply_sync")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: stab } = await sb.from("psre_price_stability")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: hab } = await sb.from("psre_habitat_quality")
    .select("*").order("computed_at", { ascending: false }).limit(30);

  const syncByCity = new Map<string, any>();
  for (const s of (sync || [])) { if (!syncByCity.has(s.city)) syncByCity.set(s.city, s); }
  const stabByCity = new Map<string, any>();
  for (const s of (stab || [])) { if (!stabByCity.has(s.city)) stabByCity.set(s.city, s); }
  const habByCity = new Map<string, any>();
  for (const h of (hab || [])) { if (!habByCity.has(h.city)) habByCity.set(h.city, h); }

  const allCities = new Set([...syncByCity.keys(), ...stabByCity.keys(), ...habByCity.keys()]);
  const records: any[] = [];

  for (const city of allCities) {
    const sy = syncByCity.get(city);
    const st = stabByCity.get(city);
    const ha = habByCity.get(city);

    const vacancy = st ? Math.max(1, Math.round(5 + st.speculative_heat_index * 0.1)) : 8;
    const vacancyGap = +(vacancy - 5).toFixed(1);
    const utilization = Math.min(100, Math.max(0, Math.round(100 - vacancy * 2 - (sy?.land_banking_pct || 0) * 0.5)));

    const devCycleEff = sy ? Math.min(100, Math.round(sy.supply_sync_score * 0.7 + sy.infra_readiness_score * 0.3)) : 50;
    const homeAccess = st ? Math.min(100, Math.round(st.affordable_stock_pct * 1.2)) : 50;
    const wealthVel = st ? Math.max(0, +(8 - st.rental_burden_pct * 0.1).toFixed(1)) : 5;
    const mobility = ha ? Math.min(100, Math.round(ha.habitat_quality_index * 0.8 + homeAccess * 0.2)) : 50;
    const burdenReduction = st ? Math.max(0, Math.round(40 - st.rental_burden_pct)) : 0;

    const composite = Math.round(
      utilization * 0.25 + devCycleEff * 0.20 + homeAccess * 0.25 + mobility * 0.20 + (100 - vacancy * 5) * 0.10
    );

    const stage = composite >= 80 ? "abundant" : composite >= 65 ? "self_sustaining" :
      composite >= 50 ? "accelerating" : composite >= 35 ? "activating" : "nascent";

    const momentum = +(composite / 20 - 1).toFixed(2);
    const nextTrigger = stage === "nascent" ? "Reduce artificial scarcity below 40" :
      stage === "activating" ? "Achieve 60% asset utilization" :
      stage === "accelerating" ? "Homeownership accessibility >70" :
      stage === "self_sustaining" ? "Structural vacancy <3% with stable prices" :
      "Maintain abundance equilibrium";

    const monthsToNext = stage === "abundant" ? 0 :
      Math.round(12 + (80 - composite) * 0.5);

    records.push({
      city, country: "ID",
      structural_vacancy_pct: vacancy,
      vacancy_gap: vacancyGap,
      asset_utilization_score: utilization,
      avg_permitting_days: Math.round(60 + (100 - devCycleEff) * 2),
      avg_construction_months: +(14 + (100 - devCycleEff) * 0.1).toFixed(1),
      dev_cycle_efficiency_score: devCycleEff,
      homeownership_accessibility_score: homeAccess,
      wealth_building_velocity: wealthVel,
      intergenerational_mobility_index: mobility,
      housing_cost_burden_reduction_pct: burdenReduction,
      abundance_composite_score: composite,
      flywheel_stage: stage,
      flywheel_momentum: momentum,
      next_stage_trigger: nextTrigger,
      estimated_months_to_next: monthsToNext,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("psre_abundance_flywheel").insert(records);
  return { ok: true, flywheels_computed: records.length };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [syncR, ownR, stabR, habR, flyR] = await Promise.all([
    sb.from("psre_supply_sync").select("*").order("supply_sync_score", { ascending: false }).limit(20),
    sb.from("psre_ownership_models").select("*").order("accessibility_score", { ascending: false }).limit(30),
    sb.from("psre_price_stability").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("psre_habitat_quality").select("*").order("habitat_quality_index", { ascending: false }).limit(20),
    sb.from("psre_abundance_flywheel").select("*").order("abundance_composite_score", { ascending: false }).limit(20),
  ]);

  const sync = syncR.data || [], own = ownR.data || [], stab = stabR.data || [];
  const hab = habR.data || [], fly = flyR.data || [];

  const avgSync = sync.length ? Math.round(sync.reduce((s: number, r: any) => s + r.supply_sync_score, 0) / sync.length) : 0;
  const avgScarcity = sync.length ? Math.round(sync.reduce((s: number, r: any) => s + r.artificial_scarcity_index, 0) / sync.length) : 0;
  const avgHabitat = hab.length ? Math.round(hab.reduce((s: number, r: any) => s + r.habitat_quality_index, 0) / hab.length) : 0;
  const avgAbundance = fly.length ? Math.round(fly.reduce((s: number, r: any) => s + r.abundance_composite_score, 0) / fly.length) : 0;
  const crisisCities = stab.filter((s: any) => s.intervention_urgency === "critical").length;

  return {
    ok: true,
    data: {
      summary: {
        cities_tracked: sync.length,
        avg_supply_sync: avgSync,
        avg_scarcity_index: avgScarcity,
        ownership_models_active: own.length,
        avg_habitat_quality: avgHabitat,
        avg_abundance_score: avgAbundance,
        crisis_cities: crisisCities,
      },
      supply_sync: sync,
      ownership_models: own,
      price_stability: stab,
      habitat_quality: hab,
      abundance_flywheel: fly,
    },
  };
}
