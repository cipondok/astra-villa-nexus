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
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    switch (mode) {
      case 'dashboard': {
        const [drivers, narrative, expansion, stability, loop] = await Promise.all([
          sb.from('pmlg_liquidity_drivers').select('*').order('measured_at', { ascending: false }).limit(10),
          sb.from('pmlg_narrative_momentum').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('pmlg_ecosystem_expansion').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('pmlg_participation_stability').select('*').order('assessed_at', { ascending: false }).limit(10),
          sb.from('pmlg_feedback_loop').select('*').order('assessed_at', { ascending: false }).limit(10),
        ]);
        return json({
          drivers: drivers.data ?? [], narrative: narrative.data ?? [],
          expansion: expansion.data ?? [], stability: stability.data ?? [],
          feedback_loop: loop.data ?? [], computed_at: new Date().toISOString(),
        });
      }

      case 'analyze_drivers': {
        const cats = [
          { cat: 'growth_visibility', name: 'Revenue Growth Consistency' },
          { cat: 'earnings_clarity', name: 'Earnings Trajectory Transparency' },
          { cat: 'category_leadership', name: 'Market Category Dominance' },
          { cat: 'institutional_flow', name: 'Institutional Capital Flows' },
          { cat: 'retail_momentum', name: 'Retail Investor Interest' },
        ];
        const rows = cats.map((c) => ({
          driver_category: c.cat, driver_name: c.name,
          attraction_score: Math.round(40 + Math.random() * 55),
          growth_visibility_index: Math.round(45 + Math.random() * 50),
          earnings_clarity: Math.round(40 + Math.random() * 55),
          category_leadership_pct: Math.round(10 + Math.random() * 50),
          trading_volume_impact: Math.round(Math.random() * 100),
          institutional_ownership_pct: Math.round(20 + Math.random() * 50),
          retail_interest_index: Math.round(30 + Math.random() * 65),
          benchmark_vs_peers: Math.round(-10 + Math.random() * 40),
          trend_direction: Math.random() > 0.3 ? 'improving' : 'stable',
        }));
        const { error } = await sb.from('pmlg_liquidity_drivers').insert(rows);
        if (error) throw error;
        await sb.from('ai_event_signals').insert({
          event_type: 'pmlg_engine_cycle', entity_type: 'pmlg', priority_level: 'low',
          payload: { mode: 'analyze_drivers', count: rows.length },
        });
        return json({ drivers_analyzed: rows.length, avg_attraction: Math.round(rows.reduce((s, r) => s + r.attraction_score, 0) / rows.length) });
      }

      case 'reinforce_narrative': {
        const types = [
          { type: 'product_launch', desc: 'AI Valuation Engine V4 Release' },
          { type: 'market_expansion', desc: 'ASEAN 3-Country Expansion' },
          { type: 'revenue_milestone', desc: 'ARR Exceeds IDR 100B' },
          { type: 'partnership', desc: 'Tier-1 Bank Integration Complete' },
          { type: 'governance', desc: 'SOC 2 Type II Certification' },
        ];
        const rows = types.map((t) => ({
          milestone_type: t.type, milestone_description: t.desc,
          analyst_engagement_score: Math.round(40 + Math.random() * 55),
          thesis_reinforcement: Math.round(50 + Math.random() * 45),
          valuation_resilience_impact: Math.round(Math.random() * 30),
          media_coverage_lift: Math.round(Math.random() * 100),
          investor_sentiment_shift: Math.round(-5 + Math.random() * 25),
          narrative_consistency: Math.round(55 + Math.random() * 40),
          coverage_initiations: Math.floor(Math.random() * 5),
          price_target_revisions: Math.floor(Math.random() * 8),
        }));
        const { error } = await sb.from('pmlg_narrative_momentum').insert(rows);
        if (error) throw error;
        return json({ milestones_reinforced: rows.length, avg_thesis: Math.round(rows.reduce((s, r) => s + r.thesis_reinforcement, 0) / rows.length) });
      }

      case 'signal_expansion': {
        const expansions = [
          { type: 'geographic', name: 'Jakarta Metro Deep Penetration' },
          { type: 'geographic', name: 'Surabaya Market Launch' },
          { type: 'product', name: 'Institutional Analytics API' },
          { type: 'ecosystem', name: 'Developer Partnership Network' },
          { type: 'vertical', name: 'Commercial RE Intelligence Module' },
        ];
        const rows = expansions.map((e) => ({
          expansion_type: e.type, expansion_name: e.name,
          market_relevance_boost: Math.round(10 + Math.random() * 40),
          investor_segment_breadth: Math.floor(2 + Math.random() * 6),
          confidence_reinforcement: Math.round(45 + Math.random() * 50),
          tam_expansion_pct: Math.round(5 + Math.random() * 30),
          product_evolution_score: Math.round(40 + Math.random() * 55),
          network_effect_multiplier: Math.round((1 + Math.random() * 1.5) * 100) / 100,
          competitive_moat_impact: Math.round(30 + Math.random() * 60),
          signaling_effectiveness: Math.round(45 + Math.random() * 50),
        }));
        const { error } = await sb.from('pmlg_ecosystem_expansion').insert(rows);
        if (error) throw error;
        return json({ expansions_signaled: rows.length, avg_tam_boost: Math.round(rows.reduce((s, r) => s + r.tam_expansion_pct, 0) / rows.length) });
      }

      case 'stabilize_participation': {
        const dims = ['disclosure_consistency', 'guidance_accuracy', 'expectation_management', 'shareholder_communication', 'volatility_management'];
        const rows = dims.map((dim) => {
          const score = Math.round(45 + Math.random() * 50);
          return {
            stability_dimension: dim,
            stability_score: score, previous_score: Math.round(40 + Math.random() * 45),
            disclosure_frequency: ['monthly', 'quarterly'][Math.floor(Math.random() * 2)],
            guidance_accuracy_pct: Math.round(60 + Math.random() * 35),
            expectation_management_score: Math.round(50 + Math.random() * 45),
            shareholder_communication_index: Math.round(45 + Math.random() * 50),
            volatility_relative_to_sector: Math.round((0.6 + Math.random() * 0.8) * 100) / 100,
            bid_ask_spread_basis_pts: Math.round(5 + Math.random() * 30),
            avg_daily_volume: Math.round(100000 + Math.random() * 900000),
          };
        });
        const { error } = await sb.from('pmlg_participation_stability').insert(rows);
        if (error) throw error;
        return json({ dimensions_stabilized: rows.length, avg_stability: Math.round(rows.reduce((s, r) => s + r.stability_score, 0) / rows.length) });
      }

      case 'optimize_loop': {
        const stages = ['engagement_to_liquidity', 'liquidity_to_valuation', 'valuation_to_execution', 'execution_to_engagement'];
        const rows = stages.map((st) => {
          const health = Math.round(40 + Math.random() * 55);
          return {
            loop_stage: st,
            loop_health: health, previous_health: Math.round(35 + Math.random() * 50),
            engagement_index: Math.round(40 + Math.random() * 55),
            liquidity_depth: Math.round(30 + Math.random() * 65),
            valuation_stability: Math.round(45 + Math.random() * 50),
            execution_capacity: Math.round(50 + Math.random() * 45),
            self_reinforcing: health >= 70,
            loop_velocity: Math.round(Math.random() * 100),
            decay_risk: Math.round(Math.max(0, 60 - health + Math.random() * 15)),
            optimization_actions: [{ action: `Strengthen ${st.replace(/_/g, ' ')}`, priority: health < 60 ? 'high' : 'standard' }],
          };
        });
        const { error } = await sb.from('pmlg_feedback_loop').insert(rows);
        if (error) throw error;
        const avg = Math.round(rows.reduce((s, r) => s + r.loop_health, 0) / rows.length);
        return json({ loops_optimized: rows.length, avg_health: avg, self_reinforcing: rows.filter((r) => r.self_reinforcing).length });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
