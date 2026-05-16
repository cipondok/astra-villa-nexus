import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode = 'full' } = await req.json().catch(() => ({}));
    const results: Record<string, number> = {};

    // ── 1. Deal Gravity Scoring ──
    if (mode === 'full' || mode === 'gravity') {
      const { data: properties } = await sb
        .from('properties')
        .select('id, city, district, price, status, views_count, inquiries_count, created_at')
        .in('status', ['active', 'pending'])
        .limit(500);

      const { data: capitalGravity } = await sb.from('district_capital_gravity').select('district, capital_gravity_score');
      const capitalMap = new Map((capitalGravity || []).map(c => [c.district, c.capital_gravity_score]));

      let gravityCount = 0;

      for (const p of (properties || [])) {
        const dist = p.district || p.city || 'unknown';
        const views = p.views_count ?? 0;
        const inquiries = p.inquiries_count ?? 0;
        const daysListed = Math.max(1, Math.round((Date.now() - new Date(p.created_at).getTime()) / 86400000));

        // Component scores
        const offerAccel = Math.min(inquiries / Math.max(daysListed, 1) * 20, 100);
        const viewingVelocity = Math.min(views / Math.max(daysListed, 1) * 5, 100);
        const escrowProb = inquiries > 3 ? Math.min(inquiries * 12, 100) : Math.min(inquiries * 8, 60);
        const dealCloseReliability = capitalMap.get(dist) ?? 50;
        const competitionDensity = Math.min(inquiries * 15, 100);
        const priceCompetitiveness = 60; // Baseline; would compare to median in production

        const gravity = Math.round(
          offerAccel * 0.25 + viewingVelocity * 0.20 +
          escrowProb * 0.20 + dealCloseReliability * 0.15 +
          competitionDensity * 0.10 + priceCompetitiveness * 0.10
        );

        const tier = gravity >= 80 ? 'dominant'
          : gravity >= 60 ? 'high'
          : gravity >= 35 ? 'standard'
          : gravity >= 15 ? 'low'
          : 'suppressed';

        await sb.from('deal_gravity_index').upsert({
          property_id: p.id,
          district: dist,
          offer_frequency_acceleration: offerAccel,
          viewing_velocity_momentum: viewingVelocity,
          escrow_initiation_probability: escrowProb,
          deal_close_reliability: dealCloseReliability,
          investor_competition_density: competitionDensity,
          price_competitiveness: priceCompetitiveness,
          deal_gravity_score: Math.max(0, Math.min(100, gravity)),
          gravity_tier: tier,
          scoring_inputs: { views, inquiries, daysListed, capitalGravity: dealCloseReliability },
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_dgi_property' });

        gravityCount++;
      }
      results.gravity_scored = gravityCount;
    }

    // ── 2. Visibility Ranking + Suppression + Boost ──
    if (mode === 'full' || mode === 'visibility') {
      const { data: gravityData } = await sb
        .from('deal_gravity_index')
        .select('*')
        .order('deal_gravity_score', { ascending: false });

      const { data: bubbles } = await sb.from('district_bubble_risk').select('district, bubble_risk_score, risk_level');
      const bubbleMap = new Map((bubbles || []).map(b => [b.district, b]));

      const { data: capitalFlow } = await sb.from('investor_portfolio_flow').select('district, net_flow_idr, flow_trend');
      const flowMap = new Map((capitalFlow || []).map(f => [f.district, f]));

      const { data: activeBoosts } = await sb
        .from('deal_boost_signals')
        .select('property_id, boost_strength, boost_type')
        .eq('status', 'active');
      const boostMap = new Map<string, number>();
      for (const b of (activeBoosts || [])) {
        boostMap.set(b.property_id, (boostMap.get(b.property_id) || 1) * (1 + (b.boost_strength ?? 0) * 0.2));
      }

      let visCount = 0;
      const ranked = (gravityData || []).map((g, idx) => {
        const bubble = bubbleMap.get(g.district || '');
        const flow = flowMap.get(g.district || '');

        // Suppression for oversupplied / bubble districts
        let suppression = 1.0;
        if (bubble?.risk_level === 'critical') suppression = 0.4;
        else if (bubble?.risk_level === 'high') suppression = 0.7;
        else if (g.gravity_tier === 'suppressed') suppression = 0.3;

        // Boost
        const boost = boostMap.get(g.property_id) ?? 1.0;

        // Component weights
        const gravityW = g.deal_gravity_score;
        const liquidityW = Math.min(g.deal_close_reliability * 1.2, 100);
        const capitalW = flow?.flow_trend === 'accelerating' ? 90
          : flow?.flow_trend === 'growing' ? 70
          : flow?.flow_trend === 'flat' ? 50
          : 30;
        const portfolioW = g.investor_competition_density;

        const rawVisibility = Math.round(
          gravityW * 0.35 + liquidityW * 0.25 +
          capitalW * 0.20 + portfolioW * 0.20
        );

        const finalVisibility = Math.max(0, Math.min(100,
          Math.round(rawVisibility * suppression * boost)
        ));

        const context = suppression < 0.5 ? 'suppressed'
          : boost > 1.2 ? 'boosted'
          : g.gravity_tier === 'dominant' ? 'institutional'
          : 'organic';

        return {
          property_id: g.property_id,
          district: g.district,
          deal_gravity_weight: gravityW,
          liquidity_urgency_weight: liquidityW,
          capital_inflow_weight: capitalW,
          portfolio_demand_weight: portfolioW,
          suppression_coefficient: suppression,
          boost_multiplier: boost,
          visibility_score: finalVisibility,
          ranking_context: context,
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _idx: idx,
        };
      });

      // Sort by visibility and assign ranks
      ranked.sort((a, b) => b.visibility_score - a.visibility_score);

      for (let i = 0; i < ranked.length; i++) {
        const r = ranked[i];
        await sb.from('deal_visibility_ranking').upsert({
          property_id: r.property_id,
          district: r.district,
          deal_gravity_weight: r.deal_gravity_weight,
          liquidity_urgency_weight: r.liquidity_urgency_weight,
          capital_inflow_weight: r.capital_inflow_weight,
          portfolio_demand_weight: r.portfolio_demand_weight,
          suppression_coefficient: r.suppression_coefficient,
          boost_multiplier: r.boost_multiplier,
          visibility_score: r.visibility_score,
          homepage_rank: i < 20 ? i + 1 : null,
          search_rank: i + 1,
          investor_feed_rank: r.ranking_context === 'institutional' || r.ranking_context === 'boosted' ? i + 1 : null,
          agent_feed_rank: i + 1,
          ranking_context: r.ranking_context,
          last_computed_at: r.last_computed_at,
          updated_at: r.updated_at,
        }, { onConflict: 'idx_dvr_property' });

        visCount++;
      }
      results.visibility_ranked = visCount;

      // Auto-generate boost signals for dominant listings without active boost
      const dominantWithoutBoost = (gravityData || [])
        .filter(g => g.gravity_tier === 'dominant' && !boostMap.has(g.property_id))
        .slice(0, 10);

      for (const d of dominantWithoutBoost) {
        await sb.from('deal_boost_signals').insert({
          property_id: d.property_id,
          district: d.district,
          boost_type: 'momentum_surge',
          boost_strength: Math.min(d.deal_gravity_score / 50, 2.0),
          boost_reason: `Auto: dominant gravity tier (${d.deal_gravity_score.toFixed(0)})`,
          trigger_metrics: { gravity: d.deal_gravity_score, tier: d.gravity_tier },
          status: 'active',
          expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        });
      }
      results.boosts_created = dominantWithoutBoost.length;
    }

    // ── 3. District Deal Dominance Aggregation ──
    if (mode === 'full' || mode === 'dominance') {
      const { data: gravity } = await sb.from('deal_gravity_index').select('district, deal_gravity_score, gravity_tier');
      const { data: visibility } = await sb.from('deal_visibility_ranking').select('district, visibility_score');

      const districtAgg = new Map<string, {
        scores: number[]; visScores: number[];
        dominant: number; suppressed: number; total: number;
      }>();

      for (const g of (gravity || [])) {
        const d = g.district || 'unknown';
        if (!districtAgg.has(d)) districtAgg.set(d, { scores: [], visScores: [], dominant: 0, suppressed: 0, total: 0 });
        const agg = districtAgg.get(d)!;
        agg.scores.push(g.deal_gravity_score);
        agg.total++;
        if (g.gravity_tier === 'dominant') agg.dominant++;
        if (g.gravity_tier === 'suppressed') agg.suppressed++;
      }

      for (const v of (visibility || [])) {
        const agg = districtAgg.get(v.district || 'unknown');
        if (agg) agg.visScores.push(v.visibility_score);
      }

      let domCount = 0;
      for (const [district, agg] of districtAgg.entries()) {
        const avgGravity = agg.scores.length > 0 ? agg.scores.reduce((a, b) => a + b, 0) / agg.scores.length : 0;
        const avgVis = agg.visScores.length > 0 ? agg.visScores.reduce((a, b) => a + b, 0) / agg.visScores.length : 0;
        const efficiency = agg.total > 0 ? Math.round((agg.dominant / agg.total) * 100) : 0;

        await sb.from('district_deal_dominance').upsert({
          district,
          avg_deal_gravity: Math.round(avgGravity),
          total_active_deals: agg.total,
          dominant_listings: agg.dominant,
          suppressed_listings: agg.suppressed,
          avg_visibility_score: Math.round(avgVis),
          dominance_efficiency_score: efficiency,
          insights: { avg_gravity: avgGravity, dominant_pct: efficiency, suppressed_pct: agg.total > 0 ? Math.round((agg.suppressed / agg.total) * 100) : 0 },
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_ddd_district_segment' });
        domCount++;
      }
      results.district_dominance_computed = domCount;
    }

    // Emit signal
    await sb.from('ai_event_signals').insert({
      event_type: 'deal_dominance_engine_cycle',
      entity_type: 'system',
      priority_level: 'normal',
      payload: results,
    });

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
