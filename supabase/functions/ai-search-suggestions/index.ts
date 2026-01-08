import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache headers for reducing load under heavy traffic
const cacheHeaders = {
  'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, recentSearches, savedSearches, filters } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from recent and saved searches
    const recentContext = recentSearches?.slice(0, 5).map((s: any) => s.query).join(', ') || 'None';
    const savedContext = savedSearches?.slice(0, 5).map((s: any) => s.name).join(', ') || 'None';
    const filterContext = JSON.stringify(filters || {});

    const systemPrompt = `You are a real estate search assistant. Based on the user's search history and current query, suggest 3-5 relevant property search queries that would help them find what they're looking for.

Recent searches: ${recentContext}
Saved searches: ${savedContext}
Active filters: ${filterContext}

Return ONLY a JSON array of suggestion strings, nothing else. Each suggestion should be a complete, natural search query.
Example: ["3 bedroom apartments in Jakarta under $200k", "Modern houses with pool in Bali", "Luxury villas near beach"]`;

    const userPrompt = query 
      ? `Current search: "${query}"\n\nSuggest 3-5 improved or related property search queries.`
      : 'Suggest 3-5 popular property search queries based on the user\'s history.';

    console.log('Calling Lovable AI for search suggestions...');
    
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
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            suggestions: []
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ 
            error: 'Credits exhausted. Please add funds.',
            suggestions: []
          }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response:', content);
    
    // Parse the JSON array from the response
    let suggestions: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        suggestions = content
          .split('\n')
          .filter((line: string) => line.trim() && !line.includes('[') && !line.includes(']'))
          .map((line: string) => line.replace(/^[-*"'\d.)\s]+/, '').replace(/["']+$/, '').trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 5);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      suggestions = [];
    }

    console.log('Parsed suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }), 
      { 
        headers: { 
          ...corsHeaders, 
          ...cacheHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-search-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: []
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
