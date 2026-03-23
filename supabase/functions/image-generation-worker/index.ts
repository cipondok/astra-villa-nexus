import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── ANGLE DEFINITIONS (buildings) ──
const ANGLE_DEFINITIONS: Record<string, { label: string; stage: number; promptSuffix: string }> = {
  main_exterior_front: {
    label: "Front Exterior", stage: 1,
    promptSuffix: "Front façade professional real estate photography, straight-on composition, showcasing entrance and full building width, clear sky background.",
  },
  exterior_angle_side: {
    label: "Side Angle", stage: 2,
    promptSuffix: "Wide-angle perspective from corner view showing depth and architectural volume, emphasizing building scale and side garden or landscape.",
  },
  aerial_drone_view: {
    label: "Aerial Drone", stage: 2,
    promptSuffix: "Top-down cinematic drone shot at 45-degree angle showing roof, surrounding area, neighborhood context, and property boundaries.",
  },
  lifestyle_environment_view: {
    label: "Lifestyle", stage: 3,
    promptSuffix: "Lifestyle context showing neighborhood atmosphere, street trees, nearby amenities, warm community feel, environmental storytelling.",
  },
  evening_lighting_view: {
    label: "Evening", stage: 3,
    promptSuffix: "Warm sunset golden hour or twilight blue hour architectural lighting, interior lights glowing through windows, dramatic sky, cinematic mood.",
  },
};

// ── LAND VISION RENDER DEFINITIONS ──
const VISION_DEFINITIONS: Record<string, { label: string; stage: number; promptSuffix: string }> = {
  vision_future_concept: {
    label: "Future Vision", stage: 1,
    promptSuffix: "Cinematic architectural concept visualization of a completed building on this land plot. Show the finished structure with landscaping, driveway, and surrounding greenery. Aspirational investment concept render.",
  },
  vision_aerial_concept: {
    label: "Vision Aerial", stage: 2,
    promptSuffix: "Aerial drone perspective architectural concept showing the completed development on this land plot, with visible property boundaries, landscaped gardens, and surrounding neighborhood context from above.",
  },
};

const ANGLE_ORDER = ["main_exterior_front", "exterior_angle_side", "aerial_drone_view", "lifestyle_environment_view", "evening_lighting_view"];
const VISION_ORDER = ["vision_future_concept", "vision_aerial_concept"];

// ── LAND DETECTION ──
function isLandListing(property: Record<string, any>): boolean {
  const type = (property.property_type || "").toLowerCase();
  if (type === "land" || type === "tanah" || type === "kavling") return true;
  // No building area and has land area → likely land
  if (!property.building_area_sqm && property.land_area_sqm) return true;
  // No bedrooms and no bathrooms → likely land
  if (!property.bedrooms && !property.bathrooms && property.land_area_sqm) return true;
  return false;
}

// ── VISION STYLE INTELLIGENCE ──
function getVisionStyle(property: Record<string, any>, city: string): string {
  const landArea = property.land_area_sqm || 0;
  const price = property.price || 0;
  const cityLower = city.toLowerCase();

  // Tourism / resort areas
  const isTourism = ["bali", "lombok", "labuan bajo", "nusa", "ubud", "seminyak", "canggu", "kuta", "sanur", "jimbaran", "uluwatu"].some(k => cityLower.includes(k));

  if (price > 10_000_000_000 || (landArea > 2000 && price > 5_000_000_000)) {
    return isTourism
      ? "Ultra-luxury tropical resort-style villa with infinity pool overlooking ocean or rice terraces, premium teak and natural stone, lush tropical landscaping, Bali-contemporary architecture"
      : "Grand luxury estate with expansive gardens, modern Mediterranean architecture, private pool, premium finishes, gated entrance, resort-quality design";
  }

  if (price > 3_000_000_000 || landArea > 1000) {
    return isTourism
      ? "Modern tropical villa with open-air living, private pool, tropical garden, thatched roof accents, contemporary Balinese architecture"
      : "Elegant modern family compound with multiple structures, swimming pool, landscaped courtyard, high-end residential architecture";
  }

  if (price > 1_000_000_000 || landArea > 500) {
    return "Modern tropical family villa with clean lines, covered terrace, neat garden, carport, and warm residential character";
  }

  if (price > 500_000_000 || landArea > 200) {
    return "Clean modern minimalist house with compact design, small garden, tidy entrance, suburban residential setting";
  }

  if (landArea > 100) {
    return "Simple well-designed compact home with neat facade, small front yard, efficient layout";
  }

  return "Compact modern micro-house or studio dwelling, clean design, efficient use of space";
}

// ── VISION PROMPT BUILDER ──
function buildVisionPrompt(property: Record<string, any>, angleType: string): string {
  const city = property.city || property.location || property.state || "Indonesia";
  const landArea = property.land_area_sqm;
  const price = property.price || 0;
  const description = (property.description || "").slice(0, 100);

  const visionStyle = getVisionStyle(property, city);
  const visionDef = VISION_DEFINITIONS[angleType] || VISION_DEFINITIONS.vision_future_concept;

  const landContext = landArea ? `on a ${landArea}sqm land plot` : "on an empty land plot";
  const terrainHints: string[] = [];
  const descLower = (property.description || "").toLowerCase();
  if (descLower.includes("hill") || descLower.includes("bukit")) terrainHints.push("gentle hillside terrain");
  if (descLower.includes("beach") || descLower.includes("pantai") || descLower.includes("ocean")) terrainHints.push("near beachfront");
  if (descLower.includes("rice") || descLower.includes("sawah")) terrainHints.push("overlooking rice field");
  if (descLower.includes("river") || descLower.includes("sungai")) terrainHints.push("riverside setting");
  const terrainStr = terrainHints.length > 0 ? ` Terrain: ${terrainHints.join(", ")}.` : " Flat tropical terrain with surrounding vegetation.";

  return `Cinematic architectural concept visualization ${landContext} in ${city}. ${visionStyle}. ${visionDef.promptSuffix}${terrainStr} ${description ? `Land context: ${description}.` : ""} Photorealistic architectural render, golden hour lighting, lush tropical vegetation, no text, no watermarks, no people, professional real estate investment concept art, 4K quality.`;
}

// ── REGULAR ANGLE PROMPT ──
function buildAnglePrompt(property: Record<string, any>, trafficIntent: string, angleType: string): string {
  const type = property.property_type || "house";
  const city = property.city || property.location || property.state || "Indonesia";
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const landArea = property.land_area_sqm;
  const buildingArea = property.building_area_sqm;
  const price = property.price || 0;
  const description = (property.description || "").slice(0, 120);

  let styleGuide: string;
  if (trafficIntent === "luxury" || price > 10_000_000_000) {
    styleGuide = "Ultra-luxury villa with infinity pool, tropical landscaping, premium marble and teak, resort-quality architecture";
  } else if (trafficIntent === "investment" || price > 3_000_000_000) {
    styleGuide = "Modern high-value property, clean architectural lines, impressive entrance, investment-grade visual";
  } else if (trafficIntent === "family" || price > 1_000_000_000) {
    styleGuide = "Warm welcoming family home, lush garden, cozy veranda, natural light, neighborhood community feel";
  } else if (price > 500_000_000) {
    styleGuide = "Clean modern minimalist house, compact but stylish, neat front yard, bright and airy";
  } else {
    styleGuide = "Simple well-maintained Indonesian home, clean facade, tidy entrance, residential neighborhood";
  }

  const sizeContext: string[] = [];
  if (bedrooms) sizeContext.push(`${bedrooms} bedrooms`);
  if (bathrooms) sizeContext.push(`${bathrooms} bathrooms`);
  if (landArea) sizeContext.push(`${landArea}sqm land`);
  if (buildingArea) sizeContext.push(`${buildingArea}sqm building`);
  const sizeStr = sizeContext.length > 0 ? ` Features: ${sizeContext.join(", ")}.` : "";

  const angleDef = ANGLE_DEFINITIONS[angleType] || ANGLE_DEFINITIONS.main_exterior_front;

  return `Professional real estate photograph of a ${type} in ${city}. ${styleGuide}.${sizeStr} ${angleDef.promptSuffix} ${description ? `Context: ${description}.` : ""} Photorealistic, well-lit, no text, no watermarks, no people, architectural photography style, 4K quality.`;
}

// ── UNIFIED PROMPT DISPATCHER ──
function buildPrompt(property: Record<string, any>, trafficIntent: string, angleType: string): string {
  if (angleType.startsWith("vision_")) {
    return buildVisionPrompt(property, angleType);
  }
  return buildAnglePrompt(property, trafficIntent, angleType);
}

// ── TRAFFIC-AWARE PRIORITY FORMULA ──
function computeTrafficPriority(
  views: number, saves: number, inquiries: number, impressions: number,
  price: number, agentBoosted: boolean
): { score: number; intent: string } {
  const viewScore = Math.min(views, 100) * 0.5;
  const impressionScore = Math.min(impressions, 200) * 0.2;
  const saveScore = Math.min(saves, 50) * 1.5;
  const inquiryScore = Math.min(inquiries, 30) * 3.0;
  const boostScore = agentBoosted ? 20 : 0;
  const priceWeight = Math.min(10, Math.log10(Math.max(price || 1, 1)) - 5);

  const raw = viewScore + impressionScore + saveScore + inquiryScore + boostScore + priceWeight;
  const score = Math.min(100, Math.max(0, Math.round(raw)));

  let intent = "general";
  if (inquiryScore > viewScore && inquiryScore > saveScore) intent = "investment";
  else if (saveScore > viewScore * 0.3) intent = "luxury";
  else if (views > 20) intent = "family";

  return { score, intent };
}

// ── PROMPT HASH ──
async function hashPrompt(prompt: string): Promise<string> {
  const data = new TextEncoder().encode(prompt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// ── COST GUARDRAIL CHECK ──
async function checkBudget(supabase: any): Promise<{ allowed: boolean; remaining: number }> {
  const { data: config } = await supabase
    .from("ai_image_gen_config").select("*").eq("id", "default").maybeSingle();

  if (!config) return { allowed: true, remaining: 999 };

  const lastReset = new Date(config.last_budget_reset_at || 0);
  const now = new Date();
  if (now.toDateString() !== lastReset.toDateString()) {
    await supabase.from("ai_image_gen_config")
      .update({ daily_generated_count: 0, last_budget_reset_at: now.toISOString() })
      .eq("id", "default");
    return { allowed: true, remaining: config.daily_budget_limit };
  }

  const remaining = config.daily_budget_limit - (config.daily_generated_count || 0);
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

async function incrementBudget(supabase: any) {
  const { data: config } = await supabase
    .from("ai_image_gen_config").select("daily_generated_count").eq("id", "default").maybeSingle();
  await supabase.from("ai_image_gen_config")
    .update({ daily_generated_count: (config?.daily_generated_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", "default");
}

// ── PROCESS SINGLE JOB ──
async function processJob(
  supabase: any, job: any, workerId: string, apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  const { count } = await supabase
    .from("ai_image_jobs")
    .update({ status: "processing", worker_id: workerId, started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", job.id).eq("status", "pending");

  if (count === 0) return { success: false, error: "Job already claimed" };

  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select("id, title, description, property_type, city, location, state, bedrooms, bathrooms, land_area_sqm, building_area_sqm, price, images, thumbnail_url")
    .eq("id", job.property_id).maybeSingle();

  if (propErr || !property) {
    await markFailed(supabase, job.id, propErr?.message || "Property not found");
    return { success: false, error: "Property not found" };
  }

  // Cooldown check (per angle)
  const { data: configData } = await supabase.from("ai_image_gen_config").select("cooldown_hours").eq("id", "default").maybeSingle();
  const cooldownHours = configData?.cooldown_hours || 72;

  const { data: recentDone } = await supabase
    .from("ai_image_jobs").select("completed_at")
    .eq("property_id", job.property_id)
    .eq("angle_type", job.angle_type || "main_exterior_front")
    .eq("status", "done")
    .order("completed_at", { ascending: false }).limit(1);

  if (recentDone?.[0]?.completed_at) {
    const hoursSince = (Date.now() - new Date(recentDone[0].completed_at).getTime()) / 3600000;
    if (hoursSince < cooldownHours) {
      await markFailed(supabase, job.id, `Cooldown: ${Math.round(cooldownHours - hoursSince)}h remaining`);
      return { success: false, error: "Cooldown active" };
    }
  }

  const angleType = job.angle_type || "main_exterior_front";
  const trafficIntent = job.traffic_intent || "general";
  const prompt = buildPrompt(property, trafficIntent, angleType);
  const promptHash = await hashPrompt(prompt);

  await supabase.from("ai_image_jobs")
    .update({ prompt_text: prompt, prompt_hash: promptHash }).eq("id", job.id);

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const st = aiResponse.status;
      const respBody = await aiResponse.text();
      if (st === 429) {
        await supabase.from("ai_image_jobs").update({ status: "pending", worker_id: null, started_at: null, updated_at: new Date().toISOString() }).eq("id", job.id);
        return { success: false, error: "Rate limited - requeued" };
      }
      throw new Error(`AI API error ${st}: ${respBody.slice(0, 200)}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData?.startsWith("data:image/")) throw new Error("No image returned from AI");

    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) throw new Error("Invalid image data format");

    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const binaryData = Uint8Array.from(atob(base64Match[2]), (c) => c.charCodeAt(0));

    // Structured storage path
    const fileName = `ai-generated/${property.id}/${angleType}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(fileName, binaryData, { contentType: `image/${base64Match[1]}`, upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl: mainUrl } } = supabase.storage.from("property-images").getPublicUrl(fileName);
    const thumbnailUrl = `${mainUrl}?width=350&height=250&resize=cover`;

    // Update property images array
    const updatedImages: string[] = Array.isArray(property.images) ? [...property.images] : [];
    if (!updatedImages.includes(mainUrl)) updatedImages.push(mainUrl);

    const updatePayload: Record<string, any> = {
      images: updatedImages,
      ai_generated: true,
      image_generated_at: new Date().toISOString(),
    };
    // Set thumbnail for main exterior or first vision render
    const isFirstImage = !property.thumbnail_url;
    if (isFirstImage && (angleType === "main_exterior_front" || angleType === "vision_future_concept")) {
      updatePayload.thumbnail_url = mainUrl;
    }

    await supabase.from("properties").update(updatePayload).eq("id", property.id);

    // Determine style profile
    const styleProfile = angleType.startsWith("vision_") ? "land_vision" : trafficIntent;

    await supabase.from("ai_image_jobs").update({
      status: "done", result_image_url: mainUrl, result_thumbnail_url: thumbnailUrl,
      ai_style_profile: styleProfile,
      completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", job.id);

    await incrementBudget(supabase);

    // After main angle/vision completes, auto-enqueue extras if eligible
    if (angleType === "main_exterior_front") {
      await maybeEnqueueExtraAngles(supabase, property, job);
    }
    if (angleType === "vision_future_concept") {
      await maybeEnqueueExtraVision(supabase, property, job);
    }

    return { success: true };
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    const newRetry = (job.retry_count || 0) + 1;
    if (newRetry >= (job.max_retries || 3)) {
      await markFailed(supabase, job.id, msg);
    } else {
      await supabase.from("ai_image_jobs").update({
        status: "pending", retry_count: newRetry, error_message: msg,
        worker_id: null, started_at: null, updated_at: new Date().toISOString(),
      }).eq("id", job.id);
    }
    return { success: false, error: msg };
  }
}

// ── AUTO-ENQUEUE EXTRA ANGLES (buildings) ──
async function maybeEnqueueExtraAngles(supabase: any, property: any, mainJob: any) {
  const { data: config } = await supabase.from("ai_image_gen_config")
    .select("enabled_angles, extra_angles_min_traffic, extra_angles_min_price, max_images_per_property")
    .eq("id", "default").maybeSingle();
  if (!config) return;

  const minTraffic = config.extra_angles_min_traffic || 15;
  const minPrice = config.extra_angles_min_price || 1_000_000_000;
  const maxImages = config.max_images_per_property || 5;
  const enabledAngles: string[] = config.enabled_angles || ANGLE_ORDER;

  const totalTraffic = (mainJob.traffic_views || 0) + (mainJob.traffic_saves || 0) + (mainJob.traffic_inquiries || 0);
  const price = property.price || 0;
  if (totalTraffic < minTraffic && price < minPrice) return;

  const { data: existing } = await supabase.from("ai_image_jobs")
    .select("angle_type").eq("property_id", property.id).in("status", ["pending", "processing", "done"]);
  const existingAngles = new Set((existing || []).map((j: any) => j.angle_type));
  const angleSetId = crypto.randomUUID();

  const extraAngles = enabledAngles
    .filter(a => a !== "main_exterior_front" && !existingAngles.has(a))
    .slice(0, maxImages - 1);
  if (extraAngles.length === 0) return;

  const jobs = extraAngles.map(angle => ({
    property_id: property.id, angle_type: angle, angle_set_id: angleSetId,
    generation_stage: ANGLE_DEFINITIONS[angle]?.stage || 2,
    priority_score: Math.max(0, (mainJob.priority_score || 0) - (ANGLE_DEFINITIONS[angle]?.stage || 2) * 5),
    status: "pending",
    traffic_views: mainJob.traffic_views || 0, traffic_saves: mainJob.traffic_saves || 0,
    traffic_inquiries: mainJob.traffic_inquiries || 0, traffic_impressions: mainJob.traffic_impressions || 0,
    traffic_intent: mainJob.traffic_intent || "general", ai_style_profile: mainJob.traffic_intent || "general",
  }));
  await supabase.from("ai_image_jobs").insert(jobs);
}

// ── AUTO-ENQUEUE EXTRA VISION (land) ──
async function maybeEnqueueExtraVision(supabase: any, property: any, mainJob: any) {
  const totalTraffic = (mainJob.traffic_views || 0) + (mainJob.traffic_saves || 0) + (mainJob.traffic_inquiries || 0);
  const price = property.price || 0;
  // Only aerial vision for high-value or high-traffic land
  if (totalTraffic < 10 && price < 2_000_000_000) return;

  const { data: existing } = await supabase.from("ai_image_jobs")
    .select("angle_type").eq("property_id", property.id).in("status", ["pending", "processing", "done"]);
  const existingAngles = new Set((existing || []).map((j: any) => j.angle_type));

  if (existingAngles.has("vision_aerial_concept")) return;

  await supabase.from("ai_image_jobs").insert({
    property_id: property.id, angle_type: "vision_aerial_concept",
    angle_set_id: mainJob.angle_set_id || crypto.randomUUID(),
    generation_stage: 2, ai_style_profile: "land_vision",
    priority_score: Math.max(0, (mainJob.priority_score || 0) - 10),
    status: "pending",
    traffic_views: mainJob.traffic_views || 0, traffic_saves: mainJob.traffic_saves || 0,
    traffic_inquiries: mainJob.traffic_inquiries || 0, traffic_impressions: mainJob.traffic_impressions || 0,
    traffic_intent: mainJob.traffic_intent || "general",
  });
}

async function markFailed(supabase: any, jobId: string, msg: string) {
  await supabase.from("ai_image_jobs").update({
    status: "failed", error_message: msg,
    completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

// ── TRAFFIC SIGNAL AGGREGATION ──
async function aggregateTrafficSignals(supabase: any, propertyId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: events } = await supabase
    .from("behavioral_events").select("event_type")
    .eq("property_id", propertyId).gte("created_at", sevenDaysAgo);

  if (!events || events.length === 0) return { views: 0, saves: 0, inquiries: 0, impressions: 0 };

  let views = 0, saves = 0, inquiries = 0, impressions = 0;
  for (const e of events) {
    switch (e.event_type) {
      case "property_view": case "view": case "detail_open": views++; break;
      case "property_save": case "save": saves++; break;
      case "inquiry_submit": case "inquiry_start": case "inquiry": inquiries++; break;
      case "search_performed": case "filter_applied": case "gallery_view": impressions++; break;
    }
  }
  return { views, saves, inquiries, impressions };
}

// ── ENQUEUE BUILDINGS ──
async function enqueueWithTraffic(supabase: any, options: { limit: number; minTraffic: number }) {
  const limit = options.limit || 100;
  const minTraffic = options.minTraffic || 5;

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, price, city, property_type, land_area_sqm, building_area_sqm, bedrooms, bathrooms")
    .or("thumbnail_url.is.null,ai_generated.is.null")
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error) throw new Error(error.message);
  if (!properties || properties.length === 0) return { enqueued: 0, skipped_low_traffic: 0, land_enqueued: 0 };

  const propIds = properties.map((p: any) => p.id);
  const { data: existingJobs } = await supabase
    .from("ai_image_jobs").select("property_id, angle_type")
    .in("property_id", propIds).in("status", ["pending", "processing", "done"]);

  const existingSet = new Set(
    (existingJobs || []).map((j: any) => `${j.property_id}:${j.angle_type}`)
  );

  const newJobs: any[] = [];
  let skippedLowTraffic = 0;
  let landEnqueued = 0;

  for (let i = 0; i < properties.length && newJobs.length < limit; i += 10) {
    const batch = properties.slice(i, Math.min(i + 10, properties.length));
    const trafficResults = await Promise.all(
      batch.map(async (p: any) => {
        const traffic = await aggregateTrafficSignals(supabase, p.id);
        return { property: p, traffic };
      })
    );

    for (const { property: p, traffic } of trafficResults) {
      if (newJobs.length >= limit) break;
      const totalTraffic = traffic.views + traffic.saves + traffic.inquiries;
      if (minTraffic > 0 && totalTraffic < minTraffic) { skippedLowTraffic++; continue; }

      const { score, intent } = computeTrafficPriority(
        traffic.views, traffic.saves, traffic.inquiries, traffic.impressions,
        p.price || 0, false
      );

      const land = isLandListing(p);
      const angleType = land ? "vision_future_concept" : "main_exterior_front";

      if (existingSet.has(`${p.id}:${angleType}`)) continue;

      newJobs.push({
        property_id: p.id, priority_score: score, status: "pending",
        angle_type: angleType, generation_stage: 1,
        ai_style_profile: land ? "land_vision" : intent,
        traffic_views: traffic.views, traffic_saves: traffic.saves,
        traffic_inquiries: traffic.inquiries, traffic_impressions: traffic.impressions,
        traffic_intent: intent,
      });
      if (land) landEnqueued++;
    }
  }

  newJobs.sort((a, b) => b.priority_score - a.priority_score);

  let enqueued = 0;
  for (let i = 0; i < newJobs.length; i += 50) {
    const chunk = newJobs.slice(i, i + 50);
    const { error: insertErr } = await supabase.from("ai_image_jobs").insert(chunk);
    if (!insertErr) enqueued += chunk.length;
  }

  return { enqueued, skipped_low_traffic: skippedLowTraffic, land_enqueued: landEnqueued, total_candidates: properties.length };
}

// ── ENQUEUE LAND VISIONS ONLY ──
async function enqueueLandVisions(supabase: any, options: { limit: number; minTraffic: number }) {
  const limit = options.limit || 50;
  const minTraffic = options.minTraffic || 0;

  // Find land-type properties without vision renders
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, price, city, property_type, land_area_sqm, building_area_sqm, bedrooms, bathrooms, description")
    .or("property_type.ilike.%land%,property_type.ilike.%tanah%,property_type.ilike.%kavling%,building_area_sqm.is.null")
    .order("price", { ascending: false })
    .limit(limit * 3);

  if (error) throw new Error(error.message);
  if (!properties || properties.length === 0) return { enqueued: 0, total_land: 0 };

  // Filter to actual land listings
  const landProps = properties.filter((p: any) => isLandListing(p));

  const propIds = landProps.map((p: any) => p.id);
  if (propIds.length === 0) return { enqueued: 0, total_land: 0 };

  const { data: existingJobs } = await supabase
    .from("ai_image_jobs").select("property_id, angle_type")
    .in("property_id", propIds.slice(0, 100))
    .in("status", ["pending", "processing", "done"])
    .in("angle_type", VISION_ORDER);

  const existingSet = new Set((existingJobs || []).map((j: any) => `${j.property_id}:${j.angle_type}`));

  const newJobs: any[] = [];
  for (const p of landProps) {
    if (newJobs.length >= limit) break;
    if (existingSet.has(`${p.id}:vision_future_concept`)) continue;

    const traffic = await aggregateTrafficSignals(supabase, p.id);
    const totalTraffic = traffic.views + traffic.saves + traffic.inquiries;
    if (minTraffic > 0 && totalTraffic < minTraffic) continue;

    const { score } = computeTrafficPriority(
      traffic.views, traffic.saves, traffic.inquiries, traffic.impressions,
      p.price || 0, false
    );

    newJobs.push({
      property_id: p.id, priority_score: score + 5, // slight boost for land visions
      status: "pending", angle_type: "vision_future_concept",
      generation_stage: 1, ai_style_profile: "land_vision",
      traffic_views: traffic.views, traffic_saves: traffic.saves,
      traffic_inquiries: traffic.inquiries, traffic_impressions: traffic.impressions,
      traffic_intent: "investment",
    });
  }

  newJobs.sort((a, b) => b.priority_score - a.priority_score);

  let enqueued = 0;
  for (let i = 0; i < newJobs.length; i += 50) {
    const chunk = newJobs.slice(i, i + 50);
    const { error: insertErr } = await supabase.from("ai_image_jobs").insert(chunk);
    if (!insertErr) enqueued += chunk.length;
  }

  return { enqueued, total_land: landProps.length };
}

// ── REPRIORITIZE PENDING JOBS ──
async function reprioritizePending(supabase: any) {
  const { data: pendingJobs } = await supabase
    .from("ai_image_jobs").select("id, property_id, angle_type, generation_stage")
    .eq("status", "pending").limit(200);

  if (!pendingJobs || pendingJobs.length === 0) return { updated: 0 };

  let updated = 0;
  for (let i = 0; i < pendingJobs.length; i += 10) {
    const batch = pendingJobs.slice(i, i + 10);
    await Promise.all(batch.map(async (job: any) => {
      const traffic = await aggregateTrafficSignals(supabase, job.property_id);
      const { data: prop } = await supabase.from("properties").select("price").eq("id", job.property_id).maybeSingle();

      const { score, intent } = computeTrafficPriority(
        traffic.views, traffic.saves, traffic.inquiries, traffic.impressions,
        prop?.price || 0, false
      );

      const stagePenalty = ((job.generation_stage || 1) - 1) * 5;

      await supabase.from("ai_image_jobs").update({
        priority_score: Math.max(0, score - stagePenalty),
        traffic_views: traffic.views, traffic_saves: traffic.saves,
        traffic_inquiries: traffic.inquiries, traffic_impressions: traffic.impressions,
        traffic_intent: intent, updated_at: new Date().toISOString(),
      }).eq("id", job.id);
      updated++;
    }));
  }

  await supabase.from("ai_image_gen_config").update({
    last_reprioritize_at: new Date().toISOString(),
  }).eq("id", "default");

  return { updated };
}

// ── MAIN HANDLER ──
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  const supabase = createClient(supabaseUrl, serviceKey);
  const workerId = crypto.randomUUID().slice(0, 8);

  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const action = body.action || "process";
  const concurrency = Math.min(body.concurrency || 3, 5);

  // ── ENQUEUE (traffic-aware, auto-detects land) ──
  if (action === "enqueue") {
    try {
      const { data: config } = await supabase.from("ai_image_gen_config").select("min_traffic_threshold").eq("id", "default").maybeSingle();
      const minTraffic = body.min_traffic ?? config?.min_traffic_threshold ?? 0;
      const result = await enqueueWithTraffic(supabase, { limit: body.limit || 100, minTraffic });
      return json({ success: true, ...result });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  // ── ENQUEUE LAND VISIONS ONLY ──
  if (action === "enqueue_land_visions") {
    try {
      const result = await enqueueLandVisions(supabase, { limit: body.limit || 50, minTraffic: body.min_traffic ?? 0 });
      return json({ success: true, ...result });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  // ── STATS (enhanced with vision breakdown) ──
  if (action === "stats") {
    const [
      { count: pending }, { count: processing }, { count: done }, { count: failed },
      configResult, angleBreakdown,
    ] = await Promise.all([
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "processing"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "done"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabase.from("ai_image_gen_config").select("*").eq("id", "default").maybeSingle(),
      supabase.from("ai_image_jobs").select("angle_type, status").in("status", ["done", "pending", "processing"]).limit(1000),
    ]);

    const config = configResult.data;
    const angleCounts: Record<string, { done: number; pending: number }> = {};
    for (const row of (angleBreakdown.data || [])) {
      const a = row.angle_type || "main_exterior_front";
      if (!angleCounts[a]) angleCounts[a] = { done: 0, pending: 0 };
      if (row.status === "done") angleCounts[a].done++;
      else angleCounts[a].pending++;
    }

    return json({
      pending: pending || 0, processing: processing || 0,
      done: done || 0, failed: failed || 0,
      total: (pending || 0) + (processing || 0) + (done || 0) + (failed || 0),
      angles: angleCounts,
      budget: {
        daily_limit: config?.daily_budget_limit || 200,
        used_today: config?.daily_generated_count || 0,
        remaining: Math.max(0, (config?.daily_budget_limit || 200) - (config?.daily_generated_count || 0)),
      },
      config: {
        auto_enqueue: config?.auto_enqueue_enabled || false,
        min_traffic: config?.min_traffic_threshold || 5,
        max_per_property: config?.max_images_per_property || 5,
        cooldown_hours: config?.cooldown_hours || 72,
        last_reprioritize: config?.last_reprioritize_at,
        extra_angles_min_traffic: config?.extra_angles_min_traffic || 15,
        extra_angles_min_price: config?.extra_angles_min_price || 1_000_000_000,
      },
    });
  }

  // ── RETRY FAILED ──
  if (action === "retry_failed") {
    const { error } = await supabase.from("ai_image_jobs")
      .update({ status: "pending", retry_count: 0, error_message: null, worker_id: null, updated_at: new Date().toISOString() })
      .eq("status", "failed");
    return json({ success: !error });
  }

  // ── REPRIORITIZE ──
  if (action === "reprioritize") {
    try {
      const result = await reprioritizePending(supabase);
      return json({ success: true, ...result });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  // ── UPDATE CONFIG ──
  if (action === "update_config") {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.daily_budget_limit !== undefined) updates.daily_budget_limit = body.daily_budget_limit;
    if (body.max_images_per_property !== undefined) updates.max_images_per_property = body.max_images_per_property;
    if (body.cooldown_hours !== undefined) updates.cooldown_hours = body.cooldown_hours;
    if (body.min_traffic_threshold !== undefined) updates.min_traffic_threshold = body.min_traffic_threshold;
    if (body.auto_enqueue_enabled !== undefined) updates.auto_enqueue_enabled = body.auto_enqueue_enabled;
    if (body.extra_angles_min_traffic !== undefined) updates.extra_angles_min_traffic = body.extra_angles_min_traffic;
    if (body.extra_angles_min_price !== undefined) updates.extra_angles_min_price = body.extra_angles_min_price;

    const { error } = await supabase.from("ai_image_gen_config").update(updates).eq("id", "default");
    return json({ success: !error });
  }

  // ── PROCESS (default) — stage 1 first, then by priority ──
  const budget = await checkBudget(supabase);
  if (!budget.allowed) {
    return json({ processed: 0, message: "Daily budget exhausted", budget_remaining: 0 });
  }

  const processLimit = Math.min(concurrency, budget.remaining);

  const { data: jobs, error: fetchErr } = await supabase
    .from("ai_image_jobs").select("*")
    .eq("status", "pending")
    .order("generation_stage", { ascending: true })
    .order("priority_score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(processLimit);

  if (fetchErr) return json({ error: fetchErr.message }, 500);
  if (!jobs || jobs.length === 0) return json({ processed: 0, message: "No pending jobs" });

  const results = await Promise.allSettled(
    jobs.map((job: any) => processJob(supabase, job, workerId, apiKey))
  );

  const succeeded = results.filter(r => r.status === "fulfilled" && (r as any).value?.success).length;

  return json({
    processed: results.length, succeeded,
    failed: results.length - succeeded,
    worker_id: workerId,
    budget_remaining: budget.remaining - succeeded,
  });
});
