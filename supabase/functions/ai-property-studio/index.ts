// AI Property Studio — autofill (text) + generate-image (text→image)
// Modes:
//   { mode: "autofill", input: { location, property_type, luxury_level, style, listing_type, target_audience, language } }
//     → { title, description, short_description, amenities[], features{...}, seo_title, seo_description, suggested_price_idr, roi_estimate, luxury_tier }
//   { mode: "generate-image", input: { prompt, style, mode_label }, user_id }
//     → { url, path }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const STYLE_PROMPTS: Record<string, string> = {
  bali_luxury: "Bali luxury villa, tropical hardwood, infinity pool, lush palms, golden hour, cinematic architectural photography",
  modern_tropical: "modern tropical villa, open-plan glass walls, teak accents, lush garden, soft natural light",
  minimalist: "minimalist concrete villa, clean lines, monochrome palette, sculptural shadows, architectural digest aesthetic",
  jungle_retreat: "jungle retreat villa, treetop integration, organic materials, mist, dramatic foliage",
  beachfront: "beachfront luxury villa, white sand, turquoise sea, sunset, panoramic ocean view",
  futuristic_smart: "futuristic smart villa, sleek glass and steel, ambient LED lighting, dusk, hyperreal render",
};

const MODE_PROMPTS: Record<string, string> = {
  realistic: "professional real estate photography, ultra-realistic, 35mm lens",
  cinematic: "cinematic render, dramatic lighting, depth of field, 8k",
  architectural: "architectural visualization, V-Ray render, soft global illumination",
  marketing: "luxury marketing poster, magazine cover composition, premium feel",
  dusk: "twilight dusk shot, warm interior lights glowing, dramatic sky",
  aerial: "drone aerial view, top-down composition, lush surroundings",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "Invalid token" }, 401);

    const body = await req.json();
    const mode = body?.mode;

    if (mode === "autofill") {
      const i = body.input ?? {};
      const lang = i.language === "en" ? "English" : "Indonesian";
      const sys = `You are a luxury real estate copywriter for ASTRA Villa in Indonesia. Always reply with strict JSON only — no markdown, no commentary.`;
      const userPrompt = `Generate a complete luxury property listing in ${lang} based on:
- Location: ${i.location || "Bali, Indonesia"}
- Property type: ${i.property_type || "villa"}
- Listing type: ${i.listing_type || "sale"}
- Luxury level: ${i.luxury_level || "premium"} (basic | premium | ultra-luxury)
- Style: ${i.style || "bali_luxury"}
- Target audience: ${i.target_audience || "international investors"}

Return strict JSON with this exact shape:
{
  "title": "string (max 90 chars, evocative)",
  "short_description": "string (1-2 sentence hook, max 180 chars)",
  "description": "string (250-350 words, cinematic luxury copy, no markdown)",
  "amenities": ["10-15 short amenity strings"],
  "features": {
    "swimming_pool": true,
    "garden": true,
    "parking": true,
    "balcony": true,
    "furnished": true,
    "air_conditioning": true,
    "security": true,
    "elevator": false
  },
  "bedrooms": number (2-7),
  "bathrooms": number (2-7),
  "area_sqm": number (150-2000),
  "suggested_price_idr": number (realistic IDR, integer),
  "roi_estimate_pct": number (4-15),
  "luxury_tier": "basic" | "premium" | "ultra-luxury",
  "seo_title": "string (max 60 chars)",
  "seo_description": "string (max 158 chars)",
  "highlights": ["5 short bullet highlights"]
}`;

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!r.ok) {
        const t = await r.text();
        if (r.status === 429) return json({ error: "Rate limit. Try again shortly." }, 429);
        if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
        return json({ error: `AI failed (${r.status}): ${t.slice(0, 200)}` }, 500);
      }
      const data = await r.json();
      const raw = data.choices?.[0]?.message?.content ?? "{}";
      let parsed: any;
      try { parsed = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      }
      return json({ result: parsed });
    }

    if (mode === "generate-image") {
      const i = body.input ?? {};
      const styleText = STYLE_PROMPTS[i.style] ?? STYLE_PROMPTS.bali_luxury;
      const modeText = MODE_PROMPTS[i.mode_label] ?? MODE_PROMPTS.cinematic;
      const userPrompt = `${i.prompt || "luxury villa"}. ${styleText}. ${modeText}. Award-winning composition, no text, no watermark.`;

      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt: userPrompt,
          size: "1536x1024",
          quality: "low",
          n: 1,
        }),
      });

      if (!r.ok) {
        const t = await r.text();
        if (r.status === 429) return json({ error: "Rate limit. Try again shortly." }, 429);
        if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
        return json({ error: `Image gen failed (${r.status}): ${t.slice(0, 200)}` }, 500);
      }
      const data = await r.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) return json({ error: "No image returned" }, 500);

      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `${user.id}/studio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.png`;
      const { error: upErr } = await supabase.storage
        .from("property-images")
        .upload(path, bin, { contentType: "image/png", upsert: false });
      if (upErr) return json({ error: `Upload failed: ${upErr.message}` }, 500);

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(path);

      return json({ url: publicUrl, path });
    }

    return json({ error: "Invalid mode. Use 'autofill' or 'generate-image'." }, 400);
  } catch (e) {
    console.error("[ai-property-studio]", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
