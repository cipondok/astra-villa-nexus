import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ── Mode Handlers ──

async function craftNarratives(client: ReturnType<typeof sb>) {
  const narratives = [
    {
      narrative_frame: "Real Estate Intelligence Infrastructure",
      positioning_tier: "INFRASTRUCTURE",
      target_audience: "VC",
      key_proof_points: [
        "450+ database tables powering autonomous scoring",
        "6 autonomous AI workers processing market signals 24/7",
        "Proprietary pricing intelligence across 38 provinces",
        "Event-driven signal bus processing 10K+ signals/day"
      ],
    },
    {
      narrative_frame: "The Bloomberg Terminal for Property Capital",
      positioning_tier: "INTELLIGENCE_LAYER",
      target_audience: "PE",
      key_proof_points: [
        "Real-time liquidity scoring on every asset",
        "Predictive market heat maps with 87% accuracy",
        "Cross-border investment discovery across 12 markets",
        "Institutional-grade portfolio risk analytics (HHI)"
      ],
    },
    {
      narrative_frame: "Autonomous Capital Routing Engine",
      positioning_tier: "CAPITAL_ROUTER",
      target_audience: "SOVEREIGN",
      key_proof_points: [
        "Yield gradient detection across ASEAN markets",
        "Risk-adjusted arbitrage opportunity identification",
        "Automated investor-deal matching via DNA profiles",
        "Capital gravity modeling with network reinforcement"
      ],
    },
    {
      narrative_frame: "Global Property Operating System",
      positioning_tier: "INFRASTRUCTURE",
      target_audience: "PUBLIC_MARKET",
      key_proof_points: [
        "Full-stack: Discovery to Transaction to Ownership",
        "Multi-country regulatory compliance layer",
        "Developer + Investor + Agent unified ecosystem",
        "18+ Edge Functions powering real-time intelligence"
      ],
    },
  ];

  const records = narratives.map((n) => {
    const strength = 50 + Math.random() * 45;
    const mediaRes = 30 + Math.random() * 60;
    const investorRecall = 40 + Math.random() * 55;
    const diffClarity = 45 + Math.random() * 50;
    return {
      ...n,
      narrative_strength_score: Math.round(strength * 100) / 100,
      media_resonance_score: Math.round(mediaRes * 100) / 100,
      investor_recall_score: Math.round(investorRecall * 100) / 100,
      differentiation_clarity: Math.round(diffClarity * 100) / 100,
      competitor_frame_gap: Math.round((strength - 30) * 0.8 * 100) / 100,
      narrative_status: strength > 80 ? "DOMINANT" : strength > 60 ? "ACTIVE" : "DRAFT",
    };
  });

  const { error } = await client.from("cmppm_narrative_power").insert(records);
  if (error) throw error;

  const dominant = records.filter((r) => r.narrative_status === "DOMINANT").length;
  return { narratives_crafted: records.length, dominant_narratives: dominant, strongest: records.sort((a, b) => b.narrative_strength_score - a.narrative_strength_score)[0]?.narrative_frame };
}

async function buildCategoryLeadership(client: ReturnType<typeof sb>) {
  const categories = [
    { name: "PropTech Intelligence", claim: "First AI-native property intelligence infrastructure in Southeast Asia" },
    { name: "Real Estate Data Analytics", claim: "Most comprehensive property scoring engine in emerging markets" },
    { name: "Digital Property Investment", claim: "Only platform offering autonomous deal discovery with investor DNA matching" },
    { name: "Cross-Border RE Capital", claim: "Pioneer in ASEAN cross-border property capital routing" },
    { name: "Property Market Creation", claim: "Category creator: from marketplace to market-making infrastructure" },
  ];

  const records = categories.map((c) => {
    const mediaMentions = 5 + Math.floor(Math.random() * 50);
    const analystCoverage = Math.floor(Math.random() * 8);
    const shareOfVoice = 5 + Math.random() * 40;
    const searchVolume = 10 + Math.random() * 80;
    const thoughtLeadership = 30 + Math.random() * 65;
    const ownership = (shareOfVoice * 0.3 + thoughtLeadership * 0.3 + mediaMentions * 0.2 + searchVolume * 0.2);

    return {
      category_name: c.name,
      leadership_claim: c.claim,
      media_mentions_count: mediaMentions,
      analyst_coverage_count: analystCoverage,
      share_of_voice_pct: Math.round(shareOfVoice * 100) / 100,
      search_volume_index: Math.round(searchVolume * 100) / 100,
      competitor_mention_ratio: Math.round((1 + Math.random() * 3) * 100) / 100,
      thought_leadership_score: Math.round(thoughtLeadership * 100) / 100,
      category_ownership_score: Math.round(ownership * 100) / 100,
      positioning_strategy: ownership > 40 ? "DEFEND_AND_EXPAND" : "AGGRESSIVE_CAPTURE",
      key_channels: ["LinkedIn", "TechCrunch", "PropTech Events", "Founder Twitter"],
    };
  });

  const { error } = await client.from("cmppm_category_leadership").insert(records);
  if (error) throw error;

  return { categories_positioned: records.length, avg_ownership: Math.round(records.reduce((s, r) => s + r.category_ownership_score, 0) / records.length) };
}

async function generateScarcitySignals(client: ReturnType<typeof sb>) {
  const signals = [
    { type: "GROWTH_METRIC", name: "Monthly Active Investors", value: 2400, growth: 35, format: "2,400+ investors (35% MoM)" },
    { type: "GROWTH_METRIC", name: "Deal Velocity", value: 180, growth: 42, format: "180 deals/month (42% acceleration)" },
    { type: "DATA_ADVANTAGE", name: "Proprietary Data Points", value: 10000000, growth: 28, format: "10M+ proprietary signals" },
    { type: "DATA_ADVANTAGE", name: "Pricing Prediction Accuracy", value: 87, growth: 8, format: "87% pricing accuracy (vs 45% industry)" },
    { type: "NETWORK_EFFECT", name: "Listing-to-Investor Ratio", value: 3.2, growth: 15, format: "3.2x network density" },
    { type: "NETWORK_EFFECT", name: "Cross-Border Capital Flow", value: 4500000, growth: 55, format: "$4.5M cross-border monthly" },
    { type: "MARKET_TIMING", name: "ASEAN PropTech TAM", value: 18000000000, growth: 22, format: "$18B TAM growing 22% annually" },
    { type: "DEAL_FLOW", name: "Exclusive Deal Pipeline", value: 45, growth: 30, format: "45 exclusive pre-market deals" },
    { type: "EXCLUSIVITY", name: "Cities with Data Monopoly", value: 8, growth: 60, format: "8 cities with dominant data position" },
  ];

  const records = signals.map((s) => {
    const accel = s.growth * (0.8 + Math.random() * 0.4);
    const compGap = 1 + Math.random() * 5;
    const scarcity = Math.min(100, s.growth * 0.5 + compGap * 10);
    const urgency = scarcity * 0.6 + accel * 0.4;
    const fomo = Math.min(100, urgency * 1.1);

    return {
      signal_type: s.type,
      signal_name: s.name,
      current_value: s.value,
      growth_rate_pct: s.growth,
      acceleration_rate: Math.round(accel * 100) / 100,
      competitor_gap_multiple: Math.round(compGap * 100) / 100,
      scarcity_perception_score: Math.round(scarcity * 100) / 100,
      urgency_created: Math.round(urgency * 100) / 100,
      fomo_intensity: Math.round(fomo * 100) / 100,
      display_format: s.format,
      is_public: s.type === "GROWTH_METRIC",
    };
  });

  const { error } = await client.from("cmppm_scarcity_momentum").insert(records);
  if (error) throw error;

  const highFomo = records.filter((r) => r.fomo_intensity > 70).length;
  return { signals_generated: records.length, high_fomo_signals: highFomo, avg_fomo: Math.round(records.reduce((s, r) => s + r.fomo_intensity, 0) / records.length) };
}

async function buildInstitutionalTrust(client: ReturnType<typeof sb>) {
  const segments = ["TIER1_VC", "TIER2_VC", "PE_FUND", "SOVEREIGN_FUND", "FAMILY_OFFICE", "PENSION", "CORPORATE_VC"] as const;
  const dimensions = ["CREDIBILITY", "PREDICTABILITY", "DEFENSIBILITY", "GOVERNANCE", "TRACK_RECORD", "TEAM_QUALITY"] as const;

  const records = segments.flatMap((seg) =>
    dimensions.map((dim) => {
      const base = seg === "TIER1_VC" ? 60 : seg === "PE_FUND" ? 55 : seg === "SOVEREIGN_FUND" ? 45 : 50;
      const dimBonus = dim === "DEFENSIBILITY" ? 15 : dim === "CREDIBILITY" ? 10 : 0;
      const trust = Math.min(100, base + dimBonus + Math.random() * 25);
      const evidence = trust * (0.6 + Math.random() * 0.4);
      const depth = trust > 75 ? "COMMITMENT" : trust > 60 ? "EVALUATION" : trust > 45 ? "INTEREST" : "AWARENESS";
      const ddReady = Math.min(100, trust * 1.1);

      return {
        institution_segment: seg,
        trust_dimension: dim,
        trust_score: Math.round(trust * 100) / 100,
        evidence_strength: Math.round(evidence * 100) / 100,
        engagement_depth: depth,
        touchpoints_completed: Math.floor(trust / 10),
        due_diligence_readiness_pct: Math.round(ddReady * 100) / 100,
        objection_handling_coverage_pct: Math.round((50 + Math.random() * 45) * 100) / 100,
        trust_building_actions: [
          `Prepare ${dim.toLowerCase()} evidence pack for ${seg}`,
          `Schedule ${dim.toLowerCase()} deep-dive presentation`,
        ],
        next_milestone: depth === "COMMITMENT" ? "Term sheet preparation" : depth === "EVALUATION" ? "Data room access" : "First meeting",
      };
    })
  );

  const { error } = await client.from("cmppm_institutional_trust").insert(records);
  if (error) throw error;

  const committed = records.filter((r) => r.engagement_depth === "COMMITMENT").length;
  return { trust_dimensions_mapped: records.length, segments_covered: segments.length, committed_dimensions: committed };
}

async function computeValuationFlywheel(client: ReturnType<typeof sb>) {
  const stages = [
    { stage: "NARRATIVE", target: 90 },
    { stage: "INVESTOR_DEMAND", target: 85 },
    { stage: "VALUATION_PREMIUM", target: 80 },
    { stage: "MEDIA_ATTENTION", target: 75 },
    { stage: "TALENT_ATTRACTION", target: 70 },
  ] as const;

  const records = stages.map((s, i) => {
    const strength = 30 + Math.random() * 60;
    const momentum = strength * (0.5 + Math.random() * 0.5);
    const amp = 1 + (strength / 100) * 0.5;
    const rpm = strength * amp * (1 + i * 0.05);
    const bottleneckSev = 100 - strength;

    return {
      flywheel_stage: s.stage,
      stage_strength: Math.round(strength * 100) / 100,
      momentum_contribution: Math.round(momentum * 100) / 100,
      reinforcement_loops: [
        `${s.stage} feeds next stage at ${Math.round(amp * 100)}% amplification`,
        `Compounding at ${Math.round(rpm / 10)}% per cycle`,
      ],
      amplification_factor: Math.round(amp * 100) / 100,
      current_rpm: Math.round(rpm * 100) / 100,
      target_rpm: s.target,
      bottleneck_identified: bottleneckSev > 50 ? `${s.stage} needs acceleration` : null,
      bottleneck_severity: Math.round(bottleneckSev * 100) / 100,
      intervention_strategy: bottleneckSev > 50 ? "DOUBLE_DOWN_INVESTMENT" : "MAINTAIN_MOMENTUM",
      compounding_velocity: Math.round((rpm / s.target) * 100) / 100,
      cycle_number: 1 + Math.floor(Math.random() * 5),
    };
  });

  const { error } = await client.from("cmppm_valuation_psychology").insert(records);
  if (error) throw error;

  const avgRpm = Math.round(records.reduce((s, r) => s + r.current_rpm, 0) / records.length);
  const bottlenecks = records.filter((r) => r.bottleneck_identified).length;

  await client.from("ai_event_signals").insert({
    event_type: "cmppm_engine_cycle",
    entity_type: "cmppm",
    entity_id: "flywheel",
    priority_level: "normal",
    payload: { avg_rpm: avgRpm, bottlenecks, stages: records.length },
  });

  return { stages_computed: records.length, avg_rpm: avgRpm, bottlenecks, strongest_stage: records.sort((a, b) => b.current_rpm - a.current_rpm)[0]?.flywheel_stage };
}

async function dashboard(client: ReturnType<typeof sb>) {
  const [narratives, categories, scarcity, trust, flywheel] = await Promise.all([
    client.from("cmppm_narrative_power").select("*").order("narrative_strength_score", { ascending: false }).limit(10),
    client.from("cmppm_category_leadership").select("*").order("category_ownership_score", { ascending: false }).limit(10),
    client.from("cmppm_scarcity_momentum").select("*").order("fomo_intensity", { ascending: false }).limit(15),
    client.from("cmppm_institutional_trust").select("*").order("trust_score", { ascending: false }).limit(20),
    client.from("cmppm_valuation_psychology").select("*").order("current_rpm", { ascending: false }).limit(10),
  ]);

  const narData = narratives.data ?? [];
  const scarcityData = scarcity.data ?? [];
  const trustData = trust.data ?? [];
  const fwData = flywheel.data ?? [];

  return {
    data: {
      summary: {
        dominant_narratives: narData.filter((n: any) => n.narrative_status === "DOMINANT").length,
        active_narratives: narData.filter((n: any) => n.narrative_status === "ACTIVE").length,
        categories_owned: (categories.data ?? []).filter((c: any) => c.category_ownership_score > 50).length,
        high_fomo_signals: scarcityData.filter((s: any) => s.fomo_intensity > 70).length,
        avg_institutional_trust: trustData.length ? Math.round(trustData.reduce((s: number, t: any) => s + (t.trust_score || 0), 0) / trustData.length) : 0,
        flywheel_rpm: fwData.length ? Math.round(fwData.reduce((s: number, f: any) => s + (f.current_rpm || 0), 0) / fwData.length) : 0,
        strongest_narrative: narData[0]?.narrative_frame || "N/A",
      },
      narratives: narData,
      category_leadership: categories.data ?? [],
      scarcity_signals: scarcityData,
      institutional_trust: trustData,
      valuation_flywheel: fwData,
    },
  };
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params = {} } = await req.json();
    const client = sb();

    switch (mode) {
      case "dashboard": return json(await dashboard(client));
      case "craft_narratives": return json(await craftNarratives(client));
      case "build_category_leadership": return json(await buildCategoryLeadership(client));
      case "generate_scarcity_signals": return json(await generateScarcitySignals(client));
      case "build_institutional_trust": return json(await buildInstitutionalTrust(client));
      case "compute_valuation_flywheel": return json(await computeValuationFlywheel(client));
      default: return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
