import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params = {} } = await req.json();

    switch (mode) {
      case "calculate_nav": {
        const { fund_id } = params;
        const { data: assets } = await supabase
          .from("fund_assets")
          .select("current_estimated_value, asset_income_generated")
          .eq("fund_id", fund_id)
          .eq("asset_status", "active");

        const totalValue = (assets || []).reduce(
          (s: number, a: any) => s + (a.current_estimated_value || 0) + (a.asset_income_generated || 0), 0
        );

        const { data: positions } = await supabase
          .from("fund_investor_positions")
          .select("id, ownership_units")
          .eq("fund_id", fund_id)
          .eq("position_status", "active");

        const totalUnits = (positions || []).reduce((s: number, p: any) => s + (p.ownership_units || 0), 0);
        const navPerUnit = totalUnits > 0 ? totalValue / totalUnits : 100;

        await supabase.from("fund_nav_history").insert({
          fund_id,
          nav_per_unit: Math.round(navPerUnit * 100) / 100,
          total_fund_value: totalValue,
          liabilities: 0,
        });

        for (const p of positions || []) {
          await supabase
            .from("fund_investor_positions")
            .update({
              nav_per_unit: Math.round(navPerUnit * 100) / 100,
              unrealized_value: Math.round((p.ownership_units || 0) * navPerUnit * 100) / 100,
              updated_at: new Date().toISOString(),
            })
            .eq("id", p.id);
        }

        return json({ nav_per_unit: navPerUnit, total_fund_value: totalValue, total_units: totalUnits });
      }

      case "process_capital_call": {
        const { capital_call_id } = params;
        const { data: call } = await supabase.from("fund_capital_calls").select("*").eq("id", capital_call_id).single();
        if (!call) throw new Error("Capital call not found");

        const { data: positions } = await supabase
          .from("fund_investor_positions")
          .select("*")
          .eq("fund_id", call.fund_id)
          .eq("position_status", "active");

        const totalCommitted = (positions || []).reduce((s: number, p: any) => s + (p.committed_amount || 0), 0);

        for (const pos of positions || []) {
          const ratio = totalCommitted > 0 ? (pos.committed_amount || 0) / totalCommitted : 0;
          const callShare = call.call_amount * ratio;
          await supabase
            .from("fund_investor_positions")
            .update({
              contributed_amount: (pos.contributed_amount || 0) + callShare,
              ownership_units: (pos.ownership_units || 0) + callShare / (pos.nav_per_unit || 100),
              updated_at: new Date().toISOString(),
            })
            .eq("id", pos.id);
        }

        await supabase.from("fund_capital_calls").update({ call_status: "funded" }).eq("id", capital_call_id);
        return json({ success: true, investors_called: (positions || []).length });
      }

      case "process_distribution": {
        const { fund_id, amount, distribution_type = "income" } = params;
        await supabase.from("fund_distributions").insert({ fund_id, distribution_amount: amount, distribution_type });

        const { data: positions } = await supabase
          .from("fund_investor_positions")
          .select("*")
          .eq("fund_id", fund_id)
          .eq("position_status", "active");

        const totalUnits = (positions || []).reduce((s: number, p: any) => s + (p.ownership_units || 0), 0);

        for (const pos of positions || []) {
          const share = totalUnits > 0 ? amount * ((pos.ownership_units || 0) / totalUnits) : 0;
          await supabase
            .from("fund_investor_positions")
            .update({
              realized_distributions: (pos.realized_distributions || 0) + share,
              updated_at: new Date().toISOString(),
            })
            .eq("id", pos.id);
        }

        return json({ success: true, distributed: amount, recipients: (positions || []).length });
      }

      case "fund_dashboard": {
        const { data: funds } = await supabase
          .from("investment_funds")
          .select("*")
          .order("created_at", { ascending: false });

        const totalAUM = (funds || []).reduce((s: number, f: any) => s + (f.committed_capital || 0), 0);
        const totalDeployed = (funds || []).reduce((s: number, f: any) => s + (f.deployed_capital || 0), 0);
        const activeFunds = (funds || []).filter((f: any) => f.fund_status === "active" || f.fund_status === "raising").length;

        return json({ total_aum: totalAUM, total_deployed: totalDeployed, active_funds: activeFunds, funds: funds || [] });
      }

      default:
        return json({ error: `Unknown mode: ${mode}` }, 400);
    }
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
