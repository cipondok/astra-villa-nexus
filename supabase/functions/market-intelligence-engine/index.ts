import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { mode, property_id, city, limit = 20 } = await req.json();

    // ─── MODE: score_property ─────────────────────────────────────────
    if (mode === "score_property" && property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("id, price, city, district, property_type, bedrooms, bathrooms, land_size, building_size")
        .eq("id", property_id)
        .single();

      if (!prop) throw new Error("Property not found");

      // Get city averages
      const { data: cityProps } = await supabase
        .from("properties")
        .select("price, land_size")
        .eq("city", prop.city)
        .not("price", "is", null)
        .limit(200);

      const prices = (cityProps || []).map((p: any) => p.price).filter(Boolean);
      const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : prop.price;
      const priceRatio = avgPrice > 0 ? prop.price / avgPrice : 1;

      // Score components (0-100 each)
      const valueScore = Math.max(0, Math.min(100, (1 - (priceRatio - 1)) * 50 + 50));
      const yieldEstimate = Math.min(12, Math.max(2, 8 - (priceRatio - 1) * 4));
      const yieldScore = Math.min(100, (yieldEstimate / 10) * 100);

      // Demand from inquiry/viewing counts
      const { count: inquiryCount } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("property_id", property_id);

      const demandScore = Math.min(100, (inquiryCount || 0) * 10);

      // Liquidity from deal velocity
      const { count: dealCount } = await supabase
        .from("deal_transactions")
        .select("id", { count: "exact", head: true })
        .eq("deal_status", "completed")
        .limit(100);

      const liquidityScore = Math.min(100, (dealCount || 0) * 5);

      // Growth estimate
      const growthScore = Math.min(100, 50 + (demandScore * 0.3));

      // Composite
      const investmentScore = Math.round(
        valueScore * 0.25 +
        yieldScore * 0.25 +
        demandScore * 0.20 +
        liquidityScore * 0.15 +
        growthScore * 0.15
      );

      // Update property
      await supabase
        .from("properties")
        .update({
          investment_score: investmentScore,
          expected_rental_yield: yieldEstimate,
          estimated_price_growth: Math.round(growthScore * 0.15 * 10) / 10,
          liquidity_score: liquidityScore,
          demand_score: demandScore,
          last_market_evaluated_at: new Date().toISOString(),
        })
        .eq("id", property_id);

      // Store signal
      await supabase.from("property_market_signals").insert({
        property_id,
        city: prop.city,
        district: prop.district,
        property_type: prop.property_type,
        signal_type: "price_avg",
        signal_value: investmentScore,
        data_source: "internal",
        metadata: { value: valueScore, yield: yieldScore, demand: demandScore, liquidity: liquidityScore, growth: growthScore },
      });

      return new Response(JSON.stringify({
        property_id,
        investment_score: investmentScore,
        expected_rental_yield: yieldEstimate,
        demand_score: demandScore,
        liquidity_score: liquidityScore,
        growth_score: growthScore,
        value_score: valueScore,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ─── MODE: batch_score ────────────────────────────────────────────
    if (mode === "batch_score") {
      const { data: props } = await supabase
        .from("properties")
        .select("id")
        .or("last_market_evaluated_at.is.null,last_market_evaluated_at.lt." + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq("status", "active")
        .limit(limit);

      let scored = 0;
      for (const p of props || []) {
        try {
          const res = await fetch(Deno.env.get("SUPABASE_URL")! + "/functions/v1/market-intelligence-engine", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ mode: "score_property", property_id: p.id }),
          });
          if (res.ok) scored++;
        } catch { /* skip */ }
      }

      return new Response(JSON.stringify({ scored, total: (props || []).length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: zone_metrics ───────────────────────────────────────────
    if (mode === "zone_metrics") {
      const { data: cities } = await supabase
        .from("properties")
        .select("city")
        .not("city", "is", null)
        .limit(1000);

      const uniqueCities = [...new Set((cities || []).map((c: any) => c.city).filter(Boolean))];
      const results = [];

      for (const c of uniqueCities.slice(0, 30)) {
        const { count: listingCount } = await supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("city", c)
          .eq("status", "active");

        const { count: inquiryCount } = await supabase
          .from("inquiries")
          .select("id", { count: "exact", head: true })
          .limit(500);

        const demandIdx = Math.min(100, (inquiryCount || 0) * 2);
        const supplyIdx = Math.min(100, (listingCount || 0) * 3);
        const momentum = Math.round(demandIdx * 0.6 + (100 - supplyIdx) * 0.4);

        await supabase.from("market_zone_metrics").upsert({
          city: c,
          buyer_demand_index: demandIdx,
          seller_supply_index: supplyIdx,
          price_momentum_score: momentum,
          investment_hotspot_rank: momentum,
          search_frequency: demandIdx * 0.8,
          listing_conversion_rate: Math.min(100, demandIdx / Math.max(1, supplyIdx) * 50),
          computed_at: new Date().toISOString(),
        }, { onConflict: "city,district" });

        results.push({ city: c, demand: demandIdx, supply: supplyIdx, momentum });
      }

      return new Response(JSON.stringify({ zones: results.length, data: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: detect_anomalies ───────────────────────────────────────
    if (mode === "detect_anomalies") {
      const { data: props } = await supabase
        .from("properties")
        .select("id, price, city, investment_score")
        .not("price", "is", null)
        .not("investment_score", "is", null)
        .gt("investment_score", 0)
        .order("created_at", { ascending: false })
        .limit(200);

      const anomalies = [];
      const cityGroups: Record<string, number[]> = {};

      for (const p of props || []) {
        if (!cityGroups[p.city]) cityGroups[p.city] = [];
        cityGroups[p.city].push(p.price);
      }

      for (const p of props || []) {
        const cityPrices = cityGroups[p.city] || [];
        if (cityPrices.length < 3) continue;
        const avg = cityPrices.reduce((a, b) => a + b, 0) / cityPrices.length;
        const deviation = (p.price - avg) / avg;

        if (deviation > 0.5) {
          anomalies.push({ property_id: p.id, type: "overvalued", deviation: Math.round(deviation * 100) });
          await supabase.from("risk_events").insert({
            entity_type: "listing",
            entity_id: p.id,
            risk_signal_type: "listing_price_anomaly",
            risk_signal_value: deviation,
            severity_level: deviation > 1 ? "high" : "medium",
            source_system: "ai_model",
            metadata_json: { city: p.city, price: p.price, avg, type: "overvalued" },
          });
        } else if (deviation < -0.3) {
          anomalies.push({ property_id: p.id, type: "undervalued", deviation: Math.round(deviation * 100) });
        }
      }

      return new Response(JSON.stringify({ anomalies_found: anomalies.length, anomalies }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: generate_recommendations ───────────────────────────────
    if (mode === "generate_recommendations") {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, preferred_locations, preferred_property_types, investment_budget_max")
        .not("id", "is", null)
        .limit(50);

      let generated = 0;

      for (const user of users || []) {
        let query = supabase
          .from("properties")
          .select("id, city, price, investment_score")
          .eq("status", "active")
          .gt("investment_score", 50)
          .order("investment_score", { ascending: false })
          .limit(5);

        if (user.investment_budget_max) {
          query = query.lte("price", user.investment_budget_max);
        }

        const { data: topProps } = await query;

        for (const prop of topProps || []) {
          const reasons = [];
          if (prop.investment_score >= 75) reasons.push("High investment score");
          if (prop.investment_score >= 50) reasons.push("Strong market fundamentals");
          reasons.push(`Top-rated in ${prop.city}`);

          await supabase.from("investor_recommendations").insert({
            user_id: user.id,
            property_id: prop.id,
            recommendation_reason: reasons.join(". "),
            confidence_level: prop.investment_score,
            score_components: { investment_score: prop.investment_score, city: prop.city },
          });
          generated++;
        }
      }

      return new Response(JSON.stringify({ recommendations_generated: generated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: roi_forecast ───────────────────────────────────────────
    if (mode === "roi_forecast" && property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("id, price, city, investment_score, expected_rental_yield, estimated_price_growth")
        .eq("id", property_id)
        .single();

      if (!prop) throw new Error("Property not found");

      const horizons = [6, 12, 24, 36, 60];
      const forecasts = [];

      for (const months of horizons) {
        const annualYield = prop.expected_rental_yield || 5;
        const annualGrowth = prop.estimated_price_growth || 3;
        const years = months / 12;
        const predictedPrice = prop.price * Math.pow(1 + annualGrowth / 100, years);
        const totalRental = prop.price * (annualYield / 100) * years;
        const confidence = Math.max(30, 90 - months * 0.8);

        const forecast = {
          property_id,
          forecast_horizon_months: months,
          predicted_rental_income: Math.round(totalRental),
          predicted_price: Math.round(predictedPrice),
          predicted_appreciation_pct: Math.round((predictedPrice / prop.price - 1) * 100 * 10) / 10,
          confidence_score: Math.round(confidence),
          model_version: "v1.0",
          forecast_data: { annual_yield: annualYield, annual_growth: annualGrowth, base_price: prop.price },
        };

        forecasts.push(forecast);
      }

      await supabase.from("roi_forecasts").insert(forecasts);

      return new Response(JSON.stringify({ forecasts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: dashboard_stats ────────────────────────────────────────
    if (mode === "dashboard_stats") {
      const [
        { count: totalScored },
        { count: totalSignals },
        { count: totalForecasts },
        { count: totalRecommendations },
        { count: totalAnomalies },
        { data: topProps },
        { data: zones },
      ] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).gt("investment_score", 0),
        supabase.from("property_market_signals").select("id", { count: "exact", head: true }),
        supabase.from("roi_forecasts").select("id", { count: "exact", head: true }),
        supabase.from("investor_recommendations").select("id", { count: "exact", head: true }),
        supabase.from("risk_events").select("id", { count: "exact", head: true }).eq("risk_signal_type", "listing_price_anomaly"),
        supabase.from("properties").select("id, title, city, investment_score, price").gt("investment_score", 0).order("investment_score", { ascending: false }).limit(10),
        supabase.from("market_zone_metrics").select("*").order("investment_hotspot_rank", { ascending: false }).limit(10),
      ]);

      return new Response(JSON.stringify({
        total_scored: totalScored || 0,
        total_signals: totalSignals || 0,
        total_forecasts: totalForecasts || 0,
        total_recommendations: totalRecommendations || 0,
        total_anomalies: totalAnomalies || 0,
        top_properties: topProps || [],
        hot_zones: zones || [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
