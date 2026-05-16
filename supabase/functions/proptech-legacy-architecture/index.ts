import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode } = await req.json();
    const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (mode === 'dashboard') {
      const [i, c, t, r, g] = await Promise.all([
        supabase.from('gpla_infrastructure_permanence').select('*').order('assessed_at', { ascending: false }).limit(20),
        supabase.from('gpla_generational_continuity').select('*').order('computed_at', { ascending: false }).limit(15),
        supabase.from('gpla_trust_compounding').select('*').order('measured_at', { ascending: false }).limit(20),
        supabase.from('gpla_reference_standard').select('*').order('assessed_at', { ascending: false }).limit(15),
        supabase.from('gpla_legacy_governance').select('*').order('assessed_at', { ascending: false }).limit(10),
      ]);
      return json({ engine: 'GPLA', timestamp: new Date().toISOString(), infrastructure: i.data ?? [], continuity: c.data ?? [], trust: t.data ?? [], reference: r.data ?? [], governance: g.data ?? [] });
    }

    if (mode === 'infrastructure') {
      const domains = [
        { domain: 'transaction_workflows', region: 'SE_Asia' },
        { domain: 'transaction_workflows', region: 'Middle_East' },
        { domain: 'property_intelligence', region: 'Global' },
        { domain: 'financial_ecosystem', region: 'SE_Asia' },
        { domain: 'financial_ecosystem', region: 'Global' },
        { domain: 'regulatory_compliance', region: 'Indonesia' },
        { domain: 'regulatory_compliance', region: 'ASEAN' },
        { domain: 'capital_coordination', region: 'Global' },
      ];

      const results = domains.map(d => {
        const workflow = 30 + Math.random() * 65;
        const dataset = 25 + Math.random() * 70;
        const finDepth = 20 + Math.random() * 75;
        const regCompat = 40 + Math.random() * 55;
        const permanence = workflow * 0.25 + dataset * 0.25 + finDepth * 0.25 + regCompat * 0.25;
        const tier = permanence > 85 ? 'irreplaceable' : permanence > 65 ? 'structural' : permanence > 45 ? 'establishing' : 'emerging';
        return {
          infrastructure_domain: d.domain, region: d.region,
          workflow_standardization_pct: +workflow.toFixed(1),
          dataset_universality_score: +dataset.toFixed(2),
          financial_ecosystem_depth: +finDepth.toFixed(2),
          regulatory_compatibility_index: +regCompat.toFixed(2),
          permanence_score: +permanence.toFixed(2),
          embedded_institutions: Math.floor(5 + Math.random() * 200),
          api_integrations_active: Math.floor(10 + Math.random() * 500),
          replacement_difficulty_years: +(permanence / 10).toFixed(1),
          permanence_tier: tier,
        };
      });

      const { error } = await supabase.from('gpla_infrastructure_permanence').insert(results);
      if (error) throw error;

      await supabase.from('ai_event_signals').insert({
        event_type: 'gpla_engine_cycle', entity_type: 'legacy_architecture', entity_id: 'infrastructure',
        priority_level: 'normal', payload: { domains: results.length },
      });

      return json({ success: true, domains_assessed: results.length, results });
    }

    if (mode === 'continuity') {
      const domains = ['developer_ecosystem', 'service_innovation', 'open_intelligence_apis', 'brand_trust', 'talent_pipeline', 'research_partnerships'];

      const results = domains.map(domain => {
        const devSize = Math.floor(100 + Math.random() * 10000);
        const thirdParty = Math.floor(20 + Math.random() * 2000);
        const apiConsumers = Math.floor(50 + Math.random() * 5000);
        const dependence = Math.min(100, Math.log10(apiConsumers) * 25 + Math.random() * 10);
        const generation = Math.floor(1 + Math.random() * 3);
        const innovation = 30 + Math.random() * 65;
        const ecoRevenue = 5 + Math.random() * 40;
        const transferReady = 20 + Math.random() * 70;
        const tier = dependence > 70 ? 'self_sustaining' : dependence > 45 ? 'maturing' : 'building';
        return {
          continuity_domain: domain,
          developer_ecosystem_size: devSize,
          third_party_services_count: thirdParty,
          open_api_consumers: apiConsumers,
          industry_dependence_score: +dependence.toFixed(2),
          brand_trust_generation: generation,
          innovation_velocity: +innovation.toFixed(2),
          ecosystem_revenue_pct: +ecoRevenue.toFixed(1),
          generational_transfer_readiness: +transferReady.toFixed(2),
          continuity_tier: tier,
        };
      });

      const { error } = await supabase.from('gpla_generational_continuity').insert(results);
      if (error) throw error;
      return json({ success: true, domains_computed: results.length, results });
    }

    if (mode === 'trust') {
      const institutions = [
        { type: 'sovereign_fund', name: 'GIC' }, { type: 'sovereign_fund', name: 'ADIA' },
        { type: 'pension_fund', name: 'CalPERS' }, { type: 'pension_fund', name: 'GPIF' },
        { type: 'insurance', name: 'Allianz RE' }, { type: 'insurance', name: 'AXA IM' },
        { type: 'endowment', name: 'Harvard MC' }, { type: 'development_bank', name: 'IFC' },
      ];

      const results = institutions.map(inst => {
        const depth = 20 + Math.random() * 75;
        const duration = 1 + Math.random() * 10;
        const aum = Math.random() * 2000000000;
        const crossborder = 30 + Math.random() * 65;
        // Trust compounds: cumulative = depth × (1 + rate)^vintage
        const rate = 0.05 + Math.random() * 0.1;
        const vintage = duration;
        const cumulative = depth * Math.pow(1 + rate, vintage);
        const irreversibility = Math.min(100, cumulative * 0.5 + duration * 3);
        const tier = cumulative > 80 ? 'structural' : cumulative > 50 ? 'established' : cumulative > 25 ? 'growing' : 'emerging';
        return {
          institution_type: inst.type, institution_name: inst.name,
          trust_depth_score: +depth.toFixed(2),
          reliance_duration_years: +duration.toFixed(1),
          aum_allocated_via_platform: +aum.toFixed(0),
          crossborder_credibility: +crossborder.toFixed(2),
          trust_compounding_rate: +rate.toFixed(4),
          trust_vintage_years: +vintage.toFixed(1),
          cumulative_trust_index: +Math.min(100, cumulative).toFixed(2),
          dependency_irreversibility: +irreversibility.toFixed(2),
          trust_tier: tier,
        };
      });

      const { error } = await supabase.from('gpla_trust_compounding').insert(results);
      if (error) throw error;
      return json({ success: true, institutions_assessed: results.length, results });
    }

    if (mode === 'reference') {
      const standards = [
        'property_valuation_index', 'urban_growth_benchmark', 'capital_flow_indicator',
        'liquidity_depth_standard', 'investment_grade_rating', 'market_cycle_phase_index',
      ];

      const results = standards.map(domain => {
        const regions = Math.floor(3 + Math.random() * 30);
        const citations = Math.floor(10 + Math.random() * 5000);
        const authority = Math.min(100, Math.log10(citations) * 25 + regions * 1.5);
        const urbanPlanning = Math.random() * 80;
        const capitalReliance = Math.random() * 90;
        const compGap = 10 + Math.random() * 50;
        const regEndorse = Math.floor(Math.random() * 15);
        const mediaAuth = 20 + Math.random() * 75;
        const maturity = authority > 75 ? 'authoritative' : authority > 50 ? 'recognized' : authority > 30 ? 'emerging' : 'nascent';
        return {
          standard_domain: domain,
          adoption_regions: regions,
          citation_frequency: citations,
          benchmark_authority_score: +authority.toFixed(2),
          urban_planning_adoption_pct: +urbanPlanning.toFixed(1),
          capital_deployment_reliance: +capitalReliance.toFixed(2),
          competitor_reference_gap: +compGap.toFixed(1),
          regulatory_endorsement_count: regEndorse,
          media_authority_index: +mediaAuth.toFixed(2),
          standard_maturity: maturity,
        };
      });

      const { error } = await supabase.from('gpla_reference_standard').insert(results);
      if (error) throw error;
      return json({ success: true, standards_assessed: results.length, results });
    }

    if (mode === 'governance') {
      const mechanisms = [
        'mission_charter', 'stewardship_council', 'innovation_mandate',
        'strategic_independence_fund', 'founder_succession_protocol', 'long_horizon_capital_structure',
      ];

      const results = mechanisms.map(mech => {
        const missionAnchor = 50 + Math.random() * 45;
        const horizon = Math.floor(10 + Math.random() * 25);
        const independence = 40 + Math.random() * 55;
        const founderReady = 20 + Math.random() * 70;
        const councilSize = Math.floor(3 + Math.random() * 10);
        const amendDifficulty = 60 + Math.random() * 35;
        const longCapital = 20 + Math.random() * 60;
        const resilience = missionAnchor * 0.25 + independence * 0.25 + amendDifficulty * 0.25 + founderReady * 0.25;
        const maturity = resilience > 75 ? 'institutional' : resilience > 55 ? 'maturing' : 'founding';
        return {
          governance_mechanism: mech,
          mission_anchor_strength: +missionAnchor.toFixed(2),
          innovation_mandate_horizon_years: horizon,
          strategic_independence_score: +independence.toFixed(2),
          founder_transition_readiness: +founderReady.toFixed(2),
          stewardship_council_size: councilSize,
          charter_amendment_difficulty: +amendDifficulty.toFixed(2),
          long_horizon_capital_pct: +longCapital.toFixed(1),
          governance_resilience_score: +resilience.toFixed(2),
          governance_maturity: maturity,
        };
      });

      const { error } = await supabase.from('gpla_legacy_governance').insert(results);
      if (error) throw error;
      return json({ success: true, mechanisms_assessed: results.length, results });
    }

    return json({ error: 'Invalid mode' });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
