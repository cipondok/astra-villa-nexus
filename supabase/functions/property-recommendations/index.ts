import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ScoreBreakdown {
  type: number;
  location: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  features: number;
  userType: number;
  userCity: number;
  userPrice: number;
  userBedrooms: number;
  userFeatures: number;
}

interface ScoredProperty {
  property: any;
  score: number;
  matchPercentage: number;
  reasons: string[];
  scoreBreakdown: ScoreBreakdown;
}

interface UserPreferences {
  preferredTypes: Record<string, number>;
  preferredCities: Record<string, number>;
  priceRange: { min: number; max: number; avg: number } | null;
  preferredBedrooms: Record<number, number>;
  preferredFeatures: Record<string, number>;
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

function buildUserPreferences(properties: any[]): UserPreferences {
  const preferredTypes: Record<string, number> = {};
  const preferredCities: Record<string, number> = {};
  const preferredBedrooms: Record<number, number> = {};
  const preferredFeatures: Record<string, number> = {};
  const prices: number[] = [];

  for (const p of properties) {
    if (p.property_type) {
      preferredTypes[p.property_type] = (preferredTypes[p.property_type] || 0) + 1;
    }
    if (p.city) {
      const city = p.city.toLowerCase();
      preferredCities[city] = (preferredCities[city] || 0) + 1;
    }
    if (p.bedrooms) {
      preferredBedrooms[p.bedrooms] = (preferredBedrooms[p.bedrooms] || 0) + 1;
    }
    if (p.price && p.price > 0) {
      prices.push(p.price);
    }
    for (const f of extractFeatureKeys(p.property_features)) {
      preferredFeatures[f] = (preferredFeatures[f] || 0) + 1;
    }
  }

  const priceRange = prices.length > 0
    ? { min: Math.min(...prices), max: Math.max(...prices), avg: prices.reduce((a, b) => a + b, 0) / prices.length }
    : null;

  return { preferredTypes, preferredCities, priceRange, preferredBedrooms, preferredFeatures };
}

function scoreProperty(target: any, candidate: any, userPrefs: UserPreferences | null): ScoredProperty {
  let score = 0;
  const reasons: string[] = [];
  const bd: ScoreBreakdown = { type: 0, location: 0, price: 0, bedrooms: 0, bathrooms: 0, area: 0, features: 0, userType: 0, userCity: 0, userPrice: 0, userBedrooms: 0, userFeatures: 0 };

  // Property type match (25 pts)
  if (candidate.property_type && candidate.property_type === target.property_type) {
    bd.type = 25; score += 25;
    reasons.push('Same type');
  }

  // Location match
  if (candidate.city && target.city && candidate.city.toLowerCase() === target.city.toLowerCase()) {
    bd.location = 20; score += 20;
    reasons.push('Same area');
  } else if (candidate.state && target.state && candidate.state.toLowerCase() === target.state.toLowerCase()) {
    bd.location = 10; score += 10;
    reasons.push('Same region');
  }

  // Price proximity (up to 20 pts)
  if (target.price && candidate.price && target.price > 0) {
    const priceDiffPct = Math.abs(candidate.price - target.price) / target.price;
    bd.price = Math.round(Math.max(0, 20 - priceDiffPct * 100));
    score += bd.price;
    if (priceDiffPct < 0.15) reasons.push('Similar price');
  }

  // Bedroom match (up to 10 pts)
  if (target.bedrooms && candidate.bedrooms) {
    if (candidate.bedrooms === target.bedrooms) {
      bd.bedrooms = 10; score += 10;
      reasons.push('Same bedrooms');
    } else if (Math.abs(candidate.bedrooms - target.bedrooms) === 1) {
      bd.bedrooms = 5; score += 5;
    }
  }

  // Bathroom match (up to 5 pts)
  if (target.bathrooms && candidate.bathrooms) {
    if (candidate.bathrooms === target.bathrooms) {
      bd.bathrooms = 5; score += 5;
    }
  }

  // Area similarity (up to 10 pts)
  if (target.area_sqm && candidate.area_sqm && target.area_sqm > 0) {
    const areaDiffPct = Math.abs(candidate.area_sqm - target.area_sqm) / target.area_sqm;
    bd.area = Math.round(Math.max(0, 10 - areaDiffPct * 50));
    score += bd.area;
    if (areaDiffPct < 0.2) reasons.push('Similar size');
  }

  // Feature overlap (up to 10 pts)
  const targetFeatures = extractFeatureKeys(target.property_features);
  const candidateFeatures = extractFeatureKeys(candidate.property_features);
  const shared = targetFeatures.filter(f => candidateFeatures.includes(f));
  bd.features = Math.min(10, shared.length * 2);
  score += bd.features;
  shared.slice(0, 3).forEach(f => {
    const label = featureLabels[f] || f;
    reasons.push(label);
  });

  // === User behavior scoring ===
  if (userPrefs) {
    if (candidate.property_type && userPrefs.preferredTypes[candidate.property_type]) {
      const typeCount = userPrefs.preferredTypes[candidate.property_type];
      bd.userType = Math.min(15, typeCount * 5);
      score += bd.userType;
      if (typeCount >= 2 && !reasons.includes('Same type')) reasons.push('Your preferred type');
    }

    if (candidate.city) {
      const cityKey = candidate.city.toLowerCase();
      if (userPrefs.preferredCities[cityKey]) {
        const cityCount = userPrefs.preferredCities[cityKey];
        bd.userCity = Math.min(15, cityCount * 5);
        score += bd.userCity;
        if (cityCount >= 2 && !reasons.includes('Same area')) reasons.push('Preferred area');
      }
    }

    if (userPrefs.priceRange && candidate.price > 0) {
      const { min, max, avg } = userPrefs.priceRange;
      const margin = (max - min) * 0.3 || avg * 0.3;
      if (candidate.price >= min - margin && candidate.price <= max + margin) {
        const diffFromAvg = Math.abs(candidate.price - avg) / avg;
        bd.userPrice = Math.round(Math.max(0, 10 - diffFromAvg * 20));
        score += bd.userPrice;
        if (diffFromAvg < 0.2) reasons.push('In your budget');
      }
    }

    if (candidate.bedrooms && userPrefs.preferredBedrooms[candidate.bedrooms]) {
      bd.userBedrooms = Math.min(5, userPrefs.preferredBedrooms[candidate.bedrooms] * 2);
      score += bd.userBedrooms;
    }

    let featureBoost = 0;
    for (const f of candidateFeatures) {
      if (userPrefs.preferredFeatures[f]) {
        featureBoost += userPrefs.preferredFeatures[f];
      }
    }
    bd.userFeatures = Math.min(5, featureBoost);
    score += bd.userFeatures;
  }

  const maxScore = userPrefs ? 150 : 100;
  const matchPercentage = Math.round(Math.min(100, (score / maxScore) * 100));

  return { property: candidate, score, matchPercentage, reasons, scoreBreakdown: bd };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, userId, limit = 6 } = await req.json();

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

    // Fetch candidates using tiered queries for better coverage
    const baseFilter = (q: any) => {
      q = q.eq('status', 'active').neq('id', propertyId);
      if (target.listing_type) q = q.eq('listing_type', target.listing_type);
      return q;
    };

    // Tier 1: Same city + same type (best matches)
    const tier1 = baseFilter(supabase.from('properties').select('*'))
      .eq('city', target.city || '')
      .eq('property_type', target.property_type || '')
      .limit(20);

    // Tier 2: Same city, any type
    const tier2 = baseFilter(supabase.from('properties').select('*'))
      .eq('city', target.city || '')
      .limit(20);

    // Tier 3: Same state + same type
    const tier3 = baseFilter(supabase.from('properties').select('*'))
      .eq('state', target.state || '')
      .eq('property_type', target.property_type || '')
      .limit(20);

    // Tier 4: Same type anywhere (fallback)
    const tier4 = baseFilter(supabase.from('properties').select('*'))
      .eq('property_type', target.property_type || '')
      .limit(20);

    // Build user preferences from behavior signals (parallel fetches)
    let userPrefs: UserPreferences | null = null;

    // Helper to merge and deduplicate candidates from tiered queries
    const mergeCandidates = (results: any[][]): any[] => {
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const batch of results) {
        for (const p of batch) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
      }
      return merged;
    };

    if (userId) {
      const [t1Res, t2Res, t3Res, t4Res, favoritesRes, viewedRes, searchesRes] = await Promise.all([
        tier1, tier2, tier3, tier4,
        supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('activity_logs')
          .select('metadata')
          .eq('user_id', userId)
          .eq('activity_type', 'property_view')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('user_searches')
          .select('filters')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const candidates = mergeCandidates([
        t1Res.data || [], t2Res.data || [], t3Res.data || [], t4Res.data || []
      ]);

      // Collect property IDs from favorites and views
      const behaviorPropertyIds = new Set<string>();
      
      for (const fav of (favoritesRes.data || [])) {
        behaviorPropertyIds.add(fav.property_id);
      }
      
      for (const log of (viewedRes.data || [])) {
        const meta = log.metadata as any;
        if (meta?.propertyId) behaviorPropertyIds.add(meta.propertyId);
        if (meta?.property_id) behaviorPropertyIds.add(meta.property_id);
      }

      // Fetch the actual properties for behavior signals
      if (behaviorPropertyIds.size > 0) {
        const ids = Array.from(behaviorPropertyIds).slice(0, 30);
        const { data: behaviorProperties } = await supabase
          .from('properties')
          .select('property_type, city, state, price, bedrooms, bathrooms, area_sqm, property_features')
          .in('id', ids);

        if (behaviorProperties && behaviorProperties.length > 0) {
          const favoriteIds = new Set((favoritesRes.data || []).map(f => f.property_id));
          const weighted: any[] = [];
          for (const p of behaviorProperties) {
            weighted.push(p);
            if (favoriteIds.has((p as any).id)) {
              weighted.push(p);
            }
          }

          for (const s of (searchesRes.data || [])) {
            const filters = s.filters as any;
            if (!filters) continue;
            const synthetic: any = {};
            if (filters.propertyType) synthetic.property_type = filters.propertyType;
            if (filters.city) synthetic.city = filters.city;
            if (filters.minPrice && filters.maxPrice) synthetic.price = (filters.minPrice + filters.maxPrice) / 2;
            if (filters.bedrooms) synthetic.bedrooms = filters.bedrooms;
            if (Object.keys(synthetic).length > 0) weighted.push(synthetic);
          }

          userPrefs = buildUserPreferences(weighted);
        }
      }

      const scored = candidates
        .map(c => scoreProperty(target, c, userPrefs))
        .filter(s => s.score > 10)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return new Response(JSON.stringify({ 
        recommendations: scored,
        personalized: !!userPrefs,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // No user - content-based only
    const [t1Res, t2Res, t3Res, t4Res] = await Promise.all([tier1, tier2, tier3, tier4]);
    const candidates = mergeCandidates([
      t1Res.data || [], t2Res.data || [], t3Res.data || [], t4Res.data || []
    ]);

    const scored = candidates
      .map(c => scoreProperty(target, c, null))
      .filter(s => s.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return new Response(JSON.stringify({ 
      recommendations: scored,
      personalized: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
