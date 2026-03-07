import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { image_url, image_base64, limit = 12 } = await req.json();

    if (!image_url && !image_base64) {
      return new Response(
        JSON.stringify({ error: "Provide image_url or image_base64" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build image content for Gemini vision
    const imageContent = image_url
      ? { type: "image_url" as const, image_url: { url: image_url } }
      : { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${image_base64}` } };

    const prompt = `Analyze this property/real estate image carefully. Extract these attributes:

1. property_type: one of [villa, apartment, house, townhouse, land, commercial, warehouse, office, condo, studio]
2. architecture_style: one of [modern, traditional, minimalist, colonial, mediterranean, tropical, industrial, art_deco, contemporary, balinese, javanese, unknown]
3. has_pool: boolean
4. estimated_floors: number (1-10)
5. environment: one of [beachfront, urban, suburban, rural, mountain, riverside, garden, rooftop, unknown]
6. exterior_color: dominant color [white, gray, brown, beige, dark, colorful, natural, unknown]
7. condition: one of [new, renovated, well_maintained, needs_renovation, unknown]
8. size_impression: one of [compact, medium, large, luxury_estate]
9. has_garden: boolean
10. has_parking: boolean

Respond ONLY with a JSON object, no markdown:
{"property_type":"villa","architecture_style":"modern","has_pool":true,"estimated_floors":2,"environment":"beachfront","exterior_color":"white","condition":"new","size_impression":"large","has_garden":true,"has_parking":true}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: [{ type: "text", text: prompt }, imageContent] },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI vision error:", aiResponse.status, t);
      throw new Error("AI vision analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON (handle markdown code blocks)
    let jsonStr = content;
    const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) jsonStr = codeMatch[1];
    jsonStr = jsonStr.trim();

    let detected: Record<string, any>;
    try {
      detected = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Could not parse image analysis");
    }

    console.log("Visual search detected:", JSON.stringify(detected));

    // Query properties with progressive filtering
    // Start broad, then score by attribute match
    let query = supabase
      .from("properties")
      .select("id, title, price, city, state, property_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, thumbnail_url, features, listing_type, description")
      .eq("status", "active")
      .limit(200);

    // Apply hard filter on property_type if detected
    if (detected.property_type && detected.property_type !== "unknown") {
      // Try exact match first; we'll also score partial matches
      const { data: exactMatch } = await query.eq("property_type", detected.property_type);

      // If too few results, fetch without type filter
      let candidates = exactMatch || [];
      if (candidates.length < 5) {
        const { data: broadMatch } = await supabase
          .from("properties")
          .select("id, title, price, city, state, property_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, thumbnail_url, features, listing_type, description")
          .eq("status", "active")
          .limit(200);
        candidates = broadMatch || [];
      }

      // Score each candidate
      const scored = candidates.map((prop: any) => {
        let score = 0;
        const maxScore = 100;

        // Property type match (25 pts)
        if (prop.property_type === detected.property_type) score += 25;
        else if (
          (detected.property_type === "villa" && prop.property_type === "house") ||
          (detected.property_type === "house" && prop.property_type === "villa") ||
          (detected.property_type === "apartment" && prop.property_type === "condo") ||
          (detected.property_type === "condo" && prop.property_type === "apartment")
        ) score += 15; // close match

        // Features match (up to 25 pts)
        const propFeatures = Array.isArray(prop.features) ? prop.features : [];
        const featureChecks: [string, boolean | undefined][] = [
          ["pool", detected.has_pool],
          ["garden", detected.has_garden],
          ["parking", detected.has_parking],
        ];
        for (const [feat, hasIt] of featureChecks) {
          if (hasIt === true && propFeatures.includes(feat)) score += 8;
          else if (hasIt === false && !propFeatures.includes(feat)) score += 2;
        }

        // Size impression (15 pts)
        const area = Number(prop.building_area_sqm) || Number(prop.land_area_sqm) || 0;
        if (detected.size_impression === "luxury_estate" && area >= 500) score += 15;
        else if (detected.size_impression === "large" && area >= 200 && area < 1000) score += 15;
        else if (detected.size_impression === "medium" && area >= 50 && area < 300) score += 15;
        else if (detected.size_impression === "compact" && area < 100) score += 15;
        else if (area > 0) score += 5; // partial

        // Floors match (10 pts)
        if (detected.estimated_floors && prop.bedrooms) {
          // Rough heuristic: floors correlate loosely with size
          const floors = detected.estimated_floors;
          if (floors >= 3 && Number(prop.bedrooms) >= 4) score += 10;
          else if (floors === 2 && Number(prop.bedrooms) >= 2) score += 8;
          else if (floors === 1 && Number(prop.bedrooms) <= 3) score += 8;
          else score += 3;
        }

        // Environment in description (15 pts)
        if (detected.environment && detected.environment !== "unknown") {
          const desc = (prop.description || "").toLowerCase() + " " + (prop.title || "").toLowerCase() + " " + (prop.city || "").toLowerCase();
          const envKeywords: Record<string, string[]> = {
            beachfront: ["beach", "ocean", "sea", "pantai", "coastal", "waterfront"],
            urban: ["city", "downtown", "urban", "cbd", "kota"],
            suburban: ["suburban", "residential", "perumahan"],
            rural: ["rural", "countryside", "village", "desa"],
            mountain: ["mountain", "hill", "gunung", "highland"],
            riverside: ["river", "sungai", "riverside", "lakeside"],
            garden: ["garden", "taman", "green"],
          };
          const keywords = envKeywords[detected.environment] || [];
          if (keywords.some((kw) => desc.includes(kw))) score += 15;
          else score += 3;
        }

        // Architecture in description (10 pts)
        if (detected.architecture_style && detected.architecture_style !== "unknown") {
          const desc = (prop.description || "").toLowerCase() + " " + (prop.title || "").toLowerCase();
          if (desc.includes(detected.architecture_style.replace("_", " "))) score += 10;
          else score += 2;
        }

        const similarityScore = Math.min(100, Math.round((score / maxScore) * 100));

        return { ...prop, similarity_score: similarityScore };
      });

      // Sort by similarity and take top results
      scored.sort((a: any, b: any) => b.similarity_score - a.similarity_score);
      const topResults = scored.slice(0, Number(limit));

      console.log(`Visual search: ${topResults.length} results, top score: ${topResults[0]?.similarity_score || 0}`);

      return new Response(
        JSON.stringify({
          detected_attributes: detected,
          matched_properties: topResults.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            city: p.city,
            state: p.state,
            property_type: p.property_type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            thumbnail_url: p.thumbnail_url,
            listing_type: p.listing_type,
            similarity_score: p.similarity_score,
          })),
          total_candidates: candidates.length,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if no property type detected
    const { data: fallback } = await supabase
      .from("properties")
      .select("id, title, price, city, state, property_type, bedrooms, bathrooms, thumbnail_url, listing_type")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    return new Response(
      JSON.stringify({
        detected_attributes: detected,
        matched_properties: (fallback || []).map((p: any) => ({ ...p, similarity_score: 30 })),
        total_candidates: fallback?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Visual search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
