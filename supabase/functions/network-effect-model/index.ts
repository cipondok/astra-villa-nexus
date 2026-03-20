import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PSNEMRequest {
  mode: 'dashboard' | 'marketplace_growth' | 'liquidity_density' | 'data_compounding' | 'tipping_points' | 'optimization';
  city?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body: PSNEMRequest = await req.json();
    const { mode } = body;
    const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (mode === 'dashboard') {
      const [g, l, d, t, o] = await Promise.all([
        supabase.from('psnem_marketplace_growth').select('*').order('computed_at', { ascending: false }).limit(20),
        supabase.from('psnem_liquidity_density').select('*').order('computed_at', { ascending: false }).limit(25),
        supabase.from('psnem_data_compounding').select('*').order('computed_at', { ascending: false }).limit(15),
        supabase.from('psnem_tipping_points').select('*').order('assessed_at', { ascending: false }).limit(20),
        supabase.from('psnem_optimization_levers').select('*').order('computed_at', { ascending: false }).limit(15),
      ]);
      return json({ engine: 'PSNEM', timestamp: new Date().toISOString(), marketplace_growth: g.data ?? [], liquidity_density: l.data ?? [], data_compounding: d.data ?? [], tipping_points: t.data ?? [], optimization_levers: o.data ?? [] });
    }

    if (mode === 'marketplace_growth') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Yogyakarta', 'Semarang'];

      const results = cities.map(city => {
        const investors = Math.floor(500 + Math.random() * 15000);
        const supply = Math.floor(200 + Math.random() * 5000);
        const vendors = Math.floor(50 + Math.random() * 2000);
        const financial = Math.floor(5 + Math.random() * 50);
        const total = investors + supply + vendors + financial;

        // Metcalfe's law: V ∝ n²
        const metcalfe = Math.log10(total * total) * 10;
        // Cross-side interactions: geometric mean of side ratios
        const crossSide = Math.sqrt((investors * supply) / (total * total)) * 100;
        // Marginal utility diminishes logarithmically but stays positive
        const marginalUtility = 100 / (1 + Math.log10(total));
        // Platform utility: weighted Metcalfe + cross-side density
        const utility = metcalfe * 0.5 + crossSide * 0.3 + marginalUtility * 0.2;

        const phase = total > 10000 ? 'exponential' : total > 3000 ? 'accelerating' : total > 1000 ? 'linear' : 'seeding';

        return {
          city, country: 'Indonesia',
          investor_count: investors, supply_creator_count: supply,
          vendor_count: vendors, financial_partner_count: financial,
          total_participants: total,
          cross_side_interaction_rate: +crossSide.toFixed(2),
          metcalfe_value_index: +metcalfe.toFixed(2),
          marginal_utility_per_user: +marginalUtility.toFixed(3),
          platform_utility_score: +utility.toFixed(2),
          growth_phase: phase,
        };
      });

      const { error } = await supabase.from('psnem_marketplace_growth').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({
        event_type: 'psnem_engine_cycle', entity_type: 'network_effect', entity_id: 'marketplace_growth',
        priority_level: 'normal', payload: { cities: cities.length, mode: 'growth_functions' },
      });

      return json({ success: true, cities_modeled: results.length, results });
    }

    if (mode === 'liquidity_density') {
      const clusters = [
        { city: 'Jakarta', district: 'Menteng' }, { city: 'Jakarta', district: 'Kebayoran' },
        { city: 'Jakarta', district: 'Sudirman' }, { city: 'Bali', district: 'Seminyak' },
        { city: 'Bali', district: 'Canggu' }, { city: 'Surabaya', district: 'Citraland' },
        { city: 'Bandung', district: 'Dago' }, { city: 'Yogyakarta', district: 'Sleman' },
      ];

      const results = clusters.map(c => {
        const txVol = Math.floor(10 + Math.random() * 500);
        // Density = txVol / area (normalized)
        const density = Math.min(100, txVol * 0.3 + Math.random() * 20);
        // Price discovery efficiency: improves with sqrt of volume
        const priceDiscovery = Math.min(100, 20 + Math.sqrt(txVol) * 5);
        // Deal success: logistic curve of density
        const dealSuccess = 100 / (1 + Math.exp(-(density - 50) / 15));
        // Bid-ask compression: higher density = tighter spreads
        const spreadComp = Math.min(100, density * 0.8 + Math.random() * 15);
        const liquidityDepth = (priceDiscovery * 0.3 + dealSuccess * 0.35 + spreadComp * 0.35);
        const critMass = liquidityDepth > 65;

        return {
          city: c.city, country: 'Indonesia', district: c.district,
          transaction_volume_monthly: txVol,
          geographic_cluster_density: +density.toFixed(2),
          price_discovery_efficiency: +priceDiscovery.toFixed(2),
          deal_success_probability: +dealSuccess.toFixed(2),
          bid_ask_spread_compression: +spreadComp.toFixed(2),
          liquidity_depth_score: +liquidityDepth.toFixed(2),
          critical_mass_reached: critMass,
          density_tier: critMass ? 'dense' : density > 40 ? 'moderate' : 'sparse',
        };
      });

      const { error } = await supabase.from('psnem_liquidity_density').insert(results);
      if (error) throw error;
      return json({ success: true, clusters_analyzed: results.length, results });
    }

    if (mode === 'data_compounding') {
      const domains = [
        'price_prediction', 'demand_forecasting', 'opportunity_scoring',
        'investor_matching', 'risk_assessment', 'market_cycle_detection',
      ];

      const results = domains.map(domain => {
        const dataPoints = Math.floor(1000000 + Math.random() * 50000000);
        // Accuracy follows logarithmic improvement: a = base + k * ln(dataPoints)
        const base = 45;
        const k = 3.2;
        const accuracy1x = base + k * Math.log(dataPoints);
        const accuracy10x = base + k * Math.log(dataPoints * 10);
        const recQuality = Math.min(100, accuracy1x * 0.8 + Math.random() * 15);
        const retentionLift = Math.min(40, (accuracy1x - 60) * 0.8);
        // Switching cost: proportional to accuracy advantage
        const switchCost = Math.min(100, accuracy1x * 0.6 + recQuality * 0.3);
        // Compounding rate: how fast accuracy improves per doubling of data
        const compoundRate = k * Math.LN2;
        const moatDepth = switchCost * 0.4 + (accuracy1x - 50) * 0.3 + dataPoints / 10000000;
        const replicationYears = Math.max(1, moatDepth / 15);

        return {
          data_domain: domain,
          total_data_points: dataPoints,
          predictive_accuracy_pct: +Math.min(98, accuracy1x).toFixed(1),
          accuracy_at_1x_scale: +Math.min(98, accuracy1x).toFixed(1),
          accuracy_at_10x_scale: +Math.min(99, accuracy10x).toFixed(1),
          recommendation_quality_score: +recQuality.toFixed(2),
          investor_retention_lift_pct: +Math.max(0, retentionLift).toFixed(2),
          switching_cost_index: +switchCost.toFixed(2),
          compounding_rate: +compoundRate.toFixed(4),
          moat_depth_score: +moatDepth.toFixed(2),
          competitor_replication_years: +replicationYears.toFixed(1),
        };
      });

      const { error } = await supabase.from('psnem_data_compounding').insert(results);
      if (error) throw error;
      return json({ success: true, domains_modeled: results.length, results });
    }

    if (mode === 'tipping_points') {
      const cities = ['Jakarta', 'Bali', 'Surabaya', 'Bandung'];
      const milestones = [
        { name: 'Self-Reinforcing Growth', metric: 'monthly_organic_signups', threshold: 5000 },
        { name: 'Competitor Entry Barrier', metric: 'data_points_millions', threshold: 50 },
        { name: 'Brand Reference Standard', metric: 'unaided_brand_recall_pct', threshold: 60 },
        { name: 'Liquidity Critical Mass', metric: 'monthly_transactions', threshold: 1000 },
        { name: 'Vendor Lock-In', metric: 'vendor_revenue_dependency_pct', threshold: 40 },
      ];

      const results = cities.flatMap(city => milestones.map(m => {
        const current = m.threshold * (0.2 + Math.random() * 1.0);
        const progress = Math.min(100, (current / m.threshold) * 100);
        const reached = current >= m.threshold;
        return {
          city, country: 'Indonesia',
          milestone_name: m.name,
          threshold_metric: m.metric,
          threshold_value: m.threshold,
          current_value: +current.toFixed(2),
          progress_pct: +progress.toFixed(1),
          is_reached: reached,
          reached_at: reached ? new Date().toISOString() : null,
          self_reinforcing_strength: reached ? +(60 + Math.random() * 35).toFixed(2) : +(Math.random() * 30).toFixed(2),
          competitor_entry_barrier: +(20 + progress * 0.7).toFixed(2),
          brand_reference_score: +(10 + progress * 0.8).toFixed(2),
          effect_type: m.name.includes('Growth') ? 'growth_acceleration' : m.name.includes('Barrier') ? 'defensive_moat' : 'market_standard',
        };
      }));

      const { error } = await supabase.from('psnem_tipping_points').insert(results);
      if (error) throw error;
      return json({ success: true, tipping_points_assessed: results.length, results });
    }

    if (mode === 'optimization') {
      const levers = [
        { name: 'User Acquisition CAC', cat: 'acquisition', current: 25, optimal: 18 },
        { name: 'Geographic Expansion Rate', cat: 'geographic', current: 2, optimal: 4 },
        { name: 'Monetization Take Rate', cat: 'monetization', current: 3.5, optimal: 2.5 },
        { name: 'Vendor Commission Rate', cat: 'monetization', current: 15, optimal: 12 },
        { name: 'Referral Incentive Amount', cat: 'acquisition', current: 50, optimal: 75 },
        { name: 'Free Tier Feature Depth', cat: 'ecosystem', current: 60, optimal: 75 },
        { name: 'Data API Access Level', cat: 'ecosystem', current: 40, optimal: 65 },
        { name: 'Premium Conversion Funnel', cat: 'monetization', current: 5, optimal: 8 },
      ];

      const results = levers.map(l => {
        const sensitivity = 30 + Math.random() * 65;
        const delta = l.optimal - l.current;
        const growthImpact = delta * sensitivity * 0.01;
        const retentionImpact = Math.abs(delta) * (Math.random() * 0.5);
        const monetizationImpact = l.cat === 'monetization' ? delta * -2 : delta * 0.5;
        const cost = Math.abs(delta) * 10000;
        const roi = Math.abs(growthImpact * 50000 / Math.max(1, cost));

        return {
          lever_name: l.name, lever_category: l.cat,
          current_setting: l.current, optimal_setting: l.optimal,
          sensitivity_score: +sensitivity.toFixed(2),
          impact_on_growth_pct: +growthImpact.toFixed(2),
          impact_on_retention_pct: +retentionImpact.toFixed(2),
          impact_on_monetization_pct: +monetizationImpact.toFixed(2),
          cost_to_adjust: +cost.toFixed(0),
          roi_of_adjustment: +roi.toFixed(2),
          recommended_action: roi > 2 ? 'implement_immediately' : roi > 1 ? 'test_and_iterate' : 'deprioritize',
          simulation_result: { delta, projected_users_impact: Math.floor(growthImpact * 1000), payback_months: Math.ceil(cost / (roi * 10000)) },
        };
      });

      const { error } = await supabase.from('psnem_optimization_levers').insert(results);
      if (error) throw error;
      return json({ success: true, levers_optimized: results.length, results });
    }

    return json({ error: 'Invalid mode' });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
