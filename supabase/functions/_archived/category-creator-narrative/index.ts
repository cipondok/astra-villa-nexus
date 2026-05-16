import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params } = await req.json();

    switch (mode) {
      case 'define_category': return respond(await defineCategory(supabase, params));
      case 'amplify_problems': return respond(await amplifyProblems(supabase, params));
      case 'project_vision': return respond(await projectVision(supabase, params));
      case 'build_mythology': return respond(await buildMythology(supabase, params));
      case 'spin_flywheel': return respond(await spinFlywheel(supabase, params));
      case 'dashboard': return respond(await buildDashboard(supabase));
      default: return respond({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
});

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function defineCategory(sb: any, _p: any) {
  const definitions = [
    {
      category_name: 'AI-Driven Real Estate Operating System',
      legacy_framing: 'Property listing portals with manual search and broker gatekeeping',
      new_framing: 'Autonomous intelligence infrastructure that orchestrates discovery, valuation, execution, and wealth optimization',
      disruption_thesis: 'Legacy portals are digital billboards; ASTRA is the nervous system of property capital markets',
    },
    {
      category_name: 'Real Estate Intelligence Infrastructure (REII)',
      legacy_framing: 'Fragmented data across MLS, brokers, and government records',
      new_framing: 'Unified intelligence layer that continuously learns, predicts, and optimizes property investment outcomes',
      disruption_thesis: 'Information asymmetry is the single largest wealth destruction force in real estate; REII eliminates it',
    },
    {
      category_name: 'Autonomous Capital Allocation Engine',
      legacy_framing: 'Manual portfolio construction with spreadsheet-based analysis',
      new_framing: 'AI-driven capital deployment that identifies arbitrage, manages risk, and compounds wealth autonomously',
      disruption_thesis: 'Human-only capital allocation leaves 40% of opportunity value on the table',
    },
  ];

  const rows = definitions.map(d => {
    const legacyWeak = 60 + Math.random() * 40;
    const newStrength = 65 + Math.random() * 35;
    const readiness = 40 + Math.random() * 60;
    const moat = 50 + Math.random() * 50;
    const clarity = legacyWeak * 0.2 + newStrength * 0.3 + readiness * 0.25 + moat * 0.25;
    const maturity = clarity > 80 ? 'crystallized' : clarity > 60 ? 'forming' : 'nascent';
    return {
      ...d,
      legacy_weakness_score: +legacyWeak.toFixed(1),
      new_category_strength: +newStrength.toFixed(1),
      market_readiness: +readiness.toFixed(1),
      competitive_moat_depth: +moat.toFixed(1),
      category_maturity: maturity,
      positioning_clarity: +clarity.toFixed(1),
    };
  });

  const { error } = await sb.from('ccne_category_definition').insert(rows);
  if (error) throw error;
  await emitSignal(sb, 'ccne_engine_cycle', 'ccne_category', { categories_defined: rows.length });
  return { categories_defined: rows.length };
}

async function amplifyProblems(sb: any, _p: any) {
  const problems = [
    { domain: 'Property Liquidity', desc: 'Average property transaction takes 6-12 months with 30% price discovery failure', loss: 2.1e12, stakeholders: 'investors,sellers' },
    { domain: 'Capital Allocation', desc: 'Institutional investors miss 65% of optimal entry points due to fragmented intelligence', loss: 890e9, stakeholders: 'institutional_investors' },
    { domain: 'Investor Discovery', desc: 'First-time investors face 200+ hours of manual research with 40% information asymmetry', loss: 340e9, stakeholders: 'retail_investors' },
    { domain: 'Market Intelligence', desc: 'No real-time pricing intelligence exists; valuations lag reality by 3-9 months', loss: 1.5e12, stakeholders: 'all' },
    { domain: 'Cross-Border Investment', desc: 'Currency risk, regulatory opacity, and data fragmentation block $4.2T in cross-border capital', loss: 4.2e12, stakeholders: 'global_investors' },
  ];

  const rows = problems.map(p => {
    const urgency = 50 + Math.random() * 50;
    const failure = 40 + Math.random() * 60;
    const virality = 30 + Math.random() * 70;
    const awareness = failure > 70 ? 'growing' : failure > 45 ? 'low' : 'minimal';
    return {
      problem_domain: p.domain,
      inefficiency_description: p.desc,
      quantified_loss_usd: p.loss,
      affected_stakeholders: p.stakeholders,
      emotional_urgency_score: +urgency.toFixed(1),
      systemic_failure_index: +failure.toFixed(1),
      awareness_level: awareness,
      amplification_strategy: urgency > 75 ? 'Crisis narrative with data visualization' : 'Educational content with case studies',
      virality_potential: +virality.toFixed(1),
    };
  });

  const { error } = await sb.from('ccne_problem_amplification').insert(rows);
  if (error) throw error;
  return { problems_amplified: rows.length };
}

async function projectVision(sb: any, _p: any) {
  const visions = [
    { theme: 'Autonomous Property Markets', arc: 'From manual transactions to self-executing intelligent markets', horizon: 10 },
    { theme: 'Digital Infrastructure Layer', arc: 'Platform becomes the operating system every property transaction flows through', horizon: 7 },
    { theme: 'Wealth Democratization', arc: 'Fractional ownership and AI advisory eliminate wealth-gated investment barriers', horizon: 5 },
    { theme: 'Planetary Capital Coordination', arc: 'Cross-border capital flows intelligently to highest-impact opportunities globally', horizon: 15 },
  ];

  const rows = visions.map(v => {
    const macro = 55 + Math.random() * 45;
    const inevitability = 50 + Math.random() * 50;
    const infra = 45 + Math.random() * 55;
    const roadmap = 50 + Math.random() * 50;
    const resonance = 40 + Math.random() * 60;
    const tier = inevitability > 80 ? 'inevitable' : inevitability > 60 ? 'probable' : 'emerging';
    return {
      vision_theme: v.theme,
      narrative_arc: v.arc,
      macro_alignment_score: +macro.toFixed(1),
      inevitability_index: +inevitability.toFixed(1),
      infrastructure_positioning: +infra.toFixed(1),
      roadmap_coherence: +roadmap.toFixed(1),
      audience_resonance: +resonance.toFixed(1),
      projection_horizon_years: v.horizon,
      vision_tier: tier,
    };
  });

  const { error } = await sb.from('ccne_vision_projection').insert(rows);
  if (error) throw error;
  return { visions_projected: rows.length };
}

async function buildMythology(sb: any, _p: any) {
  const elements = [
    { element: 'The Systems Thinker: Founder sees real estate not as transactions but as economic neural networks', type: 'origin' },
    { element: 'Contrarian Bet: While others build listing portals, founder architects intelligence infrastructure', type: 'contrarian' },
    { element: 'Systemic Innovation: 450+ database tables, 18 Edge Functions, 6 autonomous AI workers built by one founder', type: 'capability' },
    { element: 'Long-Horizon Vision: Building the Bloomberg Terminal for global property intelligence', type: 'vision' },
    { element: 'Mission-Driven: Democratizing property wealth creation through AI-augmented decision intelligence', type: 'mission' },
  ];

  const rows = elements.map(e => {
    const contrarian = 50 + Math.random() * 50;
    const credibility = 55 + Math.random() * 45;
    const mission = 60 + Math.random() * 40;
    const inspiration = 45 + Math.random() * 55;
    const media = 35 + Math.random() * 65;
    const composite = contrarian * 0.2 + credibility * 0.25 + mission * 0.2 + inspiration * 0.2 + media * 0.15;
    const phase = composite > 75 ? 'legendary' : composite > 55 ? 'established' : 'foundation';
    return {
      narrative_element: e.element,
      mythology_type: e.type,
      contrarian_strength: +contrarian.toFixed(1),
      credibility_score: +credibility.toFixed(1),
      mission_alignment: +mission.toFixed(1),
      audience_inspiration: +inspiration.toFixed(1),
      media_pickup_potential: +media.toFixed(1),
      mythology_composite: +composite.toFixed(1),
      story_phase: phase,
    };
  });

  const { error } = await sb.from('ccne_founder_mythology').insert(rows);
  if (error) throw error;
  return { mythology_elements_built: rows.length };
}

async function spinFlywheel(sb: any, _p: any) {
  const pillars = [
    { pillar: 'Market Intelligence Reports', audience: 'investors', shift: 'From gut-feel investing to data-driven capital deployment' },
    { pillar: 'AI Valuation Transparency', audience: 'agents', shift: 'From opaque pricing to algorithmic price discovery' },
    { pillar: 'Developer Launch Intelligence', audience: 'developers', shift: 'From supply-push to demand-pull project launches' },
    { pillar: 'Founder Thought Leadership', audience: 'industry', shift: 'From marketplace operators to infrastructure architects' },
    { pillar: 'Investment Scenario Content', audience: 'retail_investors', shift: 'From property browsing to wealth simulation' },
  ];

  const rows = pillars.map(p => {
    const adoption = 20 + Math.random() * 80;
    const evangelist = 5 + Math.random() * 40;
    const paradigm = 30 + Math.random() * 70;
    const reach = 1 + Math.random() * 8;
    const momentum = adoption * 0.3 + evangelist * 0.25 + paradigm * 0.25 + Math.min(reach * 12, 100) * 0.2;
    const stage = momentum > 70 ? 'accelerating' : momentum > 45 ? 'growing' : momentum > 25 ? 'seeding' : 'planting';
    return {
      content_pillar: p.pillar,
      target_audience: p.audience,
      mental_model_shift: p.shift,
      adoption_velocity: +adoption.toFixed(1),
      evangelist_conversion_rate: +evangelist.toFixed(1),
      paradigm_shift_score: +paradigm.toFixed(1),
      content_reach_multiplier: +reach.toFixed(2),
      flywheel_momentum: +momentum.toFixed(1),
      flywheel_stage: stage,
    };
  });

  const { error } = await sb.from('ccne_education_flywheel').insert(rows);
  if (error) throw error;
  return { flywheel_pillars_spun: rows.length };
}

async function buildDashboard(sb: any) {
  const [cat, prob, vis, myth, fly] = await Promise.all([
    sb.from('ccne_category_definition').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('ccne_problem_amplification').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('ccne_vision_projection').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('ccne_founder_mythology').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('ccne_education_flywheel').select('*').order('computed_at', { ascending: false }).limit(10),
  ]);

  const catData = cat.data ?? [];
  const mythData = myth.data ?? [];
  const flyData = fly.data ?? [];

  const avgClarity = catData.length ? catData.reduce((s: number, r: any) => s + (r.positioning_clarity || 0), 0) / catData.length : 0;
  const avgMythology = mythData.length ? mythData.reduce((s: number, r: any) => s + (r.mythology_composite || 0), 0) / mythData.length : 0;
  const avgMomentum = flyData.length ? flyData.reduce((s: number, r: any) => s + (r.flywheel_momentum || 0), 0) / flyData.length : 0;
  const totalLoss = (prob.data ?? []).reduce((s: number, r: any) => s + (r.quantified_loss_usd || 0), 0);

  return {
    data: {
      summary: {
        categories_defined: catData.length,
        avg_positioning_clarity: +avgClarity.toFixed(1),
        problems_quantified: (prob.data ?? []).length,
        total_quantified_loss_usd: totalLoss,
        avg_mythology_strength: +avgMythology.toFixed(1),
        avg_flywheel_momentum: +avgMomentum.toFixed(1),
      },
      categories: catData,
      problems: prob.data ?? [],
      visions: vis.data ?? [],
      mythology: mythData,
      flywheel: flyData,
    },
  };
}

async function emitSignal(sb: any, eventType: string, entityType: string, payload: Record<string, unknown>) {
  await sb.from('ai_event_signals').insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: null,
    priority_level: 'medium',
    payload,
  });
}
