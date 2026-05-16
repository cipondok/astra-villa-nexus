import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();

    // ── Dashboard ──
    if (mode === "dashboard") {
      const [cycles, momentum, alloc, timing, feedback] = await Promise.all([
        sb.from("cdte_cycle_phases").select("*").order("detected_at", { ascending: false }).limit(20),
        sb.from("cdte_liquidity_momentum").select("*").order("momentum_composite", { ascending: false }).limit(20),
        sb.from("cdte_allocation_strategy").select("*").order("computed_at", { ascending: false }).limit(15),
        sb.from("cdte_growth_timing").select("*").order("window_confidence", { ascending: false }).limit(15),
        sb.from("cdte_feedback_loop").select("*").order("evaluated_at", { ascending: false }).limit(10),
      ]);

      const c = cycles.data || []; const m = momentum.data || []; const a = alloc.data || [];
      const t = timing.data || []; const f = feedback.data || [];

      return json({
        summary: {
          cities_tracked: c.length,
          early_growth: c.filter((x: any) => x.cycle_phase === "early_growth").length,
          peak_markets: c.filter((x: any) => x.cycle_phase === "peak").length,
          correction_markets: c.filter((x: any) => x.cycle_phase === "correction").length,
          strong_buy_signals: m.filter((x: any) => x.signal_strength === "strong_buy").length,
          avg_momentum: m.length ? +(m.reduce((s: number, x: any) => s + (x.momentum_composite || 0), 0) / m.length).toFixed(1) : 0,
          deploy_now_windows: t.filter((x: any) => x.timing_window === "deploy_now").length,
          avg_timing_accuracy: f.length ? +(f.reduce((s: number, x: any) => s + (x.timing_accuracy_score || 0), 0) / f.length).toFixed(1) : 0,
          feedback_iterations: f.length ? Math.max(...f.map((x: any) => x.feedback_iteration || 0)) : 0,
        },
        cycle_phases: c,
        liquidity_momentum: m,
        allocation_strategy: a,
        growth_timing: t,
        feedback_loop: f,
      });
    }

    // ── Detect Cycle Phases ──
    if (mode === "detect_cycles") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan", "Makassar", "Semarang", "Yogyakarta"];
      const phases = ["early_growth", "expansion", "peak", "correction", "consolidation", "recovery"];
      const rows: any[] = [];

      for (const city of cities) {
        const growth = -5 + Math.random() * 30;
        const valMult = 3 + Math.random() * 15;
        const priceMom = -20 + Math.random() * 60;
        const phaseIdx = growth >= 20 ? 1 : growth >= 12 ? 2 : growth >= 5 ? 0 : growth >= -2 ? 4 : growth >= -8 ? 3 : 5;
        const phase = phases[phaseIdx];
        const volTrend = growth >= 15 ? "accelerating" : growth >= 5 ? "stable" : growth >= -5 ? "decelerating" : "contracting";

        rows.push({
          city, country: params.country || "Indonesia",
          cycle_phase: phase,
          phase_confidence: +(60 + Math.random() * 35).toFixed(1),
          growth_rate_pct: +growth.toFixed(2),
          valuation_multiple: +valMult.toFixed(1),
          price_momentum: +priceMom.toFixed(1),
          volume_trend: volTrend,
          months_in_phase: Math.floor(2 + Math.random() * 24),
          estimated_phase_remaining: Math.floor(3 + Math.random() * 18),
          leading_indicators: { gdp_growth: +(3 + Math.random() * 5).toFixed(1), construction_permits: Math.floor(100 + Math.random() * 2000), fdi_trend: growth > 10 ? "rising" : "flat" },
        });
      }

      const { error } = await sb.from("cdte_cycle_phases").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "cdte_engine_cycle", entity_type: "cdte", priority_level: "medium", payload: { mode, cities: cities.length } });

      const earlyGrowth = rows.filter(r => r.cycle_phase === "early_growth").length;
      return json({ cities_analyzed: rows.length, early_growth: earlyGrowth, peak: rows.filter(r => r.cycle_phase === "peak").length, top_opportunity: rows.sort((a, b) => b.growth_rate_pct - a.growth_rate_pct)[0]?.city });
    }

    // ── Compute Liquidity Momentum ──
    if (mode === "compute_momentum") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan", "Makassar"];
      const rows: any[] = [];

      for (const city of cities) {
        const txVel = 10 + Math.random() * 90;
        const sentiment = 20 + Math.random() * 80;
        const inflow = Math.floor(1e6 + Math.random() * 50e6);
        const concentration = 10 + Math.random() * 60;
        const absorption = 20 + Math.random() * 70;
        const dom = Math.floor(15 + Math.random() * 120);
        const spread = 2 + Math.random() * 15;
        const composite = txVel * 0.25 + sentiment * 0.2 + (absorption) * 0.2 + (100 - spread * 3) * 0.15 + concentration * 0.2;
        const signal = composite >= 75 ? "strong_buy" : composite >= 60 ? "buy" : composite >= 40 ? "neutral" : composite >= 25 ? "caution" : "strong_sell";
        const velTrend = txVel >= 70 ? "surging" : txVel >= 50 ? "accelerating" : txVel >= 30 ? "stable" : txVel >= 15 ? "decelerating" : "collapsing";

        rows.push({
          city, country: params.country || "Indonesia",
          transaction_velocity: +txVel.toFixed(1),
          velocity_trend: velTrend,
          investor_sentiment_score: +sentiment.toFixed(1),
          capital_inflow_usd: inflow,
          inflow_concentration_pct: +concentration.toFixed(1),
          absorption_rate_pct: +absorption.toFixed(1),
          days_on_market_avg: dom,
          bid_ask_spread_pct: +spread.toFixed(2),
          momentum_composite: +composite.toFixed(1),
          signal_strength: signal,
        });
      }

      const { error } = await sb.from("cdte_liquidity_momentum").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "cdte_engine_cycle", entity_type: "cdte", priority_level: "medium", payload: { mode, cities: cities.length } });

      return json({ cities_computed: rows.length, strong_buy: rows.filter(r => r.signal_strength === "strong_buy").length, avg_momentum: +(rows.reduce((s, r) => s + r.momentum_composite, 0) / rows.length).toFixed(1) });
    }

    // ── Simulate Allocation ──
    if (mode === "simulate_allocation") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan"];
      const rows: any[] = [];

      for (const city of cities) {
        const totalDeploy = Math.floor(500000 + Math.random() * 5e6);
        const deployed = Math.floor(totalDeploy * (0.3 + Math.random() * 0.6));
        const efficiency = +(deployed / totalDeploy * 100).toFixed(1);
        const roiProj = +(5 + Math.random() * 25).toFixed(1);

        let growthPct = 30 + Math.random() * 40;
        let infraPct = 15 + Math.random() * 25;
        let partnerPct = 10 + Math.random() * 20;
        let reservePct = 100 - growthPct - infraPct - partnerPct;
        if (reservePct < 0) { growthPct -= Math.abs(reservePct); reservePct = 5; }

        const phase = growthPct >= 50 ? "aggressive_expansion" : growthPct >= 35 ? "growth" : reservePct >= 30 ? "defensive" : "balanced";

        rows.push({
          city, country: params.country || "Indonesia",
          allocation_phase: phase,
          growth_allocation_pct: +growthPct.toFixed(1),
          infrastructure_allocation_pct: +infraPct.toFixed(1),
          partnership_allocation_pct: +partnerPct.toFixed(1),
          reserve_allocation_pct: +reservePct.toFixed(1),
          total_deployable_usd: totalDeploy,
          deployed_usd: deployed,
          deployment_efficiency: efficiency,
          roi_projection_pct: roiProj,
          risk_tolerance: phase === "aggressive_expansion" ? "aggressive" : phase === "defensive" ? "conservative" : "moderate",
          strategy_rationale: `${phase} strategy for ${city}: ${growthPct.toFixed(0)}% growth, ${reservePct.toFixed(0)}% reserve`,
        });
      }

      const { error } = await sb.from("cdte_allocation_strategy").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "cdte_engine_cycle", entity_type: "cdte", priority_level: "medium", payload: { mode, cities: cities.length } });

      return json({ cities_allocated: rows.length, avg_efficiency: +(rows.reduce((s, r) => s + r.deployment_efficiency, 0) / rows.length).toFixed(1), avg_roi: +(rows.reduce((s, r) => s + r.roi_projection_pct, 0) / rows.length).toFixed(1) });
    }

    // ── Assess Growth Timing ──
    if (mode === "assess_timing") {
      const cities = params.cities || ["Jakarta", "Surabaya", "Bali", "Bandung", "Medan", "Makassar"];
      const rows: any[] = [];

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const expansion = 30 + Math.random() * 70;
        const downside = 40 + Math.random() * 60;
        const capEff = 0.5 + Math.random() * 2.5;
        const riskReward = 0.5 + Math.random() * 4;
        const volReturn = 5 + Math.random() * 20;
        const drawdown = 3 + Math.random() * 25;
        const windowScore = expansion * 0.3 + downside * 0.2 + riskReward * 10 + (100 - drawdown * 2) * 0.2;
        const window = windowScore >= 70 ? "deploy_now" : windowScore >= 55 ? "deploy_soon" : windowScore >= 40 ? "hold" : windowScore >= 25 ? "reduce" : "exit";

        rows.push({
          city, country: params.country || "Indonesia",
          expansion_readiness: +expansion.toFixed(1),
          downside_protection_score: +downside.toFixed(1),
          regional_sequence_rank: i + 1,
          capital_efficiency_ratio: +capEff.toFixed(2),
          risk_reward_ratio: +riskReward.toFixed(2),
          timing_window: window,
          window_confidence: +(55 + Math.random() * 40).toFixed(1),
          max_deployment_pct: window === "deploy_now" ? 80 : window === "deploy_soon" ? 50 : window === "hold" ? 20 : 5,
          volatility_adjusted_return: +volReturn.toFixed(2),
          drawdown_risk_pct: +drawdown.toFixed(1),
          optimal_horizon_months: Math.floor(6 + Math.random() * 36),
          timing_factors: { macro: "favorable", regulation: "stable", competition: riskReward > 2 ? "low" : "moderate" },
        });
      }

      const { error } = await sb.from("cdte_growth_timing").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "cdte_engine_cycle", entity_type: "cdte", priority_level: "medium", payload: { mode, cities: cities.length } });

      return json({ cities_assessed: rows.length, deploy_now: rows.filter(r => r.timing_window === "deploy_now").length, avg_risk_reward: +(rows.reduce((s, r) => s + r.risk_reward_ratio, 0) / rows.length).toFixed(2) });
    }

    // ── Run Feedback Loop ──
    if (mode === "run_feedback") {
      const iterations = params.iterations || 5;
      const rows: any[] = [];

      for (let i = 1; i <= iterations; i++) {
        const predicted = 8 + Math.random() * 20;
        const actual = predicted * (0.6 + Math.random() * 0.8);
        const error_pct = Math.abs(predicted - actual) / predicted * 100;
        const accuracy = Math.max(0, 100 - error_pct * 2);
        const velocity = Math.min(100, accuracy * (1 + i * 0.05));

        rows.push({
          city: params.city || "Jakarta",
          country: params.country || "Indonesia",
          predicted_roi_pct: +predicted.toFixed(2),
          actual_roi_pct: +actual.toFixed(2),
          prediction_error_pct: +error_pct.toFixed(2),
          timing_accuracy_score: +accuracy.toFixed(1),
          market_condition_at_deploy: ["early_growth", "expansion", "peak", "correction"][Math.floor(Math.random() * 4)],
          market_condition_at_outcome: ["expansion", "peak", "correction", "recovery"][Math.floor(Math.random() * 4)],
          lessons_learned: accuracy >= 80 ? "Model calibration on track" : accuracy >= 60 ? "Adjust momentum weighting" : "Significant recalibration needed",
          model_adjustment: { momentum_weight_delta: +(-0.05 + Math.random() * 0.1).toFixed(3), cycle_lag_correction: Math.floor(Math.random() * 3) },
          feedback_iteration: i,
          learning_velocity: +velocity.toFixed(1),
          scenario_simulation: { bull_case_roi: +(actual * 1.3).toFixed(1), bear_case_roi: +(actual * 0.7).toFixed(1), base_case_roi: +actual.toFixed(1) },
        });
      }

      const { error } = await sb.from("cdte_feedback_loop").upsert(rows, { onConflict: "id" });
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "cdte_engine_cycle", entity_type: "cdte", priority_level: "medium", payload: { mode, iterations } });

      return json({ iterations_completed: rows.length, avg_accuracy: +(rows.reduce((s, r) => s + r.timing_accuracy_score, 0) / rows.length).toFixed(1), learning_velocity: rows[rows.length - 1]?.learning_velocity });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
