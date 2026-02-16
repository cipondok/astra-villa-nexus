import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl, title, description, propertyType, location } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
      console.error("Invalid imageUrl:", imageUrl);
      return new Response(
        JSON.stringify({
          relevant: false,
          relevanceScore: 0,
          imageType: "unknown",
          issues: ["Invalid or missing image URL"],
          suggestion: "Replace with a valid image URL",
          confidence: 100,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeTitle = (title && typeof title === "string" && title.trim()) ? title.trim() : "Untitled property";
    const safeDesc = (description && typeof description === "string" && description.trim()) ? description.trim() : "";

    const listingContext = [
      `Title: "${safeTitle}"`,
      safeDesc && `Description: "${safeDesc.substring(0, 500)}"`,
      propertyType && `Property Type: ${propertyType}`,
      location && `Location: ${location}`,
    ].filter(Boolean).join("\n");

    console.log("Checking relevance for:", imageUrl.substring(0, 100), "| context length:", listingContext.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              {
                type: "text",
                text: `You are a property listing quality inspector. Analyze this image and determine if it is relevant to the property listing below.

Listing Details:
${listingContext}

Evaluate and return a JSON object with these fields:
- "relevant": boolean
- "relevanceScore": number (0-100)
- "imageType": string (e.g. "exterior", "interior", "bedroom", "bathroom", "kitchen", "garden", "pool", "floor_plan", "logo", "unrelated", "stock_photo")
- "issues": string[] (empty array if none)
- "suggestion": string (brief actionable suggestion)
- "confidence": number (0-100)

Only return the JSON object, no other text.`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, errorBody.substring(0, 500));

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For 400 errors, return a graceful fallback instead of crashing
      return new Response(
        JSON.stringify({
          relevant: true,
          relevanceScore: 50,
          imageType: "unknown",
          issues: ["AI could not analyze this image (may be inaccessible or unsupported format)"],
          suggestion: "Manual review recommended — AI could not access this image",
          confidence: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON, handling potential markdown code blocks
    let result;
    try {
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      result = {
        relevant: true,
        relevanceScore: 50,
        imageType: "unknown",
        issues: ["Could not parse AI response"],
        suggestion: "Manual review recommended",
        confidence: 0
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-image-relevance:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
