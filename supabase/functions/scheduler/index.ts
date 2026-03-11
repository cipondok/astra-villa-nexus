import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Batch Scheduler Strategy ──
// ROI forecast → daily incremental (0 3 * * *)
// Deal analysis → every 6 hours (0 */6 * * *)
// Opportunity signals → real-time trigger (event-driven, not cron)
// Market hotspot index → daily full recompute (0 2 * * *)
// Predictive alerts → every 12 hours (0 */12 * * *)

// Anti-patterns prevented:
// 1. Duplicate execution → batch locks via acquire_batch_lock()
// 2. Cascading compute spikes → staggered execution with priority + max 3 concurrent
// 3. Queue starvation → priority ordering ensures high-priority jobs run first

const MAX_CONCURRENT_TRIGGERS = 3; // prevent cascade spikes

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

      try {
        // 1. Acquire batch lock to prevent duplicate execution
        const { data: locked } = await supabase.rpc("acquire_batch_lock", {
          p_job_type: job.job_type,
          p_ttl_minutes: 30,
        });

        if (!locked) {
          console.log(`Skipping ${job.job_type}: lock not acquired (already running)`);
          results.push({ id: job.id, job_type: job.job_type, status: "skipped_locked" });
          continue;
        }

        // 2. Check if a job of this type is already pending/running
        const { count: existingCount } = await supabase
          .from("ai_jobs")
          .select("id", { count: "exact", head: true })
          .eq("job_type", job.job_type)
          .in("status", ["pending", "running"]);

        if ((existingCount || 0) > 0) {
          await supabase.rpc("release_batch_lock", { p_job_type: job.job_type });
          results.push({ id: job.id, job_type: job.job_type, status: "skipped_duplicate" });
          continue;
        }

        // 3. Create the actual AI job via the job-worker
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

        // 4. Calculate next run time
        const nextRun = calculateNextRun(job.cron_expression);

        // 5. Update last_run_at and next_run_at
        await supabase
          .from("ai_scheduled_jobs")
          .update({
            last_run_at: now,
            next_run_at: nextRun,
          })
          .eq("id", job.id);

        // 6. Release lock (the job-worker will handle actual processing)
        await supabase.rpc("release_batch_lock", { p_job_type: job.job_type });

        results.push({ id: job.id, job_type: job.job_type, status: "triggered" });
        triggered++;
      } catch (err) {
        console.error(`Failed to trigger job ${job.id} (${job.job_type}):`, err);
        results.push({ id: job.id, job_type: job.job_type, status: "error" });
      }
    }

    // 7. Compute readiness score on every scheduler cycle
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
  const now = new Date();

  if (cron === "* * * * *") {
    return new Date(now.getTime() + 60_000).toISOString();
  }

  // Every N hours: 0 */N * * *
  const hourMatch = hourPart.match(/^\*\/(\d+)$/);
  if (hourMatch && minPart === "0") {
    const interval = parseInt(hourMatch[1]) * 3600_000;
    return new Date(now.getTime() + interval).toISOString();
  }

  // Fixed hour: 0 H * * *
  if (/^\d+$/.test(hourPart) && /^\d+$/.test(minPart)) {
    const targetHour = parseInt(hourPart);
    const targetMin = parseInt(minPart);
    const next = new Date(now);
    next.setHours(targetHour, targetMin, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  // Fallback: 6 hours
  return new Date(now.getTime() + 6 * 3600_000).toISOString();
}
