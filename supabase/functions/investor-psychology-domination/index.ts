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
      case 'map_motivations': return respond(await mapMotivations(supabase, params));
      case 'accelerate_trust': return respond(await accelerateTrust(supabase, params));
      case 'amplify_perception': return respond(await amplifyPerception(supabase, params));
      case 'segment_behavior': return respond(await segmentBehavior(supabase, params));
      case 'activate_capital': return respond(await activateCapital(supabase, params));
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

const REGIONS = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Makassar', 'Medan', 'Singapore', 'Dubai', 'Bangkok', 'Kuala Lumpur', 'Ho Chi Minh'];

async function mapMotivations(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const fearGreed = 15 + Math.random() * 70;
    const safety = 20 + Math.random() * 60;
    const growth = 100 - safety + (Math.random() * 20 - 10);
    const uncertainty = 10 + Math.random() * 70;
    const velocity = 20 + Math.random() * 80;
    const confidence = 100 - uncertainty * 0.6 + fearGreed * 0.2;
    const momentum = fearGreed > 60 ? velocity * 0.8 : -velocity * 0.3;
    const motivation = fearGreed > 65 ? 'greed_dominant' : fearGreed < 35 ? 'fear_dominant' : 'balanced';
    const phase = fearGreed > 70 ? 'euphoria' : fearGreed > 55 ? 'optimism' : fearGreed > 40 ? 'neutral' : fearGreed > 25 ? 'anxiety' : 'panic';
    return {
      market_region: region,
      fear_greed_index: +fearGreed.toFixed(1),
      safety_seeking_pct: +Math.max(0, Math.min(100, safety)).toFixed(1),
      growth_seeking_pct: +Math.max(0, Math.min(100, growth)).toFixed(1),
      macro_uncertainty_score: +uncertainty.toFixed(1),
      capital_deployment_velocity: +velocity.toFixed(1),
      dominant_motivation: motivation,
      cycle_phase: phase,
      sentiment_momentum: +momentum.toFixed(1),
      confidence_index: +Math.max(0, Math.min(100, confidence)).toFixed(1),
    };
  });

  const { error } = await sb.from('gipd_motivation_mapping').insert(rows);
  if (error) throw error;
  await emitSignal(sb, 'gipd_engine_cycle', 'gipd_motivation', { regions: rows.length });
  return { regions_mapped: rows.length };
}

async function accelerateTrust(sb: any, _p: any) {
  const dimensions = [
    { dim: 'Data Transparency', strategy: 'Real-time pricing intelligence with source attribution and confidence intervals' },
    { dim: 'Deal Credibility', strategy: 'AI-verified property scores with historical accuracy tracking' },
    { dim: 'Platform Reliability', strategy: 'Uptime guarantees, transaction escrow, and dispute resolution SLAs' },
    { dim: 'Social Proof', strategy: 'Verified transaction count, investor testimonials, and credibility leaderboards' },
    { dim: 'Insight Quality', strategy: 'Prediction accuracy dashboards showing AI forecast vs actual outcomes' },
    { dim: 'Regulatory Compliance', strategy: 'Automated legal document verification and ownership chain validation' },
  ];

  const rows = dimensions.map(d => {
    const friction = 10 + Math.random() * 60;
    const transparency = 40 + Math.random() * 60;
    const credibility = 45 + Math.random() * 55;
    const conviction = 30 + Math.random() * 70;
    const insight = 40 + Math.random() * 60;
    const composite = (100 - friction) * 0.2 + transparency * 0.25 + credibility * 0.2 + conviction * 0.15 + insight * 0.2;
    const tier = composite > 75 ? 'fortified' : composite > 55 ? 'established' : 'building';
    return {
      trust_dimension: d.dim,
      decision_friction_score: +friction.toFixed(1),
      data_transparency_index: +transparency.toFixed(1),
      deal_credibility_signal: +credibility.toFixed(1),
      conviction_strength: +conviction.toFixed(1),
      insight_quality_score: +insight.toFixed(1),
      trust_composite: +composite.toFixed(1),
      acceleration_strategy: d.strategy,
      trust_tier: tier,
    };
  });

  const { error } = await sb.from('gipd_trust_acceleration').insert(rows);
  if (error) throw error;
  return { trust_dimensions_accelerated: rows.length };
}

async function amplifyPerception(sb: any, _p: any) {
  const rows = REGIONS.map(region => {
    const scarcity = 15 + Math.random() * 85;
    const flow = 20 + Math.random() * 80;
    const narrative = 30 + Math.random() * 70;
    const fomo = scarcity * 0.5 + flow * 0.3 + Math.random() * 20;
    const rational = 40 + Math.random() * 60;
    const composite = scarcity * 0.2 + flow * 0.2 + narrative * 0.15 + Math.min(fomo, 100) * 0.2 + rational * 0.25;
    const mode = fomo > 70 ? 'urgency_driven' : rational > 65 ? 'data_driven' : 'balanced';
    const urgency = composite > 75 ? 'critical' : composite > 55 ? 'elevated' : 'standard';
    return {
      market_region: region,
      scarcity_intensity: +scarcity.toFixed(1),
      capital_flow_momentum: +flow.toFixed(1),
      wealth_narrative_strength: +narrative.toFixed(1),
      fomo_trigger_score: +Math.min(100, fomo).toFixed(1),
      rational_backing_score: +rational.toFixed(1),
      perception_composite: +composite.toFixed(1),
      amplification_mode: mode,
      opportunity_urgency: urgency,
    };
  });

  const { error } = await sb.from('gipd_opportunity_perception').insert(rows);
  if (error) throw error;
  return { regions_amplified: rows.length };
}

async function segmentBehavior(sb: any, _p: any) {
  const segments = [
    { name: 'Conservative Wealth Preservers', persona: 'conservative', risk: 25, speed: 'slow', tone: 'reassuring', nudge: 'safety_data' },
    { name: 'Analytical Value Hunters', persona: 'analytical', risk: 45, speed: 'moderate', tone: 'professional', nudge: 'deep_analysis' },
    { name: 'Growth-Oriented Accumulators', persona: 'growth', risk: 65, speed: 'moderate', tone: 'optimistic', nudge: 'opportunity' },
    { name: 'Aggressive Alpha Seekers', persona: 'aggressive', risk: 85, speed: 'fast', tone: 'urgent', nudge: 'scarcity' },
    { name: 'Institutional Allocators', persona: 'institutional', risk: 50, speed: 'methodical', tone: 'data_dense', nudge: 'portfolio_fit' },
    { name: 'First-Time Explorers', persona: 'novice', risk: 30, speed: 'slow', tone: 'educational', nudge: 'guided_tour' },
  ];

  const rows = segments.map(s => {
    const analysis = s.persona === 'analytical' ? 85 : s.persona === 'institutional' ? 90 : 30 + Math.random() * 50;
    const segSize = 8 + Math.random() * 25;
    const conv = 2 + Math.random() * 12;
    const ltv = 0.5 + Math.random() * 4;
    const personal = s.risk * 0.2 + analysis * 0.3 + conv * 3 + Math.random() * 20;
    return {
      segment_name: s.name,
      investor_persona: s.persona,
      risk_appetite: s.risk,
      analysis_depth_preference: +analysis.toFixed(1),
      decision_speed_profile: s.speed,
      communication_tone: s.tone,
      engagement_nudge_type: s.nudge,
      segment_size_pct: +segSize.toFixed(1),
      conversion_rate: +conv.toFixed(2),
      ltv_multiplier: +ltv.toFixed(2),
      personalization_score: +Math.min(100, personal).toFixed(1),
    };
  });

  const { error } = await sb.from('gipd_behavioral_segmentation').insert(rows);
  if (error) throw error;
  return { segments_defined: rows.length };
}

async function activateCapital(sb: any, _p: any) {
  const stages = [
    { stage: 'Curiosity', emotional: 'wonder', rational: 'headline_metrics', friction: 2 },
    { stage: 'Analysis', emotional: 'engagement', rational: 'deep_data', friction: 4 },
    { stage: 'Conviction', emotional: 'confidence', rational: 'scenario_modeling', friction: 3 },
    { stage: 'Transaction', emotional: 'commitment', rational: 'risk_mitigation', friction: 5 },
    { stage: 'Advocacy', emotional: 'pride', rational: 'roi_validation', friction: 1 },
  ];

  const rows = stages.map((s, i) => {
    const conv = i === 0 ? 60 + Math.random() * 30 : 20 + Math.random() * 50;
    const sticky = 30 + Math.random() * 70;
    const advocacy = i === 4 ? 40 + Math.random() * 60 : 5 + Math.random() * 30;
    const velocity = conv * 0.3 + sticky * 0.3 + (100 - s.friction * 15) * 0.2 + Math.random() * 20;
    const composite = conv * 0.3 + sticky * 0.25 + advocacy * 0.2 + velocity * 0.25;
    const phase = composite > 70 ? 'optimized' : composite > 45 ? 'warming' : 'cold';
    return {
      funnel_stage: s.stage,
      stage_conversion_rate: +conv.toFixed(1),
      emotional_driver: s.emotional,
      rational_driver: s.rational,
      friction_points: s.friction,
      stickiness_score: +sticky.toFixed(1),
      advocacy_potential: +advocacy.toFixed(1),
      flywheel_velocity: +Math.min(100, velocity).toFixed(1),
      flywheel_composite: +composite.toFixed(1),
      activation_phase: phase,
    };
  });

  const { error } = await sb.from('gipd_capital_activation').insert(rows);
  if (error) throw error;
  return { funnel_stages_activated: rows.length };
}

async function buildDashboard(sb: any) {
  const [motiv, trust, opp, seg, act] = await Promise.all([
    sb.from('gipd_motivation_mapping').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('gipd_trust_acceleration').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('gipd_opportunity_perception').select('*').order('computed_at', { ascending: false }).limit(15),
    sb.from('gipd_behavioral_segmentation').select('*').order('computed_at', { ascending: false }).limit(10),
    sb.from('gipd_capital_activation').select('*').order('computed_at', { ascending: false }).limit(10),
  ]);

  const md = motiv.data ?? [];
  const td = trust.data ?? [];
  const avgFearGreed = md.length ? md.reduce((s: number, r: any) => s + (r.fear_greed_index || 0), 0) / md.length : 50;
  const avgTrust = td.length ? td.reduce((s: number, r: any) => s + (r.trust_composite || 0), 0) / td.length : 0;
  const avgConfidence = md.length ? md.reduce((s: number, r: any) => s + (r.confidence_index || 0), 0) / md.length : 50;

  return {
    data: {
      summary: {
        markets_tracked: md.length,
        avg_fear_greed_index: +avgFearGreed.toFixed(1),
        avg_trust_composite: +avgTrust.toFixed(1),
        avg_confidence_index: +avgConfidence.toFixed(1),
        segments_active: (seg.data ?? []).length,
        funnel_stages: (act.data ?? []).length,
      },
      motivations: md,
      trust: td,
      perceptions: opp.data ?? [],
      segments: seg.data ?? [],
      activation: act.data ?? [],
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
