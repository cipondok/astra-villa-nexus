import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportCase {
  id: string;
  case_id: string;
  user_id: string | null;
  issue_type: string;
  status: string;
  priority: string;
  conflict_detected: boolean;
  confidence_score: number | null;
  created_at: string;
  resolved_at: string | null;
}

interface AlertPayload {
  alert_type: string;
  severity: string;
  affected_area: string;
  title: string;
  message: string;
  recommended_action: string;
  alert_hash: string;
  group_key: string;
  notification_message: string;
  notification_channels: {
    whatsapp: string;
    telegram: string;
    email: { subject: string; body: string };
  };
}

function computeHash(type: string, area: string, dateKey: string): string {
  return `${type}:${area}:${dateKey}`;
}

function formatNotification(alert: { severity: string; title: string; message: string; affected_area: string; recommended_action: string }): {
  plain: string;
  whatsapp: string;
  telegram: string;
  email: { subject: string; body: string };
} {
  const plain = `🚨 ASTRA ALERT [${alert.severity.toUpperCase()}]\n${alert.title}\nArea: ${alert.affected_area}\n${alert.message}\nAction: ${alert.recommended_action}`;

  const whatsapp = `🚨 *ASTRA ALERT* [${alert.severity.toUpperCase()}]\n\n*${alert.title}*\nArea: ${alert.affected_area}\n${alert.message}\n\n✅ *Action:* ${alert.recommended_action}`;

  const telegram = `🚨 <b>ASTRA ALERT</b> [${alert.severity.toUpperCase()}]\n\n<b>${alert.title}</b>\nArea: ${alert.affected_area}\n${alert.message}\n\n✅ <b>Action:</b> ${alert.recommended_action}`;

  const email = {
    subject: `[ASTRA ${alert.severity.toUpperCase()}] ${alert.title}`,
    body: `<h2>🚨 ASTRA Support Alert</h2>
<p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
<p><strong>Area:</strong> ${alert.affected_area}</p>
<p>${alert.message}</p>
<p><strong>Recommended Action:</strong> ${alert.recommended_action}</p>
<hr><p style="color:#666;font-size:12px;">ASTRA Villa Intelligence System</p>`,
  };

  return { plain, whatsapp, telegram, email };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: cases, error: casesError } = await supabase
      .from("support_cases")
      .select("*")
      .gte("created_at", fourteenDaysAgo)
      .order("created_at", { ascending: true });

    if (casesError) throw casesError;
    const allCases: SupportCase[] = cases || [];

    // ── ANALYSIS ──
    const predictions = analyzeTrends(allCases);
    const riskSignals = detectRisks(allCases);
    const smartAlerts = generateAlerts(allCases, riskSignals);

    // Persist predictions
    if (predictions.length > 0) {
      await supabase.from("support_predictions").update({ is_active: false }).eq("is_active", true);
      await supabase.from("support_predictions").insert(predictions);
    }

    if (riskSignals.length > 0) {
      await supabase.from("support_risk_signals").insert(riskSignals);
    }

    // Persist alerts with dedup via alert_hash (upsert ignores duplicates)
    let alertsCreated = 0;
    if (smartAlerts.length > 0) {
      for (const alert of smartAlerts) {
        const { error: insertError } = await supabase
          .from("support_smart_alerts")
          .insert(alert);
        if (!insertError) alertsCreated++;
        // Duplicate hash errors are silently ignored
      }
    }

    // Summary
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCases = allCases.filter((c) => new Date(c.created_at) >= sevenDaysAgo);
    const totalRecent = recentCases.length;
    const conflicts = recentCases.filter((c) => c.conflict_detected).length;
    const resolved = recentCases.filter((c) => c.status === "resolved").length;
    const conflictRate = totalRecent > 0 ? (conflicts / totalRecent) * 100 : 0;

    const summary = {
      system_health: {
        total_cases_7d: totalRecent,
        conflict_rate: conflictRate,
        resolution_rate: totalRecent > 0 ? (resolved / totalRecent) * 100 : 0,
        health_grade: totalRecent === 0 ? "A" : conflictRate > 30 ? "D" : conflictRate > 15 ? "C" : conflictRate > 5 ? "B" : "A",
      },
      predictions_generated: predictions.length,
      risk_signals_detected: riskSignals.length,
      alerts_created: alertsCreated,
      predictions,
      risk_signals: riskSignals,
      smart_alerts: smartAlerts,
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Support intelligence error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── TREND ANALYSIS ──
function analyzeTrends(cases: SupportCase[]) {
  const predictions: any[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentCases = cases.filter((c) => new Date(c.created_at) >= sevenDaysAgo);
  const olderCases = cases.filter((c) => new Date(c.created_at) >= fourteenDaysAgo && new Date(c.created_at) < sevenDaysAgo);

  const issueTypes = ["payment", "kyc", "document", "escrow"];
  for (const issueType of issueTypes) {
    const recentCount = recentCases.filter((c) => c.issue_type?.toLowerCase() === issueType).length;
    const olderCount = olderCases.filter((c) => c.issue_type?.toLowerCase() === issueType).length;

    if (olderCount > 0 && recentCount > olderCount * 1.5) {
      const growthRate = ((recentCount - olderCount) / olderCount) * 100;
      const severity = growthRate > 100 ? "high" : growthRate > 50 ? "medium" : "low";
      predictions.push({
        prediction_type: "trend_spike",
        affected_area: issueType,
        severity,
        confidence_score: Math.min(95, 60 + growthRate / 5),
        prediction_text: `Rising trend in ${issueType}-related cases (+${growthRate.toFixed(0)}% WoW). May escalate in 24–48h.`,
        data_points: { recent_count: recentCount, previous_count: olderCount, growth_pct: growthRate },
        expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  const recentConflicts = recentCases.filter((c) => c.conflict_detected).length;
  const olderConflicts = olderCases.filter((c) => c.conflict_detected).length;
  const recentConflictRate = recentCases.length > 0 ? recentConflicts / recentCases.length : 0;
  const olderConflictRate = olderCases.length > 0 ? olderConflicts / olderCases.length : 0;

  if (recentConflictRate > olderConflictRate * 1.3 && recentConflictRate > 0.1) {
    predictions.push({
      prediction_type: "bottleneck",
      affected_area: "system_sync",
      severity: recentConflictRate > 0.3 ? "high" : "medium",
      confidence_score: Math.min(90, 55 + recentConflictRate * 100),
      prediction_text: `Sync conflict rate at ${(recentConflictRate * 100).toFixed(1)}%. Potential infrastructure bottleneck.`,
      data_points: { current_rate: recentConflictRate, previous_rate: olderConflictRate },
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  const openRecent = recentCases.filter((c) => c.status !== "resolved").length;
  if (recentCases.length > 0 && openRecent / recentCases.length > 0.6) {
    predictions.push({
      prediction_type: "bottleneck",
      affected_area: "resolution_pipeline",
      severity: "high",
      confidence_score: 75,
      prediction_text: `${((openRecent / recentCases.length) * 100).toFixed(0)}% of recent cases unresolved. Pipeline may be overwhelmed.`,
      data_points: { open_count: openRecent, total: recentCases.length },
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return predictions;
}

// ── FRAUD & RISK ──
function detectRisks(cases: SupportCase[]) {
  const signals: any[] = [];
  const userCases: Record<string, SupportCase[]> = {};
  for (const c of cases) {
    if (!c.user_id) continue;
    if (!userCases[c.user_id]) userCases[c.user_id] = [];
    userCases[c.user_id].push(c);
  }

  for (const [userId, uCases] of Object.entries(userCases)) {
    const conflictCases = uCases.filter((c) => c.conflict_detected);
    if (conflictCases.length >= 3) {
      const paymentConflicts = conflictCases.filter((c) => c.issue_type?.toLowerCase() === "payment");
      const riskLevel = paymentConflicts.length >= 3 ? "high" : conflictCases.length >= 5 ? "high" : "medium";

      signals.push({
        user_id: userId,
        risk_type: paymentConflicts.length >= 2 ? "false_claim" : "repeated_abuse",
        risk_level: riskLevel,
        description: paymentConflicts.length >= 2
          ? `Potential false payment claim: ${paymentConflicts.length} payment conflicts in 14d.`
          : `Repeated suspicious activity: ${conflictCases.length} conflicts in 14d.`,
        evidence: { total_cases: uCases.length, conflict_cases: conflictCases.length, payment_conflicts: paymentConflicts.length, case_ids: conflictCases.map((c) => c.case_id) },
        related_case_ids: conflictCases.map((c) => c.case_id),
      });
    }

    const sortedCases = [...uCases].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sortedCases.length >= 5) {
      const hourSpan = (new Date(sortedCases[sortedCases.length - 1].created_at).getTime() - new Date(sortedCases[0].created_at).getTime()) / (1000 * 60 * 60);
      if (hourSpan < 24) {
        signals.push({
          user_id: userId,
          risk_type: "anomaly",
          risk_level: "medium",
          description: `Unusual pattern: ${sortedCases.length} cases within ${hourSpan.toFixed(1)}h.`,
          evidence: { case_count: sortedCases.length, time_span_hours: hourSpan },
          related_case_ids: sortedCases.map((c) => c.case_id),
        });
      }
    }
  }

  return signals;
}

// ── SMART ALERTS with dedup + notification formatting ──
function generateAlerts(cases: SupportCase[], riskSignals: any[]): AlertPayload[] {
  const alerts: AlertPayload[] = [];
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD for daily dedup
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent24h = cases.filter((c) => new Date(c.created_at) >= last24h);

  // Volume surge
  const last48hStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const prev24h = cases.filter((c) => new Date(c.created_at) >= last48hStart && new Date(c.created_at) < last24h);
  if (prev24h.length > 0 && recent24h.length > prev24h.length * 2) {
    const a = {
      alert_type: "volume_surge",
      severity: "high",
      affected_area: "system",
      title: "Case Volume Surge Detected",
      message: `Cases doubled in 24h: ${recent24h.length} vs ${prev24h.length} previous.`,
      recommended_action: "Check system health, review deployments, verify sync services.",
    };
    const notif = formatNotification(a);
    alerts.push({
      ...a,
      alert_hash: computeHash("volume_surge", "system", dateKey),
      group_key: "volume_surge",
      notification_message: notif.plain,
      notification_channels: { whatsapp: notif.whatsapp, telegram: notif.telegram, email: notif.email },
    });
  }

  // High conflict rate (>25%)
  const recentConflicts = recent24h.filter((c) => c.conflict_detected).length;
  const conflictRate = recent24h.length > 0 ? recentConflicts / recent24h.length : 0;
  if (conflictRate > 0.25 && recent24h.length >= 3) {
    const a = {
      alert_type: "conflict_spike",
      severity: conflictRate > 0.5 ? "high" : "high",
      affected_area: "payment",
      title: "High Conflict Rate Alert",
      message: `${(conflictRate * 100).toFixed(0)}% conflict rate in last 24h (${recentConflicts}/${recent24h.length} cases).`,
      recommended_action: "Check escrow sync immediately. Verify payment gateway webhooks.",
    };
    const notif = formatNotification(a);
    alerts.push({
      ...a,
      alert_hash: computeHash("conflict_spike", "payment", dateKey),
      group_key: "conflict_spike",
      notification_message: notif.plain,
      notification_channels: { whatsapp: notif.whatsapp, telegram: notif.telegram, email: notif.email },
    });
  }

  // Category concentration (>60%)
  const categoryCount: Record<string, number> = {};
  for (const c of recent24h) {
    const t = (c.issue_type || "other").toLowerCase();
    categoryCount[t] = (categoryCount[t] || 0) + 1;
  }
  for (const [category, count] of Object.entries(categoryCount)) {
    if (recent24h.length >= 5 && count / recent24h.length > 0.6) {
      const a = {
        alert_type: "category_repeat",
        severity: "medium",
        affected_area: category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Issues Dominating`,
        message: `${count}/${recent24h.length} cases (${((count / recent24h.length) * 100).toFixed(0)}%) are ${category}-related.`,
        recommended_action: `Investigate ${category} subsystem for root cause.`,
      };
      const notif = formatNotification(a);
      alerts.push({
        ...a,
        alert_hash: computeHash("category_repeat", category, dateKey),
        group_key: `category_${category}`,
        notification_message: notif.plain,
        notification_channels: { whatsapp: notif.whatsapp, telegram: notif.telegram, email: notif.email },
      });
    }
  }

  // High-risk users
  const highRiskSignals = riskSignals.filter((r) => r.risk_level === "high");
  if (highRiskSignals.length > 0) {
    const a = {
      alert_type: "risk_user",
      severity: "high",
      affected_area: "fraud",
      title: `${highRiskSignals.length} High-Risk User(s) Flagged`,
      message: `Fraud detection flagged ${highRiskSignals.length} high-risk user(s) with suspicious patterns.`,
      recommended_action: "Review flagged users in Risk Signals panel immediately.",
    };
    const notif = formatNotification(a);
    alerts.push({
      ...a,
      alert_hash: computeHash("risk_user", "fraud", dateKey),
      group_key: "risk_user",
      notification_message: notif.plain,
      notification_channels: { whatsapp: notif.whatsapp, telegram: notif.telegram, email: notif.email },
    });
  }

  return alerts;
}
