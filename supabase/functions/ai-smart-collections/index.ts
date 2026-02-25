import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalize(value: number, max: number, min = 0): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function computeEngagementScore(row: any, maxes: any): number {
  return (
    0.3 * normalize(row.views_total || 0, maxes.views) +
    0.25 * normalize(row.saves_total || 0, maxes.saves) +
    0.25 * normalize(row.inquiries_total || 0, maxes.inquiries) +
    0.1 * normalize(row.clicks_total || 0, maxes.clicks) +
    0.1 * normalize(row.avg_dwell || 0, maxes.dwell)
  ) * 100;
}

function computeInvestmentScore(p: any): number {
  const roi = normalize(p.roi_percentage || 0, 20);
  const yield_ = normalize(p.rental_yield_percentage || 0, 15);
  const legal = ["SHM", "HGB"].includes(p.legal_status) ? 1 : 0.5;
  const priceSqm = p.price && p.area_sqm ? normalize(p.price / p.area_sqm, 100_000_000, 1_000_000) : 0.5;
  const wna = p.wna_eligible ? 1 : 0.7;
  return (0.3 * roi + 0.25 * yield_ + 0.15 * legal + 0.15 * (1 - priceSqm) + 0.15 * wna) * 100;
}

function computeLivabilityScore(p: any): number {
  const amenities = ((p.has_pool ? 1 : 0) + (p.has_garden ? 1 : 0) + (p.parking_spaces > 0 ? 1 : 0)) / 3;
  const area = normalize(p.building_area_sqm || p.area_sqm || 0, 500, 50);
  const beds = p.bedrooms ? (p.bedrooms >= 3 && p.bedrooms <= 5 ? 1 : normalize(p.bedrooms, 5, 1)) : 0.5;
  const furnish = p.furnishing === "furnished" ? 1 : p.furnishing === "semi-furnished" ? 0.75 : 0.5;
  const view = ["ocean", "sea", "beach", "mountain", "rice field", "valley"].includes((p.view_type || "").toLowerCase()) ? 1 : 0.6;
  return (0.25 * amenities + 0.2 * area + 0.2 * beds + 0.2 * furnish + 0.15 * view) * 100;
}

function computeLuxuryScore(p: any): number {
  const price5B = 5_000_000_000;
  const priceScore = (p.price || 0) > price5B ? 1 : (p.price || 0) / price5B;
  const techAmenities = ((p.has_pool ? 1 : 0) + (p.three_d_model_url ? 1 : 0) + (p.has_vr ? 1 : 0)) / 3;
  const land = normalize(p.land_area_sqm || p.area_sqm || 0, 2000, 500);
  const view = ["ocean", "sea", "beach", "mountain"].includes((p.view_type || "").toLowerCase()) ? 1 : 0.5;
  const images = normalize((p.images || []).length, 20, 3);
  return (0.25 * priceScore + 0.2 * techAmenities + 0.2 * land + 0.15 * view + 0.2 * images) * 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, collection_type, limit: reqLimit, property_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ─── RECALCULATE SCORES ───
    if (action === "recalculate_scores") {
      const { data: properties, error: pErr } = await supabase
        .from("properties")
        .select("id, price, area_sqm, bedrooms, bathrooms, roi_percentage, rental_yield_percentage, legal_status, wna_eligible, has_pool, has_garden, parking_spaces, building_area_sqm, land_area_sqm, furnishing, view_type, three_d_model_url, has_vr, has_360_view, has_drone_video, images")
        .eq("status", "active")
        .limit(5000);

      if (pErr) throw pErr;

      // Aggregate behavior signals
      const { data: signals } = await supabase
        .from("user_behavior_signals")
        .select("property_id, signal_type, signal_value");

      const { data: favCounts } = await supabase
        .from("favorites")
        .select("property_id");

      // Build aggregation maps
      const agg: Record<string, { views: number; clicks: number; saves: number; inquiries: number; dwell: number; dwellCount: number }> = {};
      for (const s of signals || []) {
        if (!s.property_id) continue;
        if (!agg[s.property_id]) agg[s.property_id] = { views: 0, clicks: 0, saves: 0, inquiries: 0, dwell: 0, dwellCount: 0 };
        const a = agg[s.property_id];
        if (s.signal_type === "view") a.views += (s.signal_value || 1);
        else if (s.signal_type === "click") a.clicks += (s.signal_value || 1);
        else if (s.signal_type === "save") a.saves += (s.signal_value || 1);
        else if (s.signal_type === "inquiry") a.inquiries += (s.signal_value || 1);
        else if (s.signal_type === "dwell_time") { a.dwell += (s.signal_value || 0); a.dwellCount++; }
      }

      // Count favorites
      for (const f of favCounts || []) {
        if (!f.property_id) continue;
        if (!agg[f.property_id]) agg[f.property_id] = { views: 0, clicks: 0, saves: 0, inquiries: 0, dwell: 0, dwellCount: 0 };
        agg[f.property_id].saves++;
      }

      // Compute maxes for normalization
      const allAggs = Object.values(agg);
      const maxes = {
        views: Math.max(1, ...allAggs.map(a => a.views)),
        saves: Math.max(1, ...allAggs.map(a => a.saves)),
        inquiries: Math.max(1, ...allAggs.map(a => a.inquiries)),
        clicks: Math.max(1, ...allAggs.map(a => a.clicks)),
        dwell: Math.max(1, ...allAggs.map(a => a.dwellCount > 0 ? a.dwell / a.dwellCount : 0)),
      };

      // Upsert scores
      const upserts = (properties || []).map((p: any) => {
        const a = agg[p.id] || { views: 0, clicks: 0, saves: 0, inquiries: 0, dwell: 0, dwellCount: 0 };
        const avgDwell = a.dwellCount > 0 ? a.dwell / a.dwellCount : 0;
        const engRow = { views_total: a.views, saves_total: a.saves, inquiries_total: a.inquiries, clicks_total: a.clicks, avg_dwell: avgDwell };
        return {
          property_id: p.id,
          views_total: a.views,
          saves_total: a.saves,
          inquiries_total: a.inquiries,
          clicks_total: a.clicks,
          avg_dwell_seconds: avgDwell,
          engagement_score: Math.round(computeEngagementScore(engRow, maxes) * 100) / 100,
          investment_score: Math.round(computeInvestmentScore(p) * 100) / 100,
          livability_score: Math.round(computeLivabilityScore(p) * 100) / 100,
          luxury_score: Math.round(computeLuxuryScore(p) * 100) / 100,
          last_calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Batch upsert in chunks of 500
      for (let i = 0; i < upserts.length; i += 500) {
        const chunk = upserts.slice(i, i + 500);
        const { error: uErr } = await supabase.from("property_engagement_scores").upsert(chunk, { onConflict: "property_id" });
        if (uErr) console.error("Upsert error:", uErr);
      }

      return new Response(JSON.stringify({ success: true, processed: upserts.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── GET COLLECTION ───
    if (action === "get_collection") {
      const limit = reqLimit || 12;
      const scoreColumn: Record<string, string> = {
        best_investment: "investment_score",
        best_for_living: "livability_score",
        luxury_collection: "luxury_score",
        trending: "engagement_score",
      };

      const col = scoreColumn[collection_type] || "engagement_score";

      const { data: scores, error: sErr } = await supabase
        .from("property_engagement_scores")
        .select("property_id, engagement_score, investment_score, livability_score, luxury_score, predicted_roi, roi_confidence")
        .order(col, { ascending: false })
        .limit(limit);

      if (sErr) throw sErr;

      if (!scores || scores.length === 0) {
        return new Response(JSON.stringify({ properties: [], collection_type }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const propertyIds = scores.map((s: any) => s.property_id);
      const { data: properties, error: pErr } = await supabase
        .from("properties")
        .select("id, title, price, location, city, state, bedrooms, bathrooms, area_sqm, property_type, listing_type, images, thumbnail_url, roi_percentage, rental_yield_percentage, legal_status, wna_eligible, view_type")
        .in("id", propertyIds)
        .eq("status", "active");

      if (pErr) throw pErr;

      // Merge scores with properties
      const scoreMap = new Map(scores.map((s: any) => [s.property_id, s]));
      const merged = (properties || [])
        .map((p: any) => ({ ...p, scores: scoreMap.get(p.id) }))
        .sort((a: any, b: any) => ((b.scores?.[col] || 0) - (a.scores?.[col] || 0)));

      return new Response(JSON.stringify({ properties: merged, collection_type }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── PREDICT ROI ───
    if (action === "predict_roi") {
      if (!property_id) throw new Error("property_id required");

      const { data: prop } = await supabase
        .from("properties")
        .select("id, title, price, location, city, property_type, area_sqm, bedrooms, roi_percentage, rental_yield_percentage, legal_status, wna_eligible, view_type")
        .eq("id", property_id)
        .single();

      if (!prop) throw new Error("Property not found");

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ status: 503, error: "AI not configured" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a real estate investment analyst specializing in Indonesian property markets (Bali, Jakarta, Lombok). Predict ROI based on property data and market trends." },
            { role: "user", content: `Predict 12-month ROI for this property:\n${JSON.stringify(prop, null, 2)}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "predict_roi",
              description: "Return ROI prediction for property",
              parameters: {
                type: "object",
                properties: {
                  predicted_roi: { type: "number", description: "Predicted ROI percentage (e.g. 8.5)" },
                  confidence: { type: "number", description: "Confidence 0-1" },
                  trend: { type: "string", enum: ["rising", "stable", "declining"] },
                  explanation: { type: "string", description: "One-line explanation" },
                },
                required: ["predicted_roi", "confidence", "trend", "explanation"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "predict_roi" } },
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429 || status === 402) {
          return new Response(JSON.stringify({ status, error: status === 429 ? "Rate limited" : "Credits required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${status}`);
      }

      const aiData = await aiResponse.json();
      let prediction = { predicted_roi: 0, confidence: 0, trend: "stable", explanation: "Unable to predict" };
      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          prediction = JSON.parse(toolCall.function.arguments);
        }
      } catch (e) {
        console.error("Failed to parse AI prediction:", e);
      }

      // Store prediction
      await supabase.from("property_engagement_scores").upsert({
        property_id,
        predicted_roi: prediction.predicted_roi,
        roi_confidence: prediction.confidence,
        updated_at: new Date().toISOString(),
      }, { onConflict: "property_id" });

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-smart-collections error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
