import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { land_area, building_area, bedrooms, bathrooms, province, city, property_type } = await req.json();

    if (!land_area || !building_area || !province || !city) {
      return new Response(JSON.stringify({ error: "Missing required fields: land_area, building_area, province, city" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch comparable listings from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: comparables } = await supabase
      .from("properties")
      .select("title, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, city, province, property_type")
      .eq("city", city)
      .eq("status", "active")
      .not("price", "is", null)
      .gt("price", 0)
      .limit(30);

    const comparablesContext = comparables && comparables.length > 0
      ? `\n\nCOMPARABLE LISTINGS IN ${city}, ${province} (${comparables.length} found):\n${comparables.map(p =>
          `- ${p.title}: Rp ${Number(p.price).toLocaleString('id-ID')} | LT:${p.land_area_sqm}m² LB:${p.building_area_sqm}m² | ${p.bedrooms}KT ${p.bathrooms}KM | Type: ${p.property_type}`
        ).join('\n')}`
      : `\n\nNo direct comparables found in ${city}. Use general Indonesian market knowledge for ${province}.`;

    const prompt = `You are an expert Indonesian real estate appraiser and investment analyst. Analyze this property and provide a market value estimation.

PROPERTY DETAILS:
- Land Area (LT): ${land_area} m²
- Building Area (LB): ${building_area} m²
- Bedrooms (KT): ${bedrooms || 'Not specified'}
- Bathrooms (KM): ${bathrooms || 'Not specified'}
- Location: ${city}, ${province}
- Property Type: ${property_type || 'Residential'}
${comparablesContext}

RESPOND WITH EXACTLY THIS JSON FORMAT (no other text):
{
  "price_low": <number in IDR>,
  "price_mid": <number in IDR>,
  "price_high": <number in IDR>,
  "price_per_sqm_land": <number in IDR>,
  "price_per_sqm_building": <number in IDR>,
  "confidence": <number 1-100>,
  "investment_score": <number 1-10>,
  "rental_yield_percent": <number like 4.5>,
  "monthly_rental_estimate": <number in IDR>,
  "annual_appreciation_percent": <number like 8.0>,
  "roi_5year_percent": <number>,
  "market_positioning": "<luxury|premium|mid-range|affordable|budget>",
  "comparable_count": <number of relevant comparables used>,
  "key_factors": ["factor1", "factor2", "factor3"],
  "investment_highlights": ["highlight1", "highlight2", "highlight3"],
  "risk_factors": ["risk1", "risk2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a real estate valuation AI. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    jsonStr = jsonStr.trim();

    const estimation = JSON.parse(jsonStr);

    return new Response(JSON.stringify({
      success: true,
      estimation,
      input: { land_area, building_area, bedrooms, bathrooms, province, city, property_type },
      comparables_used: comparables?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("price-estimator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
