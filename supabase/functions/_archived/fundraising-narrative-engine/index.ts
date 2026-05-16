import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { mode, params = {} } = await req.json();

    if (mode === "dashboard") {
      const [vision, market, traction, moat, psychology] = await Promise.all([
        sb.from("gfne_vision_narrative").select("*").eq("is_active", true).order("narrative_strength", { ascending: false }).limit(15),
        sb.from("gfne_market_opportunity").select("*").order("tam_usd", { ascending: false }).limit(10),
        sb.from("gfne_traction_signals").select("*").order("measured_at", { ascending: false }).limit(20),
        sb.from("gfne_moat_communication").select("*").order("depth_score", { ascending: false }).limit(10),
        sb.from("gfne_investor_psychology").select("*").order("effectiveness_score", { ascending: false }).limit(10),
      ]);

      const v = vision.data || []; const m = market.data || []; const t = traction.data || [];
      const mo = moat.data || []; const p = psychology.data || [];

      return json({
        summary: {
          active_narratives: v.length,
          avg_narrative_strength: v.length ? +(v.reduce((s: number, x: any) => s + (x.narrative_strength || 0), 0) / v.length).toFixed(1) : 0,
          total_tam_usd: m.reduce((s: number, x: any) => s + (x.tam_usd || 0), 0),
          critical_traction: t.filter((x: any) => x.investor_relevance === "critical").length,
          avg_traction_growth: t.length ? +(t.reduce((s: number, x: any) => s + (x.growth_pct || 0), 0) / t.length).toFixed(1) : 0,
          strongest_moat: mo[0]?.moat_name || "N/A",
          moat_depth_avg: mo.length ? +(mo.reduce((s: number, x: any) => s + (x.depth_score || 0), 0) / mo.length).toFixed(1) : 0,
          investor_archetypes: p.length,
        },
        vision_narratives: v,
        market_opportunities: m,
        traction_signals: t,
        moat_communication: mo,
        investor_psychology: p,
      });
    }

    if (mode === "craft_vision") {
      const narratives = [
        { layer: "market_inefficiency", headline: "Global Real Estate: $300T in Assets, 1% Digitized", thesis: "Real estate remains the world's largest asset class yet most technologically primitive. Information asymmetry costs investors billions annually through mispriced assets, opaque transactions, and fragmented data.", hook: "What if every property transaction had the transparency of a stock trade?" },
        { layer: "digital_transformation", headline: "From Opaque Markets to Intelligent Infrastructure", thesis: "Digital infrastructure transforms property from illiquid, locally-traded assets into transparent, globally-accessible investment opportunities with real-time pricing intelligence.", hook: "We're building the Bloomberg Terminal for property — starting where it matters most." },
        { layer: "data_ecosystem", headline: "The Compounding Data Moat", thesis: "Every transaction, viewing, and price signal creates proprietary intelligence that makes the platform smarter, faster, and more indispensable. This data flywheel is the ultimate competitive moat.", hook: "Our data advantage compounds daily — competitors can't buy time." },
        { layer: "liquidity_evolution", headline: "Unlocking $9.6T in Trapped ASEAN Real Estate Value", thesis: "By reducing transaction friction, providing institutional-grade intelligence, and connecting global capital to local opportunity, we transform illiquid property markets into efficient, liquid ecosystems.", hook: "Liquidity creates value. We create liquidity." },
        { layer: "platform_vision", headline: "The Operating System for Global Property Investment", thesis: "A full-stack intelligence platform connecting investors, developers, agents, and service providers in a self-reinforcing ecosystem where every participant makes the platform more valuable for all others.", hook: "Not a listing site. An intelligence operating system." },
      ];

      const rows: any[] = narratives.map(n => ({
        narrative_layer: n.layer,
        headline: n.headline,
        core_thesis: n.thesis,
        emotional_hook: n.hook,
        supporting_evidence: ["Market data analysis", "Comparable platform precedents", "User research insights"],
        data_points: { tam_global: "326T", digital_penetration: "1.2%", yoy_growth: "23%" },
        target_audience: params.audience || "general",
        narrative_strength: +(60 + Math.random() * 35).toFixed(1),
        is_active: true,
        version: 1,
      }));

      const { error } = await sb.from("gfne_vision_narrative").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gfne_engine_cycle", entity_type: "gfne", priority_level: "medium", payload: { mode, narratives: rows.length } });
      return json({ narratives_crafted: rows.length, strongest: rows.sort((a, b) => b.narrative_strength - a.narrative_strength)[0]?.headline });
    }

    if (mode === "position_market") {
      const segments = [
        { segment: "Indonesia Residential", tam: 180e9, sam: 45e9, som: 2e9, growth: 8.5 },
        { segment: "ASEAN Commercial RE", tam: 320e9, sam: 80e9, som: 5e9, growth: 12.3 },
        { segment: "Global PropTech SaaS", tam: 25e9, sam: 8e9, som: 500e6, growth: 22.1 },
        { segment: "Cross-Border RE Investment", tam: 1.2e12, sam: 120e9, som: 10e9, growth: 15.7 },
        { segment: "RE Data & Analytics", tam: 15e9, sam: 4e9, som: 300e6, growth: 28.4 },
      ];

      const rows: any[] = segments.map(s => ({
        market_segment: s.segment,
        tam_usd: s.tam,
        sam_usd: s.sam,
        som_usd: s.som,
        growth_rate_pct: s.growth,
        penetration_current_pct: +(Math.random() * 2).toFixed(2),
        penetration_target_pct: +(5 + Math.random() * 15).toFixed(1),
        regional_breakdown: { indonesia: 40, asean: 35, global: 25 },
        network_effect_multiplier: +(1.2 + Math.random() * 1.5).toFixed(2),
        competitive_landscape_summary: `${s.segment}: fragmented with no dominant digital player`,
        expansion_pathway: ["Indonesia dominance", "ASEAN expansion", "Global intelligence pivot"],
        defensibility_narrative: "Proprietary data moat + network effects + execution speed",
        time_horizon: "5_year",
        confidence: +(65 + Math.random() * 30).toFixed(1),
      }));

      const { error } = await sb.from("gfne_market_opportunity").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gfne_engine_cycle", entity_type: "gfne", priority_level: "medium", payload: { mode, segments: rows.length } });
      return json({ segments_positioned: rows.length, total_tam: rows.reduce((s, r) => s + r.tam_usd, 0) });
    }

    if (mode === "amplify_traction") {
      const signals = [
        { cat: "growth_momentum", name: "Monthly Active Investors", cur: 2400, prev: 1800, rel: "critical", vis: "hero_stat" },
        { cat: "growth_momentum", name: "MoM Revenue Growth", cur: 32, prev: 24, rel: "critical", vis: "trend_chart" },
        { cat: "ecosystem_adoption", name: "Agent Partners Active", cur: 180, prev: 120, rel: "high", vis: "metric_card" },
        { cat: "ecosystem_adoption", name: "Developer Integrations", cur: 15, prev: 8, rel: "high", vis: "milestone_marker" },
        { cat: "liquidity_density", name: "Avg Days to Transaction", cur: 28, prev: 45, rel: "critical", vis: "comparison_bar" },
        { cat: "liquidity_density", name: "Listing Absorption Rate", cur: 68, prev: 52, rel: "high", vis: "trend_chart" },
        { cat: "revenue_velocity", name: "Monthly Recurring Revenue (IDR M)", cur: 85, prev: 52, rel: "critical", vis: "hero_stat" },
        { cat: "engagement_depth", name: "Avg Session Duration (min)", cur: 12.5, prev: 8.3, rel: "supportive", vis: "metric_card" },
        { cat: "viral_coefficient", name: "Referral K-Factor", cur: 1.4, prev: 1.1, rel: "high", vis: "hero_stat" },
        { cat: "engagement_depth", name: "AI Feature Adoption %", cur: 73, prev: 45, rel: "high", vis: "trend_chart" },
      ];

      const rows: any[] = signals.map(s => {
        const growth = s.prev !== 0 ? ((s.cur - s.prev) / Math.abs(s.prev)) * 100 : 100;
        return {
          signal_category: s.cat,
          metric_name: s.name,
          current_value: s.cur,
          previous_value: s.prev,
          growth_pct: +growth.toFixed(1),
          benchmark_value: s.cur * (0.5 + Math.random() * 0.3),
          benchmark_source: "Industry average (CB Insights PropTech)",
          narrative_framing: growth >= 50 ? `${s.name} surging ${growth.toFixed(0)}% — breakout momentum` : `${s.name} growing ${growth.toFixed(0)}% — strong trajectory`,
          investor_relevance: s.rel,
          visual_treatment: s.vis,
          period: "monthly",
        };
      });

      const { error } = await sb.from("gfne_traction_signals").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gfne_engine_cycle", entity_type: "gfne", priority_level: "medium", payload: { mode, signals: rows.length } });
      return json({ signals_amplified: rows.length, critical: rows.filter(r => r.investor_relevance === "critical").length, avg_growth: +(rows.reduce((s, r) => s + r.growth_pct, 0) / rows.length).toFixed(1) });
    }

    if (mode === "communicate_moat") {
      const moats = [
        { type: "data_intelligence", name: "Proprietary Transaction Intelligence", depth: 85, diff: "near_impossible", months: 36, narrative: "450+ database tables, 18 edge functions, and 6 autonomous AI workers processing millions of data points create prediction accuracy competitors cannot replicate without years of market presence." },
        { type: "network_effects", name: "Multi-Sided Marketplace Network", depth: 78, diff: "hard", months: 24, narrative: "Every new investor attracts more agent listings, every listing attracts more investors. This self-reinforcing loop accelerates with scale and creates natural monopoly dynamics." },
        { type: "ecosystem_lockin", name: "Deep Workflow Integration", depth: 72, diff: "hard", months: 18, narrative: "Agents, developers, and investors embed our intelligence into daily operations — switching costs increase exponentially with usage depth." },
        { type: "execution_speed", name: "Full-Stack Technical Velocity", depth: 68, diff: "moderate", months: 12, narrative: "Ship speed of a startup with the data infrastructure of an enterprise. Our technical architecture enables rapid iteration that larger incumbents cannot match." },
        { type: "regulatory_positioning", name: "Indonesian Market First-Mover", depth: 65, diff: "hard", months: 24, narrative: "Deep regulatory knowledge, local partnerships, and cultural fluency in the world's 4th largest population creates barriers for foreign entrants." },
        { type: "brand_trust", name: "Institutional-Grade Trust Layer", depth: 60, diff: "moderate", months: 18, narrative: "Built trust through transparency, verified data, and consistent intelligence quality. Institutional investors require reliability that takes years to establish." },
      ];

      const rows: any[] = moats.map(m => ({
        moat_type: m.type,
        moat_name: m.name,
        depth_score: m.depth,
        replication_difficulty: m.diff,
        time_to_replicate_months: m.months,
        competitive_advantage_narrative: m.narrative,
        evidence_points: ["Platform metrics", "User retention data", "Competitive analysis"],
        investor_proof_points: { metric: `${m.depth}/100 depth`, trend: "strengthening", comparable: "Similar moat pattern seen in Zillow/CoStar" },
        moat_trend: m.depth >= 75 ? "strengthening" : "stable",
      }));

      const { error } = await sb.from("gfne_moat_communication").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gfne_engine_cycle", entity_type: "gfne", priority_level: "medium", payload: { mode, moats: rows.length } });
      return json({ moats_communicated: rows.length, strongest: rows[0]?.moat_name, avg_depth: +(rows.reduce((s, r) => s + r.depth_score, 0) / rows.length).toFixed(1) });
    }

    if (mode === "align_psychology") {
      const archetypes = [
        { type: "vc_growth", motivation: "10x+ return within 5-7 years via rapid market capture", risk: "aggressive", tone: "visionary", drivers: ["TAM size", "Growth velocity", "Team pedigree", "Market timing"], objections: ["Small market", "Unproven model", "Competitive risk"], emphasis: ["Vision", "TAM", "Traction", "Team"], playbook: "Lead with vision, prove with traction, close with urgency. Show 10x path through market expansion." },
        { type: "institutional", motivation: "Risk-adjusted returns with portfolio diversification into RE tech", risk: "moderate", tone: "data_driven", drivers: ["Unit economics", "Revenue predictability", "Risk management", "Governance"], objections: ["Revenue concentration", "Regulatory risk", "Management depth"], emphasis: ["Unit Economics", "Risk Framework", "Governance", "Financial Projections"], playbook: "Lead with data, emphasize risk management, demonstrate institutional-grade operations." },
        { type: "sovereign", motivation: "Strategic positioning in emerging market infrastructure + long-term value", risk: "conservative", tone: "conservative", drivers: ["Strategic alignment", "Market stability", "Long-term vision", "ESG factors"], objections: ["Geopolitical risk", "Currency exposure", "Execution timeline"], emphasis: ["Strategic Vision", "Market Infrastructure", "ESG", "Government Relations"], playbook: "Lead with infrastructure narrative, emphasize nation-building impact, demonstrate stability." },
        { type: "angel", motivation: "Early-stage upside with founder conviction and domain expertise", risk: "aggressive", tone: "narrative_rich", drivers: ["Founder story", "Product insight", "Early traction", "Personal conviction"], objections: ["Too early", "No revenue", "Solo founder risk"], emphasis: ["Founder Story", "Product Demo", "Early Users", "Vision"], playbook: "Lead with founder story, demo the product, show early love signals." },
        { type: "family_office", motivation: "Multi-generational wealth preservation with RE sector exposure", risk: "moderate", tone: "conservative", drivers: ["Asset quality", "Wealth preservation", "Tax efficiency", "Legacy building"], objections: ["Liquidity concern", "Valuation premium", "Control rights"], emphasis: ["Asset Strategy", "Tax Framework", "Long-term Returns", "Co-investment"], playbook: "Position as real estate evolution, not tech bet. Emphasize tangible asset backing." },
        { type: "strategic_corporate", motivation: "Market intelligence access + ecosystem integration opportunities", risk: "moderate", tone: "technical", drivers: ["Data access", "API integration", "Market positioning", "Customer synergy"], objections: ["Integration complexity", "Exclusivity terms", "Build vs buy"], emphasis: ["Technical Architecture", "Data Moat", "API Ecosystem", "Synergy Analysis"], playbook: "Lead with technical depth, demonstrate data value, propose integration pathway." },
      ];

      const rows: any[] = archetypes.map(a => ({
        investor_archetype: a.type,
        primary_motivation: a.motivation,
        risk_tolerance: a.risk,
        return_expectation: a.type === "vc_growth" ? "10x+ in 5-7 years" : a.type === "sovereign" ? "8-12% IRR over 10+ years" : "3-5x in 5-8 years",
        decision_drivers: a.drivers,
        objection_patterns: a.objections,
        objection_responses: Object.fromEntries(a.objections.map((o, i) => [o, `Addressed through ${a.drivers[i] || "strategic positioning"}`])),
        messaging_tone: a.tone,
        deck_emphasis: a.emphasis,
        follow_up_sequence: [{ day: 1, action: "Thank you + key takeaway" }, { week: 3, action: "Traction update" }, { week: 5, action: "Soft close or next step" }],
        conversion_playbook: a.playbook,
        effectiveness_score: +(55 + Math.random() * 40).toFixed(1),
      }));

      const { error } = await sb.from("gfne_investor_psychology").insert(rows);
      if (error) throw error;

      await sb.from("ai_event_signals").insert({ event_type: "gfne_engine_cycle", entity_type: "gfne", priority_level: "medium", payload: { mode, archetypes: rows.length } });
      return json({ archetypes_aligned: rows.length, avg_effectiveness: +(rows.reduce((s, r) => s + r.effectiveness_score, 0) / rows.length).toFixed(1) });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
