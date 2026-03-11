import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Context Gathering (precomputed, no heavy queries) ──

async function gatherPropertyContext(propertyId: string) {
  const [propRes, dealRes, insightRes, hotspotRes] = await Promise.all([
    supabaseAdmin.from("properties").select("id, title, price, city, state, property_type, bedrooms as kt, bathrooms as km, building_area_sqm, land_area_sqm, investment_score, demand_heat_score, listing_type, thumbnail_url").eq("id", propertyId).maybeSingle(),
    supabaseAdmin.from("property_deal_analysis").select("deal_score, undervaluation_percent, estimated_value, deal_tag, deal_confidence, flip_potential_score, rental_stability_score").eq("property_id", propertyId).maybeSingle(),
    supabaseAdmin.from("property_roi_forecast").select("expected_roi_percent, growth_forecast_percent, rental_yield_percent, risk_level, predicted_value_1y, predicted_value_3y, predicted_value_5y").eq("property_id", propertyId).maybeSingle(),
    supabaseAdmin.from("investment_hotspots").select("hotspot_score, growth_score, rental_score, trend").limit(1),
  ]);

  return {
    property: propRes.data,
    deal: dealRes.data,
    forecast: insightRes.data,
    hotspot: hotspotRes.data?.[0],
  };
}

async function gatherPortfolioContext(userId: string) {
  const { data: favorites } = await supabaseAdmin
    .from("favorites")
    .select("property_id, properties:property_id(id, title, price, city, property_type, investment_score, demand_heat_score)")
    .eq("user_id", userId)
    .limit(20);

  const props = (favorites || []).map((f: any) => f.properties).filter(Boolean);
  
  // Compute diversification metrics
  const cities = [...new Set(props.map((p: any) => p.city))];
  const types = [...new Set(props.map((p: any) => p.property_type))];
  const totalValue = props.reduce((s: number, p: any) => s + (p.price || 0), 0);
  const avgScore = props.length ? props.reduce((s: number, p: any) => s + (p.investment_score || 0), 0) / props.length : 0;
  
  // City concentration
  const cityCounts: Record<string, number> = {};
  props.forEach((p: any) => { cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });
  const maxCityPct = props.length ? Math.max(...Object.values(cityCounts)) / props.length * 100 : 0;
  
  return {
    properties: props,
    count: props.length,
    totalValue,
    avgScore: Math.round(avgScore),
    cities,
    types,
    diversificationScore: Math.min(100, cities.length * 20 + types.length * 15),
    cityConcentration: Math.round(maxCityPct),
    topCity: Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
  };
}

async function gatherMarketContext(city?: string) {
  let q = supabaseAdmin
    .from("investment_hotspots")
    .select("city, hotspot_score, growth_score, rental_score, roi_score, trend, property_count")
    .order("hotspot_score", { ascending: false })
    .limit(10);
  
  if (city) q = q.eq("city", city);
  const { data } = await q;

  // Get recent alerts
  const { data: alerts } = await supabaseAdmin
    .from("copilot_investment_alerts")
    .select("title, message, city, severity, trend_direction")
    .eq("is_active", true)
    .order("generated_at", { ascending: false })
    .limit(5);

  return { hotspots: data || [], alerts: alerts || [] };
}

// ── Build System Prompt ──

function buildSystemPrompt(context: any, mode: string): string {
  const base = `You are ASTRA Copilot, an elite AI investment advisor for Indonesian real estate. You give precise, data-backed investment recommendations.

RESPONSE FORMAT:
- Use markdown with clear headers
- Always include a **Recommendation** section with level: 🟢 Strong Buy, 🟡 Moderate/Hold, 🔴 Avoid
- Include **Projected ROI** when relevant
- Include **Risk Analysis** with specific factors
- Include **Comparable Opportunities** when discussing a property
- Be direct and actionable, not generic
- Use Indonesian Rupiah (Rp) for all prices
- Reference actual data points, don't make up numbers

CONFIDENCE INDICATORS:
- High confidence (80%+): Based on strong data signals
- Medium confidence (50-79%): Limited comparables
- Low confidence (<50%): Insufficient data, clearly state this`;

  if (mode === "property_analysis" && context.property) {
    const p = context.property;
    const d = context.deal;
    const f = context.forecast;
    return `${base}

PROPERTY CONTEXT:
- Title: ${p.title}
- Price: Rp ${(p.price || 0).toLocaleString("id-ID")}
- Location: ${p.city}, ${p.state || "Indonesia"}
- Type: ${p.property_type || "N/A"}
- Bedrooms: ${p.kt || "N/A"}, Bathrooms: ${p.km || "N/A"}
- Building Area: ${p.building_area_sqm || "N/A"} sqm
- Investment Score: ${p.investment_score || 0}/100
- Demand Heat: ${p.demand_heat_score || 0}/100

DEAL ANALYSIS:
- Deal Score: ${d?.deal_score || "N/A"}/100
- Deal Tag: ${d?.deal_tag || "N/A"}
- Undervaluation: ${d?.undervaluation_percent || 0}%
- Estimated Fair Value: Rp ${(d?.estimated_value || 0).toLocaleString("id-ID")}
- Deal Confidence: ${d?.deal_confidence || "N/A"}%
- Flip Potential: ${d?.flip_potential_score || "N/A"}/100
- Rental Stability: ${d?.rental_stability_score || "N/A"}/100

ROI FORECAST:
- Expected ROI: ${f?.expected_roi_percent || "N/A"}%
- Growth Forecast: ${f?.growth_forecast_percent || "N/A"}%
- Rental Yield: ${f?.rental_yield_percent || "N/A"}%
- Risk Level: ${f?.risk_level || "N/A"}
- 1Y Value: Rp ${(f?.predicted_value_1y || 0).toLocaleString("id-ID")}
- 3Y Value: Rp ${(f?.predicted_value_3y || 0).toLocaleString("id-ID")}
- 5Y Value: Rp ${(f?.predicted_value_5y || 0).toLocaleString("id-ID")}`;
  }

  if (mode === "portfolio_copilot" && context.portfolio) {
    const port = context.portfolio;
    return `${base}

USER PORTFOLIO:
- Properties: ${port.count}
- Total Value: Rp ${(port.totalValue || 0).toLocaleString("id-ID")}
- Avg Investment Score: ${port.avgScore}/100
- Cities: ${port.cities.join(", ")}
- Property Types: ${port.types.join(", ")}
- Diversification Score: ${port.diversificationScore}/100
- Top City Concentration: ${port.topCity} (${port.cityConcentration}%)

PROPERTIES:
${(port.properties || []).slice(0, 10).map((p: any) => `  - ${p.title} | ${p.city} | Rp ${(p.price || 0).toLocaleString("id-ID")} | Score: ${p.investment_score || 0}`).join("\n")}`;
  }

  if (mode === "market_intelligence" && context.market) {
    const mkt = context.market;
    return `${base}

MARKET DATA:
${(mkt.hotspots || []).map((h: any) => `  - ${h.city}: Score ${h.hotspot_score}/100 | Growth ${h.growth_score} | Rental ${h.rental_score} | Trend: ${h.trend} | ${h.property_count} properties`).join("\n")}

ACTIVE ALERTS:
${(mkt.alerts || []).map((a: any) => `  - [${a.severity}] ${a.title}: ${a.message}`).join("\n") || "No active alerts"}`;
  }

  return base;
}

// ── Deal Explanation Generator ──

async function generateDealInsight(propertyId: string): Promise<any> {
  // Check cache first
  const { data: existing } = await supabaseAdmin
    .from("property_ai_insights")
    .select("*")
    .eq("property_id", propertyId)
    .eq("insight_type", "deal_explanation")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing) return existing;

  const ctx = await gatherPropertyContext(propertyId);
  if (!ctx.property) return null;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  const prompt = `Analyze this Indonesian real estate investment opportunity and return a JSON object with these fields:
- why_good_deal: string (2-3 sentences explaining why this is/isn't a good deal)
- risks: array of {factor: string, severity: "low"|"medium"|"high", description: string}
- exit_strategy: {optimal_hold_years: number, exit_method: "sell"|"refinance"|"hold", reasoning: string}
- best_for_persona: string (e.g. "Conservative long-term investor seeking rental income")
- recommendation_level: "strong"|"moderate"|"avoid"
- projected_roi: number (annual %)
- confidence_score: number (0-100)

Property: ${ctx.property.title}
Price: Rp ${ctx.property.price?.toLocaleString("id-ID")}
City: ${ctx.property.city}
Type: ${ctx.property.property_type}
Investment Score: ${ctx.property.investment_score}/100
Deal Score: ${ctx.deal?.deal_score || "N/A"}/100
Undervaluation: ${ctx.deal?.undervaluation_percent || 0}%
ROI Forecast: ${ctx.forecast?.expected_roi_percent || "N/A"}%
Risk Level: ${ctx.forecast?.risk_level || "N/A"}

Return ONLY valid JSON, no markdown.`;

  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) return null;
    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);

    // Store in cache
    const { data: inserted } = await supabaseAdmin
      .from("property_ai_insights")
      .insert({
        property_id: propertyId,
        insight_type: "deal_explanation",
        why_good_deal: parsed.why_good_deal,
        risks: parsed.risks,
        exit_strategy: parsed.exit_strategy,
        best_for_persona: parsed.best_for_persona,
        recommendation_level: parsed.recommendation_level,
        projected_roi: parsed.projected_roi,
        confidence_score: parsed.confidence_score,
        raw_reasoning: rawContent,
      })
      .select()
      .single();

    return inserted;
  } catch (e) {
    console.error("Deal insight generation failed:", e);
    return null;
  }
}

// ── Predictive Alerts Generator ──

async function generatePredictiveAlerts() {
  const { data: hotspots } = await supabaseAdmin
    .from("investment_hotspots")
    .select("city, state, hotspot_score, growth_score, rental_score, trend, property_count, avg_roi")
    .gte("hotspot_score", 20)
    .order("hotspot_score", { ascending: false })
    .limit(30);

  if (!hotspots?.length) return { generated: 0 };

  const alerts: any[] = [];

  for (const h of hotspots) {
    if (h.trend === "hot" && h.growth_score >= 60) {
      alerts.push({
        alert_type: "price_rising",
        title: `${h.city} prices rising fast`,
        message: `${h.city} shows strong growth signals (Score: ${h.growth_score}/100) with ${h.property_count} active listings. Consider entering before prices peak.`,
        city: h.city,
        state: h.state,
        severity: "warning",
        trend_direction: "up",
        trend_magnitude: h.growth_score,
        data_points: { hotspot_score: h.hotspot_score, growth_score: h.growth_score, rental_score: h.rental_score },
      });
    }
    if (h.rental_score >= 65) {
      alerts.push({
        alert_type: "high_rental_yield",
        title: `Strong rental yields in ${h.city}`,
        message: `${h.city} rental market shows excellent returns (Rental Score: ${h.rental_score}/100). Ideal for passive income investors.`,
        city: h.city,
        state: h.state,
        severity: "info",
        trend_direction: "up",
        trend_magnitude: h.rental_score,
        data_points: { rental_score: h.rental_score, avg_roi: h.avg_roi },
      });
    }
    if (h.trend === "cooling" && h.hotspot_score < 40) {
      alerts.push({
        alert_type: "market_cooling",
        title: `${h.city} market cooling down`,
        message: `Demand signals weakening in ${h.city} (Score: ${h.hotspot_score}/100). Consider reducing exposure or waiting for better entry.`,
        city: h.city,
        state: h.state,
        severity: "alert",
        trend_direction: "down",
        trend_magnitude: h.hotspot_score,
        data_points: { hotspot_score: h.hotspot_score, trend: h.trend },
      });
    }
    if (h.trend === "emerging" && h.growth_score >= 50) {
      alerts.push({
        alert_type: "emerging_market",
        title: `${h.city} emerging as investment hotspot`,
        message: `Early signals show ${h.city} gaining momentum (Growth: ${h.growth_score}/100). Early investors may benefit from appreciation.`,
        city: h.city,
        state: h.state,
        severity: "opportunity",
        trend_direction: "up",
        trend_magnitude: h.growth_score,
        data_points: { hotspot_score: h.hotspot_score, growth_score: h.growth_score },
      });
    }
  }

  if (alerts.length) {
    // Deactivate old alerts
    await supabaseAdmin
      .from("copilot_investment_alerts")
      .update({ is_active: false })
      .lt("generated_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    // Insert new alerts in chunks
    for (let i = 0; i < alerts.length; i += 20) {
      await supabaseAdmin.from("copilot_investment_alerts").insert(alerts.slice(i, i + 20));
    }
  }

  return { generated: alerts.length };
}

// ── Main Handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode, messages, property_id, user_id, conversation_id } = body;

    // Non-streaming modes
    if (mode === "generate_deal_insight") {
      if (!property_id) return json({ error: "property_id required" }, 400);
      const insight = await generateDealInsight(property_id);
      return json({ data: insight });
    }

    if (mode === "generate_alerts") {
      const result = await generatePredictiveAlerts();
      return json({ data: result });
    }

    if (mode === "get_alerts") {
      const { data } = await supabaseAdmin
        .from("copilot_investment_alerts")
        .select("*")
        .eq("is_active", true)
        .order("generated_at", { ascending: false })
        .limit(20);
      return json({ data });
    }

    if (mode === "get_insight") {
      if (!property_id) return json({ error: "property_id required" }, 400);
      const { data } = await supabaseAdmin
        .from("property_ai_insights")
        .select("*")
        .eq("property_id", property_id)
        .eq("insight_type", "deal_explanation")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (!data) {
        // Generate on demand
        const insight = await generateDealInsight(property_id);
        return json({ data: insight });
      }
      return json({ data });
    }

    // ── Streaming Chat Mode ──
    if (!messages?.length) return json({ error: "messages required" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    // Determine context mode and gather data
    let contextMode = "general";
    let context: any = {};
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    if (property_id) {
      contextMode = "property_analysis";
      context = await gatherPropertyContext(property_id);
    } else if (
      lastMessage.includes("portfolio") ||
      lastMessage.includes("diversif") ||
      lastMessage.includes("my propert") ||
      lastMessage.includes("overexposed")
    ) {
      contextMode = "portfolio_copilot";
      if (user_id) {
        context.portfolio = await gatherPortfolioContext(user_id);
      }
    } else if (
      lastMessage.includes("market") ||
      lastMessage.includes("city") ||
      lastMessage.includes("trend") ||
      lastMessage.includes("hotspot") ||
      lastMessage.includes("bali") ||
      lastMessage.includes("jakarta") ||
      lastMessage.includes("surabaya") ||
      lastMessage.includes("bandung")
    ) {
      contextMode = "market_intelligence";
      // Extract city from message
      const cityMatch = lastMessage.match(/(?:in|di|for)\s+(bali|jakarta|surabaya|bandung|yogyakarta|semarang|makassar|medan|denpasar|bekasi|tangerang|bogor|malang|lombok)/i);
      context.market = await gatherMarketContext(cityMatch?.[1]);
    } else {
      // General investment query — still provide market context
      context.market = await gatherMarketContext();
      contextMode = "market_intelligence";
    }

    const systemPrompt = buildSystemPrompt(context, contextMode);

    // Save conversation if user is authenticated
    let convId = conversation_id;
    if (user_id && !convId) {
      const { data: conv } = await supabaseAdmin
        .from("copilot_conversations")
        .insert({ user_id, title: messages[0]?.content?.slice(0, 80) || "New Conversation", context_type: contextMode, context_id: property_id })
        .select("id")
        .single();
      convId = conv?.id;
    }

    // Save user message
    if (convId) {
      await supabaseAdmin
        .from("copilot_messages")
        .insert({ conversation_id: convId, role: "user", content: messages[messages.length - 1].content });
    }

    // Stream from Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context window
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return json({ error: "AI service unavailable" }, 500);
    }

    // Collect full response for saving, while streaming
    const originalBody = aiResponse.body!;
    const [streamForClient, streamForCapture] = originalBody.tee();

    // Background: capture full response and save
    if (convId) {
      (async () => {
        try {
          const reader = streamForCapture.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) fullContent += delta;
              } catch {}
            }
          }
          if (fullContent) {
            await supabaseAdmin
              .from("copilot_messages")
              .insert({ conversation_id: convId, role: "assistant", content: fullContent });
          }
        } catch (e) {
          console.error("Failed to save assistant message:", e);
        }
      })();
    } else {
      // Still need to consume the teed stream to avoid backpressure
      streamForCapture.cancel();
    }

    return new Response(streamForClient, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("investor-copilot error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
