import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, title, description, propertyType, location, brokenImageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!propertyId || !title) throw new Error("propertyId and title are required");

    // Build a descriptive prompt from property details
    const prompt = [
      `Generate a realistic, high-quality real estate property photo for:`,
      `Property: "${title}"`,
      propertyType && `Type: ${propertyType}`,
      location && `Location: ${location}`,
      description && `Description: ${description.slice(0, 200)}`,
      `Style: Professional real estate listing photo, well-lit, attractive angle, 16:9 aspect ratio.`,
      `The image should look like a genuine property listing photograph.`,
    ].filter(Boolean).join("\n");

    // Generate image using Gemini image model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error("No image generated");
    }

    // Convert base64 to blob and upload to storage
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Get auth user for storage path
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `ai-generated/${propertyId}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(fileName, bytes, { contentType: "image/png", upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: urlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(fileName);

    const newImageUrl = urlData.publicUrl;

    // Update property: replace broken URL with new one
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("images, thumbnail_url")
      .eq("id", propertyId)
      .single();

    if (fetchError) throw fetchError;

    let images = Array.isArray(property.images) ? [...property.images] : [];
    const brokenIdx = images.indexOf(brokenImageUrl);
    if (brokenIdx !== -1) {
      images[brokenIdx] = newImageUrl;
    } else {
      images.push(newImageUrl);
    }

    const newThumb = property.thumbnail_url === brokenImageUrl ? newImageUrl : property.thumbnail_url;

    const { error: updateError } = await supabase
      .from("properties")
      .update({ images, thumbnail_url: newThumb || newImageUrl })
      .eq("id", propertyId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, newImageUrl, replacedUrl: brokenImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in regenerate-property-image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
