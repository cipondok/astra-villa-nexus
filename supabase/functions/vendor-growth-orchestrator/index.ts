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

    // ── 1. Compute District Marketplace Balance Scores ──
    if (mode === 'full' || mode === 'balance') {
      const { data: targets } = await sb.from('supply_acquisition_targets').select('*');
      const { data: regions } = await sb.from('vendor_service_regions').select('*');
      const { data: routing } = await sb.from('vendor_demand_routing').select('*');

      const districtMap = new Map<string, {
        liquidityIdx: number; supplyGap: number; demandVelocity: number;
        investorCount: number; vendorCount: number; avgClose: number;
        leads: number; segment: string | null;
      }>();

      for (const t of (targets || [])) {
        const key = t.district;
        districtMap.set(key, {
          liquidityIdx: t.liquidity_strength_index ?? 50,
          supplyGap: t.supply_gap_score ?? 0,
          demandVelocity: t.demand_velocity ?? 0,
          investorCount: t.investor_interest_count ?? 0,
          vendorCount: 0,
          avgClose: t.avg_days_to_close ?? 30,
          leads: 0,
          segment: t.segment_type,
        });
      }

      for (const r of (regions || [])) {
        const d = districtMap.get(r.district);
        if (d) d.vendorCount++;
      }

      for (const rt of (routing || [])) {
        const d = districtMap.get(rt.district);
        if (d) d.leads += rt.leads_generated ?? 0;
      }

      let balanceCount = 0;
      for (const [district, m] of districtMap.entries()) {
        const demandWeight = Math.min(m.liquidityIdx / 100, 1);
        const supplyDepth = Math.min(m.vendorCount / 20, 1);
        const velocity = Math.min(m.demandVelocity / 50, 1);
        const investorGrowth = Math.min(m.investorCount / 30, 1);
        const oversupply = m.vendorCount > 0 && m.leads > 0
          ? Math.max(0, (m.vendorCount / Math.max(m.leads, 1)) - 1) * 20
          : 0;

        const balance = Math.round(
          demandWeight * 30 + supplyDepth * 25 + velocity * 20 + investorGrowth * 15 - oversupply
        );

        const vendorToInvestor = m.investorCount > 0 ? m.vendorCount / m.investorCount : 0;
        const supplyPressure = Math.round(Math.max(0, 100 - m.supplyGap) * (1 + vendorToInvestor) / 2);
        const oversupplyDetected = m.vendorCount > 15 && m.leads < m.vendorCount * 2;
        const priceWarRisk = oversupplyDetected && m.vendorCount > 25 ? 'critical'
          : oversupplyDetected ? 'high'
          : m.vendorCount > 10 && m.leads < m.vendorCount * 3 ? 'moderate'
          : 'low';

        const leadStarvation = m.vendorCount > 0
          ? Math.round(Math.max(0, 1 - m.leads / (m.vendorCount * 3)) * 100)
          : 0;

        let action = 'monitor';
        if (priceWarRisk === 'critical') action = 'throttle_onboarding';
        else if (priceWarRisk === 'high') action = 'redistribute_routing';
        else if (m.supplyGap > 60) action = 'accelerate_acquisition';
        else if (balance > 70) action = 'maintain_growth';

        await sb.from('district_marketplace_balance').upsert({
          district,
          segment_type: m.segment ?? null,
          vendor_supply_pressure: supplyPressure,
          vendor_category_gap_index: m.supplyGap,
          investor_demand_to_vendor_ratio: vendorToInvestor,
          service_completion_delay_risk: Math.min(m.avgClose / 60, 1) * 100,
          marketplace_balance_score: Math.max(0, Math.min(100, balance)),
          demand_liquidity_weight: demandWeight * 100,
          vendor_supply_depth: supplyDepth * 100,
          deal_velocity: velocity * 100,
          investor_interest_growth: investorGrowth * 100,
          oversupply_penalty: oversupply,
          oversupply_detected: oversupplyDetected,
          price_war_risk_level: priceWarRisk,
          lead_starvation_pct: leadStarvation,
          recommended_action: action,
          scoring_inputs: { vendorCount: m.vendorCount, leads: m.leads, investorCount: m.investorCount },
          last_computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'idx_dmb_district_segment' });

        balanceCount++;
      }
      results.balance_scored = balanceCount;
    }

    // ── 2. Vendor Category Gap Analysis ──
    if (mode === 'full' || mode === 'gaps') {
      const serviceCategories = ['construction', 'renovation', 'interior_design', 'photography', 'legal', 'mortgage', 'property_management'];
      const { data: regions } = await sb.from('vendor_service_regions').select('district, segment_types');
      const { data: balances } = await sb.from('district_marketplace_balance').select('district, marketplace_balance_score, vendor_category_gap_index');

      const districtVendorCats = new Map<string, Map<string, number>>();
      for (const r of (regions || [])) {
        if (!districtVendorCats.has(r.district)) districtVendorCats.set(r.district, new Map());
        const cats = districtVendorCats.get(r.district)!;
        for (const seg of (r.segment_types || [])) {
          cats.set(seg, (cats.get(seg) || 0) + 1);
        }
      }

      let gapCount = 0;
      const balanceMap = new Map((balances || []).map(b => [b.district, b]));

      for (const [district, cats] of districtVendorCats.entries()) {
        const bal = balanceMap.get(district);
        const demandSignal = bal?.marketplace_balance_score ?? 50;

        for (const cat of serviceCategories) {
          const current = cats.get(cat) || 0;
          const idealMin = demandSignal > 60 ? 8 : demandSignal > 40 ? 5 : 3;
          const gapIndex = current < idealMin ? Math.round(((idealMin - current) / idealMin) * 100) : 0;

          if (gapIndex > 0) {
            await sb.from('vendor_category_expansion_targets').upsert({
              district,
              service_category: cat,
              current_vendor_count: current,
              target_vendor_count: idealMin,
              category_gap_index: gapIndex,
              demand_signal_strength: demandSignal,
              priority_rank: gapIndex > 70 ? 1 : gapIndex > 40 ? 2 : 3,
              last_computed_at: new Date().toISOString(),
            }, { onConflict: 'idx_vcet_uniq' });
            gapCount++;
          }
        }
      }
      results.category_gaps_computed = gapCount;
    }

    // ── 3. Expansion Sequencing ──
    if (mode === 'full' || mode === 'sequence') {
      const { data: balances } = await sb
        .from('district_marketplace_balance')
        .select('*')
        .gt('marketplace_balance_score', 30)
        .order('marketplace_balance_score', { ascending: false });

      const { data: gaps } = await sb
        .from('vendor_category_expansion_targets')
        .select('*')
        .gte('category_gap_index', 40)
        .order('category_gap_index', { ascending: false });

      let seqRank = 1;
      const sequenced: string[] = [];

      for (const gap of (gaps || []).slice(0, 20)) {
        const bal = (balances || []).find(b => b.district === gap.district);
        const capitalInflow = bal?.demand_liquidity_weight ?? 0;
        const liquidityAccel = bal?.deal_velocity ?? 0;
        const marketOpp = gap.category_gap_index;

        const composite = Math.round(
          capitalInflow * 0.30 + liquidityAccel * 0.25 + marketOpp * 0.30 +
          (bal?.investor_interest_growth ?? 0) * 0.15
        );

        await sb.from('expansion_sequencing_queue').insert({
          city: gap.district.split('-')[0] || gap.district,
          district: gap.district,
          segment_type: gap.segment_type,
          vendor_category: gap.service_category,
          sequence_rank: seqRank++,
          capital_inflow_score: capitalInflow,
          liquidity_acceleration: liquidityAccel,
          market_share_opportunity: marketOpp,
          composite_expansion_score: composite,
          status: 'queued',
        });
        sequenced.push(gap.district);
      }
      results.expansion_sequenced = sequenced.length;
    }

    // ── 4. Emit orchestrator signal ──
    await sb.from('ai_event_signals').insert({
      event_type: 'vendor_growth_orchestrator_cycle',
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
