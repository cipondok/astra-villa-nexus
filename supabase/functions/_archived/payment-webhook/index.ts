import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const gateway = url.searchParams.get("gateway") || "midtrans";
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // ---- Idempotency: extract event ID ----
    const webhookEventId = gateway === "midtrans"
      ? `mt_${payload.order_id}_${payload.transaction_status}`
      : `pp_${payload.id || payload.txn_id}_${payload.event_type || payload.payment_status}`;

    const { data: existing } = await supabase
      .from("payment_webhook_logs")
      .select("id")
      .eq("webhook_event_id", webhookEventId)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("payment_webhook_logs").insert({
        gateway,
        webhook_event_id: `${webhookEventId}_dup_${Date.now()}`,
        event_type: "duplicate",
        payload,
        processing_status: "duplicate",
        signature_valid: true,
      });
      return new Response(JSON.stringify({ status: "duplicate_ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Signature verification ----
    let signatureValid = false;

    if (gateway === "midtrans") {
      const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
      if (serverKey && payload.signature_key) {
        const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
        const hash = createHash("sha512").update(raw).digest("hex");
        signatureValid = hash === payload.signature_key;
      }
    } else if (gateway === "paypal") {
      // PayPal webhook signature verification using PayPal Verify API
      const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
      const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
      const isProduction = Deno.env.get("PAYPAL_IS_PRODUCTION") === "true";
      const baseUrl = isProduction
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      if (webhookId && clientId && clientSecret) {
        try {
          // Get OAuth token
          const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          });
          const tokenData = await tokenRes.json();

          if (tokenData.access_token) {
            // Verify webhook signature via PayPal API
            const transmissionId = req.headers.get("paypal-transmission-id");
            const transmissionTime = req.headers.get("paypal-transmission-time");
            const certUrl = req.headers.get("paypal-cert-url");
            const transmissionSig = req.headers.get("paypal-transmission-sig");
            const authAlgo = req.headers.get("paypal-auth-algo");

            if (transmissionId && transmissionTime && certUrl && transmissionSig && authAlgo) {
              const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${tokenData.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  auth_algo: authAlgo,
                  cert_url: certUrl,
                  transmission_id: transmissionId,
                  transmission_sig: transmissionSig,
                  transmission_time: transmissionTime,
                  webhook_id: webhookId,
                  webhook_event: payload,
                }),
              });
              const verifyData = await verifyRes.json();
              signatureValid = verifyData.verification_status === "SUCCESS";
            }
          }
        } catch (verifyErr) {
          console.error("PayPal verification error:", verifyErr);
          signatureValid = false;
        }
      }
    }

    // ---- Log webhook ----
    const logId = crypto.randomUUID();
    await supabase.from("payment_webhook_logs").insert({
      id: logId,
      gateway,
      webhook_event_id: webhookEventId,
      event_type: payload.transaction_status || payload.event_type || "unknown",
      payload,
      processing_status: "processing",
      amount: 0,
      currency: "IDR",
      signature_valid: signatureValid,
    });

    // ---- ENFORCE signature validity — reject forged requests ----
    if (!signatureValid) {
      await supabase.from("payment_webhook_logs")
        .update({ processing_status: "rejected", error_message: "Invalid signature" })
        .eq("id", logId);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Extract transaction details ----
    let txStatus = "unknown";
    let amount = 0;
    let currency = "IDR";
    let orderId = "";

    if (gateway === "midtrans") {
      txStatus = payload.transaction_status;
      amount = parseFloat(payload.gross_amount || "0");
      currency = payload.currency || "IDR";
      orderId = payload.order_id || "";
    } else if (gateway === "paypal") {
      const resource = payload.resource || {};
      txStatus = resource.status || payload.event_type || "unknown";
      amount = parseFloat(resource.amount?.total || resource.amount?.value || "0");
      currency = resource.amount?.currency || resource.amount?.currency_code || "USD";
      orderId = resource.id || resource.parent_payment || "";
    }

    // Update log with extracted amount/currency
    await supabase.from("payment_webhook_logs")
      .update({ amount, currency, event_type: txStatus })
      .eq("id", logId);

    // ---- Process payment confirmation ----
    const isConfirmed =
      (gateway === "midtrans" && ["capture", "settlement"].includes(txStatus)) ||
      (gateway === "paypal" && ["COMPLETED", "PAYMENT.CAPTURE.COMPLETED"].includes(txStatus));

    if (isConfirmed && orderId) {
      // Find deal by escrow_account_reference matching order_id
      const { data: deals } = await supabase
        .from("deal_transactions")
        .select("id, deal_status, escrow_id, deposit_amount, agreed_price, currency, version, buyer_user_id, seller_user_id")
        .eq("escrow_account_reference", orderId)
        .limit(1);

      if (deals && deals.length > 0) {
        const deal = deals[0];

        const currentVersion = deal.version || 1;
        const { data: updated, error: upErr } = await supabase
          .from("deal_transactions")
          .update({
            escrow_status: "funded",
            funds_received_at: new Date().toISOString(),
            deal_status: deal.deal_status === "reservation_pending_payment" ? "deposit_secured_escrow" : deal.deal_status,
            version: currentVersion + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal.id)
          .eq("version", currentVersion)
          .select()
          .single();

        if (upErr || !updated) {
          await supabase.from("payment_webhook_logs")
            .update({ processing_status: "failed", error_message: "Concurrency conflict or deal not found" })
            .eq("id", logId);
          return new Response(JSON.stringify({ error: "Concurrency conflict" }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const escrowId = deal.escrow_id || deal.id;
        const idempKey = `funding_${deal.id}_${webhookEventId}`;
        await supabase.from("escrow_ledger_entries").insert([
          {
            escrow_id: escrowId, deal_id: deal.id, account_type: "buyer_wallet",
            debit_amount: amount, credit_amount: 0, currency,
            entry_reason: "Deposit payment received", idempotency_key: `${idempKey}_debit`,
          },
          {
            escrow_id: escrowId, deal_id: deal.id, account_type: "escrow_holding",
            debit_amount: 0, credit_amount: amount, currency,
            entry_reason: "Deposit credited to escrow", idempotency_key: `${idempKey}_credit`,
          },
        ]);

        const { data: rules } = await supabase
          .from("deal_commission_rules")
          .select("*")
          .eq("deal_type", "sale")
          .eq("is_active", true)
          .limit(1);

        if (rules && rules.length > 0) {
          const rule = rules[0];
          const dealAmount = Number(deal.agreed_price || amount);
          const totalComm = dealAmount * (Number(rule.commission_percentage) / 100);
          const agentAmt = totalComm * (Number(rule.agent_split_percentage || 0) / 100);
          const platformAmt = totalComm - agentAmt;
          const taxReserve = totalComm * 0.1;

          await supabase.from("transaction_commissions").insert({
            deal_id: deal.id,
            transaction_id: deal.id,
            transaction_type: "escrow_deposit",
            seller_id: deal.seller_user_id,
            buyer_id: deal.buyer_user_id,
            gross_amount: dealAmount,
            commission_rate: Number(rule.commission_percentage),
            commission_amount: totalComm,
            net_amount: dealAmount - totalComm,
            deal_amount: dealAmount,
            total_commission: totalComm,
            platform_amount: platformAmt,
            agent_amount: agentAmt,
            tax_reserve_amount: taxReserve,
            currency,
            settlement_status: "locked_in_escrow",
            locked_at: new Date().toISOString(),
            status: "pending",
          });
        }

        await supabase.from("deal_state_log").insert({
          deal_id: deal.id,
          from_state: deal.deal_status,
          to_state: "deposit_secured_escrow",
          triggered_by: "payment_webhook",
          trigger_reason: `${gateway} payment confirmed: ${webhookEventId}`,
        });

        await supabase.from("payment_webhook_logs")
          .update({ processing_status: "processed", deal_id: deal.id, escrow_id: escrowId, processed_at: new Date().toISOString() })
          .eq("id", logId);

        await supabase.from("escrow_system_events").insert({
          event_type: "payment_confirmed",
          deal_id: deal.id,
          escrow_id: escrowId,
          details: { gateway, amount, currency, webhook_event_id: webhookEventId },
          triggered_by: "payment_webhook",
        });
      } else {
        await supabase.from("payment_webhook_logs")
          .update({ processing_status: "failed", error_message: `No deal found for order: ${orderId}` })
          .eq("id", logId);
      }
    } else {
      await supabase.from("payment_webhook_logs")
        .update({ processing_status: "processed", processed_at: new Date().toISOString() })
        .eq("id", logId);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
