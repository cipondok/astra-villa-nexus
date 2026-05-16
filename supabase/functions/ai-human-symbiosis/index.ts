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
      model_augmentation: () => modelAugmentation(sb, params),
      assess_oversight: () => assessOversight(sb, params),
      simulate_copilot: () => simulateCopilot(sb, params),
      evolve_talent: () => evolveTalent(sb, params),
      build_trust: () => buildTrust(sb, params),
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
  const [aug, oversight, copilot, talent, trust] = await Promise.all([
    sb.from('ahcss_decision_augmentation').select('*').order('augmentation_composite', { ascending: false }).limit(20),
    sb.from('ahcss_human_oversight').select('*').order('oversight_composite', { ascending: false }).limit(15),
    sb.from('ahcss_capital_copilot').select('*').order('copilot_maturity_score', { ascending: false }).limit(15),
    sb.from('ahcss_talent_evolution').select('*').order('evolution_composite', { ascending: false }).limit(15),
    sb.from('ahcss_trust_transparency').select('*').order('trust_composite', { ascending: false }).limit(15),
  ]);

  const a = aug.data || [];
  const c = copilot.data || [];
  const t = trust.data || [];

  return {
    data: {
      summary: {
        augmentation_domains: a.length,
        avg_augmentation: a.length ? +(a.reduce((s: number, r: any) => s + (r.augmentation_composite || 0), 0) / a.length).toFixed(1) : 0,
        avg_copilot_maturity: c.length ? +(c.reduce((s: number, r: any) => s + (r.copilot_maturity_score || 0), 0) / c.length).toFixed(1) : 0,
        autonomous_copilots: c.filter((r: any) => r.copilot_tier === 'autonomous').length,
        avg_trust: t.length ? +(t.reduce((s: number, r: any) => s + (r.trust_composite || 0), 0) / t.length).toFixed(1) : 0,
        talent_segments: (talent.data || []).length,
      },
      augmentation: a,
      oversight: oversight.data || [],
      copilot: c,
      talent: talent.data || [],
      trust: t,
    },
  };
}

async function modelAugmentation(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Investment Opportunity Discovery', 'Risk Pattern Detection', 'Scenario Simulation',
    'Market Timing Intelligence', 'Portfolio Optimization', 'Due Diligence Automation',
    'Price Discovery Enhancement', 'Counterparty Analysis',
  ];
  const rows: any[] = [];

  for (const domain of domains) {
    const discovery = 30 + Math.random() * 50;
    const risk = 35 + Math.random() * 45;
    const scenarios = Math.floor(5 + Math.random() * 20);
    const confidence = 55 + Math.random() * 35;
    const overrideRate = 5 + Math.random() * 25;
    const overrideDelta = -5 + Math.random() * 20;
    const speed = 2 + Math.random() * 8;
    const fp = 2 + Math.random() * 12;
    const composite = discovery * 0.25 + risk * 0.25 + confidence * 0.2 + (100 - fp) * 0.15 + speed * 2;
    const tier = composite >= 75 ? 'symbiotic' : composite >= 55 ? 'augmented' : composite >= 35 ? 'assisted' : 'basic';

    rows.push({
      augmentation_domain: domain,
      opportunity_discovery_lift: +discovery.toFixed(1),
      risk_pattern_detection_accuracy: +risk.toFixed(1),
      scenario_simulation_depth: scenarios,
      ai_confidence_score: +confidence.toFixed(1),
      human_override_rate: +overrideRate.toFixed(1),
      override_quality_delta: +overrideDelta.toFixed(1),
      decision_speed_multiplier: +speed.toFixed(2),
      false_positive_rate: +fp.toFixed(1),
      augmentation_composite: +Math.min(95, composite).toFixed(2),
      augmentation_tier: tier,
    });
  }

  const { error } = await sb.from('ahcss_decision_augmentation').insert(rows);
  if (error) throw error;

  await sb.from('ai_event_signals').insert({
    event_type: 'ahcss_engine_cycle', entity_type: 'ahcss_decision_augmentation',
    priority_level: 'medium', payload: { domains: domains.length },
  });

  return { domains_modeled: domains.length };
}

async function assessOversight(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Ethical Investment Governance', 'Long-Horizon Vision Setting',
    'Complex Stakeholder Negotiation', 'Crisis Decision Authority',
    'Cultural Sensitivity Judgment', 'Regulatory Interpretation',
  ];
  const years = [1, 3, 5, 10, 20];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const ethical = Math.min(95, 40 + yIdx * 8 + Math.random() * 12);
      const vision = Math.min(95, 35 + yIdx * 10 + Math.random() * 10);
      const negotiation = Math.min(95, 30 + yIdx * 9 + Math.random() * 15);
      const contextual = Math.min(95, 45 + yIdx * 7 + Math.random() * 10);
      const delegation = Math.min(90, 10 + yIdx * 15 + Math.random() * 10);
      const intervention = Math.min(95, 40 + yIdx * 8 + Math.random() * 12);
      const composite = ethical * 0.2 + vision * 0.2 + negotiation * 0.15 + contextual * 0.2 + intervention * 0.15 + (100 - delegation) * 0.1;
      const tier = composite >= 75 ? 'strategic_authority' : composite >= 55 ? 'collaborative' : composite >= 35 ? 'supervisory' : 'operational';

      rows.push({
        oversight_domain: domain,
        ethical_governance_score: +ethical.toFixed(1),
        vision_setting_clarity: +vision.toFixed(1),
        stakeholder_negotiation_skill: +negotiation.toFixed(1),
        contextual_judgment_index: +contextual.toFixed(1),
        ai_delegation_readiness: +delegation.toFixed(1),
        intervention_effectiveness: +intervention.toFixed(1),
        oversight_composite: +Math.min(95, composite).toFixed(2),
        oversight_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('ahcss_human_oversight').insert(rows);
  if (error) throw error;

  return { domains_assessed: domains.length, horizons: years.length, total: rows.length };
}

async function simulateCopilot(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Geographic Allocation', 'Asset Class Distribution', 'Risk Budget Management',
    'Liquidity Reserve Sizing', 'Currency Exposure Hedging', 'Yield Optimization',
  ];
  const years = [1, 3, 5, 10, 15];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const accuracy = Math.min(95, 40 + yIdx * 10 + Math.random() * 8);
      const validation = Math.max(10, 90 - yIdx * 15 - Math.random() * 8);
      const adjustment = Math.max(3, 30 - yIdx * 5 - Math.random() * 3);
      const iterations = 10 + yIdx * 50 + Math.floor(Math.random() * 30);
      const velocity = 5 + yIdx * 8 + Math.random() * 5;
      const efficiency = 5 + yIdx * 8 + Math.random() * 6;
      const returnDelta = 0.5 + yIdx * 0.8 + Math.random() * 0.5;
      const maturity = accuracy * 0.3 + velocity * 0.2 + efficiency * 0.25 + (100 - adjustment) * 0.25;
      const tier = maturity >= 80 ? 'autonomous' : maturity >= 60 ? 'collaborative' : maturity >= 40 ? 'suggestive' : 'advisory';

      rows.push({
        allocation_domain: domain,
        ai_proposal_accuracy: +accuracy.toFixed(1),
        human_validation_rate: +validation.toFixed(1),
        contextual_adjustment_pct: +adjustment.toFixed(1),
        feedback_loop_iterations: iterations,
        refinement_velocity: +velocity.toFixed(2),
        allocation_efficiency_gain: +efficiency.toFixed(1),
        risk_adjusted_return_delta: +returnDelta.toFixed(2),
        copilot_maturity_score: +Math.min(95, maturity).toFixed(2),
        copilot_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('ahcss_capital_copilot').insert(rows);
  if (error) throw error;

  return { domains_simulated: domains.length, horizons: years.length, total: rows.length };
}

async function evolveTalent(sb: any, _p: Record<string, unknown>) {
  const skills = [
    'Data-Driven Strategic Thinking', 'AI Collaboration Fluency',
    'Cross-Disciplinary Innovation', 'Algorithmic Literacy',
    'Human-AI Workflow Design', 'Ethical AI Governance',
  ];
  const generations = [
    { label: 'Current Workforce', year: 0 }, { label: 'Near-Term Transition', year: 5 },
    { label: 'AI-Native Generation', year: 15 }, { label: 'Post-AI Integration', year: 30 },
  ];
  const rows: any[] = [];

  for (const skill of skills) {
    for (const gen of generations) {
      const gIdx = generations.indexOf(gen);
      const dataThinking = Math.min(95, 15 + gIdx * 22 + Math.random() * 10);
      const aiFluency = Math.min(95, 10 + gIdx * 25 + Math.random() * 8);
      const crossDisc = Math.min(95, 20 + gIdx * 18 + Math.random() * 10);
      const readiness = Math.min(95, 12 + gIdx * 23 + Math.random() * 8);
      const reskill = Math.min(95, 8 + gIdx * 20 + Math.random() * 12);
      const gap = Math.max(5, 70 - gIdx * 18 - Math.random() * 8);
      const advantage = Math.min(95, 15 + gIdx * 20 + Math.random() * 10);
      const composite = dataThinking * 0.25 + aiFluency * 0.25 + crossDisc * 0.2 + readiness * 0.15 + advantage * 0.15;
      const tier = composite >= 70 ? 'symbiotic' : composite >= 50 ? 'augmented' : composite >= 30 ? 'transitional' : 'traditional';

      rows.push({
        skill_domain: skill,
        data_driven_thinking_score: +dataThinking.toFixed(1),
        ai_collaboration_fluency: +aiFluency.toFixed(1),
        cross_disciplinary_innovation: +crossDisc.toFixed(1),
        workforce_readiness_index: +readiness.toFixed(1),
        reskilling_velocity: +reskill.toFixed(1),
        talent_supply_gap: +gap.toFixed(1),
        competitive_advantage_contribution: +advantage.toFixed(1),
        evolution_composite: +Math.min(95, composite).toFixed(2),
        evolution_tier: tier,
        generation_label: gen.label,
        year_horizon: gen.year,
      });
    }
  }

  const { error } = await sb.from('ahcss_talent_evolution').insert(rows);
  if (error) throw error;

  return { skills_modeled: skills.length, generations: generations.length, total: rows.length };
}

async function buildTrust(sb: any, _p: Record<string, unknown>) {
  const domains = [
    'Investment Recommendations', 'Risk Assessments', 'Market Predictions',
    'Portfolio Rebalancing', 'Compliance Monitoring', 'Valuation Models',
  ];
  const years = [1, 3, 5, 10, 20];
  const rows: any[] = [];

  for (const domain of domains) {
    for (const y of years) {
      const yIdx = years.indexOf(y);
      const explain = Math.min(95, 20 + yIdx * 15 + Math.random() * 10);
      const account = Math.min(95, 25 + yIdx * 13 + Math.random() * 10);
      const confidence = Math.min(95, 15 + yIdx * 16 + Math.random() * 10);
      const audit = Math.min(98, 30 + yIdx * 14 + Math.random() * 8);
      const bias = Math.min(95, 10 + yIdx * 17 + Math.random() * 8);
      const regulatory = Math.min(98, 35 + yIdx * 12 + Math.random() * 8);
      const stakeholder = Math.min(95, 20 + yIdx * 14 + Math.random() * 10);
      const composite = explain * 0.2 + account * 0.15 + confidence * 0.2 + audit * 0.15 + bias * 0.15 + stakeholder * 0.15;
      const tier = composite >= 75 ? 'institutional_grade' : composite >= 55 ? 'transparent' : composite >= 35 ? 'developing' : 'opaque';

      rows.push({
        trust_domain: domain,
        explainability_score: +explain.toFixed(1),
        accountability_clarity: +account.toFixed(1),
        institutional_confidence: +confidence.toFixed(1),
        audit_trail_completeness: +audit.toFixed(1),
        bias_detection_coverage: +bias.toFixed(1),
        regulatory_compliance_pct: +regulatory.toFixed(1),
        stakeholder_satisfaction: +stakeholder.toFixed(1),
        trust_composite: +Math.min(95, composite).toFixed(2),
        trust_tier: tier,
        year_horizon: y,
      });
    }
  }

  const { error } = await sb.from('ahcss_trust_transparency').insert(rows);
  if (error) throw error;

  return { domains_assessed: domains.length, horizons: years.length, total: rows.length };
}
