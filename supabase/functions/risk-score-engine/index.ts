import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Signal weights for risk scoring
const SIGNAL_WEIGHTS: Record<string, number> = {
  failed_login: 3,
  new_country_login: 8,
  tor_vpn_detected: 15,
  impossible_travel: 12,
  escrow_dispute: 20,
  escrow_cancellation: 10,
  payment_reversal: 25,
  rapid_listing_creation: 7,
  price_manipulation: 15,
  fake_listing_report: 12,
  suspicious_device: 5,
  disposable_email: 10,
  multiple_accounts_ip: 8,
  high_refund_ratio: 18,
  bulk_deposit_pattern: 14,
};

const SEVERITY_MULTIPLIER: Record<string, number> = {
  low: 0.5,
  medium: 1,
  high: 2,
  critical: 3,
};

// Time decay: signals older than 90 days have reduced impact
function timeDecayFactor(createdAt: string): number {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 7) return 1;
  if (ageDays < 30) return 0.8;
  if (ageDays < 90) return 0.5;
  return 0.2;
}

function determineRiskLevel(score: number): string {
  if (score <= 15) return "trusted";
  if (score <= 40) return "normal";
  if (score <= 70) return "watchlist";
  return "restricted";
}

async function calculateUserRiskScore(userId: string) {
  // Fetch all risk events for this user from last 180 days
  const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await supabase
    .from("risk_events")
    .select("*")
    .eq("entity_type", "user")
    .eq("entity_id", userId)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);

  let rawScore = 0;
  const signalCounts: Record<string, number> = {};

  for (const evt of events || []) {
    const weight = SIGNAL_WEIGHTS[evt.risk_signal_type] || 5;
    const sevMult = SEVERITY_MULTIPLIER[evt.severity_level] || 1;
    const decay = timeDecayFactor(evt.created_at);
    rawScore += weight * sevMult * decay;
    signalCounts[evt.risk_signal_type] = (signalCounts[evt.risk_signal_type] || 0) + 1;
  }

  // Clamp to 0-100
  const finalScore = Math.min(100, Math.round(rawScore));
  const riskLevel = determineRiskLevel(finalScore);

  // Update profile
  await supabase
    .from("profiles")
    .update({
      risk_score: finalScore,
      risk_level: riskLevel,
      last_risk_evaluated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Store feature vector for ML readiness
  await supabase.from("risk_feature_vectors").upsert(
    {
      entity_type: "user",
      entity_id: userId,
      feature_data: {
        raw_score: rawScore,
        final_score: finalScore,
        risk_level: riskLevel,
        signal_counts: signalCounts,
        total_events: (events || []).length,
        evaluated_at: new Date().toISOString(),
      },
      computed_at: new Date().toISOString(),
    },
    { onConflict: "entity_type,entity_id", ignoreDuplicates: false }
  );

  return { userId, score: finalScore, level: riskLevel, signals: signalCounts };
}

async function emitRiskEvent(body: {
  entity_type: string;
  entity_id: string;
  risk_signal_type: string;
  risk_signal_value?: number;
  severity_level?: string;
  source_system?: string;
  metadata_json?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("risk_events").insert({
    entity_type: body.entity_type,
    entity_id: body.entity_id,
    risk_signal_type: body.risk_signal_type,
    risk_signal_value: body.risk_signal_value || 0,
    severity_level: body.severity_level || "medium",
    source_system: body.source_system || "system",
    metadata_json: body.metadata_json || {},
  });
  if (error) throw error;

  // Auto-recalculate user risk if entity is a user
  if (body.entity_type === "user") {
    return await calculateUserRiskScore(body.entity_id);
  }

  return { success: true };
}

async function checkTransactionRisk(body: { buyer_id: string; seller_id: string; deal_id: string }) {
  const [buyerResult, sellerResult] = await Promise.all([
    calculateUserRiskScore(body.buyer_id),
    calculateUserRiskScore(body.seller_id),
  ]);

  const actions: string[] = [];
  let blocked = false;

  // Buyer risk gating
  if (buyerResult.score > 70) {
    blocked = true;
    actions.push("block_escrow_initiation");
    await supabase.from("risk_cases").insert({
      related_entity_type: "transaction",
      related_entity_id: body.deal_id,
      risk_reason: `Buyer risk score critical: ${buyerResult.score}`,
      risk_score: buyerResult.score,
      status: "open",
    });
  } else if (buyerResult.score > 50) {
    actions.push("require_additional_otp", "increase_cooling_period");
  } else if (buyerResult.score > 30) {
    actions.push("flag_admin_review");
  }

  // Seller risk gating
  if (sellerResult.score > 70) {
    actions.push("restrict_listing_visibility", "hold_payout_extended", "trigger_legal_verification");
  } else if (sellerResult.score > 50) {
    actions.push("hold_payout_longer");
  }

  return {
    buyer: buyerResult,
    seller: sellerResult,
    actions,
    blocked,
    transaction_risk_level: blocked ? "critical" : buyerResult.score > 50 || sellerResult.score > 50 ? "high" : "normal",
  };
}

async function batchRecalculate(limit = 100) {
  const { data: users } = await supabase
    .from("profiles")
    .select("id")
    .order("last_risk_evaluated_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  const results = [];
  for (const u of users || []) {
    results.push(await calculateUserRiskScore(u.id));
  }
  return { recalculated: results.length, results };
}

async function getRiskDashboardStats() {
  const now = new Date();
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsDay, eventsWeek, openCases, highRiskUsers] = await Promise.all([
    supabase.from("risk_events").select("id", { count: "exact", head: true }).gte("created_at", h24),
    supabase.from("risk_events").select("id", { count: "exact", head: true }).gte("created_at", d7),
    supabase.from("risk_cases").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("risk_score", 50),
  ]);

  // Recent critical events
  const { data: recentCritical } = await supabase
    .from("risk_events")
    .select("*")
    .in("severity_level", ["high", "critical"])
    .order("created_at", { ascending: false })
    .limit(20);

  // Signal type distribution
  const { data: signalDist } = await supabase
    .from("risk_events")
    .select("risk_signal_type, severity_level")
    .gte("created_at", d7);

  const signalCounts: Record<string, number> = {};
  for (const e of signalDist || []) {
    signalCounts[e.risk_signal_type] = (signalCounts[e.risk_signal_type] || 0) + 1;
  }

  return {
    events_24h: eventsDay.count || 0,
    events_7d: eventsWeek.count || 0,
    open_cases: openCases.count || 0,
    high_risk_users: highRiskUsers.count || 0,
    recent_critical: recentCritical || [],
    signal_distribution: signalCounts,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;
    let result: unknown;

    switch (action) {
      case "emit_risk_event":
        result = await emitRiskEvent(body);
        break;
      case "calculate_user_risk":
        result = await calculateUserRiskScore(body.user_id);
        break;
      case "check_transaction_risk":
        result = await checkTransactionRisk(body);
        break;
      case "batch_recalculate":
        result = await batchRecalculate(body.limit);
        break;
      case "dashboard_stats":
        result = await getRiskDashboardStats();
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Risk engine error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
