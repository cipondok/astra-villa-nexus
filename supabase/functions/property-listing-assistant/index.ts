import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are ASTRA, an expert AI property listing assistant for a premium Indonesian real estate platform. Your role is to guide users through creating compelling, high-converting property listings.

## Your Capabilities:
1. **Description Generation**: Create engaging, SEO-optimized property descriptions in English and Indonesian
2. **Pricing Guidance**: Suggest optimal pricing based on location, property type, and market data
3. **Photo Advice**: Recommend which photos to highlight and photography tips
4. **Keyword Optimization**: Suggest keywords for maximum search visibility
5. **Error Prevention**: Identify missing information or potential issues before listing
6. **Success Prediction**: Estimate listing success probability based on completeness and quality

## Communication Style:
- Be friendly, professional, and encouraging
- Use property-specific terminology
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Support both English and Indonesian

## Common User Intents:
- "help me describe" → Generate property description
- "what price" / "berapa harga" → Pricing guidance
- "check my listing" → Error review & success prediction
- "improve" / "optimize" → Suggestions for improvement
- "keywords" / "SEO" → Keyword recommendations
- "photos" / "foto" → Photography advice

When generating descriptions, always:
1. Start with a compelling hook
2. Highlight unique selling points
3. Include key specifications (beds, baths, area)
4. Mention location benefits
5. End with a call-to-action

When providing pricing, consider:
- Property type and size
- Location tier (Jakarta premium, Bali tourist, etc.)
- Current market conditions
- Comparable listings

Always respond in the same language the user uses.`;

interface PropertyContext {
  title?: string;
  propertyType?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  landArea?: number;
  description?: string;
  amenities?: string[];
  images?: number;
  listingType?: 'sale' | 'rent';
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, propertyContext, action } = await req.json() as {
      messages: Message[];
      propertyContext?: PropertyContext;
      action?: 'generate_description' | 'suggest_price' | 'analyze_photos' | 'get_keywords' | 'check_errors' | 'predict_success' | 'chat';
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system message
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (propertyContext) {
      contextualPrompt += `\n\n## Current Property Context:\n${JSON.stringify(propertyContext, null, 2)}`;
    }

    // Add action-specific instructions
    if (action) {
      switch (action) {
        case 'generate_description':
          contextualPrompt += `\n\n## TASK: Generate a compelling property description based on the context. Include both English and Indonesian versions. Format with clear sections.`;
          break;
        case 'suggest_price':
          contextualPrompt += `\n\n## TASK: Analyze the property and suggest an optimal price range. Consider location tier, property type, size, and current Indonesian market conditions. Provide low, mid, and high estimates with reasoning.`;
          break;
        case 'analyze_photos':
          contextualPrompt += `\n\n## TASK: Provide photography advice for this property type. Suggest which rooms/areas to photograph first, optimal angles, lighting tips, and staging recommendations.`;
          break;
        case 'get_keywords':
          contextualPrompt += `\n\n## TASK: Generate 15-20 SEO keywords for this property. Include both English and Indonesian terms. Categorize into: location keywords, feature keywords, buyer intent keywords.`;
          break;
        case 'check_errors':
          contextualPrompt += `\n\n## TASK: Review the property listing for potential issues. Check for: missing required fields, pricing anomalies, description quality, photo count recommendations. Provide a checklist with ✅ or ❌.`;
          break;
        case 'predict_success':
          contextualPrompt += `\n\n## TASK: Calculate a listing success probability (0-100%). Analyze: listing completeness, description quality, price competitiveness, photo count, location demand. Provide breakdown and improvement tips.`;
          break;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Property listing assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
