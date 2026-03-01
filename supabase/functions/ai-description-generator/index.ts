import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    // ── Parse request ──
    const { property_id, save_results, tone, rewrite_text } = await req.json();
    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Fetch property ──
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('id, title, price, city, district, land_area_sqm, building_area_sqm, bedrooms, bathrooms, floors, has_pool, garage_count, property_type, listing_type, investment_score, user_id, agent_id')
      .eq('id', property_id)
      .maybeSingle();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Authorization: owner, agent, or admin ──
    const isOwner = property.user_id === userId;
    const isAgent = property.agent_id === userId;

    let isAdmin = false;
    if (!isOwner && !isAgent) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      isAdmin = !!roleRow;
    }

    if (!isOwner && !isAgent && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden – only property owner, agent, or admin allowed' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Build AI prompt ──
    const poolText = property.has_pool ? 'Yes' : 'No';
    const garageText = (property.garage_count || 0) > 0 ? `${property.garage_count} car(s)` : 'None';
    const invScore = property.investment_score || 0;
    const rentalNote = invScore > 70 ? 'This property has a strong investment score — emphasize rental income opportunity.' : '';

    const toneGuides: Record<string, string> = {
      luxury: 'Write in an opulent, prestigious tone. Emphasize exclusivity, premium finishes, sophisticated lifestyle, and high-end amenities. Use words like "exquisite", "bespoke", "unparalleled".',
      investment: 'Write in a data-driven, ROI-focused tone. Emphasize rental yield, capital appreciation, market trends, and financial returns. Use concrete numbers and investment terminology.',
      family: 'Write in a warm, welcoming tone. Emphasize safety, spacious living areas, nearby schools, parks, community feel, and family-friendly features.',
      minimalist: 'Write in a clean, contemporary tone. Emphasize sleek design, open spaces, natural light, functional layouts, and architectural simplicity. Use precise, understated language.',
      resort: 'Write in a tropical, relaxation-focused tone. Emphasize lush gardens, pool areas, outdoor living, spa-like bathrooms, and vacation lifestyle. Evoke serenity and escape.',
    };
    const toneInstruction = toneGuides[tone as string] || toneGuides.luxury;

    const isRewrite = typeof rewrite_text === 'string' && rewrite_text.trim().length > 0;

    const systemPrompt = isRewrite
      ? `You are a real estate copywriting editor for ASTRA Villa. Your job is to rewrite and enhance an existing property description. ${toneInstruction} Improve clarity, flow, and persuasiveness while preserving all factual details. Never use markdown symbols like #, *, or **. Use clean plain text only.`
      : `You are a real estate marketing expert writing for an AI-powered property platform called ASTRA Villa. ${toneInstruction} Never use markdown symbols like #, *, or **. Use clean plain text only.`;

    const userPrompt = isRewrite
      ? `Rewrite and enhance this existing property description with the selected tone. Preserve all facts but improve the writing quality, flow, and persuasiveness.

Original Description:
"""
${rewrite_text}
"""

Property Context:
- Title: ${property.title || 'Untitled Property'}
- Type: ${property.property_type || 'Residential'}
- Price: Rp ${Number(property.price || 0).toLocaleString('id-ID')}
- City: ${property.city || 'Unknown'}
- Investment Score: ${invScore}/100

Return a JSON object with exactly these keys:
- "long_description": The rewritten description, improved for tone, clarity, and persuasion (400-600 words, plain text, no markdown)
- "seo_description": Under 160 characters, optimized for search engines
- "social_caption": An engaging Instagram caption with relevant emojis and hashtags
- "highlights": An array of exactly 5 short bullet points (plain text strings, no bullet symbols)

Return ONLY the JSON object, no other text.`
      : `Generate premium marketing content for this property:

Property Details:
- Title: ${property.title || 'Untitled Property'}
- Type: ${property.property_type || 'Residential'}
- Listing: ${property.listing_type || 'Sale'}
- Price: Rp ${Number(property.price || 0).toLocaleString('id-ID')}
- City: ${property.city || 'Unknown'}
- District: ${property.district || 'N/A'}
- Land Area: ${property.land_area_sqm || 'N/A'} sqm
- Building Area: ${property.building_area_sqm || 'N/A'} sqm
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Floors: ${property.floors || 1}
- Swimming Pool: ${poolText}
- Garage: ${garageText}
- Investment Score: ${invScore}/100
${rentalNote}

Focus on:
1. Investment potential and value proposition
2. Lifestyle appeal and modern living
3. Location value and neighborhood advantages
4. Modern architecture and design quality
5. ${rentalNote ? 'Rental income opportunity' : 'Long-term appreciation potential'}

Return a JSON object with exactly these keys:
- "long_description": A compelling property description, 400-600 words, plain text, no markdown
- "seo_description": Under 160 characters, optimized for search engines
- "social_caption": An engaging Instagram caption with relevant emojis and hashtags
- "highlights": An array of exactly 5 short bullet points (plain text strings, no bullet symbols)

Return ONLY the JSON object, no other text.`;

    // ── Call Lovable AI Gateway ──
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'format_property_content',
            description: 'Format the generated property marketing content',
            parameters: {
              type: 'object',
              properties: {
                long_description: { type: 'string', description: 'Compelling property description, 400-600 words' },
                seo_description: { type: 'string', description: 'SEO meta description under 160 characters' },
                social_caption: { type: 'string', description: 'Instagram-optimized caption with emojis and hashtags' },
                highlights: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of 5 short highlight bullet points',
                },
              },
              required: ['long_description', 'seo_description', 'social_caption', 'highlights'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'format_property_content' } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI gateway error:', status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();

    // Extract structured output from tool call
    let content: { long_description: string; seo_description: string; social_caption: string; highlights: string[] };

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      content = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing message content directly
      const raw = aiData.choices?.[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Failed to parse AI response');
      content = JSON.parse(jsonMatch[0]);
    }

    // ── Optionally save to ai_generated_content ──
    if (save_results !== false) {
      const rows = [
        { property_id, content_type: 'description', content: content.long_description },
        { property_id, content_type: 'seo', content: content.seo_description },
        { property_id, content_type: 'social', content: content.social_caption },
        { property_id, content_type: 'highlights', content: JSON.stringify(content.highlights) },
      ];
      const { error: saveErr } = await supabase.from('ai_generated_content').insert(rows);
      if (saveErr) console.error('Failed to save AI content:', saveErr);
    }

    console.log(`AI description generated for property ${property_id}`);

    return new Response(JSON.stringify({
      success: true,
      ...content,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('ai-description-generator error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
