import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ACECMRequest {
  mode: 'dashboard' | 'signals' | 'gravity' | 'influence' | 'feedback' | 'governance';
  city?: string;
  country?: string;
  institution_segment?: string;
  governance_domain?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: ACECMRequest = await req.json();
    const { mode } = body;

    if (mode === 'dashboard') {
      const [signals, gravity, influence, feedback, governance] = await Promise.all([
        supabase.from('acecm_capital_signals').select('*').order('computed_at', { ascending: false }).limit(20),
        supabase.from('acecm_opportunity_gravity').select('*').order('gravity_score', { ascending: false }).limit(20),
        supabase.from('acecm_institutional_influence').select('*').order('decision_influence_index', { ascending: false }).limit(20),
        supabase.from('acecm_capital_feedback_loop').select('*').order('computed_at', { ascending: false }).limit(20),
        supabase.from('acecm_governance_risk').select('*').order('assessed_at', { ascending: false }).limit(10),
      ]);

      return new Response(JSON.stringify({
        engine: 'ACECM',
        timestamp: new Date().toISOString(),
        capital_signals: signals.data ?? [],
        opportunity_gravity: gravity.data ?? [],
        institutional_influence: influence.data ?? [],
        capital_feedback_loops: feedback.data ?? [],
        governance_risk: governance.data ?? [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'signals') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Makassar'];
      const results = cities.map(city => {
        const txVelocity = Math.random() * 100;
        const pricingMomentum = (Math.random() - 0.3) * 100;
        const liquidityConc = Math.random() * 100;
        const behavioralScore = Math.random() * 100;
        const composite = txVelocity * 0.3 + Math.abs(pricingMomentum) * 0.25 + liquidityConc * 0.25 + behavioralScore * 0.2;
        return {
          city,
          country: body.country ?? 'Indonesia',
          signal_type: 'composite',
          transaction_velocity: +txVelocity.toFixed(2),
          pricing_momentum: +pricingMomentum.toFixed(2),
          liquidity_concentration: +liquidityConc.toFixed(2),
          investor_behavioral_score: +behavioralScore.toFixed(2),
          composite_signal_strength: +composite.toFixed(2),
          signal_trend: pricingMomentum > 20 ? 'accelerating' : pricingMomentum < -20 ? 'decelerating' : 'stable',
          data_points_consumed: Math.floor(Math.random() * 50000) + 10000,
          signal_confidence: +(70 + Math.random() * 25).toFixed(1),
        };
      });

      const { error } = await supabase.from('acecm_capital_signals').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({
        event_type: 'acecm_engine_cycle', entity_type: 'capital_empire', entity_id: 'signals',
        priority_level: 'normal', payload: { cities: cities.length, mode: 'signal_aggregation' },
      });

      return new Response(JSON.stringify({ success: true, signals_computed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'gravity') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta'];
      const results = cities.map(city => {
        const attention = Math.random() * 100;
        const aiInfluence = Math.random() * 100;
        const dealFlow = Math.random() * 100;
        const gravity = attention * 0.35 + aiInfluence * 0.35 + dealFlow * 0.3;
        return {
          city,
          country: body.country ?? 'Indonesia',
          gravity_score: +gravity.toFixed(2),
          investor_attention_index: +attention.toFixed(2),
          ai_recommendation_influence: +aiInfluence.toFixed(2),
          deal_flow_visibility: +dealFlow.toFixed(2),
          capital_attraction_rate: +(gravity * 0.8 + Math.random() * 20).toFixed(2),
          disproportionate_share_pct: +(gravity / 5).toFixed(1),
          competing_markets: Math.floor(3 + Math.random() * 8),
          gravity_tier: gravity > 75 ? 'dominant' : gravity > 50 ? 'strong' : gravity > 30 ? 'emerging' : 'nascent',
          gravity_trend: Math.random() > 0.3 ? 'ascending' : 'stabilizing',
        };
      });

      const { error } = await supabase.from('acecm_opportunity_gravity').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, markets_analyzed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'influence') {
      const segments = [
        { segment: 'Sovereign Wealth Funds', stage: 'integration' },
        { segment: 'Tier-1 Venture Capital', stage: 'adoption' },
        { segment: 'Family Offices', stage: 'evaluation' },
        { segment: 'Pension Funds', stage: 'awareness' },
        { segment: 'REITs', stage: 'adoption' },
        { segment: 'Private Equity', stage: 'integration' },
      ];

      const results = segments.map(s => {
        const underwriting = Math.random() * 100;
        const pipeline = Math.random() * 100;
        const riskDiv = Math.random() * 100;
        const dataDep = Math.random() * 100;
        const influence = underwriting * 0.3 + pipeline * 0.3 + riskDiv * 0.2 + dataDep * 0.2;
        return {
          institution_segment: s.segment,
          integration_depth: influence > 70 ? 'embedded' : influence > 40 ? 'integrated' : 'peripheral',
          underwriting_adoption_pct: +underwriting.toFixed(1),
          pipeline_reliance_score: +pipeline.toFixed(2),
          risk_diversification_impact: +riskDiv.toFixed(2),
          data_dependency_score: +dataDep.toFixed(2),
          decision_influence_index: +influence.toFixed(2),
          deals_influenced: Math.floor(Math.random() * 500),
          capital_influenced_usd: +(Math.random() * 500000000).toFixed(0),
          adoption_stage: s.stage,
        };
      });

      const { error } = await supabase.from('acecm_institutional_influence').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, segments_analyzed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'feedback') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung'];
      const stages = ['seed_capital', 'initial_transactions', 'signal_generation', 'capital_attraction', 'self_sustaining'];

      const results = cities.map(city => {
        const stageIdx = Math.floor(Math.random() * stages.length);
        const stage = stages[stageIdx];
        const inflow = Math.random() * 100000000;
        const activity = Math.random() * 100;
        const signalStr = Math.random() * 100;
        const newCapital = inflow * (1 + Math.random() * 0.5);
        const velocity = activity * signalStr / 100;
        const amplification = 1 + stageIdx * 0.25;
        const selfSustaining = stageIdx >= 4 && velocity > 50;

        return {
          city,
          country: body.country ?? 'Indonesia',
          loop_stage: stage,
          capital_inflow_usd: +inflow.toFixed(0),
          transaction_activity_index: +activity.toFixed(2),
          data_signal_strength: +signalStr.toFixed(2),
          new_capital_attracted_usd: +newCapital.toFixed(0),
          loop_velocity: +velocity.toFixed(2),
          amplification_factor: +amplification.toFixed(2),
          loop_iterations: stageIdx * 3 + Math.floor(Math.random() * 5),
          is_self_sustaining: selfSustaining,
          feedback_health: selfSustaining ? 'self_sustaining' : velocity > 40 ? 'accelerating' : velocity > 20 ? 'building' : 'seeding',
        };
      });

      const { error } = await supabase.from('acecm_capital_feedback_loop').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, loops_computed: results.length, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'governance') {
      const domains = [
        'market_stability', 'transparency', 'regulatory_compliance',
        'responsible_ai', 'systemic_risk', 'ethical_deployment',
      ];

      const results = domains.map(domain => ({
        governance_domain: domain,
        market_stability_score: +(70 + Math.random() * 25).toFixed(1),
        transparency_index: +(60 + Math.random() * 35).toFixed(1),
        regulatory_engagement_level: Math.random() > 0.5 ? 'active_dialogue' : 'monitoring',
        responsible_deployment_score: +(75 + Math.random() * 20).toFixed(1),
        concentration_risk_flag: Math.random() < 0.15,
        systemic_impact_assessment: Math.random() > 0.7 ? 'significant' : 'moderate',
        ethical_compliance_pct: +(85 + Math.random() * 14).toFixed(1),
        risk_mitigation_actions: { actions: ['diversification_limits', 'transparency_reports', 'regulatory_briefings'] },
        regulatory_jurisdictions: ['Indonesia', 'Singapore', 'UAE'],
      }));

      const { error } = await supabase.from('acecm_governance_risk').insert(results);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, domains_assessed: results.length, results }), {
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
