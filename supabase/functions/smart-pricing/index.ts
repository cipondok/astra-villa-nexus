import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { property_id } = await req.json()

    // Fetch the target property
    const { data: property, error: propError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .eq('owner_id', user.id)
      .single()

    if (propError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found or unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Fetch comparable properties in the same city
    const { data: comparables } = await supabaseClient
      .from('properties')
      .select('price, listing_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, city, property_type, status')
      .eq('city', property.city || '')
      .eq('listing_type', property.listing_type || 'sale')
      .eq('status', 'active')
      .neq('id', property_id)
      .limit(20)

    // Build AI prompt
    const propertyInfo = {
      title: property.title,
      type: property.property_type,
      listing_type: property.listing_type,
      current_price: property.price,
      city: property.city,
      state: property.state,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      building_area: property.building_area_sqm,
      land_area: property.land_area_sqm,
      amenities: property.amenities,
      legal_status: property.legal_status,
    }

    const compData = (comparables || []).map(c => ({
      price: c.price,
      bedrooms: c.bedrooms,
      bathrooms: c.bathrooms,
      building_area: c.building_area_sqm,
      land_area: c.land_area_sqm,
      type: c.property_type,
    }))

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert Indonesian real estate pricing analyst. Analyze property data and comparable listings to suggest optimal pricing. Always respond in Indonesian Rupiah (IDR). Be data-driven and practical.`
          },
          {
            role: 'user',
            content: `Analyze this property and suggest optimal pricing:\n\nProperty: ${JSON.stringify(propertyInfo)}\n\nComparable listings in same area (${compData.length} found): ${JSON.stringify(compData)}\n\nProvide pricing analysis.`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'pricing_analysis',
            description: 'Return structured pricing analysis for an Indonesian property',
            parameters: {
              type: 'object',
              properties: {
                recommended_price: { type: 'number', description: 'Recommended optimal price in IDR' },
                price_range_low: { type: 'number', description: 'Lower bound of suggested price range in IDR' },
                price_range_high: { type: 'number', description: 'Upper bound of suggested price range in IDR' },
                confidence_score: { type: 'number', description: 'Confidence 0-100 based on data quality' },
                price_per_sqm: { type: 'number', description: 'Suggested price per sqm in IDR' },
                market_position: { type: 'string', enum: ['below_market', 'at_market', 'above_market', 'premium'], description: 'Current price position relative to market' },
                adjustment_factors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      factor: { type: 'string', description: 'Name of the factor' },
                      impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                      description: { type: 'string', description: 'Brief explanation in Indonesian' },
                      percentage: { type: 'number', description: 'Estimated price impact percentage' }
                    },
                    required: ['factor', 'impact', 'description', 'percentage'],
                    additionalProperties: false
                  }
                },
                summary: { type: 'string', description: 'Brief pricing summary in Indonesian language' },
                comparable_avg_price: { type: 'number', description: 'Average price of comparable properties' },
                comparable_count: { type: 'number', description: 'Number of comparables analyzed' }
              },
              required: ['recommended_price', 'price_range_low', 'price_range_high', 'confidence_score', 'market_position', 'adjustment_factors', 'summary', 'comparable_avg_price', 'comparable_count'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'pricing_analysis' } },
      }),
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const errText = await aiResponse.text()
      console.error('AI error:', aiResponse.status, errText)
      throw new Error('AI gateway error')
    }

    const aiData = await aiResponse.json()
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0]
    let analysis = null

    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments)
    }

    return new Response(JSON.stringify({ 
      analysis,
      property: propertyInfo,
      comparables_count: compData.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Smart pricing error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
