import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params = {} } = await req.json();
    const json = (d: unknown) => new Response(JSON.stringify({ data: d }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    switch (mode) {
      case "ingest_signals": {
        const { city = "Jakarta", district, signal_source = "platform_analytics" } = params;
        const inquiryVel = 10 + Math.random() * 200;
        const convProb = 0.05 + Math.random() * 0.6;
        const migrationVol = 50000 + Math.random() * 5000000;
        const yieldExp = 4 + Math.random() * 12;
        const strength = (inquiryVel * 0.3 + convProb * 100 * 0.4 + Math.min(100, migrationVol / 50000) * 0.3);

        const { data } = await supabase.from("gcfs_capital_signals").insert({
          signal_source, city, district,
          inquiry_velocity: inquiryVel,
          conversion_probability: convProb,
          capital_migration_volume_usd: migrationVol,
          macro_yield_expectation: yieldExp,
          signal_strength: Math.min(100, strength),
          signal_confidence: 40 + Math.random() * 55,
          flow_direction: migrationVol > 2000000 ? "cross_border" : "inbound",
        }).select().single();
        return json(data);
      }

      case "score_gravity": {
        const { city = "Jakarta", asset_class = "residential" } = params;
        // Pull recent signals for this city
        const { data: signals } = await supabase
          .from("gcfs_capital_signals").select("*")
          .eq("city", city).order("detected_at", { ascending: false }).limit(10);

        const avgStrength = (signals || []).reduce((s, r) => s + (r.signal_strength || 0), 0) / Math.max(1, (signals || []).length);
        const avgConv = (signals || []).reduce((s, r) => s + (r.conversion_probability || 0), 0) / Math.max(1, (signals || []).length);
        const gravity = avgStrength * 0.5 + avgConv * 100 * 0.3 + Math.random() * 20;

        const { data } = await supabase.from("gcfs_opportunity_gravity").insert({
          city, asset_class,
          district: params.district || null,
          gravity_score: Math.min(100, gravity),
          capital_flow_priority: gravity > 70 ? 1 : gravity > 50 ? 2 : 3,
          liquidity_momentum: avgStrength * 0.8,
          yield_forecast_12m: 5 + Math.random() * 15,
          absorption_velocity: 0.5 + Math.random() * 4,
          visibility_rank: gravity > 80 ? 1 : gravity > 60 ? 2 : gravity > 40 ? 3 : 4,
          competing_capital_density: 10 + Math.random() * 80,
          opportunity_window_months: Math.max(3, 24 - gravity * 0.2),
        }).select().single();
        return json(data);
      }

      case "amplify_confidence": {
        const { institution_tier = "family_office" } = params;
        const transparency = 40 + Math.random() * 55;
        const dealPerf = 30 + Math.random() * 60;
        const downsideAcc = 35 + Math.random() * 55;
        const trustMet = transparency > 70 && dealPerf > 50 && downsideAcc > 50;
        const participation = trustMet ? 0.3 + Math.random() * 0.6 : 0.05 + Math.random() * 0.2;

        const phaseMap: Record<string, string> = {
          sovereign_fund: "evaluation", pension_fund: "pilot",
          family_office: "committed", reit: "evaluation",
          hedge_fund: "awareness", private_equity: "pilot",
        };

        const { data } = await supabase.from("gcfs_institutional_confidence").insert({
          institution_tier,
          transparency_score: transparency,
          deal_performance_visibility: dealPerf,
          downside_risk_accuracy: downsideAcc,
          trust_threshold_met: trustMet,
          participation_probability: participation,
          min_ticket_usd: institution_tier === "sovereign_fund" ? 50000000 : institution_tier === "pension_fund" ? 10000000 : 1000000,
          adoption_phase: phaseMap[institution_tier] || "awareness",
          confidence_trend: transparency > 65 ? "rising" : "stable",
        }).select().single();
        return json(data);
      }

      case "reinforce_liquidity": {
        const { market_segment = "jakarta_residential" } = params;
        const throughput = 50 + Math.random() * 500;
        const uncertainty = Math.max(5, 80 - throughput * 0.1);
        const exitDays = Math.max(14, 180 - throughput * 0.25);
        const reinvestVel = throughput * 0.3;
        const pricingAcc = Math.min(95, 40 + throughput * 0.08);
        const authority = Math.min(95, 20 + throughput * 0.1 + pricingAcc * 0.3);
        const multiplier = 1 + (throughput * 0.002) + ((100 - uncertainty) * 0.005);

        const { data } = await supabase.from("gcfs_liquidity_reinforcement").insert({
          market_segment,
          transaction_throughput_monthly: throughput,
          market_uncertainty_index: uncertainty,
          avg_exit_days: exitDays,
          reinvestment_velocity: reinvestVel,
          pricing_discovery_accuracy: pricingAcc,
          platform_authority_score: authority,
          flywheel_multiplier: multiplier,
          loop_iteration: Math.floor(throughput / 50),
          reinforcement_trend: multiplier > 1.5 ? "compounding" : multiplier > 1.1 ? "linear" : "neutral",
        }).select().single();
        return json(data);
      }

      case "assess_centralization": {
        const { metric_name = "deal_origination_share" } = params;

        // Aggregate current state
        const [gravityRes, liquidityRes, confRes] = await Promise.all([
          supabase.from("gcfs_opportunity_gravity").select("gravity_score").order("computed_at", { ascending: false }).limit(20),
          supabase.from("gcfs_liquidity_reinforcement").select("platform_authority_score, flywheel_multiplier").order("measured_at", { ascending: false }).limit(10),
          supabase.from("gcfs_institutional_confidence").select("trust_threshold_met, participation_probability").order("assessed_at", { ascending: false }).limit(10),
        ]);

        const avgGravity = (gravityRes.data || []).reduce((s, r) => s + (r.gravity_score || 0), 0) / Math.max(1, (gravityRes.data || []).length);
        const avgAuthority = (liquidityRes.data || []).reduce((s, r) => s + (r.platform_authority_score || 0), 0) / Math.max(1, (liquidityRes.data || []).length);
        const avgMultiplier = (liquidityRes.data || []).reduce((s, r) => s + (r.flywheel_multiplier || 0), 0) / Math.max(1, (liquidityRes.data || []).length);
        const trustedInst = (confRes.data || []).filter(r => r.trust_threshold_met).length;

        const origShare = Math.min(95, avgGravity * 0.4 + avgAuthority * 0.4 + trustedInst * 5);
        const instDep = Math.min(95, trustedInst * 10 + avgAuthority * 0.3);
        const proximity = Math.min(100, origShare * 0.5 + instDep * 0.3 + avgMultiplier * 10);
        const secondaryEco = Math.floor(proximity / 20);

        const phase = proximity >= 90 ? "gravitational_lock" : proximity >= 70 ? "singular" : proximity >= 50 ? "dominant" : proximity >= 30 ? "concentrating" : "distributed";

        const { data } = await supabase.from("gcfs_centralization_threshold").insert({
          metric_name,
          current_value: origShare,
          tipping_threshold: 75,
          proximity_pct: proximity,
          is_crossed: proximity >= 75,
          platform_origination_share: origShare,
          institutional_dependency_score: instDep,
          secondary_ecosystem_count: secondaryEco,
          centralization_phase: phase,
          milestone_description: phase === "gravitational_lock"
            ? "Capital flywheel singularity achieved — self-reinforcing loop is self-sustaining"
            : `Approaching ${phase} phase — ${Math.round(100 - proximity)}% to next threshold`,
        }).select().single();
        return json(data);
      }

      case "dashboard": {
        const [signals, gravity, confidence, liquidity, centralization] = await Promise.all([
          supabase.from("gcfs_capital_signals").select("*").order("detected_at", { ascending: false }).limit(15),
          supabase.from("gcfs_opportunity_gravity").select("*").order("computed_at", { ascending: false }).limit(15),
          supabase.from("gcfs_institutional_confidence").select("*").order("assessed_at", { ascending: false }).limit(10),
          supabase.from("gcfs_liquidity_reinforcement").select("*").order("measured_at", { ascending: false }).limit(10),
          supabase.from("gcfs_centralization_threshold").select("*").order("assessed_at", { ascending: false }).limit(5),
        ]);

        const avgSignalStrength = (signals.data || []).reduce((s, r) => s + (r.signal_strength || 0), 0) / Math.max(1, (signals.data || []).length);
        const topGravity = (gravity.data || [])[0];
        const avgMultiplier = (liquidity.data || []).reduce((s, r) => s + (r.flywheel_multiplier || 0), 0) / Math.max(1, (liquidity.data || []).length);
        const latestCentral = (centralization.data || [])[0];

        const summary = {
          avg_signal_strength: Math.round(avgSignalStrength),
          top_gravity_city: topGravity?.city || "—",
          top_gravity_score: topGravity?.gravity_score || 0,
          flywheel_multiplier: Math.round(avgMultiplier * 100) / 100,
          centralization_phase: latestCentral?.centralization_phase || "distributed",
          centralization_proximity: latestCentral?.proximity_pct || 0,
          institutions_trusted: (confidence.data || []).filter(c => c.trust_threshold_met).length,
          total_signals: (signals.data || []).length,
        };

        await supabase.from("ai_event_signals").insert({
          event_type: "gcfs_engine_cycle",
          entity_type: "gcfs_dashboard",
          priority_level: "low",
          payload: summary,
        });

        return json({ summary, signals: signals.data, gravity: gravity.data, confidence: confidence.data, liquidity: liquidity.data, centralization: centralization.data });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
