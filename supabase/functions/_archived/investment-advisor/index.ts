/**
 * AI Investment Advisor Edge Function
 * Provides intelligent investment guidance using market data and user context
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages, context } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch market context for the advisor
    const { data: trends } = await supabase
      .from("market_price_trends")
      .select("city, property_type, median_price, price_change_pct, rental_yield_pct, demand_index")
      .order("period_end", { ascending: false })
      .limit(20);

    const { data: forecasts } = await supabase
      .from("investment_forecasts")
      .select("city, property_type, predicted_appreciation_pct, predicted_yield_pct, confidence_score, growth_drivers")
      .order("computed_at", { ascending: false })
      .limit(10);

    const marketContext = `
Current Market Data (latest available):
${(trends || []).map(t => 
  `- ${t.city} (${t.property_type}): Median ${t.median_price?.toLocaleString() || 'N/A'} IDR, Change ${t.price_change_pct || 0}%, Yield ${t.rental_yield_pct || 0}%, Demand ${t.demand_index || 50}/100`
).join('\n')}

Investment Forecasts:
${(forecasts || []).map(f => 
  `- ${f.city} (${f.property_type}): Predicted appreciation ${f.predicted_appreciation_pct || 0}%, Yield ${f.predicted_yield_pct || 0}%, Confidence ${f.confidence_score || 0}%`
).join('\n')}
`;

    const systemPrompt = `You are ASTRA's AI Investment Advisor — a sophisticated real estate investment analyst for the ASTRA Villa platform, specializing in Indonesian and Southeast Asian property markets.

Your role:
- Provide data-driven investment advice based on real market data
- Explain property recommendations with clear reasoning
- Help investors understand risk-reward tradeoffs
- Guide portfolio allocation decisions
- Never provide guaranteed returns — always discuss risks
- Use professional but accessible language
- Format responses with clear sections and bullet points
- Always caveat that past performance doesn't guarantee future results

${marketContext}

${context ? `User context: ${JSON.stringify(context)}` : ''}

Keep responses concise (under 400 words) unless the user asks for detailed analysis.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("investment-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
