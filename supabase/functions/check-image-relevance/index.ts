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
    const { imageUrl, title, description, propertyType, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("imageUrl is required");
    }

    const listingContext = [
      title && `Title: "${title}"`,
      description && `Description: "${description}"`,
      propertyType && `Property Type: ${propertyType}`,
      location && `Location: ${location}`,
    ].filter(Boolean).join("\n");

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
- "relevant": boolean - Is the image related to this property listing?
- "relevanceScore": number (0-100) - How relevant is the image to the listing
- "imageType": string - What the image shows (e.g., "exterior", "interior", "bedroom", "bathroom", "kitchen", "garden", "pool", "street_view", "floor_plan", "logo", "unrelated", "stock_photo", "text_graphic")
- "issues": string[] - List of specific problems found (empty array if none). Examples: "Image shows a restaurant, not a property", "Generic stock photo not of this property", "Image is a logo/watermark, not a property photo", "Image appears to be of a different property type", "Image is too blurry to verify"
- "suggestion": string - Brief actionable suggestion for the admin (e.g., "Replace with actual property photo", "Image looks good", "Consider removing - appears unrelated")
- "confidence": number (0-100) - How confident you are in this assessment

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI analysis failed: ${response.status}`);
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
