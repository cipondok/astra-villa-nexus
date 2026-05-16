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

    // Fetch properties
    const { data: properties } = await sb
      .from('properties')
      .select('id, city, district, price, status, views_count, inquiries_count, created_at')
      .in('status', ['active', 'pending'])
      .limit(500);

    // Fetch district context
    const { data: bubbles } = await sb.from('district_bubble_risk').select('district, bubble_risk_score, risk_level');
    const bubbleMap = new Map((bubbles || []).map(b => [b.district, b]));

    const { data: gravity } = await sb.from('district_capital_gravity').select('district, capital_gravity_score');
    const gravityMap = new Map((gravity || []).map(g => [g.district, g.capital_gravity_score]));

    // Build district price stats
    const districtPrices = new Map<string, number[]>();
    for (const p of (properties || [])) {
      const d = p.district || p.city || 'unknown';
      if (!districtPrices.has(d)) districtPrices.set(d, []);
      if (p.price) districtPrices.get(d)!.push(p.price);
    }
    const districtMedian = new Map<string, number>();
    for (const [d, prices] of districtPrices.entries()) {
      prices.sort((a, b) => a - b);
      districtMedian.set(d, prices[Math.floor(prices.length / 2)] || 0);
    }

    // ── 1. Price Inefficiency Detection ──
    if (mode === 'full' || mode === 'inefficiency') {
      let count = 0;
      for (const p of (properties || [])) {
        const dist = p.district || p.city || 'unknown';
        const price = p.price || 0;
        const median = districtMedian.get(dist) || price || 1;
        const fmvRatio = median > 0 ? price / median : 1;
        const dom = Math.max(1, Math.round((Date.now() - new Date(p.created_at).getTime()) / 86400000));
        const views = p.views_count ?? 0;
        const inquiries = p.inquiries_count ?? 0;

        const underval = fmvRatio < 0.85 ? Math.min((1 - fmvRatio) * 200, 100) : 0;
        const overprice = fmvRatio > 1.15 ? Math.min((fmvRatio - 1) * 150, 100) : 0;
        const speculative = fmvRatio > 1.3 ? Math.min((fmvRatio - 1.3) * 300, 100) : 0;
        const stagnation = dom > 30 && inquiries < 3 ? Math.min((dom / 90) * 100, 100) : 0;

        const inefficiency = Math.round(
          Math.max(underval, overprice, speculative) * 0.6 + stagnation * 0.4
        );

        const type = speculative >= 60 ? 'speculative'
          : underval >= 70 ? 'severely_undervalued'
          : underval >= 30 ? 'undervalued'
          : overprice >= 70 ? 'severely_overpriced'
          : overprice >= 30 ? 'overpriced'
          : 'fair';

        await sb.from('price_inefficiency_index').upsert({
          property_id: p.id,
          district: dist,
          current_price: price,
          estimated_fmv: median,
          fmv_ratio: Math.round(fmvRatio * 100) / 100,
          undervaluation_score: underval,
          overpricing_score: overprice,
          speculative_appreciation_score: speculative,
          stagnation_risk_score: stagnation,
          pricing_inefficiency_score: Math.max(0, Math.min(100, inefficiency)),
          inefficiency_type: type,
          days_on_market: dom,
          total_views: views,
          total_inquiries: inquiries,
          offer_count: 0,
          scoring_inputs: { median, fmvRatio, dom },
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_pii_property' });
        count++;
      }
      results.inefficiency_scored = count;
    }

    // ── 2. Dynamic Pricing Guidance ──
    if (mode === 'full' || mode === 'guidance') {
      let count = 0;
      for (const p of (properties || [])) {
        const dist = p.district || p.city || 'unknown';
        const price = p.price || 0;
        const median = districtMedian.get(dist) || price || 1;
        const fmvRatio = median > 0 ? price / median : 1;
        const dom = Math.max(1, Math.round((Date.now() - new Date(p.created_at).getTime()) / 86400000));
        const views = p.views_count ?? 0;
        const inquiries = p.inquiries_count ?? 0;
        const viewToOffer = views > 0 ? inquiries / views : 0;

        const low = Math.round(median * 0.90);
        const mid = Math.round(median * 1.0);
        const high = Math.round(median * 1.10);
        const liquidityOptimal = Math.round(median * 0.97);

        let urgencyDiscount = 0;
        if (dom > 60 && inquiries < 2) urgencyDiscount = 8;
        else if (dom > 45 && inquiries < 3) urgencyDiscount = 5;
        else if (dom > 30 && inquiries < 5) urgencyDiscount = 3;

        const grade = viewToOffer > 0.15 ? 'A'
          : viewToOffer > 0.08 ? 'B'
          : viewToOffer > 0.04 ? 'C'
          : viewToOffer > 0.02 ? 'D'
          : 'F';

        const zone = fmvRatio < 0.90 ? 'quick_sale'
          : fmvRatio < 0.98 ? 'sweet_spot'
          : fmvRatio < 1.08 ? 'fair'
          : fmvRatio < 1.18 ? 'premium'
          : 'overreach';

        let direction: string = 'hold';
        let adjustPct = 0;
        if (dom > 60 && inquiries < 2) { direction = 'reduce_urgent'; adjustPct = -8; }
        else if (dom > 30 && fmvRatio > 1.15) { direction = 'reduce'; adjustPct = -5; }
        else if (dom < 7 && inquiries > 10) { direction = 'increase_aggressive'; adjustPct = 5; }
        else if (viewToOffer > 0.2) { direction = 'increase'; adjustPct = 3; }

        const narrative = direction === 'reduce_urgent'
          ? `⚠️ Listing stagnating at ${dom} days with minimal interest. Suggest ${Math.abs(adjustPct)}% price reduction to reactivate demand.`
          : direction === 'increase_aggressive'
          ? `🔥 Strong demand detected — ${inquiries} inquiries in ${dom} days. Room to increase by ${adjustPct}%.`
          : `Priced ${zone === 'sweet_spot' ? 'optimally' : `in ${zone} zone`}. Grade ${grade} conversion efficiency.`;

        await sb.from('dynamic_pricing_guidance').upsert({
          property_id: p.id,
          district: dist,
          recommended_price_low: low,
          recommended_price_mid: mid,
          recommended_price_high: high,
          liquidity_optimal_price: liquidityOptimal,
          urgency_discount_pct: urgencyDiscount,
          view_to_offer_rate: Math.round(viewToOffer * 1000) / 1000,
          offer_rejection_ratio: 0,
          predicted_days_to_close: Math.max(7, Math.round(dom * (fmvRatio > 1.1 ? 1.5 : 1.0))),
          pricing_grade: grade,
          pricing_zone: zone,
          adjustment_direction: direction,
          suggested_adjustment_pct: adjustPct,
          guidance_narrative: narrative,
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_dpg_property' });
        count++;
      }
      results.guidance_generated = count;
    }

    // ── 3. District Price Stabilization ──
    if (mode === 'full' || mode === 'stabilization') {
      let count = 0;
      for (const [district, prices] of districtPrices.entries()) {
        if (prices.length < 2) continue;
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const sorted = [...prices].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const variance = prices.reduce((s, p) => s + (p - avg) ** 2, 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const volatility = avg > 0 ? (stdDev / avg) * 100 : 0;

        const bubble = bubbleMap.get(district);
        const cascadeRisk = bubble?.risk_level === 'critical' ? 80
          : bubble?.risk_level === 'high' ? 50
          : 20;
        const panicRisk = volatility > 30 ? 70 : volatility > 15 ? 40 : 10;

        const smoothing = volatility > 25 ? 0.7
          : volatility > 15 ? 0.85
          : 1.0;

        const trend = volatility > 30 ? (cascadeRisk > 50 ? 'crashing' : 'surging')
          : volatility > 15 ? 'rising'
          : 'stable';

        const mode2 = cascadeRisk > 60 || panicRisk > 60 ? 'emergency'
          : cascadeRisk > 40 || volatility > 20 ? 'intervention'
          : volatility > 12 ? 'dampening'
          : 'normal';

        const interventions = [];
        if (mode2 === 'emergency') interventions.push('freeze_new_listings_pricing', 'alert_all_agents');
        else if (mode2 === 'intervention') interventions.push('flag_speculative_listings', 'increase_fmv_visibility');

        await sb.from('district_price_stabilization').upsert({
          district,
          median_price: median,
          avg_price: Math.round(avg),
          price_volatility_30d: Math.round(volatility * 10) / 10,
          price_volatility_90d: Math.round(volatility * 0.8 * 10) / 10,
          price_trend_direction: trend,
          price_smoothing_coefficient: smoothing,
          volatility_guardrail_upper: 1 + Math.min(volatility / 100, 0.2),
          volatility_guardrail_lower: 1 - Math.min(volatility / 100, 0.2),
          bubble_cascade_risk: cascadeRisk,
          panic_discount_risk: panicRisk,
          stabilization_mode: mode2,
          active_interventions: interventions,
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_dps_district_segment' });
        count++;
      }
      results.stabilization_computed = count;
    }

    // ── 4. Negotiation Intelligence ──
    if (mode === 'full' || mode === 'negotiation') {
      let count = 0;
      for (const p of (properties || [])) {
        const dist = p.district || p.city || 'unknown';
        const price = p.price || 0;
        const median = districtMedian.get(dist) || price || 1;
        const fmvRatio = median > 0 ? price / median : 1;
        const inquiries = p.inquiries_count ?? 0;
        const capitalGrav = gravityMap.get(dist) ?? 50;

        const buyerUrgency = Math.min(capitalGrav * 1.2, 100);
        const sellerFlex = fmvRatio > 1.1 ? Math.min((fmvRatio - 1) * 150, 80) : 20;

        const closeLow = Math.round(price * 0.88);
        const closeMid = Math.round(price * 0.94);
        const closeHigh = Math.round(price * 0.98);

        const closeAtAsking = fmvRatio <= 0.95 ? 75 : fmvRatio <= 1.05 ? 50 : fmvRatio <= 1.15 ? 25 : 10;
        const closeAt5 = Math.min(closeAtAsking + 20, 90);
        const closeAt10 = Math.min(closeAtAsking + 35, 95);

        const predictedDiscount = fmvRatio > 1.1 ? Math.min((fmvRatio - 1) * 50, 15) : fmvRatio < 0.9 ? 0 : 3;

        const power = buyerUrgency > 70 && sellerFlex < 30 ? 'seller_strong'
          : buyerUrgency > 55 ? 'seller_slight'
          : sellerFlex > 60 ? 'buyer_strong'
          : sellerFlex > 40 ? 'buyer_slight'
          : 'balanced';

        const narrative = power.startsWith('seller')
          ? `Seller holds negotiation leverage — high buyer urgency (${buyerUrgency.toFixed(0)}) with ${inquiries} interested parties.`
          : power.startsWith('buyer')
          ? `Buyer advantage — listing overpriced by ${((fmvRatio - 1) * 100).toFixed(0)}% with low competition. Target ${predictedDiscount.toFixed(0)}% discount.`
          : `Balanced negotiation dynamics. Expected close at ${(100 - predictedDiscount).toFixed(0)}% of asking.`;

        await sb.from('negotiation_intelligence').upsert({
          property_id: p.id,
          district: dist,
          avg_counter_offer_discount_pct: predictedDiscount * 0.6,
          avg_rounds_to_close: fmvRatio > 1.1 ? 3 : 2,
          buyer_urgency_index: buyerUrgency,
          seller_flexibility_index: sellerFlex,
          deal_close_price_low: closeLow,
          deal_close_price_mid: closeMid,
          deal_close_price_high: closeHigh,
          close_probability_at_asking: closeAtAsking,
          close_probability_at_5pct_discount: closeAt5,
          close_probability_at_10pct_discount: closeAt10,
          optimal_opening_offer_pct: Math.round((1 - predictedDiscount / 100 - 0.03) * 100) / 100,
          predicted_final_discount_pct: predictedDiscount,
          negotiation_power: power,
          insight_narrative: narrative,
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_ni_property' });
        count++;
      }
      results.negotiation_computed = count;
    }

    // ── 5. Autonomous Influence Signals ──
    if (mode === 'full' || mode === 'influence') {
      const { data: inefficiencies } = await sb
        .from('price_inefficiency_index')
        .select('*')
        .in('inefficiency_type', ['severely_overpriced', 'severely_undervalued', 'speculative'])
        .limit(30);

      let count = 0;
      for (const ineff of (inefficiencies || [])) {
        const signals: Array<{ role: string; type: string; headline: string; message: string; action: string; urgency: number }> = [];

        if (ineff.inefficiency_type === 'severely_overpriced') {
          signals.push({
            role: 'seller', type: 'price_nudge',
            headline: '📉 Pricing alert: Your listing may be overpriced',
            message: `Your property is priced ${((ineff.fmv_ratio - 1) * 100).toFixed(0)}% above market median. Consider adjusting for faster liquidity.`,
            action: 'Review pricing guidance', urgency: 75,
          });
          signals.push({
            role: 'agent', type: 'market_warning',
            headline: '⚠️ Overpriced listing in portfolio',
            message: `Property in ${ineff.district} showing stagnation at ${ineff.days_on_market} days.`,
            action: 'Recommend price adjustment to seller', urgency: 65,
          });
        }
        if (ineff.inefficiency_type === 'severely_undervalued') {
          signals.push({
            role: 'investor', type: 'opportunity_flag',
            headline: '🎯 Undervalued asset detected',
            message: `Property in ${ineff.district} priced ${((1 - ineff.fmv_ratio) * 100).toFixed(0)}% below market — high upside potential.`,
            action: 'Schedule viewing or make offer', urgency: 85,
          });
        }
        if (ineff.inefficiency_type === 'speculative') {
          signals.push({
            role: 'system', type: 'market_warning',
            headline: '🫧 Speculative pricing detected',
            message: `${ineff.district}: FMV ratio ${ineff.fmv_ratio}× suggests speculative pricing.`,
            action: 'Flag for stabilization review', urgency: 90,
          });
        }

        for (const s of signals) {
          await sb.from('pricing_influence_signals').insert({
            property_id: ineff.property_id,
            district: ineff.district,
            target_role: s.role,
            signal_type: s.type,
            headline: s.headline,
            message: s.message,
            suggested_action: s.action,
            urgency_score: s.urgency,
            trigger_source: 'pricing_intelligence_engine',
            trigger_metrics: { inefficiency_type: ineff.inefficiency_type, score: ineff.pricing_inefficiency_score },
            status: 'pending',
            expires_at: new Date(Date.now() + 3 * 86400000).toISOString(),
          });
          count++;
        }
      }
      results.influence_signals_created = count;
    }

    // Emit engine signal
    await sb.from('ai_event_signals').insert({
      event_type: 'pricing_intelligence_engine_cycle',
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
