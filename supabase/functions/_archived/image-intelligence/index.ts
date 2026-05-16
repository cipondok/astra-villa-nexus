import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DETECTABLE_FEATURES = [
  "pool",
  "garden",
  "balcony",
  "ocean_view",
  "modern_kitchen",
  "parking",
  "rooftop",
  "gym",
  "security_gate",
  "solar_panels",
  "jacuzzi",
  "home_theater",
  "walk_in_closet",
  "marble_flooring",
  "smart_home",
  "waterfront",
  "mountain_view",
  "terrace",
  "garage",
  "playground",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { property_id, image_urls } = await req.json();

    if (!property_id || !image_urls?.length) {
      return new Response(
        JSON.stringify({ error: "property_id and image_urls[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify property exists
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, title")
      .eq("id", property_id)
      .single();

    if (propError || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allDetected: string[] = [];
    const results: Array<{
      image_url: string;
      detected_features: string[];
      confidence_scores: Record<string, number>;
    }> = [];

    // Analyze each image with Gemini vision
    for (const imageUrl of image_urls.slice(0, 10)) {
      try {
        const prompt = `Analyze this property/real estate image. Detect which of the following features are visible in the image. For each detected feature, provide a confidence score from 0.0 to 1.0.

Features to detect: ${DETECTABLE_FEATURES.join(", ")}

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{"detected": [{"feature": "pool", "confidence": 0.95}]}

Only include features that are actually visible. Minimum confidence threshold: 0.6`;

        const response = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: imageUrl } },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 429) {
            console.warn("Rate limited, skipping image:", imageUrl);
            continue;
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          console.error("AI error for image:", imageUrl, response.status);
          continue;
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonStr = codeBlockMatch[1];
        jsonStr = jsonStr.trim();

        const parsed = JSON.parse(jsonStr);
        const detected = parsed.detected || [];

        const features: string[] = [];
        const scores: Record<string, number> = {};

        for (const item of detected) {
          const feature = item.feature?.toLowerCase();
          const confidence = parseFloat(item.confidence);
          if (
            feature &&
            DETECTABLE_FEATURES.includes(feature) &&
            confidence >= 0.6
          ) {
            features.push(feature);
            scores[feature] = Math.round(confidence * 100) / 100;
            if (!allDetected.includes(feature)) {
              allDetected.push(feature);
            }
          }
        }

        results.push({
          image_url: imageUrl,
          detected_features: features,
          confidence_scores: scores,
        });

        // Store per-image results
        await supabase.from("property_image_features").insert({
          property_id,
          image_url: imageUrl,
          detected_features: features,
          confidence_scores: scores,
          analysis_metadata: {
            model: "gemini-2.5-flash",
            total_features_checked: DETECTABLE_FEATURES.length,
            analyzed_at: new Date().toISOString(),
          },
        });
      } catch (imgError) {
        console.error("Error analyzing image:", imageUrl, imgError);
        continue;
      }
    }

    // Update property features column if it exists
    try {
      await supabase
        .from("properties")
        .update({ features: allDetected })
        .eq("id", property_id);
    } catch {
      // features column may not exist, that's ok
    }

    return new Response(
      JSON.stringify({
        property_id,
        detected_features: allDetected,
        image_results: results,
        total_images_analyzed: results.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
