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

  // Detect dominant traffic intent
  let intent = "general";
  if (inquiryScore > viewScore && inquiryScore > saveScore) intent = "investment";
  else if (saveScore > viewScore * 0.3) intent = "luxury";
  else if (views > 20) intent = "family";

  return { score, intent };
}

// ── SMART PROMPT WITH TRAFFIC INTENT ──
function buildSmartPrompt(property: Record<string, any>, trafficIntent: string): string {
  const type = property.property_type || "house";
  const city = property.city || property.location || property.state || "Indonesia";
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const landArea = property.land_area_sqm;
  const buildingArea = property.building_area_sqm;
  const price = property.price || 0;
  const description = (property.description || "").slice(0, 150);

  // Intent-adapted style
  let styleGuide: string;
  if (trafficIntent === "luxury" || price > 10_000_000_000) {
    styleGuide = "Ultra-luxury villa with infinity pool, tropical landscaping, premium marble and teak, dramatic ocean or rice field view, resort-quality architecture, drone aerial perspective";
  } else if (trafficIntent === "investment" || price > 3_000_000_000) {
    styleGuide = "Modern high-value property, clean architectural lines, impressive entrance, well-lit professional real estate photography emphasizing scale and premium finish, investment-grade visual";
  } else if (trafficIntent === "family" || price > 1_000_000_000) {
    styleGuide = "Warm welcoming family home, lush garden, children-friendly outdoor space, cozy veranda, natural light streaming through windows, neighborhood community feel";
  } else if (price > 500_000_000) {
    styleGuide = "Clean modern minimalist house, compact but stylish, neat front yard, bright and airy feel, suburban residential setting";
  } else {
    styleGuide = "Simple well-maintained Indonesian home, clean facade, tidy entrance, residential neighborhood, natural lighting";
  }

  const sizeContext: string[] = [];
  if (bedrooms) sizeContext.push(`${bedrooms} bedrooms`);
  if (bathrooms) sizeContext.push(`${bathrooms} bathrooms`);
  if (landArea) sizeContext.push(`${landArea}sqm land`);
  if (buildingArea) sizeContext.push(`${buildingArea}sqm building`);
  const sizeStr = sizeContext.length > 0 ? ` Features: ${sizeContext.join(", ")}.` : "";

  return `Professional real estate exterior photograph of a ${type} in ${city}. ${styleGuide}.${sizeStr} ${description ? `Context: ${description}.` : ""} Photorealistic, well-lit, golden hour lighting, no text, no watermarks, no people, architectural photography style, 4K quality.`;
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
    .from("ai_image_gen_config")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (!config) return { allowed: true, remaining: 999 };

  // Reset daily counter if new day
  const lastReset = new Date(config.last_budget_reset_at || 0);
  const now = new Date();
  if (now.toDateString() !== lastReset.toDateString()) {
    await supabase
      .from("ai_image_gen_config")
      .update({ daily_generated_count: 0, last_budget_reset_at: now.toISOString() })
      .eq("id", "default");
    return { allowed: true, remaining: config.daily_budget_limit };
  }

  const remaining = config.daily_budget_limit - (config.daily_generated_count || 0);
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

async function incrementBudget(supabase: any) {
  const { data: config } = await supabase
    .from("ai_image_gen_config")
    .select("daily_generated_count")
    .eq("id", "default")
    .maybeSingle();

  await supabase
    .from("ai_image_gen_config")
    .update({ daily_generated_count: (config?.daily_generated_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", "default");
}

// ── PROCESS SINGLE JOB ──
async function processJob(
  supabase: any, job: any, workerId: string, apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  // Mark as processing
  const { count } = await supabase
    .from("ai_image_jobs")
    .update({ status: "processing", worker_id: workerId, started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "pending");

  if (count === 0) return { success: false, error: "Job already claimed" };

  // Fetch property
  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select("id, title, description, property_type, city, location, state, bedrooms, bathrooms, land_area_sqm, building_area_sqm, price, images, thumbnail_url")
    .eq("id", job.property_id)
    .maybeSingle();

  if (propErr || !property) {
    await markFailed(supabase, job.id, propErr?.message || "Property not found");
    return { success: false, error: "Property not found" };
  }

  // Check max images per property
  const { data: configData } = await supabase.from("ai_image_gen_config").select("max_images_per_property, cooldown_hours").eq("id", "default").maybeSingle();
  const maxImages = configData?.max_images_per_property || 3;
  const cooldownHours = configData?.cooldown_hours || 72;

  const existingAiImages = (Array.isArray(property.images) ? property.images : []).filter((url: string) => url?.includes("ai-generated"));
  if (existingAiImages.length >= maxImages) {
    await markFailed(supabase, job.id, `Max ${maxImages} AI images reached`);
    return { success: false, error: "Max images reached" };
  }

  // Cooldown check
  const { data: recentDone } = await supabase
    .from("ai_image_jobs")
    .select("completed_at")
    .eq("property_id", job.property_id)
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(1);

  if (recentDone?.[0]?.completed_at) {
    const hoursSince = (Date.now() - new Date(recentDone[0].completed_at).getTime()) / 3600000;
    if (hoursSince < cooldownHours) {
      await markFailed(supabase, job.id, `Cooldown: ${Math.round(cooldownHours - hoursSince)}h remaining`);
      return { success: false, error: "Cooldown active" };
    }
  }

  const trafficIntent = job.traffic_intent || "general";
  const prompt = buildSmartPrompt(property, trafficIntent);
  const promptHash = await hashPrompt(prompt);

  await supabase
    .from("ai_image_jobs")
    .update({ prompt_text: prompt, prompt_hash: promptHash })
    .eq("id", job.id);

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
      const body = await aiResponse.text();
      if (st === 429) {
        await supabase.from("ai_image_jobs").update({ status: "pending", worker_id: null, started_at: null, updated_at: new Date().toISOString() }).eq("id", job.id);
        return { success: false, error: "Rate limited - requeued" };
      }
      throw new Error(`AI API error ${st}: ${body.slice(0, 200)}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData?.startsWith("data:image/")) throw new Error("No image returned from AI");

    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) throw new Error("Invalid image data format");

    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const binaryData = Uint8Array.from(atob(base64Match[2]), (c) => c.charCodeAt(0));

    const mainFileName = `ai-generated/${property.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(mainFileName, binaryData, { contentType: `image/${base64Match[1]}`, upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl: mainUrl } } = supabase.storage.from("property-images").getPublicUrl(mainFileName);
    const thumbnailUrl = `${mainUrl}?width=350&height=250&resize=cover`;

    const updatedImages: string[] = Array.isArray(property.images) ? [...property.images] : [];
    updatedImages.push(mainUrl);

    await supabase.from("properties").update({
      images: updatedImages,
      thumbnail_url: property.thumbnail_url || mainUrl,
      ai_generated: true,
      image_generated_at: new Date().toISOString(),
    }).eq("id", property.id);

    await supabase.from("ai_image_jobs").update({
      status: "done", result_image_url: mainUrl, result_thumbnail_url: thumbnailUrl,
      completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", job.id);

    await incrementBudget(supabase);
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

async function markFailed(supabase: any, jobId: string, msg: string) {
  await supabase.from("ai_image_jobs").update({
    status: "failed", error_message: msg,
    completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", jobId);
}

// ── TRAFFIC SIGNAL AGGREGATION ──
async function aggregateTrafficSignals(supabase: any, propertyId: string): Promise<{
  views: number; saves: number; inquiries: number; impressions: number;
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: events } = await supabase
    .from("behavioral_events")
    .select("event_type")
    .eq("property_id", propertyId)
    .gte("created_at", sevenDaysAgo);

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

// ── SMART ENQUEUE WITH TRAFFIC SIGNALS ──
async function enqueueWithTraffic(supabase: any, options: { limit: number; minTraffic: number }) {
  const limit = options.limit || 100;
  const minTraffic = options.minTraffic || 5;

  // Get properties without images
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, price, city, property_type")
    .or("thumbnail_url.is.null,ai_generated.is.null")
    .order("created_at", { ascending: false })
    .limit(limit * 2); // fetch more since we'll filter

  if (error) throw new Error(error.message);
  if (!properties || properties.length === 0) return { enqueued: 0, skipped_low_traffic: 0 };

  // Check existing jobs
  const propIds = properties.map((p: any) => p.id);
  const { data: existingJobs } = await supabase
    .from("ai_image_jobs")
    .select("property_id")
    .in("property_id", propIds)
    .in("status", ["pending", "processing", "done"]);

  const existingSet = new Set((existingJobs || []).map((j: any) => j.property_id));
  const candidates = properties.filter((p: any) => !existingSet.has(p.id)).slice(0, limit);

  // Aggregate traffic for each candidate (batch in groups of 10)
  const newJobs: any[] = [];
  let skippedLowTraffic = 0;

  for (let i = 0; i < candidates.length; i += 10) {
    const batch = candidates.slice(i, i + 10);
    const trafficResults = await Promise.all(
      batch.map(async (p: any) => {
        const traffic = await aggregateTrafficSignals(supabase, p.id);
        return { property: p, traffic };
      })
    );

    for (const { property: p, traffic } of trafficResults) {
      const totalTraffic = traffic.views + traffic.saves + traffic.inquiries;

      // If auto-enqueue mode and traffic below threshold, skip
      if (minTraffic > 0 && totalTraffic < minTraffic) {
        skippedLowTraffic++;
        continue;
      }

      const { score, intent } = computeTrafficPriority(
        traffic.views, traffic.saves, traffic.inquiries, traffic.impressions,
        p.price || 0, false
      );

      newJobs.push({
        property_id: p.id,
        priority_score: score,
        status: "pending",
        traffic_views: traffic.views,
        traffic_saves: traffic.saves,
        traffic_inquiries: traffic.inquiries,
        traffic_impressions: traffic.impressions,
        traffic_intent: intent,
      });
    }
  }

  // Sort by priority before inserting
  newJobs.sort((a, b) => b.priority_score - a.priority_score);

  let enqueued = 0;
  for (let i = 0; i < newJobs.length; i += 50) {
    const chunk = newJobs.slice(i, i + 50);
    const { error: insertErr } = await supabase.from("ai_image_jobs").insert(chunk);
    if (!insertErr) enqueued += chunk.length;
  }

  return { enqueued, skipped_low_traffic: skippedLowTraffic, total_candidates: candidates.length };
}

// ── REPRIORITIZE PENDING JOBS ──
async function reprioritizePending(supabase: any) {
  const { data: pendingJobs } = await supabase
    .from("ai_image_jobs")
    .select("id, property_id")
    .eq("status", "pending")
    .limit(200);

  if (!pendingJobs || pendingJobs.length === 0) return { updated: 0 };

  let updated = 0;
  for (let i = 0; i < pendingJobs.length; i += 10) {
    const batch = pendingJobs.slice(i, i + 10);
    await Promise.all(batch.map(async (job: any) => {
      const traffic = await aggregateTrafficSignals(supabase, job.property_id);

      // Get property price for scoring
      const { data: prop } = await supabase
        .from("properties")
        .select("price")
        .eq("id", job.property_id)
        .maybeSingle();

      const { score, intent } = computeTrafficPriority(
        traffic.views, traffic.saves, traffic.inquiries, traffic.impressions,
        prop?.price || 0, false
      );

      await supabase.from("ai_image_jobs").update({
        priority_score: score,
        traffic_views: traffic.views,
        traffic_saves: traffic.saves,
        traffic_inquiries: traffic.inquiries,
        traffic_impressions: traffic.impressions,
        traffic_intent: intent,
        updated_at: new Date().toISOString(),
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

  // ── ENQUEUE (traffic-aware) ──
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

  // ── STATS (enhanced) ──
  if (action === "stats") {
    const [
      { count: pending }, { count: processing }, { count: done }, { count: failed },
      configResult,
    ] = await Promise.all([
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "processing"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "done"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabase.from("ai_image_gen_config").select("*").eq("id", "default").maybeSingle(),
    ]);

    const config = configResult.data;
    return json({
      pending: pending || 0, processing: processing || 0,
      done: done || 0, failed: failed || 0,
      total: (pending || 0) + (processing || 0) + (done || 0) + (failed || 0),
      budget: {
        daily_limit: config?.daily_budget_limit || 200,
        used_today: config?.daily_generated_count || 0,
        remaining: Math.max(0, (config?.daily_budget_limit || 200) - (config?.daily_generated_count || 0)),
      },
      config: {
        auto_enqueue: config?.auto_enqueue_enabled || false,
        min_traffic: config?.min_traffic_threshold || 5,
        max_per_property: config?.max_images_per_property || 3,
        cooldown_hours: config?.cooldown_hours || 72,
        last_reprioritize: config?.last_reprioritize_at,
      },
    });
  }

  // ── RETRY FAILED ──
  if (action === "retry_failed") {
    const { error } = await supabase
      .from("ai_image_jobs")
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

    const { error } = await supabase.from("ai_image_gen_config").update(updates).eq("id", "default");
    return json({ success: !error });
  }

  // ── PROCESS (default) ──
  // Budget check
  const budget = await checkBudget(supabase);
  if (!budget.allowed) {
    return json({ processed: 0, message: "Daily budget exhausted", budget_remaining: 0 });
  }

  const processLimit = Math.min(concurrency, budget.remaining);

  const { data: jobs, error: fetchErr } = await supabase
    .from("ai_image_jobs")
    .select("*")
    .eq("status", "pending")
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
    processed: results.length,
    succeeded,
    failed: results.length - succeeded,
    worker_id: workerId,
    budget_remaining: budget.remaining - succeeded,
  });
});
