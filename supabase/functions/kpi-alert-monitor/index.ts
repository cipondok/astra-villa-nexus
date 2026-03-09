import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface KPIComparison {
  metric: string;
  label: string;
  current: number;
  previous: number;
  deltaPct: number;
  threshold: number;
  breached: boolean;
  direction: "drop" | "spike";
}

async function loadConfig(supabase: any): Promise<Record<string, any>> {
  const defaults: Record<string, any> = {
    kpi_alert_email: "admin@astra-villa.com",
    kpi_alert_job_failure_threshold: 50,
    kpi_alert_property_drop_threshold: 30,
    kpi_alert_search_drop_threshold: 40,
    kpi_alert_price_drop_threshold: 15,
  };
  try {
    const { data } = await supabase
      .from("health_monitor_config")
      .select("key, value")
      .in("key", Object.keys(defaults));
    if (!data || data.length === 0) return defaults;
    const config = { ...defaults };
    for (const row of data) {
      const val = row.value;
      config[row.key] = typeof val === "string" ? val : typeof val === "number" ? val : Number(val) || defaults[row.key];
    }
    return config;
  } catch {
    return defaults;
  }
}

async function countRows(supabase: any, table: string, column: string, gte: string, lt?: string, filters?: Record<string, string>): Promise<number> {
  let q = supabase.from(table).select("id", { count: "exact", head: true }).gte(column, gte);
  if (lt) q = q.lt(column, lt);
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      q = q.eq(k, v);
    }
  }
  const { count } = await q;
  return count || 0;
}

async function getAvgPrice(supabase: any, gte: string, lt?: string): Promise<number> {
  let q = supabase.from("properties").select("price").not("price", "is", null).gte("created_at", gte);
  if (lt) q = q.lt("created_at", lt);
  const { data } = await q;
  if (!data || data.length === 0) return 0;
  return data.reduce((s: number, p: any) => s + (p.price || 0), 0) / data.length;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildEmailHtml(breached: KPIComparison[], allMetrics: KPIComparison[], timestamp: string): string {
  const rows = allMetrics.map(m => {
    const icon = m.breached ? "🚨" : "✅";
    const color = m.breached ? "#dc2626" : "#16a34a";
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-size: 13px;">${icon} ${m.label}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600;">${m.current.toLocaleString()}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">${m.previous.toLocaleString()}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; color: ${color}; font-weight: 600;">
          ${m.deltaPct > 0 ? "+" : ""}${m.deltaPct}%
        </td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">${m.direction === "drop" ? ">" : ">"} ${m.threshold}%</td>
      </tr>`;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 24px 28px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">⚠️ ASTRA Villa — KPI Alert</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">${breached.length} metric(s) exceeded threshold — ${timestamp}</p>
      </div>
      <div style="padding: 20px 28px;">
        <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">The following KPI metrics have breached their configured thresholds in the latest week-over-week / month-over-month comparison:</p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: left;">Metric</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: right;">Current</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: right;">Previous</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: right;">Change</th>
              <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: right;">Threshold</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://astra-villa-realty.lovable.app/admin-dashboard?section=ai-command-center"
             style="display: inline-block; padding: 10px 24px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
            Open AI Command Center →
          </a>
        </div>
      </div>
      <div style="padding: 14px 28px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center;">
          ASTRA Villa Realty — Automated KPI Alert System<br/>
          Configure thresholds in AI Command Center → System Health → Alert Thresholds
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const cfg = await loadConfig(supabase);
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const lastWeekStart = new Date(now.getTime() - 14 * 86400000).toISOString();
    const thisMonthStart = new Date(now.getTime() - 30 * 86400000).toISOString();
    const lastMonthStart = new Date(now.getTime() - 60 * 86400000).toISOString();

    // Compute WoW metrics
    const [
      propsThisWeek, propsLastWeek,
      jobsFailThisWeek, jobsFailLastWeek,
      searchThisWeek, searchLastWeek,
      avgPriceThisMonth, avgPriceLastMonth,
    ] = await Promise.all([
      countRows(supabase, "properties", "created_at", thisWeekStart),
      countRows(supabase, "properties", "created_at", lastWeekStart, thisWeekStart),
      countRows(supabase, "ai_jobs", "created_at", thisWeekStart, undefined, { status: "failed" }),
      countRows(supabase, "ai_jobs", "created_at", lastWeekStart, thisWeekStart, { status: "failed" }),
      countRows(supabase, "ai_property_queries", "created_at", thisWeekStart),
      countRows(supabase, "ai_property_queries", "created_at", lastWeekStart, thisWeekStart),
      getAvgPrice(supabase, thisMonthStart),
      getAvgPrice(supabase, lastMonthStart, thisMonthStart),
    ]);

    const metrics: KPIComparison[] = [
      {
        metric: "job_failures",
        label: "Job Failures (WoW)",
        current: jobsFailThisWeek,
        previous: jobsFailLastWeek,
        deltaPct: pctChange(jobsFailThisWeek, jobsFailLastWeek),
        threshold: Number(cfg.kpi_alert_job_failure_threshold),
        breached: false,
        direction: "spike",
      },
      {
        metric: "new_properties",
        label: "New Properties (WoW)",
        current: propsThisWeek,
        previous: propsLastWeek,
        deltaPct: pctChange(propsThisWeek, propsLastWeek),
        threshold: Number(cfg.kpi_alert_property_drop_threshold),
        breached: false,
        direction: "drop",
      },
      {
        metric: "search_volume",
        label: "Search Volume (WoW)",
        current: searchThisWeek,
        previous: searchLastWeek,
        deltaPct: pctChange(searchThisWeek, searchLastWeek),
        threshold: Number(cfg.kpi_alert_search_drop_threshold),
        breached: false,
        direction: "drop",
      },
      {
        metric: "avg_price",
        label: "Avg Property Price (MoM)",
        current: Math.round(avgPriceThisMonth),
        previous: Math.round(avgPriceLastMonth),
        deltaPct: pctChange(avgPriceThisMonth, avgPriceLastMonth),
        threshold: Number(cfg.kpi_alert_price_drop_threshold),
        breached: false,
        direction: "drop",
      },
    ];

    // Evaluate thresholds
    for (const m of metrics) {
      if (m.direction === "spike") {
        // Alert if increase exceeds threshold
        m.breached = m.deltaPct > m.threshold;
      } else {
        // Alert if drop exceeds threshold (deltaPct will be negative)
        m.breached = m.deltaPct < -m.threshold;
      }
    }

    const breached = metrics.filter(m => m.breached);
    let emailSent = false;
    const adminEmail = String(cfg.kpi_alert_email).replace(/"/g, "");

    if (breached.length > 0 && resendKey && adminEmail) {
      const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
      const html = buildEmailHtml(breached, metrics, timestamp);

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "ASTRA Villa Alerts <onboarding@resend.dev>",
            to: [adminEmail],
            subject: `⚠️ ASTRA KPI Alert: ${breached.length} metric(s) breached threshold`,
            html,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("[KPI-ALERT] Email sent to", adminEmail);
        } else {
          const err = await emailRes.text();
          console.error("[KPI-ALERT] Email failed:", err);
        }
      } catch (emailErr) {
        console.error("[KPI-ALERT] Email error:", emailErr);
      }

      // Log alerts to kpi_alert_log
      for (const m of breached) {
        try {
          await supabase.from("kpi_alert_log").insert({
            alert_type: m.direction === "spike" ? "kpi_spike" : "kpi_drop",
            metric_name: m.metric,
            current_value: m.current,
            previous_value: m.previous,
            delta_percent: m.deltaPct,
            threshold_percent: m.threshold,
            period: m.metric === "avg_price" ? "mom" : "wow",
            severity: Math.abs(m.deltaPct) > m.threshold * 2 ? "critical" : "warning",
            message: `${m.label}: ${m.deltaPct > 0 ? "+" : ""}${m.deltaPct}% (threshold: ${m.direction === "drop" ? "-" : "+"}${m.threshold}%)`,
            email_sent_to: emailSent ? adminEmail : null,
          });
        } catch {
          // Table may not exist yet
        }
      }
    }

    const result = {
      metricsChecked: metrics.length,
      breachedCount: breached.length,
      emailSent,
      emailTo: breached.length > 0 ? adminEmail : null,
      metrics: metrics.map(m => ({
        metric: m.metric,
        label: m.label,
        current: m.current,
        previous: m.previous,
        deltaPct: m.deltaPct,
        threshold: m.threshold,
        breached: m.breached,
      })),
      timestamp: now.toISOString(),
    };

    console.log("[KPI-ALERT] Complete:", JSON.stringify(result));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[KPI-ALERT] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
