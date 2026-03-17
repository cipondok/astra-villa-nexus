import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Invalid token" }, 401);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const body = await req.json();
    const { mode, image_url, enhancement_type, staging_style, room_type } = body;

    if (!image_url) return json({ error: "image_url is required" }, 400);

    let prompt = "";

    if (mode === "enhance") {
      const enhancementPrompts: Record<string, string> = {
        auto_optimize: "Enhance this real estate photo: improve brightness, contrast, and color balance to make it look professional. Fix any dark areas, improve sharpness, and make colors more vibrant. Keep the image realistic and natural-looking. Return the enhanced version of this exact photo.",
        brightness: "Brighten this real estate photo significantly. Increase exposure in dark areas, improve shadow detail, and make the overall image brighter and more inviting while keeping it natural. Return the enhanced version.",
        sharpness: "Sharpen this real estate photo. Improve detail clarity, edge definition, and overall crispness. Make textures and architectural details more visible. Return the enhanced version.",
        noise_reduction: "Clean up this real estate photo by reducing noise and grain while preserving important details. Smooth out artifacts from low-light shooting. Return the cleaned version.",
        color_correction: "Color-correct this real estate photo. Make whites truly white, fix any color casts, improve color saturation naturally, and ensure the colors look accurate and appealing for a real estate listing. Return the corrected version.",
        hdr_effect: "Apply a natural HDR-like effect to this real estate photo. Bring out details in both highlights and shadows, increase dynamic range, and make the image look dramatic yet realistic. Return the enhanced version.",
        twilight: "Transform this exterior real estate photo into a beautiful twilight/dusk shot. Add a warm sunset sky, turn on interior and exterior lights, and create an inviting evening atmosphere. Return the twilight version.",
      };

      prompt = enhancementPrompts[enhancement_type] || enhancementPrompts.auto_optimize;

    } else if (mode === "virtual_staging") {
      const styleDescriptions: Record<string, string> = {
        modern_luxury: "luxurious modern furniture with high-end finishes, designer pieces, marble accents, and elegant decor",
        minimalist: "clean minimalist furniture with simple lines, neutral tones, functional pieces, and uncluttered aesthetic",
        investment_ready: "practical, attractive rental-ready furniture with mass-market appeal, comfortable sofas, standard dining sets, and warm neutral decor",
        tropical_resort: "tropical resort-style furniture with rattan, natural wood, tropical plants, and Bali-inspired decor",
        scandinavian: "Scandinavian-style furniture with light wood, clean lines, cozy textiles, and pastel accents",
        industrial: "industrial-style furniture with exposed materials, metal accents, leather pieces, and urban chic decor",
      };

      const roomLabel = room_type || "living room";
      const styleDesc = styleDescriptions[staging_style] || styleDescriptions.modern_luxury;

      prompt = `Virtually stage this empty ${roomLabel} with ${styleDesc}. Add realistic furniture and decor that fits the room's proportions and lighting. Make it look like a professional interior design photo for a real estate listing. The staging must look photorealistic and naturally integrated with the existing space.`;

    } else if (mode === "sky_replacement") {
      prompt = "Replace the sky in this real estate exterior photo with a beautiful, clear blue sky with light white clouds. Make the transition natural and seamless. Keep everything else in the photo exactly the same. Return the enhanced version.";

    } else if (mode === "declutter") {
      prompt = "Remove clutter, personal items, and unnecessary objects from this real estate photo. Clean up countertops, remove personal photos, excessive decorations, and mess. Make the space look clean, organized, and move-in ready while keeping the furniture and structure. Return the decluttered version.";

    } else {
      return json({ error: "Invalid mode. Use: enhance, virtual_staging, sky_replacement, or declutter" }, 400);
    }

    console.log(`[ai-image-enhance] mode=${mode}, type=${enhancement_type || staging_style}, user=${user.id}`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image_url } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      if (aiResponse.status === 402) return json({ error: "AI credits exhausted. Please add funds." }, 402);
      return json({ error: `AI processing failed (${aiResponse.status})` }, 500);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = aiData.choices?.[0]?.message?.content || "";

    if (!imageData || !imageData.startsWith("data:image/")) {
      return json({ error: "AI did not return an enhanced image" }, 500);
    }

    // Upload to Supabase Storage
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) return json({ error: "Invalid image data format" }, 500);

    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const fileName = `${user.id}/enhanced_${mode}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(fileName, binaryData, {
        contentType: `image/${base64Match[1]}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return json({ error: "Failed to save enhanced image" }, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("property-images")
      .getPublicUrl(fileName);

    return json({
      enhanced_image_url: publicUrl,
      mode,
      enhancement_type: enhancement_type || staging_style || mode,
      description: textResponse,
    });

  } catch (e) {
    console.error("[ai-image-enhance] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
