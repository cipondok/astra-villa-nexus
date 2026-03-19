import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} } = await req.json();
    let result: unknown;

    switch (mode) {
      case 'augment_intelligence': {
        const profiles = ['conservative', 'balanced', 'aggressive', 'novice', 'institutional'];
        const rows = profiles.map((p) => {
          const clarity = 30 + Math.random() * 65;
          const riskAccuracy = 25 + Math.random() * 70;
          const discoverySpeed = 20 + Math.random() * 75;
          const accepted = Math.floor(10 + Math.random() * 90);
          const rejected = Math.floor(5 + Math.random() * 40);
          const composite = clarity * 0.35 + riskAccuracy * 0.35 + discoverySpeed * 0.30;
          return {
            decision_clarity_score: +clarity.toFixed(2),
            risk_perception_accuracy: +riskAccuracy.toFixed(2),
            opportunity_discovery_speed: +discoverySpeed.toFixed(2),
            augmentation_level: composite >= 75 ? 'autonomous_advisory' : composite >= 55 ? 'co_pilot' : composite >= 35 ? 'assisted' : 'guided',
            human_agency_preserved: true,
            ai_suggestions_accepted: accepted,
            ai_suggestions_rejected: rejected,
            override_rate: +(rejected / (accepted + rejected) * 100).toFixed(2),
            augmentation_composite: +composite.toFixed(2),
          };
        });
        const { error } = await supabase.from('hawce_augmented_intelligence').insert(rows);
        if (error) throw error;
        result = { profiles_augmented: rows.length, avg_composite: +(rows.reduce((a, r) => a + r.augmentation_composite, 0) / rows.length).toFixed(2) };
        break;
      }

      case 'build_trust': {
        const stages = ['manual', 'suggestion_mode', 'co_pilot', 'supervised_auto', 'full_delegation'];
        const rows = stages.map((s, i) => {
          const transparency = 40 + Math.random() * 55;
          const confidence = 30 + Math.random() * 65;
          const buildEvents = 10 + Math.floor(Math.random() * 50);
          const erosionEvents = Math.floor(Math.random() * 10);
          return {
            trust_level: i >= 4 ? 'full_trust' : i >= 3 ? 'high' : i >= 2 ? 'moderate' : i >= 1 ? 'building' : 'cautious',
            transparency_score: +transparency.toFixed(2),
            confidence_calibration: +confidence.toFixed(2),
            automation_adoption_stage: s,
            ai_reasoning_visibility: +(transparency * 0.8 + Math.random() * 20).toFixed(2),
            explainability_requests: Math.floor(Math.random() * 30),
            trust_building_events: buildEvents,
            trust_erosion_events: erosionEvents,
            progressive_delegation_pct: +(i * 20 + Math.random() * 15).toFixed(2),
          };
        });
        const { error } = await supabase.from('hawce_trust_architecture').insert(rows);
        if (error) throw error;
        result = { trust_profiles: rows.length, full_delegation: rows.filter((r) => r.automation_adoption_stage === 'full_delegation').length };
        break;
      }

      case 'compound_collective': {
        const networkSize = 1000 + Math.floor(Math.random() * 50000);
        const behaviors = Math.floor(networkSize * (5 + Math.random() * 20));
        const precision = 40 + Math.random() * 55;
        const multiplier = 1 + Math.log10(networkSize) * 0.3;
        const snr = 20 + Math.random() * 70;
        const density = Math.min(100, networkSize * 0.002 + Math.random() * 20);
        const tier = precision >= 80 ? 'sovereign' : precision >= 60 ? 'institutional' : precision >= 40 ? 'growth' : 'emerging';
        const row = {
          network_size: networkSize,
          behaviors_ingested: behaviors,
          opportunity_matching_precision: +precision.toFixed(2),
          network_effect_multiplier: +multiplier.toFixed(3),
          investment_outcome_improvement: +(precision * multiplier * 0.1).toFixed(2),
          graph_density: +density.toFixed(2),
          signal_to_noise_ratio: +snr.toFixed(2),
          compounding_epoch: Math.floor(Math.random() * 20) + 1,
          intelligence_tier: tier,
        };
        const { error } = await supabase.from('hawce_collective_intelligence').insert(row);
        if (error) throw error;
        result = { network_size: networkSize, precision, multiplier: +multiplier.toFixed(3), tier };
        break;
      }

      case 'evolve_skills': {
        const journeys = [
          { stage: 'reactive', literacy: 25 },
          { stage: 'informed', literacy: 45 },
          { stage: 'analytical', literacy: 65 },
          { stage: 'strategic', literacy: 80 },
          { stage: 'visionary', literacy: 95 },
        ];
        const rows = journeys.map((j) => {
          const growthRate = Math.random() * 15;
          const maturity = j.literacy * 0.7 + growthRate * 2;
          return {
            literacy_score: +(j.literacy + Math.random() * 10).toFixed(2),
            investing_stage: j.stage,
            insights_consumed: Math.floor(10 + Math.random() * 200),
            coaching_sessions: Math.floor(Math.random() * 50),
            skill_growth_rate: +growthRate.toFixed(2),
            portfolio_complexity_level: j.literacy >= 70 ? 'advanced' : j.literacy >= 45 ? 'intermediate' : 'basic',
            strategic_maturity_index: +maturity.toFixed(2),
            milestone_achieved: j.stage === 'visionary' ? 'master_investor' : j.stage === 'strategic' ? 'portfolio_architect' : null,
            evolution_path: journeys.slice(0, journeys.indexOf(j) + 1).map((s) => s.stage),
          };
        });
        const { error } = await supabase.from('hawce_skill_evolution').insert(rows);
        if (error) throw error;
        result = { journeys_tracked: rows.length, visionaries: rows.filter((r) => r.investing_stage === 'visionary').length };
        break;
      }

      case 'spin_coevolution': {
        const cycleId = `HAWCE-${Date.now()}`;
        const capProd = Math.random() * 30;
        const riskReduction = Math.random() * 25;
        const inclusivity = 30 + Math.random() * 60;
        const synergy = capProd * 1.5 + riskReduction * 1.2 + inclusivity * 0.3;
        const velocity = synergy * 0.8 + Math.random() * 15;
        const depth = synergy >= 70 ? 'symbiotic' : synergy >= 50 ? 'integrated' : synergy >= 30 ? 'collaborative' : 'surface';
        const row = {
          cycle_id: cycleId,
          capital_productivity_gain: +capProd.toFixed(2),
          systemic_risk_reduction: +riskReduction.toFixed(2),
          wealth_inclusivity_index: +inclusivity.toFixed(2),
          human_ai_synergy_score: +synergy.toFixed(2),
          flywheel_velocity: +velocity.toFixed(2),
          collaboration_depth: depth,
          cumulative_wealth_impact_usd: Math.round(1e8 + Math.random() * 50e9),
          participation_growth_pct: +(Math.random() * 40).toFixed(2),
          decade_span: '2025-2035',
        };
        const { error } = await supabase.from('hawce_coevolution_flywheel').insert(row);
        if (error) throw error;
        result = { cycle_id: cycleId, synergy: row.human_ai_synergy_score, depth, velocity: row.flywheel_velocity };
        break;
      }

      case 'dashboard': {
        const [aug, trust, collective, skills, flywheel] = await Promise.all([
          supabase.from('hawce_augmented_intelligence').select('*').order('computed_at', { ascending: false }).limit(20),
          supabase.from('hawce_trust_architecture').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('hawce_collective_intelligence').select('*').order('computed_at', { ascending: false }).limit(10),
          supabase.from('hawce_skill_evolution').select('*').order('computed_at', { ascending: false }).limit(20),
          supabase.from('hawce_coevolution_flywheel').select('*').order('computed_at', { ascending: false }).limit(10),
        ]);

        const a = aug.data || [];
        const t = trust.data || [];
        const fw = flywheel.data || [];

        result = {
          summary: {
            investors_augmented: a.length,
            avg_augmentation: a.length ? +(a.reduce((s: number, r: any) => s + (r.augmentation_composite || 0), 0) / a.length).toFixed(1) : 0,
            avg_trust: t.length ? +(t.reduce((s: number, r: any) => s + (r.progressive_delegation_pct || 0), 0) / t.length).toFixed(1) : 0,
            network_epochs: (collective.data || []).length,
            skill_journeys: (skills.data || []).length,
            flywheel_cycles: fw.length,
            avg_synergy: fw.length ? +(fw.reduce((s: number, r: any) => s + (r.human_ai_synergy_score || 0), 0) / fw.length).toFixed(1) : 0,
          },
          augmented_intelligence: a,
          trust_architecture: t,
          collective_intelligence: collective.data || [],
          skill_evolution: skills.data || [],
          coevolution_flywheel: fw,
        };
        break;
      }

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
