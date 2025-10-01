
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Neighborhood simulator received query:", message);

    const systemPrompt = `You are an AI assistant for a real estate platform. Your task is to analyze a user's query about a neighborhood and convert it into structured search criteria. The user query is: '${message}'. Return ONLY a valid JSON object with the following structure, no other text: { "property_type": "villa" | "house" | "apartment" | "commercial" | null, "features": ("near_cafes" | "safe_neighborhood" | "near_beach" | "good_for_families")[], "location_keywords": string[] }. For example, for the query 'Show me villas where I can walk to cafes safely at night in Canggu.', you should return: { "property_type": "villa", "features": ["near_cafes", "safe_neighborhood"], "location_keywords": ["Canggu"] }. If a criterion is not mentioned, use null for property_type or an empty array for features/location_keywords.`;

    const openAIResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.2,
      }),
    });

    if (!openAIResponse.ok) {
        const errorBody = await openAIResponse.text();
        console.error("OpenAI API error:", errorBody);
        throw new Error(`OpenAI API request failed with status ${openAIResponse.status}`);
    }

    const completion = await openAIResponse.json();
    const searchCriteria = JSON.parse(completion.choices[0].message.content.trim());
    console.log("Parsed search criteria:", searchCriteria);

    let query = supabase.from('properties').select('*').eq('status', 'approved');

    if (searchCriteria.property_type) {
      query = query.eq('property_type', searchCriteria.property_type.toLowerCase());
    }

    const orFilters: string[] = [];
    if (searchCriteria.features?.includes('near_cafes')) orFilters.push('description.ilike.%cafe%');
    if (searchCriteria.features?.includes('safe_neighborhood')) orFilters.push('description.ilike.%safe%', 'description.ilike.%secure%');
    if (searchCriteria.features?.includes('near_beach')) orFilters.push('description.ilike.%beach%');
    if (searchCriteria.features?.includes('good_for_families')) orFilters.push('description.ilike.%family%', 'description.ilike.%playground%');
    
    if (searchCriteria.location_keywords?.length > 0) {
      searchCriteria.location_keywords.forEach((kw: string) => {
        orFilters.push(`location.ilike.%${kw}%`, `city.ilike.%${kw}%`);
      });
    }

    if (orFilters.length > 0) {
      query = query.or(orFilters.join(','));
    }

    const { data: properties, error } = await query.limit(3);

    if (error) {
        console.error("Supabase query error:", error);
        throw error;
    }

    let responseMessage;
    if (properties && properties.length > 0) {
      responseMessage = "Based on your request, I found a few properties you might be interested in:\n\n";
      properties.forEach(p => {
        responseMessage += `- **${p.title}** in ${p.location}. [View Details](/property/${p.id})\n`;
      });
      responseMessage += "\nKeep in mind, this is a search based on property descriptions. For a more detailed analysis, we'd need to integrate more data sources.";
    } else {
      responseMessage = "I couldn't find any properties that match your specific request with the current data. You could try being more general in your query.";
    }

    return new Response(JSON.stringify({ message: responseMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in neighborhood-simulator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

