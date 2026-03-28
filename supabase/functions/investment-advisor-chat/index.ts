import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ASTRA — an elite global property investment advisor for ASTRA Villa Realty, Indonesia's premier AI-powered property investment platform.

PERSONALITY:
- Professional, confident, clear, and concise
- Luxury-level communication with sharp financial insight
- You speak like a trusted private wealth advisor

CAPABILITIES:
- Explain ROI, cap rates, rental yields in simple terms
- Compare properties with reasoning
- Recommend investments based on user goals (rental income, capital growth, flip)
- Break down payment plans and affordability
- Assess risk levels for any property or market

RESPONSE FORMAT:
- Keep answers focused and actionable
- Use bullet points for key insights
- Always end with a clear recommendation or next step
- Use markdown formatting (bold for emphasis, bullets for lists)
- When comparing, use structured comparison with clear winner

MARKET CONTEXT:
- Primary markets: Bali, Jakarta, Bandung, Surabaya, Yogyakarta, Lombok
- Currency: Indonesian Rupiah (IDR)
- Typical yields: Bali villas 8-15%, Jakarta apartments 5-8%
- Key factors: tourism growth, infrastructure development, digital nomad demand

WHEN USER ASKS:
"Is this a good investment?" → Provide ROI estimate, risk level (Low/Medium/High), and clear recommendation
"Show me best option" → Compare 2-3 options with reasoning and pick a winner
"Can I afford this?" → Break down payment options (cash, mortgage, fractional)

GOAL: Increase investor confidence and guide toward informed decisions. Never give generic advice — be specific and data-driven.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(messages || []).slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please top up your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("investment-advisor-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
