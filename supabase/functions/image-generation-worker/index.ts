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

// ── SMART PROMPT GENERATOR ──
function buildSmartPrompt(property: Record<string, any>): string {
  const type = property.property_type || "house";
  const city = property.city || property.location || property.state || "Indonesia";
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const landArea = property.land_area_sqm;
  const buildingArea = property.building_area_sqm;
  const price = property.price || 0;
  const title = property.title || "Property";
  const description = (property.description || "").slice(0, 150);

  // Price-tier style logic (IDR)
  let styleGuide: string;
  if (price > 10_000_000_000) {
    styleGuide = "Ultra-luxury villa with infinity pool, tropical landscaping, premium materials like marble and teak wood, dramatic ocean or rice field view, resort-quality architecture";
  } else if (price > 3_000_000_000) {
    styleGuide = "Modern luxury home with clean lines, private pool, manicured garden, high-end finishes, elegant entrance, professional architectural photography";
  } else if (price > 1_000_000_000) {
    styleGuide = "Contemporary family home, well-maintained garden, modern facade, warm lighting, inviting entrance, middle-upper class residential neighborhood";
  } else if (price > 500_000_000) {
    styleGuide = "Clean modern minimalist house, compact but stylish, neat front yard, bright and airy feel, suburban residential setting";
  } else {
    styleGuide = "Simple well-maintained Indonesian home, clean facade, tidy entrance, residential neighborhood, natural lighting";
  }

  // Size context
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

// ── RESIZE IMAGE (WebP conversion via re-encoding) ──
// Edge functions don't have canvas, so we resize by controlling generation quality
// and store as-is (Gemini already outputs reasonable sizes)

// ── PROCESS SINGLE JOB ──
async function processJob(
  supabase: any,
  job: any,
  workerId: string,
  apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  // Mark as processing
  await supabase
    .from("ai_image_jobs")
    .update({ status: "processing", worker_id: workerId, started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "pending"); // optimistic lock

  // Fetch property data
  const { data: property, error: propErr } = await supabase
    .from("properties")
    .select("id, title, description, property_type, city, location, state, bedrooms, bathrooms, land_area_sqm, building_area_sqm, price, images, thumbnail_url")
    .eq("id", job.property_id)
    .maybeSingle();

  if (propErr || !property) {
    const msg = propErr?.message || "Property not found";
    await markFailed(supabase, job.id, msg);
    return { success: false, error: msg };
  }

  // Build smart prompt
  const prompt = buildSmartPrompt(property);
  const promptHash = await hashPrompt(prompt);

  // Update prompt info
  await supabase
    .from("ai_image_jobs")
    .update({ prompt_text: prompt, prompt_hash: promptHash })
    .eq("id", job.id);

  // Call AI Gateway
  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        // Rate limited - don't count as retry, put back to pending
        await supabase
          .from("ai_image_jobs")
          .update({ status: "pending", worker_id: null, started_at: null, updated_at: new Date().toISOString() })
          .eq("id", job.id);
        return { success: false, error: "Rate limited - requeued" };
      }
      throw new Error(`AI API error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData || !imageData.startsWith("data:image/")) {
      throw new Error("No image returned from AI");
    }

    // Extract and upload
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) throw new Error("Invalid image data format");

    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Main image
    const mainFileName = `ai-generated/${property.id}/${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(mainFileName, binaryData, { contentType: `image/${ext}`, upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl: mainUrl } } = supabase.storage
      .from("property-images")
      .getPublicUrl(mainFileName);

    // Thumbnail (use Supabase image transformations)
    const thumbnailUrl = `${mainUrl}?width=350&height=250&resize=cover`;

    // Update property
    const existingImages: string[] = Array.isArray(property.images) ? [...property.images] : [];
    existingImages.push(mainUrl);

    await supabase
      .from("properties")
      .update({
        images: existingImages,
        thumbnail_url: property.thumbnail_url || mainUrl,
        ai_generated: true,
        image_generated_at: new Date().toISOString(),
      })
      .eq("id", property.id);

    // Mark job done
    await supabase
      .from("ai_image_jobs")
      .update({
        status: "done",
        result_image_url: mainUrl,
        result_thumbnail_url: thumbnailUrl,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return { success: true };
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    const newRetry = (job.retry_count || 0) + 1;

    if (newRetry >= (job.max_retries || 3)) {
      await markFailed(supabase, job.id, msg);
    } else {
      // Exponential backoff - put back as pending with incremented retry
      await supabase
        .from("ai_image_jobs")
        .update({
          status: "pending",
          retry_count: newRetry,
          error_message: msg,
          worker_id: null,
          started_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
    return { success: false, error: msg };
  }
}

async function markFailed(supabase: any, jobId: string, msg: string) {
  await supabase
    .from("ai_image_jobs")
    .update({
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

// ── ENQUEUE JOBS ──
async function enqueueJobs(supabase: any, options: { limit?: number; priceWeight?: number }) {
  const limit = options.limit || 100;

  // Find properties needing images that don't already have pending/processing jobs
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, price, city, property_type")
    .or("thumbnail_url.is.null,ai_generated.is.null")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!properties || properties.length === 0) return { enqueued: 0 };

  // Check which already have pending jobs
  const propIds = properties.map((p: any) => p.id);
  const { data: existingJobs } = await supabase
    .from("ai_image_jobs")
    .select("property_id")
    .in("property_id", propIds)
    .in("status", ["pending", "processing", "done"]);

  const existingSet = new Set((existingJobs || []).map((j: any) => j.property_id));

  // Calculate priority scores and insert
  const newJobs = properties
    .filter((p: any) => !existingSet.has(p.id))
    .map((p: any) => {
      // Priority: higher price = higher priority (normalize to 0-50 range)
      const pricePriority = Math.min(50, Math.log10(Math.max(p.price || 1, 1)) * 5);
      const priority = Math.round(pricePriority);

      return {
        property_id: p.id,
        priority_score: priority,
        status: "pending",
      };
    });

  if (newJobs.length === 0) return { enqueued: 0 };

  // Batch insert in chunks of 50
  let enqueued = 0;
  for (let i = 0; i < newJobs.length; i += 50) {
    const chunk = newJobs.slice(i, i + 50);
    const { error: insertErr } = await supabase
      .from("ai_image_jobs")
      .insert(chunk);
    if (!insertErr) enqueued += chunk.length;
  }

  return { enqueued };
}

// ── MAIN HANDLER ──
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!apiKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  const supabase = createClient(supabaseUrl, serviceKey);
  const workerId = crypto.randomUUID().slice(0, 8);

  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const action = body.action || "process";
  const concurrency = Math.min(body.concurrency || 3, 5); // cap at 5

  // ── ACTION: ENQUEUE ──
  if (action === "enqueue") {
    try {
      const result = await enqueueJobs(supabase, { limit: body.limit || 100 });
      return json({ success: true, ...result });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  // ── ACTION: STATS ──
  if (action === "stats") {
    const [
      { count: pending },
      { count: processing },
      { count: done },
      { count: failed },
    ] = await Promise.all([
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "processing"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "done"),
      supabase.from("ai_image_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
    ]);

    return json({
      pending: pending || 0,
      processing: processing || 0,
      done: done || 0,
      failed: failed || 0,
      total: (pending || 0) + (processing || 0) + (done || 0) + (failed || 0),
    });
  }

  // ── ACTION: RETRY FAILED ──
  if (action === "retry_failed") {
    const { error } = await supabase
      .from("ai_image_jobs")
      .update({ status: "pending", retry_count: 0, error_message: null, worker_id: null, updated_at: new Date().toISOString() })
      .eq("status", "failed");

    return json({ success: !error, error: error?.message });
  }

  // ── ACTION: PROCESS (default) ──
  // Fetch N pending jobs ordered by priority
  const { data: jobs, error: fetchErr } = await supabase
    .from("ai_image_jobs")
    .select("*")
    .eq("status", "pending")
    .order("priority_score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(concurrency);

  if (fetchErr) return json({ error: fetchErr.message }, 500);
  if (!jobs || jobs.length === 0) return json({ processed: 0, message: "No pending jobs" });

  // Process in parallel with configured concurrency
  const results = await Promise.allSettled(
    jobs.map((job: any) => processJob(supabase, job, workerId, apiKey))
  );

  const succeeded = results.filter(r => r.status === "fulfilled" && (r as any).value?.success).length;
  const failedCount = results.length - succeeded;

  return json({
    processed: results.length,
    succeeded,
    failed: failedCount,
    worker_id: workerId,
  });
});
