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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
