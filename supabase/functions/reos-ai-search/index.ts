// REOS AI Search — natural language → ranked properties + insight
// Uses Lovable AI Gateway (google/gemini-3-flash-preview)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface SearchReq {
  query: string;
  limit?: number;
}

interface AiRanked {
  property_id: string;
  ai_score: number;
  reason: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as SearchReq;
    const query = (body.query || "").trim();
    const limit = Math.min(body.limit ?? 8, 20);
    if (!query) {
      return new Response(JSON.stringify({ error: "query required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pull a candidate pool — featured + recent active listings with investment signals
    const { data: candidates, error } = await supabase
      .from("properties")
      .select("id, title, city, state, location, property_type, listing_type, price, bedrooms, bathrooms, area_sqm, rental_yield_percentage, roi_percentage, investment_score, demand_score, liquidity_score, cover_image, images, slug")
      .eq("status", "active")
      .order("investment_score", { ascending: false, nullsFirst: false })
      .limit(60);

    if (error) throw error;
    const pool = candidates ?? [];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compact property list for the model
    const compact = pool.map(p => ({
      id: p.id,
      title: p.title,
      city: p.city, state: p.state, location: p.location,
      type: p.property_type, listing: p.listing_type,
      price_idr: p.price,
      bedrooms: p.bedrooms, bathrooms: p.bathrooms, sqm: p.area_sqm,
      yield: p.rental_yield_percentage, roi: p.roi_percentage,
      invest: p.investment_score, demand: p.demand_score, liq: p.liquidity_score,
    }));

    const sys = `You are ASTRA REOS, an investment-grade real estate intelligence assistant for Southeast Asia.
You receive a natural-language user query and a JSON array of candidate properties.
Return STRICT JSON: { "insight": string (<=240 chars), "ranked": [{ "property_id": uuid, "ai_score": 0-100 integer, "reason": string (<=140 chars) }] }
Rank top ${limit} properties best matching the query, weighting ROI, rental yield, demand, liquidity, location fit and price. Do not invent property ids. If pool is empty return ranked: [].`;

    const user = `User query: """${query}"""\n\nCandidates JSON:\n${JSON.stringify(compact)}`;

    const aiRes = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500;
      return new Response(JSON.stringify({ error: "ai_gateway_error", status: aiRes.status, detail: txt.slice(0, 500) }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { insight?: string; ranked?: AiRanked[] } = {};
    try { parsed = JSON.parse(content); } catch { parsed = { insight: content, ranked: [] }; }

    const byId = new Map(pool.map(p => [p.id, p]));
    const enriched = (parsed.ranked ?? [])
      .map(r => {
        const p = byId.get(r.property_id);
        if (!p) return null;
        return { ...p, ai_score: r.ai_score, ai_reason: r.reason };
      })
      .filter(Boolean)
      .slice(0, limit);

    return new Response(JSON.stringify({
      insight: parsed.insight ?? "",
      results: enriched,
      total_pool: pool.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
