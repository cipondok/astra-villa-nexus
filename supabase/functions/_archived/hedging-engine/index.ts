import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CITIES = ["Jakarta", "Surabaya", "Bandung", "Bali", "Medan", "Yogyakarta", "Makassar", "Semarang", "Tangerang", "Bekasi"];
const PROPERTY_TYPES = ["rumah", "apartemen", "ruko", "tanah", "villa", "kost"];
const PRICE_TIERS = ["budget", "mid-range", "premium", "luxury"];
const CYCLE_PHASES = ["expansion", "peak", "contraction", "trough", "recovery"];
const STRATEGY_TYPES = ["diversify", "rotate", "delay", "buffer", "reduce"];
const STRESS_SCENARIOS = ["interest_rate_spike", "recession", "currency_crash", "policy_shock", "liquidity_freeze"];

function rand(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pipeline = "full_hedge" } = await req.json().catch(() => ({}));
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: Record<string, unknown> = {};

    // --- MACRO RISK ---
    if (pipeline === "macro_risk" || pipeline === "full_hedge") {
      await sb.from("hedging_macro_risk").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = CITIES.map(city => {
        const interestRate = rand(10, 85);
        const inflation = rand(5, 80);
        const currency = rand(5, 70);
        const construction = rand(10, 75);
        const capitalFlow = rand(5, 65);
        const policy = rand(5, 80);
        const pressure = Math.round((interestRate * 0.25 + inflation * 0.2 + currency * 0.15 + construction * 0.15 + capitalFlow * 0.1 + policy * 0.15));
        return {
          city,
          interest_rate_risk: interestRate,
          inflation_momentum: inflation,
          currency_volatility: currency,
          construction_cost_trend: construction,
          capital_flow_shift: capitalFlow,
          policy_tightening_risk: policy,
          macro_risk_pressure_index: pressure,
          cycle_phase: pick(CYCLE_PHASES),
          capital_flight_probability: rand(2, 45),
        };
      });
      const { error } = await sb.from("hedging_macro_risk").insert(rows);
      if (error) throw error;
      results.macro_risk = { count: rows.length };
    }

    // --- PORTFOLIO EXPOSURE ---
    if (pipeline === "portfolio_exposure" || pipeline === "full_hedge") {
      await sb.from("hedging_portfolio_exposure").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows: any[] = [];
      CITIES.forEach(city => {
        const types = PROPERTY_TYPES.slice(0, Math.floor(Math.random() * 3) + 2);
        types.forEach(pt => {
          const tier = pick(PRICE_TIERS);
          const alloc = rand(3, 35);
          const overexposure = alloc > 25;
          rows.push({
            city,
            property_type: pt,
            price_tier: tier,
            allocation_pct: alloc,
            overexposure_flag: overexposure,
            geo_concentration_risk: rand(10, 90),
            strategy_imbalance_score: rand(5, 75),
            vulnerability_score: rand(10, 85),
          });
        });
      });
      const { error } = await sb.from("hedging_portfolio_exposure").insert(rows);
      if (error) throw error;
      results.portfolio_exposure = { count: rows.length };
    }

    // --- HEDGING STRATEGIES ---
    if (pipeline === "hedging_strategies" || pipeline === "full_hedge") {
      await sb.from("hedging_strategies").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const descriptions: Record<string, string[]> = {
        diversify: ["Add 2-3 properties in underweighted cities", "Include commercial assets for income stability", "Balance residential/commercial mix to 60/40"],
        rotate: ["Shift 15% from overheated Jakarta to Bandung", "Move villa allocation to apartment for yield", "Rotate luxury to mid-range for liquidity"],
        delay: ["Defer purchases in peak-cycle cities 6-12 months", "Wait for rate stabilization before Bali entry", "Pause expansion until policy clarity emerges"],
        buffer: ["Maintain 20% cash reserve for opportunistic buys", "Allocate 10% to fixed deposits as hedge", "Keep 15% liquid for drawdown protection"],
        reduce: ["Trim overexposed Jakarta portfolio by 10%", "Reduce speculative tanah holdings", "Exit low-yield kost in secondary cities"],
      };
      const rows: any[] = [];
      let rank = 1;
      CITIES.slice(0, 6).forEach(city => {
        const strats = STRATEGY_TYPES.slice(0, Math.floor(Math.random() * 3) + 2);
        strats.forEach(st => {
          rows.push({
            city,
            strategy_type: st,
            action_description: pick(descriptions[st]),
            risk_reduction_pct: rand(5, 35),
            capital_preservation_prob: rand(55, 95),
            risk_adjusted_return_improvement: rand(1, 12),
            priority_rank: rank++,
          });
        });
      });
      const { error } = await sb.from("hedging_strategies").insert(rows);
      if (error) throw error;
      results.hedging_strategies = { count: rows.length };
    }

    // --- DOWNSIDE PROTECTION ---
    if (pipeline === "downside_protection" || pipeline === "full_hedge") {
      await sb.from("hedging_downside_protection").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows: any[] = [];
      CITIES.forEach(city => {
        PROPERTY_TYPES.slice(0, 3).forEach(pt => {
          const maxDD = rand(8, 40);
          const recovery = rand(12, 60);
          const resilience = Math.max(0, Math.min(100, Math.round(100 - maxDD * 1.5 - rand(0, 10))));
          rows.push({
            city,
            property_type: pt,
            max_drawdown_pct: maxDD,
            time_to_recovery_months: recovery,
            income_decline_prob: rand(5, 55),
            forced_liquidation_risk: rand(3, 35),
            downside_resilience_index: resilience,
            recovery_horizon_score: Math.max(0, Math.min(100, Math.round(100 - recovery * 1.2))),
          });
        });
      });
      const { error } = await sb.from("hedging_downside_protection").insert(rows);
      if (error) throw error;
      results.downside_protection = { count: rows.length };
    }

    // --- SAFE HAVENS ---
    if (pipeline === "safe_havens" || pipeline === "full_hedge") {
      await sb.from("hedging_safe_havens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = CITIES.map((city, i) => {
        const defensive = rand(30, 95);
        const rental = rand(40, 92);
        const policy = rand(25, 90);
        const infra = rand(20, 88);
        const capital = Math.round((defensive * 0.3 + rental * 0.25 + policy * 0.2 + infra * 0.25));
        return {
          city,
          defensive_score: defensive,
          rental_stability: rental,
          policy_protection_score: policy,
          infra_backed_growth: infra,
          capital_protection_score: capital,
          safe_haven_rank: i + 1,
          recommended_allocation_pct: rand(5, 25),
        };
      });
      // Sort by capital_protection_score desc and assign ranks
      rows.sort((a, b) => b.capital_protection_score - a.capital_protection_score);
      rows.forEach((r, i) => { r.safe_haven_rank = i + 1; });

      const { error } = await sb.from("hedging_safe_havens").insert(rows);
      if (error) throw error;
      results.safe_havens = { count: rows.length };
    }

    return new Response(JSON.stringify({ success: true, pipeline, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("hedging-engine error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
