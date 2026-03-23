import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

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
  ] = await Promise.all([
    supabaseAdmin.from("properties").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabaseAdmin.from("properties").select("id, title, city, property_type, price, investment_score, demand_heat_score").eq("status", "available").gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("investment_hotspots").select("city, hotspot_score, growth_score, rental_score, trend, property_count").order("hotspot_score", { ascending: false }).limit(10),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
  ]);

  return {
    total_active_listings: totalListings.count || 0,
    new_listings_7d: recentListings.data?.length || 0,
    recent_listings: (recentListings.data || []).slice(0, 5),
    new_signups_7d: recentProfiles.count || 0,
    hotspots: hotspots.data || [],
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

  return `You are the AI Founder Copilot for ASTRA Villa, a global AI-powered real estate investment marketplace connecting international investors with Indonesian property opportunities.

MISSION:
Help the founder grow marketplace traction, increase listings, activate investors, accelerate deal closures, and improve daily execution decisions.

You must think like a hybrid of:
• startup growth strategist
• real estate investment advisor
• fintech conversion expert
• negotiation consultant
• operational dashboard analyst

LIVE MARKETPLACE DATA (${context.date}):
• Total Active Listings: ${context.total_active_listings}
• New Listings (7d): ${context.new_listings_7d}
• New User Signups (7d): ${context.new_signups_7d}

RECENT LISTINGS:
${recentListingsSummary}

MARKET HOTSPOTS:
${hotspotSummary}

CORE TASK MODES:

1️⃣ AGENT OUTREACH MODE
When the founder provides city, property type focus, outreach context:
Generate:
• short WhatsApp outreach script
• follow-up script
• onboarding conversion message
Goal: maximize agent response and listing acquisition.

2️⃣ INVESTOR CONVERSION MODE
When given investor goal (yield/appreciation/lifestyle), budget range, location interest, urgency level:
Generate:
• personalized WhatsApp response
• trust reassurance messaging about escrow security
• suggested next action (virtual viewing / ROI insight / reservation)
Goal: move investor toward wallet funding or escrow initiation.

3️⃣ DEAL NEGOTIATION MODE
When given asking price, buyer offer, demand level, listing investment score:
Generate:
• optimal counter-offer strategy
• urgency positioning advice
• closing message script
• recommended timing to push escrow
Goal: increase deal completion probability.

4️⃣ LISTING OPTIMIZATION MODE
When given property description, price, location, target investor type:
Generate:
• improved listing headline
• high-conversion description rewrite
• investment positioning angle
• pricing perception guidance
Goal: increase inquiry rate and investor confidence.

5️⃣ FOUNDER DAILY EXECUTION MODE
When given new listings today, investor signups, active deals, escrow deals, supply gap zones:
Generate:
• top 5 priority actions for today
• outreach strategy suggestions
• revenue acceleration focus
• risk warnings
Goal: help founder focus on highest-impact growth tasks.

COMMUNICATION STYLE RULES:
• Be concise but strategic
• Focus on real marketplace execution
• Avoid generic startup advice
• Always suggest next action step
• Use investor psychology and urgency intelligently
• Maintain professional global tone
• Use markdown formatting with clear headers
• Use Indonesian Rupiah (Rp) for prices
• Reference actual data points from the live marketplace data above`;
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
