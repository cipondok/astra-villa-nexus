import { createClient } from "npm:@supabase/supabase-js@2";

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
    const body = await req.json().catch(() => ({}));
    const task = body.task || "all";
    const results: Record<string, any> = {};

    // ===== TASK 1: Deposit Expiry (runs every 10 min) =====
    if (task === "all" || task === "deposit_expiry") {
      const { data: expired } = await supabase
        .from("deal_transactions")
        .select("id, property_id, buyer_user_id, deposit_deadline, version")
        .eq("deal_status", "reservation_pending_payment")
        .lt("deposit_deadline", new Date().toISOString());

      let cancelledCount = 0;
      for (const deal of expired || []) {
        const { data: updated } = await supabase
          .from("deal_transactions")
          .update({
            deal_status: "cancelled",
            escrow_status: "none",
            cancellation_reason: "Deposit deadline expired",
            cancelled_at: new Date().toISOString(),
            version: (deal.version || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal.id)
          .eq("version", deal.version || 1)
          .select("id")
          .single();

        if (updated) {
          cancelledCount++;
          // Unlock property
          if (deal.property_id) {
            await supabase
              .from("properties")
              .update({ status: "active" })
              .eq("id", deal.property_id)
              .eq("status", "under_contract");
          }

          await supabase.from("deal_state_log").insert({
            deal_id: deal.id,
            from_state: "reservation_pending_payment",
            to_state: "cancelled",
            triggered_by: "escrow_automation",
            trigger_reason: "Deposit deadline expired",
          });

          await supabase.from("escrow_system_events").insert({
            event_type: "deposit_expired",
            deal_id: deal.id,
            details: { deadline: deal.deposit_deadline },
            triggered_by: "deposit_expiry_job",
          });
        }
      }
      results.deposit_expiry = { checked: expired?.length || 0, cancelled: cancelledCount };
    }

    // ===== TASK 2: Auto Release Check (runs hourly) =====
    if (task === "all" || task === "auto_release") {
      const { data: readyDeals } = await supabase
        .from("deal_transactions")
        .select("id, escrow_id, escrow_status, deal_status, agreed_price, deposit_amount, currency, cooling_period_hours, funds_received_at, seller_user_id, agent_id, version")
        .eq("deal_status", "completed")
        .eq("escrow_status", "funded");

      let queuedCount = 0;
      for (const deal of readyDeals || []) {
        // Check cooling period
        if (deal.funds_received_at && deal.cooling_period_hours) {
          const coolingEnd = new Date(new Date(deal.funds_received_at).getTime() + deal.cooling_period_hours * 3600000);
          if (coolingEnd > new Date()) continue;
        }

        // Check no active disputes
        const { data: disputes } = await supabase
          .from("deal_disputes")
          .select("id")
          .eq("deal_id", deal.id)
          .in("status", ["open", "under_review"])
          .limit(1);

        if (disputes && disputes.length > 0) continue;

        // Check commission exists
        const { data: commissions } = await supabase
          .from("transaction_commissions")
          .select("id")
          .eq("deal_id", deal.id)
          .limit(1);

        if (!commissions || commissions.length === 0) {
          await supabase.from("escrow_system_events").insert({
            event_type: "release_blocked",
            deal_id: deal.id,
            details: { reason: "Missing commission record" },
            triggered_by: "auto_release_job",
          });
          continue;
        }

        // Update escrow status
        await supabase
          .from("deal_transactions")
          .update({
            escrow_status: "ready_for_release",
            version: (deal.version || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal.id)
          .eq("version", deal.version || 1);

        // Queue payout for seller
        const escrowId = deal.escrow_id || deal.id;
        const sellerAmount = Number(deal.agreed_price || deal.deposit_amount || 0);
        const payoutIdempKey = `payout_seller_${deal.id}`;

        await supabase.from("escrow_payout_queue").insert({
          deal_id: deal.id,
          escrow_id: escrowId,
          payout_type: "full",
          recipient_type: "seller",
          recipient_user_id: deal.seller_user_id,
          amount: sellerAmount,
          currency: deal.currency || "IDR",
          release_conditions_met: true,
          cooling_period_ends_at: new Date().toISOString(),
          idempotency_key: payoutIdempKey,
        });

        // Double-entry: escrow_holding → seller_wallet
        await supabase.from("escrow_ledger_entries").insert([
          {
            escrow_id: escrowId, deal_id: deal.id, account_type: "escrow_holding",
            debit_amount: sellerAmount, credit_amount: 0, currency: deal.currency || "IDR",
            entry_reason: "Release to seller", idempotency_key: `${payoutIdempKey}_debit`,
          },
          {
            escrow_id: escrowId, deal_id: deal.id, account_type: "seller_wallet",
            debit_amount: 0, credit_amount: sellerAmount, currency: deal.currency || "IDR",
            entry_reason: "Payout received", idempotency_key: `${payoutIdempKey}_credit`,
          },
        ]);

        await supabase.from("escrow_system_events").insert({
          event_type: "payout_queued",
          deal_id: deal.id,
          escrow_id: escrowId,
          details: { amount: sellerAmount, recipient: "seller" },
          triggered_by: "auto_release_job",
        });

        queuedCount++;
      }
      results.auto_release = { checked: readyDeals?.length || 0, queued: queuedCount };
    }

    // ===== TASK 3: Process Payout Queue =====
    if (task === "all" || task === "process_payouts") {
      const { data: pending } = await supabase
        .from("escrow_payout_queue")
        .select("*")
        .eq("status", "pending")
        .eq("release_conditions_met", true)
        .order("created_at")
        .limit(20);

      let processedCount = 0;
      for (const payout of pending || []) {
        // Mark processing
        await supabase
          .from("escrow_payout_queue")
          .update({ status: "processing", updated_at: new Date().toISOString() })
          .eq("id", payout.id)
          .eq("status", "pending");

        // In production: call payment gateway payout API here
        // For now: mark completed
        await supabase
          .from("escrow_payout_queue")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        // Update deal
        await supabase
          .from("deal_transactions")
          .update({
            escrow_status: "released",
            funds_released_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.deal_id);

        // Settle commission
        await supabase
          .from("transaction_commissions")
          .update({
            settlement_status: "settled",
            settled_at: new Date().toISOString(),
          })
          .eq("deal_id", payout.deal_id)
          .eq("settlement_status", "locked_in_escrow");

        // Commission ledger entries
        const { data: comm } = await supabase
          .from("transaction_commissions")
          .select("platform_amount, agent_amount, currency")
          .eq("deal_id", payout.deal_id)
          .limit(1)
          .single();

        if (comm) {
          const eid = payout.escrow_id || payout.deal_id;
          const entries = [];
          if (Number(comm.platform_amount) > 0) {
            entries.push(
              { escrow_id: eid, deal_id: payout.deal_id, account_type: "escrow_holding", debit_amount: comm.platform_amount, credit_amount: 0, currency: comm.currency || "IDR", entry_reason: "Platform commission deducted", idempotency_key: `comm_platform_${payout.id}_d` },
              { escrow_id: eid, deal_id: payout.deal_id, account_type: "platform_revenue", debit_amount: 0, credit_amount: comm.platform_amount, currency: comm.currency || "IDR", entry_reason: "Platform commission received", idempotency_key: `comm_platform_${payout.id}_c` }
            );
          }
          if (Number(comm.agent_amount) > 0) {
            entries.push(
              { escrow_id: eid, deal_id: payout.deal_id, account_type: "escrow_holding", debit_amount: comm.agent_amount, credit_amount: 0, currency: comm.currency || "IDR", entry_reason: "Agent commission deducted", idempotency_key: `comm_agent_${payout.id}_d` },
              { escrow_id: eid, deal_id: payout.deal_id, account_type: "agent_commission", debit_amount: 0, credit_amount: comm.agent_amount, currency: comm.currency || "IDR", entry_reason: "Agent commission received", idempotency_key: `comm_agent_${payout.id}_c` }
            );
          }
          if (entries.length > 0) await supabase.from("escrow_ledger_entries").insert(entries);
        }

        await supabase.from("escrow_system_events").insert({
          event_type: "payout_completed",
          deal_id: payout.deal_id,
          escrow_id: payout.escrow_id,
          details: { payout_id: payout.id, amount: payout.amount },
          triggered_by: "process_payouts_job",
        });

        processedCount++;
      }
      results.process_payouts = { pending: pending?.length || 0, processed: processedCount };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Escrow automation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
