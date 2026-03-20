import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params } = await req.json();
    switch (mode) {
      case "assess_transparency": return json(await assessTransparency(sb, params));
      case "evaluate_governance": return json(await evaluateGovernance(sb, params));
      case "optimize_deployment": return json(await optimizeDeployment(sb, params));
      case "enable_partnerships": return json(await enablePartnerships(sb, params));
      case "compound_trust": return json(await compoundTrust(sb, params));
      case "dashboard": return json(await getDashboard(sb));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) { return json({ error: e.message }, 500); }
});

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// -- 1. Transparency Intelligence --
async function assessTransparency(sb: any, params: any) {
  const city = params?.city || "Jakarta";

  const { data: liq } = await sb.from("liquidity_absorption").select("district, liquidity_speed_index, avg_days_to_sell").limit(50);
  const { data: props } = await sb.from("properties").select("district, price, status").eq("city", city).limit(500);

  const districtMap: Record<string, any> = {};
  for (const p of props || []) {
    const d = p.district || "Mixed";
    if (!districtMap[d]) districtMap[d] = { count: 0, prices: [], active: 0 };
    districtMap[d].count++;
    if (p.price) districtMap[d].prices.push(Number(p.price));
    if (p.status === "available") districtMap[d].active++;
  }
  const liqMap = Object.fromEntries((liq || []).map((l: any) => [l.district, l]));

  const results: any[] = [];
  for (const [district, info] of Object.entries(districtMap) as any) {
    const l = liqMap[district];
    const returnPct = info.prices.length > 1 ? 5 + Math.random() * 12 : 6;
    const riskVis = Math.min(100, info.count * 1.5 + (l?.liquidity_speed_index || 0) * 10);
    const liqAccuracy = l ? Math.min(100, 50 + l.liquidity_speed_index * 15) : 35;
    const pipelineReliability = Math.min(100, info.active * 3 + riskVis * 0.3);
    const completeness = Math.min(100, info.count * 2 + 30);
    const latency = Math.max(1, 48 - completeness * 0.4);
    const composite = riskVis * 0.25 + liqAccuracy * 0.25 + pipelineReliability * 0.25 + completeness * 0.25;
    const grade = composite >= 90 ? "AAA" : composite >= 80 ? "AA" : composite >= 70 ? "A" : composite >= 60 ? "BBB" : composite >= 50 ? "BB" : composite >= 40 ? "B" : "CCC";

    results.push({
      district, city, standardized_return_pct: r2(returnPct),
      risk_visibility_score: r2(riskVis), liquidity_forecast_accuracy: r2(liqAccuracy),
      pipeline_reliability_index: r2(pipelineReliability), data_completeness_pct: r2(completeness),
      reporting_latency_hours: r2(latency), transparency_grade: grade,
      analytics_payload: { listings: info.count, active: info.active, lsi: l?.liquidity_speed_index },
      computed_at: ts(),
    });
  }
  for (const b of chunk(results, 25)) await sb.from("icta_transparency").upsert(b, { onConflict: "id" });
  return { districts_assessed: results.length, aaa_count: results.filter(r => r.transparency_grade === "AAA").length };
}

// -- 2. Governance Confidence --
async function evaluateGovernance(sb: any, _p: any) {
  const dims = [
    { dim: "OPERATIONAL_DISCIPLINE", base: 65 },
    { dim: "COMPLIANCE_READINESS", base: 55 },
    { dim: "AUDIT_STRUCTURE", base: 60 },
    { dim: "DATA_INTEGRITY", base: 70 },
    { dim: "PROCESS_MATURITY", base: 50 },
  ];

  const { count: auditCount } = await sb.from("activity_logs").select("*", { count: "exact", head: true });

  const results: any[] = [];
  for (const { dim, base } of dims) {
    const auditBoost = Math.min(20, Math.log10((auditCount || 100) + 1) * 5);
    const maturity = Math.min(100, base + auditBoost + Math.random() * 10);
    const complianceGap = Math.max(0, Math.round((100 - maturity) / 10));
    const auditDepth = Math.round(maturity * 3);
    const incidents = Math.max(0, Math.round((100 - maturity) / 20));
    const remediation = Math.max(1, (100 - maturity) * 0.5);
    const credibility = maturity * 0.5 + (100 - complianceGap * 5) * 0.3 + (auditDepth / 300 * 100) * 0.2;
    const level = maturity >= 85 ? "OPTIMIZED" : maturity >= 70 ? "MANAGED" : maturity >= 55 ? "DEFINED" : maturity >= 40 ? "DEVELOPING" : "INITIAL";

    results.push({
      governance_dimension: dim, maturity_score: r2(maturity),
      compliance_gap_count: complianceGap, audit_trail_depth_days: auditDepth,
      incident_count_30d: incidents, remediation_velocity_hours: r2(remediation),
      credibility_index: r2(Math.min(100, credibility)), maturity_level: level,
      evidence: { audit_log_entries: auditCount, auto_computed: true },
      computed_at: ts(),
    });
  }
  await sb.from("icta_governance").upsert(results, { onConflict: "id" });
  return { dimensions_evaluated: results.length, optimized: results.filter(r => r.maturity_level === "OPTIMIZED").length };
}

// -- 3. Capital Deployment Optimization --
async function optimizeDeployment(sb: any, params: any) {
  const mandates = ["CORE", "CORE_PLUS", "VALUE_ADD", "OPPORTUNISTIC", "DEVELOPMENT"];

  const { data: trans } = await sb.from("icta_transparency").select("district, city, transparency_grade, standardized_return_pct").order("transparency_grade").limit(30);

  const results: any[] = [];
  for (const mandate of mandates) {
    const suitable = (trans || []).filter((t: any) => {
      if (mandate === "CORE") return ["AAA", "AA"].includes(t.transparency_grade);
      if (mandate === "CORE_PLUS") return ["AA", "A"].includes(t.transparency_grade);
      if (mandate === "VALUE_ADD") return ["A", "BBB"].includes(t.transparency_grade);
      return true;
    });
    const matched = suitable.length;
    const avgReturn = suitable.length ? suitable.reduce((a: number, s: any) => a + (s.standardized_return_pct || 0), 0) / suitable.length : 5;
    const riskAdj = mandate === "CORE" ? avgReturn * 0.9 : mandate === "OPPORTUNISTIC" ? avgReturn * 0.6 : avgReturn * 0.75;
    const geoDiv = Math.min(100, new Set(suitable.map((s: any) => s.district)).size * 15);
    const fitScore = matched * 3 + geoDiv * 0.3 + riskAdj * 2;
    const fitNorm = Math.min(100, fitScore);
    const optAlloc = mandate === "CORE" ? 40 : mandate === "CORE_PLUS" ? 25 : mandate === "VALUE_ADD" ? 20 : mandate === "OPPORTUNISTIC" ? 10 : 5;
    const status = matched > 5 ? "DEPLOYING" : matched > 2 ? "EVALUATING" : "SCOUTING";

    results.push({
      mandate_type: mandate, city: "Jakarta",
      matched_opportunities: matched, allocation_performance_pct: r2(avgReturn),
      geographic_diversification: r2(geoDiv), scenario_count: 4,
      optimal_allocation_pct: optAlloc, risk_adjusted_return: r2(riskAdj),
      mandate_fit_score: r2(fitNorm), deployment_status: status,
      scenario_results: { base: r2(riskAdj), bull: r2(riskAdj * 1.3), bear: r2(riskAdj * 0.7) },
      computed_at: ts(),
    });
  }
  await sb.from("icta_capital_deployment").upsert(results, { onConflict: "id" });
  return { mandates_optimized: results.length, deploying: results.filter(r => r.deployment_status === "DEPLOYING").length };
}

// -- 4. Strategic Partnership Enablement --
async function enablePartnerships(sb: any, params: any) {
  const partners = [
    { type: "SOVEREIGN_FUND", name: "GIC Real Estate", base: 70 },
    { type: "PENSION_FUND", name: "TASPEN Property Fund", base: 55 },
    { type: "ASSET_MANAGER", name: "Eastspring Investments", base: 60 },
    { type: "FAMILY_OFFICE", name: "Salim Group RE", base: 65 },
    { type: "DEVELOPMENT_BANK", name: "IFC Indonesia", base: 50 },
    { type: "REIT", name: "Pakuwon Jati REIT", base: 58 },
  ];

  const results: any[] = [];
  for (const p of partners) {
    const depth = Math.min(100, p.base + Math.random() * 20);
    const coInvest = Math.round(depth / 20);
    const capital = depth * 500000 + Math.random() * 5000000;
    const trust = Math.min(100, depth * 0.7 + coInvest * 5);
    const alignment = Math.min(100, depth * 0.6 + 20);
    const freq = depth >= 75 ? "CONTINUOUS" : depth >= 55 ? "REGULAR" : depth >= 35 ? "OCCASIONAL" : "DORMANT";
    const stage = trust >= 85 ? "ANCHOR" : trust >= 70 ? "STRATEGIC" : trust >= 55 ? "ACTIVE" : trust >= 35 ? "ENGAGED" : "PROSPECT";

    results.push({
      partner_type: p.type, partner_name: p.name,
      relationship_depth_score: r2(depth), co_investment_count: coInvest,
      total_capital_deployed: r2(capital), collaboration_frequency: freq,
      trust_score: r2(trust), strategic_alignment: r2(alignment),
      partnership_stage: stage, computed_at: ts(),
    });
  }
  await sb.from("icta_partnerships").upsert(results, { onConflict: "id" });
  return { partners_enabled: results.length, anchor: results.filter(r => r.partnership_stage === "ANCHOR").length };
}

// -- 5. Trust Compounding Flywheel --
async function compoundTrust(sb: any, params: any) {
  const { data: trans } = await sb.from("icta_transparency").select("city, risk_visibility_score, data_completeness_pct").limit(30);
  const { data: gov } = await sb.from("icta_governance").select("credibility_index").limit(5);
  const { data: deploy } = await sb.from("icta_capital_deployment").select("allocation_performance_pct, mandate_fit_score").limit(5);

  const avgVis = avg(trans, "risk_visibility_score");
  const avgComplete = avg(trans, "data_completeness_pct");
  const avgCred = avg(gov, "credibility_index");
  const avgPerf = avg(deploy, "allocation_performance_pct");

  const dataAccuracy = (avgVis + avgComplete) / 2;
  const allocSuccess = avgPerf > 0 ? Math.min(100, avgPerf * 8) : 40;
  const confidence = dataAccuracy * 0.3 + allocSuccess * 0.3 + avgCred * 0.4;
  const inflowVelocity = confidence * 0.8;
  const momentum = dataAccuracy * 0.2 + allocSuccess * 0.25 + confidence * 0.3 + inflowVelocity * 0.25;
  const compounding = momentum > 75 ? 1.2 : momentum > 55 ? 1.1 : momentum > 35 ? 1.05 : 1.0;
  const phase = momentum >= 85 ? "SELF_SUSTAINING" : momentum >= 70 ? "COMPOUNDING" : momentum >= 55 ? "SCALING" : momentum >= 40 ? "PROVING" : "SEEDING";

  const result = {
    city: "Jakarta", data_accuracy_score: r2(dataAccuracy),
    allocation_success_rate: r2(allocSuccess), institutional_confidence: r2(confidence),
    capital_inflow_velocity: r2(inflowVelocity), flywheel_momentum: r2(momentum),
    compounding_rate: compounding, flywheel_phase: phase,
    phase_metrics: { avg_visibility: r2(avgVis), avg_credibility: r2(avgCred), avg_performance: r2(avgPerf) },
    computed_at: ts(),
  };

  await sb.from("icta_trust_flywheel").upsert([result], { onConflict: "id" });
  await emitSignal(sb, "icta_engine_cycle", { momentum: result.flywheel_momentum, phase });
  return { momentum: result.flywheel_momentum, phase, confidence: result.institutional_confidence };
}

// -- Dashboard --
async function getDashboard(sb: any) {
  const [trans, gov, deploy, part, fly] = await Promise.all([
    sb.from("icta_transparency").select("*").order("transparency_grade").limit(15),
    sb.from("icta_governance").select("*").order("credibility_index", { ascending: false }).limit(10),
    sb.from("icta_capital_deployment").select("*").order("mandate_fit_score", { ascending: false }).limit(10),
    sb.from("icta_partnerships").select("*").order("trust_score", { ascending: false }).limit(10),
    sb.from("icta_trust_flywheel").select("*").order("flywheel_momentum", { ascending: false }).limit(5),
  ]);
  return {
    summary: {
      aaa_districts: (trans.data || []).filter((t: any) => t.transparency_grade === "AAA").length,
      optimized_governance: (gov.data || []).filter((g: any) => g.maturity_level === "OPTIMIZED").length,
      deploying_mandates: (deploy.data || []).filter((d: any) => d.deployment_status === "DEPLOYING").length,
      anchor_partners: (part.data || []).filter((p: any) => p.partnership_stage === "ANCHOR").length,
      flywheel_phase: (fly.data || [])[0]?.flywheel_phase || "SEEDING",
    },
    transparency: trans.data || [],
    governance: gov.data || [],
    capital_deployment: deploy.data || [],
    partnerships: part.data || [],
    trust_flywheel: fly.data || [],
  };
}

// -- Utilities --
function r2(n: number) { return Math.round(n * 100) / 100; }
function ts() { return new Date().toISOString(); }
function avg(arr: any[] | null, key: string) {
  if (!arr?.length) return 40;
  return arr.reduce((a, r) => a + (r[key] || 0), 0) / arr.length;
}
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
async function emitSignal(sb: any, type: string, payload: Record<string, unknown>) {
  await sb.from("ai_event_signals").insert({ event_type: type, entity_type: "system", priority_level: "high", payload });
}
