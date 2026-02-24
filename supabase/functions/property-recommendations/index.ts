import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ScoredProperty {
  property: any;
  score: number;
  matchPercentage: number;
  reasons: string[];
}

function extractFeatureKeys(features: Record<string, any> | null): string[] {
  if (!features) return [];
  return Object.entries(features)
    .filter(([_, v]) => v === true || v === 'true' || v === 1)
    .map(([k]) => k.toLowerCase());
}

const featureLabels: Record<string, string> = {
  swimmingpool: 'Pool', pool: 'Pool',
  garage: 'Garage', parking: 'Parking',
  garden: 'Garden', gym: 'Gym',
  security: 'Security', cctv: 'CCTV',
  elevator: 'Elevator', airconditioner: 'AC',
  wifi: 'WiFi', balcony: 'Balcony',
  furnished: 'Furnished', beachaccess: 'Beach Access',
};

function scoreProperty(target: any, candidate: any): ScoredProperty {
  let score = 0;
  const reasons: string[] = [];

  // Property type match (25 pts)
  if (candidate.property_type && candidate.property_type === target.property_type) {
    score += 25;
    reasons.push('Same type');
  }

  // Location match (city: 20pts, state: 10pts)
  if (candidate.city && target.city && candidate.city.toLowerCase() === target.city.toLowerCase()) {
    score += 20;
    reasons.push('Same area');
  } else if (candidate.state && target.state && candidate.state.toLowerCase() === target.state.toLowerCase()) {
    score += 10;
    reasons.push('Same region');
  }

  // Price proximity (up to 20 pts)
  if (target.price && candidate.price && target.price > 0) {
    const priceDiffPct = Math.abs(candidate.price - target.price) / target.price;
    score += Math.max(0, 20 - priceDiffPct * 100);
    if (priceDiffPct < 0.15) reasons.push('Similar price');
  }

  // Bedroom match (up to 10 pts)
  if (target.bedrooms && candidate.bedrooms) {
    if (candidate.bedrooms === target.bedrooms) {
      score += 10;
      reasons.push('Same bedrooms');
    } else if (Math.abs(candidate.bedrooms - target.bedrooms) === 1) {
      score += 5;
    }
  }

  // Bathroom match (up to 5 pts)
  if (target.bathrooms && candidate.bathrooms) {
    if (candidate.bathrooms === target.bathrooms) {
      score += 5;
    }
  }

  // Area similarity (up to 10 pts)
  if (target.area_sqm && candidate.area_sqm && target.area_sqm > 0) {
    const areaDiffPct = Math.abs(candidate.area_sqm - target.area_sqm) / target.area_sqm;
    const areaScore = Math.max(0, 10 - areaDiffPct * 50);
    score += areaScore;
    if (areaDiffPct < 0.2) reasons.push('Similar size');
  }

  // Feature/amenity overlap (up to 10 pts)
  const targetFeatures = extractFeatureKeys(target.property_features);
  const candidateFeatures = extractFeatureKeys(candidate.property_features);
  const shared = targetFeatures.filter(f => candidateFeatures.includes(f));
  score += Math.min(10, shared.length * 2);
  shared.slice(0, 3).forEach(f => {
    const label = featureLabels[f] || f;
    reasons.push(label);
  });

  const maxScore = 100;
  const matchPercentage = Math.round(Math.min(100, (score / maxScore) * 100));

  return { property: candidate, score, matchPercentage, reasons };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, limit = 6 } = await req.json();

    if (!propertyId) {
      return new Response(JSON.stringify({ error: 'propertyId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch target property
    const { data: target, error: targetErr } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (targetErr || !target) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch candidate properties - same listing_type, active, exclude self
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .neq('id', propertyId)
      .limit(50);

    if (target.listing_type) {
      query = query.eq('listing_type', target.listing_type);
    }

    const { data: candidates, error: candErr } = await query;

    if (candErr || !candidates) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Score and sort
    const scored = candidates
      .map(c => scoreProperty(target, c))
      .filter(s => s.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return new Response(JSON.stringify({ recommendations: scored }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
