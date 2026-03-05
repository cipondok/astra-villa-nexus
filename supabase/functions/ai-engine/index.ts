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

// ── property_assistant: conversational AI with tool-calling ──────────
async function handlePropertyAssistant(payload: Record<string, unknown>) {
  const message = String(payload.message || "").trim();
  const conversationHistory = Array.isArray(payload.conversation_history) ? payload.conversation_history : [];
  if (!message) return json({ error: "message is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const systemPrompt = `You are AstraBot, ASTRA Villa's AI Property Assistant for Indonesian real estate.

Your capabilities:
1. **Find properties** — extract search filters and call search_properties
2. **Analyze investment** — call analyze_property for specific property analysis
3. **Market insights** — call get_market_insight for city-level data
4. **Compare properties** — explain trade-offs between options

Rules:
- Keep answers clear, helpful, professional, under 150 words.
- Normalize currency to IDR (miliar = billions, juta = millions).
- "cheap"/"murah" → max 2B IDR, "luxury"/"mewah" → min 5B IDR, "investment" → investment_score_min 70.
- Property types: villa, apartment, house, land, commercial, townhouse.
- Use markdown formatting for readability.
- When user asks to find/search properties, ALWAYS call search_properties tool.
- When user asks about a specific property's potential, call analyze_property.
- When user asks about a city/area market, call get_market_insight.
- If no tool is needed (greetings, clarifications), respond directly.`;

  const tools = [
    {
      type: "function",
      function: {
        name: "search_properties",
        description: "Search for properties matching user criteria. Call this when user wants to find/see/show properties.",
        parameters: {
          type: "object",
          properties: {
            city: { type: "string", description: "City name", nullable: true },
            property_type: { type: "string", enum: ["villa", "apartment", "house", "land", "commercial", "townhouse"], nullable: true },
            min_price: { type: "number", description: "Min price in IDR", nullable: true },
            max_price: { type: "number", description: "Max price in IDR", nullable: true },
            bedrooms: { type: "number", nullable: true },
            bathrooms: { type: "number", nullable: true },
            has_pool: { type: "boolean", nullable: true },
            listing_type: { type: "string", enum: ["sale", "rent"], nullable: true },
          },
          required: [],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_property",
        description: "Get investment analysis for a property by title or ID.",
        parameters: {
          type: "object",
          properties: {
            property_title: { type: "string", description: "Property title or partial match" },
          },
          required: ["property_title"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_market_insight",
        description: "Get market data for a city: trends, demand, pricing.",
        parameters: {
          type: "object",
          properties: {
            city: { type: "string", description: "City name" },
          },
          required: ["city"],
          additionalProperties: false,
        },
      },
    },
  ];

  // Build messages with conversation history
  const aiMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  // First call — may return tool_calls or direct response
  const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: aiMessages,
      tools,
    }),
  });

  if (!firstResponse.ok) {
    const status = firstResponse.status;
    const errText = await firstResponse.text();
    console.error(`AI gateway error ${status}:`, errText);
    if (status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
    if (status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
    return json({ error: "AI processing failed" }, 500);
  }

  const firstResult = await firstResponse.json();
  const assistantMsg = firstResult.choices?.[0]?.message;

  // No tool calls — direct response
  if (!assistantMsg?.tool_calls || assistantMsg.tool_calls.length === 0) {
    return json({
      mode: "property_assistant",
      reply: assistantMsg?.content || "I'm not sure how to help with that. Try asking about properties, investments, or market trends!",
      properties: [],
      totalFound: 0,
    });
  }

  // Execute tool calls
  const toolResults: any[] = [];
  let properties: any[] = [];
  let totalFound = 0;
  let searchParams: any = null;

  for (const tc of assistantMsg.tool_calls) {
    let args: any = {};
    try { args = JSON.parse(tc.function.arguments); } catch { args = {}; }

    if (tc.function.name === "search_properties") {
      searchParams = args;
      let query = supabase
        .from("properties")
        .select("id, title, price, property_type, listing_type, city, kt, km, area_sqm, land_area_sqm, building_area_sqm, cover_image, has_pool, investment_score", { count: "exact" })
        .eq("status", "published")
        .eq("approval_status", "approved");

      if (args.city) query = query.ilike("city", `%${args.city}%`);
      if (args.property_type) query = query.eq("property_type", args.property_type);
      if (args.min_price) query = query.gte("price", args.min_price);
      if (args.max_price) query = query.lte("price", args.max_price);
      if (args.bedrooms) query = query.gte("kt", args.bedrooms);
      if (args.bathrooms) query = query.gte("km", args.bathrooms);
      if (args.has_pool === true) query = query.eq("has_pool", true);
      if (args.listing_type) query = query.eq("listing_type", args.listing_type);

      const { data, count, error } = await query.order("price", { ascending: true }).limit(5);

      totalFound = count || 0;
      properties = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        property_type: p.property_type,
        listing_type: p.listing_type,
        city: p.city,
        bedrooms: p.kt,
        bathrooms: p.km,
        area_sqm: p.building_area_sqm || p.land_area_sqm || p.area_sqm,
        cover_image: p.cover_image,
        has_pool: p.has_pool,
        investment_score: p.investment_score,
      }));

      toolResults.push({
        tool_call_id: tc.id,
        role: "tool",
        content: JSON.stringify({ found: totalFound, top_results: properties }),
      });

    } else if (tc.function.name === "analyze_property") {
      const { data: prop } = await supabase
        .from("properties")
        .select("id, title, price, city, property_type, investment_score, predicted_days_to_sell, building_area_sqm, land_area_sqm")
        .ilike("title", `%${args.property_title}%`)
        .eq("status", "published")
        .limit(1)
        .single();

      if (prop) {
        const analysis = {
          title: prop.title,
          price: prop.price,
          city: prop.city,
          investment_score: prop.investment_score || 0,
          predicted_days_to_sell: prop.predicted_days_to_sell || 60,
          rating: (prop.investment_score || 0) >= 75 ? "Strong Buy" : (prop.investment_score || 0) >= 60 ? "Buy" : (prop.investment_score || 0) >= 40 ? "Hold" : "Pass",
        };
        toolResults.push({ tool_call_id: tc.id, role: "tool", content: JSON.stringify(analysis) });
      } else {
        toolResults.push({ tool_call_id: tc.id, role: "tool", content: JSON.stringify({ error: "Property not found" }) });
      }

    } else if (tc.function.name === "get_market_insight") {
      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const [listingsRes, newRes, pricesRes] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).ilike("city", `%${args.city}%`).eq("status", "published"),
        supabase.from("properties").select("id", { count: "exact", head: true }).ilike("city", `%${args.city}%`).gte("created_at", thirtyAgo),
        supabase.from("properties").select("price").ilike("city", `%${args.city}%`).eq("status", "published").not("price", "is", null).gt("price", 0).limit(100),
      ]);
      const prices = (pricesRes.data || []).map((p: any) => Number(p.price)).filter((n: number) => n > 0);
      const avg = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
      const median = prices.length > 0 ? prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)] : 0;

      toolResults.push({
        tool_call_id: tc.id,
        role: "tool",
        content: JSON.stringify({
          city: args.city,
          total_listings: listingsRes.count || 0,
          new_listings_30d: newRes.count || 0,
          avg_price: Math.round(avg),
          median_price: Math.round(median),
        }),
      });
    }
  }

  // Second call — AI generates final response with tool results
  const secondMessages = [
    ...aiMessages,
    assistantMsg,
    ...toolResults,
  ];

  const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: secondMessages,
    }),
  });

  if (!secondResponse.ok) {
    const t = await secondResponse.text();
    console.error("Second AI call failed:", secondResponse.status, t);
    return json({ error: "AI processing failed" }, 500);
  }

  const secondResult = await secondResponse.json();
  const finalReply = secondResult.choices?.[0]?.message?.content || "Here are your results.";

  return json({
    mode: "property_assistant",
    reply: finalReply,
    properties,
    totalFound,
    searchParams,
  });
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
      case "property_assistant":
        return await handlePropertyAssistant(payload);
      default:
        return json({ error: `Invalid AI mode: ${mode}` }, 400);
    }
  } catch (e) {
    console.error("ai-engine error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
