import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CONCURRENT_TRIGGERS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();

    // Find enabled jobs whose next_run_at is in the past (or null = never run)
    const { data: dueJobs, error: fetchErr } = await supabase
      .from("ai_scheduled_jobs")
      .select("*")
      .eq("enabled", true)
      .or(`next_run_at.is.null,next_run_at.lte.${now}`)
      .order("priority", { ascending: true })
      .limit(10);

    if (fetchErr) throw fetchErr;

    // Check current running jobs to prevent queue starvation
    const { count: runningCount } = await supabase
      .from("ai_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "running");

    const availableSlots = Math.max(0, MAX_CONCURRENT_TRIGGERS - (runningCount || 0));
    if (availableSlots === 0) {
      return new Response(
        JSON.stringify({ message: "Max concurrent jobs reached, skipping cycle", running: runningCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { id: string; job_type: string; status: string }[] = [];
    let triggered = 0;

    for (const job of dueJobs || []) {
      if (triggered >= availableSlots) break;

      // Handle staleness guard job type specially
      if (job.job_type === "staleness_guard") {
        try {
          const stalenessResult = await handleStalenessGuard(supabase, job, now);
          results.push({ id: job.id, job_type: job.job_type, status: stalenessResult });
          // Update next_run_at regardless
          const nextRun = calculateNextRun(job.cron_expression);
          await supabase.from("ai_scheduled_jobs").update({
            last_run_at: now,
            next_run_at: nextRun,
            last_status: stalenessResult,
            retry_count: 0,
          }).eq("id", job.id);
          if (stalenessResult === "triggered") triggered++;
        } catch (err) {
          console.error("Staleness guard error:", err);
          await updateJobOnError(supabase, job, err.message);
          results.push({ id: job.id, job_type: job.job_type, status: "error" });
        }
        continue;
      }

      try {
        // 1. Acquire batch lock
        const { data: locked } = await supabase.rpc("acquire_batch_lock", {
          p_job_type: job.job_type,
          p_ttl_minutes: 30,
        });

        if (!locked) {
          console.log(`Skipping ${job.job_type}: lock not acquired`);
          await supabase.from("ai_scheduled_jobs").update({ last_status: "skipped" }).eq("id", job.id);
          results.push({ id: job.id, job_type: job.job_type, status: "skipped_locked" });
          continue;
        }

        // 2. Check duplicates
        const { count: existingCount } = await supabase
          .from("ai_jobs")
          .select("id", { count: "exact", head: true })
          .eq("job_type", job.job_type)
          .in("status", ["pending", "running"]);

        if ((existingCount || 0) > 0) {
          await supabase.rpc("release_batch_lock", { p_job_type: job.job_type });
          await supabase.from("ai_scheduled_jobs").update({ last_status: "skipped" }).eq("id", job.id);
          results.push({ id: job.id, job_type: job.job_type, status: "skipped_duplicate" });
          continue;
        }

        // 3. Create the AI job
        const { error: invokeErr } = await supabase.functions.invoke("job-worker", {
          body: {
            action: "create",
            job_type: job.job_type,
            payload: job.payload || {},
            created_by: job.created_by,
            priority: job.priority,
          },
        });

        if (invokeErr) {
          await supabase.rpc("release_batch_lock", { p_job_type: job.job_type });
          throw invokeErr;
        }

        // 4. Success — update schedule
        const nextRun = calculateNextRun(job.cron_expression);
        await supabase.from("ai_scheduled_jobs").update({
          last_run_at: now,
          next_run_at: nextRun,
          last_status: "triggered",
          retry_count: 0,
          last_error: null,
        }).eq("id", job.id);

        // 5. If recovering from retries, notify admin
        if (job.retry_count > 0) {
          await supabase.from("admin_alerts").insert({
            type: "schedule_recovery",
            title: "Schedule Recovered",
            message: `${job.name} recovered after ${job.retry_count} retries and is running normally.`,
            priority: "low",
            auto_generated: true,
            alert_category: "system",
            urgency_level: 1,
          });
        }

        await supabase.rpc("release_batch_lock", { p_job_type: job.job_type });
        results.push({ id: job.id, job_type: job.job_type, status: "triggered" });
        triggered++;
      } catch (err) {
        console.error(`Failed to trigger job ${job.id} (${job.job_type}):`, err);
        await updateJobOnError(supabase, job, err.message);
        results.push({ id: job.id, job_type: job.job_type, status: "error" });
      }
    }

    // Compute readiness score on every scheduler cycle
    try {
      await supabase.rpc("compute_ai_readiness");
    } catch (e) {
      console.error("Readiness score computation failed:", e);
    }

    return new Response(
      JSON.stringify({ triggered, total_due: (dueJobs || []).length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Scheduler error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Handle staleness guard: check AI health and trigger emergency refresh if STALE */
async function handleStalenessGuard(supabase: any, job: any, now: string): Promise<string> {
  const { data: health, error: healthErr } = await supabase.rpc("get_ai_system_health");
  if (healthErr) throw healthErr;

  if (health?.freshness_state !== "STALE") {
    return "skipped"; // Not stale, nothing to do
  }

  // Check if an investment_analysis job is already pending/running
  const { count } = await supabase
    .from("ai_jobs")
    .select("id", { count: "exact", head: true })
    .eq("job_type", "investment_analysis")
    .in("status", ["pending", "running"]);

  if ((count || 0) > 0) {
    return "skipped"; // Already running
  }

  // Trigger emergency refresh
  await supabase.from("ai_jobs").insert({
    job_type: "investment_analysis",
    status: "pending",
    payload: { triggered_from: "staleness_guard", emergency: true, triggered_at: now },
  });

  // Alert admin
  await supabase.from("admin_alerts").insert({
    type: "stale_intelligence",
    title: "🚨 Stale Intelligence Detected",
    message: `AI intelligence freshness is STALE (${health.hours_since_update?.toFixed(1)}h since last update). Emergency refresh triggered automatically.`,
    priority: "high",
    auto_generated: true,
    action_required: false,
    alert_category: "system",
    urgency_level: 3,
  });

  return "triggered";
}

/** Update a scheduled job on error, handle retry logic */
async function updateJobOnError(supabase: any, job: any, errorMessage: string) {
  const newRetryCount = (job.retry_count || 0) + 1;
  const maxRetries = job.max_retries || 3;

  if (newRetryCount >= maxRetries) {
    // Auto-disable and fire critical alert
    await supabase.from("ai_scheduled_jobs").update({
      enabled: false,
      retry_count: newRetryCount,
      last_error: errorMessage,
      last_status: "error",
    }).eq("id", job.id);

    await supabase.from("admin_alerts").insert({
      type: "schedule_disabled",
      title: "⛔ Schedule Auto-Disabled",
      message: `${job.name} has been disabled after ${maxRetries} consecutive failures. Last error: ${errorMessage}`,
      priority: "critical",
      auto_generated: true,
      action_required: true,
      alert_category: "system",
      urgency_level: 4,
    });
  } else {
    // Increment retry count
    await supabase.from("ai_scheduled_jobs").update({
      retry_count: newRetryCount,
      last_error: errorMessage,
      last_status: "error",
    }).eq("id", job.id);

    await supabase.from("admin_alerts").insert({
      type: "schedule_retry",
      title: "⚠️ Schedule Retry",
      message: `${job.name} failed (attempt ${newRetryCount}/${maxRetries}): ${errorMessage}`,
      priority: "medium",
      auto_generated: true,
      action_required: false,
      alert_category: "system",
      urgency_level: 2,
    });
  }
}

/**
 * Simple cron-to-next-run calculator.
 * Supports standard 5-field cron: minute hour day-of-month month day-of-week
 */
function calculateNextRun(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return new Date(Date.now() + 6 * 3600_000).toISOString();
  }

  const [minPart, hourPart] = parts;

  if (cron === "* * * * *") {
    return new Date(Date.now() + 60_000).toISOString();
  }

  // Every N minutes: */N * * * *
  const minMatch = minPart.match(/^\*\/(\d+)$/);
  if (minMatch && hourPart === "*") {
    const interval = parseInt(minMatch[1]) * 60_000;
    return new Date(Date.now() + interval).toISOString();
  }

  // Every N hours: 0 */N * * *
  const hourMatch = hourPart.match(/^\*\/(\d+)$/);
  if (hourMatch && minPart === "0") {
    const interval = parseInt(hourMatch[1]) * 3600_000;
    return new Date(Date.now() + interval).toISOString();
  }

  // Fixed minute every hour: M * * * *
  if (/^\d+$/.test(minPart) && hourPart === "*") {
    const now = new Date();
    const targetMin = parseInt(minPart);
    const next = new Date(now);
    next.setMinutes(targetMin, 0, 0);
    if (next <= now) next.setHours(next.getHours() + 1);
    return next.toISOString();
  }

  // Fixed hour: 0 H * * *
  if (/^\d+$/.test(hourPart) && /^\d+$/.test(minPart)) {
    const targetHour = parseInt(hourPart);
    const targetMin = parseInt(minPart);
    const now = new Date();
    const next = new Date(now);
    next.setHours(targetHour, targetMin, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  // Fallback: 6 hours
  return new Date(Date.now() + 6 * 3600_000).toISOString();
}
