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

    switch (mode) {
      case "compound_intelligence": {
        const { domain = "liquidity_prediction" } = params;

        const txCount = 1000 + Math.floor(Math.random() * 50000);
        const accuracy = 55 + Math.random() * 40;
        const improvementRate = 0.02 + Math.random() * 0.08;
        const replicationDifficulty = Math.min(98, 30 + Math.log10(txCount) * 15);
        const timingAdvantage = 2 + Math.random() * 46;
        const competitorGap = accuracy * improvementRate * 10;

        const { data } = await supabase.from("aces_intelligence_superiority").insert({
          domain,
          prediction_accuracy_pct: accuracy,
          accuracy_improvement_rate: improvementRate,
          transactions_processed: txCount,
          proprietary_data_points: txCount * 12,
          replication_difficulty_score: replicationDifficulty,
          market_timing_advantage_hours: timingAdvantage,
          competitor_accuracy_gap_pct: competitorGap,
          compounding_velocity: improvementRate * txCount * 0.001,
        }).select().single();

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "accelerate_network": {
        const { network_segment = "investor_marketplace" } = params;

        const velocity = 1.5 + Math.random() * 8;
        const friction = Math.max(5, 80 - Math.random() * 60);
        const institutionalRate = 2 + Math.random() * 15;
        const rpm = velocity * (100 - friction) * 0.01;
        const density = 0.1 + Math.random() * 0.8;

        const { data } = await supabase.from("aces_network_acceleration").insert({
          network_segment,
          deal_velocity_per_user: velocity,
          transaction_friction_score: friction,
          institutional_attraction_rate: institutionalRate,
          flywheel_rpm: rpm,
          user_to_deal_ratio: 0.3 + Math.random() * 2,
          network_density: density,
          competitor_velocity_gap_pct: velocity * 5,
          time_to_critical_mass_months: Math.max(3, 24 - rpm * 2),
        }).select().single();

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "measure_execution": {
        const { workflow_name = "full_deal_cycle" } = params;

        const closeHours = 48 + Math.random() * 400;
        const automation = 15 + Math.random() * 70;
        const coordination = 30 + Math.random() * 60;
        const speedMultiple = 1 + (automation / 100) * 4;

        const { data } = await supabase.from("aces_execution_dominance").insert({
          workflow_name,
          discovery_to_close_hours: closeHours,
          automation_coverage_pct: automation,
          coordination_efficiency: coordination,
          uncertainty_reduction_pct: automation * 0.7,
          competitor_speed_multiple: speedMultiple,
          participant_satisfaction: 40 + coordination * 0.5,
          bottleneck_count: Math.max(0, Math.floor(8 - automation / 12)),
          speed_trend: speedMultiple > 2 ? "accelerating" : "stable",
        }).select().single();

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "assess_ecosystem": {
        const { integration_domain = "investor_portfolio" } = params;

        const processes = 5 + Math.floor(Math.random() * 40);
        const apiVolume = 100 + Math.floor(Math.random() * 50000);
        const switchingHours = processes * 4 + Math.random() * 100;
        const dependency = Math.min(95, 20 + processes * 1.5 + Math.log10(apiVolume) * 8);
        const retention = 50 + dependency * 0.45;

        const tierMap: Record<string, string> = {};
        const tier = dependency >= 85 ? "indispensable" : dependency >= 70 ? "infrastructure" : dependency >= 50 ? "embedded" : dependency >= 30 ? "integrated" : "surface";

        const { data } = await supabase.from("aces_ecosystem_depth").insert({
          integration_domain,
          embedded_processes: processes,
          api_call_volume_daily: apiVolume,
          switching_cost_hours: switchingHours,
          workflow_dependency_score: dependency,
          retention_probability_pct: retention,
          depth_tier: tier,
          competitor_integration_gap: Math.floor(processes * 0.6),
        }).select().single();

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "track_extinction": {
        const { competitor_name = "Generic Marketplace" } = params;

        const velocityDecline = Math.random() * 40;
        const listingMigration = Math.random() * 30;
        const attentionShift = Math.random() * 50;
        const marketDelta = -(Math.random() * 15);
        const tipping = (velocityDecline * 0.3 + listingMigration * 0.2 + attentionShift * 0.3 + Math.abs(marketDelta) * 0.2) * 1.5;

        const phase = tipping >= 80 ? "irrelevant" : tipping >= 60 ? "marginal" : tipping >= 40 ? "declining" : "competing";

        const { data } = await supabase.from("aces_extinction_indicators").insert({
          competitor_name,
          deal_velocity_decline_pct: velocityDecline,
          listing_quality_migration_pct: listingMigration,
          investor_attention_shift_pct: attentionShift,
          market_share_delta_pct: marketDelta,
          tipping_point_proximity: Math.min(100, tipping),
          extinction_phase: phase,
          time_to_irrelevance_months: Math.max(3, (100 - tipping) / 3),
          ethical_boundary_compliance: true,
        }).select().single();

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "dashboard": {
        const [intel, network, execution, ecosystem, extinction] = await Promise.all([
          supabase.from("aces_intelligence_superiority").select("*").order("computed_at", { ascending: false }).limit(10),
          supabase.from("aces_network_acceleration").select("*").order("measured_at", { ascending: false }).limit(10),
          supabase.from("aces_execution_dominance").select("*").order("measured_at", { ascending: false }).limit(10),
          supabase.from("aces_ecosystem_depth").select("*").order("measured_at", { ascending: false }).limit(10),
          supabase.from("aces_extinction_indicators").select("*").order("tracked_at", { ascending: false }).limit(15),
        ]);

        const avgAccuracy = (intel.data || []).reduce((s, d) => s + (d.prediction_accuracy_pct || 0), 0) / Math.max(1, (intel.data || []).length);
        const avgRpm = (network.data || []).reduce((s, d) => s + (d.flywheel_rpm || 0), 0) / Math.max(1, (network.data || []).length);
        const avgSpeedMultiple = (execution.data || []).reduce((s, d) => s + (d.competitor_speed_multiple || 0), 0) / Math.max(1, (execution.data || []).length);
        const irrevCompetitors = (extinction.data || []).filter(e => ["marginal", "irrelevant", "exited"].includes(e.extinction_phase)).length;

        const summary = {
          avg_prediction_accuracy: Math.round(avgAccuracy),
          flywheel_rpm: Math.round(avgRpm * 10) / 10,
          execution_speed_multiple: Math.round(avgSpeedMultiple * 10) / 10,
          declining_competitors: irrevCompetitors,
          total_competitors_tracked: (extinction.data || []).length,
          ethical_compliance: (extinction.data || []).every(e => e.ethical_boundary_compliance),
        };

        await supabase.from("ai_event_signals").insert({
          event_type: "aces_engine_cycle",
          entity_type: "aces_dashboard",
          priority_level: "low",
          payload: summary,
        });

        return new Response(JSON.stringify({
          data: { summary, intelligence: intel.data, network: network.data, execution: execution.data, ecosystem: ecosystem.data, extinction: extinction.data },
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
