import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { projectName, location, targetSegment, pricingTier, positioning, unitCount, launchDate } = body;

    if (!projectName || !location || !positioning) {
      return new Response(JSON.stringify({ error: "projectName, location, and positioning are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert Indonesian real estate marketing strategist for ASTRA Villa, a premium property investment platform. Generate compelling, data-driven campaign content for property developers launching new projects.

RULES:
- Write in professional English with Indonesian market context
- Be specific, avoid generic phrases
- Include investment-grade insights and market positioning
- All monetary values in IDR (use Miliar/Juta notation)
- Reference real Indonesian market dynamics (Jakarta, Bali, BSD, Tangerang, etc.)

Return a JSON object with this exact structure:
{
  "headline": "A powerful 8-12 word marketing headline",
  "subheadline": "A 15-20 word supporting line",
  "description": "A 60-80 word promotional description emphasizing investment value",
  "sellingPoints": ["point1", "point2", "point3", "point4", "point5"],
  "campaignTiming": {
    "recommendedLaunchWindow": "specific month/season recommendation",
    "prelaunchDuration": "X weeks",
    "reasoning": "Why this timing is optimal based on market cycles"
  },
  "emailSubject": "Email subject line for investor interest capture",
  "emailBody": "A 40-60 word email body for early-bird investor outreach",
  "bannerTagline": "A short 5-8 word banner tagline",
  "ctaText": "Call-to-action button text",
  "targetAudience": "Description of ideal buyer profile",
  "pricingStrategy": "Brief pricing positioning advice"
}`;

    const userPrompt = `Generate a complete marketing campaign for this developer project:

- Project Name: ${projectName}
- Location: ${location}
- Target Buyer Segment: ${targetSegment || "Mixed investors & end-users"}
- Pricing Tier: ${pricingTier || "Mid-range"}
- Positioning: ${positioning}
- Units: ${unitCount || "N/A"}
- Planned Launch: ${launchDate || "TBD"}

Create compelling, market-specific campaign content.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_campaign",
              description: "Generate structured marketing campaign content",
              parameters: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  subheadline: { type: "string" },
                  description: { type: "string" },
                  sellingPoints: { type: "array", items: { type: "string" } },
                  campaignTiming: {
                    type: "object",
                    properties: {
                      recommendedLaunchWindow: { type: "string" },
                      prelaunchDuration: { type: "string" },
                      reasoning: { type: "string" },
                    },
                    required: ["recommendedLaunchWindow", "prelaunchDuration", "reasoning"],
                  },
                  emailSubject: { type: "string" },
                  emailBody: { type: "string" },
                  bannerTagline: { type: "string" },
                  ctaText: { type: "string" },
                  targetAudience: { type: "string" },
                  pricingStrategy: { type: "string" },
                },
                required: ["headline", "subheadline", "description", "sellingPoints", "campaignTiming", "emailSubject", "emailBody", "bannerTagline", "ctaText", "targetAudience", "pricingStrategy"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_campaign" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await aiResponse.text();
      console.error("AI error:", status, text);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let campaign;
    if (toolCall?.function?.arguments) {
      campaign = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        campaign = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract campaign data from AI response");
      }
    }

    return new Response(
      JSON.stringify({ success: true, campaign }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Campaign generation error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
