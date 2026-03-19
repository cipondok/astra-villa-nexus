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

    // ── 1. Capital Gravity Scoring ──
    if (mode === 'full' || mode === 'gravity') {
      const { data: targets } = await sb.from('supply_acquisition_targets').select('*');
      const { data: balances } = await sb.from('district_marketplace_balance').select('*');

      const balanceMap = new Map((balances || []).map(b => [b.district, b]));
      let gravityCount = 0;

      for (const t of (targets || [])) {
        const bal = balanceMap.get(t.district);
        const liquidityAccel = Math.min((t.liquidity_strength_index ?? 0) / 100, 1) * 100;
        const absorptionVel = Math.min((t.demand_velocity ?? 0) / 50, 1) * 100;
        const vendorDepth = bal ? Math.min(bal.vendor_supply_depth / 100, 1) * 100 : 30;
        const dealClose = t.avg_days_to_close > 0
          ? Math.max(0, 100 - (t.avg_days_to_close / 90) * 100)
          : 50;
        const priceAppreciation = Math.min((t.liquidity_strength_index ?? 0) * 0.8, 100);
        const supplyGapPersist = Math.min((t.supply_gap_score ?? 0), 100);

        const gravity = Math.round(
          liquidityAccel * 0.25 + absorptionVel * 0.20 +
          vendorDepth * 0.15 + dealClose * 0.15 +
          priceAppreciation * 0.15 + supplyGapPersist * 0.10
        );

        const tier = gravity >= 80 ? 'magnet'
          : gravity >= 60 ? 'strong'
          : gravity >= 40 ? 'neutral'
          : gravity >= 20 ? 'weak'
          : 'repellent';

        await sb.from('district_capital_gravity').upsert({
          district: t.district,
          city: t.district.split('-')[0] || t.district,
          segment_type: t.segment_type,
          liquidity_acceleration_score: liquidityAccel,
          absorption_velocity_score: absorptionVel,
          vendor_execution_depth_score: vendorDepth,
          deal_close_reliability_score: dealClose,
          price_appreciation_momentum: priceAppreciation,
          supply_gap_persistence_score: supplyGapPersist,
          capital_gravity_score: Math.max(0, Math.min(100, gravity)),
          gravity_tier: tier,
          scoring_inputs: {
            liquidity_idx: t.liquidity_strength_index,
            demand_velocity: t.demand_velocity,
            avg_days_close: t.avg_days_to_close,
            supply_gap: t.supply_gap_score,
            vendor_depth: vendorDepth,
          },
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_dcg_district_segment' });

        gravityCount++;
      }
      results.gravity_scored = gravityCount;
    }

    // ── 2. Portfolio Flow Intelligence ──
    if (mode === 'full' || mode === 'flow') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: gravity } = await sb
        .from('district_capital_gravity')
        .select('*')
        .gte('capital_gravity_score', 20);

      let flowCount = 0;
      for (const g of (gravity || [])) {
        // Simulate flow from gravity + existing deal signals
        const baseInflow = g.capital_gravity_score * 50_000_000; // IDR proxy
        const baseOutflow = baseInflow * (1 - g.capital_gravity_score / 150);
        const netFlow = baseInflow - baseOutflow;
        const investorCount = Math.max(1, Math.round(g.capital_gravity_score / 10));
        const topShare = investorCount <= 3 ? 60 : investorCount <= 8 ? 35 : 15;
        const hhi = Math.round((topShare / 100) ** 2 * 10000);
        const saturation = g.gravity_tier === 'magnet' ? 75 : g.gravity_tier === 'strong' ? 50 : 25;

        const rotationSignal = netFlow > baseInflow * 0.5 ? 'inflow_surge'
          : netFlow < -baseInflow * 0.3 ? 'capital_flight'
          : netFlow < 0 ? 'mild_outflow'
          : 'stable';

        const flowTrend = g.capital_gravity_score >= 75 ? 'accelerating'
          : g.capital_gravity_score >= 55 ? 'growing'
          : g.capital_gravity_score >= 35 ? 'flat'
          : g.capital_gravity_score >= 20 ? 'declining'
          : 'collapsing';

        await sb.from('investor_portfolio_flow').upsert({
          district: g.district,
          segment_type: g.segment_type,
          period_month: currentMonth,
          capital_inflow_idr: baseInflow,
          capital_outflow_idr: baseOutflow,
          net_flow_idr: netFlow,
          unique_investors: investorCount,
          investor_concentration_hhi: hhi,
          district_saturation_pct: saturation,
          capital_rotation_signal: rotationSignal,
          top_investor_share_pct: topShare,
          avg_ticket_size: investorCount > 0 ? Math.round(baseInflow / investorCount) : 0,
          flow_trend: flowTrend,
          insights: {
            gravity_tier: g.gravity_tier,
            gravity_score: g.capital_gravity_score,
          },
        }, { onConflict: 'idx_ipf_district_period' });

        flowCount++;
      }
      results.flow_computed = flowCount;
    }

    // ── 3. Bubble Risk Detection ──
    if (mode === 'full' || mode === 'bubble') {
      const { data: gravity } = await sb.from('district_capital_gravity').select('*');
      const { data: flows } = await sb.from('investor_portfolio_flow').select('*').order('created_at', { ascending: false });

      const flowMap = new Map((flows || []).map(f => [f.district, f]));
      let bubbleCount = 0;

      for (const g of (gravity || [])) {
        const flow = flowMap.get(g.district);
        // Overheat: high gravity + high saturation
        const overheat = Math.min(
          (g.capital_gravity_score / 100) * (flow?.district_saturation_pct ?? 0) / 50 * 100, 100
        );
        // Speculative divergence: high appreciation without deal close reliability
        const specDiv = Math.max(0,
          g.price_appreciation_momentum - g.deal_close_reliability_score
        );
        // Offer frenzy: high concentration + inflow surge
        const frenzy = flow?.capital_rotation_signal === 'inflow_surge'
          ? Math.min((flow?.investor_concentration_hhi ?? 0) / 100, 100)
          : 0;
        // Capital concentration
        const capConcentration = Math.min((flow?.top_investor_share_pct ?? 0) * 1.5, 100);

        const priceToFundamental = 1 + (specDiv / 200);

        const bubbleScore = Math.round(
          overheat * 0.30 + specDiv * 0.25 + frenzy * 0.25 + capConcentration * 0.20
        );

        const riskLevel = bubbleScore >= 75 ? 'critical'
          : bubbleScore >= 50 ? 'high'
          : bubbleScore >= 30 ? 'elevated'
          : 'low';

        const roiAdj = riskLevel === 'critical' ? 0.70
          : riskLevel === 'high' ? 0.85
          : riskLevel === 'elevated' ? 0.95
          : 1.0;

        const actions = [];
        if (riskLevel === 'critical') actions.push('halt_new_capital_allocation', 'emit_investor_warning', 'reduce_premium_slot_pricing');
        else if (riskLevel === 'high') actions.push('throttle_capital_inflow', 'diversify_routing');
        else if (riskLevel === 'elevated') actions.push('monitor_closely', 'increase_reporting_frequency');

        const narrative = riskLevel === 'critical'
          ? `⚠️ Critical bubble risk in ${g.district}: overheated liquidity (${overheat.toFixed(0)}), speculative pricing divergence (${specDiv.toFixed(0)}). ROI expectations adjusted to ${(roiAdj * 100).toFixed(0)}%.`
          : riskLevel === 'high'
          ? `Elevated bubble signals in ${g.district}. Capital concentration at ${capConcentration.toFixed(0)}%. Recommend portfolio diversification.`
          : null;

        await sb.from('district_bubble_risk').upsert({
          district: g.district,
          segment_type: g.segment_type,
          liquidity_overheat_score: overheat,
          speculative_pricing_divergence: specDiv,
          offer_frenzy_index: frenzy,
          capital_concentration_risk: capConcentration,
          price_to_fundamental_ratio: priceToFundamental,
          bubble_risk_score: Math.max(0, Math.min(100, bubbleScore)),
          risk_level: riskLevel,
          recommended_actions: actions,
          roi_adjustment_factor: roiAdj,
          cooling_signal_emitted: riskLevel === 'critical',
          narrative,
          scoring_inputs: {
            gravity_score: g.capital_gravity_score,
            saturation: flow?.district_saturation_pct,
            rotation: flow?.capital_rotation_signal,
          },
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_dbr_district_segment' });

        bubbleCount++;
      }
      results.bubble_assessed = bubbleCount;
    }

    // ── 4. Capital Sequencing ──
    if (mode === 'full' || mode === 'sequence') {
      const { data: gravity } = await sb
        .from('district_capital_gravity')
        .select('*')
        .order('capital_gravity_score', { ascending: false });

      const { data: bubbles } = await sb.from('district_bubble_risk').select('*');
      const bubbleMap = new Map((bubbles || []).map(b => [b.district, b]));

      // Clear old queue
      await sb.from('capital_sequencing_queue').delete().neq('status', 'deployed');

      let rank = 1;
      for (const g of (gravity || []).slice(0, 25)) {
        const bubble = bubbleMap.get(g.district);
        const bubbleDiscount = (bubble?.bubble_risk_score ?? 0) * 0.5;

        const liquidityYield = g.capital_gravity_score * (bubble?.roi_adjustment_factor ?? 1);
        const exitScore = g.deal_close_reliability_score;
        const pipelineDensity = g.absorption_velocity_score;

        const priority = Math.round(
          liquidityYield * 0.35 + exitScore * 0.25 +
          pipelineDensity * 0.25 - bubbleDiscount * 0.15
        );

        // Recommended allocation: proportional to priority
        const totalPriority = (gravity || []).slice(0, 25).reduce((s, gr) => s + gr.capital_gravity_score, 0);
        const allocPct = totalPriority > 0 ? Math.round((g.capital_gravity_score / totalPriority) * 100) : 4;

        const rationale = `${g.gravity_tier} gravity district with ${g.capital_gravity_score.toFixed(0)} gravity score. ` +
          `Exit reliability: ${exitScore.toFixed(0)}%. ` +
          (bubble?.risk_level === 'high' || bubble?.risk_level === 'critical'
            ? `⚠️ Bubble risk: ${bubble.risk_level} (${bubble.bubble_risk_score.toFixed(0)}). ROI adjusted.`
            : `Bubble risk: ${bubble?.risk_level ?? 'low'}.`);

        await sb.from('capital_sequencing_queue').insert({
          city: g.city || g.district.split('-')[0],
          district: g.district,
          segment_type: g.segment_type,
          asset_class: g.segment_type || 'mixed',
          sequence_rank: rank++,
          risk_adjusted_liquidity_yield: liquidityYield,
          time_to_exit_score: exitScore,
          deal_pipeline_density: pipelineDensity,
          capital_gravity_score: g.capital_gravity_score,
          bubble_risk_discount: bubbleDiscount,
          capital_priority_score: Math.max(0, priority),
          recommended_allocation_pct: allocPct,
          ai_rationale: rationale,
          status: 'recommended',
        });
      }
      results.capital_sequenced = rank - 1;
    }

    // ── 5. Syndication Opportunities ──
    if (mode === 'full' || mode === 'syndication') {
      const { data: topGravity } = await sb
        .from('district_capital_gravity')
        .select('*')
        .gte('capital_gravity_score', 65)
        .order('capital_gravity_score', { ascending: false })
        .limit(10);

      let synCount = 0;
      for (const g of (topGravity || [])) {
        const dealValue = g.capital_gravity_score * 100_000_000;
        const funds = Math.max(2, Math.round(g.capital_gravity_score / 20));
        const properties = Math.max(3, Math.round(g.capital_gravity_score / 15));

        await sb.from('institutional_deal_clusters').insert({
          cluster_name: `${g.gravity_tier.toUpperCase()} Syndication — ${g.district}`,
          district: g.district,
          segment_type: g.segment_type,
          cluster_type: g.capital_gravity_score >= 80 ? 'syndication' : 'co_investment',
          total_deal_value_idr: dealValue,
          participating_funds: funds,
          target_properties: properties,
          min_ticket_idr: Math.round(dealValue / funds / 2),
          target_irr_pct: 12 + (g.capital_gravity_score - 65) * 0.2,
          capital_gravity_at_creation: g.capital_gravity_score,
          status: 'identified',
          ai_rationale: `High capital gravity (${g.capital_gravity_score.toFixed(0)}) makes ${g.district} ideal for institutional syndication. Target ${properties} properties across ${funds} funds.`,
          supporting_metrics: {
            liquidity_accel: g.liquidity_acceleration_score,
            vendor_depth: g.vendor_execution_depth_score,
          },
        });
        synCount++;
      }
      results.syndications_created = synCount;
    }

    // Emit orchestrator signal
    await sb.from('ai_event_signals').insert({
      event_type: 'capital_allocation_engine_cycle',
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
