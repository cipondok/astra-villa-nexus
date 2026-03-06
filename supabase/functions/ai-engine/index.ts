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

async function handleVirtualStaging(payload: Record<string, unknown>) {
  const { image_url, room_type, style } = payload as {
    image_url?: string;
    room_type?: string;
    style?: string;
  };

  if (!image_url) return json({ error: "image_url is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const roomLabel = room_type || "living room";
  const styleLabel = style || "modern minimalist";

  const prompt = `You are an expert interior designer. Take this empty/unfurnished ${roomLabel} photo and virtually stage it with beautiful, realistic ${styleLabel} furniture and decor. Keep the room's architecture, walls, floor, and windows exactly the same. Add appropriate furniture: sofas, tables, rugs, plants, lighting fixtures, art, and decorations that match the ${styleLabel} style. The result must look photorealistic, as if photographed by a professional real estate photographer. Maintain natural lighting and shadows.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image_url } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits required. Please add credits." }, 402);
      const t = await aiResponse.text();
      console.error("AI staging error:", status, t);
      return json({ error: "AI image generation failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const aiText = aiData.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      return json({ error: "No image generated. The model may not have been able to process this image." }, 500);
    }

    // Upload to Supabase storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const fileName = `ai-staging/${crypto.randomUUID()}.png`;
    const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { error: uploadErr } = await supabase.storage
      .from("vr-media")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: false });

    let storedUrl = generatedImage; // fallback to base64
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("vr-media").getPublicUrl(fileName);
      storedUrl = urlData.publicUrl;
    } else {
      console.error("Storage upload error:", uploadErr);
    }

    return json({
      mode: "virtual_staging",
      staged_image_url: storedUrl,
      description: aiText,
      room_type: roomLabel,
      style: styleLabel,
    });
  } catch (err) {
    console.error("Virtual staging error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
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

// ── market_report: AI-generated market analysis PDF data ────────────
async function handleMarketReport(payload: Record<string, unknown>) {
  const city = String(payload.city || "").trim();
  if (!city) return json({ error: "city is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Aggregate market data
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const ninetyAgo = new Date(Date.now() - 90 * 86400000).toISOString();

  const [totalRes, newRes, recentRes, pricesRes, typeRes] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).ilike("city", `%${city}%`).eq("status", "published"),
    supabase.from("properties").select("id", { count: "exact", head: true }).ilike("city", `%${city}%`).gte("created_at", thirtyAgo),
    supabase.from("properties").select("id", { count: "exact", head: true }).ilike("city", `%${city}%`).gte("created_at", ninetyAgo),
    supabase.from("properties").select("price, property_type, kt, km, building_area_sqm, land_area_sqm, investment_score, listing_type").ilike("city", `%${city}%`).eq("status", "published").not("price", "is", null).gt("price", 0).limit(200),
    supabase.from("properties").select("property_type").ilike("city", `%${city}%`).eq("status", "published"),
  ]);

  const listings = pricesRes.data || [];
  const prices = listings.map((p: any) => Number(p.price)).filter((n: number) => n > 0).sort((a: number, b: number) => a - b);
  const avg = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
  const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
  const min = prices.length > 0 ? prices[0] : 0;
  const max = prices.length > 0 ? prices[prices.length - 1] : 0;

  // Type distribution
  const typeCounts: Record<string, number> = {};
  (typeRes.data || []).forEach((p: any) => {
    const t = p.property_type || "unknown";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Listing type split
  const saleCount = listings.filter((p: any) => p.listing_type === "sale").length;
  const rentCount = listings.filter((p: any) => p.listing_type === "rent").length;

  // Investment scores
  const investScores = listings.map((p: any) => p.investment_score).filter((s: any) => typeof s === "number" && s > 0);
  const avgInvestScore = investScores.length > 0 ? Math.round(investScores.reduce((a: number, b: number) => a + b, 0) / investScores.length) : 0;

  // Price per sqm
  const pricePerSqm = listings
    .filter((p: any) => p.building_area_sqm && p.building_area_sqm > 0)
    .map((p: any) => Number(p.price) / Number(p.building_area_sqm));
  const avgPricePerSqm = pricePerSqm.length > 0 ? Math.round(pricePerSqm.reduce((a: number, b: number) => a + b, 0) / pricePerSqm.length) : 0;

  const marketData = {
    city,
    total_listings: totalRes.count || 0,
    new_listings_30d: newRes.count || 0,
    new_listings_90d: recentRes.count || 0,
    price_stats: { avg: Math.round(avg), median: Math.round(median), min, max },
    avg_price_per_sqm: avgPricePerSqm,
    type_distribution: typeCounts,
    listing_type_split: { sale: saleCount, rent: rentCount },
    avg_investment_score: avgInvestScore,
    report_date: new Date().toISOString().split("T")[0],
  };

  // AI narrative generation
  const aiPrompt = `You are a senior real estate market analyst for Indonesian property markets.
Generate a comprehensive market report for ${city} based on this data:
${JSON.stringify(marketData, null, 2)}

Structure your response as JSON with these fields:
- executive_summary (2-3 sentences overview)
- market_overview (paragraph about current state)
- price_analysis (paragraph about pricing trends, include IDR figures)
- investment_outlook (paragraph about investment potential, use the avg investment score)
- property_type_analysis (paragraph about type distribution and what it means)
- demand_indicators (paragraph about supply/demand based on new listings data)
- recommendations (array of 3-5 bullet point strings for investors)
- risk_factors (array of 2-3 risk items as strings)
- forecast (paragraph about 6-12 month outlook)

Use IDR currency formatting. Be specific with numbers from the data. Professional tone.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: aiPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "generate_report",
            description: "Generate structured market report",
            parameters: {
              type: "object",
              properties: {
                executive_summary: { type: "string" },
                market_overview: { type: "string" },
                price_analysis: { type: "string" },
                investment_outlook: { type: "string" },
                property_type_analysis: { type: "string" },
                demand_indicators: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } },
                risk_factors: { type: "array", items: { type: "string" } },
                forecast: { type: "string" },
              },
              required: ["executive_summary", "market_overview", "price_analysis", "investment_outlook", "property_type_analysis", "demand_indicators", "recommendations", "risk_factors", "forecast"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_report" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
      const t = await aiResponse.text();
      console.error("AI report error:", status, t);
      return json({ error: "AI report generation failed" }, 500);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let narrative: any = {};
    try {
      narrative = JSON.parse(toolCall?.function?.arguments || "{}");
    } catch {
      console.error("Failed to parse AI report response");
      narrative = { executive_summary: "Report generation incomplete. Please try again." };
    }

    return json({
      mode: "market_report",
      market_data: marketData,
      narrative,
    });
  } catch (err) {
    console.error("Market report error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
}

// ── Image Quality Analyzer ──────────────────────────────────────────
async function handleImageQualityAnalyze(payload: Record<string, unknown>) {
  const { image_urls } = payload as { image_urls?: string[] };
  if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
    return json({ error: "image_urls array is required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const results: Record<string, unknown>[] = [];

  for (let i = 0; i < Math.min(image_urls.length, 10); i++) {
    const url = image_urls[i];
    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a professional real estate photography quality inspector. Analyze this property image thoroughly.

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "quality_score": <number 0-100>,
  "resolution_quality": "<low|medium|high>",
  "lighting": { "score": <0-100>, "issues": ["..."], "suggestions": ["..."] },
  "composition": { "score": <0-100>, "issues": ["..."], "suggestions": ["..."] },
  "staging": { "score": <0-100>, "is_staged": <boolean>, "suggestions": ["..."] },
  "room_type": "<living room|bedroom|bathroom|kitchen|exterior|pool|garden|other>",
  "appeal_score": <0-100>,
  "issues": ["list of detected problems"],
  "improvements": ["actionable suggestions"],
  "hero_potential": <boolean>,
  "tags": ["relevant tags"]
}`
              },
              { type: "image_url", image_url: { url } }
            ]
          }],
          temperature: 0.3,
        }),
      });

      if (!aiResp.ok) {
        results.push({ index: i, url, error: `AI error: ${aiResp.status}`, quality_score: 0 });
        continue;
      }

      const aiData = await aiResp.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      try {
        const analysis = JSON.parse(content);
        results.push({ index: i, url, ...analysis });
      } catch {
        results.push({ index: i, url, error: "Failed to parse AI response", quality_score: 0 });
      }
    } catch (err) {
      results.push({ index: i, url, error: err instanceof Error ? err.message : "Unknown", quality_score: 0 });
    }
  }

  const valid = results.filter(r => !r.error && (r.quality_score as number) > 0);
  const avgScore = valid.length > 0
    ? Math.round(valid.reduce((s, r) => s + ((r.quality_score as number) || 0), 0) / valid.length)
    : 0;

  const ordered = [...results]
    .filter(r => !r.error)
    .sort((a, b) => {
      if (a.hero_potential && !b.hero_potential) return -1;
      if (!a.hero_potential && b.hero_potential) return 1;
      return ((b.appeal_score as number) || 0) - ((a.appeal_score as number) || 0);
    })
    .map(r => r.index as number);

  return json({
    data: {
      images: results,
      summary: {
        total_analyzed: results.length,
        average_quality: avgScore,
        hero_image_index: results.findIndex(r => r.hero_potential),
        suggested_order: ordered,
        needs_improvement: results.filter(r => ((r.quality_score as number) || 0) < 60).length,
      }
    }
  });
}

// ── Tenant Screening ────────────────────────────────────────────────

async function handleTenantScreening(payload: Record<string, unknown>) {
  const {
    full_name, email, phone, monthly_income, employment_type,
    employer_name, employment_duration_months, previous_landlord_contact,
    reason_for_moving, requested_rent, pets, num_occupants, credit_score,
    has_criminal_record, eviction_history, references
  } = payload as Record<string, any>;

  if (!full_name || !monthly_income || !requested_rent) {
    return json({ error: "full_name, monthly_income, and requested_rent are required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const tenantProfile = JSON.stringify({
    full_name, email, phone, monthly_income, employment_type,
    employer_name, employment_duration_months, previous_landlord_contact,
    reason_for_moving, requested_rent, pets, num_occupants, credit_score,
    has_criminal_record, eviction_history, references
  });

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        tools: [{
          type: "function",
          function: {
            name: "tenant_risk_assessment",
            description: "Provide a comprehensive tenant risk assessment with scoring.",
            parameters: {
              type: "object",
              properties: {
                overall_score: { type: "number", description: "0-100 risk score, higher is better/safer" },
                risk_level: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                income_to_rent_ratio: { type: "number", description: "Monthly income divided by rent" },
                affordability_rating: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
                employment_stability: { type: "string", enum: ["excellent", "good", "fair", "poor", "unknown"] },
                categories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      score: { type: "number", description: "0-100" },
                      weight: { type: "number", description: "Percentage weight 0-100" },
                      findings: { type: "array", items: { type: "string" } },
                      recommendation: { type: "string" }
                    },
                    required: ["name", "score", "weight", "findings", "recommendation"]
                  }
                },
                red_flags: { type: "array", items: { type: "string" } },
                green_flags: { type: "array", items: { type: "string" } },
                recommended_action: { type: "string", enum: ["approve", "approve_with_conditions", "further_review", "decline"] },
                conditions: { type: "array", items: { type: "string" }, description: "Conditions if approve_with_conditions" },
                verification_checklist: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      status: { type: "string", enum: ["verified", "pending", "not_provided"] },
                      priority: { type: "string", enum: ["required", "recommended", "optional"] }
                    },
                    required: ["item", "status", "priority"]
                  }
                },
                summary: { type: "string" }
              },
              required: ["overall_score", "risk_level", "income_to_rent_ratio", "affordability_rating",
                         "employment_stability", "categories", "red_flags", "green_flags",
                         "recommended_action", "verification_checklist", "summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "tenant_risk_assessment" } },
        messages: [
          {
            role: "system",
            content: `You are an expert tenant screening analyst for Indonesian real estate. Evaluate tenant applications thoroughly using these weighted categories:
1. Financial Stability (30%): Income-to-rent ratio (ideal ≥3x), employment stability, income sources
2. Rental History (25%): Previous landlord references, eviction history, lease compliance
3. Identity & Verification (20%): Document completeness, contact verification, background checks
4. Lifestyle Compatibility (15%): Occupancy count, pets, reason for moving
5. Credit & Legal (10%): Credit score if available, criminal record, legal issues

Be realistic and thorough. Flag concerns clearly but fairly.`
          },
          {
            role: "user",
            content: `Analyze this tenant application and provide a comprehensive risk assessment:\n\n${tenantProfile}`
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits required. Please add credits." }, 402);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json(result);
  } catch (e) {
    console.error("tenant_screening error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Virtual Tour Generator ──────────────────────────────────────────

async function handleVirtualTourGenerate(payload: Record<string, unknown>) {
  const { images, property_title, property_type, location } = payload as {
    images?: { url: string; label?: string }[];
    property_title?: string;
    property_type?: string;
    location?: string;
  };

  if (!images || !Array.isArray(images) || images.length < 2) {
    return json({ error: "At least 2 images are required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const limitedImages = images.slice(0, 10);

  const imageContent = limitedImages.map((img, i) => ([
    { type: "text" as const, text: `Image ${i + 1}${img.label ? ` (${img.label})` : ""}:` },
    { type: "image_url" as const, image_url: { url: img.url } }
  ])).flat();

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        tools: [{
          type: "function",
          function: {
            name: "generate_virtual_tour",
            description: "Generate a virtual tour script from property images.",
            parameters: {
              type: "object",
              properties: {
                tour_title: { type: "string" },
                tour_introduction: { type: "string", description: "A warm, engaging 2-3 sentence welcome narration" },
                estimated_duration_minutes: { type: "number" },
                stops: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      image_index: { type: "number", description: "0-based index of the image" },
                      room_type: { type: "string" },
                      room_name: { type: "string", description: "Friendly display name like 'Grand Living Room'" },
                      narration: { type: "string", description: "2-4 sentence narration for this stop, like a real estate agent giving a tour" },
                      hotspots: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            description: { type: "string" },
                            x_percent: { type: "number", description: "Horizontal position 0-100" },
                            y_percent: { type: "number", description: "Vertical position 0-100" },
                            category: { type: "string", enum: ["feature", "material", "amenity", "view", "dimension"] }
                          },
                          required: ["label", "description", "x_percent", "y_percent", "category"]
                        }
                      },
                      key_features: { type: "array", items: { type: "string" } },
                      mood: { type: "string", description: "One word: cozy, spacious, luxurious, bright, serene, modern, etc." },
                      transition_text: { type: "string", description: "Short transition to next stop, empty for last stop" }
                    },
                    required: ["image_index", "room_type", "room_name", "narration", "hotspots", "key_features", "mood"]
                  }
                },
                tour_conclusion: { type: "string", description: "Closing narration summarizing the property" },
                property_highlights: { type: "array", items: { type: "string" }, description: "Top 5 selling points" },
                suggested_flow: { type: "array", items: { type: "number" }, description: "Optimal order of image indices for the tour" }
              },
              required: ["tour_title", "tour_introduction", "estimated_duration_minutes", "stops", "tour_conclusion", "property_highlights", "suggested_flow"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_virtual_tour" } },
        messages: [
          {
            role: "system",
            content: `You are a luxury real estate virtual tour director. Analyze property images and create an immersive, narrated virtual tour experience. For each image:
1. Identify the room/area type and give it an appealing name
2. Write engaging narration as if you're a top real estate agent walking a buyer through
3. Place 2-4 interactive hotspots on notable features (estimate x,y positions as percentages)
4. Note key features and the room's mood
5. Write smooth transitions between stops
Keep narration professional yet warm. Highlight unique selling points. Property: ${property_title || "Luxury Property"}, Type: ${property_type || "Residential"}, Location: ${location || "Premium Location"}.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Generate a virtual tour for these ${limitedImages.length} property images:` },
              ...imageContent
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits required. Please add credits." }, 402);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json({ ...result, images: limitedImages });
  } catch (e) {
    console.error("virtual_tour_generate error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Comparative Market Analysis ─────────────────────────────────────

async function handleComparativeMarketAnalysis(payload: Record<string, unknown>) {
  const {
    property_title, city, district, property_type, listing_price,
    land_area_sqm, building_area_sqm, bedrooms, bathrooms,
    year_built, condition, amenities, legal_status
  } = payload as Record<string, any>;

  if (!city || !property_type || !listing_price) {
    return json({ error: "city, property_type, and listing_price are required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch comparable properties from database
  let query = supabaseAdmin.from("properties").select("id, title, city, district, property_type, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, year_built, condition, amenities, legal_status, investment_score, roi_percentage, days_listed, created_at")
    .eq("city", city)
    .eq("property_type", property_type)
    .eq("status", "active")
    .gte("price", listing_price * 0.5)
    .lte("price", listing_price * 2)
    .limit(20);

  if (district) query = query.eq("district", district);

  const { data: comparables, error: dbError } = await query;
  if (dbError) console.error("DB error fetching comparables:", dbError);

  const compData = (comparables || []).map((p: any) => ({
    title: p.title, price: p.price, city: p.city, district: p.district,
    land_area: p.land_area_sqm, building_area: p.building_area_sqm,
    bedrooms: p.bedrooms, bathrooms: p.bathrooms, year_built: p.year_built,
    condition: p.condition, investment_score: p.investment_score,
    roi: p.roi_percentage, days_listed: p.days_listed,
    price_per_sqm: p.building_area_sqm ? Math.round(p.price / p.building_area_sqm) : (p.land_area_sqm ? Math.round(p.price / p.land_area_sqm) : null)
  }));

  const subjectProperty = JSON.stringify({
    property_title, city, district, property_type, listing_price,
    land_area_sqm, building_area_sqm, bedrooms, bathrooms,
    year_built, condition, amenities, legal_status
  });

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        tools: [{
          type: "function",
          function: {
            name: "comparative_market_analysis",
            description: "Generate a comprehensive CMA report.",
            parameters: {
              type: "object",
              properties: {
                estimated_market_value: { type: "number", description: "Fair market value in IDR" },
                value_range: { type: "object", properties: { low: { type: "number" }, high: { type: "number" } }, required: ["low", "high"] },
                price_positioning: { type: "string", enum: ["significantly_underpriced", "underpriced", "fair_value", "overpriced", "significantly_overpriced"] },
                price_deviation_percent: { type: "number", description: "How far listing price deviates from FMV (%)" },
                price_per_sqm: { type: "number" },
                market_avg_price_per_sqm: { type: "number" },
                comparables_summary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      price: { type: "number" },
                      price_per_sqm: { type: "number" },
                      similarity_score: { type: "number", description: "0-100" },
                      key_differences: { type: "array", items: { type: "string" } },
                      advantage: { type: "string", enum: ["subject", "comparable", "neutral"] }
                    },
                    required: ["title", "price", "similarity_score", "key_differences", "advantage"]
                  }
                },
                market_conditions: {
                  type: "object",
                  properties: {
                    demand_level: { type: "string", enum: ["very_low", "low", "moderate", "high", "very_high"] },
                    supply_level: { type: "string", enum: ["very_low", "low", "moderate", "high", "very_high"] },
                    market_trend: { type: "string", enum: ["declining", "stable", "growing", "booming"] },
                    avg_days_on_market: { type: "number" },
                    predicted_days_to_sell: { type: "number" },
                    absorption_rate: { type: "string", description: "e.g. '2.5 months of inventory'" }
                  },
                  required: ["demand_level", "supply_level", "market_trend", "avg_days_on_market", "predicted_days_to_sell"]
                },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } },
                threats: { type: "array", items: { type: "string" } },
                pricing_recommendations: {
                  type: "object",
                  properties: {
                    optimal_listing_price: { type: "number" },
                    quick_sale_price: { type: "number" },
                    premium_price: { type: "number" },
                    reasoning: { type: "string" }
                  },
                  required: ["optimal_listing_price", "quick_sale_price", "premium_price", "reasoning"]
                },
                investment_outlook: {
                  type: "object",
                  properties: {
                    annual_appreciation_estimate: { type: "number", description: "Percentage" },
                    rental_yield_estimate: { type: "number", description: "Percentage" },
                    five_year_projection: { type: "number" },
                    investment_grade: { type: "string", enum: ["A", "B", "C", "D"] },
                    recommendation: { type: "string" }
                  },
                  required: ["annual_appreciation_estimate", "rental_yield_estimate", "five_year_projection", "investment_grade", "recommendation"]
                },
                executive_summary: { type: "string" }
              },
              required: ["estimated_market_value", "value_range", "price_positioning", "price_deviation_percent",
                         "comparables_summary", "market_conditions", "strengths", "weaknesses", "opportunities", "threats",
                         "pricing_recommendations", "investment_outlook", "executive_summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "comparative_market_analysis" } },
        messages: [
          {
            role: "system",
            content: `You are an expert Indonesian real estate market analyst specializing in Comparative Market Analysis (CMA). 
Analyze the subject property against comparable listings to determine fair market value and provide actionable pricing insights.
Use Indonesian Rupiah (IDR) for all prices. Consider Indonesian market dynamics: SHM vs HGB title impact, WNA eligibility premium, location premiums in Bali/Jakarta.
Be data-driven and realistic with estimates. ${compData.length} comparable properties found in the database.`
          },
          {
            role: "user",
            content: `Generate a comprehensive CMA for this property:\n\nSubject Property:\n${subjectProperty}\n\nComparable Properties (${compData.length} found):\n${JSON.stringify(compData, null, 2)}`
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits required. Please add credits." }, 402);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json({ ...result, total_comparables_found: compData.length });
  } catch (e) {
    console.error("comparative_market_analysis error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Smart Notifications ─────────────────────────────────────────────

async function handleSmartNotifications(payload: Record<string, unknown>) {
  const { user_id, user_behavior, notification_history, preferences } = payload as {
    user_id?: string;
    user_behavior?: {
      avg_active_hours?: number[];
      most_viewed_types?: string[];
      most_viewed_cities?: string[];
      search_frequency?: string;
      price_range?: { min: number; max: number };
      last_login?: string;
      total_views_30d?: number;
      saved_properties?: number;
      inquiries_sent?: number;
    };
    notification_history?: {
      total_sent_30d?: number;
      open_rate?: number;
      click_rate?: number;
      unsubscribe_rate?: number;
      most_engaged_types?: string[];
    };
    preferences?: {
      channels?: string[];
      frequency?: string;
      quiet_hours?: { start: number; end: number };
    };
  };

  if (!user_id) return json({ error: "user_id is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  // Fetch user's saved searches and recent activity from DB
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const [savedSearches, recentViews, priceAlerts] = await Promise.all([
    sb.from("saved_search_alerts").select("*").eq("user_id", user_id).eq("is_active", true).limit(10),
    sb.from("ai_behavior_tracking").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(50),
    sb.from("property_price_history").select("*, properties(title, city, price)").limit(20),
  ]);

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are an AI notification optimization engine for a real estate platform. Analyze user behavior patterns and generate a personalized notification strategy. Consider engagement patterns, optimal timing, content relevance, and notification fatigue prevention. All prices are in IDR (Indonesian Rupiah).`
          },
          {
            role: "user",
            content: JSON.stringify({
              user_behavior: user_behavior || {},
              notification_history: notification_history || {},
              current_preferences: preferences || {},
              saved_searches: savedSearches.data || [],
              recent_activity: recentViews.data?.slice(0, 20) || [],
              price_changes: priceAlerts.data || [],
            })
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "smart_notification_strategy",
            description: "Generate personalized notification strategy",
            parameters: {
              type: "object",
              properties: {
                optimal_send_times: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hour: { type: "number" },
                      day_of_week: { type: "string" },
                      confidence: { type: "number" },
                      reasoning: { type: "string" }
                    },
                    required: ["hour", "day_of_week", "confidence", "reasoning"]
                  },
                  description: "Top 5 optimal notification delivery times"
                },
                recommended_frequency: {
                  type: "object",
                  properties: {
                    daily_max: { type: "number" },
                    weekly_max: { type: "number" },
                    reasoning: { type: "string" }
                  },
                  required: ["daily_max", "weekly_max", "reasoning"]
                },
                personalized_alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      alert_type: { type: "string", enum: ["price_drop", "new_listing", "market_trend", "investment_opportunity", "viewing_reminder", "similar_property", "price_milestone"] },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      title: { type: "string" },
                      message: { type: "string" },
                      recommended_channel: { type: "string", enum: ["push", "email", "sms", "in_app"] },
                      trigger_condition: { type: "string" },
                      estimated_relevance_score: { type: "number" }
                    },
                    required: ["alert_type", "priority", "title", "message", "recommended_channel", "trigger_condition", "estimated_relevance_score"]
                  },
                  description: "Personalized alert suggestions based on user behavior"
                },
                engagement_insights: {
                  type: "object",
                  properties: {
                    engagement_level: { type: "string", enum: ["highly_engaged", "moderately_engaged", "at_risk", "dormant"] },
                    churn_risk: { type: "number" },
                    re_engagement_strategy: { type: "string" },
                    content_preferences: { type: "array", items: { type: "string" } },
                    fatigue_risk: { type: "string", enum: ["low", "medium", "high"] }
                  },
                  required: ["engagement_level", "churn_risk", "re_engagement_strategy", "content_preferences", "fatigue_risk"]
                },
                channel_optimization: {
                  type: "object",
                  properties: {
                    primary_channel: { type: "string" },
                    secondary_channel: { type: "string" },
                    channel_scores: {
                      type: "object",
                      properties: {
                        push: { type: "number" },
                        email: { type: "number" },
                        sms: { type: "number" },
                        in_app: { type: "number" }
                      }
                    },
                    reasoning: { type: "string" }
                  },
                  required: ["primary_channel", "secondary_channel", "channel_scores", "reasoning"]
                },
                summary: { type: "string" }
              },
              required: ["optimal_send_times", "recommended_frequency", "personalized_alerts", "engagement_insights", "channel_optimization", "summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "smart_notification_strategy" } }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits required." }, 402);
      throw new Error(`AI failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json(result);
  } catch (e) {
    console.error("smart_notifications error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
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
      case "virtual_staging":
        return await handleVirtualStaging(payload);
      case "market_report":
        return await handleMarketReport(payload);
      case "image_quality_analyze":
        return await handleImageQualityAnalyze(payload);
      case "tenant_screening":
        return await handleTenantScreening(payload);
      case "virtual_tour_generate":
        return await handleVirtualTourGenerate(payload);
      case "comparative_market_analysis":
        return await handleComparativeMarketAnalysis(payload);
      case "smart_notifications":
        return await handleSmartNotifications(payload);
      default:
        return json({ error: `Invalid AI mode: ${mode}` }, 400);
    }
  } catch (e) {
    console.error("ai-engine error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
