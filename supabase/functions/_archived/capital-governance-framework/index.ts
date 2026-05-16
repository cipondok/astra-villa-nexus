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
      case "build_transparency_grid": return json(await buildTransparencyGrid(sb, params));
      case "evaluate_councils": return json(await evaluateCouncils(sb, params));
      case "run_crisis_protocol": return json(await runCrisisProtocol(sb, params));
      case "assess_inclusion": return json(await assessInclusion(sb, params));
      case "compute_ethics": return json(await computeEthics(sb, params));
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

// ── 1) Capital Transparency Grid ──
async function buildTransparencyGrid(sb: any, params?: any) {
  const { data: regions } = await sb.from("global_regions").select("*").eq("is_active", true);
  const { data: flows } = await sb.from("gwsm_capital_flows")
    .select("*").order("flow_volume_usd", { ascending: false }).limit(50);

  const records: any[] = [];
  const regionList = regions || [];

  // Build cross-border flow grid from regions
  for (let i = 0; i < regionList.length; i++) {
    for (let j = i + 1; j < regionList.length && j < i + 4; j++) {
      const src = regionList[i];
      const tgt = regionList[j];

      const flowVol = Math.round(1000000 + Math.random() * 50000000);
      const sectorHHI = Math.round(2000 + Math.random() * 4000);
      const geoConcentration = Math.min(100, Math.round(sectorHHI / 100));
      const infraGap = Math.round(flowVol * 0.3);

      const transparency = Math.min(100, Math.round(
        (src.data_density_score + tgt.data_density_score) / 2 * 0.6 +
        (src.foreign_ownership_allowed && tgt.foreign_ownership_allowed ? 25 : 10) +
        15
      ));

      const gapSeverity = infraGap > 20000000 ? "critical" : infraGap > 10000000 ? "significant" :
        infraGap > 5000000 ? "moderate" : "minimal";

      const grade = transparency >= 80 ? "A" : transparency >= 60 ? "B" :
        transparency >= 40 ? "C" : transparency >= 20 ? "D" : "F";

      records.push({
        source_country: src.country_code,
        target_country: tgt.country_code,
        sector: "residential",
        flow_volume_usd: flowVol,
        flow_direction: "bilateral",
        flow_velocity_change_pct: +((Math.random() - 0.3) * 20).toFixed(1),
        sector_concentration_hhi: sectorHHI,
        geographic_concentration_risk: geoConcentration,
        infra_funding_gap_usd: infraGap,
        infra_gap_severity: gapSeverity,
        transparency_score: transparency,
        beneficial_ownership_visibility_pct: Math.round(transparency * 0.8),
        aml_compliance_score: Math.min(100, Math.round(transparency * 1.1)),
        data_quality_grade: grade,
        computed_at: new Date().toISOString(),
      });
    }
  }

  if (records.length) await sb.from("gccf_transparency_grid").insert(records);
  return { ok: true, flows_mapped: records.length };
}

// ── 2) Strategic Allocation Councils ──
async function evaluateCouncils(sb: any, params?: any) {
  const { data: regions } = await sb.from("global_regions").select("*").eq("is_active", true);
  const { data: leadership } = await sb.from("apin_market_leadership")
    .select("*").order("market_share_pct", { ascending: false });

  const councilTypes = ["sovereign", "institutional", "regional", "sectoral"];
  const records: any[] = [];

  for (const r of (regions || []).slice(0, 8)) {
    const lead = (leadership || []).find((l: any) => l.region === r.region_id);

    for (const cType of councilTypes) {
      const instMembers = cType === "sovereign" ? 5 : cType === "institutional" ? 12 : 8;
      const pubMembers = cType === "sovereign" ? 3 : cType === "regional" ? 5 : 2;
      const aiWeight = cType === "sovereign" ? 0.25 : cType === "institutional" ? 0.40 : 0.33;

      const capitalGoverned = Math.round(
        (lead?.total_network_aum_usd || 10000000) * (cType === "sovereign" ? 10 : cType === "institutional" ? 5 : 1)
      );

      const acceptance = Math.min(100, Math.round(60 + aiWeight * 40));
      const alignment = Math.min(100, Math.round(50 + (r.data_density_score || 0) * 0.3 + acceptance * 0.2));

      records.push({
        council_name: `${r.country_name} ${cType.charAt(0).toUpperCase() + cType.slice(1)} Council`,
        council_type: cType,
        region: r.region_id || r.country_code,
        institutional_members: instMembers,
        public_sector_members: pubMembers,
        ai_advisor_weight: aiWeight,
        total_capital_governed_usd: capitalGoverned,
        decisions_made: Math.round(10 + Math.random() * 50),
        avg_decision_time_days: +(3 + Math.random() * 12).toFixed(1),
        ai_recommendation_acceptance_pct: acceptance,
        portfolio_return_pct: +(8 + Math.random() * 10).toFixed(1),
        risk_adjusted_return: +(5 + Math.random() * 8).toFixed(1),
        alignment_with_prosperity_goals_pct: alignment,
        voting_mechanism: cType === "sovereign" ? "supermajority" : "weighted_consensus",
        transparency_level: cType === "sovereign" ? "moderate" : "high",
        is_active: true,
      });
    }
  }

  if (records.length) await sb.from("gccf_allocation_councils").insert(records);
  return { ok: true, councils_evaluated: records.length };
}

// ── 3) Crisis Stabilization Protocol ──
async function runCrisisProtocol(sb: any, params?: any) {
  // Scan upstream signals for instability
  const { data: riskEntropy } = await sb.from("gwsm_risk_entropy")
    .select("*").order("systemic_instability_index", { ascending: false }).limit(10);
  const { data: macroCycles } = await sb.from("aswc_macro_cycles")
    .select("*").order("computed_at", { ascending: false }).limit(10);
  const { data: polRisk } = await sb.from("aswc_political_risk")
    .select("*").order("composite_risk_score", { ascending: false }).limit(10);

  const records: any[] = [];
  const crisisTypes = [
    { type: "macro_instability", check: (r: any) => (r?.systemic_instability_index || 0) > 60 },
    { type: "liquidity_freeze", check: (r: any) => (r?.leverage_risk || 0) > 70 },
    { type: "housing_crash", check: (r: any) => (r?.bubble_probability || 0) > 0.6 },
    { type: "geopolitical_shock", check: (p: any) => (p?.composite_risk_score || 0) > 70 },
  ];

  for (const entropy of (riskEntropy || [])) {
    for (const ct of crisisTypes) {
      const isTriggered = ct.check(entropy);
      const instability = entropy.systemic_instability_index || 0;

      const severity = instability >= 85 ? "systemic" : instability >= 70 ? "critical" :
        instability >= 55 ? "severe" : instability >= 40 ? "elevated" : "watch";

      const resilience = Math.max(0, Math.round(100 - instability));
      const contagion = Math.min(100, Math.round(instability * 0.7));

      const protocolStatus = isTriggered && instability >= 70 ? "activated" :
        isTriggered ? "responding" : instability >= 40 ? "monitoring" : "monitoring";

      const redistributions: any = {};
      if (severity === "critical" || severity === "systemic") {
        redistributions.from_sector = "speculative_residential";
        redistributions.to_sector = "infrastructure";
        redistributions.pct = 15;
      }

      const protections: string[] = [];
      if (instability >= 70) protections.push("Activate hedging overlays");
      if (instability >= 60) protections.push("Reduce leverage exposure");
      if (instability >= 50) protections.push("Increase cash reserves to 20%");

      records.push({
        crisis_type: ct.type,
        affected_region: entropy.geography_tier || "global",
        affected_countries: [entropy.asset_class || "mixed"],
        severity_level: severity,
        detection_confidence: Math.min(100, Math.round(50 + instability * 0.5)),
        leading_indicators: [
          { indicator: "instability_index", value: instability },
          { indicator: "leverage_risk", value: entropy.leverage_risk || 0 },
        ],
        trigger_threshold_breached: isTriggered,
        recommended_redistribution: redistributions,
        capital_protection_actions: protections,
        liquidity_injection_needed_usd: instability >= 70 ? Math.round(instability * 1000000) : 0,
        estimated_recovery_months: Math.round(3 + instability * 0.2),
        financial_resilience_score: resilience,
        contagion_risk_pct: contagion,
        systemic_importance_score: Math.min(100, Math.round(instability * 0.8)),
        protocol_status: protocolStatus,
        activated_at: protocolStatus === "activated" ? new Date().toISOString() : null,
        computed_at: new Date().toISOString(),
      });
    }
  }

  if (records.length) await sb.from("gccf_crisis_protocol").insert(records);
  return { ok: true, protocols_evaluated: records.length };
}

// ── 4) Inclusive Wealth Participation ──
async function assessInclusion(sb: any, params?: any) {
  const { data: regions } = await sb.from("global_regions").select("*").eq("is_active", true);
  const { data: ownership } = await sb.from("psre_ownership_models")
    .select("*").order("accessibility_score", { ascending: false }).limit(50);

  const ownByCountry = new Map<string, any[]>();
  for (const o of (ownership || [])) {
    const list = ownByCountry.get(o.country) || [];
    list.push(o);
    ownByCountry.set(o.country, list);
  }

  const records: any[] = [];
  for (const r of (regions || [])) {
    const models = ownByCountry.get(r.country_code) || [];
    const avgAccess = models.length > 0 ?
      Math.round(models.reduce((s: number, m: any) => s + m.accessibility_score, 0) / models.length) : 30;

    const digitalAccess = Math.min(100, Math.round(r.data_density_score * 0.8 + 20));
    const finLiteracy = Math.min(100, Math.round(
      r.market_maturity_level === "mature" ? 70 : r.market_maturity_level === "growing" ? 50 : 30
    ));
    const regBarrier = r.foreign_ownership_allowed ? Math.round(30 + (100 - r.max_foreign_ownership_pct) * 0.3) : 70;
    const readiness = Math.min(100, Math.round(avgAccess * 0.3 + digitalAccess * 0.3 + finLiteracy * 0.2 + (100 - regBarrier) * 0.2));

    const microEnabled = avgAccess > 50 && digitalAccess > 40;
    const microInvestors = microEnabled ? Math.round(readiness * 100) : 0;
    const crossBorder = r.foreign_ownership_allowed ? Math.min(100, Math.round(readiness * 0.6)) : 5;

    const giniImpact = microEnabled ? +(readiness * -0.01).toFixed(3) : 0;
    const wealthPerCapita = Math.round(readiness * 50);

    const composite = Math.min(100, Math.round(
      readiness * 0.3 + (microEnabled ? 25 : 0) + crossBorder * 0.2 + finLiteracy * 0.2
    ));

    const tier = composite >= 75 ? "leading" : composite >= 55 ? "advancing" :
      composite >= 35 ? "developing" : composite >= 15 ? "emerging" : "excluded";

    records.push({
      country: r.country_code,
      region: r.region_id || r.country_code,
      emerging_market_readiness_score: readiness,
      regulatory_barrier_index: regBarrier,
      digital_access_pct: digitalAccess,
      financial_literacy_index: finLiteracy,
      micro_ownership_enabled: microEnabled,
      min_investment_threshold_usd: microEnabled ? 100 : 10000,
      active_micro_investors: microInvestors,
      micro_portfolio_total_usd: microInvestors * 500,
      avg_micro_return_pct: +(6 + Math.random() * 6).toFixed(1),
      cross_border_participation_pct: crossBorder,
      diaspora_investment_volume_usd: Math.round(crossBorder * 100000),
      mobile_first_investors_pct: Math.min(100, Math.round(digitalAccess * 0.9)),
      wealth_gini_impact: giniImpact,
      new_investor_onboarding_monthly: Math.round(microInvestors * 0.05),
      wealth_creation_per_capita_usd: wealthPerCapita,
      inclusion_composite_score: composite,
      inclusion_tier: tier,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("gccf_inclusive_participation").insert(records);
  return { ok: true, countries_assessed: records.length };
}

// ── 5) Ethical Allocation Principles ──
async function computeEthics(sb: any, params?: any) {
  const { data: habitat } = await sb.from("psre_habitat_quality")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: prosperity } = await sb.from("ceos_prosperity_index")
    .select("*").order("computed_at", { ascending: false }).limit(30);
  const { data: stability } = await sb.from("psre_price_stability")
    .select("*").order("computed_at", { ascending: false }).limit(30);

  const habByCity = new Map<string, any>();
  for (const h of (habitat || [])) { if (!habByCity.has(h.city)) habByCity.set(h.city, h); }
  const prosByCity = new Map<string, any>();
  for (const p of (prosperity || [])) { if (!prosByCity.has(p.city)) prosByCity.set(p.city, p); }
  const stabByCity = new Map<string, any>();
  for (const s of (stability || [])) { if (!stabByCity.has(s.city)) stabByCity.set(s.city, s); }

  const allCities = new Set([...habByCity.keys(), ...prosByCity.keys(), ...stabByCity.keys()]);
  const records: any[] = [];

  for (const city of allCities) {
    const hab = habByCity.get(city);
    const pros = prosByCity.get(city);
    const stab = stabByCity.get(city);

    const regBalance = pros ? Math.min(100, Math.round(pros.wealth_accessibility_score * 0.5 + pros.housing_stability_score * 0.5)) : 50;
    const fairness = stab ? Math.min(100, Math.round(100 - (stab.speculative_heat_index || 0) * 0.5 + (stab.affordable_stock_pct || 0) * 0.5)) : 50;

    const envImpact = hab ? Math.min(100, Math.round(hab.environmental_sustainability_score || 50)) : 50;
    const greenAdoption = Math.round(envImpact * 0.4);
    const carbonIntensity = +(100 - envImpact).toFixed(1);
    const climateResilience = Math.round(envImpact * 0.3);

    const intergenFairness = Math.min(100, Math.round(
      (stab ? (stab.affordable_stock_pct || 0) * 0.4 : 20) +
      (pros ? pros.housing_stability_score * 0.3 : 15) +
      regBalance * 0.3
    ));

    const youthAccess = Math.min(100, Math.round(
      (stab ? Math.max(0, 80 - (stab.median_price_to_income || 8) * 5) : 40) +
      greenAdoption * 0.2
    ));

    const composite = Math.round(
      regBalance * 0.25 + fairness * 0.20 + envImpact * 0.25 + intergenFairness * 0.20 + youthAccess * 0.10
    );

    const tier = composite >= 80 ? "exemplary" : composite >= 60 ? "strong" :
      composite >= 40 ? "standard" : composite >= 20 ? "needs_improvement" : "failing";

    const violations: any[] = [];
    if (stab && stab.speculative_heat_index > 70) violations.push({ type: "excessive_speculation", severity: "high" });
    if (envImpact < 30) violations.push({ type: "environmental_degradation", severity: "moderate" });
    if (youthAccess < 20) violations.push({ type: "youth_exclusion", severity: "high" });

    const remediation: string[] = [];
    if (violations.length > 0) {
      if (stab?.speculative_heat_index > 70) remediation.push("Implement speculation cooling measures");
      if (envImpact < 30) remediation.push("Mandate green building standards for new developments");
      if (youthAccess < 20) remediation.push("Create youth-targeted micro-ownership programs");
    }

    records.push({
      country: "ID", city,
      regional_development_balance_score: regBalance,
      capital_flow_fairness_index: fairness,
      underserved_area_allocation_pct: Math.max(0, Math.round(30 - regBalance * 0.2)),
      environmental_impact_score: envImpact,
      carbon_intensity_per_investment: carbonIntensity,
      green_building_adoption_pct: greenAdoption,
      biodiversity_risk_flag: envImpact < 30,
      climate_resilience_investment_pct: climateResilience,
      intergenerational_fairness_score: intergenFairness,
      housing_affordability_preservation: (stab?.affordable_stock_pct || 0) > 30,
      youth_wealth_access_score: youthAccess,
      ethical_composite_score: composite,
      ethical_tier: tier,
      violations_detected: violations.length,
      violation_details: violations,
      remediation_actions: remediation,
      computed_at: new Date().toISOString(),
    });
  }

  if (records.length) await sb.from("gccf_ethical_allocation").insert(records);
  return { ok: true, ethics_computed: records.length };
}

// ── Dashboard ──
async function getDashboard(sb: any) {
  const [transR, councilR, crisisR, inclR, ethR] = await Promise.all([
    sb.from("gccf_transparency_grid").select("*").order("transparency_score", { ascending: false }).limit(30),
    sb.from("gccf_allocation_councils").select("*").eq("is_active", true).order("total_capital_governed_usd", { ascending: false }),
    sb.from("gccf_crisis_protocol").select("*").order("computed_at", { ascending: false }).limit(20),
    sb.from("gccf_inclusive_participation").select("*").order("inclusion_composite_score", { ascending: false }).limit(20),
    sb.from("gccf_ethical_allocation").select("*").order("ethical_composite_score", { ascending: false }).limit(20),
  ]);

  const trans = transR.data || [], councils = councilR.data || [], crisis = crisisR.data || [];
  const incl = inclR.data || [], eth = ethR.data || [];

  const avgTransparency = trans.length ? Math.round(trans.reduce((s: number, t: any) => s + t.transparency_score, 0) / trans.length) : 0;
  const totalGoverned = councils.reduce((s: number, c: any) => s + (c.total_capital_governed_usd || 0), 0);
  const activeCrises = crisis.filter((c: any) => ["activated", "responding"].includes(c.protocol_status)).length;
  const avgInclusion = incl.length ? Math.round(incl.reduce((s: number, i: any) => s + i.inclusion_composite_score, 0) / incl.length) : 0;
  const avgEthics = eth.length ? Math.round(eth.reduce((s: number, e: any) => s + e.ethical_composite_score, 0) / eth.length) : 0;
  const totalViolations = eth.reduce((s: number, e: any) => s + (e.violations_detected || 0), 0);

  return {
    ok: true,
    data: {
      summary: {
        capital_corridors_mapped: trans.length,
        avg_transparency_score: avgTransparency,
        active_councils: councils.length,
        total_capital_governed_usd: totalGoverned,
        active_crises: activeCrises,
        avg_inclusion_score: avgInclusion,
        avg_ethics_score: avgEthics,
        total_violations: totalViolations,
      },
      transparency: trans,
      councils,
      crisis_protocols: crisis,
      inclusion: incl,
      ethical_allocation: eth,
    },
  };
}
