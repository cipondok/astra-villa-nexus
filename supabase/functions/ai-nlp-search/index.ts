import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const extractFiltersTool = {
  type: "function" as const,
  function: {
    name: "extract_property_filters",
    description:
      "Extract structured property search filters from a natural language query. Only include fields the user explicitly or implicitly mentioned.",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "General location name, e.g. Bali, Jakarta" },
        state: { type: "string", description: "Province / state" },
        city: { type: "string", description: "City name" },
        property_type: {
          type: "string",
          enum: ["house", "apartment", "villa", "land", "commercial", "townhouse", "condo"],
        },
        listing_type: { type: "string", enum: ["sale", "rent"] },
        min_price: { type: "number", description: "Minimum price in IDR" },
        max_price: { type: "number", description: "Maximum price in IDR" },
        bedrooms: { type: "number" },
        bathrooms: { type: "number" },
        min_area: { type: "number", description: "Min area in sqm" },
        max_area: { type: "number", description: "Max area in sqm" },
        amenities: {
          type: "array",
          items: { type: "string" },
          description: "e.g. pool, garden, parking, gym, security",
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "e.g. ocean view, rooftop, smart home",
        },
        furnishing: { type: "string", enum: ["furnished", "semi-furnished", "unfurnished"] },
        sort_by: { type: "string", enum: ["newest", "price_low", "price_high", "popular"] },
        investment_intent: {
          type: "boolean",
          description: "true if the user mentions ROI, investment, yield, capital gain, passive income",
        },
        intent_summary: {
          type: "string",
          description: "One-sentence human-readable interpretation of the query",
        },
      },
      required: ["intent_summary"],
      additionalProperties: false,
    },
  },
};

const systemPrompt = `You are a property search assistant for an Indonesian luxury real-estate platform.
Your job: extract structured search filters from the user's natural language query.

Key rules:
- Currency is IDR (Indonesian Rupiah). 
  "miliar" or "billion" = ×1,000,000,000. "juta" or "million" = ×1,000,000.
  Example: "under 5 miliar" → max_price: 5000000000
  Example: "2-3 billion" → min_price: 2000000000, max_price: 3000000000
  Example: "above 500 juta" → min_price: 500000000
- "luxury" implies premium; do NOT set a min_price for it — just pass property type.
- If listing_type is not mentioned, default to "sale" for buying keywords or omit if ambiguous.
- Map Indonesian locations: "Bali" → state/location, "Kemang" → city area, etc.
- "pool" → amenities: ["pool"], "view laut" / "ocean view" → features: ["ocean view"]
- If user mentions ROI, investment, yield, capital gain → investment_intent: true
- Always provide intent_summary.
- Only include fields the user mentioned. Do not guess or hallucinate values.
- Respond in the same language the user used for intent_summary.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0 || query.length > 500) {
      return new Response(
        JSON.stringify({ error: "Query must be a string between 1-500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI gateway not configured" }),
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
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [extractFiltersTool],
        tool_choice: { type: "function", function: { name: "extract_property_filters" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ status: 429, error: "Rate limit exceeded. Please try again shortly." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ status: 402, error: "AI credits required. Please add credits." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "extract_property_filters") {
      console.error("Unexpected AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to parse search query" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let filters: Record<string, unknown>;
    try {
      filters = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ filters, query }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-nlp-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
