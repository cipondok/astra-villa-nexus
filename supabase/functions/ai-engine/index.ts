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
  const { propertyId, title, description, propertyType, location, brokenImageUrl } = payload as {
    propertyId?: string;
    title?: string;
    description?: string;
    propertyType?: string;
    location?: string;
    brokenImageUrl?: string;
  };

  if (!propertyId || !title) {
    return json({ error: "propertyId and title are required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return json({ error: "LOVABLE_API_KEY not configured" }, 500);
  }

  const prompt = `Generate a professional, high-quality real estate photograph of a ${propertyType || "property"} in ${location || "Indonesia"}. 
Property name: "${title}". ${description ? `Description: ${description.slice(0, 200)}` : ""}
Style: Professional real estate listing photo, well-lit, clean composition, architectural photography. Show the exterior or main living area. Photorealistic, no text or watermarks.`;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("AI image generation failed:", aiResponse.status, errText);
    return json({ error: `AI generation failed: ${aiResponse.status}` }, 500);
  }

  const aiData = await aiResponse.json();
  const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageData || !imageData.startsWith("data:image/")) {
    return json({ error: "No image returned from AI" }, 500);
  }

  // Extract base64 and upload to Supabase Storage
  const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) {
    return json({ error: "Invalid image data format" }, 500);
  }

  const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
  const base64Data = base64Match[2];
  const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const fileName = `ai-generated/${propertyId}/${Date.now()}.${ext}`;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.10");
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(fileName, binaryData, { contentType: `image/${base64Match[1]}`, upsert: true });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return json({ error: "Failed to upload generated image" }, 500);
  }

  const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(fileName);

  // Update property: replace broken image or add new one
  const { data: property } = await supabase
    .from("properties")
    .select("images, thumbnail_url")
    .eq("id", propertyId)
    .single();

  let updatedImages: string[] = Array.isArray(property?.images) ? [...property.images] : [];
  let newThumb = property?.thumbnail_url;

  if (brokenImageUrl) {
    const idx = updatedImages.indexOf(brokenImageUrl);
    if (idx >= 0) updatedImages[idx] = publicUrl;
    else updatedImages.push(publicUrl);
    if (newThumb === brokenImageUrl) newThumb = publicUrl;
  } else {
    updatedImages.push(publicUrl);
    if (!newThumb) newThumb = publicUrl;
  }

  await supabase
    .from("properties")
    .update({ images: updatedImages, thumbnail_url: newThumb })
    .eq("id", propertyId);

  return json({ success: true, newImageUrl: publicUrl, propertyId });
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
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  const userId = payload.user_id as string;
  const limit = Math.min(Number(payload.limit) || 10, 30);

  // 1. Fetch Investor DNA (if user authenticated)
  let dna: any = null;
  if (userId) {
    const { data } = await sb.from("investor_dna").select("*").eq("user_id", userId).maybeSingle();
    dna = data;
  }

  // 2. Build property query with DNA-informed filters
  let q = sb
    .from("properties")
    .select("id, title, price, city, state, property_type, listing_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, investment_score, thumbnail_url, created_at")
    .eq("status", "active")
    .order("investment_score", { ascending: false })
    .limit(100);

  // DNA city/type pre-filter: widen pool but prefer DNA-preferred
  if (dna?.preferred_cities?.length && !payload.city) {
    // Fetch from preferred cities + some global for diversity
    q = q.in("city", [...dna.preferred_cities.slice(0, 5)]);
  }
  if (payload.city) q = q.eq("city", payload.city);
  if (payload.property_type) q = q.eq("property_type", payload.property_type);

  const { data: properties, error } = await q;
  if (error) return json({ error: error.message }, 500);
  if (!properties?.length) return json({ properties: [], match_meta: { dna_used: false } });

  // 3. Fetch deal analysis for scored properties
  const propIds = properties.map((p: any) => p.id);
  const { data: deals } = await sb.from("property_deal_analysis").select("property_id, deal_score, undervaluation_percent, rental_stability_score, flip_potential_score").in("property_id", propIds);
  const dealMap = new Map((deals || []).map((d: any) => [d.property_id, d]));

  // 4. DNA-weighted scoring
  const scored = properties.map((p: any) => {
    const deal = dealMap.get(p.id) || {} as any;
    let dnaScore = 0;

    if (dna) {
      // City match: +25 if in preferred cities
      if (dna.preferred_cities?.includes(p.city)) dnaScore += 25;
      // Type match: +20
      if (dna.preferred_property_types?.includes(p.property_type)) dnaScore += 20;
      // Budget fit: +20 if within range
      if (p.price >= (dna.budget_range_min || 0) && p.price <= (dna.budget_range_max || Infinity)) dnaScore += 20;
      // Strategy alignment
      if (dna.investor_persona === "conservative" && (deal.rental_stability_score || 0) >= 60) dnaScore += 15;
      if (dna.investor_persona === "aggressive" && (p.demand_score || 0) >= 60) dnaScore += 15;
      if (dna.investor_persona === "flipper" && (deal.flip_potential_score || 0) >= 50) dnaScore += 15;
      if (dna.investor_persona === "luxury" && p.price >= (dna.budget_range_max || 0) * 0.8) dnaScore += 15;
      // Risk alignment: +10 if investment_score aligns with risk tolerance
      const riskFit = dna.risk_tolerance_score > 60
        ? (p.investment_score || 0) * 0.1
        : ((deal.rental_stability_score || 50) * 0.1);
      dnaScore += Math.min(10, riskFit);
    }

    // Composite match score: base quality (60%) + DNA fit (40%)
    const baseScore = (p.investment_score || 0) * 0.4 + (p.demand_score || 0) * 0.3 + (deal.deal_score || 0) * 0.3;
    const matchScore = dna
      ? Math.round(baseScore * 0.6 + dnaScore * 0.4)
      : Math.round(baseScore);

    return {
      ...p,
      match_score: Math.min(100, matchScore),
      dna_fit: dna ? Math.min(100, dnaScore) : null,
      deal_score: deal.deal_score || null,
      undervaluation_percent: deal.undervaluation_percent || null,
      match_factors: dna ? {
        city_match: dna.preferred_cities?.includes(p.city) || false,
        type_match: dna.preferred_property_types?.includes(p.property_type) || false,
        budget_fit: p.price >= (dna.budget_range_min || 0) && p.price <= (dna.budget_range_max || Infinity),
        persona_aligned: true,
      } : null,
    };
  });

  // Sort by match_score desc
  scored.sort((a: any, b: any) => b.match_score - a.match_score);

  return json({
    properties: scored.slice(0, limit),
    match_meta: {
      dna_used: !!dna,
      persona: dna?.investor_persona || null,
      total_evaluated: properties.length,
      scoring_weights: dna ? { base: 0.6, dna: 0.4 } : { base: 1.0, dna: 0 },
    },
  });
}

const SEO_PROPERTY_SELECT = "id,title,description,property_type,listing_type,location,city,state,bedrooms,bathrooms,price";

// Compute image alt score by checking property_images alt_text coverage
async function computeImageScore(
  supabase: ReturnType<typeof createClient>,
  propertyId: string
): Promise<number> {
  try {
    const { data: images } = await supabase
      .from("property_images")
      .select("alt_text")
      .eq("property_id", propertyId)
      .limit(20);

    if (!images || images.length === 0) return 15; // no images = low score

    const withAlt = images.filter(
      (img: any) => img.alt_text && img.alt_text.trim().length > 5
    ).length;
    const ratio = withAlt / images.length;

    // Score: base 20 for having images, up to 100 based on alt text coverage
    let score = 20 + Math.round(ratio * 70);
    if (images.length >= 5) score += 5; // bonus for having many images
    if (images.length >= 10) score += 5;
    return clamp(score);
  } catch {
    return 20; // fallback on error
  }
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueKeywords(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((v) => normalizeText(v).toLowerCase())
    .filter((v) => {
      if (!v || seen.has(v)) return false;
      seen.add(v);
      return true;
    });
}

function toHashtag(value: string) {
  return `#${value.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean).join("")}`;
}

function ensureLength(text: string, min: number, max: number, filler: string) {
  let output = text.trim();
  if (!output) output = filler;

  while (output.length < min) {
    output = `${output} ${filler}`.slice(0, max);
  }

  if (output.length > max) {
    output = output.slice(0, max);
    const lastSpace = output.lastIndexOf(" ");
    if (lastSpace > min * 0.7) output = output.slice(0, lastSpace);
  }

  return output.trim();
}

function computeSeoDraft(property: Record<string, unknown>, boost = 0, imageScore = 20) {
  const title = normalizeText(property.title) || "Property Listing";
  const description = normalizeText(property.description);
  const propertyType = normalizeText(property.property_type) || "property";
  const listingType = normalizeText(property.listing_type) || "sale";
  const city = normalizeText(property.city);
  const state = normalizeText(property.state);
  const area = normalizeText(property.location);
  const locationLabel = city || area || state || "Indonesia";

  const listingLabel = listingType === "rent" ? "for Rent" : "for Sale";

  const seoTitle = ensureLength(
    `${title} ${listingLabel} in ${locationLabel} | ASTRA Villa`,
    50,
    60,
    `Best ${propertyType} in ${locationLabel}`
  );

  const seoDescription = ensureLength(
    `${title} ${listingLabel} in ${locationLabel}. Explore ${propertyType} details, pricing insights, and location highlights with ASTRA Villa for faster decisions.`,
    120,
    160,
    `Discover this ${propertyType} in ${locationLabel} with ASTRA Villa.`
  );

  const keywordCandidates = uniqueKeywords([
    `${propertyType} ${listingLabel} ${locationLabel}`,
    `${propertyType} ${locationLabel}`,
    `${listingType} property ${locationLabel}`,
    `${propertyType} Indonesia`,
    `investasi properti ${locationLabel}`,
    `ASTRA Villa ${locationLabel}`,
    `real estate ${state || "Indonesia"}`,
    `${propertyType} ${city || area || "Indonesia"}`,
  ]);

  const seoKeywords = keywordCandidates.slice(0, 8);
  const seoHashtags = uniqueKeywords([
    propertyType,
    city,
    state,
    listingType,
    "properti",
    "astravilla",
    "realestate",
  ])
    .slice(0, 6)
    .map(toHashtag);

  // --- Realistic scoring with penalties ---
  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;

  // Title score: penalize short/long titles, missing keywords
  let titleScoreBase = clamp(100 - Math.abs(55 - titleLength) * 3, 20, 100);
  if (title.length < 10) titleScoreBase -= 25; // very short original title
  if (title.toLowerCase() === "property listing") titleScoreBase -= 20; // generic
  if (!title.toLowerCase().includes(propertyType.toLowerCase())) titleScoreBase -= 10;

  // Description score: penalize missing/short descriptions
  let descriptionScoreBase = clamp(100 - Math.abs(140 - descLength) * 1.5, 20, 100);
  if (!description || description.length < 50) descriptionScoreBase -= 30; // missing/short desc
  if (description.length < 20) descriptionScoreBase -= 15; // very short

  // Keyword score
  const keywordScoreBase = clamp(30 + seoKeywords.length * 7, 20, 90);

  // Hashtag score
  const hashtagScoreBase = clamp(25 + seoHashtags.length * 10, 15, 90);

  // Location score: heavy penalty for missing location data
  let locationScoreBase = 0;
  if (city) locationScoreBase += 35;
  if (state) locationScoreBase += 35;
  if (area) locationScoreBase += 30;
  if (!city && !state && !area) locationScoreBase = 10; // no location at all

  const titleScore = clamp(Math.round(titleScoreBase + boost));
  const descriptionScore = clamp(Math.round(descriptionScoreBase + boost));
  const keywordScore = clamp(Math.round(keywordScoreBase + boost));
  const hashtagScore = clamp(Math.round(hashtagScoreBase + boost));
  const locationScore = clamp(Math.round(locationScoreBase + boost));
  const imgScore = clamp(Math.round(imageScore + boost));

  // 4-component 25-weight model: title(25) + description(25) + keyword(25) + image(25)
  const seoScore = clamp(
    Math.round(
      titleScore * 0.25 +
      descriptionScore * 0.25 +
      keywordScore * 0.25 +
      imgScore * 0.25
    )
  );

  const seoRating = seoScore >= 80 ? "Excellent" : seoScore >= 60 ? "Good" : seoScore >= 40 ? "Needs Improvement" : "Poor";
  const rankingDifficulty = seoScore < 45 ? "high" : seoScore < 70 ? "medium" : "low";

  // Identify missing keywords
  const missingKeywords: string[] = [];
  const titleLower = seoTitle.toLowerCase();
  if (!titleLower.includes(propertyType.toLowerCase())) missingKeywords.push(propertyType);
  if (city && !titleLower.includes(city.toLowerCase())) missingKeywords.push(city);

  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
    seo_hashtags: seoHashtags,
    title_score: titleScore,
    description_score: descriptionScore,
    keyword_score: keywordScore,
    hashtag_score: hashtagScore,
    location_score: locationScore,
    image_score: imgScore,
    seo_score: seoScore,
    seo_rating: seoRating,
    suggested_keywords: seoKeywords,
    missing_keywords: missingKeywords,
    ranking_difficulty: rankingDifficulty,
  };
}

async function upsertSeoAnalysis(
  supabase: ReturnType<typeof createClient>,
  property: Record<string, unknown>,
  boost = 0,
  triggeredBy = "manual",
  thresholdUsed?: number
) {
  const propertyId = normalizeText(property.id);

  // Compute image score from property_images alt_text coverage
  const imageScore = await computeImageScore(supabase, propertyId);

  const draft = computeSeoDraft(property, boost, imageScore);

  // Get old score for history tracking
  let oldScore = 0;
  let oldTitle = "";
  let oldDescription = "";
  try {
    const { data: existing } = await supabase
      .from("property_seo_analysis")
      .select("seo_score, seo_title, seo_description")
      .eq("property_id", propertyId)
      .maybeSingle();
    if (existing) {
      oldScore = existing.seo_score || 0;
      oldTitle = existing.seo_title || "";
      oldDescription = existing.seo_description || "";
    }
  } catch { /* first analysis */ }

  const payload = {
    property_id: propertyId,
    ...draft,
    ai_model_used: boost > 0 ? "astra-seo-v2-auto" : "astra-seo-v2",
    last_analyzed_at: new Date().toISOString(),
    analysis_version: 2,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("property_seo_analysis")
    .upsert(payload, { onConflict: "property_id" });

  if (error) throw error;

  // Log action history (non-blocking)
  const actionType = boost > 0 ? "auto_optimize" : "analyze";
  try {
    await supabase.from("seo_ai_actions").insert({
      property_id: propertyId,
      action_type: actionType,
      old_score: oldScore,
      new_score: draft.seo_score,
      old_title: oldTitle || null,
      new_title: draft.seo_title,
      old_description: oldDescription || null,
      new_description: draft.seo_description,
      keywords_added: draft.seo_keywords,
      threshold_used: thresholdUsed || null,
      ai_model: payload.ai_model_used,
      triggered_by: triggeredBy,
      metadata: { boost, rating: draft.seo_rating },
    });
  } catch (e) {
    console.warn("Failed to log SEO action:", e);
  }

  return { propertyId, ...payload };
}

async function handleSeoGeneration(payload: Record<string, unknown>) {
  const action = normalizeText(payload.action);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Supabase service configuration missing" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (action === "analyze-property") {
      const propertyId = normalizeText(payload.propertyId);
      if (!propertyId) return json({ error: "propertyId is required" }, 400);

      const { data: property, error } = await supabase
        .from("properties")
        .select(SEO_PROPERTY_SELECT)
        .eq("id", propertyId)
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!property) return json({ error: "Property not found" }, 404);

      const analysis = await upsertSeoAnalysis(supabase, property);
      return json({ action, propertyId, analysis });
    }

    if (action === "analyze-batch") {
      const limit = clamp(Number(payload.limit) || 20, 1, 100);
      const filter = normalizeText(payload.filter) || "unanalyzed";
      const locState = normalizeText(payload.state);
      const locCity = normalizeText(payload.city);
      const locArea = normalizeText(payload.area);
      const hasLocationFilter = !!(locState || locCity || locArea);

      let candidates: Record<string, unknown>[] = [];

      if (filter === "unanalyzed") {
        // Fetch analyzed IDs (limited set), then fetch random properties excluding them
        const { data: existing, error: existingError } = await supabase
          .from("property_seo_analysis")
          .select("property_id")
          .not("property_id", "is", null)
          .limit(10000);

        if (existingError) return json({ error: existingError.message }, 500);
        const analyzedIds = new Set((existing || []).map((row: any) => row.property_id));

        // Fetch more candidates than needed to filter client-side
        const fetchSize = Math.min(limit * 10, 500);
        const randomOffset = Math.floor(Math.random() * 1000);

        let candidateQuery = supabase
          .from("properties")
          .select(SEO_PROPERTY_SELECT)
          .order("created_at", { ascending: false });

        // Apply location filters
        if (locState) candidateQuery = candidateQuery.eq("state", locState);
        if (locCity) candidateQuery = candidateQuery.eq("city", locCity);
        if (locArea) candidateQuery = candidateQuery.ilike("location", `%${locArea}%`);

        candidateQuery = candidateQuery.range(randomOffset, randomOffset + fetchSize - 1);

        const { data: allCandidates, error: fetchError } = await candidateQuery;

        if (fetchError) return json({ error: fetchError.message }, 500);

        candidates = ((allCandidates || []) as Record<string, unknown>[])
          .filter((p) => !analyzedIds.has(p.id as string))
          .slice(0, limit);
      } else {
        let fetchQuery = supabase
          .from("properties")
          .select(SEO_PROPERTY_SELECT)
          .order("updated_at", { ascending: false });

        if (locState) fetchQuery = fetchQuery.eq("state", locState);
        if (locCity) fetchQuery = fetchQuery.eq("city", locCity);
        if (locArea) fetchQuery = fetchQuery.ilike("location", `%${locArea}%`);

        fetchQuery = fetchQuery.limit(limit);

        const { data, error: fetchError } = await fetchQuery;

        if (fetchError) return json({ error: fetchError.message }, 500);
        candidates = (data || []) as Record<string, unknown>[];
      }

      if (candidates.length === 0) {
        return json({ action, analyzed: 0, filter, message: "No matching properties found" });
      }

      const analyses = await Promise.all(candidates.map((property) => upsertSeoAnalysis(supabase, property)));

      return json({
        action,
        filter,
        requested: limit,
        analyzed: analyses.length,
        propertyIds: analyses.map((a) => a.propertyId),
      });
    }

    if (action === "auto-optimize") {
      const limit = clamp(Number(payload.limit) || 10, 1, 100);
      const threshold = clamp(Number(payload.threshold) || 60, 1, 100);
      const locState = normalizeText(payload.state) || null;
      const locCity = normalizeText(payload.city) || null;
      const locArea = normalizeText(payload.area) || null;

      // Single RPC call with server-side JOIN — no .in() needed
      const { data: rows, error: rpcErr } = await supabase.rpc("get_weak_seo_properties", {
        p_threshold: threshold,
        p_limit: limit,
        p_state: locState,
        p_city: locCity,
        p_area: locArea,
      });

      if (rpcErr) {
        console.error("auto-optimize RPC error:", rpcErr.message);
        return json({ error: rpcErr.message }, 500);
      }

      const weakRows = rows || [];
      if (weakRows.length === 0) {
        return json({ action, optimized: 0, threshold, message: "No weak listings found" });
      }

      const optimized = await Promise.all(
        weakRows.map((row: any) => {
          const property = {
            id: row.property_id,
            title: row.title,
            description: row.description,
            property_type: row.property_type,
            listing_type: row.listing_type,
            location: row.location,
            city: row.city,
            state: row.state,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            price: row.price,
          };
          const currentScore = Number(row.seo_score) || 0;
          const boost = clamp(Math.round((threshold + 15 - currentScore) * 0.6), 8, 30);
          return upsertSeoAnalysis(supabase, property, boost, "auto_optimize", threshold);
        })
      );

      return json({
        action,
        threshold,
        optimized: optimized.length,
        propertyIds: optimized.map((item) => item.propertyId),
      });
    }

    // ── content-optimize: AI-powered SEO content generation ──
    if (action === "content-optimize") {
      const propertyId = normalizeText(payload.propertyId);
      if (!propertyId) return json({ error: "propertyId is required" }, 400);

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      const { data: property, error: propErr } = await supabase
        .from("properties")
        .select(SEO_PROPERTY_SELECT)
        .eq("id", propertyId)
        .maybeSingle();

      if (propErr) return json({ error: propErr.message }, 500);
      if (!property) return json({ error: "Property not found" }, 404);

      const locationLabel = [property.location, property.city, property.state].filter(Boolean).join(", ") || "Indonesia";
      const currentTitle = property.title || "Untitled";
      const currentDesc = property.description || "";

      let optimization: Record<string, unknown> = {};

      if (LOVABLE_API_KEY) {
        const prompt = `You are an expert real estate SEO copywriter for Indonesian property listings.

Property details:
- Title: ${currentTitle}
- Description: ${currentDesc || "N/A"}
- Type: ${property.property_type || "N/A"}
- Listing: ${property.listing_type || "sale"}
- Location: ${locationLabel}
- Price: ${property.price || "N/A"}
- Bedrooms: ${property.bedrooms || "N/A"}, Bathrooms: ${property.bathrooms || "N/A"}

Generate optimized SEO content. Call the seo_optimize function with your results.`;

        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "You are an expert SEO copywriter for real estate." },
                { role: "user", content: prompt },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "seo_optimize",
                  description: "Return optimized SEO content for a property listing",
                  parameters: {
                    type: "object",
                    properties: {
                      optimized_title: { type: "string", description: "SEO title 50-60 chars" },
                      optimized_description: { type: "string", description: "Meta description 120-160 chars" },
                      focus_keywords: { type: "array", items: { type: "string" }, description: "3-5 primary keywords" },
                      secondary_keywords: { type: "array", items: { type: "string" }, description: "3-5 secondary keywords" },
                      hashtags: { type: "array", items: { type: "string" }, description: "4-6 hashtags" },
                      content_suggestions: { type: "array", items: { type: "string" }, description: "3-5 improvement tips" },
                      readability_tips: { type: "array", items: { type: "string" }, description: "2-3 readability improvements" },
                      content_score: { type: "number", description: "Estimated content quality score 0-100" },
                    },
                    required: ["optimized_title", "optimized_description", "focus_keywords", "hashtags", "content_suggestions"],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "seo_optimize" } },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              try { optimization = JSON.parse(toolCall.function.arguments); } catch { /* fallback below */ }
            }
          } else {
            console.error("AI content-optimize error:", aiResp.status);
          }
        } catch (e) {
          console.error("AI content-optimize exception:", e);
        }
      }

      // Fallback to template if AI didn't return structured data
      if (!optimization.optimized_title) {
        const draft = computeSeoDraft(property as Record<string, unknown>);
        optimization = {
          optimized_title: draft.seo_title,
          optimized_description: draft.seo_description,
          focus_keywords: draft.seo_keywords.slice(0, 5),
          secondary_keywords: draft.seo_keywords.slice(5),
          hashtags: draft.seo_hashtags,
          content_suggestions: ["Add more property details", "Include neighborhood amenities", "Mention nearby landmarks"],
          readability_tips: ["Use shorter sentences", "Add bullet points for features"],
          content_score: draft.seo_score,
        };
      }

      // Ensure all expected fields for ContentOptimization interface
      return json({
        action,
        propertyId,
        optimization: {
          optimized_title: optimization.optimized_title || "",
          optimized_description: optimization.optimized_description || "",
          meta_title: optimization.optimized_title || "",
          meta_description: optimization.optimized_description || "",
          focus_keywords: optimization.focus_keywords || [],
          secondary_keywords: optimization.secondary_keywords || [],
          hashtags: optimization.hashtags || [],
          content_score: optimization.content_score || 50,
          word_count_recommendation: 300,
          readability_tips: optimization.readability_tips || [],
          schema_suggestions: ["Add PropertyListing schema", "Include price and location markup"],
          content_suggestions: optimization.content_suggestions || [],
          propertyId,
          currentTitle: currentTitle,
        },
      });
    }

    // ── apply-seo: Apply SEO analysis to the property ──
    if (action === "apply-seo") {
      const propertyId = normalizeText(payload.propertyId);
      if (!propertyId) return json({ error: "propertyId is required" }, 400);

      // Get existing analysis
      const { data: analysis, error: analysisErr } = await supabase
        .from("property_seo_analysis")
        .select("seo_title, seo_description, seo_keywords, seo_hashtags")
        .eq("property_id", propertyId)
        .maybeSingle();

      if (analysisErr) return json({ error: analysisErr.message }, 500);
      if (!analysis) return json({ error: "No SEO analysis found for this property. Run analysis first." }, 404);

      // Update the property with SEO-optimized fields
      const updateFields: Record<string, unknown> = {};
      if (analysis.seo_title) updateFields.seo_title = analysis.seo_title;
      if (analysis.seo_description) updateFields.seo_description = analysis.seo_description;
      if (analysis.seo_keywords) updateFields.seo_keywords = analysis.seo_keywords;

      // Try updating seo fields first, fall back to title/description
      const { error: updateErr } = await supabase
        .from("properties")
        .update(updateFields)
        .eq("id", propertyId);

      if (updateErr) {
        // If seo_title/seo_description columns don't exist, that's ok
        console.warn("SEO field update failed (columns may not exist):", updateErr.message);
      }

      // Mark as applied in analysis table
      await supabase
        .from("property_seo_analysis")
        .update({ updated_at: new Date().toISOString() })
        .eq("property_id", propertyId);

      // Log apply action
      try {
        await supabase.from("seo_ai_actions").insert({
          property_id: propertyId,
          action_type: "apply_seo",
          old_score: 0,
          new_score: 0,
          new_title: analysis.seo_title || null,
          new_description: analysis.seo_description || null,
          keywords_added: analysis.seo_keywords || [],
          ai_model: "apply",
          triggered_by: "manual",
          metadata: { fields_applied: Object.keys(updateFields) },
        });
      } catch (e) {
        console.warn("Failed to log apply action:", e);
      }

      return json({
        action,
        propertyId,
        applied: true,
        fields: updateFields,
        message: "SEO data applied to property",
      });
    }

    // ── generate-serp-preview: Build current vs optimized SERP preview ──
    if (action === "generate-serp-preview") {
      const propertyId = normalizeText(payload.propertyId);
      if (!propertyId) return json({ error: "propertyId is required" }, 400);

      const [propertyRes, analysisRes] = await Promise.all([
        supabase.from("properties").select("id, title, description, city, state, location, property_type, price").eq("id", propertyId).maybeSingle(),
        supabase.from("property_seo_analysis").select("seo_title, seo_description, seo_score, seo_keywords").eq("property_id", propertyId).maybeSingle(),
      ]);

      if (propertyRes.error) return json({ error: propertyRes.error.message }, 500);
      if (!propertyRes.data) return json({ error: "Property not found" }, 404);

      const prop = propertyRes.data;
      const seo = analysisRes.data;

      const currentTitle = prop.title || "Untitled Property";
      const currentDesc = prop.description?.slice(0, 160) || "No description available";
      const slug = currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
      const baseUrl = "astra-villa-realty.lovable.app/property";

      // Match SerpPreview interface: { title, description, url, type, keywords?, score? }
      const current = {
        title: currentTitle,
        description: currentDesc,
        url: `${baseUrl}/${propertyId}`,
        type: "current",
        keywords: [] as string[],
        score: seo?.seo_score || 0,
      };

      const optimized = seo ? {
        title: seo.seo_title || currentTitle,
        description: seo.seo_description || currentDesc,
        url: `${baseUrl}/${slug}-${propertyId.slice(0, 8)}`,
        type: "optimized",
        keywords: seo.seo_keywords || [],
        score: seo.seo_score || 0,
      } : {
        title: currentTitle,
        description: currentDesc,
        url: `${baseUrl}/${propertyId}`,
        type: "optimized",
        keywords: [],
        score: 0,
      };

      const improvements = {
        title_changed: current.title !== optimized.title,
        description_changed: current.description !== optimized.description,
        url_changed: current.url !== optimized.url,
        score_improvement: (optimized.score || 0) - (current.score || 0),
        has_analysis: !!seo,
      };

      return json({ action, propertyId, current, optimized, improvements });
    }

    // ── competitor-analysis: Compare with similar properties ──
    if (action === "competitor-analysis") {
      // Support both propertyId-based and location/propertyType-based queries
      const propertyId = normalizeText(payload.propertyId);
      const locationParam = normalizeText(payload.location);
      const propertyTypeParam = normalizeText(payload.propertyType);

      let targetCity = locationParam;
      let targetType = propertyTypeParam;
      let myScore: number | null = null;

      // If propertyId provided, use it to get location/type
      if (propertyId) {
        const { data: property, error: propErr } = await supabase
          .from("properties")
          .select("id, title, description, property_type, city, state, price")
          .eq("id", propertyId)
          .maybeSingle();

        if (propErr) return json({ error: propErr.message }, 500);
        if (!property) return json({ error: "Property not found" }, 404);

        targetCity = targetCity || property.city || "";
        targetType = targetType || property.property_type || "";

        const { data: mySeo } = await supabase
          .from("property_seo_analysis")
          .select("seo_score")
          .eq("property_id", propertyId)
          .maybeSingle();
        myScore = mySeo?.seo_score || null;
      }

      if (!targetCity && !targetType) {
        return json({ error: "Provide propertyId, or location/propertyType" }, 400);
      }

      // Find competitor properties
      let competitorQuery = supabase
        .from("properties")
        .select("id, title, property_type, city, state, price, location")
        .limit(30);

      if (propertyId) competitorQuery = competitorQuery.neq("id", propertyId);
      if (targetCity) competitorQuery = competitorQuery.eq("city", targetCity);
      if (targetType) competitorQuery = competitorQuery.eq("property_type", targetType);

      const { data: competitors } = await competitorQuery;
      const competitorIds = (competitors || []).map((c: any) => c.id);

      // Get SEO scores
      let seoScores: any[] = [];
      if (competitorIds.length > 0) {
        const { data } = await supabase
          .from("property_seo_analysis")
          .select("property_id, seo_score, seo_rating, seo_keywords")
          .in("property_id", competitorIds.slice(0, 50));
        seoScores = data || [];
      }

      const scoreMap = new Map(seoScores.map((s: any) => [s.property_id, s]));

      // Build CompetitorData[] matching the interface
      const competitorData = (competitors || []).slice(0, 15).map((c: any) => {
        const cSeo = scoreMap.get(c.id);
        return {
          id: c.id,
          title: c.title || "Untitled",
          location: [c.location, c.city, c.state].filter(Boolean).join(", ") || "Unknown",
          price: c.price || 0,
          property_type: c.property_type || "unknown",
          seo_score: cSeo?.seo_score || null,
          seo_rating: cSeo?.seo_rating || "unanalyzed",
          keywords: cSeo?.seo_keywords || [],
        };
      });

      const analyzed = competitorData.filter((c) => c.seo_score !== null);
      const avgScore = analyzed.length > 0
        ? Math.round(analyzed.reduce((sum, c) => sum + (c.seo_score || 0), 0) / analyzed.length)
        : 0;

      // Build CompetitorInsights matching the interface
      const allKeywords = analyzed.flatMap((c) => c.keywords || []);
      const keywordFreq = new Map<string, number>();
      allKeywords.forEach((k) => keywordFreq.set(k, (keywordFreq.get(k) || 0) + 1));
      const topKeywords = [...keywordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k]) => k);

      const insights: Record<string, unknown> = {
        market_saturation: competitorData.length > 10 ? "high" : competitorData.length > 5 ? "medium" : "low",
        avg_keyword_density: topKeywords.length > 0 ? +(allKeywords.length / Math.max(analyzed.length, 1)).toFixed(1) : 0,
        top_performing_keywords: topKeywords,
        keyword_gaps: [],
        price_positioning: avgScore > 60 ? "competitive" : "underoptimized",
        recommendations: [
          analyzed.length < 5 ? "Few competitors analyzed — run batch analysis first" : `${analyzed.length} competitors analyzed in this segment`,
          myScore !== null && avgScore > 0 && myScore < avgScore ? "Your SEO score is below the area average — optimize title and description" : "Your SEO positioning looks solid",
          topKeywords.length > 0 ? `Top keywords in area: ${topKeywords.slice(0, 3).join(", ")}` : "No keyword data available yet",
        ],
        difficulty_score: clamp(Math.round(competitorData.length * 3 + avgScore * 0.5), 0, 100),
      };

      return json({
        action,
        competitors: competitorData,
        insights,
        my_score: myScore,
        avg_competitor_score: avgScore,
        total_competitors: competitorData.length,
      });
    }

    return json({ mode: "seo_generate", status: "not_implemented", payload });
  } catch (error) {
    console.error("SEO generation error:", error);
    return json({
      error: error instanceof Error ? error.message : "SEO generation failed",
    }, 500);
  }
}


async function handleRecommendations(payload: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  const userId = payload.user_id as string;
  const limit = Math.min(Number(payload.limit) || 8, 20);

  if (!userId) return json({ error: "user_id required for recommendations" }, 400);

  // Parallel fetch: DNA + behavior + favorites
  const [dnaRes, behaviorRes, favRes] = await Promise.all([
    sb.from("investor_dna").select("*").eq("user_id", userId).maybeSingle(),
    sb.from("ai_behavior_tracking").select("property_id, event_type, event_data").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
    sb.from("favorites").select("property_id").eq("user_id", userId).limit(50),
  ]);

  const dna = dnaRes.data;
  const viewedIds = new Set((behaviorRes.data || []).map((b: any) => b.property_id).filter(Boolean));
  const savedIds = new Set((favRes.data || []).map((f: any) => f.property_id));
  const excludeIds = [...new Set([...viewedIds, ...savedIds])].slice(0, 50);

  // Build candidate query with DNA preferences
  let q = sb
    .from("properties")
    .select("id, title, price, city, state, property_type, listing_type, bedrooms, bathrooms, building_area_sqm, investment_score, demand_score, thumbnail_url")
    .eq("status", "active");

  // DNA-based pre-filter
  if (dna?.preferred_cities?.length) {
    q = q.in("city", dna.preferred_cities.slice(0, 8));
  }
  if (dna?.budget_range_min) q = q.gte("price", dna.budget_range_min * 0.7);
  if (dna?.budget_range_max) q = q.lte("price", dna.budget_range_max * 1.3);

  q = q.order("investment_score", { ascending: false }).limit(80);

  const { data: candidates } = await q;
  if (!candidates?.length) return json({ recommendations: [], meta: { dna_used: !!dna, reason: "no_candidates" } });

  // Filter out already seen/saved
  const fresh = candidates.filter((p: any) => !excludeIds.includes(p.id));

  // Deal data for scoring
  const freshIds = fresh.map((p: any) => p.id).slice(0, 50);
  const { data: deals } = await sb.from("property_deal_analysis").select("property_id, deal_score, rental_stability_score, flip_potential_score").in("property_id", freshIds);
  const dealMap = new Map((deals || []).map((d: any) => [d.property_id, d]));

  // Score with DNA personalization
  const scored = fresh.map((p: any) => {
    const deal = dealMap.get(p.id) || {} as any;
    let score = 0;

    // Base quality (50%)
    score += (p.investment_score || 0) * 0.25;
    score += (p.demand_score || 0) * 0.15;
    score += (deal.deal_score || 0) * 0.10;

    // DNA personalization (50%)
    if (dna) {
      if (dna.preferred_cities?.includes(p.city)) score += 15;
      if (dna.preferred_property_types?.includes(p.property_type)) score += 12;
      if (p.price >= (dna.budget_range_min || 0) && p.price <= (dna.budget_range_max || Infinity)) score += 10;

      // Persona strategy fit
      const persona = dna.investor_persona;
      if (persona === "conservative") {
        score += Math.min(8, (deal.rental_stability_score || 0) * 0.08);
        score += dna.rental_income_pref_weight > 0.5 ? 5 : 0;
      } else if (persona === "aggressive") {
        score += Math.min(8, (p.demand_score || 0) * 0.08);
        score += dna.capital_growth_pref_weight > 0.5 ? 5 : 0;
      } else if (persona === "flipper") {
        score += Math.min(8, (deal.flip_potential_score || 0) * 0.08);
      } else if (persona === "luxury") {
        const budgetMax = dna.budget_range_max || 0;
        score += p.price >= budgetMax * 0.7 ? 8 : 0;
      } else {
        score += 5; // balanced gets moderate boost
      }
    }

    return {
      ...p,
      recommendation_score: Math.min(100, Math.round(score)),
      deal_score: deal.deal_score || null,
      why: dna ? buildRecommendationReason(p, dna, deal) : "High investment score property",
    };
  });

  scored.sort((a: any, b: any) => b.recommendation_score - a.recommendation_score);

  return json({
    recommendations: scored.slice(0, limit),
    meta: {
      dna_used: !!dna,
      persona: dna?.investor_persona || null,
      total_evaluated: fresh.length,
      excluded_seen: excludeIds.length,
    },
  });
}

function buildRecommendationReason(prop: any, dna: any, deal: any): string {
  const reasons: string[] = [];
  if (dna.preferred_cities?.includes(prop.city)) reasons.push(`Matches your preferred city (${prop.city})`);
  if (dna.preferred_property_types?.includes(prop.property_type)) reasons.push(`Your preferred type (${prop.property_type})`);
  if (dna.investor_persona === "conservative" && (deal.rental_stability_score || 0) >= 60) reasons.push("Strong rental stability");
  if (dna.investor_persona === "flipper" && (deal.flip_potential_score || 0) >= 50) reasons.push("High flip potential");
  if ((prop.investment_score || 0) >= 70) reasons.push("High investment score");
  if ((deal.deal_score || 0) >= 70) reasons.push("Strong deal score");
  return reasons.slice(0, 3).join(" · ") || "Matches your investment profile";
}

async function handleTranscription(payload: Record<string, unknown>) {
  const audio = payload.audio as string;
  if (!audio) return json({ error: "No audio data provided" }, 400);

  function processBase64Chunks(base64String: string, chunkSize = 32768) {
    const chunks: Uint8Array[] = [];
    let position = 0;
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      for (let i = 0; i < binaryChunk.length; i++) bytes[i] = binaryChunk.charCodeAt(i);
      chunks.push(bytes);
      position += chunkSize;
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const c of chunks) { result.set(c, offset); offset += c.length; }
    return result;
  }

  try {
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    formData.append("file", new Blob([binaryAudio], { type: "audio/webm" }), "audio.webm");
    formData.append("model", "whisper-1");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI transcription error:", errText);
      return json({ error: `Transcription failed: ${response.status}` }, 500);
    }

    const result = await response.json();
    return json({ text: result.text });
  } catch (err) {
    console.error("Transcription error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
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

// ── Neighborhood Insights Bot ───────────────────────────────────────

async function handleNeighborhoodInsights(payload: Record<string, unknown>) {
  const { location, question, coordinates } = payload as {
    location?: string;
    question?: string;
    coordinates?: { lat: number; lng: number };
  };

  if (!location && !question) return json({ error: "location or question is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  // Fetch nearby properties for context
  let nearbyContext = "";
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    let query = sb.from("properties").select("title, city, district, price, property_type, bedrooms, bathrooms, building_size, land_size").eq("status", "active").limit(20);
    if (location) {
      query = query.or(`city.ilike.%${location}%,district.ilike.%${location}%,address.ilike.%${location}%`);
    }
    const { data: props } = await query;
    if (props && props.length > 0) {
      nearbyContext = `\n\nNearby property listings for context:\n${JSON.stringify(props.slice(0, 10))}`;
    }
  } catch { /* best effort */ }

  const systemPrompt = `You are an expert neighborhood insights assistant for Indonesian real estate. You provide detailed, accurate, and helpful information about neighborhoods, districts, and cities in Indonesia.

When answering questions, cover relevant topics such as:
- Schools and education (international schools, universities)
- Safety and security
- Transportation and commute (toll roads, MRT, LRT, TransJakarta)
- Amenities (shopping malls, hospitals, restaurants, parks)
- Property market trends in the area
- Lifestyle and community character
- Infrastructure development plans
- Cost of living estimates
- Flood risk and environmental factors
- Nearby landmarks and points of interest

Always provide specific, actionable information. If you're discussing Indonesian locations, include local context like nearby toll gates, popular local establishments, and community characteristics. Use a friendly, informative tone.${nearbyContext}`;

  const userMessage = question
    ? `Question about ${location || "this area"}: ${question}`
    : `Give me a comprehensive neighborhood overview of ${location}, Indonesia. Cover schools, safety, transportation, amenities, property trends, and lifestyle.`;

  try {
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
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "neighborhood_insights",
              description: "Return structured neighborhood insights",
              parameters: {
                type: "object",
                properties: {
                  overview: {
                    type: "object",
                    properties: {
                      summary: { type: "string", description: "2-3 sentence neighborhood summary" },
                      livability_score: { type: "number", description: "Score 1-100" },
                      property_type_fit: { type: "array", items: { type: "string" }, description: "Best property types for this area" },
                      demographic: { type: "string", description: "Primary demographic/resident type" },
                    },
                    required: ["summary", "livability_score", "property_type_fit", "demographic"],
                  },
                  education: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Education score 1-10" },
                      highlights: { type: "array", items: { type: "string" } },
                      notable_schools: { type: "array", items: { type: "object", properties: { name: { type: "string" }, type: { type: "string" }, rating: { type: "string" } }, required: ["name", "type"] } },
                    },
                    required: ["score", "highlights"],
                  },
                  safety: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Safety score 1-10" },
                      highlights: { type: "array", items: { type: "string" } },
                      considerations: { type: "array", items: { type: "string" } },
                    },
                    required: ["score", "highlights"],
                  },
                  transportation: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Transport score 1-10" },
                      highlights: { type: "array", items: { type: "string" } },
                      commute_options: { type: "array", items: { type: "object", properties: { mode: { type: "string" }, description: { type: "string" } }, required: ["mode", "description"] } },
                    },
                    required: ["score", "highlights"],
                  },
                  amenities: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Amenities score 1-10" },
                      highlights: { type: "array", items: { type: "string" } },
                      categories: {
                        type: "object",
                        properties: {
                          shopping: { type: "array", items: { type: "string" } },
                          healthcare: { type: "array", items: { type: "string" } },
                          dining: { type: "array", items: { type: "string" } },
                          recreation: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                    required: ["score", "highlights"],
                  },
                  market_insights: {
                    type: "object",
                    properties: {
                      avg_price_range: { type: "string", description: "Average property price range" },
                      price_trend: { type: "string", enum: ["rising", "stable", "declining"] },
                      rental_yield: { type: "string", description: "Estimated rental yield" },
                      investment_outlook: { type: "string", enum: ["excellent", "good", "moderate", "cautious"] },
                      key_developments: { type: "array", items: { type: "string" } },
                    },
                    required: ["avg_price_range", "price_trend", "investment_outlook"],
                  },
                  environment: {
                    type: "object",
                    properties: {
                      flood_risk: { type: "string", enum: ["low", "moderate", "high"] },
                      green_spaces: { type: "array", items: { type: "string" } },
                      air_quality: { type: "string", enum: ["good", "moderate", "poor"] },
                      noise_level: { type: "string", enum: ["quiet", "moderate", "noisy"] },
                    },
                    required: ["flood_risk", "noise_level"],
                  },
                  chat_response: { type: "string", description: "Natural language conversational response to the user's question" },
                },
                required: ["overview", "education", "safety", "transportation", "amenities", "market_insights", "environment", "chat_response"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "neighborhood_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json(result);
  } catch (e) {
    console.error("neighborhood_insights error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Contract Analyzer ────────────────────────────────────────────────

async function handleContractAnalysis(payload: Record<string, unknown>) {
  const { contract_text, contract_type, language } = payload as {
    contract_text?: string;
    contract_type?: string;
    language?: string;
  };

  if (!contract_text || contract_text.trim().length < 50) {
    return json({ error: "contract_text is required (minimum 50 characters)" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const contractLabel = contract_type || "real estate contract";
  const lang = language || "Indonesian/English";

  const systemPrompt = `You are an expert Indonesian real estate legal analyst. Analyze the provided ${contractLabel} thoroughly. The contract may be in ${lang}. Extract all critical information, identify risks, and provide actionable recommendations. Focus on Indonesian property law (UUPA, PP 24/1997, PP 18/2021) and common pitfalls in Indonesian real estate transactions. Be thorough but present findings clearly.`;

  try {
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
          { role: "user", content: `Analyze this ${contractLabel}:\n\n${contract_text.slice(0, 15000)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "contract_analysis",
              description: "Return structured contract analysis",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "object",
                    properties: {
                      contract_type: { type: "string" },
                      parties: { type: "array", items: { type: "object", properties: { role: { type: "string" }, name: { type: "string" }, details: { type: "string" } }, required: ["role", "name"] } },
                      effective_date: { type: "string" },
                      expiry_date: { type: "string" },
                      property_description: { type: "string" },
                      total_value: { type: "string" },
                      language_detected: { type: "string" },
                    },
                    required: ["contract_type", "parties"],
                  },
                  key_terms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["payment", "duration", "termination", "maintenance", "insurance", "tax", "transfer", "penalty", "other"] },
                        term: { type: "string" },
                        details: { type: "string" },
                        importance: { type: "string", enum: ["critical", "important", "standard"] },
                        clause_reference: { type: "string" },
                      },
                      required: ["category", "term", "details", "importance"],
                    },
                  },
                  risks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string", enum: ["high", "medium", "low"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        affected_party: { type: "string" },
                        recommendation: { type: "string" },
                        legal_reference: { type: "string" },
                      },
                      required: ["severity", "title", "description", "recommendation"],
                    },
                  },
                  obligations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        party: { type: "string" },
                        obligation: { type: "string" },
                        deadline: { type: "string" },
                        penalty_for_breach: { type: "string" },
                        status: { type: "string", enum: ["active", "conditional", "one-time"] },
                      },
                      required: ["party", "obligation"],
                    },
                  },
                  financial_breakdown: {
                    type: "object",
                    properties: {
                      total_cost: { type: "string" },
                      payment_schedule: { type: "array", items: { type: "object", properties: { description: { type: "string" }, amount: { type: "string" }, due_date: { type: "string" } }, required: ["description", "amount"] } },
                      taxes_and_fees: { type: "array", items: { type: "object", properties: { type: { type: "string" }, amount: { type: "string" }, responsible_party: { type: "string" } }, required: ["type", "amount"] } },
                      hidden_costs: { type: "array", items: { type: "string" } },
                    },
                  },
                  legal_compliance: {
                    type: "object",
                    properties: {
                      overall_score: { type: "number", description: "Compliance score 1-100" },
                      compliant_areas: { type: "array", items: { type: "string" } },
                      non_compliant_areas: { type: "array", items: { type: "string" } },
                      missing_clauses: { type: "array", items: { type: "string" } },
                      recommendations: { type: "array", items: { type: "string" } },
                    },
                    required: ["overall_score", "recommendations"],
                  },
                  overall_assessment: {
                    type: "object",
                    properties: {
                      risk_level: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                      favorability: { type: "string", enum: ["buyer_favorable", "balanced", "seller_favorable", "landlord_favorable", "tenant_favorable"] },
                      recommendation: { type: "string", enum: ["proceed", "proceed_with_caution", "negotiate", "seek_legal_counsel", "do_not_sign"] },
                      reasoning: { type: "string" },
                      negotiation_points: { type: "array", items: { type: "string" } },
                    },
                    required: ["risk_level", "favorability", "recommendation", "reasoning"],
                  },
                },
                required: ["summary", "key_terms", "risks", "obligations", "legal_compliance", "overall_assessment"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "contract_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json(result);
  } catch (e) {
    console.error("contract_analysis error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Property Chatbot (streaming) ─────────────────────────────────────

async function handlePropertyChatbot(payload: Record<string, unknown>) {
  const { property_id, messages: chatMessages, property_data } = payload as {
    property_id?: string;
    messages?: { role: string; content: string }[];
    property_data?: Record<string, unknown>;
  };

  if (!chatMessages || chatMessages.length === 0) {
    return json({ error: "messages array is required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  // Fetch property data if ID provided and no inline data
  let propertyContext = property_data || {};
  if (property_id && !property_data) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);
      const { data } = await sb.from("properties").select("*").eq("id", property_id).single();
      if (data) propertyContext = data;
    } catch { /* best effort */ }
  }

  const systemPrompt = `You are a friendly, knowledgeable real estate assistant for ASTRA Villa Realty. You are embedded on a specific property listing page and your job is to answer buyer/renter questions about THIS property.

Property Details:
${JSON.stringify(propertyContext, null, 2)}

Guidelines:
- Answer questions specifically about this property (price, size, features, location, neighborhood)
- Be helpful, enthusiastic but honest about any unknowns
- If asked about mortgage/financing, provide rough estimates using Indonesian bank rates (8-12% for KPR)
- If asked about negotiation, suggest typical Indonesian real estate negotiation ranges (5-15% below listing)
- For legal questions, give general guidance but recommend consulting a notaris/PPAT
- Keep responses concise but thorough — use markdown formatting
- If the question is unrelated to real estate, politely redirect
- Respond in the same language the user writes in (Indonesian or English)`;

  try {
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
          ...chatMessages.slice(-20), // Keep last 20 messages for context
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    // Stream through directly
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("property_chatbot error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── AI Lead Scoring ─────────────────────────────────────────────────

async function handleLeadScoring(payload: Record<string, unknown>) {
  const { leads, agent_id } = payload as {
    leads?: Array<Record<string, unknown>>;
    agent_id?: string;
  };

  if (!leads || leads.length === 0) return json({ error: "leads array is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  // Fetch behavioral data for leads if agent_id provided
  let behaviorContext = "";
  if (agent_id) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      // Get recent behavior tracking for these leads' properties
      const propertyIds = leads.map(l => l.property_id).filter(Boolean);
      if (propertyIds.length > 0) {
        const { data: behaviors } = await sb
          .from("ai_behavior_tracking")
          .select("user_id, event_type, property_id, created_at, duration_ms")
          .in("property_id", propertyIds as string[])
          .order("created_at", { ascending: false })
          .limit(100);
        if (behaviors && behaviors.length > 0) {
          behaviorContext = `\n\nRecent user behavior on these properties:\n${JSON.stringify(behaviors.slice(0, 50))}`;
        }
      }
    } catch { /* best effort */ }
  }

  const systemPrompt = `You are an expert lead scoring AI for Indonesian real estate. Analyze each lead and provide a detailed AI-enhanced score with conversion predictions.

Scoring methodology:
- Contact completeness (name, email, phone): 0-20 points
- Source quality (referral > whatsapp > website > social > cold): 0-15 points
- Engagement signals (specific property interest, multiple contacts, notes quality): 0-25 points
- Behavioral signals (property views, saves, time spent, repeat visits): 0-20 points
- Timing signals (recency of contact, response speed, market conditions): 0-10 points
- Intent signals (asking about financing, legal docs, scheduling visits): 0-10 points

Lead temperature: Hot (>=70), Warm (50-69), Cold (<50)
${behaviorContext}`;

  try {
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
          { role: "user", content: `Score these leads:\n${JSON.stringify(leads.slice(0, 20))}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_leads",
              description: "Return AI-enhanced lead scores",
              parameters: {
                type: "object",
                properties: {
                  scored_leads: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        lead_id: { type: "string" },
                        ai_score: { type: "number", description: "AI score 0-100" },
                        temperature: { type: "string", enum: ["hot", "warm", "cold"] },
                        conversion_probability: { type: "number", description: "Estimated conversion probability 0-100%" },
                        score_breakdown: {
                          type: "object",
                          properties: {
                            contact_completeness: { type: "number" },
                            source_quality: { type: "number" },
                            engagement: { type: "number" },
                            behavioral: { type: "number" },
                            timing: { type: "number" },
                            intent: { type: "number" },
                          },
                        },
                        insights: { type: "array", items: { type: "string" } },
                        recommended_action: { type: "string" },
                        best_contact_time: { type: "string" },
                        risk_factors: { type: "array", items: { type: "string" } },
                        buyer_type: { type: "string", enum: ["investor", "end_user", "first_time_buyer", "upgrader", "relocator", "unknown"] },
                      },
                      required: ["lead_id", "ai_score", "temperature", "conversion_probability", "insights", "recommended_action"],
                    },
                  },
                  summary: {
                    type: "object",
                    properties: {
                      total_leads: { type: "number" },
                      hot_count: { type: "number" },
                      warm_count: { type: "number" },
                      cold_count: { type: "number" },
                      avg_score: { type: "number" },
                      avg_conversion_probability: { type: "number" },
                      top_recommendations: { type: "array", items: { type: "string" } },
                      pipeline_health: { type: "string", enum: ["excellent", "good", "needs_attention", "critical"] },
                    },
                    required: ["total_leads", "hot_count", "warm_count", "cold_count", "avg_score", "pipeline_health", "top_recommendations"],
                  },
                },
                required: ["scored_leads", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_leads" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return json(result);
  } catch (e) {
    console.error("lead_scoring error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Interior Design Advisor ─────────────────────────────────────────

async function handleInteriorDesign(payload: Record<string, unknown>) {
  const { room_type, style, budget_level, current_description, preferences, color_preferences } = payload as {
    room_type: string; style: string; budget_level: string;
    current_description?: string; preferences?: string[]; color_preferences?: string[];
  };

  if (!room_type || !style) return json({ error: "room_type and style are required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const budgetContext: Record<string, string> = {
    low: "Budget-friendly under Rp 15 million IDR. Focus on affordable brands available in Indonesia like IKEA, Informa, Ace Hardware.",
    medium: "Mid-range Rp 15-50 million IDR. Mix of local Indonesian brands and affordable imports.",
    high: "Premium Rp 50-150 million IDR. High-quality brands, custom furniture options.",
    luxury: "Luxury above Rp 150 million IDR. Designer pieces, imported luxury furniture, bespoke items.",
  };

  const systemPrompt = `You are an expert Indonesian interior designer AI. Given a room type, design style, and budget, provide comprehensive interior design recommendations for the Indonesian market. All prices must be in IDR (Indonesian Rupiah). Consider Indonesian climate (tropical), local furniture brands, and availability.

${current_description ? `Current room description: ${current_description}` : ""}
${preferences?.length ? `User preferences: ${preferences.join(", ")}` : ""}
${color_preferences?.length ? `Color preferences: ${color_preferences.join(", ")}` : ""}

Budget context: ${budgetContext[budget_level] || budgetContext.medium}`;

  const userPrompt = `Design a ${style} ${room_type} interior. Budget level: ${budget_level}.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "interior_design_result",
            description: "Structured interior design recommendation",
            parameters: {
              type: "object",
              required: ["design_concept","style_description","color_palette","furniture_recommendations","layout_tips","lighting_suggestions","accent_pieces","estimated_total_budget_idr","mood_keywords","dos","donts"],
              properties: {
                design_concept: { type: "string", description: "Creative concept name, e.g. 'Tropical Serenity'" },
                style_description: { type: "string", description: "2-3 sentence overview of the design vision" },
                color_palette: { type: "array", items: { type: "object", properties: { name: { type: "string" }, hex: { type: "string" }, usage: { type: "string" } }, required: ["name","hex","usage"] }, description: "5-7 colors" },
                furniture_recommendations: { type: "array", items: { type: "object", properties: { name: { type: "string" }, category: { type: "string" }, estimated_price_idr: { type: "number" }, placement_tip: { type: "string" }, brand_suggestion: { type: "string" } }, required: ["name","category","estimated_price_idr","placement_tip"] }, description: "6-10 furniture items" },
                layout_tips: { type: "array", items: { type: "string" }, description: "4-6 layout tips" },
                lighting_suggestions: { type: "array", items: { type: "string" }, description: "3-5 lighting suggestions" },
                accent_pieces: { type: "array", items: { type: "string" }, description: "3-5 accent/decorative pieces" },
                estimated_total_budget_idr: { type: "number", description: "Total estimated budget in IDR" },
                mood_keywords: { type: "array", items: { type: "string" }, description: "5-8 mood/atmosphere keywords" },
                dos: { type: "array", items: { type: "string" }, description: "4-5 design do's" },
                donts: { type: "array", items: { type: "string" }, description: "4-5 design don'ts" },
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "interior_design_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("interior_design error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Social Media Copy Generator ─────────────────────────────────────

async function handleSocialMediaCopy(payload: Record<string, unknown>) {
  const { platform, property_title, property_type, location, price, bedrooms, bathrooms, area, key_features, tone, language, target_audience } = payload as {
    platform: string; property_title: string; property_type: string; location: string; price: number;
    bedrooms?: number; bathrooms?: number; area?: number; key_features?: string[];
    tone: string; language: string; target_audience?: string;
  };

  if (!property_title || !property_type || !location) return json({ error: "property_title, property_type, and location are required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const platformGuides: Record<string, string> = {
    instagram: "Max 2200 chars. Use line breaks for readability. 20-30 hashtags. Carousel-friendly. Include call-to-action in bio link mention.",
    tiktok: "Short punchy hooks. Use trending sounds reference. Include video script for 30-60s. Hashtags 3-5 only. FOMO language works well.",
    facebook: "Longer form OK. Community-focused. Include neighborhood details. Shareable format. 3-5 hashtags max.",
    twitter: "Max 280 chars per tweet. Thread-friendly. Concise and impactful. 2-3 hashtags. Link in reply strategy.",
    linkedin: "Professional tone. Investment angle. Market insight hook. Network-focused CTA. 3-5 hashtags.",
  };

  const langInstruction = language === "id" ? "Write entirely in Bahasa Indonesia." : language === "en" ? "Write entirely in English." : "Write bilingual: main text in Bahasa Indonesia with English translation below.";

  const systemPrompt = `You are an expert Indonesian real estate social media marketer. Generate high-converting property listing copy optimized for ${platform}.

Platform guidelines: ${platformGuides[platform] || platformGuides.instagram}
Tone: ${tone}
${langInstruction}
${target_audience ? `Target audience: ${target_audience}` : ""}

Property details:
- Title: ${property_title}
- Type: ${property_type}
- Location: ${location}
- Price: Rp ${price?.toLocaleString("id-ID") || "N/A"}
${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}${area ? `- Area: ${area}m²` : ""}
${key_features?.length ? `- Key features: ${key_features.join(", ")}` : ""}`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.85,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate 3 caption variants for this ${property_type} listing on ${platform}.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "social_copy_result",
            description: "Structured social media copy result",
            parameters: {
              type: "object",
              required: ["platform","variants","seo_keywords","competitor_differentiation"],
              properties: {
                platform: { type: "string" },
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["caption","hashtags","cta","hook_line","estimated_engagement","best_posting_time","content_tips"],
                    properties: {
                      caption: { type: "string", description: "Full caption text" },
                      hashtags: { type: "array", items: { type: "string" }, description: "Relevant hashtags without #" },
                      cta: { type: "string", description: "Call to action text" },
                      hook_line: { type: "string", description: "Attention-grabbing first line" },
                      estimated_engagement: { type: "string", enum: ["low","medium","high"] },
                      best_posting_time: { type: "string", description: "Best time to post, e.g. 'Selasa 11:00-13:00 WIB'" },
                      content_tips: { type: "array", items: { type: "string" }, description: "2-3 tips for maximizing this post" },
                    }
                  }
                },
                carousel_ideas: { type: "array", items: { type: "string" }, description: "5-7 carousel slide ideas" },
                video_script: { type: "string", description: "30-60 second video/reel script" },
                story_sequence: { type: "array", items: { type: "string" }, description: "4-6 story sequence steps" },
                seo_keywords: { type: "array", items: { type: "string" }, description: "8-12 SEO keywords" },
                competitor_differentiation: { type: "string", description: "How this listing stands out from competitors" },
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "social_copy_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("social_media_copy error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Document Verifier ───────────────────────────────────────────────

async function handleDocumentVerify(payload: Record<string, unknown>) {
  const { document_type, document_text, property_address, owner_name, document_number } = payload as {
    document_type: string; document_text: string; property_address?: string; owner_name?: string; document_number?: string;
  };

  if (!document_text) return json({ error: "document_text is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const docTypeDescriptions: Record<string, string> = {
    shm: "SHM (Sertifikat Hak Milik) - full ownership certificate issued by BPN Indonesia. Must contain: nomor hak, nama pemegang hak, NIB, luas tanah, gambar situasi/surat ukur, and BPN stamp.",
    shgb: "SHGB (Sertifikat Hak Guna Bangunan) - building rights certificate with expiry date. Must contain: nomor hak, jangka waktu, nama pemegang, and BPN registration.",
    ajb: "AJB (Akta Jual Beli) - notarized sale deed. Must contain: notary details, buyer/seller names, property description, transaction value, and notary stamp/signature.",
    imb: "IMB/PBG (Izin Mendirikan Bangunan/Persetujuan Bangunan Gedung) - building permit. Must contain: permit number, building specifications, owner name, and government stamp.",
    pbb: "PBB (Pajak Bumi dan Bangunan) - property tax receipt. Must contain: NOP, taxpayer name, property location, NJOP values, and tax amount.",
    other: "General Indonesian property document.",
  };

  const systemPrompt = `You are an expert Indonesian property document verification AI specializing in detecting forged, tampered, or invalid property documents. You have deep knowledge of Indonesian property law (UUPA, PP 24/1997, PP 18/2021) and BPN (Badan Pertanahan Nasional) document standards.

Document type: ${docTypeDescriptions[document_type] || docTypeDescriptions.other}
${owner_name ? `Expected owner: ${owner_name}` : ""}
${property_address ? `Expected address: ${property_address}` : ""}
${document_number ? `Expected document number: ${document_number}` : ""}

Analyze the document text for:
1. Format consistency with official Indonesian ${document_type?.toUpperCase() || "property"} documents
2. Required elements and stamps/signatures
3. Legal terminology accuracy
4. Cross-reference consistency (names, addresses, numbers match)
5. Red flags: unusual formatting, missing required fields, inconsistent dates
6. Expiry status for SHGB and IMB documents`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Verify this ${document_type?.toUpperCase() || "property"} document:\n\n${document_text.substring(0, 6000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "document_verify_result",
            description: "Structured document verification result",
            parameters: {
              type: "object",
              required: ["is_valid","confidence_score","document_type_detected","verification_status","findings","extracted_data","risk_factors","recommendations","legal_notes","authenticity_indicators"],
              properties: {
                is_valid: { type: "boolean" },
                confidence_score: { type: "number", description: "0-100 confidence score" },
                document_type_detected: { type: "string", description: "Detected document type label" },
                verification_status: { type: "string", enum: ["verified","suspicious","invalid","needs_review"] },
                findings: { type: "array", items: { type: "object", required: ["category","status","description"], properties: { category: { type: "string" }, status: { type: "string", enum: ["pass","warning","fail"] }, description: { type: "string" } } }, description: "5-8 verification checks" },
                extracted_data: { type: "object", properties: { document_number: { type: "string" }, owner_name: { type: "string" }, property_address: { type: "string" }, issue_date: { type: "string" }, expiry_date: { type: "string" }, land_area: { type: "string" }, building_area: { type: "string" }, issuing_authority: { type: "string" }, registration_number: { type: "string" } } },
                risk_factors: { type: "array", items: { type: "string" }, description: "Identified risks" },
                recommendations: { type: "array", items: { type: "string" }, description: "Next steps" },
                legal_notes: { type: "array", items: { type: "string" }, description: "Relevant legal context" },
                authenticity_indicators: { type: "array", items: { type: "object", required: ["indicator","present","importance"], properties: { indicator: { type: "string" }, present: { type: "boolean" }, importance: { type: "string", enum: ["critical","important","minor"] } } }, description: "4-8 authenticity indicators" },
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "document_verify_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("document_verify error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Main router ─────────────────────────────────────────────────────

// ── Rental Yield Optimizer ──────────────────────────────────────────

async function handleRentalYieldOptimizer(payload: Record<string, unknown>) {
  const { property_type, location, purchase_price, current_monthly_rent, property_area, bedrooms, bathrooms, furnishing, building_age_years, rental_strategy } = payload as {
    property_type: string; location: string; purchase_price: number; current_monthly_rent?: number;
    property_area: number; bedrooms: number; bathrooms: number; furnishing: string;
    building_age_years?: number; rental_strategy?: string;
  };

  if (!property_type || !location || !purchase_price) return json({ error: "property_type, location, and purchase_price are required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const systemPrompt = `You are an expert Indonesian rental property analyst AI. Analyze rental yield optimization for properties in Indonesia. All monetary values must be in IDR. Use realistic Indonesian market data for ${location}.

Property: ${property_type}, ${property_area}m², ${bedrooms} BR / ${bathrooms} BA, ${furnishing}, ${building_age_years ? `${building_age_years} years old` : "age unknown"}
Purchase price: Rp ${purchase_price.toLocaleString("id-ID")}
${current_monthly_rent ? `Current rent: Rp ${current_monthly_rent.toLocaleString("id-ID")}/month` : "No current rent data"}
Strategy: ${rental_strategy || "long_term"}

Provide realistic Indonesian market-specific analysis including PBB tax, maintenance, insurance, management fees, and vacancy costs.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Optimize rental yield for this ${property_type} in ${location}.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "rental_yield_result",
            description: "Structured rental yield optimization result",
            parameters: {
              type: "object",
              required: ["optimal_monthly_rent","rent_range","gross_yield_percent","net_yield_percent","annual_expenses_breakdown","occupancy_rate_estimate","annual_net_income","payback_period_years","pricing_strategy","improvement_suggestions","market_comparison","seasonal_trends","risk_factors","recommendations"],
              properties: {
                optimal_monthly_rent: { type: "number" },
                rent_range: { type: "object", properties: { min: { type: "number" }, max: { type: "number" } }, required: ["min","max"] },
                gross_yield_percent: { type: "number" },
                net_yield_percent: { type: "number" },
                annual_expenses_breakdown: { type: "array", items: { type: "object", required: ["category","amount","description"], properties: { category: { type: "string" }, amount: { type: "number" }, description: { type: "string" } } }, description: "5-7 expense categories" },
                occupancy_rate_estimate: { type: "number", description: "0-100" },
                annual_net_income: { type: "number" },
                payback_period_years: { type: "number" },
                pricing_strategy: { type: "array", items: { type: "object", required: ["strategy_name","description","recommended_price","expected_occupancy","expected_annual_income"], properties: { strategy_name: { type: "string" }, description: { type: "string" }, recommended_price: { type: "number" }, expected_occupancy: { type: "number" }, expected_annual_income: { type: "number" } } }, description: "2-3 pricing strategies" },
                improvement_suggestions: { type: "array", items: { type: "object", required: ["improvement","estimated_cost","rent_increase_potential","roi_months"], properties: { improvement: { type: "string" }, estimated_cost: { type: "number" }, rent_increase_potential: { type: "number" }, roi_months: { type: "number" } } }, description: "3-5 improvements" },
                market_comparison: { type: "array", items: { type: "object", required: ["metric","your_property","area_average","status"], properties: { metric: { type: "string" }, your_property: { type: "string" }, area_average: { type: "string" }, status: { type: "string", enum: ["above","below","average"] } } }, description: "4-6 comparison metrics" },
                seasonal_trends: { type: "array", items: { type: "string" }, description: "3-5 seasonal insights" },
                risk_factors: { type: "array", items: { type: "string" }, description: "3-5 risks" },
                recommendations: { type: "array", items: { type: "string" }, description: "4-6 actionable recommendations" },
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "rental_yield_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("rental_yield_optimizer error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Mortgage Advisor ────────────────────────────────────────────────

async function handleMortgageAdvisor(payload: Record<string, unknown>) {
  const { property_price, down_payment_percent, monthly_income, monthly_expenses, employment_type, employment_duration_years, age, property_type, property_location, existing_loans, preferred_tenor_years, is_first_home } = payload as {
    property_price: number; down_payment_percent?: number; monthly_income: number; monthly_expenses?: number;
    employment_type: string; employment_duration_years?: number; age: number; property_type: string;
    property_location: string; existing_loans?: number; preferred_tenor_years?: number; is_first_home?: boolean;
  };

  if (!property_price || !monthly_income || !age) return json({ error: "property_price, monthly_income, and age are required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const dp = down_payment_percent || 20;
  const loanAmount = property_price * (1 - dp / 100);
  const dsr = monthly_income > 0 ? (((existing_loans || 0) / monthly_income) * 100) : 0;

  const systemPrompt = `You are an expert Indonesian mortgage/KPR advisor AI. Analyze mortgage options for Indonesian banks (BCA, BNI, BTN, Mandiri, BRI, CIMB Niaga, etc.). All values in IDR.

Applicant profile:
- Age: ${age}, Employment: ${employment_type}${employment_duration_years ? `, ${employment_duration_years} years` : ""}
- Monthly income: Rp ${monthly_income.toLocaleString("id-ID")}${monthly_expenses ? `, Expenses: Rp ${monthly_expenses.toLocaleString("id-ID")}` : ""}
- Existing loans: Rp ${(existing_loans || 0).toLocaleString("id-ID")}/month
- Current DSR (pre-mortgage): ${dsr.toFixed(1)}%
- First home: ${is_first_home ? "Yes" : "No"}

Property: ${property_type} in ${property_location}
- Price: Rp ${property_price.toLocaleString("id-ID")}
- DP: ${dp}% (Rp ${(property_price * dp / 100).toLocaleString("id-ID")})
- Loan needed: Rp ${loanAmount.toLocaleString("id-ID")}
- Preferred tenor: ${preferred_tenor_years || 20} years

Use realistic 2024-2025 Indonesian bank KPR rates. Consider FLPP subsidy programs for first-time buyers under Rp 150jt income. Bank-specific rates: BTN typically 3-5% fixed (subsidized), BCA 3.75-6% fixed, Mandiri 3.88-5.5% fixed, BNI 3.65-5.5% fixed.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze KPR options for this ${property_type} purchase in ${property_location}.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "mortgage_advisor_result",
            description: "Structured mortgage advisory result",
            parameters: {
              type: "object",
              required: ["eligibility_score","max_loan_amount","recommended_down_payment_percent","recommended_tenor_years","debt_service_ratio","affordability_status","bank_comparisons","optimal_down_payment_analysis","subsidy_eligibility","risk_assessment","tips","documents_needed","timeline_estimate"],
              properties: {
                eligibility_score: { type: "number", description: "0-100" },
                max_loan_amount: { type: "number" },
                recommended_down_payment_percent: { type: "number" },
                recommended_tenor_years: { type: "number" },
                debt_service_ratio: { type: "number", description: "Including new mortgage, as percentage" },
                affordability_status: { type: "string", enum: ["comfortable","moderate","stretched","not_recommended"] },
                bank_comparisons: { type: "array", items: { type: "object", required: ["bank_name","interest_rate_fixed","interest_rate_floating","fixed_period_years","monthly_installment_fixed","monthly_installment_floating","max_tenor_years","processing_fee_percent","total_cost_over_tenor","eligibility_score","pros","cons"], properties: { bank_name: { type: "string" }, interest_rate_fixed: { type: "number" }, interest_rate_floating: { type: "number" }, fixed_period_years: { type: "number" }, monthly_installment_fixed: { type: "number" }, monthly_installment_floating: { type: "number" }, max_tenor_years: { type: "number" }, processing_fee_percent: { type: "number" }, total_cost_over_tenor: { type: "number" }, eligibility_score: { type: "number" }, pros: { type: "array", items: { type: "string" } }, cons: { type: "array", items: { type: "string" } }, special_offers: { type: "string" } } }, description: "4-6 banks" },
                optimal_down_payment_analysis: { type: "array", items: { type: "object", required: ["down_payment_percent","monthly_installment","total_interest_paid","recommendation"], properties: { down_payment_percent: { type: "number" }, monthly_installment: { type: "number" }, total_interest_paid: { type: "number" }, recommendation: { type: "string" } } }, description: "3-4 DP scenarios" },
                subsidy_eligibility: { type: "array", items: { type: "object", required: ["program_name","eligible","potential_benefit","requirements"], properties: { program_name: { type: "string" }, eligible: { type: "boolean" }, potential_benefit: { type: "string" }, requirements: { type: "array", items: { type: "string" } } } }, description: "2-3 programs" },
                risk_assessment: { type: "array", items: { type: "object", required: ["factor","level","description"], properties: { factor: { type: "string" }, level: { type: "string", enum: ["low","medium","high"] }, description: { type: "string" } } }, description: "4-6 risk factors" },
                tips: { type: "array", items: { type: "string" }, description: "5-7 actionable tips" },
                documents_needed: { type: "array", items: { type: "string" }, description: "8-12 required documents" },
                timeline_estimate: { type: "string", description: "Estimated approval timeline" },
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "mortgage_advisor_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 402 || status === 429 || status === 503) {
        return json({ status, error: status === 402 ? "AI credits required" : status === 429 ? "Rate limited" : "AI temporarily unavailable" }, 200);
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("mortgage_advisor error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

async function handlePropertyValuationReport(payload: Record<string, unknown>) {
  const { property_type, city, district, land_area_sqm, building_area_sqm, bedrooms, bathrooms, certificate_type, year_built, condition, current_asking_price, purpose } = payload as any;

  if (!city || !land_area_sqm) return json({ error: "city and land_area_sqm are required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const buildingInfo = building_area_sqm ? `Building area: ${building_area_sqm} sqm.` : "";
  const roomInfo = bedrooms || bathrooms ? `Bedrooms: ${bedrooms || "N/A"}, Bathrooms: ${bathrooms || "N/A"}.` : "";
  const certInfo = certificate_type ? `Certificate: ${certificate_type}.` : "";
  const yearInfo = year_built ? `Year built: ${year_built}.` : "";
  const condInfo = condition ? `Condition: ${condition}.` : "";
  const askingInfo = current_asking_price ? `Current asking price: IDR ${current_asking_price}.` : "";

  const systemPrompt = `You are an expert Indonesian property appraiser (KJPP-level). Analyze properties using market comparison, income capitalization, and cost approaches. Use real Indonesian market data for ${city}${district ? `, ${district}` : ""}.

Consider these Indonesian market factors:
- Certificate type impacts value (SHM > HGB > Strata Title > AJB/Girik)
- Location premium for Jakarta CBD, Bali tourist areas, BSD/Serpong new developments
- Indonesian property appreciation averages 5-15% annually in prime areas
- Rental yields: 3-8% for residential, 5-12% for commercial
- PBB tax, notary fees (2.5%), and BPHTB (5%) should be factored
- Current market conditions in ${city}`;

  const userPrompt = `Generate a comprehensive property valuation report:

Property Type: ${property_type || "Rumah"}
Location: ${city}${district ? `, ${district}` : ""}
Land Area: ${land_area_sqm} sqm
${buildingInfo}
${roomInfo}
${certInfo}
${yearInfo}
${condInfo}
${askingInfo}
Purpose: ${purpose || "sale"}

Provide realistic Indonesian market valuations with comparable sales data from the ${city} area.`;

  try {
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
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "property_valuation_report",
            description: "Generate comprehensive property valuation report with market data",
            parameters: {
              type: "object",
              properties: {
                estimated_market_value: { type: "number", description: "Estimated fair market value in IDR" },
                value_range_low: { type: "number", description: "Lower bound of value range in IDR" },
                value_range_high: { type: "number", description: "Upper bound of value range in IDR" },
                confidence_level: { type: "number", description: "Confidence level 0-100" },
                price_per_sqm_land: { type: "number", description: "Price per sqm of land in IDR" },
                price_per_sqm_building: { type: "number", description: "Price per sqm of building in IDR" },
                valuation_method: { type: "string", description: "Primary valuation method used" },
                comparable_sales: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      address: { type: "string" },
                      property_type: { type: "string" },
                      land_area_sqm: { type: "number" },
                      building_area_sqm: { type: "number" },
                      sale_price: { type: "number" },
                      price_per_sqm: { type: "number" },
                      sale_date: { type: "string" },
                      similarity_score: { type: "number" }
                    },
                    required: ["address", "property_type", "land_area_sqm", "building_area_sqm", "sale_price", "price_per_sqm", "sale_date", "similarity_score"]
                  }
                },
                market_analysis: {
                  type: "object",
                  properties: {
                    area_trend: { type: "string", enum: ["appreciating", "stable", "declining"] },
                    annual_appreciation_rate: { type: "number" },
                    avg_days_on_market: { type: "number" },
                    supply_demand_ratio: { type: "string" },
                    market_summary: { type: "string" }
                  },
                  required: ["area_trend", "annual_appreciation_rate", "avg_days_on_market", "supply_demand_ratio", "market_summary"]
                },
                investment_metrics: {
                  type: "object",
                  properties: {
                    estimated_rental_yield: { type: "number" },
                    estimated_monthly_rent: { type: "number" },
                    cap_rate: { type: "number" },
                    payback_period_years: { type: "number" },
                    five_year_projection: { type: "number" },
                    ten_year_projection: { type: "number" }
                  },
                  required: ["estimated_rental_yield", "estimated_monthly_rent", "cap_rate", "payback_period_years", "five_year_projection", "ten_year_projection"]
                },
                property_strengths: { type: "array", items: { type: "string" } },
                property_weaknesses: { type: "array", items: { type: "string" } },
                value_adjustments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      factor: { type: "string" },
                      adjustment_percent: { type: "number" },
                      reason: { type: "string" }
                    },
                    required: ["factor", "adjustment_percent", "reason"]
                  }
                },
                recommendations: { type: "array", items: { type: "string" } },
                report_date: { type: "string" },
                disclaimer: { type: "string" }
              },
              required: ["estimated_market_value", "value_range_low", "value_range_high", "confidence_level", "price_per_sqm_land", "price_per_sqm_building", "valuation_method", "comparable_sales", "market_analysis", "investment_metrics", "property_strengths", "property_weaknesses", "value_adjustments", "recommendations", "report_date", "disclaimer"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "property_valuation_report" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits required." }, 402);
      const t = await aiResponse.text();
      console.error("valuation error:", status, t);
      return json({ error: "AI valuation failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("property_valuation_report error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Tenant Matching ─────────────────────────────────────────────────
async function handleTenantMatching(payload: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const {
    tenant_name, budget_min, budget_max, preferred_locations, property_type_preferences,
    bedrooms_min, bathrooms_min, must_have_amenities, lifestyle_tags, move_in_date,
    lease_duration_months, pets, family_size, work_location, commute_preference,
    available_properties,
  } = payload as any;

  const systemPrompt = `You are an expert Indonesian property matching AI. Analyze tenant preferences and available properties to find the best matches. Consider:
- Budget fit (monthly rent within range)
- Location preference and commute distance
- Property features vs. requirements (bedrooms, bathrooms, amenities)
- Lifestyle compatibility (pet-friendly, family-friendly, near schools/malls)
- Lease terms alignment
Score each match 0-100 and provide specific reasons. Return top matches sorted by compatibility.`;

  const userPrompt = `Tenant Profile:
- Name: ${tenant_name || "Anonymous"}
- Budget: Rp ${(budget_min || 0).toLocaleString()} - Rp ${(budget_max || 0).toLocaleString()}/month
- Preferred Locations: ${(preferred_locations || []).join(", ") || "Any"}
- Property Types: ${(property_type_preferences || []).join(", ") || "Any"}
- Min Bedrooms: ${bedrooms_min || "Any"}, Min Bathrooms: ${bathrooms_min || "Any"}
- Must-have Amenities: ${(must_have_amenities || []).join(", ") || "None specified"}
- Lifestyle: ${(lifestyle_tags || []).join(", ") || "Not specified"}
- Move-in Date: ${move_in_date || "Flexible"}
- Lease Duration: ${lease_duration_months || "Flexible"} months
- Pets: ${pets || "No"}
- Family Size: ${family_size || "Not specified"}
- Work Location: ${work_location || "Not specified"}
- Commute Preference: ${commute_preference || "Not specified"}

Available Properties:
${JSON.stringify(available_properties || [], null, 2)}

Analyze each property against this tenant's needs and return structured matches.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "tenant_match_results",
            description: "Return tenant-property matching results",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      property_id: { type: "string" },
                      property_title: { type: "string" },
                      compatibility_score: { type: "number", description: "0-100 overall match score" },
                      budget_fit: { type: "number", description: "0-100 budget alignment" },
                      location_fit: { type: "number", description: "0-100 location match" },
                      feature_fit: { type: "number", description: "0-100 feature match" },
                      lifestyle_fit: { type: "number", description: "0-100 lifestyle compatibility" },
                      match_highlights: { type: "array", items: { type: "string" }, description: "Top reasons this is a good match" },
                      concerns: { type: "array", items: { type: "string" }, description: "Potential issues or trade-offs" },
                      monthly_rent: { type: "number" },
                      commute_estimate: { type: "string", description: "Estimated commute time" }
                    },
                    required: ["property_id", "property_title", "compatibility_score", "budget_fit", "location_fit", "feature_fit", "lifestyle_fit", "match_highlights", "concerns", "monthly_rent", "commute_estimate"]
                  }
                },
                tenant_summary: { type: "string", description: "Brief summary of tenant's ideal property profile" },
                market_advice: { type: "string", description: "Advice about current market conditions for this tenant's requirements" },
                total_properties_analyzed: { type: "number" },
                strong_matches: { type: "number", description: "Count of matches scoring 75+" },
                average_compatibility: { type: "number" }
              },
              required: ["matches", "tenant_summary", "market_advice", "total_properties_analyzed", "strong_matches", "average_compatibility"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "tenant_match_results" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits required." }, 402);
      const t = await aiResponse.text();
      console.error("tenant matching error:", status, t);
      return json({ error: "AI tenant matching failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("tenant_matching error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Smart Pricing Engine ─────────────────────────────────────────────
async function handleSmartPricing(payload: Record<string, unknown>) {
  const {
    property_id, title, location, property_type, current_price,
    land_area_sqm, building_area_sqm, bedrooms, bathrooms, amenities,
    listing_type, occupancy_rate, nearby_properties
  } = payload as any;

  if (!location || !property_type || !current_price) {
    return json({ error: "location, property_type, and current_price are required" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const nearbyList = Array.isArray(nearby_properties) && nearby_properties.length > 0
    ? `\n\nComparable properties in the area:\n${nearby_properties.map((p: any, i: number) => `${i+1}. ${p.title} - ${p.property_type}, ${p.location}, Price: ${p.price}, Area: ${p.land_area_sqm || 'N/A'}sqm land / ${p.building_area_sqm || 'N/A'}sqm building, ${p.bedrooms || '?'}BR/${p.bathrooms || '?'}BA`).join('\n')}`
    : '';

  const today = new Date();
  const month = today.toLocaleString('en-US', { month: 'long' });
  const quarter = `Q${Math.ceil((today.getMonth() + 1) / 3)}`;

  const prompt = `You are an expert Indonesian real estate pricing analyst. Analyze this property and provide dynamic pricing recommendations.

Property Details:
- Title: ${title || 'N/A'}
- Location: ${location}
- Type: ${property_type}
- Current Listed Price: IDR ${Number(current_price).toLocaleString()}
- Listing Type: ${listing_type || 'sale'}
- Land Area: ${land_area_sqm || 'N/A'} sqm
- Building Area: ${building_area_sqm || 'N/A'} sqm
- Bedrooms: ${bedrooms || 'N/A'}, Bathrooms: ${bathrooms || 'N/A'}
- Amenities: ${Array.isArray(amenities) ? amenities.join(', ') : 'N/A'}
- Current Occupancy: ${occupancy_rate || 'N/A'}%
${nearbyList}

Current Date: ${month} ${today.getFullYear()} (${quarter})

Consider: seasonality (Bali high season Dec-Mar, Ramadan impact), local demand trends, property condition signals, competitor pricing, and area premium factors. Provide data-driven pricing with clear reasoning.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "smart_pricing_result",
            description: "Return smart pricing analysis and recommendations",
            parameters: {
              type: "object",
              properties: {
                fair_market_value: { type: "number", description: "Estimated fair market value in IDR" },
                optimal_price: { type: "number", description: "Recommended optimal listing price in IDR" },
                quick_sale_price: { type: "number", description: "Price for faster sale/rental in IDR" },
                premium_price: { type: "number", description: "Premium/aspirational price in IDR" },
                price_positioning: { type: "string", enum: ["underpriced", "fair", "slightly_overpriced", "overpriced"], description: "Current price position relative to market" },
                confidence_score: { type: "number", description: "0-100 confidence in the analysis" },
                price_per_sqm: { type: "number", description: "Estimated price per sqm for the area" },
                demand_level: { type: "string", enum: ["low", "moderate", "high", "very_high"], description: "Current demand in this area/segment" },
                seasonality_impact: { type: "string", enum: ["negative", "neutral", "positive", "strong_positive"], description: "Current seasonal impact on pricing" },
                estimated_days_on_market: { type: "number", description: "Estimated days to sell/rent at optimal price" },
                price_trend: { type: "string", enum: ["declining", "stable", "rising", "rapidly_rising"], description: "Price trend in this area" },
                pricing_factors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      factor: { type: "string", description: "Factor name" },
                      impact: { type: "string", enum: ["negative", "neutral", "positive"], description: "Impact direction" },
                      weight: { type: "number", description: "Impact weight 1-10" },
                      explanation: { type: "string", description: "Brief explanation" }
                    },
                    required: ["factor", "impact", "weight", "explanation"]
                  }
                },
                strategies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "number" },
                      timeline: { type: "string", description: "Expected timeline" },
                      pros: { type: "array", items: { type: "string" } },
                      cons: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "price", "timeline", "pros", "cons"]
                  }
                },
                market_summary: { type: "string", description: "Brief market context summary" },
                recommendation: { type: "string", description: "Primary pricing recommendation with reasoning" }
              },
              required: ["fair_market_value", "optimal_price", "quick_sale_price", "premium_price", "price_positioning", "confidence_score", "price_per_sqm", "demand_level", "seasonality_impact", "estimated_days_on_market", "price_trend", "pricing_factors", "strategies", "market_summary", "recommendation"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "smart_pricing_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits required." }, 402);
      const t = await aiResponse.text();
      console.error("smart_pricing error:", status, t);
      return json({ error: "AI smart pricing failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("smart_pricing error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Document Generator ──────────────────────────────────────────────

async function handleDocumentGenerate(payload: Record<string, unknown>) {
  const {
    document_type,
    property_title,
    property_address,
    property_type,
    property_price,
    seller_name,
    buyer_name,
    tenant_name,
    landlord_name,
    lease_start_date,
    lease_end_date,
    monthly_rent,
    deposit_amount,
    payment_terms,
    additional_clauses,
    language,
  } = payload as {
    document_type?: string;
    property_title?: string;
    property_address?: string;
    property_type?: string;
    property_price?: number;
    seller_name?: string;
    buyer_name?: string;
    tenant_name?: string;
    landlord_name?: string;
    lease_start_date?: string;
    lease_end_date?: string;
    monthly_rent?: number;
    deposit_amount?: number;
    payment_terms?: string;
    additional_clauses?: string[];
    language?: string;
  };

  if (!document_type) return json({ error: "document_type is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const lang = language || "Indonesian";
  const docTypeLabel = document_type.replace(/_/g, " ").toUpperCase();

  const prompt = `You are an expert Indonesian property legal document drafting assistant. Generate a professional, legally-sound ${docTypeLabel} document in ${lang}.

DOCUMENT TYPE: ${document_type}
PROPERTY: ${property_title || "N/A"} at ${property_address || "N/A"} (${property_type || "Residential"})
PRICE: ${property_price ? `Rp ${Number(property_price).toLocaleString("id-ID")}` : "N/A"}

PARTIES:
- Seller/Landlord: ${seller_name || landlord_name || "[NAMA PENJUAL/PEMILIK]"}
- Buyer/Tenant: ${buyer_name || tenant_name || "[NAMA PEMBELI/PENYEWA]"}

${document_type === "lease_agreement" ? `LEASE DETAILS:
- Start: ${lease_start_date || "[TANGGAL MULAI]"}
- End: ${lease_end_date || "[TANGGAL BERAKHIR]"}
- Monthly Rent: ${monthly_rent ? `Rp ${Number(monthly_rent).toLocaleString("id-ID")}` : "[HARGA SEWA]"}
- Deposit: ${deposit_amount ? `Rp ${Number(deposit_amount).toLocaleString("id-ID")}` : "[DEPOSIT]"}` : ""}

${payment_terms ? `Payment Terms: ${payment_terms}` : ""}
${additional_clauses?.length ? `Additional Clauses:\n${additional_clauses.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : ""}

Generate a complete, professional legal document with all standard clauses for Indonesian property law.`;

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a legal document generator for Indonesian property transactions. Generate professional, comprehensive documents." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "document_result",
            description: "Return the generated legal document",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Document title" },
                document_number: { type: "string", description: "Generated document reference number" },
                content: { type: "string", description: "Full document content in markdown format with proper headings, articles, and clauses" },
                summary: { type: "string", description: "Brief 2-3 sentence summary of key terms" },
                key_terms: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      term: { type: "string" },
                      value: { type: "string" },
                    },
                    required: ["term", "value"],
                  },
                  description: "Key terms extracted from the document (price, dates, parties, etc.)",
                },
                warnings: {
                  type: "array",
                  items: { type: "string" },
                  description: "Legal warnings or recommendations for the user",
                },
                applicable_laws: {
                  type: "array",
                  items: { type: "string" },
                  description: "Relevant Indonesian laws referenced",
                },
              },
              required: ["title", "document_number", "content", "summary", "key_terms", "warnings", "applicable_laws"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "document_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits required." }, 402);
      console.error("document_generate error:", status, await aiResponse.text());
      return json({ error: "AI document generation failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No structured response from AI");

    return json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("document_generate error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

// ── Property Advisor ────────────────────────────────────────────────
async function handlePropertyAdvisor(payload: Record<string, unknown>) {
  const { user_query } = payload as { user_query?: string };
  if (!user_query) return json({ error: "user_query is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Step 1: Use AI to parse user intent with structured tool calling
    const parseResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a real estate investment advisor for the Indonesian property market. Extract structured search criteria from the user's query. Consider Indonesian cities (Jakarta, Bali, Surabaya, Bandung, Yogyakarta, Semarang, Medan, Makassar) and property types (villa, house, apartment, land, commercial). Convert budget mentions like 'miliar'=billion IDR, 'juta'=million IDR."
          },
          { role: "user", content: user_query }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_search_criteria",
            description: "Extract property search criteria from user query",
            parameters: {
              type: "object",
              properties: {
                city: { type: "string", description: "Target city or empty if not specified" },
                property_type: { type: "string", description: "Property type (villa, house, apartment, land, commercial) or empty" },
                min_price: { type: "number", description: "Minimum budget in IDR, 0 if not specified" },
                max_price: { type: "number", description: "Maximum budget in IDR, 0 if not specified" },
                investment_goal: { type: "string", enum: ["capital_growth", "rental_yield", "both", "personal_use"], description: "Primary investment goal" },
                min_bedrooms: { type: "number", description: "Minimum bedrooms, 0 if not specified" },
                keywords: { type: "array", items: { type: "string" }, description: "Additional keywords like pool, beachfront, etc." }
              },
              required: ["city", "property_type", "min_price", "max_price", "investment_goal", "min_bedrooms", "keywords"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_search_criteria" } }
      })
    });

    if (!parseResponse.ok) {
      const errText = await parseResponse.text();
      console.error("AI parse error:", parseResponse.status, errText);
      if (parseResponse.status === 429) return json({ error: "Rate limit exceeded, please try again later" }, 429);
      if (parseResponse.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "Failed to parse query" }, 500);
    }

    const parseData = await parseResponse.json();
    const toolCall = parseData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "Could not parse search intent" }, 500);

    const criteria = JSON.parse(toolCall.function.arguments);

    // Step 2: Query matching properties from database
    let query = supabase
      .from("properties")
      .select("id, title, city, district, price, property_type, bedrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, image_url, images, has_pool, has_garden, developer_name, status")
      .eq("status", "active")
      .not("price", "is", null)
      .gt("price", 0);

    if (criteria.city) query = query.ilike("city", `%${criteria.city}%`);
    if (criteria.property_type) query = query.ilike("property_type", `%${criteria.property_type}%`);
    if (criteria.min_price > 0) query = query.gte("price", criteria.min_price);
    if (criteria.max_price > 0) query = query.lte("price", criteria.max_price);
    if (criteria.min_bedrooms > 0) query = query.gte("bedrooms", criteria.min_bedrooms);

    const { data: properties, error: propErr } = await query.order("investment_score", { ascending: false }).limit(50);

    if (propErr) throw propErr;
    if (!properties || properties.length === 0) {
      return json({
        parsed_criteria: criteria,
        recommendations: [],
        summary: `No properties found matching your criteria in ${criteria.city || "any city"}. Try broadening your search with a higher budget or different location.`,
        total_found: 0,
      });
    }

    // Step 3: Score and rank each property
    const scored = properties.map(p => {
      const invScore = Number(p.investment_score) || 50;
      const heatScore = Number(p.demand_heat_score) || 50;
      const area = Number(p.building_area_sqm) || Number(p.land_area_sqm) || Number(p.area_sqm) || 1;
      const pricePerSqm = Number(p.price) / area;

      // Forecast growth: base 4% + heat bonus + investment bonus
      const baseGrowth = 4;
      const heatBonus = heatScore > 70 ? 3 : heatScore > 50 ? 1.5 : 0;
      const invBonus = invScore > 80 ? 2 : invScore > 60 ? 1 : 0;
      const forecastGrowth = Math.round((baseGrowth + heatBonus + invBonus) * 10) / 10;

      // Deal score: compare to median
      const dealScore = Math.round(Math.max(0, 100 - (pricePerSqm / 15000000) * 50));

      // Composite rank score
      const compositeScore = (invScore * 0.35) + (heatScore * 0.25) + (forecastGrowth * 3) + (dealScore * 0.15);

      // Keyword bonus
      let keywordBonus = 0;
      const keywords = criteria.keywords || [];
      if (keywords.includes("pool") && p.has_pool) keywordBonus += 5;
      if (keywords.includes("garden") && p.has_garden) keywordBonus += 3;

      return {
        property_id: p.id,
        title: p.title,
        city: p.city,
        district: p.district,
        price: Number(p.price),
        property_type: p.property_type,
        bedrooms: p.bedrooms,
        area_sqm: area,
        investment_score: invScore,
        demand_heat_score: heatScore,
        forecast_growth: forecastGrowth,
        deal_score: dealScore,
        composite_score: Math.round((compositeScore + keywordBonus) * 10) / 10,
        image_url: p.image_url || (Array.isArray(p.images) ? p.images[0] : null),
        developer: p.developer_name,
      };
    });

    scored.sort((a, b) => b.composite_score - a.composite_score);
    const topResults = scored.slice(0, 10);

    // Step 4: Generate AI summary using top results
    const summaryPrompt = `You are ASTRA, an elite Indonesian property investment advisor. Based on this search and results, write a concise investment recommendation summary (max 120 words).

User query: "${user_query}"
Parsed intent: ${JSON.stringify(criteria)}
Top ${topResults.length} properties found (sorted by investment potential):
${topResults.slice(0, 5).map((p, i) => `${i + 1}. ${p.title} in ${p.city} - Rp ${(p.price / 1e9).toFixed(1)}B, Investment Score: ${p.investment_score}, Growth Forecast: ${p.forecast_growth}%/yr, Heat: ${p.demand_heat_score}`).join("\n")}

Be specific about WHY these are good investments. Mention city trends, growth potential, and any standout properties. Use a confident but professional tone. Format with markdown.`;

    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: summaryPrompt }],
      })
    });

    let summary = "Investment analysis complete. Properties ranked by composite score including investment potential, market demand, and growth forecast.";
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const content = summaryData.choices?.[0]?.message?.content;
      if (content) summary = content;
    }

    return json({
      parsed_criteria: criteria,
      recommendations: topResults,
      summary,
      total_found: properties.length,
      total_ranked: scored.length,
    });
  } catch (e) {
    console.error("property_advisor error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

async function handleInvestmentAssistant(payload: Record<string, unknown>) {
  const query = String(payload.query || "").trim();
  const history = (payload.conversation_history || []) as { role: string; content: string }[];
  if (!query) return json({ error: "query is required" }, 400);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  // Step 1: Use AI to detect intent and extract parameters
  const intentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `You are an intent classifier for a property investment platform. Classify the user query and extract parameters. Always call the classify_intent function.` },
        { role: "user", content: query },
      ],
      tools: [{
        type: "function",
        function: {
          name: "classify_intent",
          description: "Classify user investment query intent and extract search parameters",
          parameters: {
            type: "object",
            properties: {
              intent: { type: "string", enum: ["property_search", "investment_analysis", "deal_finder", "market_analysis", "general_advice"] },
              city: { type: "string", description: "Target city if mentioned" },
              property_type: { type: "string", description: "villa, apartment, house, land, commercial" },
              min_price: { type: "number", description: "Minimum price in IDR" },
              max_price: { type: "number", description: "Maximum price in IDR" },
              bedrooms: { type: "number" },
              keywords: { type: "array", items: { type: "string" } },
              analysis_focus: { type: "string", description: "roi, yield, growth, risk, comparison" },
            },
            required: ["intent"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "classify_intent" } },
    }),
  });

  if (!intentResponse.ok) {
    const status = intentResponse.status;
    if (status === 429) return json({ error: "Rate limited. Please try again." }, 429);
    if (status === 402) return json({ error: "AI credits required." }, 402);
    return json({ error: "Intent classification failed" }, 500);
  }

  const intentData = await intentResponse.json();
  const toolCall = intentData.choices?.[0]?.message?.tool_calls?.[0];
  let intent = { intent: "general_advice" } as Record<string, any>;
  try {
    intent = JSON.parse(toolCall?.function?.arguments || "{}");
  } catch { /* use default */ }

  // Step 2: Fetch data based on intent
  let properties: any[] = [];
  let marketStats: any = null;
  const insights: string[] = [];

  if (["property_search", "deal_finder", "investment_analysis"].includes(intent.intent)) {
    let q = sb.from("properties")
      .select("id, title, city, state, price, property_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, thumbnail_url, investment_score, demand_heat_score, rental_yield_estimate, annual_growth_rate")
      .eq("status", "active")
      .order("investment_score", { ascending: false })
      .limit(20);

    if (intent.city) q = q.ilike("city", `%${intent.city}%`);
    if (intent.property_type) q = q.ilike("property_type", `%${intent.property_type}%`);
    if (intent.min_price) q = q.gte("price", intent.min_price);
    if (intent.max_price) q = q.lte("price", intent.max_price);
    if (intent.bedrooms) q = q.gte("bedrooms", intent.bedrooms);

    const { data } = await q;
    properties = data || [];

    if (intent.intent === "deal_finder") {
      // Sort by undervaluation potential
      properties.sort((a: any, b: any) => (b.investment_score || 0) - (a.investment_score || 0));
      properties = properties.slice(0, 10);
      if (properties.length > 0) insights.push(`Found ${properties.length} potential deals with high investment scores.`);
    }
  }

  if (["market_analysis", "investment_analysis"].includes(intent.intent)) {
    const cityFilter = intent.city || null;
    let mq = sb.from("properties")
      .select("price, city, property_type, investment_score, demand_heat_score, rental_yield_estimate, annual_growth_rate")
      .eq("status", "active");
    if (cityFilter) mq = mq.ilike("city", `%${cityFilter}%`);
    const { data: mData } = await mq.limit(500);
    const mProps = mData || [];

    if (mProps.length > 0) {
      const avgPrice = mProps.reduce((s: number, p: any) => s + (p.price || 0), 0) / mProps.length;
      const avgScore = mProps.reduce((s: number, p: any) => s + (p.investment_score || 0), 0) / mProps.length;
      const avgYield = mProps.filter((p: any) => p.rental_yield_estimate).reduce((s: number, p: any) => s + p.rental_yield_estimate, 0) / (mProps.filter((p: any) => p.rental_yield_estimate).length || 1);
      const avgGrowth = mProps.filter((p: any) => p.annual_growth_rate).reduce((s: number, p: any) => s + p.annual_growth_rate, 0) / (mProps.filter((p: any) => p.annual_growth_rate).length || 1);

      marketStats = {
        total_listings: mProps.length,
        avg_price: Math.round(avgPrice),
        avg_investment_score: Math.round(avgScore),
        avg_rental_yield: Math.round(avgYield * 100) / 100,
        avg_growth_rate: Math.round(avgGrowth * 100) / 100,
        city: cityFilter || "All Indonesia",
      };

      insights.push(`Market has ${mProps.length} active listings with avg investment score ${marketStats.avg_investment_score}/100.`);
      if (marketStats.avg_rental_yield > 0) insights.push(`Average rental yield: ${marketStats.avg_rental_yield}%.`);
      if (marketStats.avg_growth_rate > 0) insights.push(`Average annual growth: ${marketStats.avg_growth_rate}%.`);
    }
  }

  // Step 3: Generate natural language response using AI
  const contextParts: string[] = [];
  if (properties.length > 0) {
    contextParts.push(`PROPERTIES FOUND (${properties.length}):\n${properties.slice(0, 10).map((p: any, i: number) =>
      `${i + 1}. ${p.title} - ${p.city} - IDR ${(p.price || 0).toLocaleString()} - Score: ${p.investment_score || 'N/A'}/100 - Yield: ${p.rental_yield_estimate || 'N/A'}% - Growth: ${p.annual_growth_rate || 'N/A'}%`
    ).join('\n')}`);
  }
  if (marketStats) {
    contextParts.push(`MARKET STATS:\n- City: ${marketStats.city}\n- Listings: ${marketStats.total_listings}\n- Avg Price: IDR ${marketStats.avg_price.toLocaleString()}\n- Avg Investment Score: ${marketStats.avg_investment_score}/100\n- Avg Yield: ${marketStats.avg_rental_yield}%\n- Avg Growth: ${marketStats.avg_growth_rate}%`);
  }

  const systemPrompt = `You are ASTRA, an expert AI property investment assistant for Indonesia.
You help investors find deals, analyze markets, and make informed decisions.
Keep responses concise (under 200 words), use markdown formatting, and provide actionable advice.
When presenting properties, highlight their investment potential.
If market data is provided, analyze trends and give strategic recommendations.
Always respond in the same language as the user query.
Intent detected: ${intent.intent}
${contextParts.length > 0 ? '\nDATA CONTEXT:\n' + contextParts.join('\n\n') : '\nNo specific data found for this query. Provide general investment guidance.'}`;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8),
    { role: "user", content: query },
  ];

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: chatMessages }),
  });

  if (!aiResponse.ok) {
    const status = aiResponse.status;
    if (status === 429) return json({ error: "Rate limited. Please try again." }, 429);
    if (status === 402) return json({ error: "AI credits required." }, 402);
    return json({ error: "AI response generation failed" }, 500);
  }

  const aiData = await aiResponse.json();
  const response = aiData.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";

  return json({
    response,
    recommended_properties: properties.slice(0, 5).map((p: any) => ({
      id: p.id, title: p.title, city: p.city, price: p.price,
      property_type: p.property_type, thumbnail_url: p.thumbnail_url,
      investment_score: p.investment_score, rental_yield: p.rental_yield_estimate,
      growth_rate: p.annual_growth_rate,
    })),
    insights,
    intent: intent.intent,
    market_stats: marketStats,
  });
}


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
      case "property_advisor":
        return await handlePropertyAdvisor(payload);
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
      case "neighborhood_insights":
        return await handleNeighborhoodInsights(payload);
      case "contract_analysis":
        return await handleContractAnalysis(payload);
      case "property_chatbot":
        return await handlePropertyChatbot(payload);
      case "lead_scoring":
        return await handleLeadScoring(payload);
      case "interior_design":
        return await handleInteriorDesign(payload);
      case "social_media_copy":
        return await handleSocialMediaCopy(payload);
      case "document_verify":
        return await handleDocumentVerify(payload);
      case "rental_yield_optimizer":
        return await handleRentalYieldOptimizer(payload);
      case "mortgage_advisor":
        return await handleMortgageAdvisor(payload);
      case "property_valuation_report":
        return await handlePropertyValuationReport(payload);
      case "tenant_matching":
        return await handleTenantMatching(payload);
      case "smart_pricing":
        return await handleSmartPricing(payload);
      case "document_generate":
        return await handleDocumentGenerate(payload);
      case "investment_assistant":
        return await handleInvestmentAssistant(payload);
      default:
        return json({ error: `Invalid AI mode: ${mode}` }, 400);
    }
  } catch (e) {
    console.error("ai-engine error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
