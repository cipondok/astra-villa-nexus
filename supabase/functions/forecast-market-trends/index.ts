import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city_id, timeframe = "12m" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a real estate market forecasting AI for the Indonesian property market.
Given a city identifier and timeframe, generate realistic market intelligence forecasts.
Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "city": "<city name>",
  "timeframe": "<timeframe>",
  "generated_at": "<ISO timestamp>",
  "price_growth_forecast": {
    "current_trend": "<rising|stable|declining>",
    "next_quarter_pct": <number>,
    "next_year_pct": <number>,
    "confidence": <0-100>
  },
  "rental_yield_projection": {
    "current_avg_pct": <number>,
    "projected_pct": <number>,
    "trend": "<improving|stable|declining>",
    "confidence": <0-100>
  },
  "liquidity_cycle": {
    "current_phase": "<accumulation|expansion|distribution|contraction>",
    "phase_strength": <0-100>,
    "months_remaining": <number>,
    "next_phase": "<string>"
  },
  "risk_score": {
    "overall": <0-100>,
    "factors": [
      {"name": "<string>", "severity": "<low|medium|high>", "description": "<string>"}
    ]
  },
  "opportunity_windows": [
    {"type": "<string>", "window": "<string>", "confidence": <0-100>, "description": "<string>"}
  ],
  "key_drivers": ["<string>"],
  "seasonal_insight": "<string>"
}
Use realistic Indonesian market data patterns. Vary outputs meaningfully per city.`;

    const userPrompt = `Generate a comprehensive real estate market forecast for city: "${city_id || "jakarta"}", timeframe: "${timeframe}". Use realistic data patterns for the Indonesian property market. Current date: ${new Date().toISOString().split("T")[0]}.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "market_forecast",
              description: "Return structured market forecast data",
              parameters: {
                type: "object",
                properties: {
                  city: { type: "string" },
                  timeframe: { type: "string" },
                  generated_at: { type: "string" },
                  price_growth_forecast: {
                    type: "object",
                    properties: {
                      current_trend: { type: "string", enum: ["rising", "stable", "declining"] },
                      next_quarter_pct: { type: "number" },
                      next_year_pct: { type: "number" },
                      confidence: { type: "number" },
                    },
                    required: ["current_trend", "next_quarter_pct", "next_year_pct", "confidence"],
                  },
                  rental_yield_projection: {
                    type: "object",
                    properties: {
                      current_avg_pct: { type: "number" },
                      projected_pct: { type: "number" },
                      trend: { type: "string", enum: ["improving", "stable", "declining"] },
                      confidence: { type: "number" },
                    },
                    required: ["current_avg_pct", "projected_pct", "trend", "confidence"],
                  },
                  liquidity_cycle: {
                    type: "object",
                    properties: {
                      current_phase: { type: "string", enum: ["accumulation", "expansion", "distribution", "contraction"] },
                      phase_strength: { type: "number" },
                      months_remaining: { type: "number" },
                      next_phase: { type: "string" },
                    },
                    required: ["current_phase", "phase_strength", "months_remaining", "next_phase"],
                  },
                  risk_score: {
                    type: "object",
                    properties: {
                      overall: { type: "number" },
                      factors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            severity: { type: "string", enum: ["low", "medium", "high"] },
                            description: { type: "string" },
                          },
                          required: ["name", "severity", "description"],
                        },
                      },
                    },
                    required: ["overall", "factors"],
                  },
                  opportunity_windows: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        window: { type: "string" },
                        confidence: { type: "number" },
                        description: { type: "string" },
                      },
                      required: ["type", "window", "confidence", "description"],
                    },
                  },
                  key_drivers: { type: "array", items: { type: "string" } },
                  seasonal_insight: { type: "string" },
                },
                required: ["city", "timeframe", "generated_at", "price_growth_forecast", "rental_yield_projection", "liquidity_cycle", "risk_score", "opportunity_windows", "key_drivers", "seasonal_insight"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "market_forecast" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
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
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();

    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let forecast;
    if (toolCall?.function?.arguments) {
      forecast = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: parse from content
      const content = result.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      forecast = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!forecast) throw new Error("Failed to extract forecast data");

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("forecast error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
