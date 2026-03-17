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
    const { images, theme, property_info, music_style } = body as {
      images: string[];
      theme: string;
      property_info: {
        title?: string;
        price?: string;
        location?: string;
        opportunity_score?: number;
        selling_points?: string[];
      };
      music_style?: string;
    };

    if (!images || images.length < 2) {
      return json({ error: "At least 2 images are required" }, 400);
    }

    if (images.length > 10) {
      return json({ error: "Maximum 10 images allowed" }, 400);
    }

    // Build a cinematic prompt based on theme
    const themePrompts: Record<string, string> = {
      luxury_cinematic: "Create a luxurious, cinematic property showcase video with elegant slow panning movements, golden hour lighting effects, and premium real estate marketing aesthetics. The camera should glide smoothly through scenes with depth of field effects.",
      modern_clean: "Create a clean, modern property showcase video with crisp transitions, bright natural lighting, and contemporary real estate marketing style. Use smooth, professional movements with a minimalist aesthetic.",
      investment_highlight: "Create a professional investment property highlight video with dynamic transitions, data-driven presentation style, and confident pacing. Focus on architectural details and space functionality.",
    };

    const selectedTheme = themePrompts[theme] || themePrompts.luxury_cinematic;
    const info = property_info || {};

    // Generate video segments for each image pair
    // We'll generate a main showcase video from the first/best image
    const mainPrompt = `${selectedTheme}
Property: ${info.title || "Premium Property"}
Location: ${info.location || "Prime Location"}
${info.price ? `Price: ${info.price}` : ""}
${info.opportunity_score ? `Investment Score: ${info.opportunity_score}/100` : ""}
${info.selling_points?.length ? `Key Features: ${info.selling_points.join(", ")}` : ""}

Animate this property photo into a smooth, professional real estate marketing video. Add subtle camera movement (slow zoom or pan), maintain photorealistic quality, and create an inviting atmosphere.`;

    console.log(`[property-video-gen] Generating for user=${user.id}, images=${images.length}, theme=${theme}`);

    // Generate video segments — process first 3 images for the tour
    const videoSegments: { url: string; thumbnail: string }[] = [];
    const maxSegments = Math.min(images.length, 3);

    for (let i = 0; i < maxSegments; i++) {
      const segmentPrompt = i === 0
        ? mainPrompt
        : `${selectedTheme} Continue the property tour. Animate this room/area photo with smooth, professional camera movement. Maintain cinematic real estate marketing quality. Slow elegant pan or gentle zoom.`;

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
                { type: "text", text: segmentPrompt },
                { type: "image_url", image_url: { url: images[i] } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error(`AI gateway error for segment ${i}:`, aiResponse.status, errText);
        if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
        if (aiResponse.status === 402) return json({ error: "AI credits exhausted. Please add funds." }, 402);
        continue;
      }

      const aiData = await aiResponse.json();
      const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageData && imageData.startsWith("data:image/")) {
        // Upload enhanced frame to storage
        const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
          const base64Data = base64Match[2];
          const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `${user.id}/video_frame_${Date.now()}_${i}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(fileName, binaryData, {
              contentType: `image/${base64Match[1]}`,
              upsert: true,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("property-images")
              .getPublicUrl(fileName);

            videoSegments.push({
              url: publicUrl,
              thumbnail: publicUrl,
            });
          }
        }
      }
    }

    // Also generate text overlay data
    const overlays = [];
    if (info.title) overlays.push({ type: "title", text: info.title, position: "center", timing: "0-3s" });
    if (info.price) overlays.push({ type: "price", text: info.price, position: "bottom-left", timing: "3-6s" });
    if (info.location) overlays.push({ type: "location", text: info.location, position: "bottom-left", timing: "3-6s" });
    if (info.opportunity_score) overlays.push({ type: "score", text: `Investment Score: ${info.opportunity_score}/100`, position: "top-right", timing: "6-9s" });
    if (info.selling_points?.length) {
      info.selling_points.slice(0, 4).forEach((point, idx) => {
        overlays.push({ type: "feature", text: point, position: "bottom", timing: `${9 + idx * 2}-${11 + idx * 2}s` });
      });
    }

    return json({
      segments: videoSegments,
      overlays,
      theme,
      music_style: music_style || "ambient",
      total_images: images.length,
      processed_segments: videoSegments.length,
      status: videoSegments.length > 0 ? "success" : "failed",
      message: videoSegments.length > 0
        ? `Generated ${videoSegments.length} cinematic frames for your property tour.`
        : "Failed to generate video segments. Please try again.",
    });
  } catch (e) {
    console.error("[property-video-gen] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
