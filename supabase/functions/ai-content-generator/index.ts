import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CONTENT_PROMPTS: Record<string, (vars: Record<string, any>, lang: string, tone: string) => string> = {
  property_description: (v, lang, tone) => `Write a professional ${tone} property listing description in ${lang === 'id' ? 'Indonesian' : 'English'}.
Property: ${v.property_type} in ${v.location}
Bedrooms: ${v.bedrooms || 'N/A'}, Bathrooms: ${v.bathrooms || 'N/A'}
Size: ${v.size_sqm || 'N/A'} sqm, Land: ${v.land_area || 'N/A'} sqm
Price: ${v.price || 'N/A'}
Features: ${v.features || 'Not specified'}
Condition: ${v.condition || 'N/A'}, Year Built: ${v.year_built || 'N/A'}

Include: compelling title, detailed description (200-300 words), 5 highlight bullet points, and investment potential statement.`,

  neighborhood_highlights: (v, lang, tone) => `Write a ${tone} neighborhood guide in ${lang === 'id' ? 'Indonesian' : 'English'} for ${v.area_name}, ${v.city}.
Target audience: ${v.target_audience || 'General'}
Property types: ${v.property_types || 'Various'}
Price range: ${v.price_range || 'Various'}

Include amenities, lifestyle, transport, schools, dining, and investment outlook.`,

  market_report: (v, lang, tone) => `Write a ${tone} market analysis report in ${lang === 'id' ? 'Indonesian' : 'English'} for ${v.location}.
Property type: ${v.property_type}
Period: ${v.time_period || 'Current'}
Avg price: ${v.avg_price || 'N/A'}, Price change: ${v.price_change_percent || 'N/A'}%
Inventory: ${v.inventory_level || 'N/A'}, Days on market: ${v.avg_dom || 'N/A'}
Demand: ${v.demand_level || 'N/A'}

Include executive summary, price trends, supply/demand analysis, forecast, and investment recommendations.`,

  social_media: (v, lang, tone) => `Create ${tone} social media posts in ${lang === 'id' ? 'Indonesian' : 'English'} for a ${v.property_type} in ${v.location}.
Price: ${v.price || 'N/A'}, Bedrooms: ${v.bedrooms || 'N/A'}, Size: ${v.size_sqm || 'N/A'} sqm
Standout feature: ${v.key_feature || 'N/A'}
Target: ${v.target_audience || 'General'}
Platform: ${v.platform || 'All'}

Create posts for Instagram, Facebook, and LinkedIn with appropriate hashtags.`,

  blog_article: (v, lang, tone) => `Write a ${tone} SEO blog article in ${lang === 'id' ? 'Indonesian' : 'English'}.
Topic: ${v.topic}
Primary keyword: ${v.primary_keyword}
Secondary keywords: ${v.secondary_keywords || 'N/A'}
Location: ${v.location || 'Indonesia'}
Target reader: ${v.target_reader || 'General'}
Word count: ~${v.word_count || '1200'} words
Angle: ${v.unique_angle || 'General overview'}

Include H2 headings, intro hook, actionable advice, and conclusion with CTA.`,
};

// Fallback for types not explicitly mapped
const defaultPrompt = (type: string, vars: Record<string, any>, lang: string, tone: string) =>
  `Write professional ${tone} ${type.replace(/_/g, ' ')} content in ${lang === 'id' ? 'Indonesian' : 'English'} based on these details:\n${JSON.stringify(vars, null, 2)}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, variables, language = "en", tone = "professional" } = await req.json();

    if (!type || !variables) {
      return new Response(JSON.stringify({ error: "Missing type or variables" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const promptFn = CONTENT_PROMPTS[type];
    const userPrompt = promptFn
      ? promptFn(variables, language, tone)
      : defaultPrompt(type, variables, language, tone);

    const systemPrompt = `You are an expert real estate content writer for ASTRA Villa Realty, Indonesia's premier AI-powered property investment platform. Write high-quality, engaging content that converts readers into leads. Use markdown formatting for structure.`;

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
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits depleted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-content-generator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
