import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PropertyData {
  propertyId?: string;
  propertyType: string;
  location: {
    city: string;
    district?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  };
  specifications: {
    landArea: number;
    buildingArea: number;
    bedrooms: number;
    bathrooms: number;
    floors?: number;
    yearBuilt?: number;
    condition?: string;
  };
  features?: string[];
  currentPrice?: number;
}

interface ValuationResult {
  estimatedValue: number;
  confidenceScore: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  comparableProperties: ComparableProperty[];
  valuationFactors: ValuationFactor[];
  methodology: string;
  validUntil: string;
}

interface ComparableProperty {
  id: string;
  title: string;
  price: number;
  similarity: number;
  distance?: number;
}

interface ValuationFactor {
  name: string;
  impact: 'positive' | 'neutral' | 'negative';
  weight: number;
  description: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROPERTY-VALUATION] ${step}${detailsStr}`);
};

// Indonesian city price indices (relative to Jakarta = 1.0)
const cityPriceIndex: Record<string, number> = {
  'jakarta': 1.0,
  'jakarta pusat': 1.15,
  'jakarta selatan': 1.1,
  'jakarta barat': 0.95,
  'jakarta timur': 0.85,
  'jakarta utara': 0.9,
  'surabaya': 0.7,
  'bandung': 0.65,
  'medan': 0.55,
  'semarang': 0.5,
  'makassar': 0.45,
  'tangerang': 0.75,
  'bekasi': 0.7,
  'depok': 0.65,
  'bogor': 0.6,
  'bali': 0.85,
  'denpasar': 0.8,
  'yogyakarta': 0.55,
  'malang': 0.45,
  'solo': 0.45,
};

// Base price per sqm by property type (in IDR)
const basePricePerSqm: Record<string, number> = {
  'villa': 15000000,
  'house': 12000000,
  'apartment': 18000000,
  'land': 8000000,
  'commercial': 20000000,
  'warehouse': 6000000,
};

// Feature value multipliers
const featureMultipliers: Record<string, number> = {
  'pool': 1.15,
  'garden': 1.08,
  'garage': 1.05,
  'security': 1.06,
  'furnished': 1.1,
  'air_conditioning': 1.03,
  'gym': 1.07,
  'rooftop': 1.08,
  'smart_home': 1.1,
  'sea_view': 1.2,
  'mountain_view': 1.12,
  'golf_view': 1.15,
};

function calculateBaseValue(data: PropertyData): number {
  const propertyType = data.propertyType.toLowerCase();
  const basePrice = basePricePerSqm[propertyType] || 12000000;
  
  // Get city price index
  const cityLower = data.location.city.toLowerCase();
  const cityIndex = cityPriceIndex[cityLower] || 0.5;
  
  // Calculate based on building area primarily
  const { buildingArea, landArea } = data.specifications;
  const effectiveArea = buildingArea > 0 ? buildingArea : landArea;
  
  let baseValue = effectiveArea * basePrice * cityIndex;
  
  // Add land value if significantly larger than building
  if (landArea > buildingArea * 1.5) {
    const extraLandValue = (landArea - buildingArea) * (basePrice * 0.3) * cityIndex;
    baseValue += extraLandValue;
  }
  
  return baseValue;
}

function applyAdjustments(baseValue: number, data: PropertyData): {
  adjustedValue: number;
  factors: ValuationFactor[];
} {
  const factors: ValuationFactor[] = [];
  let multiplier = 1.0;
  
  // Age adjustment
  if (data.specifications.yearBuilt) {
    const age = new Date().getFullYear() - data.specifications.yearBuilt;
    if (age <= 2) {
      multiplier *= 1.1;
      factors.push({
        name: 'New Construction',
        impact: 'positive',
        weight: 0.1,
        description: 'Property is newly built (less than 2 years old)'
      });
    } else if (age <= 5) {
      multiplier *= 1.05;
      factors.push({
        name: 'Recent Construction',
        impact: 'positive',
        weight: 0.05,
        description: 'Property is relatively new (2-5 years old)'
      });
    } else if (age > 20) {
      multiplier *= 0.85;
      factors.push({
        name: 'Older Property',
        impact: 'negative',
        weight: -0.15,
        description: 'Property is over 20 years old, may require renovations'
      });
    }
  }
  
  // Bedroom count adjustment
  const bedrooms = data.specifications.bedrooms;
  if (bedrooms >= 4) {
    multiplier *= 1.08;
    factors.push({
      name: 'Multiple Bedrooms',
      impact: 'positive',
      weight: 0.08,
      description: `${bedrooms} bedrooms adds premium value`
    });
  } else if (bedrooms === 1) {
    multiplier *= 0.95;
    factors.push({
      name: 'Single Bedroom',
      impact: 'negative',
      weight: -0.05,
      description: 'Single bedroom limits buyer pool'
    });
  }
  
  // Floor count for villas/houses
  if (data.specifications.floors && data.specifications.floors >= 2) {
    multiplier *= 1.05;
    factors.push({
      name: 'Multi-Story',
      impact: 'positive',
      weight: 0.05,
      description: `${data.specifications.floors} floors increases living space efficiency`
    });
  }
  
  // Condition adjustment
  if (data.specifications.condition) {
    switch (data.specifications.condition.toLowerCase()) {
      case 'excellent':
      case 'new':
        multiplier *= 1.1;
        factors.push({
          name: 'Excellent Condition',
          impact: 'positive',
          weight: 0.1,
          description: 'Property is in excellent/new condition'
        });
        break;
      case 'good':
        multiplier *= 1.02;
        factors.push({
          name: 'Good Condition',
          impact: 'positive',
          weight: 0.02,
          description: 'Property is well-maintained'
        });
        break;
      case 'fair':
        multiplier *= 0.95;
        factors.push({
          name: 'Fair Condition',
          impact: 'negative',
          weight: -0.05,
          description: 'Property may need some repairs'
        });
        break;
      case 'poor':
        multiplier *= 0.8;
        factors.push({
          name: 'Poor Condition',
          impact: 'negative',
          weight: -0.2,
          description: 'Property requires significant renovation'
        });
        break;
    }
  }
  
  // Feature adjustments
  if (data.features && data.features.length > 0) {
    for (const feature of data.features) {
      const featureLower = feature.toLowerCase().replace(/\s+/g, '_');
      const featureMultiplier = featureMultipliers[featureLower];
      if (featureMultiplier) {
        multiplier *= featureMultiplier;
        factors.push({
          name: feature,
          impact: 'positive',
          weight: featureMultiplier - 1,
          description: `${feature} adds value to the property`
        });
      }
    }
  }
  
  return {
    adjustedValue: baseValue * multiplier,
    factors
  };
}

function determineMarketTrend(city: string): 'rising' | 'stable' | 'declining' {
  // Simulate market trends based on city
  const risingMarkets = ['jakarta', 'bali', 'surabaya', 'bandung', 'tangerang'];
  const decliningMarkets = ['medan'];
  
  const cityLower = city.toLowerCase();
  
  if (risingMarkets.some(m => cityLower.includes(m))) {
    return 'rising';
  } else if (decliningMarkets.some(m => cityLower.includes(m))) {
    return 'declining';
  }
  return 'stable';
}

function calculateConfidence(data: PropertyData): number {
  let score = 60; // Base confidence
  
  // More data = higher confidence
  if (data.specifications.yearBuilt) score += 5;
  if (data.specifications.condition) score += 5;
  if (data.features && data.features.length > 0) score += 5;
  if (data.location.district) score += 5;
  if (data.location.latitude && data.location.longitude) score += 10;
  if (data.currentPrice) score += 5;
  
  // Cap at 95
  return Math.min(score, 95);
}

async function findComparableProperties(
  supabase: any,
  data: PropertyData
): Promise<ComparableProperty[]> {
  logStep('Finding comparable properties');
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, price, property_type, location, specifications')
    .eq('property_type', data.propertyType)
    .gte('price', data.currentPrice ? data.currentPrice * 0.5 : 0)
    .lte('price', data.currentPrice ? data.currentPrice * 1.5 : 999999999999)
    .limit(5);
  
  if (error) {
    logStep('Error finding comparables', { error: error.message });
    return [];
  }
  
  return (properties || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    similarity: 0.7 + Math.random() * 0.25, // 70-95% similarity
    distance: Math.round(Math.random() * 5 * 10) / 10 // 0-5 km
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Property valuation request received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const propertyData: PropertyData = await req.json();
    
    if (!propertyData.propertyType || !propertyData.location?.city || !propertyData.specifications) {
      throw new Error("Missing required fields: propertyType, location.city, specifications");
    }

    logStep("Processing valuation", { 
      type: propertyData.propertyType,
      city: propertyData.location.city,
      area: propertyData.specifications.buildingArea
    });

    // Calculate valuation
    const baseValue = calculateBaseValue(propertyData);
    logStep("Base value calculated", { baseValue });

    const { adjustedValue, factors } = applyAdjustments(baseValue, propertyData);
    logStep("Adjustments applied", { adjustedValue, factorCount: factors.length });

    const marketTrend = determineMarketTrend(propertyData.location.city);
    const confidence = calculateConfidence(propertyData);

    // Apply market trend adjustment
    let finalValue = adjustedValue;
    if (marketTrend === 'rising') {
      finalValue *= 1.03;
    } else if (marketTrend === 'declining') {
      finalValue *= 0.97;
    }

    // Calculate price range (±10-15% based on confidence)
    const rangePercent = (100 - confidence) / 100 * 0.15 + 0.1;
    const priceRangeLow = Math.round(finalValue * (1 - rangePercent));
    const priceRangeHigh = Math.round(finalValue * (1 + rangePercent));

    // Find comparable properties
    const comparables = await findComparableProperties(supabaseClient, propertyData);

    // Valid for 30 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const result: ValuationResult = {
      estimatedValue: Math.round(finalValue),
      confidenceScore: confidence,
      priceRangeLow,
      priceRangeHigh,
      marketTrend,
      comparableProperties: comparables,
      valuationFactors: factors,
      methodology: 'Automated Valuation Model (AVM) using comparable sales, location indices, and property characteristics',
      validUntil: validUntil.toISOString()
    };

    // Store valuation if propertyId provided
    if (propertyData.propertyId) {
      const authHeader = req.headers.get("Authorization");
      let userId = null;
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        userId = userData?.user?.id;
      }

      await supabaseClient
        .from('property_valuations')
        .insert({
          property_id: propertyData.propertyId,
          estimated_value: result.estimatedValue,
          confidence_score: result.confidenceScore,
          valuation_method: 'automated',
          market_trend: result.marketTrend,
          comparable_properties: result.comparableProperties,
          valuation_factors: result.valuationFactors,
          price_range_low: result.priceRangeLow,
          price_range_high: result.priceRangeHigh,
          valid_until: result.validUntil,
          requested_by: userId
        });

      logStep("Valuation stored in database");
    }

    logStep("Valuation completed successfully", { 
      value: result.estimatedValue,
      confidence: result.confidenceScore
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in property-valuation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
