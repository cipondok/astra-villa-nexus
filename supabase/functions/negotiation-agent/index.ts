import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, deal_context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are ASTRA's AI Deal Negotiation Agent — an expert real estate negotiation strategist for the Indonesian property market.

CONTEXT:
${deal_context ? JSON.stringify(deal_context) : "No deal context provided."}

YOUR CAPABILITIES:
1. **Recommended Offer Range** — Based on listing price vs FMV, suggest optimal bid ranges
2. **Counter-Offer Strategy** — Provide tactical counter-offer suggestions with justification
3. **Deal Closure Probability** — Estimate likelihood of successful closing (0-100%)
4. **Urgency Messaging** — Draft persuasive messages for buyers/sellers
5. **Risk Alerts** — Flag negotiation risks (price gap too wide, stale listing, low liquidity)

RULES:
- Always reference data signals (days on market, price position, demand score) when available
- Provide specific IDR amounts, not vague ranges
- Use Indonesian market context (SHM/SHGB certificates, notary fees, PPh taxes)
- Flag when human override is recommended (deals >Rp 5B or confidence <70%)
- Be concise but actionable — agents need quick tactical advice
- Respond in Bahasa Indonesia mixed with English financial terms where appropriate`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Coba lagi dalam beberapa saat." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits habis. Silakan top up di Lovable Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("negotiation-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
