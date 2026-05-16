import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function supaAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function getUserId(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, params = {} } = await req.json();
    const sb = supaAdmin();
    const userId = getUserId(req);

    // ── Dashboard summary ───────────────────────────────────────────────
    if (mode === "dashboard") {
      const [offers, positions, escrows] = await Promise.all([
        sb.from("fractional_offers").select("*").order("created_at", { ascending: false }).limit(50),
        sb.from("investor_fractional_positions").select("*").order("created_at", { ascending: false }).limit(100),
        sb.from("pooled_escrow_records").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      const activeOffers = (offers.data || []).filter((o: any) => o.offer_status === "active");
      const totalCapitalCommitted = (positions.data || [])
        .filter((p: any) => ["funded", "confirmed"].includes(p.position_status))
        .reduce((s: number, p: any) => s + (p.invested_amount_idr || 0), 0);

      return new Response(JSON.stringify({
        total_offers: (offers.data || []).length,
        active_offers: activeOffers.length,
        fully_funded: (offers.data || []).filter((o: any) => o.offer_status === "fully_funded").length,
        total_positions: (positions.data || []).length,
        total_capital_committed_idr: totalCapitalCommitted,
        unique_investors: new Set((positions.data || []).map((p: any) => p.investor_user_id)).size,
        escrow_pools: (escrows.data || []).length,
        avg_funding_completion: escrows.data?.length
          ? Math.round((escrows.data.reduce((s: number, e: any) => s + (e.funding_completion_pct || 0), 0) / escrows.data.length) * 100) / 100
          : 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── List active offers ──────────────────────────────────────────────
    if (mode === "list_offers") {
      const { data, error } = await sb
        .from("fractional_offers")
        .select("*, pooled_escrow_records(*)")
        .in("offer_status", ["active", "fully_funded"])
        .order("created_at", { ascending: false })
        .limit(params.limit || 20);
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Reserve shares ──────────────────────────────────────────────────
    if (mode === "reserve_shares") {
      if (!userId) throw new Error("Authentication required");
      const { offer_id, share_units } = params;
      if (!offer_id || !share_units || share_units < 1) throw new Error("offer_id and share_units required");

      // Get offer
      const { data: offer, error: offerErr } = await sb
        .from("fractional_offers")
        .select("*")
        .eq("id", offer_id)
        .single();
      if (offerErr || !offer) throw new Error("Offer not found");
      if (offer.offer_status !== "active") throw new Error("Offer is not active");

      const remaining = offer.total_shares_available - offer.shares_allocated;
      if (share_units > remaining) throw new Error(`Only ${remaining} shares remaining`);

      const invested = share_units * offer.price_per_share_idr;
      const ownership = Math.round((share_units / offer.total_shares_available) * 100000) / 1000;

      const { data: position, error: posErr } = await sb
        .from("investor_fractional_positions")
        .insert({
          offer_id,
          investor_user_id: userId,
          invested_amount_idr: invested,
          ownership_percentage: ownership,
          share_units,
          position_status: "reserved",
        })
        .select()
        .single();
      if (posErr) throw posErr;

      return new Response(JSON.stringify({
        status: "reserved",
        position,
        message: `Reserved ${share_units} shares (${ownership}% ownership) for Rp ${invested.toLocaleString()}`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Fund position (confirm wallet debit) ────────────────────────────
    if (mode === "fund_position") {
      if (!userId) throw new Error("Authentication required");
      const { position_id } = params;
      if (!position_id) throw new Error("position_id required");

      const { data: pos, error: posErr } = await sb
        .from("investor_fractional_positions")
        .select("*")
        .eq("id", position_id)
        .eq("investor_user_id", userId)
        .single();
      if (posErr || !pos) throw new Error("Position not found");
      if (pos.position_status !== "reserved") throw new Error("Position is not in reserved status");

      // Check wallet balance
      const { data: wallet } = await sb
        .from("wallet_accounts")
        .select("available_balance")
        .eq("user_id", userId)
        .single();

      if (!wallet || wallet.available_balance < pos.invested_amount_idr) {
        throw new Error("Insufficient wallet balance");
      }

      // Debit wallet
      await sb.rpc("debit_wallet", {
        p_user_id: userId,
        p_amount: pos.invested_amount_idr,
        p_description: `Fractional investment - ${pos.share_units} shares`,
        p_reference_type: "fractional_investment",
        p_reference_id: pos.id,
      });

      // Update position status
      const { error: upErr } = await sb
        .from("investor_fractional_positions")
        .update({ position_status: "funded", funded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", position_id);
      if (upErr) throw upErr;

      return new Response(JSON.stringify({
        status: "funded",
        message: `Successfully funded ${pos.share_units} shares for Rp ${pos.invested_amount_idr.toLocaleString()}`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Create offer (admin/sponsor) ────────────────────────────────────
    if (mode === "create_offer") {
      const { property_id, total_property_value_idr, minimum_investment_ticket_idr, total_shares_available, expected_annual_yield_pct, funding_deadline } = params;
      if (!property_id || !total_property_value_idr || !total_shares_available) {
        throw new Error("property_id, total_property_value_idr, and total_shares_available required");
      }

      const { data, error } = await sb
        .from("fractional_offers")
        .insert({
          property_id,
          total_property_value_idr,
          minimum_investment_ticket_idr: minimum_investment_ticket_idr || 5000000,
          total_shares_available,
          expected_annual_yield_pct: expected_annual_yield_pct || 0,
          funding_deadline: funding_deadline || null,
          offer_status: "active",
          created_by: userId,
        })
        .select()
        .single();
      if (error) throw error;

      return new Response(JSON.stringify({ status: "created", offer: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Assign syndication role ─────────────────────────────────────────
    if (mode === "assign_syndication_role") {
      const { offer_id, lead_investor_user_id, role_type, sponsor_fee_pct } = params;
      const { data, error } = await sb
        .from("syndication_roles")
        .upsert({
          offer_id,
          lead_investor_user_id,
          role_type: role_type || "lead",
          sponsor_fee_pct: sponsor_fee_pct || 0,
          is_active: true,
        }, { onConflict: "offer_id,lead_investor_user_id,role_type" })
        .select()
        .single();
      if (error) throw error;

      return new Response(JSON.stringify({ status: "assigned", role: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── My positions ────────────────────────────────────────────────────
    if (mode === "my_positions") {
      if (!userId) throw new Error("Authentication required");
      const { data, error } = await sb
        .from("investor_fractional_positions")
        .select("*, fractional_offers(*, pooled_escrow_records(*))")
        .eq("investor_user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown mode: ${mode}`);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
