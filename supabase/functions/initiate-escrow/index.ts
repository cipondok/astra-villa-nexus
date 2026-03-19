import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

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

    const { offer_id, payment_gateway = "midtrans", payment_method } = await req.json();

    if (!offer_id) {
      return new Response(
        JSON.stringify({ error: "offer_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify offer exists and is accepted
    const { data: offer, error: offerErr } = await adminClient
      .from("property_offers")
      .select("*")
      .eq("id", offer_id)
      .single();

    if (offerErr || !offer) {
      return new Response(
        JSON.stringify({ error: "Offer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller is the buyer
    if (offer.buyer_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Only the buyer can initiate escrow" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify offer is accepted or in negotiation stage
    const validStatuses = ["accepted", "submitted"];
    const validStages = ["offer", "negotiation", "payment_initiated"];
    if (
      !validStatuses.includes(offer.status) &&
      !validStages.includes(offer.deal_stage || "inquiry")
    ) {
      return new Response(
        JSON.stringify({
          error: "Offer must be accepted before escrow can be initiated",
          current_status: offer.status,
          current_stage: offer.deal_stage,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if escrow already exists for this offer
    const { data: existingEscrow } = await adminClient
      .from("escrow_transactions")
      .select("id, status")
      .eq("offer_id", offer_id)
      .maybeSingle();

    if (existingEscrow) {
      return new Response(
        JSON.stringify({
          error: "Escrow already exists for this offer",
          escrow_id: existingEscrow.id,
          escrow_status: existingEscrow.status,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Generate payment reference (mock Midtrans/PayPal reference)
    const paymentRef = `ESC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const finalPrice = Number(offer.counter_price || offer.offer_price);

    // 4. Create escrow transaction
    const { data: escrow, error: escrowErr } = await adminClient
      .from("escrow_transactions")
      .insert({
        offer_id,
        property_id: offer.property_id,
        buyer_id: userId,
        seller_id: offer.seller_id,
        agent_id: offer.agent_id,
        escrow_amount: finalPrice,
        payment_gateway,
        gateway_transaction_id: paymentRef,
        gateway_status: "awaiting_payment",
        payment_method: payment_method || null,
        status: "initiated",
        legal_verification_status: "pending",
      })
      .select()
      .single();

    if (escrowErr) {
      return new Response(
        JSON.stringify({ error: "Failed to create escrow", detail: escrowErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Update offer with escrow reference and advance stage
    await adminClient
      .from("property_offers")
      .update({
        escrow_id: escrow.id,
        deal_stage: "payment_initiated",
        payment_initiated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer_id);

    // 6. Lock listing visibility (set to under_contract)
    await adminClient
      .from("properties")
      .update({ status: "under_contract" })
      .eq("id", offer.property_id);

    // 7. Emit AI signal
    await adminClient.from("ai_event_signals").insert({
      event_type: "escrow_initiated",
      entity_type: "escrow_transactions",
      entity_id: escrow.id,
      priority_level: "high",
      payload: {
        property_id: offer.property_id,
        offer_id,
        escrow_amount: finalPrice,
        payment_gateway,
        buyer_id: userId,
      },
    });

    // 8. Log behavioral event
    await adminClient.from("behavioral_events").insert({
      user_id: userId,
      property_id: offer.property_id,
      event_type: "escrow_initiated",
      metadata: {
        escrow_id: escrow.id,
        offer_id,
        amount: finalPrice,
        gateway: payment_gateway,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        escrow_id: escrow.id,
        payment_reference: paymentRef,
        escrow_amount: finalPrice,
        gateway: payment_gateway,
        status: "initiated",
        message: "Escrow initiated. Complete payment to proceed.",
      }),
      {
        status: 201,
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
