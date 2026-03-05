import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// ── Mode handlers (scaffolds) ───────────────────────────────────────

async function handleGenerateDescription(payload: Record<string, unknown>) {
  return json({ mode: "generate_description", status: "not_implemented", payload });
}

async function handleGenerateImage(payload: Record<string, unknown>) {
  return json({ mode: "generate_image", status: "not_implemented", payload });
}

async function handleNlpSearch(payload: Record<string, unknown>) {
  const query = String(payload.query || "").trim();
  if (!query) return json({ error: "query is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const systemPrompt = `You are a real estate search query parser for Indonesian property listings.
Extract structured filters from the user's natural language query.

Rules:
- Normalize ALL currency values to Indonesian Rupiah (IDR).
  - "miliar" or "B" = billions (1 miliar = 1,000,000,000 IDR)
  - "juta" or "M" = millions (1 juta = 1,000,000 IDR)
  - "$500K" ≈ 8,000,000,000 IDR (use 16000 rate)
- Interpret sentiment:
  - "cheap"/"murah"/"affordable" → max_price ≤ 2,000,000,000
  - "luxury"/"mewah"/"premium" → min_price ≥ 5,000,000,000
  - "investment property"/"investasi" → investment_score_min = 70
- Property types: villa, apartment, house, land, commercial, townhouse
- If a value is not mentioned or cannot be inferred, use null.
- has_pool: true only if explicitly mentioned (pool, kolam renang).
- land_size_min and building_size_min in sqm.

Always call the extract_filters function with the parsed values.`;

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
      tools: [
        {
          type: "function",
          function: {
            name: "extract_filters",
            description: "Extract structured property search filters from a natural language query.",
            parameters: {
              type: "object",
              properties: {
                city: { type: "string", description: "City name (e.g. Denpasar, Ubud, Jakarta)", nullable: true },
                property_type: { type: "string", enum: ["villa", "apartment", "house", "land", "commercial", "townhouse"], description: "Type of property", nullable: true },
                min_price: { type: "number", description: "Minimum price in IDR", nullable: true },
                max_price: { type: "number", description: "Maximum price in IDR", nullable: true },
                bedrooms: { type: "number", description: "Minimum number of bedrooms", nullable: true },
                bathrooms: { type: "number", description: "Minimum number of bathrooms", nullable: true },
                has_pool: { type: "boolean", description: "Whether property must have a pool", nullable: true },
                investment_score_min: { type: "number", description: "Minimum investment score (0-100)", nullable: true },
                land_size_min: { type: "number", description: "Minimum land area in sqm", nullable: true },
                building_size_min: { type: "number", description: "Minimum building area in sqm", nullable: true },
              },
              required: [],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "extract_filters" } },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text();
    console.error(`AI gateway error ${status}:`, errText);
    if (status === 429) return json({ error: "Rate limit exceeded, please try again later." }, 429);
    if (status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
    return json({ error: "AI processing failed" }, 500);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    console.error("No tool call in response:", JSON.stringify(result));
    return json({ error: "Failed to parse query" }, 500);
  }

  let filters: Record<string, unknown>;
  try {
    filters = JSON.parse(toolCall.function.arguments);
  } catch {
    console.error("Invalid JSON from tool call:", toolCall.function.arguments);
    return json({ error: "Failed to parse AI response" }, 500);
  }

  // Ensure all expected keys exist with null default
  const schema = ["city", "property_type", "min_price", "max_price", "bedrooms", "bathrooms", "has_pool", "investment_score_min", "land_size_min", "building_size_min"];
  const normalized: Record<string, unknown> = {};
  for (const key of schema) {
    normalized[key] = filters[key] ?? null;
  }

  return json({
    mode: "nlp_search",
    data: normalized,
    raw_query: query,
  });
}

async function handleMatchProperty(payload: Record<string, unknown>) {
  return json({ mode: "match_property", status: "not_implemented", payload });
}

async function handleSeoGeneration(payload: Record<string, unknown>) {
  return json({ mode: "seo_generate", status: "not_implemented", payload });
}

async function handleRecommendations(payload: Record<string, unknown>) {
  return json({ mode: "recommendations", status: "not_implemented", payload });
}

async function handleTranscription(payload: Record<string, unknown>) {
  return json({ mode: "transcribe_audio", status: "not_implemented", payload });
}

// ── Main router ─────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, payload = {} } = await req.json();

    if (!mode) {
      return json({ error: "mode is required" }, 400);
    }

    switch (mode) {
      case "generate_description":
        return await handleGenerateDescription(payload);
      case "generate_image":
        return await handleGenerateImage(payload);
      case "nlp_search":
        return await handleNlpSearch(payload);
      case "match_property":
        return await handleMatchProperty(payload);
      case "seo_generate":
        return await handleSeoGeneration(payload);
      case "recommendations":
        return await handleRecommendations(payload);
      case "transcribe_audio":
        return await handleTranscription(payload);
      default:
        return json({ error: `Invalid AI mode: ${mode}` }, 400);
    }
  } catch (e) {
    console.error("ai-engine error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
