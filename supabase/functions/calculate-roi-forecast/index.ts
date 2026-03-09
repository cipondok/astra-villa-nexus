import { createClient } from 'npm:@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Base rental yields by property type (annual % of property value)
const BASE_YIELDS: Record<string, number> = {
  kost: 8.5, villa: 5.5, apartment: 6.0, house: 4.5,
  townhouse: 5.0, commercial: 7.0, warehouse: 6.5, land: 2.0,
  office: 6.5, shophouse: 7.5,
};

// City demand premium multipliers
const CITY_PREMIUMS: Record<string, number> = {
  'bali': 1.25, 'jakarta': 1.1, 'surabaya': 1.05, 'bandung': 1.08,
  'yogyakarta': 1.06, 'semarang': 1.03, 'malang': 1.04, 'denpasar': 1.20,
  'tangerang': 1.07, 'bekasi': 1.05, 'depok': 1.04, 'bogor': 1.06,
};

function getCityPremium(city: string, state: string): number {
  const key = (city || state || '').toLowerCase();
  for (const [k, v] of Object.entries(CITY_PREMIUMS)) {
    if (key.includes(k)) return v;
  }
  return 1.0;
}

function assessMarketRisk(comparablesCount: number, priceVariance: number, demandMultiplier: number): string {
  let riskScore = 50;
  if (comparablesCount < 5) riskScore += 20;
  else if (comparablesCount < 15) riskScore += 10;
  else riskScore -= 10;
  if (priceVariance > 0.4) riskScore += 15;
  else if (priceVariance < 0.15) riskScore -= 10;
  if (demandMultiplier >= 1.15) riskScore -= 15;
  else if (demandMultiplier < 1.0) riskScore += 10;

  if (riskScore <= 30) return 'low';
  if (riskScore <= 60) return 'medium';
  return 'high';
}

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
      .select('id, title, city, state, property_type, price, land_area_sqm, building_area_sqm, bedrooms, bathrooms, listing_type, created_at')
      .eq('id', property_id)
      .single();

    if (propError || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const area = property.building_area_sqm || property.land_area_sqm || 1;
    const pricePerSqm = property.price / area;

    // 2. Find comparable properties
    let query = supabase
      .from('properties')
      .select('id, price, land_area_sqm, building_area_sqm, city, property_type, listing_type, created_at')
      .neq('id', property_id)
      .eq('status', 'active')
      .gt('price', 0);

    if (property.city) query = query.eq('city', property.city);
    if (property.property_type) query = query.eq('property_type', property.property_type);

    const { data: comparables } = await query.limit(50);

    const validComps = (comparables || []).filter(c => {
      const cArea = c.building_area_sqm || c.land_area_sqm;
      return cArea && cArea > 0 && c.price > 0;
    });

    const compPricesPerSqm = validComps.map(c => c.price / (c.building_area_sqm || c.land_area_sqm || 1));
    const comparablesCount = validComps.length;

    // 3. Calculate metrics
    const cityPremium = getCityPremium(property.city || '', property.state || '');
    const baseYield = BASE_YIELDS[property.property_type] || 5.0;
    const rentalYield = Math.round((baseYield * cityPremium) * 100) / 100;

    // Price growth forecast based on comparables trend and demand
    let priceGrowth = 3.5; // base annual growth %
    if (compPricesPerSqm.length >= 3) {
      const avgCompPrice = compPricesPerSqm.reduce((a, b) => a + b, 0) / compPricesPerSqm.length;
      const priceDiff = (avgCompPrice - pricePerSqm) / pricePerSqm;
      // If property is undervalued relative to comps, expect higher growth
      priceGrowth += priceDiff * 10;
    }
    priceGrowth = Math.max(1.0, Math.min(12.0, priceGrowth * cityPremium));
    priceGrowth = Math.round(priceGrowth * 100) / 100;

    // Expected ROI = rental yield + price growth
    const expectedROI = Math.round((rentalYield + priceGrowth) * 100) / 100;

    // Price variance for risk assessment
    const priceVariance = compPricesPerSqm.length >= 2
      ? Math.sqrt(compPricesPerSqm.map(p => Math.pow(p - (compPricesPerSqm.reduce((a, b) => a + b, 0) / compPricesPerSqm.length), 2)).reduce((a, b) => a + b, 0) / compPricesPerSqm.length) / (compPricesPerSqm.reduce((a, b) => a + b, 0) / compPricesPerSqm.length)
      : 0.3;

    const marketRisk = assessMarketRisk(comparablesCount, priceVariance, cityPremium);

    // Confidence score (0-100)
    let confidence = 40;
    if (comparablesCount >= 20) confidence += 30;
    else if (comparablesCount >= 10) confidence += 20;
    else if (comparablesCount >= 5) confidence += 10;
    if (priceVariance < 0.2) confidence += 15;
    else if (priceVariance < 0.35) confidence += 8;
    if (cityPremium >= 1.1) confidence += 10;
    confidence = Math.min(95, Math.max(15, confidence));

    // 5-year projection
    const projections = [];
    let currentValue = property.price;
    for (let year = 1; year <= 5; year++) {
      currentValue = currentValue * (1 + priceGrowth / 100);
      const cumulativeRent = property.price * (rentalYield / 100) * year;
      projections.push({
        year,
        predicted_value: Math.round(currentValue),
        cumulative_rental: Math.round(cumulativeRent),
        total_return: Math.round(currentValue - property.price + cumulativeRent),
        roi_percent: Math.round(((currentValue - property.price + cumulativeRent) / property.price) * 10000) / 100,
      });
    }

    const forecastData = {
      price_per_sqm: Math.round(pricePerSqm),
      avg_comp_price_sqm: compPricesPerSqm.length > 0 ? Math.round(compPricesPerSqm.reduce((a, b) => a + b, 0) / compPricesPerSqm.length) : null,
      city_premium: cityPremium,
      base_yield: baseYield,
      price_variance: Math.round(priceVariance * 1000) / 1000,
      projections,
    };

    // 4. Upsert into property_roi_forecast
    const { error: upsertError } = await supabase
      .from('property_roi_forecast')
      .upsert({
        property_id,
        expected_roi: expectedROI,
        rental_yield: rentalYield,
        price_growth_forecast: priceGrowth,
        market_risk: marketRisk,
        confidence_score: confidence,
        comparable_count: comparablesCount,
        forecast_data: forecastData,
        last_calculated: new Date().toISOString(),
      }, { onConflict: 'property_id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    }

    const result = {
      property_id,
      expected_roi: expectedROI,
      rental_yield: rentalYield,
      price_growth_forecast: priceGrowth,
      market_risk: marketRisk,
      confidence_score: confidence,
      comparable_count: comparablesCount,
      forecast_data: forecastData,
    };

    return new Response(JSON.stringify(result), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('calculate-roi-forecast error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
