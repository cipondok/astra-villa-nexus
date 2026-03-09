import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TASKS_PER_CYCLE = 10;
const MAX_RETRIES = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Missing config" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "process";

    // ── Create a new job ──
    if (action === "create") {
      return handleCreate(supabase, body);
    }

    // ── Cancel a job ──
    if (action === "cancel") {
      return handleCancel(supabase, body);
    }

    // ── Process next pending job ──
    return handleProcess(supabase);
  } catch (error) {
    console.error("Job worker error:", error);
    return json({ error: error instanceof Error ? error.message : "Worker failed" }, 500);
  }
});

// ── Create Job Handler ──
async function handleCreate(supabase: any, body: any) {
  const { job_type, payload, created_by, priority } = body;
  if (!job_type) return json({ error: "job_type required" }, 400);

  const states: string[] = payload?.states || [];
  const tasks = states.map((state: string) => ({
    task_type: job_type,
    payload: { ...payload, state, states: undefined },
    status: "pending",
    retry_count: 0,
  }));

  const { data: job, error: jobErr } = await supabase
    .from("ai_jobs")
    .insert({
      job_type,
      payload,
      total_tasks: Math.max(tasks.length, 1),
      created_by: created_by || null,
      priority: priority ?? 5,
    })
    .select("id")
    .single();

  if (jobErr) return json({ error: jobErr.message }, 500);

  if (tasks.length > 0) {
    const taskRows = tasks.map((t: any) => ({ ...t, job_id: job.id }));
    const { error: taskErr } = await supabase.from("ai_job_tasks").insert(taskRows);
    if (taskErr) console.error("Task insert error:", taskErr.message);
  }

  await logEvent(supabase, job.id, null, `Job created: ${job_type} with ${tasks.length} tasks`, "info");

  return json({ success: true, jobId: job.id, tasksCreated: tasks.length });
}

// ── Cancel Job Handler ──
async function handleCancel(supabase: any, body: any) {
  const { job_id } = body;
  if (!job_id) return json({ error: "job_id required" }, 400);

  await supabase
    .from("ai_jobs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", job_id)
    .in("status", ["pending", "running"]);

  await supabase
    .from("ai_job_tasks")
    .update({ status: "cancelled" })
    .eq("job_id", job_id)
    .in("status", ["pending", "running"]);

  await logEvent(supabase, job_id, null, "Job cancelled by admin", "warning");

  return json({ success: true, cancelled: job_id });
}

// ── Process Job Handler ──
async function handleProcess(supabase: any) {
  // Step 1: Recover stalled jobs
  const { data: recoveredCount } = await supabase.rpc("recover_stalled_jobs");
  if (recoveredCount && recoveredCount > 0) {
    console.log(`Recovered ${recoveredCount} stalled job(s)`);
  }

  // Step 2: Claim next job using SKIP LOCKED
  const { data: claimedJobId } = await supabase.rpc("claim_next_job");

  if (!claimedJobId) {
    return json({ message: "No pending jobs" });
  }

  // Fetch the claimed job
  const { data: pendingJob } = await supabase
    .from("ai_jobs")
    .select("*")
    .eq("id", claimedJobId)
    .single();

  if (!pendingJob) {
    return json({ message: "Claimed job not found" });
  }

  await logEvent(supabase, pendingJob.id, null, `Worker started processing job`, "info");

  // Fetch pending tasks (limited batch)
  const { data: tasks } = await supabase
    .from("ai_job_tasks")
    .select("*")
    .eq("job_id", pendingJob.id)
    .in("status", ["pending"])
    .order("created_at", { ascending: true })
    .limit(MAX_TASKS_PER_CYCLE);

  const allTasks = tasks || [];
  let completed = 0;
  let failed = 0;
  const MAX_FAILURES = Math.max(Math.ceil(allTasks.length * 0.5), 3);

  for (const task of allTasks) {
    // Check if job was cancelled mid-processing
    const { data: freshJob } = await supabase
      .from("ai_jobs")
      .select("status")
      .eq("id", pendingJob.id)
      .single();

    if (freshJob?.status === "cancelled") {
      await logEvent(supabase, pendingJob.id, null, "Worker stopped: job was cancelled", "warning");
      break;
    }

    if (failed >= MAX_FAILURES) {
      await logEvent(supabase, pendingJob.id, null, `Too many failures (${failed}), stopping`, "error");
      break;
    }

    // Mark task running
    await supabase
      .from("ai_job_tasks")
      .update({ status: "running" })
      .eq("id", task.id);

    await logEvent(supabase, pendingJob.id, task.id, `Task started: ${task.payload?.state || task.task_type}`, "info");

    try {
      let result: any = null;

      if (pendingJob.job_type === "seo_optimize") {
        const { data, error } = await supabase.functions.invoke("ai-engine", {
          body: {
            mode: "seo_generate",
            payload: {
              action: "auto-optimize",
              threshold: task.payload?.threshold || 60,
              limit: task.payload?.limit || 20,
              state: task.payload?.state,
            },
          },
        });
        if (error) throw error;
        result = data;
      } else if (pendingJob.job_type === "seo_scan") {
        const { data, error } = await supabase.functions.invoke("ai-engine", {
          body: {
            mode: "seo_generate",
            payload: {
              action: "analyze-batch",
              limit: task.payload?.limit || 50,
              filter: "unanalyzed",
              state: task.payload?.state,
            },
          },
        });
        if (error) throw error;
        result = data;
      } else if (pendingJob.job_type === "generate_property_recommendations") {
        // Generate recommendations for properties
        result = await generatePropertyRecommendations(supabase, task.payload);
      } else if (pendingJob.job_type === "update_trending_properties") {
        // Update trending property scores
        result = await updateTrendingProperties(supabase, task.payload);
      }

      // Mark task completed
      await supabase
        .from("ai_job_tasks")
        .update({
          status: "completed",
          result,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      await logEvent(supabase, pendingJob.id, task.id, `Task completed: ${task.payload?.state || task.task_type}`, "info");
      completed++;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Unknown error";
      console.error(`Task ${task.id} failed:`, e);

      const newRetryCount = (task.retry_count || 0) + 1;
      const shouldRetry = newRetryCount < MAX_RETRIES;

      await supabase
        .from("ai_job_tasks")
        .update({
          status: shouldRetry ? "pending" : "failed",
          retry_count: newRetryCount,
          result: shouldRetry ? task.result : { error: errMsg },
          completed_at: shouldRetry ? null : new Date().toISOString(),
        })
        .eq("id", task.id);

      const logMsg = shouldRetry
        ? `Task failed (retry ${newRetryCount}/${MAX_RETRIES}): ${errMsg}`
        : `Task permanently failed after ${MAX_RETRIES} retries: ${errMsg}`;

      await logEvent(supabase, pendingJob.id, task.id, logMsg, shouldRetry ? "warning" : "error");

      if (!shouldRetry) failed++;
    }

    // Update job progress
    const { data: progressData } = await supabase
      .from("ai_job_tasks")
      .select("status")
      .eq("job_id", pendingJob.id);

    const allJobTasks = progressData || [];
    const doneTasks = allJobTasks.filter((t: any) => t.status === "completed" || t.status === "failed" || t.status === "cancelled").length;
    const progress = allJobTasks.length > 0 ? Math.round((doneTasks / allJobTasks.length) * 100) : 0;

    await supabase
      .from("ai_jobs")
      .update({ progress, completed_tasks: doneTasks })
      .eq("id", pendingJob.id);
  }

  // Check if all tasks are done
  const { data: remainingTasks } = await supabase
    .from("ai_job_tasks")
    .select("id")
    .eq("job_id", pendingJob.id)
    .in("status", ["pending", "running"])
    .limit(1);

  const allDone = !remainingTasks || remainingTasks.length === 0;

  if (allDone) {
    const finalStatus = failed >= MAX_FAILURES ? "failed" : "completed";
    await supabase
      .from("ai_jobs")
      .update({
        status: finalStatus,
        progress: 100,
        completed_at: new Date().toISOString(),
        error_message: failed > 0 ? `${failed} task(s) failed` : null,
      })
      .eq("id", pendingJob.id);

    await logEvent(supabase, pendingJob.id, null, `Job ${finalStatus}: ${completed} completed, ${failed} failed`, finalStatus === "failed" ? "error" : "info");
  }

  return json({
    success: true,
    jobId: pendingJob.id,
    status: allDone ? (failed >= MAX_FAILURES ? "failed" : "completed") : "running",
    completed,
    failed,
    tasksProcessed: allTasks.length,
  });
}

// ── Logging Helper ──
async function logEvent(supabase: any, jobId: string, taskId: string | null, message: string, level: string) {
  try {
    await supabase.from("ai_job_logs").insert({
      job_id: jobId,
      task_id: taskId,
      message,
      level,
    });
  } catch (e) {
    console.error("Failed to write log:", e);
  }
}

// ── Generate Property Recommendations ──
async function generatePropertyRecommendations(supabase: any, taskPayload: any) {
  const limit = taskPayload?.limit || 50;
  const offset = taskPayload?.offset || 0;

  // Get batch of properties to generate recommendations for
  const { data: properties } = await supabase
    .from("properties")
    .select("id, city, state, property_type, price, bedrooms, bathrooms, area_sqm, investment_score, latitude, longitude, save_count")
    .eq("status", "available")
    .not("latitude", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!properties || properties.length === 0) return { processed: 0 };

  // Pre-fetch ROI forecasts for all properties in batch
  const propIds = properties.map((p: any) => p.id);
  const { data: roiData } = await supabase
    .from("property_roi_forecast")
    .select("property_id, expected_roi, rental_yield")
    .in("property_id", propIds);
  const roiMap = new Map((roiData || []).map((r: any) => [r.property_id, r]));

  // Pre-fetch popularity signals (views in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: viewCounts } = await supabase
    .from("ai_behavior_tracking")
    .select("property_id")
    .eq("event_type", "view")
    .gte("created_at", thirtyDaysAgo)
    .in("property_id", propIds);
  const popularityMap: Record<string, number> = {};
  (viewCounts || []).forEach((v: any) => {
    if (v.property_id) popularityMap[v.property_id] = (popularityMap[v.property_id] || 0) + 1;
  });

  let inserted = 0;

  for (const prop of properties) {
    // Find candidates: same city first, then same state for diversity
    const { data: candidates } = await supabase
      .from("properties")
      .select("id, city, state, price, investment_score, bedrooms, bathrooms, area_sqm, property_type, save_count")
      .eq("status", "available")
      .eq("state", prop.state)
      .neq("id", prop.id)
      .limit(40);

    if (!candidates || candidates.length === 0) continue;

    // Enhanced scoring with multiple signals
    const scored = candidates.map((s: any) => {
      let score = 0;
      const factors: Record<string, number> = {};

      // Property type match (0-25)
      if (s.property_type === prop.property_type) { score += 25; factors.type = 25; }

      // Location match (0-25)
      if (s.city === prop.city) { score += 25; factors.location = 25; }
      else { score += 8; factors.location = 8; } // same state

      // Price similarity (0-20)
      const priceDiff = Math.abs(s.price - prop.price) / Math.max(prop.price, 1);
      const priceScore = priceDiff < 0.1 ? 20 : priceDiff < 0.2 ? 15 : priceDiff < 0.35 ? 8 : 0;
      score += priceScore; factors.price = priceScore;

      // Bedroom match (0-10)
      if (s.bedrooms === prop.bedrooms) { score += 10; factors.bedrooms = 10; }
      else if (Math.abs(s.bedrooms - prop.bedrooms) <= 1) { score += 5; factors.bedrooms = 5; }

      // Area similarity (0-10)
      if (prop.area_sqm && s.area_sqm) {
        const areaDiff = Math.abs(s.area_sqm - prop.area_sqm) / Math.max(prop.area_sqm, 1);
        const areaScore = areaDiff < 0.15 ? 10 : areaDiff < 0.3 ? 6 : areaDiff < 0.5 ? 3 : 0;
        score += areaScore; factors.area = areaScore;
      }

      // Investment score bonus (0-15)
      if (s.investment_score && s.investment_score >= 80) { score += 15; factors.investment = 15; }
      else if (s.investment_score && s.investment_score >= 60) { score += 10; factors.investment = 10; }
      else if (s.investment_score && s.investment_score >= 40) { score += 5; factors.investment = 5; }

      // Popularity bonus (0-10)
      const views = popularityMap[s.id] || 0;
      const saves = s.save_count || 0;
      const popScore = views > 20 || saves > 10 ? 10 : views > 5 || saves > 3 ? 5 : 0;
      score += popScore; factors.popularity = popScore;

      // ROI bonus (0-10)
      const roi = roiMap.get(s.id) as any;
      if (roi?.expected_roi && roi.expected_roi > 8) { score += 10; factors.roi = 10; }
      else if (roi?.expected_roi && roi.expected_roi > 5) { score += 5; factors.roi = 5; }

      return { id: s.id, score, investment_score: s.investment_score, factors };
    });

    // Top 8 similar (higher limit for better coverage)
    const topSimilar = scored.sort((a: any, b: any) => b.score - a.score).slice(0, 8);
    const topInvestment = scored
      .filter((s: any) => s.investment_score && s.investment_score >= 50)
      .sort((a: any, b: any) => (b.investment_score || 0) - (a.investment_score || 0))
      .slice(0, 6);

    const recs = topSimilar.map((s: any) => ({
      property_id: prop.id,
      recommended_property_id: s.id,
      recommendation_score: s.score,
      recommendation_type: "similar",
      factors: s.factors,
      updated_at: new Date().toISOString(),
    }));

    const investRecs = topInvestment.map((s: any) => ({
      property_id: prop.id,
      recommended_property_id: s.id,
      recommendation_score: s.investment_score || 0,
      recommendation_type: "nearby_investment",
      factors: s.factors,
      updated_at: new Date().toISOString(),
    }));

    const allRecs = [...recs, ...investRecs];
    if (allRecs.length > 0) {
      // Batch upsert in chunks of 20 to avoid URI too long
      for (let i = 0; i < allRecs.length; i += 20) {
        const chunk = allRecs.slice(i, i + 20);
        const { error } = await supabase
          .from("property_recommendations")
          .upsert(chunk, { onConflict: "property_id,recommended_property_id,recommendation_type" });
        if (!error) inserted += chunk.length;
      }
    }
  }

  return { processed: properties.length, recommendations_created: inserted };
}

// ── Update Trending Properties ──
async function updateTrendingProperties(supabase: any, taskPayload: any) {
  const days = taskPayload?.days || 30;
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();

  // Aggregate multiple signals: saves, views, inquiries
  const [savesRes, viewsRes, inquiriesRes] = await Promise.all([
    supabase.from("favorites").select("property_id").gte("created_at", cutoff),
    supabase.from("ai_behavior_tracking").select("property_id").eq("event_type", "view").gte("created_at", cutoff).not("property_id", "is", null),
    supabase.from("ai_behavior_tracking").select("property_id").eq("event_type", "inquiry").gte("created_at", cutoff).not("property_id", "is", null),
  ]);

  const scores: Record<string, number> = {};
  const addSignal = (items: any[], weight: number) => {
    (items || []).forEach((s: any) => {
      if (s.property_id) scores[s.property_id] = (scores[s.property_id] || 0) + weight;
    });
  };

  addSignal(savesRes.data, 3);    // saves are strongest signal
  addSignal(inquiriesRes.data, 5); // inquiries are highest intent
  addSignal(viewsRes.data, 1);     // views are weakest signal

  if (Object.keys(scores).length === 0) return { updated: 0 };

  // Update save_count (trending score) on top 200 properties
  let updated = 0;
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 200);

  // Batch update in chunks of 20
  for (const [propertyId, score] of entries) {
    const { error } = await supabase
      .from("properties")
      .update({ save_count: score })
      .eq("id", propertyId);
    if (!error) updated++;
  }

  return { trending_properties: entries.length, updated };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
