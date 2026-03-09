import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STALLED_THRESHOLD_MINUTES = 30;
const FAILURE_RATE_THRESHOLD = 20; // percent
const ALERT_COOLDOWN_HOURS = 4;

interface HealthAlert {
  alert_type: string;
  alert_key: string;
  severity: "warning" | "critical";
  message: string;
  metadata: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const alerts: HealthAlert[] = [];

    // ── Check 1: Stalled jobs (running > 30 min) ──
    const stalledCutoff = new Date(Date.now() - STALLED_THRESHOLD_MINUTES * 60_000).toISOString();
    const { data: stalledJobs } = await supabase
      .from("ai_jobs")
      .select("id, job_type, started_at")
      .eq("status", "running")
      .lt("started_at", stalledCutoff);

    if (stalledJobs && stalledJobs.length > 0) {
      alerts.push({
        alert_type: "stalled_jobs",
        alert_key: `stalled_${stalledJobs.length}`,
        severity: stalledJobs.length >= 3 ? "critical" : "warning",
        message: `${stalledJobs.length} AI job(s) stalled for over ${STALLED_THRESHOLD_MINUTES} minutes`,
        metadata: { job_ids: stalledJobs.map((j: any) => j.id), count: stalledJobs.length },
      });
    }

    // ── Check 2: Recent job failures ──
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { data: recentJobs } = await supabase
      .from("ai_jobs")
      .select("id, status")
      .gte("created_at", oneHourAgo);

    if (recentJobs && recentJobs.length >= 5) {
      const failedCount = recentJobs.filter((j: any) => j.status === "failed").length;
      const failureRate = (failedCount / recentJobs.length) * 100;
      if (failureRate >= FAILURE_RATE_THRESHOLD) {
        alerts.push({
          alert_type: "high_failure_rate",
          alert_key: `failure_rate_${Math.round(failureRate)}`,
          severity: failureRate >= 50 ? "critical" : "warning",
          message: `Job failure rate is ${Math.round(failureRate)}% (${failedCount}/${recentJobs.length}) in the last hour`,
          metadata: { failureRate: Math.round(failureRate), failedCount, totalJobs: recentJobs.length },
        });
      }
    }

    // ── Check 3: Failed tasks with max retries ──
    const { data: exhaustedTasks } = await supabase
      .from("ai_job_tasks")
      .select("id, job_id, task_type")
      .eq("status", "failed")
      .gte("retry_count", 3)
      .gte("created_at", oneHourAgo)
      .limit(20);

    if (exhaustedTasks && exhaustedTasks.length > 0) {
      alerts.push({
        alert_type: "exhausted_retries",
        alert_key: `retries_${exhaustedTasks.length}`,
        severity: exhaustedTasks.length >= 5 ? "critical" : "warning",
        message: `${exhaustedTasks.length} task(s) failed after maximum retries in the last hour`,
        metadata: { task_ids: exhaustedTasks.map((t: any) => t.id), count: exhaustedTasks.length },
      });
    }

    // ── Check 4: Edge function health ──
    const edgeFunctions = ["core-engine", "job-worker"];
    for (const fnName of edgeFunctions) {
      try {
        const start = Date.now();
        const { error } = await supabase.functions.invoke(fnName, {
          body: { healthCheck: true },
        });
        const latency = Date.now() - start;

        if (error && !error.message?.includes("Invalid mode")) {
          alerts.push({
            alert_type: "edge_function_down",
            alert_key: `ef_${fnName}`,
            severity: "critical",
            message: `Edge function '${fnName}' is not responding: ${error.message}`,
            metadata: { function: fnName, error: error.message, latencyMs: latency },
          });
        } else if (latency > 10_000) {
          alerts.push({
            alert_type: "edge_function_slow",
            alert_key: `ef_slow_${fnName}`,
            severity: "warning",
            message: `Edge function '${fnName}' is responding slowly (${latency}ms)`,
            metadata: { function: fnName, latencyMs: latency },
          });
        }
      } catch (err) {
        alerts.push({
          alert_type: "edge_function_down",
          alert_key: `ef_${fnName}`,
          severity: "critical",
          message: `Edge function '${fnName}' unreachable: ${err.message}`,
          metadata: { function: fnName },
        });
      }
    }

    // ── Check 5: Database connectivity ──
    try {
      const start = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const latency = Date.now() - start;
      if (error) {
        alerts.push({
          alert_type: "db_error",
          alert_key: "db_connectivity",
          severity: "critical",
          message: `Database query failed: ${error.message}`,
          metadata: { latencyMs: latency },
        });
      } else if (latency > 5000) {
        alerts.push({
          alert_type: "db_slow",
          alert_key: "db_latency",
          severity: "warning",
          message: `Database responding slowly (${latency}ms)`,
          metadata: { latencyMs: latency },
        });
      }
    } catch (err) {
      alerts.push({
        alert_type: "db_error",
        alert_key: "db_connectivity",
        severity: "critical",
        message: `Database unreachable: ${err.message}`,
        metadata: {},
      });
    }

    // ── Process alerts: dedup, log, notify ──
    const processedAlerts: string[] = [];

    for (const alert of alerts) {
      // Check cooldown: skip if unresolved alert of same type+key exists within cooldown
      const cooldownCutoff = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 3600_000).toISOString();
      const { data: existing } = await supabase
        .from("health_alert_log")
        .select("id")
        .eq("alert_type", alert.alert_type)
        .eq("alert_key", alert.alert_key)
        .eq("resolved", false)
        .gte("created_at", cooldownCutoff)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[HEALTH-MONITOR] Skipping duplicate alert: ${alert.alert_type}/${alert.alert_key}`);
        continue;
      }

      // Log the alert
      await supabase.from("health_alert_log").insert({
        alert_type: alert.alert_type,
        alert_key: alert.alert_key,
        severity: alert.severity,
        message: alert.message,
        metadata: alert.metadata,
      });

      // ── In-app notification to all admins ──
      const { data: adminUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin: any) => ({
          user_id: admin.user_id,
          title: alert.severity === "critical"
            ? `🚨 CRITICAL: ${alert.message}`
            : `⚠️ Warning: ${alert.message}`,
          message: `System health alert detected. Type: ${alert.alert_type}. Check the AI Command Center for details.`,
          type: "system_alert",
          is_read: false,
          metadata: { alert_type: alert.alert_type, severity: alert.severity, ...alert.metadata },
        }));

        await supabase.from("in_app_notifications").insert(notifications);
      }

      // ── Email notification to admins (critical only) ──
      if (alert.severity === "critical" && adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
            if (userData?.user?.email) {
              await supabase.functions.invoke("notification-engine", {
                body: {
                  action: "send_email",
                  to: userData.user.email,
                  subject: `🚨 ASTRA Villa System Alert: ${alert.alert_type}`,
                  template: "system_health_alert",
                  variables: {
                    alert_type: alert.alert_type,
                    severity: alert.severity.toUpperCase(),
                    message: alert.message,
                    details: JSON.stringify(alert.metadata, null, 2),
                    timestamp: new Date().toISOString(),
                    dashboard_url: "https://astra-villa-realty.lovable.app/admin-dashboard?section=ai-command-center",
                  },
                  skipAuth: true,
                },
              });
            }
          } catch (emailErr) {
            console.error(`[HEALTH-MONITOR] Email failed for admin ${admin.user_id}:`, emailErr);
          }
        }
      }

      processedAlerts.push(`${alert.severity}: ${alert.message}`);
    }

    // ── Auto-resolve old alerts that no longer apply ──
    if (!stalledJobs || stalledJobs.length === 0) {
      await supabase
        .from("health_alert_log")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("alert_type", "stalled_jobs")
        .eq("resolved", false);
    }

    const result = {
      checksRun: 5,
      alertsDetected: alerts.length,
      alertsNotified: processedAlerts.length,
      alerts: processedAlerts,
      timestamp: new Date().toISOString(),
    };

    console.log("[HEALTH-MONITOR] Complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[HEALTH-MONITOR] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
