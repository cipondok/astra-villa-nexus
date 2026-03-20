import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GPIDSRequest {
  mode: 'dashboard' | 'preipo' | 'narrative' | 'valuation' | 'timing' | 'postipo';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: GPIDSRequest = await req.json();
    const { mode } = body;

    if (mode === 'dashboard') {
      const [preipo, narrative, valuation, timing, postipo] = await Promise.all([
        supabase.from('gpids_preipo_positioning').select('*').order('assessed_at', { ascending: false }).limit(20),
        supabase.from('gpids_narrative_leadership').select('*').order('assessed_at', { ascending: false }).limit(10),
        supabase.from('gpids_valuation_expansion').select('*').order('computed_at', { ascending: false }).limit(15),
        supabase.from('gpids_timing_intelligence').select('*').order('assessed_at', { ascending: false }).limit(10),
        supabase.from('gpids_postipo_dominance').select('*').order('computed_at', { ascending: false }).limit(15),
      ]);

      return new Response(JSON.stringify({
        engine: 'GPIDS', timestamp: new Date().toISOString(),
        preipo_positioning: preipo.data ?? [],
        narrative_leadership: narrative.data ?? [],
        valuation_expansion: valuation.data ?? [],
        timing_intelligence: timing.data ?? [],
        postipo_dominance: postipo.data ?? [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'preipo') {
      const milestones = [
        { cat: 'revenue', name: 'ARR $50M+', target: 50000000 },
        { cat: 'revenue', name: 'Net Revenue Retention >120%', target: 120 },
        { cat: 'geographic', name: '10+ City Liquidity Dominance', target: 10 },
        { cat: 'geographic', name: '>40% Market Share Flagship', target: 40 },
        { cat: 'institutional', name: '50+ Institutional Clients', target: 50 },
        { cat: 'institutional', name: 'Fund AUM >$500M on platform', target: 500 },
        { cat: 'data_moat', name: '100M+ Data Points', target: 100000000 },
        { cat: 'data_moat', name: 'Prediction Accuracy >85%', target: 85 },
        { cat: 'unit_economics', name: 'LTV/CAC >5x', target: 5 },
        { cat: 'unit_economics', name: 'Gross Margin >70%', target: 70 },
      ];

      const results = milestones.map(m => {
        const current = m.target * (0.3 + Math.random() * 0.65);
        const completion = Math.min(100, (current / m.target) * 100);
        const ready = completion > 80;
        return {
          milestone_category: m.cat,
          milestone_name: m.name,
          target_value: m.target,
          current_value: +current.toFixed(2),
          completion_pct: +completion.toFixed(1),
          revenue_predictability_score: +(50 + Math.random() * 45).toFixed(1),
          geographic_dominance_index: +(Math.random() * 100).toFixed(2),
          institutional_adoption_pct: +(20 + Math.random() * 60).toFixed(1),
          data_moat_maturity: +(40 + Math.random() * 55).toFixed(2),
          readiness_tier: ready ? 'ipo_ready' : completion > 50 ? 'accelerating' : 'building',
          months_to_ready: ready ? 0 : Math.ceil((100 - completion) / 5),
          blocker_risks: { risks: completion < 40 ? ['insufficient_scale', 'market_timing'] : [] },
        };
      });

      const { error } = await supabase.from('gpids_preipo_positioning').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({
        event_type: 'gpids_engine_cycle', entity_type: 'ipo_simulator', entity_id: 'preipo',
        priority_level: 'normal', payload: { milestones: results.length, mode: 'preipo_positioning' },
      });

      return new Response(JSON.stringify({ success: true, milestones_assessed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'narrative') {
      const frames = [
        'Global Property Liquidity Infrastructure',
        'AI Capital Allocation Intelligence',
        'Urban Economic Growth Enabler',
        'Cross-Border Investment OS',
        'Institutional Deal Discovery Layer',
      ];

      const results = frames.map(frame => {
        const strength = 40 + Math.random() * 55;
        const media = Math.random() * 100;
        const analyst = Math.random() * 100;
        const catOwn = Math.random() * 100;
        return {
          narrative_frame: frame,
          positioning_strength: +strength.toFixed(2),
          media_resonance_score: +media.toFixed(2),
          analyst_adoption_pct: +analyst.toFixed(1),
          category_ownership_index: +catOwn.toFixed(2),
          comparable_premium_pct: +(10 + Math.random() * 40).toFixed(1),
          investor_recall_rate: +(30 + Math.random() * 60).toFixed(1),
          narrative_consistency: +(60 + Math.random() * 35).toFixed(2),
          key_proof_points: {
            points: ['Transaction volume growth', 'Data moat depth', 'Institutional adoption'],
          },
          competitive_narrative_gap: +(15 + Math.random() * 40).toFixed(1),
        };
      });

      const { error } = await supabase.from('gpids_narrative_leadership').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, narratives_crafted: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'valuation') {
      const drivers = [
        'recurring_revenue_growth', 'network_effect_defensibility',
        'operating_leverage', 'ecosystem_monetization', 'tam_expansion', 'data_asset_premium',
      ];

      const results = drivers.map(driver => {
        const currentMult = 8 + Math.random() * 12;
        const targetMult = currentMult * (1.3 + Math.random() * 0.7);
        const rrg = 30 + Math.random() * 70;
        const netEffect = Math.random() * 100;
        const opLev = Math.random() * 100;
        const ecoOpt = Math.random() * 500000000;
        return {
          valuation_driver: driver,
          current_multiple: +currentMult.toFixed(1),
          target_multiple: +targetMult.toFixed(1),
          expansion_potential_pct: +(((targetMult - currentMult) / currentMult) * 100).toFixed(1),
          recurring_revenue_growth_pct: +rrg.toFixed(1),
          network_effect_strength: +netEffect.toFixed(2),
          operating_leverage_score: +opLev.toFixed(2),
          ecosystem_optionality_value: +ecoOpt.toFixed(0),
          tam_expansion_factor: +(1.5 + Math.random() * 4).toFixed(2),
          investor_demand_index: +(40 + Math.random() * 55).toFixed(2),
          risk_discount_pct: +(5 + Math.random() * 20).toFixed(1),
        };
      });

      const { error } = await supabase.from('gpids_valuation_expansion').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, drivers_modeled: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'timing') {
      const windows = [
        'Q1 2027 Early Window', 'Q3 2027 Peak Window', 'Q1 2028 Recovery Window',
        'Q3 2028 Expansion Window', 'Q1 2029 Optimal Window',
      ];

      const results = windows.map(w => {
        const macro = Math.random() * 100;
        const sentiment = Math.random() * 100;
        const openness = macro * 0.3 + sentiment * 0.4 + Math.random() * 30;
        const clampedOpenness = Math.min(100, openness);
        const rateEnv = macro > 60 ? 'accommodative' : macro > 35 ? 'neutral' : 'restrictive';
        const rec = clampedOpenness > 80 ? 'go' : clampedOpenness > 55 ? 'prepare' : 'monitor';
        return {
          window_name: w,
          macro_liquidity_score: +macro.toFixed(2),
          sector_sentiment_index: +sentiment.toFixed(2),
          interest_rate_environment: rateEnv,
          tech_valuation_trend: sentiment > 60 ? 'expanding' : sentiment > 35 ? 'stable' : 'compressing',
          window_openness_pct: +clampedOpenness.toFixed(1),
          optimal_filing_months: clampedOpenness > 70 ? Math.floor(3 + Math.random() * 4) : Math.floor(8 + Math.random() * 10),
          competitor_ipo_pipeline: Math.floor(Math.random() * 6),
          geopolitical_risk_score: +(Math.random() * 50).toFixed(1),
          window_durability_months: Math.floor(3 + Math.random() * 12),
          recommendation: rec,
        };
      });

      const { error } = await supabase.from('gpids_timing_intelligence').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, windows_analyzed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'postipo') {
      const domains = [
        'global_expansion', 'strategic_acquisitions', 'financial_infrastructure',
        'r_and_d_acceleration', 'talent_scaling', 'brand_dominance',
      ];

      const results = domains.map(domain => {
        const capital = 50000000 + Math.random() * 450000000;
        const roi = 1.5 + Math.random() * 5;
        const power = 40 + Math.random() * 55;
        return {
          strategy_domain: domain,
          capital_allocated_usd: +capital.toFixed(0),
          expected_roi_multiple: +roi.toFixed(2),
          expansion_cities_target: Math.floor(5 + Math.random() * 30),
          acquisition_targets: Math.floor(1 + Math.random() * 8),
          new_products_planned: Math.floor(2 + Math.random() * 6),
          market_share_acceleration_pct: +(5 + Math.random() * 25).toFixed(1),
          strategic_power_index: +power.toFixed(2),
          execution_timeline_months: Math.floor(6 + Math.random() * 30),
          dominance_probability: +(50 + Math.random() * 45).toFixed(1),
          deployment_actions: {
            priorities: ['market_entry', 'talent_acquisition', 'product_launch'],
            risk_mitigations: ['staged_deployment', 'local_partnerships'],
          },
        };
      });

      const { error } = await supabase.from('gpids_postipo_dominance').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, strategies_computed: results.length, results }), {
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
