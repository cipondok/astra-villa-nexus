import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const aiRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(2000)
  })).max(10).optional().default([])
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertySearchQuery {
  location?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const { message, conversation_history } = aiRequestSchema.parse(rawData);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing query:', message);

    // First, use OpenAI to extract search parameters from natural language
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a property search assistant for Indonesian real estate. Extract search parameters from user queries and return ONLY a JSON object with these possible fields:
            - location: string (city, area, or region)
            - property_type: "house" | "apartment" | "villa" | "land" | "commercial"
            - listing_type: "sale" | "rent"
            - min_price: number (in IDR)
            - max_price: number (in IDR)
            - bedrooms: number
            - bathrooms: number
            - features: string[] (pool, garden, parking, etc.)
            
            Return empty object {} if no specific search criteria found.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      }),
    });

    const extractionData = await extractionResponse.json();
    const searchParams: PropertySearchQuery = extractionData.choices[0]?.message?.content 
      ? JSON.parse(extractionData.choices[0].message.content) 
      : {};

    console.log('Extracted search parameters:', searchParams);

    // Build Supabase query based on extracted parameters
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .limit(10);

    if (searchParams.location) {
      query = query.or(`city.ilike.%${searchParams.location}%, area.ilike.%${searchParams.location}%, location.ilike.%${searchParams.location}%`);
    }
    if (searchParams.property_type) {
      query = query.eq('property_type', searchParams.property_type);
    }
    if (searchParams.listing_type) {
      query = query.eq('listing_type', searchParams.listing_type);
    }
    if (searchParams.min_price) {
      query = query.gte('price', searchParams.min_price);
    }
    if (searchParams.max_price) {
      query = query.lte('price', searchParams.max_price);
    }
    if (searchParams.bedrooms) {
      query = query.gte('bedrooms', searchParams.bedrooms);
    }
    if (searchParams.bathrooms) {
      query = query.gte('bathrooms', searchParams.bathrooms);
    }

    const { data: properties, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to search properties');
    }

    console.log(`Found ${properties?.length || 0} matching properties`);

    // Get market insights for context
    const { data: marketTrends } = await supabase
      .from('market_trends')
      .select('*')
      .limit(5);

    // Create context for AI response
    const context = {
      query: message,
      searchParams,
      foundProperties: properties?.length || 0,
      properties: properties?.slice(0, 5), // Limit for context
      marketInsights: marketTrends,
      totalProperties: properties?.length || 0
    };

    // Generate AI response with property recommendations
    const responseMessages = [
      {
        role: 'system',
        content: `You are "AstraBot", a friendly and knowledgeable Indonesian property advisor. You help users find their perfect property with expertise and local insights.

Key Guidelines:
- Be conversational, helpful, and enthusiastic
- Use IDR currency format (e.g., "2.5 billion IDR" or "IDR 2.5B")
- Mention specific property details when available
- Provide local insights about areas/neighborhoods
- Suggest next steps or ask clarifying questions
- If no properties found, suggest alternative searches
- Keep responses concise but informative

Current search context: ${JSON.stringify(context, null, 2)}`
      },
      ...conversation_history.slice(-4), // Include recent conversation
      { role: 'user', content: message }
    ];

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: responseMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const aiData = await aiResponse.json();
    const assistantReply = aiData.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

    return new Response(JSON.stringify({
      reply: assistantReply,
      searchParams,
      properties: properties?.slice(0, 3), // Return top 3 matches
      totalFound: properties?.length || 0,
      suggestions: properties?.length === 0 ? [
        'Try a different location',
        'Adjust your price range',
        'Consider different property types'
      ] : []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI property assistant:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        details: error.errors
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});