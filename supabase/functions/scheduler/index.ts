import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const results: { id: string; status: string }[] = [];

    for (const job of dueJobs || []) {
      try {
        // Create the actual AI job via the job-worker
        const { error: invokeErr } = await supabase.functions.invoke("job-worker", {
          body: {
            action: "create",
            job_type: job.job_type,
            payload: job.payload || {},
            created_by: job.created_by,
            priority: job.priority,
          },
        });

        if (invokeErr) throw invokeErr;

        // Calculate next run time
        const nextRun = calculateNextRun(job.cron_expression);

        // Update last_run_at and next_run_at
        await supabase
          .from("ai_scheduled_jobs")
          .update({
            last_run_at: now,
            next_run_at: nextRun,
          })
          .eq("id", job.id);

        results.push({ id: job.id, status: "triggered" });
      } catch (err) {
        console.error(`Failed to trigger job ${job.id}:`, err);
        results.push({ id: job.id, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({ triggered: results.length, results }),
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
    // Fallback: 6 hours from now
    return new Date(Date.now() + 6 * 3600_000).toISOString();
  }

  const [minPart, hourPart] = parts;
  const now = new Date();

  // Handle common patterns
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
