import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sb() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function uid(req: Request): string | null {
  try {
    const t = req.headers.get("authorization")?.replace("Bearer ", "") || "";
    return JSON.parse(atob(t.split(".")[1])).sub || null;
  } catch { return null; }
}

function ok(d: unknown) {
  return new Response(JSON.stringify(d), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, params = {} } = await req.json();
    const s = sb();
    const userId = uid(req);

    // ── Dashboard ─────────────────────────────────────────────────────────
    if (mode === "dashboard") {
      const [funds, positions, navs, dists, redemptions, allocations] = await Promise.all([
        s.from("investment_funds").select("*").order("created_at", { ascending: false }).limit(50),
        s.from("fund_investor_positions").select("*").limit(200),
        s.from("fund_nav_history").select("*").order("valuation_timestamp", { ascending: false }).limit(100),
        s.from("fund_distributions").select("*").order("distribution_date", { ascending: false }).limit(50),
        s.from("fund_redemption_requests").select("*").order("created_at", { ascending: false }).limit(50),
        s.from("fund_property_allocations").select("*").limit(200),
      ]);

      const allFunds = funds.data || [];
      const allPos = positions.data || [];
      const allDists = dists.data || [];

      const totalAUM = allFunds.reduce((t: number, f: any) => t + Number(f.committed_capital || 0), 0);
      const totalDistributed = allDists.reduce((t: number, d: any) => t + Number(d.distribution_amount || 0), 0);
      const uniqueInvestors = new Set(allPos.map((p: any) => p.investor_user_id)).size;

      return ok({
        total_funds: allFunds.length,
        active_funds: allFunds.filter((f: any) => f.fund_status === "active").length,
        raising_funds: allFunds.filter((f: any) => f.fund_status === "raising").length,
        total_aum_idr: totalAUM,
        total_distributed_idr: totalDistributed,
        unique_investors: uniqueInvestors,
        total_positions: allPos.length,
        total_properties_allocated: (allocations.data || []).length,
        pending_redemptions: (redemptions.data || []).filter((r: any) => r.redemption_status === "pending").length,
        latest_nav_records: (navs.data || []).slice(0, 10),
        funds: allFunds,
      });
    }

    // ── List funds ────────────────────────────────────────────────────────
    if (mode === "list_funds") {
      const { data, error } = await s
        .from("investment_funds")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(params.limit || 20);
      if (error) throw error;
      return ok(data);
    }

    // ── Fund detail with allocations & NAV ────────────────────────────────
    if (mode === "fund_detail") {
      const { fund_id } = params;
      if (!fund_id) throw new Error("fund_id required");

      const [fund, allocs, navs, dists, positions] = await Promise.all([
        s.from("investment_funds").select("*").eq("id", fund_id).single(),
        s.from("fund_property_allocations").select("*").eq("fund_id", fund_id),
        s.from("fund_nav_history").select("*").eq("fund_id", fund_id).order("valuation_timestamp", { ascending: false }).limit(30),
        s.from("fund_distributions").select("*").eq("fund_id", fund_id).order("distribution_date", { ascending: false }),
        s.from("fund_investor_positions").select("*").eq("fund_id", fund_id),
      ]);
      if (fund.error) throw fund.error;

      return ok({
        fund: fund.data,
        allocations: allocs.data || [],
        nav_history: navs.data || [],
        distributions: dists.data || [],
        positions: positions.data || [],
        investor_count: new Set((positions.data || []).map((p: any) => p.investor_user_id)).size,
      });
    }

    // ── Subscribe to fund ─────────────────────────────────────────────────
    if (mode === "subscribe") {
      if (!userId) throw new Error("Authentication required");
      const { fund_id, amount_idr } = params;
      if (!fund_id || !amount_idr) throw new Error("fund_id and amount_idr required");

      const { data: fund } = await s.from("investment_funds").select("*").eq("id", fund_id).single();
      if (!fund) throw new Error("Fund not found");
      if (!["raising", "active"].includes(fund.fund_status)) throw new Error("Fund not accepting subscriptions");
      if (amount_idr < Number(fund.min_subscription_amount || 5000000)) {
        throw new Error(`Minimum subscription: Rp ${Number(fund.min_subscription_amount || 5000000).toLocaleString()}`);
      }

      // Get latest NAV
      const { data: latestNav } = await s
        .from("fund_nav_history")
        .select("nav_per_unit")
        .eq("fund_id", fund_id)
        .order("valuation_timestamp", { ascending: false })
        .limit(1)
        .single();

      const navPerUnit = Number(latestNav?.nav_per_unit || 1000);
      const units = Math.round((amount_idr / navPerUnit) * 1000) / 1000;

      // Check wallet
      const { data: wallet } = await s.from("wallet_accounts").select("available_balance").eq("user_id", userId).single();
      if (!wallet || Number(wallet.available_balance) < amount_idr) throw new Error("Insufficient wallet balance");

      // Create or update position
      const { data: existing } = await s
        .from("fund_investor_positions")
        .select("*")
        .eq("fund_id", fund_id)
        .eq("investor_user_id", userId)
        .eq("position_status", "active")
        .single();

      if (existing) {
        const newUnits = Number(existing.ownership_units || 0) + units;
        const newContrib = Number(existing.contributed_amount || 0) + amount_idr;
        const newAvgNav = newContrib / newUnits;
        await s.from("fund_investor_positions").update({
          ownership_units: newUnits,
          contributed_amount: newContrib,
          committed_amount: newContrib,
          average_entry_nav: Math.round(newAvgNav * 100) / 100,
          nav_per_unit: navPerUnit,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await s.from("fund_investor_positions").insert({
          fund_id,
          investor_user_id: userId,
          ownership_units: units,
          committed_amount: amount_idr,
          contributed_amount: amount_idr,
          average_entry_nav: navPerUnit,
          nav_per_unit: navPerUnit,
          position_status: "active",
        });
      }

      // Update fund committed capital
      await s.from("investment_funds").update({
        committed_capital: Number(fund.committed_capital || 0) + amount_idr,
        total_units_outstanding: Number(fund.total_units_outstanding || 0) + units,
        updated_at: new Date().toISOString(),
      }).eq("id", fund_id);

      return ok({
        status: "subscribed",
        units_allocated: units,
        nav_per_unit: navPerUnit,
        amount_idr,
        message: `Subscribed ${units.toFixed(3)} units at NAV ${navPerUnit}/unit`,
      });
    }

    // ── Request redemption ────────────────────────────────────────────────
    if (mode === "redeem") {
      if (!userId) throw new Error("Authentication required");
      const { position_id, units } = params;
      if (!position_id || !units) throw new Error("position_id and units required");

      const { data: pos } = await s
        .from("fund_investor_positions")
        .select("*")
        .eq("id", position_id)
        .eq("investor_user_id", userId)
        .single();
      if (!pos) throw new Error("Position not found");
      if (units > Number(pos.ownership_units)) throw new Error("Insufficient units");

      const { data: latestNav } = await s
        .from("fund_nav_history")
        .select("nav_per_unit")
        .eq("fund_id", pos.fund_id)
        .order("valuation_timestamp", { ascending: false })
        .limit(1)
        .single();

      const navPerUnit = Number(latestNav?.nav_per_unit || pos.nav_per_unit || 1000);
      const estimatedPayout = Math.round(units * navPerUnit);

      const { data: redemption, error: redErr } = await s
        .from("fund_redemption_requests")
        .insert({
          position_id,
          fund_id: pos.fund_id,
          investor_user_id: userId,
          requested_units: units,
          nav_at_request: navPerUnit,
          estimated_payout_idr: estimatedPayout,
          redemption_status: "pending",
          expected_settlement_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        })
        .select()
        .single();
      if (redErr) throw redErr;

      return ok({
        status: "pending",
        redemption,
        message: `Redemption request submitted for ${units} units (~Rp ${estimatedPayout.toLocaleString()})`,
      });
    }

    // ── Calculate NAV ─────────────────────────────────────────────────────
    if (mode === "calculate_nav") {
      const { fund_id } = params;
      if (!fund_id) throw new Error("fund_id required");

      const [fund, allocs] = await Promise.all([
        s.from("investment_funds").select("*").eq("id", fund_id).single(),
        s.from("fund_property_allocations").select("*").eq("fund_id", fund_id),
      ]);
      if (fund.error) throw fund.error;

      const totalAssets = (allocs.data || []).reduce((t: number, a: any) => t + Number(a.current_estimated_value_idr || 0), 0)
        + Number(fund.data.committed_capital || 0) - Number(fund.data.deployed_capital || 0);
      const liabilities = 0; // placeholder for debt tracking
      const netAssets = totalAssets - liabilities;
      const totalUnits = Number(fund.data.total_units_outstanding || 1);
      const navPerUnit = Math.round((netAssets / totalUnits) * 100) / 100;

      const { data: navRecord } = await s
        .from("fund_nav_history")
        .insert({
          fund_id,
          nav_per_unit: navPerUnit,
          total_fund_value: totalAssets,
          liabilities,
          valuation_timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      return ok({
        nav_per_unit: navPerUnit,
        total_assets: totalAssets,
        net_assets: netAssets,
        total_units: totalUnits,
        record: navRecord,
      });
    }

    // ── Process distribution ──────────────────────────────────────────────
    if (mode === "distribute") {
      const { fund_id, distribution_type, total_amount_idr } = params;
      if (!fund_id || !total_amount_idr) throw new Error("fund_id and total_amount_idr required");

      const { data: dist } = await s
        .from("fund_distributions")
        .insert({
          fund_id,
          distribution_amount: total_amount_idr,
          distribution_type: distribution_type || "rental_yield",
          distribution_date: new Date().toISOString(),
        })
        .select()
        .single();

      return ok({ status: "distributed", distribution: dist });
    }

    // ── My fund positions ─────────────────────────────────────────────────
    if (mode === "my_positions") {
      if (!userId) throw new Error("Authentication required");
      const { data, error } = await s
        .from("fund_investor_positions")
        .select("*, investment_funds(*)")
        .eq("investor_user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ok(data);
    }

    throw new Error(`Unknown mode: ${mode}`);
  } catch (e) {
    return err(e.message);
  }
});
