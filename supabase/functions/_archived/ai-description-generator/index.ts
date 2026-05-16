import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { property_id, tone = "luxury", save_results = false, rewrite_text, standalone = false, property_data } = body;

    // Fetch property data from DB or use standalone payload
    let propertyData: any = null;
    if (standalone && property_data) {
      propertyData = property_data;
    } else if (property_id) {
      const { data } = await supabase
        .from("properties")
        .select("title, property_type, listing_type, city, state, location, bedrooms, bathrooms, area_sqm, land_area_sqm, price, features, amenities, description, has_pool, has_garden, has_parking, has_security, furnishing, year_built, certificate_type")
        .eq("id", property_id)
        .maybeSingle();
      propertyData = data;
    }

    if (!propertyData) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneInstructions: Record<string, string> = {
      luxury: "Use sophisticated, aspirational language befitting a premium property. Emphasize exclusivity, craftsmanship, and lifestyle elevation.",
      investment: "Focus on ROI potential, rental yields, capital appreciation, and market positioning. Use data-driven language.",
      family: "Warm, welcoming tone emphasizing safety, community, schools nearby, and family-friendly amenities.",
      minimalist: "Clean, modern, concise language. Focus on design, space, and functionality.",
      resort: "Evocative, sensory language emphasizing relaxation, tropical atmosphere, and vacation lifestyle.",
    };

    const amenitiesList = [
      propertyData.has_pool && "Swimming Pool",
      propertyData.has_garden && "Garden",
      propertyData.has_parking && "Parking",
      propertyData.has_security && "24/7 Security",
      propertyData.furnishing && `${propertyData.furnishing} Furnished`,
    ].filter(Boolean).join(", ");

    const featuresText = Array.isArray(propertyData.features) ? propertyData.features.join(", ") : (propertyData.features || "");
    const amenitiesText = Array.isArray(propertyData.amenities) ? propertyData.amenities.join(", ") : (propertyData.amenities || amenitiesList);

    const systemPrompt = `You are an expert Indonesian real estate copywriter for ASTRA Villa Realty, a premium property platform.

Your task is to generate professional marketing content for a property listing.

TONE: ${toneInstructions[tone] || toneInstructions.luxury}

You MUST respond with valid JSON matching this exact structure:
{
  "listing_title": "Compelling property title (max 80 chars)",
  "long_description": "Marketing description (200-350 words). Include location advantages, property highlights, lifestyle benefits, and a call to action.",
  "seo_description": "SEO meta description (140-160 chars exactly)",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"],
  "investment_statement": "One compelling paragraph about investment potential (50-80 words)",
  "social_caption": "Instagram-style caption with emojis and hashtags (max 200 chars)",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Do NOT include any text outside the JSON object.`;

    const userPrompt = rewrite_text
      ? `Rewrite and improve this existing description while maintaining key facts:\n\n"${rewrite_text}"\n\nProperty details for context:\n- Type: ${propertyData.property_type}\n- Location: ${propertyData.city}, ${propertyData.state}\n- Bedrooms: ${propertyData.bedrooms || "N/A"}\n- Bathrooms: ${propertyData.bathrooms || "N/A"}\n- Size: ${propertyData.area_sqm || "N/A"} sqm\n- Price: IDR ${propertyData.price?.toLocaleString() || "N/A"}`
      : `Generate listing content for this property:

- Type: ${propertyData.property_type}
- Listing: ${propertyData.listing_type || "sale"}
- Location: ${propertyData.location || ""}, ${propertyData.city}, ${propertyData.state}
- Bedrooms: ${propertyData.bedrooms || "N/A"}
- Bathrooms: ${propertyData.bathrooms || "N/A"}
- Building Size: ${propertyData.area_sqm || "N/A"} sqm
- Land Size: ${propertyData.land_area_sqm || "N/A"} sqm
- Price: IDR ${propertyData.price?.toLocaleString() || "N/A"}
- Year Built: ${propertyData.year_built || "N/A"}
- Certificate: ${propertyData.certificate_type || "N/A"}
- Features: ${featuresText || "Not specified"}
- Amenities: ${amenitiesText || "Not specified"}
- Current Title: ${propertyData.title || "None"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted.", upgrade_required: true }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiRes.text();
      console.error("AI gateway error:", status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = raw;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    let result;
    try {
      result = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI response:", raw);
      throw new Error("AI returned invalid format");
    }

    // Optionally save results back to property
    if (save_results && property_id) {
      await supabase
        .from("properties")
        .update({
          title: result.listing_title || propertyData.title,
          description: result.long_description,
          seo_description: result.seo_description,
        })
        .eq("id", property_id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-description-generator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
