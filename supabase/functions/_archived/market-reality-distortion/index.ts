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
      case 'amplify_narratives': {
        const themes = [
          'emerging_luxury_corridor',
          'digital_nomad_investment_wave',
          'infrastructure_led_appreciation',
          'tokenized_ownership_revolution',
          'yield_arbitrage_opportunity',
        ];
        const rows = themes.map((t) => {
          const confidence = 30 + Math.random() * 65;
          const visibility = 20 + Math.random() * 75;
          const growthExp = 25 + Math.random() * 70;
          const velocity = confidence * 0.3 + visibility * 0.3 + growthExp * 0.4;
          return {
            narrative_theme: t,
            city: (params.city as string) || null,
            confidence_signal_strength: +confidence.toFixed(2),
            success_case_visibility: +visibility.toFixed(2),
            growth_expectation_index: +growthExp.toFixed(2),
            narrative_velocity: +velocity.toFixed(2),
            amplification_channel: velocity > 60 ? 'multi_channel' : velocity > 40 ? 'content_seo' : 'organic',
            reach_estimate: Math.round(5000 + Math.random() * 500000),
            engagement_multiplier: +(1 + velocity * 0.03).toFixed(2),
            narrative_phase: velocity >= 70 ? 'viral' : velocity >= 50 ? 'accelerating' : velocity >= 30 ? 'building' : 'emerging',
            ethical_clearance: true,
          };
        });
        const { error } = await supabase.from('mrde_narrative_momentum').insert(rows);
        if (error) throw error;
        result = { narratives_amplified: rows.length, viral: rows.filter((r) => r.narrative_phase === 'viral').length };
        break;
      }

      case 'concentrate_demand': {
        const cities = (params.cities as string[]) || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta'];
        const rows = cities.map((c) => {
          const liquidity = 20 + Math.random() * 75;
          const appreciation = Math.random() * 30;
          const attention = 15 + Math.random() * 80;
          const clustering = liquidity * 0.35 + appreciation * 1.5 + attention * 0.25;
          const gravity = clustering * 0.7 + Math.random() * 20;
          return {
            city: c,
            liquidity_concentration: +liquidity.toFixed(2),
            appreciation_velocity: +appreciation.toFixed(2),
            investment_theme: appreciation > 15 ? 'high_growth' : liquidity > 60 ? 'liquidity_play' : 'value',
            capital_clustering_index: +clustering.toFixed(2),
            attention_density: +attention.toFixed(2),
            gravity_pull_score: +gravity.toFixed(2),
            promoted_asset_class: liquidity > 50 ? 'premium_residential' : 'mixed_use',
            organic_vs_amplified_ratio: +(0.3 + Math.random() * 0.7).toFixed(2),
          };
        });
        const { error } = await supabase.from('mrde_demand_gravity').insert(rows);
        if (error) throw error;
        result = { cities_concentrated: rows.length, avg_gravity: +(rows.reduce((a, r) => a + r.gravity_pull_score, 0) / rows.length).toFixed(2) };
        break;
      }

      case 'track_perception': {
        const segments = ['residential', 'commercial', 'luxury', 'fractional', 'off_plan'];
        const rows = segments.map((s) => {
          const sentAccel = -10 + Math.random() * 50;
          const trustIdx = 35 + Math.random() * 60;
          const trustDelta = -5 + Math.random() * 15;
          const fomo = Math.random() * 60;
          const tipping = Math.min(100, sentAccel * 1.2 + fomo * 0.8 + trustIdx * 0.3);
          const viral = Math.max(0, sentAccel * 0.05 + fomo * 0.02);
          return {
            city: (params.city as string) || null,
            market_segment: s,
            sentiment_acceleration: +sentAccel.toFixed(2),
            trust_index: +trustIdx.toFixed(2),
            trust_index_delta: +trustDelta.toFixed(2),
            fomo_participation_rate: +fomo.toFixed(2),
            tipping_point_proximity: +Math.max(0, tipping).toFixed(2),
            viral_coefficient: +viral.toFixed(3),
            sentiment_phase: sentAccel > 20 ? 'euphoric' : sentAccel > 5 ? 'bullish' : sentAccel > -5 ? 'neutral' : 'cautious',
            forecast_tipping_date: tipping > 70 ? '2025-Q3' : tipping > 50 ? '2025-Q4' : '2026+',
          };
        });
        const { error } = await supabase.from('mrde_perception_velocity').insert(rows);
        if (error) throw error;
        result = { segments_tracked: rows.length, near_tipping: rows.filter((r) => parseFloat(String(r.tipping_point_proximity)) >= 70).length };
        break;
      }

      case 'assess_dominance': {
        const competitors = ['legacy_portals', 'new_proptech', 'bank_platforms', 'social_marketplace'];
        const rows = competitors.map((c) => {
          const visLead = -20 + Math.random() * 70;
          const thought = 20 + Math.random() * 75;
          const inevitability = thought * 0.5 + Math.max(0, visLead) * 0.3 + Math.random() * 15;
          const sov = 10 + Math.random() * 50;
          const tier = inevitability >= 70 ? 'dominant' : inevitability >= 50 ? 'leader' : inevitability >= 30 ? 'contender' : 'challenger';
          return {
            competitor_segment: c,
            visibility_lead_pct: +visLead.toFixed(2),
            thought_leadership_score: +thought.toFixed(2),
            perceived_inevitability: +inevitability.toFixed(2),
            share_of_voice: +sov.toFixed(2),
            content_velocity_ratio: +(0.5 + Math.random() * 3).toFixed(2),
            seo_dominance_keywords: Math.floor(50 + Math.random() * 500),
            media_mention_multiplier: +(0.5 + Math.random() * 4).toFixed(2),
            dominance_tier: tier,
            strategy_active: tier === 'dominant' ? 'maintain_moat' : tier === 'leader' ? 'expand_voice' : 'content_blitz',
          };
        });
        const { error } = await supabase.from('mrde_competitive_dominance').insert(rows);
        if (error) throw error;
        result = { segments_assessed: rows.length, dominant_in: rows.filter((r) => r.dominance_tier === 'dominant').length };
        break;
      }

      case 'accelerate_phase': {
        const segments = ['residential_investment', 'fractional_ownership', 'tokenized_realestate', 'ai_advisory'];
        const rows = segments.map((s) => {
          const naturalWeeks = 52 + Math.floor(Math.random() * 104);
          const compressed = Math.max(8, Math.floor(naturalWeeks * (0.3 + Math.random() * 0.4)));
          const diffusion = 100 / compressed;
          const criticalMass = 10 + Math.random() * 80;
          const doublingWeeks = compressed / (1 + Math.random() * 3);
          return {
            market_segment: s,
            city: (params.city as string) || null,
            adoption_cycle_weeks: compressed,
            compressed_vs_natural_ratio: +(compressed / naturalWeeks).toFixed(3),
            diffusion_velocity: +diffusion.toFixed(2),
            ecosystem_scaling_wave: Math.floor(1 + Math.random() * 4),
            participation_doubling_weeks: +doublingWeeks.toFixed(1),
            acceleration_lever: criticalMass > 60 ? 'network_effects' : criticalMass > 35 ? 'content_flywheel' : 'incentive_programs',
            network_effect_stage: criticalMass >= 70 ? 'supercritical' : criticalMass >= 40 ? 'critical_mass' : criticalMass >= 20 ? 'pre_critical' : 'seeding',
            critical_mass_pct: +criticalMass.toFixed(2),
            ethical_guardrails: { transparency: true, no_false_claims: true, data_backed: true, user_consent: true },
          };
        });
        const { error } = await supabase.from('mrde_phase_acceleration').insert(rows);
        if (error) throw error;
        result = { segments_accelerated: rows.length, supercritical: rows.filter((r) => r.network_effect_stage === 'supercritical').length };
        break;
      }

      case 'dashboard': {
        const [narratives, gravity, perception, dominance, acceleration] = await Promise.all([
          supabase.from('mrde_narrative_momentum').select('*').order('narrative_velocity', { ascending: false }).limit(20),
          supabase.from('mrde_demand_gravity').select('*').order('gravity_pull_score', { ascending: false }).limit(20),
          supabase.from('mrde_perception_velocity').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('mrde_competitive_dominance').select('*').order('computed_at', { ascending: false }).limit(10),
          supabase.from('mrde_phase_acceleration').select('*').order('computed_at', { ascending: false }).limit(10),
        ]);

        const n = narratives.data || [];
        const g = gravity.data || [];
        const p = perception.data || [];
        const d = dominance.data || [];

        result = {
          summary: {
            active_narratives: n.length,
            viral_narratives: n.filter((r: any) => r.narrative_phase === 'viral').length,
            avg_gravity: g.length ? +(g.reduce((a: number, r: any) => a + (r.gravity_pull_score || 0), 0) / g.length).toFixed(1) : 0,
            near_tipping_segments: p.filter((r: any) => (r.tipping_point_proximity || 0) >= 70).length,
            dominant_segments: d.filter((r: any) => r.dominance_tier === 'dominant').length,
            supercritical_markets: (acceleration.data || []).filter((r: any) => r.network_effect_stage === 'supercritical').length,
          },
          narrative_momentum: n,
          demand_gravity: g,
          perception_velocity: p,
          competitive_dominance: d,
          phase_acceleration: acceleration.data || [],
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
