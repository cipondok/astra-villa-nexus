import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface UserProfile {
  explicit: {
    minBudget?: number;
    maxBudget?: number;
    preferredLocations: string[];
    preferredPropertyTypes: string[];
    minBedrooms?: number;
    maxBedrooms?: number;
    mustHaveFeatures: string[];
    dealBreakers: string[];
  };
  implicit: {
    viewedPriceRange: { min: number; max: number };
    dwellTimeByType: Record<string, number>;
    locationClusters: string[];
    featureAffinities: Record<string, number>;
    stylePreferences: string[];
    timePatterns: string[];
  };
  weights: {
    location: number;
    price: number;
    size: number;
    features: number;
    type: number;
  };
  discoveryOpenness: number;
  hasEnoughData: boolean;
}

interface MatchResult {
  propertyId: string;
  overallScore: number;
  preferenceScore: number;
  discoveryScore: number;
  matchReasons: MatchReason[];
  discoveryReasons?: MatchReason[];
  isDiscoveryMatch: boolean;
}

interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
  weight: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the full body once
    const body = await req.json();
    const { action, userId, propertyId, limit = 10, signalType, signalData, preferences, feedback, recommendationId } = body;

    // For actions that need auth, validate user
    const authHeader = req.headers.get('Authorization');
    let authenticatedUserId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await authClient.auth.getUser();
      authenticatedUserId = user?.id || null;
    }

    const effectiveUserId = userId || authenticatedUserId;

    switch (action) {
      case 'get_recommendations':
        return await getRecommendations(supabase, effectiveUserId, limit);

      case 'get_user_profile':
        if (!effectiveUserId) {
          return new Response(JSON.stringify({ profile: null, activitySummary: null }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return await getUserProfile(supabase, effectiveUserId);

      case 'record_signal':
        if (!effectiveUserId || !propertyId) {
          return new Response(JSON.stringify({ success: false, error: 'Missing userId or propertyId' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return await recordBehaviorSignal(supabase, effectiveUserId, propertyId, signalType, signalData);

      case 'update_preferences':
        if (!effectiveUserId) {
          return new Response(JSON.stringify({ error: 'Not authenticated' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return await updatePreferences(supabase, effectiveUserId, preferences);

      case 'get_match_report':
        if (!effectiveUserId || !propertyId) {
          return new Response(JSON.stringify({ error: 'Missing params' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return await getMatchReport(supabase, effectiveUserId, propertyId);

      case 'provide_feedback':
        return await provideFeedback(supabase, recommendationId, feedback);

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getRecommendations(supabase: any, userId: string | null, limit: number) {
  // Build user profile (or default for anonymous)
  const profile = userId
    ? await buildUserProfile(supabase, userId)
    : getDefaultProfile();

  // Get candidate properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, price, location, city, state, property_type, listing_type, bedrooms, bathrooms, area_sqm, images, thumbnail_url, description, three_d_model_url, virtual_tour_url, created_at, owner_id, property_features, status, approval_status')
    .eq('status', 'active')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  if (!properties || properties.length === 0) {
    return new Response(
      JSON.stringify({ recommendations: [], userProfile: profile, meta: { totalCandidates: 0 } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Score each property
  const scored: MatchResult[] = properties.map((property: any) =>
    scoreProperty(property, profile)
  );

  // Apply 80/20 rule - 80% preference matches, 20% discovery
  const preferenceMatches = scored
    .filter((m) => !m.isDiscoveryMatch)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, Math.ceil(limit * 0.8));

  const discoveryMatches = scored
    .filter((m) => m.isDiscoveryMatch)
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .slice(0, Math.floor(limit * 0.2) + 1);

  // Interleave results
  const recommendations = interleaveResults(preferenceMatches, discoveryMatches).slice(0, limit);

  // Store recommendation history (non-blocking, skip for anonymous)
  if (userId) {
    for (let i = 0; i < Math.min(recommendations.length, 5); i++) {
      const rec = recommendations[i];
      supabase.from('recommendation_history').insert({
        user_id: userId,
        property_id: rec.propertyId,
        overall_score: rec.overallScore,
        preference_score: rec.preferenceScore,
        discovery_score: rec.discoveryScore,
        match_reasons: rec.matchReasons,
        discovery_reasons: rec.discoveryReasons,
        recommendation_context: 'homepage',
        position_shown: i + 1
      }).then(() => {});
    }
  }

  // Build enriched results with full property data
  const enrichedResults = recommendations.map((rec: MatchResult) => ({
    ...rec,
    property: properties.find((p: any) => p.id === rec.propertyId)
  }));

  return new Response(
    JSON.stringify({
      recommendations: enrichedResults,
      userProfile: profile,
      meta: {
        totalCandidates: properties.length,
        preferenceMatches: preferenceMatches.length,
        discoveryMatches: discoveryMatches.length,
        hasPersonalization: profile.hasEnoughData,
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function getDefaultProfile(): UserProfile {
  return {
    explicit: {
      preferredLocations: [],
      preferredPropertyTypes: [],
      mustHaveFeatures: [],
      dealBreakers: [],
    },
    implicit: {
      viewedPriceRange: { min: 0, max: Infinity },
      dwellTimeByType: {},
      locationClusters: [],
      featureAffinities: {},
      stylePreferences: [],
      timePatterns: [],
    },
    weights: { location: 0.25, price: 0.25, size: 0.20, features: 0.15, type: 0.15 },
    discoveryOpenness: 0.5,
    hasEnoughData: false,
  };
}

async function buildUserProfile(supabase: any, userId: string): Promise<UserProfile> {
  // Get explicit preferences
  const { data: explicitPrefs } = await supabase
    .from('user_preference_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Get behavior signals from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: signals } = await supabase
    .from('user_behavior_signals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(200);

  // Also get user_interactions as supplementary data
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('interaction_type, interaction_data, property_id')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(200);

  // Get learned preferences
  const { data: learnedPrefs } = await supabase
    .from('learned_preferences')
    .select('*')
    .eq('user_id', userId);

  // Analyze implicit behavior
  const implicit = analyzeImplicitBehavior(signals || [], interactions || []);
  const mergedLearned = mergeLearned(learnedPrefs || []);

  const totalSignals = (signals?.length || 0) + (interactions?.length || 0);
  const hasEnoughData = totalSignals >= 5;

  return {
    explicit: {
      minBudget: explicitPrefs?.min_budget,
      maxBudget: explicitPrefs?.max_budget,
      preferredLocations: explicitPrefs?.preferred_locations || [],
      preferredPropertyTypes: explicitPrefs?.preferred_property_types || [],
      minBedrooms: explicitPrefs?.min_bedrooms,
      maxBedrooms: explicitPrefs?.max_bedrooms,
      mustHaveFeatures: explicitPrefs?.must_have_features || [],
      dealBreakers: explicitPrefs?.deal_breakers || [],
    },
    implicit: {
      viewedPriceRange: implicit.priceRange,
      dwellTimeByType: implicit.dwellTimeByType,
      locationClusters: implicit.locationClusters,
      featureAffinities: mergedLearned.featureAffinities,
      stylePreferences: mergedLearned.stylePreferences,
      timePatterns: implicit.timePatterns,
    },
    weights: {
      location: explicitPrefs?.location_weight || 0.25,
      price: explicitPrefs?.price_weight || 0.25,
      size: explicitPrefs?.size_weight || 0.20,
      features: explicitPrefs?.features_weight || 0.15,
      type: explicitPrefs?.type_weight || 0.15,
    },
    discoveryOpenness: explicitPrefs?.discovery_openness || 0.2,
    hasEnoughData,
  };
}

function analyzeImplicitBehavior(signals: any[], interactions: any[]) {
  const pricesSeen: number[] = [];
  const dwellTimeByType: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};

  // From behavior signals
  for (const signal of signals) {
    const snapshot = signal.property_snapshot || {};

    if (snapshot.price) pricesSeen.push(snapshot.price);

    if (snapshot.property_type && signal.time_spent_seconds) {
      dwellTimeByType[snapshot.property_type] =
        (dwellTimeByType[snapshot.property_type] || 0) + signal.time_spent_seconds;
    }

    if (snapshot.location) {
      locationCounts[snapshot.location] = (locationCounts[snapshot.location] || 0) + 1;
    }

    const hour = new Date(signal.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  // From user_interactions (supplementary)
  for (const interaction of interactions) {
    const data = interaction.interaction_data || {};
    if (data.price) pricesSeen.push(data.price);
    if (data.city) {
      locationCounts[data.city] = (locationCounts[data.city] || 0) + 1;
    }
    if (data.property_type) {
      dwellTimeByType[data.property_type] = (dwellTimeByType[data.property_type] || 0) + 1;
    }
  }

  // Calculate price range (exclude outliers)
  const sortedPrices = pricesSeen.sort((a, b) => a - b);
  const minPrice = sortedPrices[Math.floor(sortedPrices.length * 0.1)] || 0;
  const maxPrice = sortedPrices[Math.floor(sortedPrices.length * 0.9)] || Infinity;

  // Top locations
  const locationClusters = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([loc]) => loc);

  // Time patterns
  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => {
      const h = parseInt(hour);
      if (h < 12) return 'morning';
      if (h < 17) return 'afternoon';
      return 'evening';
    });

  return {
    priceRange: { min: minPrice, max: maxPrice },
    dwellTimeByType,
    locationClusters,
    timePatterns: [...new Set(peakHours)],
  };
}

function mergeLearned(learnedPrefs: any[]) {
  const featureAffinities: Record<string, number> = {};
  const stylePreferences: string[] = [];

  for (const pref of learnedPrefs) {
    if (pref.pattern_type === 'feature_affinity') {
      featureAffinities[pref.pattern_key] = (pref.pattern_value?.score || 0.5) * (pref.confidence_score || 0.5);
    }
    if (pref.pattern_type === 'style_preference' && (pref.confidence_score || 0) > 0.6) {
      stylePreferences.push(pref.pattern_key);
    }
  }

  return { featureAffinities, stylePreferences };
}

function scoreProperty(property: any, profile: UserProfile): MatchResult {
  const matchReasons: MatchReason[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  const locationScore = scoreLocation(property, profile);
  matchReasons.push(locationScore);
  totalScore += locationScore.score * locationScore.weight;
  totalWeight += locationScore.weight;

  const priceScore = scorePrice(property, profile);
  matchReasons.push(priceScore);
  totalScore += priceScore.score * priceScore.weight;
  totalWeight += priceScore.weight;

  const sizeScore = scoreSize(property, profile);
  matchReasons.push(sizeScore);
  totalScore += sizeScore.score * sizeScore.weight;
  totalWeight += sizeScore.weight;

  const typeScore = scoreType(property, profile);
  matchReasons.push(typeScore);
  totalScore += typeScore.score * typeScore.weight;
  totalWeight += typeScore.weight;

  const featuresScore = scoreFeatures(property, profile);
  matchReasons.push(featuresScore);
  totalScore += featuresScore.score * featuresScore.weight;
  totalWeight += featuresScore.weight;

  const preferenceScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;

  const { discoveryScore, discoveryReasons } = calculateDiscoveryScore(property, profile);
  const isDiscoveryMatch = preferenceScore < 60 && discoveryScore > 50;

  const overallScore = isDiscoveryMatch
    ? discoveryScore
    : (preferenceScore * 0.8) + (discoveryScore * 0.2);

  return {
    propertyId: property.id,
    overallScore: Math.round(overallScore),
    preferenceScore: Math.round(preferenceScore),
    discoveryScore: Math.round(discoveryScore),
    matchReasons,
    discoveryReasons,
    isDiscoveryMatch,
  };
}

function scoreLocation(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.location;
  const location = (property.location || property.city || '').toLowerCase();

  const explicitMatch = profile.explicit.preferredLocations.some(
    loc => location.includes(loc.toLowerCase())
  );
  const implicitMatch = profile.implicit.locationClusters.some(
    loc => location.includes(loc.toLowerCase())
  );

  let score = 0;
  let explanation = '';

  if (explicitMatch) {
    score = 1;
    explanation = `Preferred area: ${property.city || property.location}`;
  } else if (implicitMatch) {
    score = 0.8;
    explanation = `Similar to areas you browse: ${property.city || property.location}`;
  } else {
    score = 0.3;
    explanation = `New area: ${property.city || property.location}`;
  }

  return { factor: 'Location', score, explanation, weight };
}

function scorePrice(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.price;
  const price = property.price || 0;

  const explicitMin = profile.explicit.minBudget || 0;
  const explicitMax = profile.explicit.maxBudget || Infinity;
  const implicitMin = profile.implicit.viewedPriceRange.min;
  const implicitMax = profile.implicit.viewedPriceRange.max;

  let score = 0;
  let explanation = '';

  if (explicitMax !== Infinity && price >= explicitMin && price <= explicitMax) {
    score = 1;
    explanation = `Within your budget`;
  } else if (implicitMax !== Infinity && price >= implicitMin && price <= implicitMax) {
    score = 0.7;
    explanation = `Similar to properties you've viewed`;
  } else if (explicitMax !== Infinity && price < explicitMin * 0.8) {
    score = 0.5;
    explanation = `Below budget - potential value`;
  } else if (explicitMax !== Infinity && price > explicitMax * 1.2) {
    score = 0.2;
    explanation = `Above budget`;
  } else {
    score = 0.5;
    explanation = `Price range match`;
  }

  return { factor: 'Price', score, explanation, weight };
}

function scoreSize(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.size;
  const bedrooms = property.bedrooms || 0;

  const minBed = profile.explicit.minBedrooms || 0;
  const maxBed = profile.explicit.maxBedrooms || Infinity;

  let score = 0;
  let explanation = '';

  if (minBed === 0 && maxBed === Infinity) {
    score = 0.5;
    explanation = `${bedrooms} bedrooms`;
  } else if (bedrooms >= minBed && bedrooms <= maxBed) {
    score = 1;
    explanation = `${bedrooms} bedrooms matches your needs`;
  } else if (bedrooms === minBed - 1 || bedrooms === maxBed + 1) {
    score = 0.6;
    explanation = `${bedrooms} bedrooms - close to preference`;
  } else {
    score = 0.3;
    explanation = `${bedrooms} bedrooms available`;
  }

  return { factor: 'Size', score, explanation, weight };
}

function scoreType(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.type;
  const propertyType = (property.property_type || '').toLowerCase();

  const explicitMatch = profile.explicit.preferredPropertyTypes.some(
    t => propertyType.includes(t.toLowerCase())
  );

  const dwellTime = profile.implicit.dwellTimeByType[propertyType] || 0;
  const dwellValues = Object.values(profile.implicit.dwellTimeByType);
  const avgDwell = dwellValues.length > 0
    ? dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length
    : 0;

  let score = 0;
  let explanation = '';

  if (explicitMatch) {
    score = 1;
    explanation = `${property.property_type} - your preferred type`;
  } else if (dwellTime > avgDwell && avgDwell > 0) {
    score = 0.8;
    explanation = `${property.property_type} - you've shown interest`;
  } else {
    score = 0.4;
    explanation = `${property.property_type || 'Property'}`;
  }

  return { factor: 'Property Type', score, explanation, weight };
}

function scoreFeatures(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.features;
  const features: string[] = [];
  
  // Extract features from property_features object
  const pf = property.property_features;
  if (pf && typeof pf === 'object') {
    for (const [key, val] of Object.entries(pf)) {
      if (val === true || val === 'yes') features.push(key.toLowerCase());
      if (typeof val === 'string' && val.length > 0 && val !== 'no') features.push(key.toLowerCase());
    }
  }

  const mustHaves = profile.explicit.mustHaveFeatures;
  const hasAllMustHaves = mustHaves.length > 0 && mustHaves.every(f =>
    features.some(pf => pf.includes(f.toLowerCase()))
  );

  const dealBreakers = profile.explicit.dealBreakers;
  const hasDealBreaker = dealBreakers.some(d =>
    features.some(pf => pf.includes(d.toLowerCase()))
  );

  const affinityScore = Object.entries(profile.implicit.featureAffinities)
    .reduce((sum, [feature, affinity]) => {
      if (features.some(f => f.includes(feature.toLowerCase()))) {
        return sum + affinity;
      }
      return sum;
    }, 0);

  let score = 0;
  let explanation = '';

  if (hasDealBreaker) {
    score = 0;
    explanation = 'Contains features you want to avoid';
  } else if (hasAllMustHaves) {
    score = 1;
    explanation = 'Has all your must-have features';
  } else if (affinityScore > 0.5) {
    score = 0.8;
    explanation = 'Features you\'ve shown interest in';
  } else {
    score = 0.5;
    explanation = `${features.length} features available`;
  }

  return { factor: 'Features', score, explanation, weight };
}

function calculateDiscoveryScore(property: any, profile: UserProfile): {
  discoveryScore: number;
  discoveryReasons: MatchReason[]
} {
  const reasons: MatchReason[] = [];
  let score = 0;
  let totalWeight = 0;

  // 1. New listing bonus
  const createdAt = new Date(property.created_at);
  const daysSinceListing = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceListing < 7) {
    const newScore = 0.9;
    reasons.push({ factor: 'New Listing', score: newScore, explanation: 'Just listed — be among the first!', weight: 0.3 });
    score += newScore * 0.3;
    totalWeight += 0.3;
  } else if (daysSinceListing < 14) {
    const newScore = 0.6;
    reasons.push({ factor: 'Recent Listing', score: newScore, explanation: 'Recently listed', weight: 0.2 });
    score += newScore * 0.2;
    totalWeight += 0.2;
  }

  // 2. Value proposition
  if (property.price && property.bedrooms && property.bedrooms > 0) {
    const pricePerBed = property.price / property.bedrooms;
    if (pricePerBed < 500000000) { // Under 500M IDR per bedroom
      reasons.push({ factor: 'Value', score: 0.85, explanation: 'Great value for the size', weight: 0.3 });
      score += 0.85 * 0.3;
      totalWeight += 0.3;
    }
  }

  // 3. Style expansion
  const propType = (property.property_type || '').toLowerCase();
  const isNewStyle = !profile.implicit.stylePreferences.includes(propType);
  if (isNewStyle && profile.discoveryOpenness > 0.3) {
    reasons.push({ factor: 'Style Discovery', score: 0.6, explanation: 'A different style you might like', weight: 0.2 });
    score += 0.6 * 0.2;
    totalWeight += 0.2;
  }

  // 4. Market trend placeholder
  reasons.push({ factor: 'Trending', score: 0.5, explanation: 'Popular area', weight: 0.2 });
  score += 0.5 * 0.2;
  totalWeight += 0.2;

  const discoveryScore = totalWeight > 0 ? (score / totalWeight) * 100 : 50;

  return { discoveryScore: Math.round(discoveryScore), discoveryReasons: reasons };
}

function interleaveResults(preference: MatchResult[], discovery: MatchResult[]): MatchResult[] {
  const result: MatchResult[] = [];
  let prefIdx = 0;
  let discIdx = 0;

  for (let i = 0; i < preference.length + discovery.length; i++) {
    if ((i + 1) % 4 === 0 && discIdx < discovery.length) {
      result.push(discovery[discIdx++]);
    } else if (prefIdx < preference.length) {
      result.push(preference[prefIdx++]);
    } else if (discIdx < discovery.length) {
      result.push(discovery[discIdx++]);
    }
  }

  return result;
}

async function getUserProfile(supabase: any, userId: string) {
  const profile = await buildUserProfile(supabase, userId);

  const { data: recentActivity } = await supabase
    .from('user_behavior_signals')
    .select('signal_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  // Also check user_interactions count
  const { count: interactionCount } = await supabase
    .from('user_interactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const activitySummary = {
    totalViews: recentActivity?.filter((a: any) => a.signal_type === 'view').length || 0,
    totalSaves: recentActivity?.filter((a: any) => a.signal_type === 'save').length || 0,
    totalInquiries: recentActivity?.filter((a: any) => a.signal_type === 'inquiry').length || 0,
    totalInteractions: interactionCount || 0,
    lastActive: recentActivity?.[0]?.created_at,
  };

  return new Response(
    JSON.stringify({ profile, activitySummary }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function recordBehaviorSignal(
  supabase: any,
  userId: string,
  propertyId: string,
  signalType: string,
  signalData: any
) {
  // Get property snapshot
  const { data: property } = await supabase
    .from('properties')
    .select('id, title, price, location, city, property_type, bedrooms, property_features')
    .eq('id', propertyId)
    .single();

  await supabase.from('user_behavior_signals').insert({
    user_id: userId,
    property_id: propertyId,
    signal_type: signalType,
    signal_strength: calculateSignalStrength(signalType, signalData || {}),
    time_spent_seconds: signalData?.timeSpent,
    scroll_depth: signalData?.scrollDepth,
    photos_viewed: signalData?.photosViewed,
    sections_expanded: signalData?.sectionsExpanded,
    property_snapshot: property,
    session_id: signalData?.sessionId,
    device_type: signalData?.deviceType,
  });

  // Update learned preferences based on signal
  if (property) {
    await updateLearnedPreferences(supabase, userId, property, signalType, signalData || {});
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateSignalStrength(signalType: string, data: any): number {
  const baseStrengths: Record<string, number> = {
    view: 0.3, dwell: 0.5, save: 0.8, share: 0.7, inquiry: 1.0, revisit: 0.6, compare: 0.4,
  };

  let strength = baseStrengths[signalType] || 0.3;
  if (data?.timeSpent > 120) strength *= 1.3;
  if (data?.scrollDepth > 80) strength *= 1.2;
  if (data?.photosViewed > 5) strength *= 1.1;

  return Math.min(strength, 1.0);
}

async function updateLearnedPreferences(
  supabase: any,
  userId: string,
  property: any,
  signalType: string,
  signalData: any
) {
  // Update feature affinity from property_features
  const pf = property.property_features;
  if (pf && typeof pf === 'object' && signalType !== 'view') {
    const featureKeys = Object.entries(pf)
      .filter(([_, val]) => val === true || val === 'yes')
      .map(([key]) => key.toLowerCase())
      .slice(0, 5); // limit to avoid too many upserts

    for (const feature of featureKeys) {
      await supabase.from('learned_preferences').upsert({
        user_id: userId,
        pattern_type: 'feature_affinity',
        pattern_key: feature,
        pattern_value: { score: signalType === 'save' || signalType === 'inquiry' ? 0.8 : 0.5 },
        confidence_score: 0.6,
        sample_count: 1,
        last_reinforced_at: new Date().toISOString(),
      }, { onConflict: 'user_id,pattern_type,pattern_key' });
    }
  }

  // Update style preference
  if (property.property_type && (signalType === 'save' || signalType === 'inquiry')) {
    await supabase.from('learned_preferences').upsert({
      user_id: userId,
      pattern_type: 'style_preference',
      pattern_key: property.property_type.toLowerCase(),
      pattern_value: { preferred: true },
      confidence_score: 0.7,
      sample_count: 1,
      last_reinforced_at: new Date().toISOString(),
    }, { onConflict: 'user_id,pattern_type,pattern_key' });
  }
}

async function updatePreferences(supabase: any, userId: string, preferences: any) {
  const { error } = await supabase
    .from('user_preference_profiles')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getMatchReport(supabase: any, userId: string, propertyId: string) {
  const profile = await buildUserProfile(supabase, userId);

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (!property) throw new Error('Property not found');

  const matchResult = scoreProperty(property, profile);

  // Generate AI explanation
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  let aiExplanation = '';

  if (LOVABLE_API_KEY) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'You are a real estate advisor. Explain why a property matches a user\'s preferences in 2-3 friendly sentences. Be specific.' },
            { role: 'user', content: `Property: ${property.title} in ${property.city || property.location}, ${property.property_type}, ${property.bedrooms} bed, Rp ${property.price?.toLocaleString()}. Match score: ${matchResult.overallScore}%. Top reasons: ${matchResult.matchReasons.map(r => r.explanation).join('; ')}` }
          ],
          max_tokens: 150,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiExplanation = data.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.error('AI explanation error:', e);
    }
  }

  return new Response(
    JSON.stringify({ property, matchResult, userProfile: profile, aiExplanation }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function provideFeedback(supabase: any, recommendationId: string, feedback: string) {
  await supabase
    .from('recommendation_history')
    .update({ user_feedback: feedback, feedback_at: new Date().toISOString() })
    .eq('id', recommendationId);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
