import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId } = await req.json();
    if (!propertyId) {
      return new Response(JSON.stringify({ error: 'propertyId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the target property
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('title, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, city, province, property_type, area_sqm, has_pool, floors, created_at')
      .eq('id', propertyId)
      .single();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch comparables in same city
    const { data: comparables } = await supabase
      .from('properties')
      .select('title, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, property_type, created_at')
      .eq('city', property.city)
      .not('price', 'is', null)
      .gt('price', 0)
      .neq('id', propertyId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch price history if available
    const { data: priceHistory } = await supabase
      .from('property_price_history')
      .select('price, recorded_at')
      .eq('property_id', propertyId)
      .order('recorded_at', { ascending: true })
      .limit(12);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const prompt = `You are an AI real estate market analyst specializing in Indonesian property markets. Predict the price trajectory for this property over the next 12 months.

PROPERTY:
- Title: ${property.title}
- Current Price: Rp ${Number(property.price || 0).toLocaleString('id-ID')}
- Location: ${property.city}, ${property.province}
- Type: ${property.property_type}
- Land: ${property.land_area_sqm || property.area_sqm || 'N/A'} m²
- Building: ${property.building_area_sqm || 'N/A'} m²
- Bedrooms: ${property.bedrooms || 'N/A'}, Bathrooms: ${property.bathrooms || 'N/A'}
- Pool: ${property.has_pool ? 'Yes' : 'No'}, Floors: ${property.floors || 'N/A'}

${comparables && comparables.length > 0 ? `COMPARABLE LISTINGS (${comparables.length}):
${comparables.slice(0, 10).map(c => `- ${c.title}: Rp ${Number(c.price).toLocaleString('id-ID')} | LT:${c.land_area_sqm}m² LB:${c.building_area_sqm}m² | ${c.bedrooms}KT`).join('\n')}` : 'No comparables found.'}

${priceHistory && priceHistory.length > 0 ? `PRICE HISTORY:
${priceHistory.map(h => `- ${h.recorded_at}: Rp ${Number(h.price).toLocaleString('id-ID')}`).join('\n')}` : 'No price history available.'}

RESPOND WITH EXACTLY THIS JSON (no other text):
{
  "trend": "up" | "stable" | "down",
  "next12Months": "<percentage string like +5.7% or -2.1%>",
  "confidence": <number 50-99>,
  "monthly_forecast": [
    {"month": 1, "change_percent": <number>},
    {"month": 3, "change_percent": <number>},
    {"month": 6, "change_percent": <number>},
    {"month": 12, "change_percent": <number>}
  ],
  "investment_score": <number 1-10>,
  "rental_yield_estimate": <number like 4.5>,
  "market_heat": "hot" | "warm" | "neutral" | "cool",
  "key_drivers": ["driver1", "driver2", "driver3"],
  "risks": ["risk1", "risk2"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a real estate market prediction AI. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error('AI gateway error');
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';

    // Extract JSON
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    jsonStr = jsonStr.trim();

    const prediction = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Predictive pricing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
