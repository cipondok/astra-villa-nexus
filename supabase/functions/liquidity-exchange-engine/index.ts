import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const authHeader = req.headers.get("authorization") || "";
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    const { mode, params } = await req.json();

    switch (mode) {
      case "place_sell_order": {
        if (!user) throw new Error("Authentication required");
        const { unit_id, asking_price_total } = params;
        // Fetch unit
        const { data: unit, error: ue } = await supabase
          .from("property_ownership_units")
          .select("*")
          .eq("id", unit_id)
          .eq("current_owner_user_id", user.id)
          .single();
        if (ue || !unit) throw new Error("Ownership unit not found or not owned by you");
        if (unit.lock_status !== "tradable") throw new Error("Unit is not tradable");

        // Lock unit
        await supabase.from("property_ownership_units").update({ lock_status: "under_sale" }).eq("id", unit_id);

        const price_per_percent = asking_price_total / unit.ownership_percentage;
        const { data: order, error: oe } = await supabase.from("liquidity_sell_orders").insert({
          seller_user_id: user.id,
          unit_id,
          property_id: unit.property_id,
          percentage_for_sale: unit.ownership_percentage,
          asking_price_total,
          price_per_percent,
          order_status: "open",
          expiry_timestamp: new Date(Date.now() + 30 * 86400000).toISOString(),
        }).select().single();
        if (oe) throw oe;

        await updateMetrics(supabase, unit.property_id);
        return json({ success: true, order });
      }

      case "place_buy_order": {
        if (!user) throw new Error("Authentication required");
        const { target_property_id, desired_percentage, max_price_per_percent } = params;
        const { data: order, error } = await supabase.from("liquidity_buy_orders").insert({
          buyer_user_id: user.id,
          target_property_id,
          desired_percentage,
          max_price_per_percent,
          order_status: "open",
        }).select().single();
        if (error) throw error;

        await updateMetrics(supabase, target_property_id);
        return json({ success: true, order });
      }

      case "match_orders": {
        const { property_id } = params;
        // Get open sell orders (cheapest first)
        const { data: sells } = await supabase
          .from("liquidity_sell_orders")
          .select("*")
          .eq("property_id", property_id)
          .eq("order_status", "open")
          .order("price_per_percent", { ascending: true });

        // Get open buy orders (highest bid first)
        const { data: buys } = await supabase
          .from("liquidity_buy_orders")
          .select("*")
          .eq("target_property_id", property_id)
          .eq("order_status", "open")
          .order("max_price_per_percent", { ascending: false });

        if (!sells?.length || !buys?.length) return json({ matches: 0 });

        let matches = 0;
        for (const sell of sells) {
          for (const buy of buys) {
            if (buy.order_status !== "open") continue;
            if (buy.max_price_per_percent >= sell.price_per_percent) {
              const exec_pct = Math.min(sell.percentage_for_sale, buy.desired_percentage);
              const exec_price = exec_pct * sell.price_per_percent;

              // Create trade execution
              await supabase.from("liquidity_trade_executions").insert({
                sell_order_id: sell.id,
                buy_order_id: buy.id,
                executed_percentage: exec_pct,
                execution_price: exec_price,
                buyer_user_id: buy.buyer_user_id,
                seller_user_id: sell.seller_user_id,
                property_id,
                settlement_status: "escrow_held",
              });

              // Update order statuses
              await supabase.from("liquidity_sell_orders").update({ order_status: "matched" }).eq("id", sell.id);
              await supabase.from("liquidity_buy_orders").update({ order_status: "matched" }).eq("id", buy.id);

              // Transfer ownership
              await supabase.from("property_ownership_units")
                .update({ current_owner_user_id: buy.buyer_user_id, lock_status: "tradable" })
                .eq("id", sell.unit_id);

              matches++;
              break; // Move to next sell order
            }
          }
        }

        await updateMetrics(supabase, property_id);
        return json({ success: true, matches });
      }

      case "cancel_sell_order": {
        if (!user) throw new Error("Authentication required");
        const { order_id } = params;
        const { data: order } = await supabase
          .from("liquidity_sell_orders")
          .select("*")
          .eq("id", order_id)
          .eq("seller_user_id", user.id)
          .eq("order_status", "open")
          .single();
        if (!order) throw new Error("Order not found");

        await supabase.from("liquidity_sell_orders").update({ order_status: "cancelled" }).eq("id", order_id);
        await supabase.from("property_ownership_units").update({ lock_status: "tradable" }).eq("id", order.unit_id);
        await updateMetrics(supabase, order.property_id);
        return json({ success: true });
      }

      case "dashboard": {
        const { data: metrics } = await supabase
          .from("liquidity_market_metrics")
          .select("*")
          .order("volume_30d", { ascending: false })
          .limit(20);

        const { data: recentTrades } = await supabase
          .from("liquidity_trade_executions")
          .select("*")
          .order("executed_at", { ascending: false })
          .limit(10);

        const { count: openSells } = await supabase
          .from("liquidity_sell_orders")
          .select("*", { count: "exact", head: true })
          .eq("order_status", "open");

        const { count: openBuys } = await supabase
          .from("liquidity_buy_orders")
          .select("*", { count: "exact", head: true })
          .eq("order_status", "open");

        return json({
          metrics: metrics || [],
          recentTrades: recentTrades || [],
          openSellOrders: openSells || 0,
          openBuyOrders: openBuys || 0,
        });
      }

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});

async function updateMetrics(supabase: any, propertyId: string) {
  const { count: sellCount } = await supabase
    .from("liquidity_sell_orders")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("order_status", "open");

  const { count: buyCount } = await supabase
    .from("liquidity_buy_orders")
    .select("*", { count: "exact", head: true })
    .eq("target_property_id", propertyId)
    .eq("order_status", "open");

  const { data: lastTrade } = await supabase
    .from("liquidity_trade_executions")
    .select("execution_price, executed_percentage")
    .eq("property_id", propertyId)
    .order("executed_at", { ascending: false })
    .limit(1)
    .single();

  const lastPrice = lastTrade ? lastTrade.execution_price / lastTrade.executed_percentage : 0;
  const depth = Math.min(100, (sellCount || 0) * 10 + (buyCount || 0) * 10);

  await supabase.from("liquidity_market_metrics").upsert({
    property_id: propertyId,
    last_trade_price_per_percent: lastPrice,
    liquidity_depth_score: depth,
    total_sell_orders_open: sellCount || 0,
    total_buy_orders_open: buyCount || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: "property_id" });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
