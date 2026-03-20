import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'dashboard': {
        const [signals, narrative, timing, milestones, confidence] = await Promise.all([
          sb.from('ivms_valuation_signals').select('*').order('measured_at', { ascending: false }).limit(10),
          sb.from('ivms_narrative_momentum').select('*').order('assessed_at', { ascending: false }).limit(5),
          sb.from('ivms_market_timing').select('*').order('assessed_at', { ascending: false }).limit(3),
          sb.from('ivms_strategic_milestones').select('*').order('created_at', { ascending: false }).limit(10),
          sb.from('ivms_confidence_loop').select('*').order('assessed_at', { ascending: false }).limit(5),
        ]);
        return json({
          signals: signals.data ?? [],
          narrative: narrative.data ?? [],
          timing: timing.data ?? [],
          milestones: milestones.data ?? [],
          confidence: confidence.data ?? [],
          computed_at: new Date().toISOString(),
        });
      }

      case 'analyze_signals': {
        const categories = ['revenue_growth', 'ecosystem_velocity', 'category_leadership', 'unit_economics', 'retention'];
        const rows = categories.map((cat) => {
          const base = 40 + Math.random() * 55;
          const prev = base * (0.75 + Math.random() * 0.3);
          const growth = prev > 0 ? ((base - prev) / prev) * 100 : 100;
          return {
            signal_category: cat,
            signal_name: `${cat.replace(/_/g, ' ')} indicator`,
            current_value: Math.round(base * 100) / 100,
            previous_value: Math.round(prev * 100) / 100,
            growth_rate_pct: Math.round(growth * 10) / 10,
            consistency_score: Math.round(50 + Math.random() * 50),
            investor_weight: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
            perception_impact: growth > 30 ? 'strong_positive' : growth > 10 ? 'positive' : growth > 0 ? 'neutral' : 'negative',
            benchmark_percentile: Math.round(30 + Math.random() * 65),
            data_points_count: Math.floor(20 + Math.random() * 80),
            trend_direction: growth > 15 ? 'accelerating' : growth > 0 ? 'growing' : 'decelerating',
          };
        });
        const { error } = await sb.from('ivms_valuation_signals').insert(rows);
        if (error) throw error;
        await sb.from('ai_event_signals').insert({
          event_type: 'ivms_engine_cycle', entity_type: 'ivms', priority_level: 'low',
          payload: { mode: 'analyze_signals', signals_analyzed: rows.length },
        });
        return json({ signals_analyzed: rows.length, strongest: rows.sort((a, b) => b.growth_rate_pct - a.growth_rate_pct)[0]?.signal_category });
      }

      case 'model_narrative': {
        const phases = [
          { phase: 'innovation', label: 'Early Innovation Positioning' },
          { phase: 'acceleration', label: 'Growth Acceleration Recognition' },
          { phase: 'validation', label: 'Institutional Validation' },
          { phase: 'momentum', label: 'Momentum Peak' },
          { phase: 'maturity', label: 'Market Maturity Stabilization' },
        ];
        const rows = phases.map((p, i) => ({
          phase: p.phase,
          phase_label: p.label,
          sentiment_score: Math.round(40 + i * 10 + Math.random() * 15),
          momentum_velocity: Math.round(20 + Math.random() * 70),
          institutional_interest_level: i < 2 ? 'low' : i < 4 ? 'high' : 'very_high',
          media_coverage_index: Math.round(10 + i * 15 + Math.random() * 20),
          analyst_consensus: i < 2 ? 'speculative' : i < 4 ? 'bullish' : 'strong_buy',
          narrative_strength: Math.round(30 + i * 12 + Math.random() * 15),
          key_catalysts: ['market_expansion', 'revenue_milestone', 'partnership_announcement'].slice(0, 1 + Math.floor(Math.random() * 3)),
          phase_duration_months: Math.floor(6 + Math.random() * 18),
          transition_probability: Math.round(30 + Math.random() * 60),
        }));
        const { error } = await sb.from('ivms_narrative_momentum').insert(rows);
        if (error) throw error;
        return json({ phases_modeled: rows.length, peak_phase: rows.sort((a, b) => b.sentiment_score - a.sentiment_score)[0]?.phase });
      }

      case 'assess_timing': {
        const envs = ['risk_on', 'neutral', 'risk_off'];
        const rows = envs.map((env) => {
          const sector = Math.round(30 + Math.random() * 60);
          const capital = Math.round(30 + Math.random() * 60);
          const receptiveness = Math.round(sector * 0.35 + capital * 0.35 + Math.random() * 30);
          return {
            macro_environment: env,
            sector_sentiment_score: sector,
            capital_availability_index: capital,
            ipo_window_status: receptiveness > 70 ? 'open' : receptiveness > 50 ? 'narrowing' : 'closed',
            comparable_multiples_avg: Math.round((8 + Math.random() * 20) * 10) / 10,
            tech_sector_pe_ratio: Math.round((15 + Math.random() * 25) * 10) / 10,
            interest_rate_environment: env === 'risk_on' ? 'accommodative' : env === 'neutral' ? 'stable' : 'tightening',
            liquidity_premium: Math.round(Math.random() * 15 * 10) / 10,
            volatility_index: Math.round(10 + Math.random() * 30),
            receptiveness_score: receptiveness,
            optimal_timing_window: receptiveness > 70 ? 'now' : receptiveness > 50 ? '3_6_months' : '12_plus_months',
            timing_confidence: Math.round(40 + Math.random() * 50),
          };
        });
        const { error } = await sb.from('ivms_market_timing').insert(rows);
        if (error) throw error;
        const best = rows.sort((a, b) => b.receptiveness_score - a.receptiveness_score)[0];
        return json({ scenarios_assessed: rows.length, best_window: best?.optimal_timing_window, best_receptiveness: best?.receptiveness_score });
      }

      case 'map_milestones': {
        const milestones = [
          { cat: 'geographic_expansion', name: 'Southeast Asia 5-City Launch' },
          { cat: 'monetization_maturity', name: 'ARR IDR 100B Threshold' },
          { cat: 'ecosystem_density', name: '10K Active Investors' },
          { cat: 'technology_moat', name: '500-Table Intelligence Platform' },
          { cat: 'institutional_validation', name: 'Series B Close' },
        ];
        const rows = milestones.map((m) => {
          const completion = Math.round(Math.random() * 100);
          return {
            milestone_category: m.cat,
            milestone_name: m.name,
            target_value: 100,
            current_value: completion,
            completion_pct: completion,
            valuation_impact_multiplier: Math.round((1 + Math.random() * 2) * 100) / 100,
            investor_narrative_weight: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
            status: completion >= 100 ? 'achieved' : completion >= 50 ? 'on_track' : completion >= 25 ? 'in_progress' : 'pending',
            evidence_points: [{ type: 'metric', detail: `${completion}% complete` }],
          };
        });
        const { error } = await sb.from('ivms_strategic_milestones').insert(rows);
        if (error) throw error;
        return json({ milestones_mapped: rows.length, achieved: rows.filter((r) => r.status === 'achieved').length });
      }

      case 'reinforce_confidence': {
        const dimensions = ['execution_credibility', 'financial_transparency', 'leadership_trust', 'market_position', 'governance_quality'];
        const rows = dimensions.map((dim) => {
          const score = Math.round(40 + Math.random() * 55);
          const prev = Math.round(35 + Math.random() * 50);
          return {
            confidence_dimension: dim,
            current_score: score,
            previous_score: prev,
            score_trend: score > prev ? 'improving' : score === prev ? 'stable' : 'declining',
            reinforcement_strength: Math.round(Math.abs(score - prev) * (score > prev ? 1 : -0.5)),
            trust_signals_count: Math.floor(5 + Math.random() * 20),
            transparency_index: Math.round(50 + Math.random() * 45),
            stakeholder_alignment: Math.round(40 + Math.random() * 50),
            feedback_loop_velocity: Math.round(Math.random() * 100),
            decay_risk: Math.round(Math.max(0, 50 - score) + Math.random() * 10),
          };
        });
        const { error } = await sb.from('ivms_confidence_loop').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.current_score, 0) / rows.length);
        return json({ dimensions_assessed: rows.length, avg_confidence: avg, improving: rows.filter((r) => r.score_trend === 'improving').length });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
