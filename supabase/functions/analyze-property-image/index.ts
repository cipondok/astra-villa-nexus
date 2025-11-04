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
    const { imageUrl, propertyImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze the uploaded image to extract features
    const uploadedImageAnalysis = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                text: `Analyze this property image and extract key features. Return a JSON object with:
                - propertyType (apartment, house, villa, commercial, land)
                - bedrooms (estimated number, 0 if can't determine)
                - style (modern, traditional, minimalist, luxury, etc.)
                - hasPool (boolean)
                - hasGarden (boolean)
                - hasBalcony (boolean)
                - exteriorColor (dominant color)
                - architectureStyle (contemporary, colonial, mediterranean, etc.)
                - condition (new, renovated, needs_work)
                
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

    if (!uploadedImageAnalysis.ok) {
      if (uploadedImageAnalysis.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (uploadedImageAnalysis.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI analysis failed: ${uploadedImageAnalysis.status}`);
    }

    const uploadedAnalysisData = await uploadedImageAnalysis.json();
    const uploadedFeaturesText = uploadedAnalysisData.choices[0].message.content;
    
    // Parse JSON from the response
    const uploadedFeatures = JSON.parse(uploadedFeaturesText);

    // If we have property images to compare, calculate similarity
    let similarities = [];
    if (propertyImages && propertyImages.length > 0) {
      similarities = await Promise.all(
        propertyImages.map(async (property: any) => {
          if (!property.imageUrl) {
            return { propertyId: property.id, similarity: 0, features: {} };
          }

          try {
            // Analyze each property image
            const propertyAnalysis = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                        text: `Analyze this property image and extract the same features as before. Return only a JSON object.`
                      },
                      {
                        type: "image_url",
                        image_url: { url: property.imageUrl }
                      }
                    ]
                  }
                ]
              })
            });

            if (!propertyAnalysis.ok) {
              return { propertyId: property.id, similarity: 0, features: {} };
            }

            const propertyData = await propertyAnalysis.json();
            const propertyFeaturesText = propertyData.choices[0].message.content;
            const propertyFeatures = JSON.parse(propertyFeaturesText);

            // Calculate similarity score
            let similarity = 0;
            let totalWeight = 0;

            // Property type match (30% weight)
            if (uploadedFeatures.propertyType === propertyFeatures.propertyType) {
              similarity += 30;
            }
            totalWeight += 30;

            // Style match (20% weight)
            if (uploadedFeatures.style === propertyFeatures.style) {
              similarity += 20;
            }
            totalWeight += 20;

            // Architecture style (15% weight)
            if (uploadedFeatures.architectureStyle === propertyFeatures.architectureStyle) {
              similarity += 15;
            }
            totalWeight += 15;

            // Bedrooms proximity (10% weight)
            if (uploadedFeatures.bedrooms > 0 && propertyFeatures.bedrooms > 0) {
              const bedroomDiff = Math.abs(uploadedFeatures.bedrooms - propertyFeatures.bedrooms);
              similarity += Math.max(0, 10 - (bedroomDiff * 3));
            }
            totalWeight += 10;

            // Amenities match (25% total)
            if (uploadedFeatures.hasPool === propertyFeatures.hasPool) similarity += 8;
            if (uploadedFeatures.hasGarden === propertyFeatures.hasGarden) similarity += 8;
            if (uploadedFeatures.hasBalcony === propertyFeatures.hasBalcony) similarity += 9;
            totalWeight += 25;

            return {
              propertyId: property.id,
              similarity: Math.round(similarity),
              features: propertyFeatures
            };
          } catch (error) {
            console.error(`Error analyzing property ${property.id}:`, error);
            return { propertyId: property.id, similarity: 0, features: {} };
          }
        })
      );
    }

    return new Response(
      JSON.stringify({
        uploadedFeatures,
        similarities: similarities.sort((a, b) => b.similarity - a.similarity)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in analyze-property-image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
