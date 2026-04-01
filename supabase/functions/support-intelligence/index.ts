import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

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
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
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

    // Fetch last 14 days of cases for trend analysis
    const fourteenDaysAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: cases, error: casesError } = await supabase
      .from("support_cases")
      .select("*")
      .gte("created_at", fourteenDaysAgo)
      .order("created_at", { ascending: true });

    if (casesError) throw casesError;
    const allCases: SupportCase[] = cases || [];

    // ── PREDICTIVE ANALYSIS ──
    const predictions = analyzeTrends(allCases);

    // ── FRAUD & RISK DETECTION ──
    const riskSignals = detectRisks(allCases);

    // ── SMART ALERTS ──
    const smartAlerts = generateAlerts(allCases, predictions, riskSignals);

    // Persist results
    if (predictions.length > 0) {
      // Deactivate old predictions
      await supabase
        .from("support_predictions")
        .update({ is_active: false })
        .eq("is_active", true);

      await supabase.from("support_predictions").insert(predictions);
    }

    if (riskSignals.length > 0) {
      await supabase.from("support_risk_signals").insert(riskSignals);
    }

    if (smartAlerts.length > 0) {
      await supabase.from("support_smart_alerts").insert(smartAlerts);
    }

    // Build summary
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCases = allCases.filter(
      (c) => new Date(c.created_at) >= sevenDaysAgo
    );
    const totalRecent = recentCases.length;
    const conflicts = recentCases.filter((c) => c.conflict_detected).length;
    const resolved = recentCases.filter((c) => c.status === "resolved").length;

    const summary = {
      system_health: {
        total_cases_7d: totalRecent,
        conflict_rate: totalRecent > 0 ? (conflicts / totalRecent) * 100 : 0,
        resolution_rate: totalRecent > 0 ? (resolved / totalRecent) * 100 : 0,
        health_grade:
          totalRecent === 0
            ? "A"
            : conflicts / totalRecent > 0.3
              ? "D"
              : conflicts / totalRecent > 0.15
                ? "C"
                : conflicts / totalRecent > 0.05
                  ? "B"
                  : "A",
      },
      predictions_generated: predictions.length,
      risk_signals_detected: riskSignals.length,
      alerts_created: smartAlerts.length,
      predictions,
      risk_signals: riskSignals,
      smart_alerts: smartAlerts,
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Support intelligence error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ── TREND ANALYSIS ──
function analyzeTrends(cases: SupportCase[]) {
  const predictions: any[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentCases = cases.filter(
    (c) => new Date(c.created_at) >= sevenDaysAgo
  );
  const olderCases = cases.filter(
    (c) =>
      new Date(c.created_at) >= fourteenDaysAgo &&
      new Date(c.created_at) < sevenDaysAgo
  );

  // Per-issue-type trend analysis
  const issueTypes = ["payment", "kyc", "document", "escrow"];
  for (const issueType of issueTypes) {
    const recentCount = recentCases.filter(
      (c) => c.issue_type?.toLowerCase() === issueType
    ).length;
    const olderCount = olderCases.filter(
      (c) => c.issue_type?.toLowerCase() === issueType
    ).length;

    if (olderCount > 0 && recentCount > olderCount * 1.5) {
      const growthRate = ((recentCount - olderCount) / olderCount) * 100;
      const severity = growthRate > 100 ? "high" : growthRate > 50 ? "medium" : "low";
      predictions.push({
        prediction_type: "trend_spike",
        affected_area: issueType,
        severity,
        confidence_score: Math.min(95, 60 + growthRate / 5),
        prediction_text: `Rising trend in ${issueType}-related cases (+${growthRate.toFixed(0)}% week-over-week). This may escalate in the next 24–48 hours if not addressed.`,
        data_points: {
          recent_count: recentCount,
          previous_count: olderCount,
          growth_pct: growthRate,
        },
        expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  // Conflict rate trend
  const recentConflicts = recentCases.filter((c) => c.conflict_detected).length;
  const olderConflicts = olderCases.filter((c) => c.conflict_detected).length;
  const recentConflictRate =
    recentCases.length > 0 ? recentConflicts / recentCases.length : 0;
  const olderConflictRate =
    olderCases.length > 0 ? olderConflicts / olderCases.length : 0;

  if (recentConflictRate > olderConflictRate * 1.3 && recentConflictRate > 0.1) {
    predictions.push({
      prediction_type: "bottleneck",
      affected_area: "system_sync",
      severity: recentConflictRate > 0.3 ? "high" : "medium",
      confidence_score: Math.min(90, 55 + recentConflictRate * 100),
      prediction_text: `System sync conflict rate has increased to ${(recentConflictRate * 100).toFixed(1)}%. Potential sync infrastructure bottleneck developing.`,
      data_points: {
        current_rate: recentConflictRate,
        previous_rate: olderConflictRate,
      },
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Unresolved backlog trend
  const openRecent = recentCases.filter((c) => c.status !== "resolved").length;
  if (recentCases.length > 0 && openRecent / recentCases.length > 0.6) {
    predictions.push({
      prediction_type: "bottleneck",
      affected_area: "resolution_pipeline",
      severity: "high",
      confidence_score: 75,
      prediction_text: `${((openRecent / recentCases.length) * 100).toFixed(0)}% of recent cases remain unresolved. Resolution pipeline may be overwhelmed.`,
      data_points: { open_count: openRecent, total: recentCases.length },
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return predictions;
}

// ── FRAUD & RISK DETECTION ──
function detectRisks(cases: SupportCase[]) {
  const signals: any[] = [];

  // Group by user_id
  const userCases: Record<string, SupportCase[]> = {};
  for (const c of cases) {
    if (!c.user_id) continue;
    if (!userCases[c.user_id]) userCases[c.user_id] = [];
    userCases[c.user_id].push(c);
  }

  for (const [userId, uCases] of Object.entries(userCases)) {
    // Repeated conflict claims from same user
    const conflictCases = uCases.filter((c) => c.conflict_detected);
    if (conflictCases.length >= 3) {
      const paymentConflicts = conflictCases.filter(
        (c) => c.issue_type?.toLowerCase() === "payment"
      );
      const riskLevel =
        paymentConflicts.length >= 3
          ? "high"
          : conflictCases.length >= 5
            ? "high"
            : "medium";

      signals.push({
        user_id: userId,
        risk_type:
          paymentConflicts.length >= 2 ? "false_claim" : "repeated_abuse",
        risk_level: riskLevel,
        description:
          paymentConflicts.length >= 2
            ? `Potential false payment claim detected: User has ${paymentConflicts.length} payment-related conflict cases in 14 days.`
            : `Repeated suspicious activity from same user: ${conflictCases.length} conflict cases in 14 days.`,
        evidence: {
          total_cases: uCases.length,
          conflict_cases: conflictCases.length,
          payment_conflicts: paymentConflicts.length,
          case_ids: conflictCases.map((c) => c.case_id),
        },
        related_case_ids: conflictCases.map((c) => c.case_id),
      });
    }

    // Rapid-fire cases (many cases in short window = potential abuse)
    const sortedCases = [...uCases].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    if (sortedCases.length >= 5) {
      const first = new Date(sortedCases[0].created_at).getTime();
      const last = new Date(
        sortedCases[sortedCases.length - 1].created_at
      ).getTime();
      const hourSpan = (last - first) / (1000 * 60 * 60);
      if (hourSpan < 24 && sortedCases.length >= 5) {
        signals.push({
          user_id: userId,
          risk_type: "anomaly",
          risk_level: "medium",
          description: `Unusual activity pattern: ${sortedCases.length} cases created within ${hourSpan.toFixed(1)} hours.`,
          evidence: {
            case_count: sortedCases.length,
            time_span_hours: hourSpan,
          },
          related_case_ids: sortedCases.map((c) => c.case_id),
        });
      }
    }
  }

  return signals;
}

// ── SMART ALERTS ──
function generateAlerts(
  cases: SupportCase[],
  predictions: any[],
  riskSignals: any[]
) {
  const alerts: any[] = [];
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent24h = cases.filter((c) => new Date(c.created_at) >= last24h);

  // Volume surge alert
  const last48hStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const prev24h = cases.filter(
    (c) =>
      new Date(c.created_at) >= last48hStart &&
      new Date(c.created_at) < last24h
  );
  if (prev24h.length > 0 && recent24h.length > prev24h.length * 2) {
    alerts.push({
      alert_type: "volume_surge",
      severity: "high",
      affected_area: "system",
      title: "Case Volume Surge Detected",
      message: `Support cases doubled in last 24h: ${recent24h.length} cases vs ${prev24h.length} previous day.`,
      recommended_action:
        "Check system health, review recent deployments, and verify sync services.",
    });
  }

  // Conflict spike
  const recentConflicts = recent24h.filter((c) => c.conflict_detected).length;
  const conflictRate =
    recent24h.length > 0 ? recentConflicts / recent24h.length : 0;
  if (conflictRate > 0.25 && recent24h.length >= 3) {
    alerts.push({
      alert_type: "conflict_spike",
      severity: conflictRate > 0.5 ? "high" : "medium",
      affected_area: "system_sync",
      title: "High Conflict Rate Alert",
      message: `${(conflictRate * 100).toFixed(0)}% of cases in last 24h have conflicts. Recommend checking escrow sync system.`,
      recommended_action:
        "Inspect escrow sync pipeline, verify payment gateway webhooks, check KYC verification service.",
    });
  }

  // Category concentration
  const categoryCount: Record<string, number> = {};
  for (const c of recent24h) {
    const t = (c.issue_type || "other").toLowerCase();
    categoryCount[t] = (categoryCount[t] || 0) + 1;
  }
  for (const [category, count] of Object.entries(categoryCount)) {
    if (recent24h.length >= 5 && count / recent24h.length > 0.6) {
      alerts.push({
        alert_type: "category_repeat",
        severity: "medium",
        affected_area: category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Issues Dominating`,
        message: `${count} of ${recent24h.length} cases (${((count / recent24h.length) * 100).toFixed(0)}%) are ${category}-related. Possible systemic issue.`,
        recommended_action: `Investigate ${category} subsystem for root cause.`,
      });
    }
  }

  // High-risk user alerts from risk signals
  const highRiskSignals = riskSignals.filter((r) => r.risk_level === "high");
  if (highRiskSignals.length > 0) {
    alerts.push({
      alert_type: "risk_user",
      severity: "high",
      affected_area: "fraud",
      title: `${highRiskSignals.length} High-Risk User(s) Flagged`,
      message: `Fraud detection identified ${highRiskSignals.length} high-risk user(s) with suspicious patterns.`,
      recommended_action:
        "Review flagged users in Risk Signals panel and take appropriate action.",
    });
  }

  return alerts;
}
