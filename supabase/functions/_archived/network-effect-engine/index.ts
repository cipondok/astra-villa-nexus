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

    // ── 1. Network Density Scoring ──
    if (mode === 'full' || mode === 'density') {
      // Aggregate city-level signals from existing tables
      const { data: expansionTargets } = await sb.from('supply_expansion_targets').select('city, current_listings, current_agents, demand_score');
      const { data: capitalGravity } = await sb.from('district_capital_gravity').select('city, capital_gravity_score');
      const { data: dealDominance } = await sb.from('district_deal_dominance').select('district, total_active_deals, dominant_listings');
      const { data: vendorRegions } = await sb.from('vendor_service_regions').select('district');

      // Build city aggregates
      const cityMap = new Map<string, {
        investors: number; vendors: number; agents: number; listings: number;
        deals: number; referrals: number; demandScore: number; gravitySum: number; gravityCount: number;
      }>();

      for (const t of (expansionTargets || [])) {
        const city = t.city;
        if (!cityMap.has(city)) cityMap.set(city, { investors: 0, vendors: 0, agents: 0, listings: 0, deals: 0, referrals: 0, demandScore: 0, gravitySum: 0, gravityCount: 0 });
        const c = cityMap.get(city)!;
        c.listings += t.current_listings ?? 0;
        c.agents += t.current_agents ?? 0;
        c.demandScore = Math.max(c.demandScore, t.demand_score ?? 0);
      }

      for (const g of (capitalGravity || [])) {
        const city = g.city || 'unknown';
        if (!cityMap.has(city)) cityMap.set(city, { investors: 0, vendors: 0, agents: 0, listings: 0, deals: 0, referrals: 0, demandScore: 0, gravitySum: 0, gravityCount: 0 });
        const c = cityMap.get(city)!;
        c.gravitySum += g.capital_gravity_score ?? 0;
        c.gravityCount++;
        c.investors += Math.round((g.capital_gravity_score ?? 0) / 10);
      }

      for (const d of (dealDominance || [])) {
        const city = (d.district || '').split('-')[0] || d.district;
        const c = cityMap.get(city);
        if (c) c.deals += d.total_active_deals ?? 0;
      }

      for (const v of (vendorRegions || [])) {
        const city = (v.district || '').split('-')[0] || v.district;
        const c = cityMap.get(city);
        if (c) c.vendors++;
      }

      let densityCount = 0;
      for (const [city, m] of cityMap.entries()) {
        const totalNodes = m.investors + m.vendors + m.agents;
        const investorConc = Math.min(m.investors / 20, 1) * 100;
        const vendorDepth = Math.min(m.vendors / 15, 1) * 100;
        const dealFreq = Math.min(m.deals / 30, 1) * 100;
        const referralVel = Math.min(m.referrals / 10, 1) * 100 || Math.min(m.demandScore, 100) * 0.5;

        const density = Math.round(
          investorConc * 0.30 + vendorDepth * 0.25 + dealFreq * 0.25 + referralVel * 0.20
        );

        // Metcalfe's law: value ∝ n²
        const metcalfe = Math.round(totalNodes * totalNodes * 0.1);

        const tier = density >= 85 ? 'singularity'
          : density >= 65 ? 'critical_mass'
          : density >= 45 ? 'growing'
          : density >= 25 ? 'emerging'
          : 'nascent';

        await sb.from('city_network_density').upsert({
          city,
          investor_concentration_score: investorConc,
          vendor_service_depth_score: vendorDepth,
          deal_activity_frequency_score: dealFreq,
          referral_propagation_velocity: referralVel,
          active_investors: m.investors,
          active_vendors: m.vendors,
          active_agents: m.agents,
          active_listings: m.listings,
          deals_30d: m.deals,
          referrals_30d: m.referrals,
          network_density_score: Math.max(0, Math.min(100, density)),
          density_tier: tier,
          metcalfe_value_proxy: metcalfe,
          scoring_inputs: { totalNodes, demandScore: m.demandScore },
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_cnd_city' });

        densityCount++;
      }
      results.density_scored = densityCount;
    }

    // ── 2. Liquidity Lock-In ──
    if (mode === 'full' || mode === 'lockin') {
      const { data: densities } = await sb.from('city_network_density').select('*');
      const { data: capitalGravity } = await sb.from('district_capital_gravity').select('city, capital_gravity_score, deal_close_reliability_score');

      const cityGravity = new Map<string, { avgGravity: number; avgClose: number; count: number }>();
      for (const g of (capitalGravity || [])) {
        const city = g.city || 'unknown';
        if (!cityGravity.has(city)) cityGravity.set(city, { avgGravity: 0, avgClose: 0, count: 0 });
        const c = cityGravity.get(city)!;
        c.avgGravity += g.capital_gravity_score ?? 0;
        c.avgClose += g.deal_close_reliability_score ?? 0;
        c.count++;
      }

      let lockCount = 0;
      for (const d of (densities || [])) {
        const grav = cityGravity.get(d.city);
        const avgGravity = grav && grav.count > 0 ? grav.avgGravity / grav.count : 50;
        const avgClose = grav && grav.count > 0 ? grav.avgClose / grav.count : 50;

        const actToRoi = Math.min(d.network_density_score * 0.8 / 100, 1);
        const roiToCapital = Math.min(avgGravity / 100, 1);
        const capitalToClosure = Math.min(avgClose / 100, 1);
        const momentum = Math.round((actToRoi + roiToCapital + capitalToClosure) / 3 * 100);

        const repeatPct = d.density_tier === 'singularity' ? 75
          : d.density_tier === 'critical_mass' ? 55
          : d.density_tier === 'growing' ? 35
          : 15;

        const lockIn = Math.round(
          momentum * 0.40 + repeatPct * 0.30 + d.network_density_score * 0.30
        );

        const lockTier = lockIn >= 80 ? 'impregnable'
          : lockIn >= 60 ? 'strong'
          : lockIn >= 40 ? 'moderate'
          : lockIn >= 20 ? 'weak'
          : 'none';

        const trend = momentum > 70 ? 'accelerating'
          : momentum > 50 ? 'growing'
          : momentum > 30 ? 'stable'
          : momentum > 15 ? 'declining'
          : 'stalled';

        await sb.from('liquidity_lock_in_metrics').upsert({
          city: d.city,
          activity_to_roi_correlation: actToRoi,
          roi_to_capital_correlation: roiToCapital,
          capital_to_closure_correlation: capitalToClosure,
          flywheel_momentum_score: momentum,
          avg_investor_roi_pct: avgGravity * 0.15,
          capital_inflow_trend: trend,
          avg_days_to_close: 90 - avgClose * 0.6,
          repeat_investor_pct: repeatPct,
          portfolio_depth_avg: d.active_listings > 0 ? d.active_investors / Math.max(1, d.active_listings / 10) : 0,
          lock_in_strength: Math.max(0, Math.min(100, lockIn)),
          lock_in_tier: lockTier,
          insights: { momentum, repeatPct, density_tier: d.density_tier },
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_llm_city' });

        lockCount++;
      }
      results.lockin_computed = lockCount;
    }

    // ── 3. Viral Growth Multipliers ──
    if (mode === 'full' || mode === 'viral') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: densities } = await sb.from('city_network_density').select('*');

      let viralCount = 0;
      for (const d of (densities || [])) {
        const totalUsers = d.active_investors + d.active_vendors + d.active_agents;
        const kFactor = totalUsers > 5 ? Math.min(d.referral_propagation_velocity / 50, 2.5) : 0.1;
        const convRate = Math.min(d.network_density_score / 200, 0.5);
        const cycleTime = kFactor > 1 ? 7 : kFactor > 0.5 ? 14 : 30;

        const growthRate = kFactor > 1 ? kFactor * 0.15 : kFactor * 0.05;
        const proj30 = Math.round(totalUsers * (1 + growthRate));
        const proj90 = Math.round(totalUsers * Math.pow(1 + growthRate, 3));

        const multiplierTier = kFactor >= 1.5 ? 'exponential'
          : kFactor >= 1.0 ? 'superlinear'
          : kFactor >= 0.5 ? 'linear'
          : kFactor >= 0.2 ? 'sublinear'
          : 'stalled';

        await sb.from('viral_growth_multipliers').upsert({
          city: d.city,
          period_month: currentMonth,
          k_factor: Math.round(kFactor * 100) / 100,
          referral_conversion_rate: Math.round(convRate * 1000) / 1000,
          organic_to_referred_ratio: kFactor > 0 ? Math.round(1 / kFactor * 10) / 10 : 10,
          viral_cycle_time_days: cycleTime,
          tier_1_referrals: Math.round(d.referrals_30d * 0.6),
          tier_2_referrals: Math.round(d.referrals_30d * 0.3),
          tier_3_referrals: Math.round(d.referrals_30d * 0.1),
          reward_roi: kFactor > 0.5 ? Math.round(kFactor * 3 * 100) / 100 : 0,
          compounding_growth_rate: Math.round(growthRate * 10000) / 10000,
          projected_users_30d: proj30,
          projected_users_90d: proj90,
          multiplier_tier: multiplierTier,
          last_computed_at: new Date().toISOString(),
        }, { onConflict: 'idx_vgm_city_period' });

        viralCount++;
      }
      results.viral_computed = viralCount;
    }

    // ── 4. Flywheel Synchronization ──
    if (mode === 'full' || mode === 'sync') {
      const { data: densities } = await sb.from('city_network_density').select('*');
      const { data: lockins } = await sb.from('liquidity_lock_in_metrics').select('*');
      const { data: balances } = await sb.from('district_marketplace_balance').select('district, marketplace_balance_score');
      const { data: dealDom } = await sb.from('district_deal_dominance').select('district, dominance_efficiency_score');
      const { data: priceStab } = await sb.from('district_price_stabilization').select('district, stabilization_mode');

      const lockMap = new Map((lockins || []).map(l => [l.city, l]));

      // Build city-level engine health from district data
      const cityEngines = new Map<string, { vendor: number[]; deal: number[]; pricing: number[] }>();
      for (const b of (balances || [])) {
        const city = (b.district || '').split('-')[0] || b.district;
        if (!cityEngines.has(city)) cityEngines.set(city, { vendor: [], deal: [], pricing: [] });
        cityEngines.get(city)!.vendor.push(b.marketplace_balance_score ?? 0);
      }
      for (const dd of (dealDom || [])) {
        const city = (dd.district || '').split('-')[0] || dd.district;
        if (!cityEngines.has(city)) cityEngines.set(city, { vendor: [], deal: [], pricing: [] });
        cityEngines.get(city)!.deal.push(dd.dominance_efficiency_score ?? 0);
      }
      for (const ps of (priceStab || [])) {
        const city = (ps.district || '').split('-')[0] || ps.district;
        if (!cityEngines.has(city)) cityEngines.set(city, { vendor: [], deal: [], pricing: [] });
        const score = ps.stabilization_mode === 'normal' ? 90 : ps.stabilization_mode === 'dampening' ? 60 : ps.stabilization_mode === 'intervention' ? 35 : 10;
        cityEngines.get(city)!.pricing.push(score);
      }

      let syncCount = 0;
      for (const d of (densities || [])) {
        const lock = lockMap.get(d.city);
        const engines = cityEngines.get(d.city);

        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 50;

        const vendorH = engines ? avg(engines.vendor) : 50;
        const capitalH = lock?.flywheel_momentum_score ?? 50;
        const dealH = engines ? avg(engines.deal) : 50;
        const pricingH = engines ? avg(engines.pricing) : 50;
        const networkH = d.network_density_score;

        const scores = [vendorH, capitalH, dealH, pricingH, networkH];
        const syncScore = Math.round(scores.reduce((a, b) => a + b, 0) / 5);
        const minScore = Math.min(...scores);
        const labels = ['vendor_engine', 'capital_engine', 'deal_dominance', 'pricing_engine', 'network_density'];
        const weakest = labels[scores.indexOf(minScore)];

        const bottleneck = weakest === 'vendor_engine' ? 'Accelerate vendor acquisition campaigns'
          : weakest === 'capital_engine' ? 'Increase investor outreach and capital routing'
          : weakest === 'deal_dominance' ? 'Boost deal gravity via listing quality and pricing'
          : weakest === 'pricing_engine' ? 'Stabilize district pricing and reduce volatility'
          : 'Grow network density through referral and engagement';

        const rpm = Math.round(syncScore * (lock?.flywheel_momentum_score ?? 50) / 100);
        const trend = rpm > 70 ? 'accelerating' : rpm > 40 ? 'stable' : rpm > 15 ? 'decelerating' : 'stalled';
        const singularityMonths = syncScore >= 80 ? 3 : syncScore >= 60 ? 6 : syncScore >= 40 ? 12 : 24;

        await sb.from('flywheel_sync_state').upsert({
          city: d.city,
          vendor_engine_health: Math.round(vendorH),
          capital_engine_health: Math.round(capitalH),
          deal_dominance_health: Math.round(dealH),
          pricing_engine_health: Math.round(pricingH),
          network_density_health: Math.round(networkH),
          sync_score: Math.max(0, Math.min(100, syncScore)),
          weakest_link: weakest,
          bottleneck_action: bottleneck,
          flywheel_rpm: rpm,
          acceleration_trend: trend,
          estimated_singularity_months: singularityMonths,
          engine_states: { vendorH, capitalH, dealH, pricingH, networkH },
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'idx_fss_city' });

        syncCount++;
      }
      results.flywheel_synced = syncCount;
    }

    // Emit engine signal
    await sb.from('ai_event_signals').insert({
      event_type: 'network_effect_engine_cycle',
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
