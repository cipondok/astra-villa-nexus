import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, params } = await req.json();
    let result: Record<string, unknown>;

    switch (mode) {
      case "tokenize_asset":
        result = await tokenizeAsset(supabase, params);
        break;
      case "place_order":
        result = await placeOrder(supabase, params);
        break;
      case "match_orders":
        result = await matchOrders(supabase, params);
        break;
      case "compute_yield":
        result = await computeYield(supabase, params);
        break;
      case "custody_audit":
        result = await custodyAudit(supabase, params);
        break;
      case "dashboard":
        result = await buildDashboard(supabase);
        break;
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── TOKENIZE ASSET ───────────────────────────────────────────
async function tokenizeAsset(sb: any, params: any) {
  const { property_id, token_symbol, token_name, total_supply, valuation_usd, jurisdiction, min_investment } = params;

  const pricePerToken = valuation_usd / (total_supply || 1000000);
  const fractRatio = Math.min(valuation_usd / (min_investment || 100), total_supply);

  const { data, error } = await sb.from("pate_tokenized_assets").insert({
    property_id,
    token_symbol: token_symbol.toUpperCase(),
    token_name,
    total_supply: total_supply || 1000000,
    price_per_token: pricePerToken,
    asset_valuation_usd: valuation_usd,
    jurisdiction: jurisdiction || "ID",
    fractionalization_ratio: fractRatio,
    min_investment_usd: min_investment || 100,
    compliance_status: "pending_review",
  }).select().single();

  if (error) throw error;
  return { tokenized_asset: data, price_per_token: pricePerToken };
}

// ─── PLACE ORDER ──────────────────────────────────────────────
async function placeOrder(sb: any, params: any) {
  const { asset_id, order_type, investor_id, quantity, price_per_token, source_currency } = params;

  // Fetch asset for spread adjustment
  const { data: asset } = await sb.from("pate_tokenized_assets")
    .select("price_per_token, is_trading_active, circulating_supply, total_supply")
    .eq("id", asset_id).single();

  if (!asset?.is_trading_active) throw new Error("Asset trading is not active");

  // AI spread stabilization: widen spread when liquidity is thin
  const liquidityRatio = (asset.circulating_supply || 1) / asset.total_supply;
  const spreadAdj = liquidityRatio < 0.1 ? 0.025 : liquidityRatio < 0.3 ? 0.01 : 0.002;

  const effectivePrice = order_type.includes("buy")
    ? price_per_token * (1 + spreadAdj)
    : price_per_token * (1 - spreadAdj);

  const totalValue = quantity * effectivePrice;

  const { data, error } = await sb.from("pate_order_book").insert({
    asset_id,
    order_type,
    investor_id,
    quantity,
    price_per_token: effectivePrice,
    total_value: totalValue,
    ai_spread_adjustment: spreadAdj,
    volatility_dampener_active: liquidityRatio < 0.1,
    source_currency: source_currency || "USD",
    cross_border: (source_currency || "USD") !== "USD",
  }).select().single();

  if (error) throw error;
  return { order: data, spread_applied: spreadAdj, liquidity_ratio: liquidityRatio };
}

// ─── MATCH ORDERS (Order Book Engine) ─────────────────────────
async function matchOrders(sb: any, params: any) {
  const { asset_id } = params;
  let matchCount = 0;

  // Get open buy orders (highest price first)
  const { data: buys } = await sb.from("pate_order_book")
    .select("*").eq("asset_id", asset_id)
    .in("order_type", ["buy", "limit_buy"]).eq("status", "open")
    .order("price_per_token", { ascending: false }).limit(50);

  // Get open sell orders (lowest price first)
  const { data: sells } = await sb.from("pate_order_book")
    .select("*").eq("asset_id", asset_id)
    .in("order_type", ["sell", "limit_sell"]).eq("status", "open")
    .order("price_per_token", { ascending: true }).limit(50);

  if (!buys?.length || !sells?.length) return { matches: 0, message: "No matching orders" };

  for (const buy of buys) {
    for (const sell of sells) {
      if (buy.price_per_token >= sell.price_per_token) {
        const fillQty = Math.min(
          buy.quantity - (buy.filled_quantity || 0),
          sell.quantity - (sell.filled_quantity || 0)
        );
        if (fillQty <= 0) continue;

        const fillPrice = (buy.price_per_token + sell.price_per_token) / 2;

        // Update buy order
        const newBuyFilled = (buy.filled_quantity || 0) + fillQty;
        await sb.from("pate_order_book").update({
          filled_quantity: newBuyFilled,
          avg_fill_price: fillPrice,
          status: newBuyFilled >= buy.quantity ? "filled" : "partial",
          ...(newBuyFilled >= buy.quantity ? { filled_at: new Date().toISOString() } : {}),
        }).eq("id", buy.id);

        // Update sell order
        const newSellFilled = (sell.filled_quantity || 0) + fillQty;
        await sb.from("pate_order_book").update({
          filled_quantity: newSellFilled,
          avg_fill_price: fillPrice,
          status: newSellFilled >= sell.quantity ? "filled" : "partial",
          ...(newSellFilled >= sell.quantity ? { filled_at: new Date().toISOString() } : {}),
        }).eq("id", sell.id);

        // Update circulating supply on asset
        await sb.from("pate_tokenized_assets").update({
          price_per_token: fillPrice,
          updated_at: new Date().toISOString(),
        }).eq("id", asset_id);

        matchCount++;
        sell.filled_quantity = newSellFilled;
      }
    }
  }

  return { matches: matchCount, asset_id };
}

// ─── COMPUTE YIELD ────────────────────────────────────────────
async function computeYield(sb: any, params: any) {
  const { asset_id, period_start, period_end, rental_income_usd } = params;

  const { data: asset } = await sb.from("pate_tokenized_assets")
    .select("total_supply, circulating_supply, price_per_token, annual_yield_pct")
    .eq("id", asset_id).single();

  if (!asset) throw new Error("Asset not found");

  const platformFeePct = 1.5;
  const netYield = rental_income_usd * (1 - platformFeePct / 100);
  const yieldPerToken = netYield / (asset.circulating_supply || asset.total_supply);

  // Appreciation reprice delta
  const annualizedYield = (netYield / asset.price_per_token / asset.total_supply) * 1200;
  const repriceDelta = annualizedYield > 0 ? annualizedYield * 0.001 : 0;

  // Secondary market bonus for high-liquidity assets
  const liquidityRatio = (asset.circulating_supply || 0) / asset.total_supply;
  const secondaryBonus = liquidityRatio > 0.5 ? 0.5 : liquidityRatio > 0.3 ? 0.25 : 0;

  const { data: holders } = await sb.from("pate_custody_records")
    .select("id").eq("asset_id", asset_id);

  const { data: stream, error } = await sb.from("pate_yield_streams").insert({
    asset_id,
    stream_type: "rental_yield",
    period_start,
    period_end,
    total_yield_usd: rental_income_usd,
    yield_per_token: yieldPerToken,
    net_yield_after_fees: netYield,
    platform_fee_pct: platformFeePct,
    token_reprice_delta: repriceDelta,
    secondary_market_bonus_pct: secondaryBonus,
    recipients_count: holders?.length || 0,
    distribution_status: "computing",
    computed_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return { yield_stream: stream, yield_per_token: yieldPerToken, net_yield: netYield };
}

// ─── CUSTODY AUDIT ────────────────────────────────────────────
async function custodyAudit(sb: any, params: any) {
  const { asset_id } = params;

  const { data: records } = await sb.from("pate_custody_records")
    .select("*").eq("asset_id", asset_id);

  const { data: asset } = await sb.from("pate_tokenized_assets")
    .select("total_supply, circulating_supply, asset_valuation_usd")
    .eq("id", asset_id).single();

  if (!records || !asset) throw new Error("Asset or custody records not found");

  const totalCustodied = records.reduce((s: number, r: any) => s + (r.token_balance || 0), 0);
  const totalLocked = records.reduce((s: number, r: any) => s + (r.locked_balance || 0), 0);
  const kycRate = records.filter((r: any) => r.kyc_verified).length / (records.length || 1);
  const highRisk = records.filter((r: any) => (r.fraud_risk_score || 0) > 70);

  return {
    asset_id,
    total_custodied_tokens: totalCustodied,
    total_locked_tokens: totalLocked,
    supply_coverage_pct: (totalCustodied / asset.total_supply) * 100,
    holder_count: records.length,
    kyc_compliance_rate: Math.round(kycRate * 100),
    high_risk_holders: highRisk.length,
    audit_timestamp: new Date().toISOString(),
  };
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function buildDashboard(sb: any) {
  const [assets, orders, yields, products] = await Promise.all([
    sb.from("pate_tokenized_assets").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("pate_order_book").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    sb.from("pate_yield_streams").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("pate_financial_products").select("*").eq("is_active", true),
  ]);

  const totalMarketCap = (assets.data || []).reduce((s: number, a: any) => s + (a.asset_valuation_usd || 0), 0);
  const totalCirculating = (assets.data || []).reduce((s: number, a: any) => s + (a.circulating_supply || 0), 0);
  const activeAssets = (assets.data || []).filter((a: any) => a.is_trading_active).length;
  const openOrderValue = (orders.data || []).reduce((s: number, o: any) => s + (o.total_value || 0), 0);
  const totalYieldDistributed = (yields.data || []).filter((y: any) => y.distribution_status === "completed")
    .reduce((s: number, y: any) => s + (y.distributed_amount || 0), 0);

  return {
    summary: {
      total_tokenized_assets: (assets.data || []).length,
      active_trading: activeAssets,
      total_market_cap_usd: totalMarketCap,
      total_circulating_tokens: totalCirculating,
      open_order_book_value: openOrderValue,
      total_yield_distributed: totalYieldDistributed,
      financial_products_active: (products.data || []).length,
    },
    tokenized_assets: assets.data || [],
    open_orders: orders.data || [],
    recent_yields: yields.data || [],
    financial_products: products.data || [],
  };
}
