import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SWFPSRequest {
  mode: 'dashboard' | 'alignment' | 'structures' | 'stability' | 'mutual_value' | 'governance';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body: SWFPSRequest = await req.json();
    const { mode } = body;
    const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (mode === 'dashboard') {
      const [a, s, c, v, g] = await Promise.all([
        supabase.from('swfps_strategic_alignment').select('*').order('assessed_at', { ascending: false }).limit(20),
        supabase.from('swfps_partnership_structures').select('*').order('designed_at', { ascending: false }).limit(15),
        supabase.from('swfps_capital_stability').select('*').order('simulated_at', { ascending: false }).limit(10),
        supabase.from('swfps_mutual_value').select('*').order('assessed_at', { ascending: false }).limit(20),
        supabase.from('swfps_governance_trust').select('*').order('assessed_at', { ascending: false }).limit(15),
      ]);
      return json({ engine: 'SWFPS', timestamp: new Date().toISOString(), strategic_alignment: a.data ?? [], partnership_structures: s.data ?? [], capital_stability: c.data ?? [], mutual_value: v.data ?? [], governance_trust: g.data ?? [] });
    }

    if (mode === 'alignment') {
      const funds = [
        { name: 'GIC', country: 'Singapore' },
        { name: 'Temasek', country: 'Singapore' },
        { name: 'ADIA', country: 'UAE' },
        { name: 'Mubadala', country: 'UAE' },
        { name: 'PIF', country: 'Saudi Arabia' },
        { name: 'INA', country: 'Indonesia' },
        { name: 'Khazanah', country: 'Malaysia' },
        { name: 'CIC', country: 'China' },
      ];
      const domains = ['urban_modernization', 'crossborder_transparency', 'economic_diversification', 'smartcity_intelligence'];

      const results = funds.flatMap(f => domains.map(d => {
        const urban = Math.random() * 100;
        const cross = Math.random() * 100;
        const econ = Math.random() * 100;
        const smart = Math.random() * 100;
        const composite = urban * 0.25 + cross * 0.25 + econ * 0.25 + smart * 0.25;
        return {
          sovereign_fund_name: f.name, country: f.country, alignment_domain: d,
          platform_capability: d === 'urban_modernization' ? 'development_intelligence' : d === 'crossborder_transparency' ? 'transaction_analytics' : d === 'economic_diversification' ? 'market_discovery' : 'urban_data_platform',
          sovereign_priority_score: +(50 + Math.random() * 45).toFixed(1),
          alignment_strength: +composite.toFixed(2),
          urban_modernization_fit: +urban.toFixed(2),
          crossborder_transparency_fit: +cross.toFixed(2),
          economic_diversification_fit: +econ.toFixed(2),
          smartcity_intelligence_fit: +smart.toFixed(2),
          composite_alignment_score: +composite.toFixed(2),
          engagement_readiness: composite > 70 ? 'active_dialogue' : composite > 45 ? 'research' : 'monitoring',
        };
      }));

      const { error } = await supabase.from('swfps_strategic_alignment').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({ event_type: 'swfps_engine_cycle', entity_type: 'sovereign_strategy', entity_id: 'alignment', priority_level: 'normal', payload: { funds: funds.length, domains: domains.length } });

      return json({ success: true, alignments_mapped: results.length, results });
    }

    if (mode === 'structures') {
      const structures = [
        { fund: 'GIC', country: 'Singapore', type: 'strategic_equity', equity: 3.5, capital: 150000000 },
        { fund: 'Temasek', country: 'Singapore', type: 'joint_venture', equity: 0, capital: 80000000 },
        { fund: 'ADIA', country: 'UAE', type: 'coinvestment_pipeline', equity: 2.0, capital: 250000000 },
        { fund: 'PIF', country: 'Saudi Arabia', type: 'tech_integration', equity: 1.5, capital: 100000000 },
        { fund: 'INA', country: 'Indonesia', type: 'strategic_equity', equity: 5.0, capital: 200000000 },
        { fund: 'Mubadala', country: 'UAE', type: 'coinvestment_pipeline', equity: 0, capital: 180000000 },
      ];

      const results = structures.map(s => ({
        sovereign_fund_name: s.fund, country: s.country, structure_type: s.type,
        equity_stake_pct: s.equity,
        capital_commitment_usd: s.capital,
        joint_venture_scope: s.type === 'joint_venture' ? 'SE_Asia_Data_Intelligence' : null,
        coinvestment_pipeline_size: s.type === 'coinvestment_pipeline' ? Math.floor(10 + Math.random() * 40) : 0,
        tech_integration_depth: s.equity > 3 ? 'deep_embedded' : s.equity > 0 ? 'strategic_access' : 'api_access',
        governance_seats: s.equity >= 5 ? 1 : 0,
        exclusivity_terms: { geographic_exclusivity: s.country === 'Indonesia', data_exclusivity: false, duration_years: 5 },
        term_years: 7 + Math.floor(Math.random() * 8),
        structure_attractiveness: +(50 + Math.random() * 45).toFixed(2),
        negotiation_stage: Math.random() > 0.7 ? 'term_sheet' : Math.random() > 0.4 ? 'proposal' : 'concept',
      }));

      const { error } = await supabase.from('swfps_partnership_structures').insert(results);
      if (error) throw error;
      return json({ success: true, structures_designed: results.length, results });
    }

    if (mode === 'stability') {
      const scenarios = [
        { name: 'Single SWF $150M', capital: 150000000 },
        { name: 'Dual SWF $300M', capital: 300000000 },
        { name: 'Triple SWF $500M', capital: 500000000 },
        { name: 'Mega Alliance $1B', capital: 1000000000 },
      ];

      const results = scenarios.map(s => {
        const stability = Math.min(100, 30 + Math.log10(s.capital) * 8);
        const credLift = Math.min(50, s.capital / 20000000);
        const runway = Math.floor(s.capital / 2000000);
        const valPremium = Math.min(40, s.capital / 25000000);
        return {
          scenario_name: s.name,
          sovereign_capital_committed_usd: s.capital,
          funding_cycle_stability_index: +stability.toFixed(2),
          institutional_credibility_lift: +credLift.toFixed(2),
          emerging_market_expansion_count: Math.floor(s.capital / 50000000),
          runway_extension_months: runway,
          valuation_premium_pct: +valPremium.toFixed(1),
          counter_cyclical_buffer_usd: +(s.capital * 0.2).toFixed(0),
          dilution_impact_pct: +(s.capital / 50000000).toFixed(2),
          stability_tier: stability > 80 ? 'fortress' : stability > 60 ? 'strong' : 'moderate',
        };
      });

      const { error } = await supabase.from('swfps_capital_stability').insert(results);
      if (error) throw error;
      return json({ success: true, scenarios_simulated: results.length, results });
    }

    if (mode === 'mutual_value') {
      const funds = [{ name: 'GIC', country: 'Singapore' }, { name: 'ADIA', country: 'UAE' }, { name: 'INA', country: 'Indonesia' }, { name: 'PIF', country: 'Saudi Arabia' }];
      const domains = ['asset_allocation', 'urban_planning', 'deal_flow', 'risk_intelligence'];

      const results = funds.flatMap(f => domains.map(d => {
        const alloc = Math.random() * 100;
        const urban = Math.random() * 100;
        const deal = Math.random() * 100;
        const sovBen = (alloc + urban + deal) / 3;
        const platBen = 40 + Math.random() * 55;
        return {
          sovereign_fund_name: f.name, country: f.country, value_domain: d,
          asset_allocation_insight_score: +alloc.toFixed(2),
          urban_planning_support_score: +urban.toFixed(2),
          global_dealflow_visibility_score: +deal.toFixed(2),
          platform_data_access_tier: sovBen > 70 ? 'premium' : sovBen > 40 ? 'enhanced' : 'standard',
          sovereign_benefit_index: +sovBen.toFixed(2),
          platform_benefit_index: +platBen.toFixed(2),
          mutual_value_score: +((sovBen + platBen) / 2).toFixed(2),
          value_delivery_status: Math.random() > 0.6 ? 'active' : 'planned',
        };
      }));

      const { error } = await supabase.from('swfps_mutual_value').insert(results);
      if (error) throw error;
      return json({ success: true, values_mapped: results.length, results });
    }

    if (mode === 'governance') {
      const funds = [{ name: 'GIC', country: 'Singapore' }, { name: 'ADIA', country: 'UAE' }, { name: 'INA', country: 'Indonesia' }];
      const domains = ['transparency', 'reporting', 'risk_management', 'compliance', 'data_sovereignty', 'esg'];

      const results = funds.flatMap(f => domains.map(d => {
        const trans = 60 + Math.random() * 35;
        const risk = 50 + Math.random() * 45;
        const esg = 40 + Math.random() * 55;
        const trust = (trans * 0.3 + risk * 0.3 + esg * 0.2 + Math.random() * 20);
        return {
          sovereign_fund_name: f.name, country: f.country, governance_domain: d,
          transparency_score: +trans.toFixed(2),
          reporting_frequency: d === 'reporting' ? 'monthly' : 'quarterly',
          risk_management_maturity: +risk.toFixed(2),
          compliance_framework: f.country === 'Singapore' ? 'MAS_guidelines' : f.country === 'UAE' ? 'ADGM_framework' : 'OJK_standards',
          audit_rights_granted: Math.random() > 0.3,
          board_observer_rights: Math.random() > 0.5,
          data_sovereignty_compliance: d === 'data_sovereignty',
          esg_alignment_score: +esg.toFixed(2),
          trust_index: +Math.min(100, trust).toFixed(2),
          governance_status: trust > 75 ? 'established' : trust > 50 ? 'drafting' : 'conceptual',
        };
      }));

      const { error } = await supabase.from('swfps_governance_trust').insert(results);
      if (error) throw error;
      return json({ success: true, governance_assessed: results.length, results });
    }

    return json({ error: 'Invalid mode' });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
