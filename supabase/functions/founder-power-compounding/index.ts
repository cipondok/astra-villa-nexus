import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { mode, params = {} } = await req.json();

    const handlers: Record<string, () => Promise<unknown>> = {
      dashboard: () => getDashboard(sb),
      compound_decisions: () => compoundDecisions(sb, params),
      amplify_capital_leverage: () => amplifyCapitalLeverage(sb, params),
      form_narrative_authority: () => formNarrativeAuthority(sb, params),
      model_talent_magnetism: () => modelTalentMagnetism(sb, params),
      project_legacy_influence: () => projectLegacyInfluence(sb, params),
    };

    const handler = handlers[mode];
    if (!handler) return respond({ error: `Unknown mode: ${mode}` }, 400);
    return respond(await handler());
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function getDashboard(sb: any) {
  const [decisions, leverage, authority, talent, legacy] = await Promise.all([
    sb.from('fspcm_decision_compounding').select('*').order('decision_quality_score', { ascending: false }).limit(20),
    sb.from('fspcm_capital_leverage').select('*').order('leverage_composite', { ascending: false }).limit(15),
    sb.from('fspcm_narrative_authority').select('*').order('authority_composite', { ascending: false }).limit(15),
    sb.from('fspcm_talent_magnetism').select('*').order('magnetism_composite', { ascending: false }).limit(15),
    sb.from('fspcm_legacy_influence').select('*').order('legacy_composite', { ascending: false }).limit(15),
  ]);

  const dec = decisions.data || [];
  const lev = leverage.data || [];
  const auth = authority.data || [];

  return {
    data: {
      summary: {
        avg_decision_quality: dec.length ? +(dec.reduce((s: number, r: any) => s + (r.decision_quality_score || 0), 0) / dec.length).toFixed(1) : 0,
        exponential_domains: dec.filter((r: any) => r.compounding_tier === 'exponential').length,
        avg_capital_leverage: lev.length ? +(lev.reduce((s: number, r: any) => s + (r.capital_access_multiplier || 0), 0) / lev.length).toFixed(2) : 0,
        avg_authority: auth.length ? +(auth.reduce((s: number, r: any) => s + (r.authority_composite || 0), 0) / auth.length).toFixed(1) : 0,
        talent_segments: (talent.data || []).length,
        legacy_mechanisms: (legacy.data || []).length,
      },
      decisions: dec,
      leverage: lev,
      authority: auth,
      talent: talent.data || [],
      legacy: legacy.data || [],
    },
  };
}

async function compoundDecisions(sb: any, params: Record<string, unknown>) {
  const domains = [
    'Market Entry Timing', 'Product Architecture', 'Capital Allocation',
    'Partnership Selection', 'Talent Acquisition', 'Geographic Expansion',
    'Technology Bets', 'Monetization Strategy',
  ];
  const epochs = ['early_stage', 'growth', 'scale', 'dominance'];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const epoch of epochs) {
      const epochIdx = epochs.indexOf(epoch);
      const cumulative = 5 + epochIdx * 15 + Math.floor(Math.random() * 10);
      const highImpact = 0.3 + epochIdx * 0.12 + Math.random() * 0.1;
      const positioning = 10 + epochIdx * 18 + Math.random() * 12;
      const confidence = 20 + epochIdx * 17 + Math.random() * 10;
      const surface = 15 + epochIdx * 20 + Math.random() * 15;
      const rate = 0.05 + epochIdx * 0.08 + Math.random() * 0.05;
      const quality = positioning * 0.3 + confidence * 0.3 + surface * 0.2 + highImpact * 20;
      const tier = quality >= 75 ? 'exponential' : quality >= 55 ? 'accelerating' : quality >= 35 ? 'compounding' : 'linear';
      const streak = Math.floor(2 + epochIdx * 3 + Math.random() * 4);
      const timing = 40 + epochIdx * 10 + Math.random() * 15;

      rows.push({
        decision_domain: domain,
        decision_epoch: epoch,
        cumulative_decisions: cumulative,
        high_impact_ratio: +highImpact.toFixed(3),
        competitive_positioning_delta: +Math.min(95, positioning).toFixed(1),
        investor_confidence_index: +Math.min(95, confidence).toFixed(1),
        opportunity_surface_area: +Math.min(95, surface).toFixed(1),
        compounding_rate: +rate.toFixed(4),
        compounding_tier: tier,
        decision_quality_score: +Math.min(98, quality).toFixed(2),
        streak_length: streak,
        market_timing_accuracy: +Math.min(95, timing).toFixed(1),
      });
    }
  }

  const { error } = await sb.from('fspcm_decision_compounding').insert(rows);
  if (error) throw error;

  await sb.from('ai_event_signals').insert({
    event_type: 'fspcm_engine_cycle',
    entity_type: 'fspcm_decision_compounding',
    priority_level: 'medium',
    payload: { domains: domains.length, epochs: epochs.length, total: rows.length },
  });

  return { domains_analyzed: domains.length, epochs: epochs.length, total_projections: rows.length };
}

async function amplifyCapitalLeverage(sb: any, params: Record<string, unknown>) {
  const sources = [
    'Venture Capital', 'Sovereign Wealth Funds', 'Institutional PE',
    'Strategic Corporate', 'Family Offices', 'Debt Markets',
  ];
  const years = [1, 3, 5, 10, 15];
  const rows: any[] = [];

  for (const src of sources) {
    for (const y of years) {
      const credibility = Math.min(95, 15 + y * 5 + Math.random() * 15);
      const network = Math.min(95, 10 + y * 5.5 + Math.random() * 12);
      const track = Math.min(95, 5 + y * 6 + Math.random() * 10);
      const multiplier = 1 + Math.log(1 + y) * 1.5 + Math.random() * 0.5;
      const velocity = Math.max(7, 180 - y * 10 - Math.random() * 20);
      const premium = 5 + y * 4 + Math.random() * 10;
      const dealFlow = Math.min(95, 20 + y * 4.5 + Math.random() * 10);
      const sovereign = y >= 10 ? 'strategic_partner' : y >= 5 ? 'dialogue' : y >= 3 ? 'awareness' : 'none';
      const composite = credibility * 0.3 + network * 0.25 + track * 0.25 + dealFlow * 0.2;
      const tier = composite >= 75 ? 'dominant' : composite >= 55 ? 'strong' : composite >= 35 ? 'growing' : 'emerging';

      rows.push({
        leverage_source: src,
        execution_credibility_score: +credibility.toFixed(1),
        institutional_network_depth: +network.toFixed(1),
        expansion_track_record: +track.toFixed(1),
        capital_access_multiplier: +multiplier.toFixed(2),
        fundraising_velocity_days: Math.round(velocity),
        valuation_premium_pct: +premium.toFixed(1),
        deal_flow_quality: +dealFlow.toFixed(1),
        sovereign_access_level: sovereign,
        leverage_composite: +Math.min(95, composite).toFixed(2),
        leverage_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('fspcm_capital_leverage').insert(rows);
  if (error) throw error;

  return { sources_modeled: sources.length, horizons: years.length, total: rows.length };
}

async function formNarrativeAuthority(sb: any, params: Record<string, unknown>) {
  const domains = [
    'PropTech Vision', 'Urban Intelligence', 'Capital Democratization',
    'Emerging Market Strategy', 'AI-Driven Investment', 'Sustainable Urbanization',
  ];
  const years = [1, 3, 5, 10, 15];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const y of years) {
      const signal = Math.min(95, 10 + y * 5.5 + Math.random() * 12);
      const benchmark = Math.min(95, 5 + y * 6 + Math.random() * 10);
      const alignment = Math.min(95, 15 + y * 5 + Math.random() * 10);
      const media = Math.min(95, 8 + y * 5.2 + Math.random() * 15);
      const keynotes = Math.floor(y * 2 + Math.random() * 5);
      const citations = Math.floor(y * 20 + Math.random() * 50);
      const perception = Math.min(95, 10 + y * 5 + Math.random() * 12);
      const composite = signal * 0.25 + benchmark * 0.2 + alignment * 0.2 + media * 0.15 + perception * 0.2;
      const tier = composite >= 70 ? 'visionary' : composite >= 50 ? 'recognized' : composite >= 30 ? 'emerging' : 'building';

      rows.push({
        narrative_domain: domain,
        directional_signal_strength: +signal.toFixed(1),
        benchmark_recognition_score: +benchmark.toFixed(1),
        ecosystem_alignment_index: +alignment.toFixed(1),
        media_amplification: +media.toFixed(1),
        conference_keynote_invitations: keynotes,
        thought_leadership_citations: citations,
        industry_perception_shift: +perception.toFixed(1),
        authority_composite: +Math.min(95, composite).toFixed(2),
        authority_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('fspcm_narrative_authority').insert(rows);
  if (error) throw error;

  return { domains_analyzed: domains.length, horizons: years.length, total: rows.length };
}

async function modelTalentMagnetism(sb: any, params: Record<string, unknown>) {
  const segments = [
    'Engineering Leaders', 'Data Scientists', 'Product Visionaries',
    'Growth Operators', 'Finance Architects', 'Design Innovators',
  ];
  const years = [1, 3, 5, 10, 15];
  const rows: any[] = [];

  for (const seg of segments) {
    for (const y of years) {
      const inbound = Math.min(95, 5 + y * 5.5 + Math.random() * 12);
      const eliteConv = Math.min(60, 5 + y * 3 + Math.random() * 8);
      const velocity = 1 + y * 0.15 + Math.random() * 0.2;
      const resilience = Math.min(95, 15 + y * 5 + Math.random() * 10);
      const retention = Math.min(98, 60 + y * 2 + Math.random() * 5);
      const brand = Math.min(95, 10 + y * 5.5 + Math.random() * 10);
      const innovation = Math.min(95, 12 + y * 5 + Math.random() * 12);
      const reach = Math.floor(100 + y * 200 + Math.random() * 300);
      const composite = inbound * 0.2 + eliteConv * 0.3 + resilience * 0.2 + brand * 0.15 + innovation * 0.15;
      const tier = composite >= 60 ? 'magnetic' : composite >= 40 ? 'attractive' : composite >= 20 ? 'growing' : 'emerging';

      rows.push({
        talent_segment: seg,
        inbound_application_rate: +inbound.toFixed(1),
        elite_hire_conversion_pct: +eliteConv.toFixed(1),
        execution_velocity_multiplier: +velocity.toFixed(2),
        organizational_resilience: +resilience.toFixed(1),
        retention_rate_pct: +retention.toFixed(1),
        employer_brand_score: +brand.toFixed(1),
        innovation_output_index: +innovation.toFixed(1),
        talent_network_reach: reach,
        magnetism_composite: +Math.min(95, composite).toFixed(2),
        magnetism_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('fspcm_talent_magnetism').insert(rows);
  if (error) throw error;

  return { segments_modeled: segments.length, horizons: years.length, total: rows.length };
}

async function projectLegacyInfluence(sb: any, params: Record<string, unknown>) {
  const mechanisms = [
    'Board Governance Structure', 'Cultural Operating Principles',
    'Mission Foundation', 'Innovation Charter', 'Succession Protocol',
    'Strategic Advisory Council',
  ];
  const years = [5, 10, 15, 25, 50];
  const rows: any[] = [];

  for (const mech of mechanisms) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const institutional = Math.min(95, 10 + yIdx * 15 + Math.random() * 12);
      const cultural = Math.min(95, 15 + yIdx * 14 + Math.random() * 10);
      const mission = Math.min(95, 20 + yIdx * 13 + Math.random() * 8);
      const successors = Math.floor(1 + yIdx * 2 + Math.random() * 3);
      const governance = Math.min(95, 10 + yIdx * 16 + Math.random() * 10);
      const brand = Math.min(95, 12 + yIdx * 15 + Math.random() * 10);
      const persistence = Math.floor(y * 1.5 + Math.random() * 10);
      const composite = institutional * 0.2 + cultural * 0.2 + mission * 0.25 + governance * 0.2 + brand * 0.15;
      const tier = composite >= 70 ? 'institutional' : composite >= 50 ? 'cultural' : composite >= 30 ? 'organizational' : 'personal';

      rows.push({
        influence_mechanism: mech,
        institutional_embedding_score: +institutional.toFixed(1),
        cultural_principles_adoption: +cultural.toFixed(1),
        mission_continuity_strength: +mission.toFixed(1),
        successor_pipeline_depth: successors,
        governance_independence: +governance.toFixed(1),
        brand_transcendence_score: +brand.toFixed(1),
        influence_persistence_years: persistence,
        legacy_composite: +Math.min(95, composite).toFixed(2),
        legacy_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('fspcm_legacy_influence').insert(rows);
  if (error) throw error;

  return { mechanisms_projected: mechanisms.length, horizons: years.length, total: rows.length };
}
