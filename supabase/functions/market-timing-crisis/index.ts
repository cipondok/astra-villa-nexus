import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UMTCSRequest {
  mode: 'dashboard' | 'cycle_detection' | 'defensive' | 'countercyclical' | 'recovery' | 'timing_advantage';
  city?: string;
  country?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: UMTCSRequest = await req.json();
    const { mode } = body;

    if (mode === 'dashboard') {
      const [cycles, defensive, counter, recovery, timing] = await Promise.all([
        supabase.from('umtcs_cycle_detection').select('*').order('detected_at', { ascending: false }).limit(20),
        supabase.from('umtcs_defensive_stability').select('*').order('assessed_at', { ascending: false }).limit(15),
        supabase.from('umtcs_countercyclical_growth').select('*').order('computed_at', { ascending: false }).limit(20),
        supabase.from('umtcs_recovery_acceleration').select('*').order('detected_at', { ascending: false }).limit(20),
        supabase.from('umtcs_timing_advantage').select('*').order('computed_at', { ascending: false }).limit(10),
      ]);

      return new Response(JSON.stringify({
        engine: 'UMTCS',
        timestamp: new Date().toISOString(),
        cycle_detection: cycles.data ?? [],
        defensive_stability: defensive.data ?? [],
        countercyclical_growth: counter.data ?? [],
        recovery_acceleration: recovery.data ?? [],
        timing_advantage: timing.data ?? [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'cycle_detection') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Yogyakarta', 'Semarang'];
      const phases = ['expansion', 'peak', 'contraction', 'trough', 'recovery'];

      const results = cities.map(city => {
        const liquiditySlow = Math.random() * 100;
        const inventoryAccum = Math.random() * 100;
        const financingCost = 5 + Math.random() * 10;
        const sentiment = Math.random() * 100;

        // Phase detection logic
        const stressIndex = liquiditySlow * 0.3 + inventoryAccum * 0.3 + (financingCost - 5) * 5 + (100 - sentiment) * 0.2;
        let phase: string;
        if (stressIndex > 70) phase = 'contraction';
        else if (stressIndex > 55) phase = 'peak';
        else if (stressIndex > 35) phase = 'expansion';
        else if (stressIndex > 20) phase = 'recovery';
        else phase = 'trough';

        const transitionProb = Math.min(1, Math.max(0, (stressIndex - 40) / 60));
        const monthsToInflection = Math.max(1, Math.round(24 * (1 - transitionProb)));

        return {
          city,
          country: body.country ?? 'Indonesia',
          liquidity_slowdown_index: +liquiditySlow.toFixed(2),
          inventory_accumulation_rate: +inventoryAccum.toFixed(2),
          financing_cost_trend: +financingCost.toFixed(2),
          investor_sentiment_score: +sentiment.toFixed(2),
          cycle_phase: phase,
          phase_confidence: +(60 + Math.random() * 35).toFixed(1),
          transition_probability: +transitionProb.toFixed(3),
          months_to_inflection: monthsToInflection,
          leading_indicators: {
            credit_tightening: Math.random() > 0.5,
            foreign_outflow: Math.random() > 0.6,
            construction_permits_decline: Math.random() > 0.5,
            rental_yield_compression: Math.random() > 0.4,
          },
        };
      });

      const { error } = await supabase.from('umtcs_cycle_detection').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({
        event_type: 'umtcs_engine_cycle', entity_type: 'market_timing', entity_id: 'cycle_detection',
        priority_level: 'normal', payload: { cities: cities.length, mode: 'cycle_detection' },
      });

      return new Response(JSON.stringify({ success: true, cities_analyzed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'defensive') {
      const domains = [
        'distressed_discovery', 'risk_analytics', 'vendor_diversification',
        'churn_prevention', 'revenue_hedging', 'cost_optimization',
      ];

      const results = domains.map(domain => {
        const resilience = 60 + Math.random() * 35;
        const churnMit = 50 + Math.random() * 45;
        const revStability = 55 + Math.random() * 40;
        const activated = Math.random() > 0.4;

        return {
          strategy_domain: domain,
          activation_trigger: activated ? 'cycle_phase_contraction' : null,
          distressed_opportunity_count: Math.floor(Math.random() * 200),
          risk_analytics_adoption_pct: +(30 + Math.random() * 60).toFixed(1),
          vendor_diversification_index: +(Math.random() * 100).toFixed(2),
          platform_resilience_score: +resilience.toFixed(2),
          churn_mitigation_effectiveness: +churnMit.toFixed(2),
          revenue_stability_pct: +revStability.toFixed(1),
          defensive_actions: {
            pricing_flexibility: true,
            enhanced_analytics_free_tier: activated,
            distressed_deal_spotlight: activated,
            vendor_cross_sell_program: Math.random() > 0.3,
          },
          is_activated: activated,
          activated_at: activated ? new Date().toISOString() : null,
        };
      });

      const { error } = await supabase.from('umtcs_defensive_stability').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, strategies_assessed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'countercyclical') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan'];

      const results = cities.map(city => {
        const shareGain = Math.random() * 15;
        const instInflow = Math.random() * 200000000;
        const competitorRetrench = Math.random() * 100;
        const dataAccel = 1 + Math.random() * 3;
        const talentIdx = Math.random() * 100;
        const growthDuringContraction = shareGain * 0.5 + competitorRetrench * 0.3 + dataAccel * 5;

        return {
          city,
          country: body.country ?? 'Indonesia',
          market_share_gain_pct: +shareGain.toFixed(2),
          institutional_inflow_usd: +instInflow.toFixed(0),
          discounted_asset_volume: Math.floor(Math.random() * 500),
          competitor_retrenchment_score: +competitorRetrench.toFixed(2),
          data_acquisition_acceleration: +dataAccel.toFixed(2),
          talent_acquisition_index: +talentIdx.toFixed(2),
          growth_during_contraction_pct: +growthDuringContraction.toFixed(2),
          strategic_investments: {
            distressed_fund_partnerships: Math.floor(Math.random() * 5),
            competitor_talent_hired: Math.floor(Math.random() * 20),
            data_partnerships_signed: Math.floor(Math.random() * 8),
            marketing_spend_increase_pct: +(Math.random() * 50).toFixed(1),
          },
          cycle_phase: 'contraction',
        };
      });

      const { error } = await supabase.from('umtcs_countercyclical_growth').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, markets_computed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'recovery') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Makassar'];
      const recoveryPhases = ['pre_recovery', 'early_recovery', 'acceleration', 'full_recovery'];

      const results = cities.map((city, i) => {
        const phaseIdx = Math.floor(Math.random() * recoveryPhases.length);
        const liquiditySpeed = 20 + Math.random() * 80;
        const hotspotLead = Math.floor(5 + Math.random() * 60);
        const earlyMover = 30 + Math.random() * 65;
        const signalStr = Math.random() * 100;
        const capitalReady = 40 + Math.random() * 55;

        return {
          city,
          country: body.country ?? 'Indonesia',
          liquidity_activation_speed: +liquiditySpeed.toFixed(2),
          hotspot_detection_lead_days: hotspotLead,
          expansion_sequence_rank: i + 1,
          early_mover_advantage_score: +earlyMover.toFixed(2),
          recovery_signal_strength: +signalStr.toFixed(2),
          capital_redeployment_readiness: +capitalReady.toFixed(2),
          recovery_phase: recoveryPhases[phaseIdx],
          playbook_actions: {
            reactivate_dormant_investors: phaseIdx >= 1,
            launch_recovery_fund_products: phaseIdx >= 2,
            aggressive_listing_acquisition: phaseIdx >= 1,
            expansion_city_entry: phaseIdx >= 3,
          },
        };
      });

      const { error } = await supabase.from('umtcs_recovery_acceleration').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, cities_planned: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'timing_advantage') {
      const domains = [
        'price_cycle_prediction', 'demand_forecasting', 'supply_pipeline_modeling',
        'interest_rate_impact', 'foreign_capital_flow', 'regulatory_change_anticipation',
      ];

      const results = domains.map(domain => {
        const dataDepth = 2 + Math.random() * 8;
        const accuracy = 55 + Math.random() * 35;
        const improvement = 2 + Math.random() * 8;
        const trust = 40 + Math.random() * 55;
        const positioning = 50 + Math.random() * 45;
        const cycles = Math.floor(1 + Math.random() * 5);
        const timingGap = 1 + Math.random() * 12;
        const moat = dataDepth * 5 + accuracy * 0.3 + cycles * 8;
        const compounding = 1 + (dataDepth * 0.05 + improvement * 0.02);

        return {
          advantage_domain: domain,
          historical_data_depth_years: +dataDepth.toFixed(1),
          predictive_accuracy_pct: +accuracy.toFixed(1),
          accuracy_improvement_rate: +improvement.toFixed(2),
          investor_trust_index: +trust.toFixed(2),
          strategic_positioning_score: +positioning.toFixed(2),
          cycles_modeled: cycles,
          competitive_timing_gap_months: +timingGap.toFixed(1),
          data_moat_strength: +moat.toFixed(2),
          compounding_intelligence_factor: +compounding.toFixed(3),
        };
      });

      const { error } = await supabase.from('umtcs_timing_advantage').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, domains_computed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid mode' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
