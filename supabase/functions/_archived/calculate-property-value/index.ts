import { createClient } from 'npm:@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { property_id } = await req.json();
    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch target property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, title, city, property_type, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, listing_type')
      .eq('id', property_id)
      .single();

    if (propError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const area = property.building_area_sqm || property.land_area_sqm || 0;

    // 2. Find comparable properties (same city + type, excluding self)
    let query = supabase
      .from('properties')
      .select('id, title, price, land_area_sqm, building_area_sqm, city, property_type')
      .neq('id', property_id)
      .gt('price', 0);

    if (property.city) query = query.eq('city', property.city);
    if (property.property_type) query = query.eq('property_type', property.property_type);

    const { data: comparables, error: compError } = await query.limit(50);

    if (compError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch comparables' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validComparables = (comparables || []).filter(c => {
      const cArea = c.building_area_sqm || c.land_area_sqm;
      return cArea && cArea > 0 && c.price > 0;
    });

    const comparablesCount = validComparables.length;

    if (comparablesCount === 0) {
      // No comparables — return property price as estimate with low confidence
      const result = {
        estimated_value: property.price,
        confidence_score: 15,
        market_trend: 'stable',
        comparables_count: 0,
        price_range_low: property.price * 0.85,
        price_range_high: property.price * 1.15,
        comparable_properties: [],
        valuation_method: 'insufficient_data',
      };

      await upsertValuation(supabase, property_id, result, user.id);

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Calculate avg price per sqm from comparables
    const pricesPerSqm = validComparables.map(c => {
      const cArea = c.building_area_sqm || c.land_area_sqm || 1;
      return c.price / cArea;
    });

    const avgPricePerSqm = pricesPerSqm.reduce((s, v) => s + v, 0) / pricesPerSqm.length;
    const medianPricePerSqm = getMedian(pricesPerSqm);

    // Use weighted average of mean and median for robustness
    const weightedPricePerSqm = avgPricePerSqm * 0.4 + medianPricePerSqm * 0.6;

    // 4. Estimate property value
    const estimatedValue = Math.round(weightedPricePerSqm * (area || 100));

    // 5. Confidence score (based on comparables count and price spread)
    const stdDev = Math.sqrt(
      pricesPerSqm.reduce((s, v) => s + Math.pow(v - avgPricePerSqm, 2), 0) / pricesPerSqm.length
    );
    const coefficientOfVariation = avgPricePerSqm > 0 ? stdDev / avgPricePerSqm : 1;
    const countFactor = Math.min(comparablesCount / 20, 1); // max at 20 comparables
    const spreadFactor = Math.max(1 - coefficientOfVariation, 0.2); // low spread = high confidence
    const confidenceScore = Math.round(Math.min((countFactor * 0.5 + spreadFactor * 0.5) * 100, 95));

    // 6. Market trend (compare property price to estimated)
    const priceDiff = property.price > 0 ? (estimatedValue - property.price) / property.price : 0;
    let marketTrend = 'stable';
    if (priceDiff > 0.10) marketTrend = 'rising';
    else if (priceDiff < -0.10) marketTrend = 'declining';

    // 7. Price range (±15% adjusted by confidence)
    const margin = 0.15 * (1 + (1 - confidenceScore / 100));
    const priceRangeLow = Math.round(estimatedValue * (1 - margin));
    const priceRangeHigh = Math.round(estimatedValue * (1 + margin));

    // 8. Top comparables for response
    const topComparables = validComparables
      .map(c => {
        const cArea = c.building_area_sqm || c.land_area_sqm || 1;
        const ppsqm = c.price / cArea;
        const similarity = Math.max(0, 1 - Math.abs(ppsqm - weightedPricePerSqm) / weightedPricePerSqm);
        return {
          id: c.id,
          title: c.title,
          price: c.price,
          area: cArea,
          price_per_sqm: Math.round(ppsqm),
          city: c.city,
          similarity: Math.round(similarity * 100),
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const result = {
      estimated_value: estimatedValue,
      confidence_score: confidenceScore,
      market_trend: marketTrend,
      comparables_count: comparablesCount,
      price_range_low: priceRangeLow,
      price_range_high: priceRangeHigh,
      avg_price_per_sqm: Math.round(weightedPricePerSqm),
      comparable_properties: topComparables,
      valuation_method: 'comparative_market_analysis',
      property_price: property.price,
      property_area: area,
    };

    // 9. Store in property_valuations
    await upsertValuation(supabase, property_id, result, user.id);

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('calculate-property-value error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function upsertValuation(
  supabase: any,
  propertyId: string,
  result: any,
  userId: string
) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  await supabase.from('property_valuations').insert({
    property_id: propertyId,
    estimated_value: result.estimated_value,
    confidence_score: result.confidence_score,
    market_trend: result.market_trend,
    price_range_low: result.price_range_low,
    price_range_high: result.price_range_high,
    comparable_properties: result.comparable_properties,
    valuation_method: result.valuation_method,
    requested_by: userId,
    valid_until: validUntil.toISOString(),
    currency: 'IDR',
  });
}
