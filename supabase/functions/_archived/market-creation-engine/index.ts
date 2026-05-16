import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();
    const json = (d: unknown) => new Response(JSON.stringify({ data: d }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    switch (mode) {
      case "detect_opportunity": {
        const { city = "Jakarta", district, detection_type = "liquidity_uptick" } = params;
        const strength = 20 + Math.random() * 75;
        const confidence = 30 + Math.random() * 60;
        const yieldSpread = 1.5 + Math.random() * 8;
        const growthProj = 5 + Math.random() * 25;

        const { data } = await supabase.from("amce_opportunity_detection").insert({
          city, district: district || null, detection_type,
          signal_strength: strength,
          confidence,
          current_liquidity_index: 10 + Math.random() * 60,
          projected_growth_12m: growthProj,
          infrastructure_catalyst: detection_type === "infrastructure_inflection" ? "New toll road / MRT extension" : null,
          demographic_shift_vector: { population_growth: 2 + Math.random() * 8, median_age_shift: -1 + Math.random() * 3 },
          yield_spread_vs_mainstream: yieldSpread,
          discovery_priority: strength > 70 ? 1 : strength > 50 ? 2 : 3,
          is_actionable: strength > 60 && confidence > 50,
        }).select().single();
        return json(data);
      }

      case "form_category": {
        const { category_name, category_thesis, thematic_tags = [] } = params;
        const name = category_name || "Emerging Transit-Adjacent Micro-Districts";
        const distinctiveness = 40 + Math.random() * 55;

        const { data } = await supabase.from("amce_category_formation").insert({
          category_name: name,
          category_thesis: category_thesis || "Underserved districts within 500m of new transit infrastructure showing early demographic migration signals",
          thematic_tags: thematic_tags.length ? thematic_tags : ["transit-adjacent", "emerging", "high-yield"],
          standardized_metrics: {
            primary: ["yield_spread", "absorption_rate", "transit_proximity_km"],
            secondary: ["demographic_velocity", "infrastructure_spend_per_sqm", "anchor_tenant_count"],
          },
          narrative_frame: `${name}: Where early movers capture 2-3x yield premiums before mainstream discovery`,
          investor_comprehension_score: 30 + Math.random() * 50,
          category_distinctiveness: distinctiveness,
          formation_stage: distinctiveness > 70 ? "validated" : "defined",
        }).select().single();
        return json(data);
      }

      case "stimulate_demand": {
        const { category_id, stimulation_type = "deal_showcase", campaign_name } = params;
        const reach = 500 + Math.floor(Math.random() * 10000);
        const engRate = 2 + Math.random() * 15;
        const convCount = Math.floor(reach * engRate * 0.001);

        const { data } = await supabase.from("amce_demand_stimulation").insert({
          category_id: category_id || null,
          stimulation_type,
          campaign_name: campaign_name || `${stimulation_type} Campaign`,
          target_investor_segment: stimulation_type === "early_adopter_incentive" ? "high_risk_appetite" : "growth_oriented",
          reach_count: reach,
          engagement_rate: engRate,
          conversion_count: convCount,
          awareness_lift_pct: 5 + Math.random() * 25,
          demand_acceleration_score: Math.min(100, engRate * 3 + convCount * 2),
          budget_usd: 1000 + Math.random() * 50000,
          roi_multiple: convCount > 0 ? 1 + Math.random() * 8 : 0,
          status: "active",
          launched_at: new Date().toISOString(),
        }).select().single();
        return json(data);
      }

      case "seed_liquidity": {
        const { category_id, city = "Jakarta" } = params;
        const anchors = Math.floor(1 + Math.random() * 8);
        const comparables = Math.floor(Math.random() * 20);
        const depth = Math.min(95, anchors * 8 + comparables * 3 + Math.random() * 15);
        const benchmarkEstablished = comparables >= 5;

        const phase = depth >= 80 ? "liquid" : depth >= 60 ? "rooted" : depth >= 40 ? "germinating" : depth >= 20 ? "seeding" : "pre_seed";

        const { data } = await supabase.from("amce_liquidity_seeding").insert({
          category_id: category_id || null,
          city, district: params.district || null,
          anchor_investor_count: anchors,
          deal_flow_concentration: 10 + Math.random() * 60,
          comparable_transactions: comparables,
          benchmark_price_established: benchmarkEstablished,
          avg_transaction_value_usd: 50000 + Math.random() * 500000,
          liquidity_depth_score: depth,
          time_to_benchmark_months: benchmarkEstablished ? 0 : Math.max(2, 12 - comparables),
          seeding_phase: phase,
        }).select().single();
        return json(data);
      }

      case "assess_maturity": {
        const { category_id } = params;

        // Aggregate signals
        const [seedRes, demandRes] = await Promise.all([
          supabase.from("amce_liquidity_seeding").select("*").eq("category_id", category_id).order("seeded_at", { ascending: false }).limit(5),
          supabase.from("amce_demand_stimulation").select("*").eq("category_id", category_id).order("created_at", { ascending: false }).limit(10),
        ]);

        const avgDepth = (seedRes.data || []).reduce((s, r) => s + (r.liquidity_depth_score || 0), 0) / Math.max(1, (seedRes.data || []).length);
        const totalConversions = (demandRes.data || []).reduce((s, r) => s + (r.conversion_count || 0), 0);
        const totalVolume = (seedRes.data || []).reduce((s, r) => s + (r.avg_transaction_value_usd || 0) * (r.comparable_transactions || 0), 0);

        const readiness = Math.min(100, avgDepth * 0.4 + Math.min(100, totalConversions) * 0.3 + Math.min(100, totalVolume / 100000) * 0.3);
        const stage = readiness >= 85 ? "institutionalized" : readiness >= 60 ? "scaling" : readiness >= 35 ? "validated" : "emerging";

        const { data } = await supabase.from("amce_market_maturity").insert({
          category_id: category_id || null,
          maturity_stage: stage,
          total_transaction_volume_usd: totalVolume,
          unique_investors: totalConversions,
          institutional_participation: stage === "institutionalized" || stage === "scaling",
          price_discovery_accuracy: Math.min(95, avgDepth * 0.8),
          market_depth_index: avgDepth,
          graduation_readiness_pct: readiness,
          next_stage_requirements: stage === "emerging"
            ? [{ requirement: "5+ comparable transactions", met: false }, { requirement: "3+ anchor investors", met: false }]
            : stage === "validated"
            ? [{ requirement: "Institutional pilot allocation", met: false }, { requirement: "Standardized pricing benchmark", met: false }]
            : [],
          impact_thesis: `Market created from zero — now at ${stage} stage with $${Math.round(totalVolume).toLocaleString()} total volume`,
        }).select().single();
        return json(data);
      }

      case "dashboard": {
        const [opps, cats, demand, seeding, maturity] = await Promise.all([
          supabase.from("amce_opportunity_detection").select("*").order("detected_at", { ascending: false }).limit(15),
          supabase.from("amce_category_formation").select("*").order("formed_at", { ascending: false }).limit(10),
          supabase.from("amce_demand_stimulation").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("amce_liquidity_seeding").select("*").order("seeded_at", { ascending: false }).limit(10),
          supabase.from("amce_market_maturity").select("*").order("assessed_at", { ascending: false }).limit(10),
        ]);

        const actionableOpps = (opps.data || []).filter(o => o.is_actionable).length;
        const avgCatDistinctiveness = (cats.data || []).reduce((s, c) => s + (c.category_distinctiveness || 0), 0) / Math.max(1, (cats.data || []).length);
        const scalingMarkets = (maturity.data || []).filter(m => ["scaling", "institutionalized"].includes(m.maturity_stage)).length;

        const summary = {
          actionable_opportunities: actionableOpps,
          total_categories_formed: (cats.data || []).length,
          avg_category_distinctiveness: Math.round(avgCatDistinctiveness),
          active_campaigns: (demand.data || []).filter(d => d.status === "active").length,
          scaling_markets: scalingMarkets,
          total_seeding_zones: (seeding.data || []).length,
        };

        await supabase.from("ai_event_signals").insert({
          event_type: "amce_engine_cycle",
          entity_type: "amce_dashboard",
          priority_level: "low",
          payload: summary,
        });

        return json({ summary, opportunities: opps.data, categories: cats.data, demand: demand.data, seeding: seeding.data, maturity: maturity.data });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
