import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing config" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "process";

    // ── Create a new job ──
    if (action === "create") {
      const { job_type, payload, created_by } = body;
      if (!job_type) {
        return json({ error: "job_type required" }, 400);
      }

      const states: string[] = payload?.states || [];
      const tasks = states.map((state: string) => ({
        task_type: job_type,
        payload: { ...payload, state, states: undefined },
        status: "pending",
      }));

      // Insert job
      const { data: job, error: jobErr } = await supabase
        .from("ai_jobs")
        .insert({
          job_type,
          payload,
          total_tasks: Math.max(tasks.length, 1),
          created_by: created_by || null,
        })
        .select("id")
        .single();

      if (jobErr) return json({ error: jobErr.message }, 500);

      // Insert tasks
      if (tasks.length > 0) {
        const taskRows = tasks.map((t: any) => ({ ...t, job_id: job.id }));
        const { error: taskErr } = await supabase.from("ai_job_tasks").insert(taskRows);
        if (taskErr) {
          console.error("Task insert error:", taskErr.message);
        }
      }

      return json({ success: true, jobId: job.id, tasksCreated: tasks.length });
    }

    // ── Cancel a job ──
    if (action === "cancel") {
      const { job_id } = body;
      if (!job_id) return json({ error: "job_id required" }, 400);

      await supabase
        .from("ai_jobs")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", job_id)
        .in("status", ["pending", "running"]);

      await supabase
        .from("ai_job_tasks")
        .update({ status: "failed" })
        .eq("job_id", job_id)
        .eq("status", "pending");

      return json({ success: true, cancelled: job_id });
    }

    // ── Process next pending job ──
    // Fetch next pending job
    const { data: pendingJob } = await supabase
      .from("ai_jobs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!pendingJob) {
      // Also check for running jobs that may have stalled (>30min)
      return json({ message: "No pending jobs" });
    }

    // Mark as running
    await supabase
      .from("ai_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", pendingJob.id);

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("ai_job_tasks")
      .select("*")
      .eq("job_id", pendingJob.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    const allTasks = tasks || [];
    let completed = 0;
    let failed = 0;
    const MAX_FAILURES = Math.max(Math.ceil(allTasks.length * 0.5), 3);

    for (const task of allTasks) {
      if (failed >= MAX_FAILURES) break;

      // Mark task running
      await supabase
        .from("ai_job_tasks")
        .update({ status: "running" })
        .eq("id", task.id);

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

        completed++;
      } catch (e) {
        console.error(`Task ${task.id} failed:`, e);
        failed++;
        await supabase
          .from("ai_job_tasks")
          .update({
            status: "failed",
            result: { error: e instanceof Error ? e.message : "Unknown error" },
            completed_at: new Date().toISOString(),
          })
          .eq("id", task.id);
      }

      // Update job progress
      const totalDone = completed + failed;
      const progress = Math.round((totalDone / allTasks.length) * 100);
      await supabase
        .from("ai_jobs")
        .update({ progress, completed_tasks: totalDone })
        .eq("id", pendingJob.id);
    }

    // Finalize job
    const finalStatus = failed >= MAX_FAILURES ? "failed" : "completed";
    await supabase
      .from("ai_jobs")
      .update({
        status: finalStatus,
        progress: 100,
        completed_tasks: completed + failed,
        completed_at: new Date().toISOString(),
        error_message: failed > 0 ? `${failed} task(s) failed` : null,
      })
      .eq("id", pendingJob.id);

    return json({
      success: true,
      jobId: pendingJob.id,
      status: finalStatus,
      completed,
      failed,
    });
  } catch (error) {
    console.error("Job worker error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Worker failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
      "Content-Type": "application/json",
    },
  });
}
