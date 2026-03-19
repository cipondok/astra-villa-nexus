import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_COMMISSION_RATE = 0.025;
const AGENT_SPLIT_RATE = 0.70;
const AFFILIATE_REWARD_RATE = 0.05;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User-context client for auth
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { offer_id, new_stage, flags } = await req.json();
    if (!offer_id || !new_stage) {
      return new Response(JSON.stringify({ error: "offer_id and new_stage required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch current offer
    const { data: offer, error: offerErr } = await adminClient
      .from("property_offers")
      .select("*")
      .eq("id", offer_id)
      .single();

    if (offerErr || !offer) {
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentStage = offer.deal_stage || "inquiry";

    // 2. Determine user role in this deal
    let userRole = "investor";
    if (offer.agent_id === userId) userRole = "agent";
    else if (offer.seller_id === userId) userRole = "owner";

    // Check admin
    const { data: adminCheck } = await adminClient
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (adminCheck) userRole = "admin";

    // 3. Validate transition against deal_stage_rules
    const { data: rule, error: ruleErr } = await adminClient
      .from("deal_stage_rules")
      .select("*")
      .eq("from_stage", currentStage)
      .eq("to_stage", new_stage)
      .eq("is_active", true)
      .maybeSingle();

    if (ruleErr || !rule) {
      return new Response(
        JSON.stringify({
          error: `Invalid transition: ${currentStage} → ${new_stage}`,
          current_stage: currentStage,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check role permission
    if (!rule.allowed_roles.includes(userRole)) {
      return new Response(
        JSON.stringify({
          error: `Role '${userRole}' not authorized for this transition`,
          allowed_roles: rule.allowed_roles,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check required flags
    const requiredFlags = rule.required_flags || {};
    const providedFlags = flags || {};
    for (const [key, val] of Object.entries(requiredFlags)) {
      if (providedFlags[key] !== val) {
        return new Response(
          JSON.stringify({
            error: `Required flag '${key}' must be ${val}`,
            required_flags: requiredFlags,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Build update payload
    const now = new Date().toISOString();
    const stageHistory = Array.isArray(offer.deal_state_history) ? offer.deal_state_history : [];
    stageHistory.push({
      from: currentStage,
      to: new_stage,
      by: userId,
      role: userRole,
      at: now,
    });

    const offerUpdate: Record<string, any> = {
      deal_stage: new_stage,
      deal_state_history: stageHistory,
      updated_at: now,
    };

    if (new_stage === "payment_initiated") offerUpdate.payment_initiated_at = now;
    if (new_stage === "legal_verification") offerUpdate.legal_verified_at = now;
    if (new_stage === "closed") {
      offerUpdate.deal_closed_at = now;
      offerUpdate.status = "completed";
      offerUpdate.completed_at = now;
    }

    // 5. Update offer
    const { error: updateErr } = await adminClient
      .from("property_offers")
      .update(offerUpdate)
      .eq("id", offer_id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "Failed to update offer", detail: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Auto-create escrow when entering payment_initiated
    let escrowId: string | null = null;
    if (new_stage === "payment_initiated") {
      const finalPrice = offer.counter_price || offer.offer_price;
      const { data: escrow, error: escrowErr } = await adminClient
        .from("escrow_transactions")
        .insert({
          offer_id: offer_id,
          property_id: offer.property_id,
          buyer_id: offer.buyer_id,
          seller_id: offer.seller_id,
          agent_id: offer.agent_id,
          escrow_amount: finalPrice,
          status: "initiated",
        })
        .select("id")
        .single();

      if (!escrowErr && escrow) {
        escrowId = escrow.id;
        await adminClient
          .from("property_offers")
          .update({ escrow_id: escrow.id })
          .eq("id", offer_id);
      }
    }

    // 7. Auto-calculate commission when closed
    let commissionId: string | null = null;
    if (new_stage === "closed") {
      const finalPrice = Number(offer.counter_price || offer.offer_price);
      const platformFee = finalPrice * PLATFORM_COMMISSION_RATE;
      const agentSplit = platformFee * AGENT_SPLIT_RATE;
      const affiliateReward = platformFee * AFFILIATE_REWARD_RATE;
      const netCommission = platformFee - agentSplit - affiliateReward;

      const { data: commission } = await adminClient
        .from("transaction_commissions")
        .insert({
          transaction_id: offer_id,
          transaction_type: "property_sale",
          seller_id: offer.seller_id || offer.buyer_id,
          buyer_id: offer.buyer_id,
          offer_id: offer_id,
          gross_amount: finalPrice,
          commission_rate: PLATFORM_COMMISSION_RATE,
          commission_amount: platformFee,
          net_amount: finalPrice - platformFee,
          agent_split_amount: agentSplit,
          platform_fee_amount: netCommission,
          affiliate_reward_amount: affiliateReward,
          commission_type: "deal_close",
          settlement_status: "pending",
          status: "pending",
        })
        .select("id")
        .single();

      if (commission) commissionId = commission.id;

      // Update property status
      await adminClient
        .from("properties")
        .update({ status: "sold" })
        .eq("id", offer.property_id);
    }

    // 8. Emit AI signal
    const signalType =
      new_stage === "closed"
        ? "deal_closed"
        : new_stage === "payment_initiated"
        ? "payment_initiated"
        : `deal_stage_${new_stage}`;

    await adminClient.from("ai_event_signals").insert({
      event_type: signalType,
      entity_type: "property_offers",
      entity_id: offer_id,
      priority_level: new_stage === "closed" ? "high" : "medium",
      payload: {
        property_id: offer.property_id,
        from_stage: currentStage,
        to_stage: new_stage,
        final_price: offer.counter_price || offer.offer_price,
        user_id: userId,
        role: userRole,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        deal_stage: new_stage,
        previous_stage: currentStage,
        escrow_id: escrowId,
        commission_id: commissionId,
        transition: `${currentStage} → ${new_stage}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
