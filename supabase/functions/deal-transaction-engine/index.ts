import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  inquiry_submitted: ["negotiation_active", "cancelled"],
  negotiation_active: ["reservation_pending_payment", "cancelled"],
  reservation_pending_payment: ["deposit_secured_escrow", "cancelled"],
  deposit_secured_escrow: ["legal_due_diligence", "dispute_open", "cancelled"],
  legal_due_diligence: ["final_payment_processing", "dispute_open", "cancelled"],
  final_payment_processing: ["completed", "dispute_open"],
  dispute_open: ["deposit_secured_escrow", "legal_due_diligence", "cancelled"],
  completed: [],
  cancelled: [],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { action } = body;

    if (action === "create_deal") {
      const { property_id, offer_id, seller_user_id, agent_id, agreed_price, deposit_amount, currency, country_origin } = body;
      if (!property_id) throw new Error("property_id required");

      const { data: lockouts } = await supabase
        .from("account_lockouts")
        .select("failed_attempts")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);
      if (lockouts && lockouts.length > 0 && lockouts[0].failed_attempts >= 10) {
        throw new Error("Account flagged as high-risk. Cannot initiate deals.");
      }

      const deposit_deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const { data: deal, error } = await supabase.from("deal_transactions").insert({
        property_id,
        offer_id: offer_id || null,
        buyer_user_id: user.id,
        seller_user_id: seller_user_id || null,
        agent_id: agent_id || null,
        agreed_price: agreed_price || null,
        deposit_amount: deposit_amount || null,
        deposit_deadline,
        currency: currency || "IDR",
        country_origin: country_origin || "ID",
        deal_status: "inquiry_submitted",
        state_history: [{ state: "inquiry_submitted", at: new Date().toISOString(), by: user.id }],
      }).select().single();
      if (error) throw error;

      await supabase.from("deal_state_log").insert({
        deal_id: deal.id,
        to_state: "inquiry_submitted",
        triggered_by: user.id,
        trigger_reason: "Deal created",
      });

      return new Response(JSON.stringify(deal), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "transition") {
      const { deal_id, target_state, reason } = body;
      if (!deal_id || !target_state) throw new Error("deal_id and target_state required");

      const { data: deal, error: fetchErr } = await supabase
        .from("deal_transactions")
        .select("*")
        .eq("id", deal_id)
        .single();
      if (fetchErr || !deal) throw new Error("Deal not found");

      const isParticipant = [deal.buyer_user_id, deal.seller_user_id, deal.agent_id].includes(user.id);
      const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("user_id", user.id).limit(1);
      if (!isParticipant && (!adminCheck || adminCheck.length === 0)) {
        throw new Error("Not authorized for this deal");
      }

      const allowed = VALID_TRANSITIONS[deal.deal_status] || [];
      if (!allowed.includes(target_state)) {
        throw new Error(`Cannot transition from ${deal.deal_status} to ${target_state}`);
      }

      if (target_state === "deposit_secured_escrow" && deal.deposit_deadline) {
        if (new Date(deal.deposit_deadline) < new Date()) {
          throw new Error("Deposit deadline has passed. Deal auto-cancelled.");
        }
      }

      const history = Array.isArray(deal.state_history) ? deal.state_history : [];
      history.push({ state: target_state, at: new Date().toISOString(), by: user.id, reason });

      const updates: Record<string, any> = {
        deal_status: target_state,
        state_history: history,
        updated_at: new Date().toISOString(),
      };
      if (target_state === "completed") updates.completed_at = new Date().toISOString();
      if (target_state === "cancelled") {
        updates.cancelled_at = new Date().toISOString();
        updates.cancellation_reason = reason || "Cancelled by participant";
      }

      const { data: updated, error: upErr } = await supabase
        .from("deal_transactions")
        .update(updates)
        .eq("id", deal_id)
        .select()
        .single();
      if (upErr) throw upErr;

      await supabase.from("deal_state_log").insert({
        deal_id,
        from_state: deal.deal_status,
        to_state: target_state,
        triggered_by: user.id,
        trigger_reason: reason || `Transition to ${target_state}`,
      });

      if (target_state === "completed" && updated.agreed_price) {
        const { data: rules } = await supabase
          .from("deal_commission_rules")
          .select("*")
          .eq("deal_type", "sale")
          .eq("is_active", true)
          .limit(1);

        if (rules && rules.length > 0) {
          const rule = rules[0];
          const totalCommission = Number(updated.agreed_price) * (Number(rule.commission_percentage) / 100);
          const agentAmount = totalCommission * (Number(rule.agent_split_percentage) / 100);
          const platformAmount = totalCommission - agentAmount;

          await supabase.from("deal_state_log").insert({
            deal_id,
            from_state: "completed",
            to_state: "completed",
            triggered_by: user.id,
            trigger_reason: "Commission calculated",
            metadata: { total_commission: totalCommission, agent_amount: agentAmount, platform_amount: platformAmount, rule_id: rule.id },
          });
        }
      }

      return new Response(JSON.stringify(updated), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list_deals") {
      const { role, status_filter } = body;
      let query = supabase.from("deal_transactions").select("*").order("created_at", { ascending: false });
      if (role === "buyer") query = query.eq("buyer_user_id", user.id);
      else if (role === "seller") query = query.eq("seller_user_id", user.id);
      else if (role === "agent") query = query.eq("agent_id", user.id);
      if (status_filter) query = query.eq("deal_status", status_filter);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "deal_stats") {
      const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("user_id", user.id).limit(1);
      if (!adminCheck || adminCheck.length === 0) throw new Error("Admin access required");

      const { data: deals } = await supabase.from("deal_transactions").select("deal_status, agreed_price, currency, country_origin, created_at");
      const { data: disputes } = await supabase.from("deal_disputes").select("status, created_at");

      const stats = {
        total_deals: deals?.length || 0,
        active_deals: deals?.filter((d: any) => !["completed", "cancelled"].includes(d.deal_status)).length || 0,
        completed_deals: deals?.filter((d: any) => d.deal_status === "completed").length || 0,
        total_escrow_volume: deals?.filter((d: any) => d.agreed_price).reduce((s: number, d: any) => s + Number(d.agreed_price), 0) || 0,
        open_disputes: disputes?.filter((d: any) => d.status === "open" || d.status === "under_review").length || 0,
        dispute_ratio: deals?.length ? ((disputes?.length || 0) / deals.length * 100).toFixed(1) : "0",
        by_status: {} as Record<string, number>,
        by_currency: {} as Record<string, number>,
        by_country: {} as Record<string, number>,
      };
      deals?.forEach((d: any) => {
        stats.by_status[d.deal_status] = (stats.by_status[d.deal_status] || 0) + 1;
        stats.by_currency[d.currency || "IDR"] = (stats.by_currency[d.currency || "IDR"] || 0) + 1;
        stats.by_country[d.country_origin || "ID"] = (stats.by_country[d.country_origin || "ID"] || 0) + 1;
      });

      return new Response(JSON.stringify(stats), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "raise_dispute") {
      const { deal_id, dispute_type, description, evidence_urls } = body;
      if (!deal_id) throw new Error("deal_id required");

      const { data: deal } = await supabase.from("deal_transactions").select("*").eq("id", deal_id).single();
      if (!deal) throw new Error("Deal not found");
      if (![deal.buyer_user_id, deal.seller_user_id].includes(user.id)) {
        throw new Error("Only buyer or seller can raise disputes");
      }

      await supabase.from("deal_transactions").update({ deal_status: "dispute_open", updated_at: new Date().toISOString() }).eq("id", deal_id);

      const { data: dispute, error } = await supabase.from("deal_disputes").insert({
        deal_id,
        raised_by: user.id,
        dispute_type: dispute_type || "general",
        description,
        evidence_urls: evidence_urls || [],
        escrow_frozen: true,
      }).select().single();
      if (error) throw error;

      await supabase.from("deal_state_log").insert({
        deal_id, from_state: deal.deal_status, to_state: "dispute_open",
        triggered_by: user.id, trigger_reason: `Dispute raised: ${dispute_type || "general"}`,
      });

      return new Response(JSON.stringify(dispute), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "resolve_dispute") {
      const { dispute_id, resolution, notes, refund_amount } = body;
      const { data: adminCheck } = await supabase.from("admin_users").select("id").eq("user_id", user.id).limit(1);
      if (!adminCheck || adminCheck.length === 0) throw new Error("Admin access required");

      const statusMap: Record<string, string> = { refund: "resolved_refund", release: "resolved_release", partial: "resolved_partial" };

      const { data: dispute, error } = await supabase.from("deal_disputes").update({
        status: statusMap[resolution] || "closed",
        resolution_notes: notes,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        escrow_frozen: false,
        refund_amount: refund_amount || null,
      }).eq("id", dispute_id).select().single();
      if (error) throw error;

      if (dispute?.deal_id) {
        const newState = resolution === "release" ? "completed" : "cancelled";
        await supabase.from("deal_transactions").update({
          deal_status: newState, updated_at: new Date().toISOString(),
          ...(newState === "completed" ? { completed_at: new Date().toISOString() } : {}),
          ...(newState === "cancelled" ? { cancelled_at: new Date().toISOString(), cancellation_reason: `Dispute resolved: ${resolution}` } : {}),
        }).eq("id", dispute.deal_id);
      }

      return new Response(JSON.stringify(dispute), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
