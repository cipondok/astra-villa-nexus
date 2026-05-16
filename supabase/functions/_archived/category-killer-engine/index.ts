import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params = {} } = await req.json();

    switch (mode) {
      case "assess_phase": {
        const { phase_number = 1 } = params;
        
        const phaseDefinitions: Record<number, { name: string; features: string[]; category: string }> = {
          1: {
            name: "Intelligent Marketplace Superiority",
            features: ["AI-Precision Matching", "Deal Transparency Score", "Sub-2min Execution", "Smart Listing Enrichment"],
            category: "matching"
          },
          2: {
            name: "Predictive Decision Infrastructure",
            features: ["Return Forecasting Engine", "Risk Probability Matrix", "Liquidity Prediction", "Behavioral Shift Detector"],
            category: "prediction"
          },
          3: {
            name: "Autonomous Investment Execution",
            features: ["Auto Deal Discovery", "Portfolio Self-Balancing", "Exit Timing Optimizer", "Risk-Adjusted Autopilot"],
            category: "automation"
          },
          4: {
            name: "Institutional Market Backbone",
            features: ["Fund Allocation API", "Cross-Border Capital Router", "Asset Tokenization Layer", "Institutional Compliance Engine"],
            category: "infrastructure"
          },
          5: {
            name: "Global Economic Intelligence Layer",
            features: ["Macro Guidance Engine", "Urban Growth Predictor", "Capital Distribution Optimizer", "Economic Narrative Generator"],
            category: "intelligence"
          }
        };

        const def = phaseDefinitions[phase_number] || phaseDefinitions[1];

        // Upsert phase
        const { data: phase } = await supabase
          .from("ckper_evolution_phases")
          .upsert({
            phase_number,
            phase_name: def.name,
            phase_status: phase_number <= 2 ? "building" : "planned",
            completion_pct: Math.max(0, 100 - (phase_number - 1) * 25),
            category_displacement_score: Math.max(0, 90 - (phase_number - 1) * 15),
            user_behavior_shift_pct: Math.min(100, phase_number * 20),
            competitive_gap_months: phase_number * 6,
            breakthrough_features: def.features,
          }, { onConflict: "phase_number" })
          .select()
          .single();

        // Upsert features for this phase
        if (phase) {
          for (const feat of def.features) {
            await supabase.from("ckper_feature_stack").upsert({
              phase_id: phase.id,
              feature_name: feat,
              feature_category: def.category,
              impact_tier: phase_number <= 2 ? "critical" : "high",
              development_status: phase_number === 1 ? "live" : phase_number === 2 ? "in_progress" : "planned",
              competitive_uniqueness_score: 60 + Math.random() * 35,
              switching_cost_contribution: phase_number * 15,
            }, { onConflict: "feature_name" }).select();
          }
        }

        return new Response(JSON.stringify({ data: phase }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "track_displacement": {
        const { competitor_name, competitor_category = "marketplace" } = params;

        const advantage = 30 + Math.random() * 50;
        const inevitability = Math.min(95, advantage * 1.2);

        const { data } = await supabase.from("ckper_competitive_displacement").insert({
          competitor_name: competitor_name || "Generic Marketplace",
          competitor_category,
          our_advantage_score: advantage,
          feature_gap_count: Math.floor(Math.random() * 15) + 5,
          speed_advantage_pct: 20 + Math.random() * 60,
          data_moat_depth: 40 + Math.random() * 50,
          user_migration_rate: 5 + Math.random() * 25,
          perceived_inevitability: inevitability,
          displacement_strategy: advantage > 60
            ? "Accelerate feature gap to create switching impossibility"
            : "Focus on data gravity and network density before direct competition",
        }).select().single();

        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "measure_behavior_shift": {
        const { cohort_name = "all_investors", phase_number = 1 } = params;

        const reactive = Math.max(0, 100 - phase_number * 22);
        const informed = Math.min(40, phase_number * 12);
        const predictive = Math.min(35, Math.max(0, (phase_number - 1) * 14));
        const autonomous = Math.min(20, Math.max(0, (phase_number - 2) * 10));
        const institutional = Math.min(15, Math.max(0, (phase_number - 3) * 8));

        const dependency = Math.min(95, 20 + phase_number * 15);
        const velocity = phase_number * 2.5;

        const { data } = await supabase.from("ckper_behavior_transformation").insert({
          cohort_name,
          phase_number,
          reactive_pct: reactive,
          informed_pct: informed,
          predictive_pct: predictive,
          autonomous_pct: autonomous,
          institutional_pct: institutional,
          avg_decisions_per_month: 2 + phase_number * 3,
          platform_dependency_score: dependency,
          behavior_velocity: velocity,
          transformation_confidence: 60 + phase_number * 7,
        }).select().single();

        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "assess_category_ownership": {
        const { category_name = "PropTech Investment Intelligence" } = params;

        const { data: phases } = await supabase
          .from("ckper_evolution_phases")
          .select("*")
          .order("phase_number", { ascending: true });

        const livePhasesCount = (phases || []).filter(p => ["live", "dominant", "transcended"].includes(p.phase_status)).length;

        const tierMap: Record<number, string> = { 0: "entrant", 1: "challenger", 2: "leader", 3: "category_definer", 4: "industry_os", 5: "industry_os" };
        const tier = tierMap[livePhasesCount] || "entrant";

        const { data } = await supabase.from("ckper_category_ownership").insert({
          category_name,
          ownership_tier: tier,
          market_share_pct: 5 + livePhasesCount * 12,
          mind_share_pct: 10 + livePhasesCount * 16,
          standard_setting_influence: livePhasesCount * 18,
          api_dependency_count: livePhasesCount * 25,
          ecosystem_partners: 10 + livePhasesCount * 40,
          category_redefinition_events: livePhasesCount,
          time_to_next_tier_months: Math.max(3, 18 - livePhasesCount * 3),
          ownership_momentum: livePhasesCount * 20,
          decade_projection: {
            year_3: { tier: tierMap[Math.min(5, livePhasesCount + 1)], market_share: 5 + (livePhasesCount + 1) * 15 },
            year_5: { tier: tierMap[Math.min(5, livePhasesCount + 2)], market_share: 5 + (livePhasesCount + 2) * 18 },
            year_10: { tier: "industry_os", market_share: 65 },
          },
        }).select().single();

        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "dashboard": {
        const [phases, features, displacement, behavior, ownership] = await Promise.all([
          supabase.from("ckper_evolution_phases").select("*").order("phase_number"),
          supabase.from("ckper_feature_stack").select("*").order("competitive_uniqueness_score", { ascending: false }).limit(20),
          supabase.from("ckper_competitive_displacement").select("*").order("tracked_at", { ascending: false }).limit(10),
          supabase.from("ckper_behavior_transformation").select("*").order("measured_at", { ascending: false }).limit(10),
          supabase.from("ckper_category_ownership").select("*").order("computed_at", { ascending: false }).limit(5),
        ]);

        const activePhase = (phases.data || []).find(p => p.phase_status === "building") || (phases.data || [])[0];
        const liveFeatures = (features.data || []).filter(f => f.development_status === "live").length;
        const avgDisplacement = (displacement.data || []).reduce((s, d) => s + (d.our_advantage_score || 0), 0) / Math.max(1, (displacement.data || []).length);

        const summary = {
          current_phase: activePhase?.phase_number || 1,
          current_phase_name: activePhase?.phase_name || "Phase 1",
          phase_completion_pct: activePhase?.completion_pct || 0,
          total_live_features: liveFeatures,
          avg_competitive_advantage: Math.round(avgDisplacement),
          category_tier: (ownership.data || [])[0]?.ownership_tier || "entrant",
          competitive_gap_months: activePhase?.competitive_gap_months || 0,
        };

        // Emit engine cycle signal
        await supabase.from("ai_event_signals").insert({
          event_type: "ckper_engine_cycle",
          entity_type: "ckper_dashboard",
          priority_level: "low",
          payload: summary,
        });

        return new Response(JSON.stringify({
          data: {
            summary,
            phases: phases.data,
            features: features.data,
            displacement: displacement.data,
            behavior: behavior.data,
            ownership: ownership.data,
          }
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown mode: ${mode}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
