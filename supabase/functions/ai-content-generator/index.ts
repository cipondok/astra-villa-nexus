import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentRequest {
  type: 
    | 'property_description'
    | 'neighborhood_highlights'
    | 'market_report'
    | 'how_to_guide'
    | 'success_story'
    | 'social_media'
    | 'newsletter'
    | 'blog_article';
  variables: Record<string, any>;
  language?: 'en' | 'id';
  tone?: 'professional' | 'friendly' | 'luxury' | 'casual';
}

const CONTENT_TEMPLATES: Record<string, string> = {
  property_description: `Generate a compelling property listing description for:
Property Type: {property_type}
Location: {location}
Bedrooms: {bedrooms}
Bathrooms: {bathrooms}
Size: {size_sqm} sqm
Land Area: {land_area} sqm
Price: {price}
Key Features: {features}
Year Built: {year_built}
Condition: {condition}

Create both English and Indonesian versions. Include:
- Attention-grabbing headline
- Emotional hook in the first sentence
- Key specifications
- Unique selling points
- Lifestyle benefits
- Call to action`,

  neighborhood_highlights: `Create a neighborhood guide for:
Area: {area_name}
City: {city}
Property Types Available: {property_types}
Price Range: {price_range}
Target Audience: {target_audience}

Include sections on:
1. Overview & Vibe (2-3 sentences)
2. Transportation & Accessibility
3. Dining & Entertainment
4. Schools & Education
5. Healthcare Facilities
6. Shopping & Retail
7. Parks & Recreation
8. Safety & Security Rating
9. Investment Potential
10. Best For (family, expat, investor, etc.)`,

  market_report: `Generate a market trend report for:
Location: {location}
Property Type: {property_type}
Time Period: {time_period}
Current Average Price: {avg_price}
Price Change: {price_change_percent}%
Inventory Level: {inventory_level}
Days on Market: {avg_dom}
Demand Level: {demand_level}

Create a professional report with:
- Executive Summary
- Price Trends Analysis
- Supply & Demand Dynamics
- Buyer/Renter Demographics
- Investment Outlook
- 3-6 Month Forecast
- Key Takeaways (5 bullet points)
- Recommendation for buyers/sellers`,

  how_to_guide: `Create a how-to guide for:
User Type: {user_type}
Topic: {topic}
Experience Level: {experience_level}
Goal: {goal}
Common Pain Points: {pain_points}

Structure the guide with:
- Clear title with benefit
- Introduction (why this matters)
- Prerequisites/requirements
- Step-by-step instructions (numbered)
- Pro tips for each step
- Common mistakes to avoid
- Expected timeline
- Success metrics
- Next steps/resources`,

  success_story: `Create a success story template for:
Client Type: {client_type}
Transaction Type: {transaction_type}
Property Type: {property_type}
Location: {location}
Challenge: {challenge}
Solution: {solution}
Result: {result}
Timeline: {timeline}

Format as:
- Headline (result-focused)
- The Challenge (2-3 sentences)
- The Journey (what we did)
- The Solution (how we helped)
- The Results (specific outcomes)
- Client Quote (create a realistic testimonial)
- Key Takeaways`,

  social_media: `Create social media posts for a new listing:
Property Type: {property_type}
Location: {location}
Price: {price}
Key Feature: {key_feature}
Bedrooms: {bedrooms}
Size: {size_sqm} sqm
Target Audience: {target_audience}
Platform: {platform}

Generate for each platform:
- Instagram (with hashtags, emoji-rich, 150 words max)
- Facebook (longer form, 250 words, engagement question)
- Twitter/X (280 chars, punchy)
- LinkedIn (professional tone, investment angle)
- TikTok script (15-30 second video script)`,

  newsletter: `Create an email newsletter about:
Theme: {theme}
Featured Listings: {featured_count}
Target Audience: {audience}
Market Update: {market_summary}
Season/Month: {season}
Special Promotions: {promotions}
Local Events: {events}

Include sections:
- Subject line (A/B versions)
- Preview text
- Personal greeting
- Main story/highlight
- Featured properties (with CTAs)
- Market insights snippet
- Local community news
- Success story teaser
- Upcoming events
- Call to action
- Social links footer`,

  blog_article: `Write an SEO-optimized blog article:
Topic: {topic}
Target Keyword: {primary_keyword}
Secondary Keywords: {secondary_keywords}
Location Focus: {location}
Target Reader: {target_reader}
Article Length: {word_count} words
Competitor Angle: {unique_angle}

Include:
- SEO title (60 chars max)
- Meta description (155 chars)
- H1 headline
- Introduction with keyword in first 100 words
- 3-5 H2 subheadings
- Bullet points and lists
- Internal link suggestions
- External link suggestions
- Image alt text suggestions
- Call to action
- FAQ section (3-5 questions)`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, variables, language = 'en', tone = 'professional' } = await req.json() as ContentRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the template and fill in variables
    let template = CONTENT_TEMPLATES[type];
    if (!template) {
      throw new Error(`Unknown content type: ${type}`);
    }

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value || 'N/A'));
    });

    const systemPrompt = `You are an expert real estate content writer for the Indonesian property market. 
Your writing style is ${tone}.
${language === 'id' ? 'Write primarily in Indonesian (Bahasa Indonesia) with some English terms for real estate jargon.' : 'Write in English, suitable for an international audience interested in Indonesian properties.'}

Guidelines:
- Use compelling, benefit-focused language
- Include specific details when provided
- Maintain authenticity and accuracy
- Optimize for engagement and conversion
- Use local context and cultural references when appropriate
- Format with proper markdown for readability`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: template }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
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
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("Content generated:", { type, language, tone, contentLength: content.length });

    return new Response(
      JSON.stringify({
        content,
        type,
        language,
        tone,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
