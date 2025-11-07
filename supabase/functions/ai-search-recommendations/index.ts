import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recentSearches, savedSearches, filters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze search history
    const allSearches = [...(recentSearches || []), ...(savedSearches || [])];
    const queries = allSearches.map(s => s.query || '').filter(Boolean);
    
    // Extract patterns from filters
    const filterSummary = filters ? {
      propertyType: filters.propertyType,
      listingType: filters.listingType,
      priceRange: filters.priceRange,
      bedrooms: filters.bedrooms,
      location: filters.location
    } : {};

    const systemPrompt = `You are a real estate search assistant. Analyze the user's search history and current filters to suggest 3 highly relevant property searches. 
    
Each suggestion should be:
- Actionable and specific
- Based on patterns in their search behavior
- Include property type, location, price range, or bedrooms
- Concise (max 60 characters)

Format each suggestion as a short, conversational phrase like:
"3-bed apartments in Jakarta under $500K"
"Luxury villas in Bali with pool"
"2-bed condos near CBD $300-400K"`;

    const userPrompt = `Search History: ${queries.join(', ') || 'None'}
Current Filters: ${JSON.stringify(filterSummary)}

Generate 3 search suggestions:`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    // Parse suggestions from AI response
    const suggestions = aiResponse
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^[\d\.\-\*\s]+/, '').trim())
      .filter((s: string) => s.length > 10)
      .slice(0, 3);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
