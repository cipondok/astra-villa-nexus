import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface FraudCheckRequest {
  action: string; // 'escrow_initiation' | 'wallet_topup' | 'checkout' | 'payout'
  amount?: number;
  currency?: string;
  entity_id?: string;
  entity_type?: string;
  device_fingerprint?: string;
  client_fraud_score?: number;
}

interface FraudDecision {
  allowed: boolean;
  decision: "allow" | "block" | "require_kyc" | "add_friction";
  fraud_score: number;
  risk_level: string;
  reason?: string;
  restrictions?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Parse and validate request
    const body: FraudCheckRequest = await req.json();
    const validActions = ["escrow_initiation", "wallet_topup", "checkout", "payout"];
    if (!body.action || !validActions.includes(body.action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract request metadata
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("cf-connecting-ip") || null;
    const userAgent = req.headers.get("user-agent") || "";

    // 1. Compute server-side fraud score from DB history
    const { data: serverScore, error: scoreErr } = await supabaseAdmin.rpc(
      "compute_server_fraud_score",
      { p_user_id: userId }
    );

    let fraudScore = 0;
    let riskLevel = "safe";
    const signals: string[] = [];

    if (!scoreErr && serverScore) {
      fraudScore = serverScore.score || 0;
      riskLevel = serverScore.level || "safe";
    }

    // 2. Additional server-side checks

    // Check for suspicious amount patterns
    if (body.amount) {
      if (body.amount <= 0) {
        fraudScore += 40;
        signals.push("invalid_amount");
      }
      // Very large single transaction
      if (body.amount > 50_000_000_000) { // > 50B IDR
        fraudScore += 15;
        signals.push("unusually_large_amount");
      }
    }

    // Check for bot-like user agent
    const botPatterns = /bot|crawler|spider|curl|wget|python|httpie/i;
    if (botPatterns.test(userAgent)) {
      fraudScore += 25;
      signals.push("bot_user_agent");
    }

    // Cap score
    fraudScore = Math.min(100, fraudScore);

    // Recalculate level
    if (fraudScore >= 70) riskLevel = "blocked";
    else if (fraudScore >= 45) riskLevel = "suspicious";
    else if (fraudScore >= 20) riskLevel = "watch";
    else riskLevel = "safe";

    // 3. Make decision
    let decision: FraudDecision["decision"] = "allow";
    let reason: string | undefined;
    const restrictions: string[] = [];

    if (fraudScore >= 70) {
      decision = "block";
      reason = "High fraud risk detected. Transaction blocked for security.";
      restrictions.push("all_transactions_blocked", "kyc_required");
    } else if (fraudScore >= 45) {
      decision = "require_kyc";
      reason = "Elevated risk. Identity verification required before proceeding.";
      restrictions.push("kyc_required");
    } else if (fraudScore >= 20) {
      decision = "add_friction";
      reason = "Additional confirmation required.";
      restrictions.push("extra_confirmation");
    }

    // 4. Log the decision (service role — bypasses RLS)
    await supabaseAdmin.from("risk_action_logs").insert({
      user_id: userId,
      action_type: body.action,
      fraud_score: fraudScore,
      risk_level: riskLevel,
      decision,
      ip_address: ipAddress,
      device_fingerprint: body.device_fingerprint || null,
      request_metadata: {
        amount: body.amount,
        currency: body.currency,
        user_agent: userAgent,
        signals,
        client_score: body.client_fraud_score,
      },
      blocked_reason: reason || null,
      related_entity_id: body.entity_id || null,
      related_entity_type: body.entity_type || null,
    });

    const result: FraudDecision = {
      allowed: decision === "allow" || decision === "add_friction",
      decision,
      fraud_score: fraudScore,
      risk_level: riskLevel,
      reason,
      restrictions,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: decision === "block" ? 403 : 200,
    });
  } catch (err) {
    console.error("fraud-guard error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
