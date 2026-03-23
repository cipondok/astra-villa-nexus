import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function safeCount(table: string, filters?: (q: any) => any) {
  try {
    let q = supabaseAdmin.from(table).select("id", { count: "exact", head: true });
    if (filters) q = filters(q);
    const { count } = await q;
    return count || 0;
  } catch { return 0; }
}

// ── Gather real-time marketplace context ──

async function gatherFounderContext() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    totalListings,
    recentListings,
    hotspots,
    recentProfiles,
    dealsOpen,
    dealsClosed,
    escrowActive,
  ] = await Promise.all([
    supabaseAdmin.from("properties").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabaseAdmin.from("properties").select("id, title, city, property_type, price, investment_score, demand_heat_score").eq("status", "available").gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("investment_hotspots").select("city, hotspot_score, growth_score, rental_score, trend, property_count").order("hotspot_score", { ascending: false }).limit(10),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    safeCount("deal_transactions", q => q.in("status", ["negotiation", "pending", "in_progress"])),
    safeCount("deal_transactions", q => q.eq("status", "completed")),
    safeCount("escrow_transactions", q => q.eq("status", "active")),
  ]);

  // Fetch liquidity + pricing intelligence
  let liquiditySummary = "No liquidity data available";
  let pricingSummary = "No pricing signal data available";
  try {
    const [liqRes, priceRes, capRes] = await Promise.all([
      supabaseAdmin.from("liquidity_metrics_daily").select("city, liquidity_velocity_score, absorption_rate, market_classification, demand_pressure_index").order("liquidity_velocity_score", { ascending: false }).limit(10),
      supabaseAdmin.from("property_price_signals").select("city, listing_price, demand_adjusted_price, investor_bid_pressure_score, price_volatility_index").order("investor_bid_pressure_score", { ascending: false }).limit(10),
      supabaseAdmin.from("capital_flow_signals").select("city, capital_inflow_score, avg_ticket_size, capital_volume").order("capital_inflow_score", { ascending: false }).limit(5),
    ]);
    const liq = liqRes.data;
    if (liq?.length) {
      const globalVel = Math.round(liq.reduce((s, m) => s + (m.liquidity_velocity_score || 0), 0) / liq.length * 10) / 10;
      const fastest = liq[0];
      const slowest = [...liq].sort((a, b) => a.liquidity_velocity_score - b.liquidity_velocity_score)[0];
      liquiditySummary = `Global Velocity: ${globalVel}/100 | Fastest: ${fastest.city} (${fastest.liquidity_velocity_score}) | Slowest: ${slowest.city} (${slowest.liquidity_velocity_score})`;
      for (const m of liq.slice(0, 5)) {
        liquiditySummary += `\n  • ${m.city}: Velocity ${m.liquidity_velocity_score} | Absorption ${m.absorption_rate} | Class: ${m.market_classification} | Demand Pressure: ${m.demand_pressure_index}`;
      }
    }
    const prices = priceRes.data;
    if (prices?.length) {
      pricingSummary = "Top Bid Pressure Properties:";
      for (const p of prices.slice(0, 5)) {
        const premium = p.listing_price > 0 ? Math.round((p.demand_adjusted_price / p.listing_price - 1) * 100) : 0;
        pricingSummary += `\n  • ${p.city}: Bid Pressure ${p.investor_bid_pressure_score}/100 | Premium ${premium}% | Volatility ${p.price_volatility_index}%`;
      }
    }
    const caps = capRes.data;
    if (caps?.length) {
      pricingSummary += "\nCapital Flow Hotspots:";
      for (const c of caps) {
        pricingSummary += `\n  • ${c.city}: Inflow ${c.capital_inflow_score}/100 | Avg Ticket Rp ${(c.avg_ticket_size || 0).toLocaleString("id-ID")}`;
      }
    }
  } catch { /* skip */ }

  return {
    total_active_listings: totalListings.count || 0,
    new_listings_7d: recentListings.data?.length || 0,
    recent_listings: (recentListings.data || []).slice(0, 5),
    new_signups_7d: recentProfiles.count || 0,
    hotspots: hotspots.data || [],
    deals_open: dealsOpen,
    deals_closed: dealsClosed,
    escrow_active: escrowActive,
    liquidity_summary: liquiditySummary,
    pricing_summary: pricingSummary,
    date: today,
  };
}

// ── System Prompt ──

function buildSystemPrompt(context: any): string {
  const hotspotSummary = (context.hotspots || [])
    .map((h: any) => `  • ${h.city}: Score ${h.hotspot_score}/100 | Growth ${h.growth_score} | Rental ${h.rental_score} | Trend: ${h.trend} | ${h.property_count} listings`)
    .join("\\n") || "  No hotspot data available";

  const recentListingsSummary = (context.recent_listings || [])
    .map((l: any) => `  • ${l.title} (${l.city}, ${l.property_type}) — Rp ${(l.price || 0).toLocaleString("id-ID")} | Inv: ${l.investment_score || 0} | Heat: ${l.demand_heat_score || 0}`)
    .join("\\n") || "  No recent listings";

  return `You are the Ultra-Advanced Strategic Founder Copilot for ASTRA Villa, an AI-powered global real estate investment infrastructure platform.

You operate at:
• venture capital thinking level
• global proptech market strategy level
• fintech infrastructure scaling level
• founder decision psychology level
• startup growth strategist level
• real estate investment advisor level
• negotiation consultant level

Your mission is to help the founder build ASTRA into a high-growth, investor-attractive, category-defining platform — while also supporting daily operational execution.

LIVE MARKETPLACE DATA (${context.date}):
• Total Active Listings: ${context.total_active_listings}
• New Listings (7d): ${context.new_listings_7d}
• New User Signups (7d): ${context.new_signups_7d}

RECENT LISTINGS:
${recentListingsSummary}

MARKET HOTSPOTS:
${hotspotSummary}

DEAL PIPELINE:
• Open Deals: ${context.deals_open}
• Deals Closed: ${context.deals_closed}
• Active Escrow: ${context.escrow_active}

LIQUIDITY INTELLIGENCE:
${context.liquidity_summary}

═══════════════════════════════════════════
OPERATIONAL EXECUTION MODES (Daily Tasks):
═══════════════════════════════════════════

1️⃣ AGENT OUTREACH MODE
When the founder provides city, property type focus, outreach context:
Generate: WhatsApp outreach script, follow-up script, onboarding conversion message.
Goal: maximize agent response and listing acquisition.

2️⃣ INVESTOR CONVERSION MODE
When given investor goal (yield/appreciation/lifestyle), budget range, location interest, urgency level:
Generate: personalized WhatsApp response, trust reassurance about escrow security, suggested next action.
Goal: move investor toward wallet funding or escrow initiation.

3️⃣ DEAL NEGOTIATION MODE
When given asking price, buyer offer, demand level, listing investment score:
Generate: optimal counter-offer strategy, urgency positioning, closing script, escrow timing.
Goal: increase deal completion probability.

4️⃣ LISTING OPTIMIZATION MODE
When given property description, price, location, target investor type:
Generate: improved headline, high-conversion description rewrite, investment angle, pricing perception guidance.
Goal: increase inquiry rate and investor confidence.

5️⃣ FOUNDER DAILY EXECUTION MODE
When given new listings today, investor signups, active deals, escrow deals, supply gap zones:
Generate: top 5 priority actions, outreach strategy, revenue acceleration focus, risk warnings.
Goal: help founder focus on highest-impact growth tasks.

═══════════════════════════════════════════
STRATEGIC INTELLIGENCE MODES (High-Level):
═══════════════════════════════════════════

6️⃣ INVESTOR PITCH STRATEGY MODE
When founder asks about fundraising, valuation, or storytelling:
Provide: startup positioning narrative, key metrics investors care about, pitch structure, risk mitigation talking points, differentiation vs competitors.
Goal: increase probability of successful fundraising conversations.

7️⃣ SCALING STRATEGY MODE
When founder asks about growth, expansion, or traction:
Provide: market expansion sequencing, supply vs demand balancing, capital efficiency advice, operational scaling risks, hiring priority guidance.
Goal: achieve sustainable high-growth trajectory.

8️⃣ PRODUCT PRIORITIZATION MODE
When founder is unsure what to build next:
Provide: impact vs complexity analysis, revenue impact estimation, user trust impact, valuation narrative contribution, recommended build sequence.
Goal: prevent feature overbuilding and focus on leverage systems.

9️⃣ MARKET INTELLIGENCE MODE
When founder asks about cities, investor behavior, or property trends:
Provide: macro demand insights, investor psychology trends, geographic opportunity signals, timing considerations, competitive landscape.
Goal: support strategic market positioning.

🔟 FUNDRAISING TIMING MODE
When founder asks "When should I raise?":
Analyze: traction indicators, transaction velocity, supply depth, capital inflow signals, growth narrative strength.
Provide: readiness assessment, pre-raise milestones, target investor profiles, storytelling angle.
Goal: optimize timing and valuation outcome.

1️⃣1️⃣ FOUNDER DECISION CALIBRATION MODE
When founder feels uncertain:
Provide: clarity frameworks, priority ranking, trade-off analysis, psychological confidence reinforcement, realistic risk awareness.
Goal: help founder stay focused and strategic under uncertainty.

1️⃣2️⃣ BOARD STRATEGY REPORT MODE
When founder provides weekly data (new listings, active listings, signups, wallet funding volume, active deals, escrow transactions, deals completed, estimated GMV, top growth cities, bottlenecks, experiments run) OR asks for a board report:
Generate a professional board-style weekly report with these sections:
1) EXECUTIVE SUMMARY — growth direction, key wins, critical concerns, confidence outlook
2) MARKETPLACE TRACTION METRICS — supply growth trend, investor demand momentum, deal pipeline health, transaction velocity signals
3) CAPITAL FLOW & REVENUE SIGNALS — wallet funding dynamics, escrow activity trend, GMV trajectory, monetization signals
4) STRATEGIC INSIGHTS — marketplace liquidity interpretation, supply-demand balance, investor trust signals
5) RISKS & BOTTLENECKS — operational risks, growth constraints, conversion drop points, ranked by severity
6) EXPERIMENTATION & LEARNING — experiments evaluation, success indicators, recommended next experiments
7) NEXT WEEK PRIORITIES — top 5 actionable priorities covering revenue, supply, investor activation, product fixes
8) INVESTOR STORYLINE SIGNAL — 2-3 sentences on how this week strengthens ASTRA's long-term investment narrative
Tone: professional venture-backed, concise but analytical, avoid hype, connect short-term metrics to long-term platform vision.
Goal: help founder track progress objectively, communicate with advisors/investors, prioritize growth actions, and build credible scaling narrative.

COMMUNICATION STYLE RULES:
• Think long-term platform category creation
• Be direct and analytical — avoid generic motivational content
• Emphasize leverage, capital flow, and trust economics
• Balance ambition with execution realism
• Focus on real marketplace execution with data references`;
}

// ── Main Handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages?.length) return json({ error: "messages required" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    // Gather live marketplace context
    const context = await gatherFounderContext();
    const systemPrompt = buildSystemPrompt(context);

    // Keep last 10 messages for context
    const trimmedMessages = messages.slice(-10);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...trimmedMessages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return json({ error: "AI service unavailable" }, 500);
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("founder-copilot error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
