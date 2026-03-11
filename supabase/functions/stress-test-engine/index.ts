import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CITIES = ["Jakarta","Surabaya","Bandung","Bali","Medan","Yogyakarta","Makassar","Semarang","Tangerang","Bekasi"];
const PROP_TYPES = ["rumah","apartemen","ruko","tanah","villa","kost"];
const SCENARIO_DEFS = [
  { name: "Global Recession 2026", type: "global_recession", desc: "Synchronized global GDP contraction triggered by trade wars and monetary tightening" },
  { name: "Property Market Crash", type: "property_crash", desc: "Rapid 30-40% decline in residential values due to speculative bubble burst" },
  { name: "Interest Rate Shock", type: "rate_shock", desc: "Central bank emergency rate hike of 300-500 bps within 6 months" },
  { name: "Currency Crisis (IDR)", type: "currency_crisis", desc: "IDR depreciation of 25-40% against USD triggering capital flight" },
  { name: "Political Instability", type: "political_instability", desc: "Regional governance disruption causing investor confidence collapse" },
  { name: "Construction Cost Explosion", type: "construction_shock", desc: "Raw material costs surge 60-80% due to supply chain breakdown" },
  { name: "Tourism Demand Collapse", type: "tourism_collapse", desc: "International tourism drops 70%+ impacting hospitality real estate" },
];
const DECISIONS = ["hold","sell","refinance","rotate","reallocate"];
const STRATEGY_TYPES = ["asset_rotation","safe_reallocation","capital_preservation","restructuring","opportunistic"];
const REINVEST_SIGNALS = ["buy_now","accumulate","wait","avoid","monitor"];

function rand(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pipeline = "full_stress" } = await req.json().catch(() => ({}));
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const results: Record<string, unknown> = {};
    const DEL = "00000000-0000-0000-0000-000000000000";

    // --- SCENARIOS ---
    let scenarioIds: Record<string, string> = {};
    if (pipeline === "scenarios" || pipeline === "full_stress") {
      await sb.from("stress_crisis_strategies").delete().neq("id", DEL);
      await sb.from("stress_recovery_forecasts").delete().neq("id", DEL);
      await sb.from("stress_survival_scores").delete().neq("id", DEL);
      await sb.from("stress_portfolio_projections").delete().neq("id", DEL);
      await sb.from("stress_scenarios").delete().neq("id", DEL);

      const rows = SCENARIO_DEFS.map(s => ({
        scenario_name: s.name,
        scenario_type: s.type,
        severity_score: rand(55, 98),
        shock_duration_months: randInt(6, 36),
        geographic_impact_probability: rand(30, 95),
        liquidity_freeze_risk: rand(20, 85),
        description: s.desc,
        trigger_factors: [s.type, "macro_shift", "policy_change"],
        affected_cities: CITIES.slice(0, randInt(4, 10)),
      }));
      const { data, error } = await sb.from("stress_scenarios").insert(rows).select("id, scenario_type");
      if (error) throw error;
      data?.forEach((d: any) => { scenarioIds[d.scenario_type] = d.id; });
      results.scenarios = { count: rows.length };
    } else {
      const { data } = await sb.from("stress_scenarios").select("id, scenario_type");
      data?.forEach((d: any) => { scenarioIds[d.scenario_type] = d.id; });
    }

    const scIds = Object.values(scenarioIds);

    // --- PORTFOLIO PROJECTIONS ---
    if (pipeline === "projections" || pipeline === "full_stress") {
      if (pipeline !== "full_stress") await sb.from("stress_portfolio_projections").delete().neq("id", DEL);
      const rows: any[] = [];
      let rank = 1;
      scIds.forEach(sid => {
        CITIES.slice(0, 6).forEach(city => {
          PROP_TYPES.slice(0, 3).forEach(pt => {
            const valDecline = rand(8, 45);
            rows.push({
              scenario_id: sid,
              city,
              property_type: pt,
              value_decline_pct: valDecline,
              rental_contraction_pct: rand(5, 40),
              transaction_volume_drop_pct: rand(20, 80),
              time_to_market_months: rand(3, 24),
              loss_containment_prob: Math.max(10, Math.min(95, Math.round(100 - valDecline * 1.5))),
              cash_flow_stress_months: randInt(3, 18),
              risk_exposure_rank: rank++,
            });
          });
        });
      });
      // Chunk inserts
      for (let i = 0; i < rows.length; i += 50) {
        const { error } = await sb.from("stress_portfolio_projections").insert(rows.slice(i, i + 50));
        if (error) throw error;
      }
      results.projections = { count: rows.length };
    }

    // --- SURVIVAL SCORES ---
    if (pipeline === "survival" || pipeline === "full_stress") {
      if (pipeline !== "full_stress") await sb.from("stress_survival_scores").delete().neq("id", DEL);
      const actions = [
        "Increase cash reserves to 25% of portfolio value",
        "Reduce leverage ratio below 50%",
        "Diversify into defensive assets (kost, apartemen)",
        "Hedge currency exposure with USD-denominated assets",
        "Refinance variable-rate mortgages to fixed",
        "Exit speculative tanah positions",
        "Maintain 12-month operating expense buffer",
      ];
      const rows: any[] = [];
      scIds.forEach(sid => {
        CITIES.slice(0, 6).forEach(city => {
          PROP_TYPES.slice(0, 3).forEach(pt => {
            const survival = rand(25, 92);
            rows.push({
              scenario_id: sid,
              city,
              property_type: pt,
              survival_index: survival,
              min_capital_buffer_pct: rand(10, 35),
              forced_liquidation_prob: Math.max(2, Math.min(60, Math.round(100 - survival))),
              debt_servicing_risk: rand(10, 75),
              emergency_liquidity_months: randInt(3, 18),
              priority_actions: [pick(actions), pick(actions), pick(actions)],
            });
          });
        });
      });
      for (let i = 0; i < rows.length; i += 50) {
        const { error } = await sb.from("stress_survival_scores").insert(rows.slice(i, i + 50));
        if (error) throw error;
      }
      results.survival = { count: rows.length };
    }

    // --- RECOVERY FORECASTS ---
    if (pipeline === "recovery" || pipeline === "full_stress") {
      if (pipeline !== "full_stress") await sb.from("stress_recovery_forecasts").delete().neq("id", DEL);
      const rows: any[] = [];
      let rank = 1;
      scIds.forEach(sid => {
        CITIES.forEach(city => {
          rows.push({
            scenario_id: sid,
            city,
            recovery_horizon_months: randInt(12, 60),
            appreciation_recovery_pct: rand(60, 110),
            rental_normalization_months: randInt(6, 36),
            post_crisis_opportunity_rank: rank++,
            reinvestment_signal: pick(REINVEST_SIGNALS),
            hotspot_emergence_score: rand(20, 95),
          });
        });
      });
      for (let i = 0; i < rows.length; i += 50) {
        const { error } = await sb.from("stress_recovery_forecasts").insert(rows.slice(i, i + 50));
        if (error) throw error;
      }
      results.recovery = { count: rows.length };
    }

    // --- CRISIS STRATEGIES ---
    if (pipeline === "strategies" || pipeline === "full_stress") {
      if (pipeline !== "full_stress") await sb.from("stress_crisis_strategies").delete().neq("id", DEL);
      const actionDescs: Record<string, string[]> = {
        hold: ["Maintain position — fundamentals remain intact despite volatility", "Hold for recovery cycle — rental income covers carrying costs"],
        sell: ["Exit before further deterioration — reallocate to safe havens", "Liquidate underperforming assets to build cash buffer"],
        refinance: ["Lock in current rates before further hikes", "Restructure debt to extend maturity and reduce monthly burden"],
        rotate: ["Shift from speculative tanah to income-generating apartemen", "Rotate luxury villa to mid-range rumah for stability"],
        reallocate: ["Move 20% allocation to defensive markets (Yogyakarta, Semarang)", "Diversify into infrastructure-backed corridors"],
      };
      const rows: any[] = [];
      let priority = 1;
      scIds.forEach(sid => {
        CITIES.slice(0, 6).forEach(city => {
          const dec = pick(DECISIONS);
          rows.push({
            scenario_id: sid,
            city,
            decision: dec,
            strategy_type: pick(STRATEGY_TYPES),
            action_description: pick(actionDescs[dec]),
            capital_preservation_score: rand(40, 95),
            restructuring_priority: priority++,
            defensive_allocation_pct: rand(10, 45),
          });
        });
      });
      for (let i = 0; i < rows.length; i += 50) {
        const { error } = await sb.from("stress_crisis_strategies").insert(rows.slice(i, i + 50));
        if (error) throw error;
      }
      results.strategies = { count: rows.length };
    }

    return new Response(JSON.stringify({ success: true, pipeline, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stress-test-engine error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
