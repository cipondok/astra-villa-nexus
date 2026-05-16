import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SupplyInsight {
  district: string;
  supply_pressure_score: number;
  priority_categories: string[];
  recruitment_urgency: 'critical' | 'high' | 'moderate' | 'low';
  recommended_incentive: string;
  estimated_revenue_impact: number;
  campaign_recommendation: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json().catch(() => ({}));
    const { city_filter, mode = 'analyze' } = body;

    // ── Gather supply signals ──
    const [balanceRes, gapsRes, campaignsRes, sequenceRes] = await Promise.all([
      sb.from('district_marketplace_balance').select('*').order('marketplace_balance_score', { ascending: true }),
      sb.from('vendor_category_expansion_targets').select('*').order('category_gap_index', { ascending: false }),
      sb.from('vendor_growth_campaigns').select('*').eq('status', 'active'),
      sb.from('expansion_sequencing_queue').select('*').eq('status', 'queued').order('sequence_rank').limit(20),
    ]);

    const balances = balanceRes.data || [];
    const gaps = gapsRes.data || [];
    const activeCampaigns = campaignsRes.data || [];
    const expansionQueue = sequenceRes.data || [];

    // ── Compute per-district supply insights ──
    const insights: SupplyInsight[] = [];
    const districtGaps = new Map<string, typeof gaps>();

    for (const g of gaps) {
      if (!districtGaps.has(g.district)) districtGaps.set(g.district, []);
      districtGaps.get(g.district)!.push(g);
    }

    for (const bal of balances) {
      if (city_filter && !bal.district.toLowerCase().includes(city_filter.toLowerCase())) continue;

      const dGaps = districtGaps.get(bal.district) || [];
      const priorityCats = dGaps
        .sort((a: any, b: any) => b.category_gap_index - a.category_gap_index)
        .slice(0, 3)
        .map((g: any) => g.service_category);

      const supplyPressure = bal.vendor_supply_pressure ?? 0;
      const gapAvg = dGaps.length > 0
        ? dGaps.reduce((s: number, g: any) => s + g.category_gap_index, 0) / dGaps.length
        : 0;

      // Composite supply pressure score
      const compositeScore = Math.round(
        supplyPressure * 0.3 +
        gapAvg * 0.3 +
        (bal.lead_starvation_pct ?? 0) * 0.2 +
        (bal.service_completion_delay_risk ?? 0) * 0.2
      );

      // Urgency classification
      const urgency: SupplyInsight['recruitment_urgency'] =
        compositeScore >= 70 ? 'critical'
        : compositeScore >= 50 ? 'high'
        : compositeScore >= 30 ? 'moderate'
        : 'low';

      // Incentive strategy
      const incentive =
        urgency === 'critical' ? 'Free premium listing 3 months + priority lead routing'
        : urgency === 'high' ? 'Reduced commission 50% for first 3 months'
        : urgency === 'moderate' ? 'Featured vendor badge + marketing support'
        : 'Standard onboarding package';

      // Revenue impact estimate (based on gap * demand)
      const demandWeight = bal.demand_liquidity_weight ?? 50;
      const revenueImpact = Math.round(
        dGaps.length * demandWeight * 150_000 * (compositeScore / 100)
      );

      // Campaign recommendation
      const campaign =
        urgency === 'critical'
          ? `Launch urgent ${priorityCats[0] || 'multi-category'} vendor blitz in ${bal.district}`
        : urgency === 'high'
          ? `Targeted recruitment for ${priorityCats.slice(0, 2).join(' & ')} vendors`
        : urgency === 'moderate'
          ? `Passive acquisition via referral incentives in ${bal.district}`
        : `Monitor — supply is adequate in ${bal.district}`;

      insights.push({
        district: bal.district,
        supply_pressure_score: compositeScore,
        priority_categories: priorityCats,
        recruitment_urgency: urgency,
        recommended_incentive: incentive,
        estimated_revenue_impact: revenueImpact,
        campaign_recommendation: campaign,
      });
    }

    // Sort by pressure
    insights.sort((a, b) => b.supply_pressure_score - a.supply_pressure_score);

    // ── Aggregate summary stats ──
    const criticalCount = insights.filter(i => i.recruitment_urgency === 'critical').length;
    const highCount = insights.filter(i => i.recruitment_urgency === 'high').length;
    const totalRevenueAtRisk = insights.reduce((s, i) => s + i.estimated_revenue_impact, 0);
    const avgPressure = insights.length > 0
      ? Math.round(insights.reduce((s, i) => s + i.supply_pressure_score, 0) / insights.length)
      : 0;

    // Category-level summary
    const categoryPressure = new Map<string, number>();
    for (const g of gaps) {
      const cat = g.service_category;
      categoryPressure.set(cat, (categoryPressure.get(cat) || 0) + g.category_gap_index);
    }
    const topCategories = Array.from(categoryPressure.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, pressure]) => ({ category, total_gap_pressure: pressure }));

    const result = {
      summary: {
        total_districts_analyzed: insights.length,
        critical_shortages: criticalCount,
        high_pressure_districts: highCount,
        avg_supply_pressure: avgPressure,
        total_revenue_at_risk: totalRevenueAtRisk,
        active_campaigns: activeCampaigns.length,
        queued_expansions: expansionQueue.length,
      },
      top_categories_needing_supply: topCategories,
      district_insights: insights.slice(0, 20),
      active_campaigns: activeCampaigns.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.campaign_name,
        district: c.district,
        category: c.target_vendor_category,
        target: c.target_vendor_count,
        acquired: c.acquired_vendor_count,
        urgency: c.urgency_score,
        status: c.status,
      })),
      expansion_queue: expansionQueue.slice(0, 10).map((e: any) => ({
        district: e.district,
        category: e.vendor_category,
        rank: e.sequence_rank,
        composite_score: e.composite_expansion_score,
      })),
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
