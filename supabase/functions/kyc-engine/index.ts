import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    let result: Record<string, unknown>;

    switch (action) {
      case "aml_screening":
        result = await handleAMLScreening(user.id, body);
        break;
      case "evaluate_risk":
        result = await handleRiskEvaluation(user.id);
        break;
      case "submit_verification":
        result = await handleVerificationSubmission(user.id, body);
        break;
      case "admin_review":
        result = await handleAdminReview(user.id, body);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("KYC engine error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleAMLScreening(
  userId: string,
  params: {
    full_name: string;
    date_of_birth?: string;
    nationality?: string;
    document_number?: string;
  }
) {
  // Server-side AML/PEP/sanctions screening logic
  // In production, integrate with ComplyAdvantage, Dow Jones, or similar
  const nameNormalized = (params.full_name || "").toLowerCase().trim();

  // Risk heuristics (replace with real API in production)
  const sanctionsMatch = false;
  const pepMatch = false;
  const adverseMedia = false;

  let score = 0;
  const matches: Array<Record<string, unknown>> = [];

  if (sanctionsMatch) score += 80;
  if (pepMatch) score += 40;
  if (adverseMedia) score += 20;

  let riskLevel = "clear";
  if (score >= 80) riskLevel = "blocked";
  else if (score >= 50) riskLevel = "high";
  else if (score >= 20) riskLevel = "medium";
  else if (score > 0) riskLevel = "low";

  // Log screening
  await supabase.from("aml_screenings").insert({
    user_id: userId,
    full_name: params.full_name,
    risk_level: riskLevel,
    sanctions_match: sanctionsMatch,
    pep_match: pepMatch,
    adverse_media: adverseMedia,
    score,
    matches,
    screened_at: new Date().toISOString(),
  });

  return {
    risk_level: riskLevel,
    sanctions_match: sanctionsMatch,
    pep_match: pepMatch,
    adverse_media: adverseMedia,
    matches,
    score,
    screened_at: new Date().toISOString(),
  };
}

async function handleRiskEvaluation(userId: string) {
  // Get KYC level
  const { data: verification } = await supabase
    .from("kyc_verifications")
    .select("status, verification_type")
    .eq("user_id", userId)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get latest AML screening
  const { data: amlScreening } = await supabase
    .from("aml_screenings")
    .select("risk_level, sanctions_match")
    .eq("user_id", userId)
    .order("screened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get fraud score from risk action logs
  const { data: riskLog } = await supabase
    .from("risk_action_logs")
    .select("fraud_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const kycTier = verification?.verification_type || "unverified";
  const fraudScore = riskLog?.fraud_score ?? 0;
  const amlClear =
    !amlScreening?.sanctions_match &&
    amlScreening?.risk_level !== "blocked" &&
    amlScreening?.risk_level !== "high";

  return { kyc_tier: kycTier, fraud_score: fraudScore, aml_clear: amlClear };
}

async function handleVerificationSubmission(
  userId: string,
  params: {
    verification_type: string;
    document_type: string;
    document_image?: string;
    selfie_image?: string;
  }
) {
  // Create verification record
  const { data, error } = await supabase
    .from("kyc_verifications")
    .insert({
      user_id: userId,
      verification_type: params.verification_type || "basic",
      document_type: params.document_type,
      status: "pending",
      liveness_passed: false,
      face_match_passed: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Verification insert error:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    verification_id: data.id,
    status: "pending",
  };
}

async function handleAdminReview(
  adminUserId: string,
  params: {
    verification_id: string;
    decision: "verified" | "rejected";
    rejection_reason?: string;
  }
) {
  // Check admin role
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", adminUserId)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) {
    return { success: false, error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from("kyc_verifications")
    .update({
      status: params.decision,
      rejection_reason: params.rejection_reason || null,
    })
    .eq("id", params.verification_id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, status: params.decision };
}
