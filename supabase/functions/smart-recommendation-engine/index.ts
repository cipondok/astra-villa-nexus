import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, propertyId, limit = 10 } = await req.json();

    switch (action) {
      case 'get_recommendations':
        return await getRecommendations(supabase, userId, limit);
      
      case 'get_user_profile':
        return await getUserProfile(supabase, userId);
      
      case 'record_signal':
        const { signalType, signalData } = await req.json();
        return await recordBehaviorSignal(supabase, userId, propertyId, signalType, signalData);
      
      case 'update_preferences':
        const { preferences } = await req.json();
        return await updatePreferences(supabase, userId, preferences);
      
      case 'get_match_report':
        return await getMatchReport(supabase, userId, propertyId);
      
      case 'provide_feedback':
        const { feedback, recommendationId } = await req.json();
        return await provideFeedback(supabase, recommendationId, feedback);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getRecommendations(supabase: any, userId: string, limit: number) {
  // 1. Build user profile from explicit + implicit data
  const profile = await buildUserProfile(supabase, userId);
  
  // 2. Get candidate properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .limit(100);

  if (error) throw error;

  // 3. Score each property
  const scored = properties.map((property: any) => 
    scoreProperty(property, profile)
  );

  // 4. Apply 80/20 rule - 80% preference matches, 20% discovery
  const preferenceMatches = scored
    .filter((m: MatchResult) => !m.isDiscoveryMatch)
    .sort((a: MatchResult, b: MatchResult) => b.overallScore - a.overallScore)
    .slice(0, Math.ceil(limit * 0.8));

  const discoveryMatches = scored
    .filter((m: MatchResult) => m.isDiscoveryMatch)
    .sort((a: MatchResult, b: MatchResult) => b.discoveryScore - a.discoveryScore)
    .slice(0, Math.floor(limit * 0.2));

  // 5. Interleave results (discovery items at positions 3, 7, etc.)
  const recommendations = interleaveResults(preferenceMatches, discoveryMatches);

  // 6. Store recommendation history
  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    await supabase.from('recommendation_history').insert({
      user_id: userId,
      property_id: rec.propertyId,
      overall_score: rec.overallScore,
      preference_score: rec.preferenceScore,
      discovery_score: rec.discoveryScore,
      match_reasons: rec.matchReasons,
      discovery_reasons: rec.discoveryReasons,
      recommendation_context: 'homepage',
      position_shown: i + 1
    });
  }

  // 7. Fetch full property data for response
  const propertyIds = recommendations.map((r: MatchResult) => r.propertyId);
  const { data: fullProperties } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds);

  const enrichedResults = recommendations.map((rec: MatchResult) => ({
    ...rec,
    property: fullProperties?.find((p: any) => p.id === rec.propertyId)
  }));

  return new Response(
    JSON.stringify({ 
      recommendations: enrichedResults,
      userProfile: profile,
      meta: {
        totalCandidates: properties.length,
        preferenceMatches: preferenceMatches.length,
        discoveryMatches: discoveryMatches.length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function buildUserProfile(supabase: any, userId: string): Promise<UserProfile> {
  // Get explicit preferences
  const { data: explicitPrefs } = await supabase
    .from('user_preference_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get behavior signals from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: signals } = await supabase
    .from('user_behavior_signals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  // Get learned preferences
  const { data: learnedPrefs } = await supabase
    .from('learned_preferences')
    .select('*')
    .eq('user_id', userId);

  // Analyze implicit behavior
  const implicit = analyzeImplicitBehavior(signals || []);
  
  // Merge learned preferences
  const mergedLearned = mergeLearned(learnedPrefs || []);

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
  };
}

function analyzeImplicitBehavior(signals: any[]) {
  const pricesSeen: number[] = [];
  const dwellTimeByType: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};

  for (const signal of signals) {
    const snapshot = signal.property_snapshot || {};
    
    // Track prices
    if (snapshot.price) {
      pricesSeen.push(snapshot.price);
    }

    // Track dwell time by property type
    if (snapshot.property_type && signal.time_spent_seconds) {
      dwellTimeByType[snapshot.property_type] = 
        (dwellTimeByType[snapshot.property_type] || 0) + signal.time_spent_seconds;
    }

    // Track locations
    if (snapshot.location) {
      locationCounts[snapshot.location] = (locationCounts[snapshot.location] || 0) + 1;
    }

    // Track time patterns
    const hour = new Date(signal.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
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
      featureAffinities[pref.pattern_key] = pref.pattern_value.score * pref.confidence_score;
    }
    if (pref.pattern_type === 'style_preference' && pref.confidence_score > 0.6) {
      stylePreferences.push(pref.pattern_key);
    }
  }

  return { featureAffinities, stylePreferences };
}

function scoreProperty(property: any, profile: UserProfile): MatchResult {
  const matchReasons: MatchReason[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Location match
  const locationScore = scoreLocation(property, profile);
  matchReasons.push(locationScore);
  totalScore += locationScore.score * locationScore.weight;
  totalWeight += locationScore.weight;

  // 2. Price match
  const priceScore = scorePrice(property, profile);
  matchReasons.push(priceScore);
  totalScore += priceScore.score * priceScore.weight;
  totalWeight += priceScore.weight;

  // 3. Size/bedrooms match
  const sizeScore = scoreSize(property, profile);
  matchReasons.push(sizeScore);
  totalScore += sizeScore.score * sizeScore.weight;
  totalWeight += sizeScore.weight;

  // 4. Property type match
  const typeScore = scoreType(property, profile);
  matchReasons.push(typeScore);
  totalScore += typeScore.score * typeScore.weight;
  totalWeight += typeScore.weight;

  // 5. Features match
  const featuresScore = scoreFeatures(property, profile);
  matchReasons.push(featuresScore);
  totalScore += featuresScore.score * featuresScore.weight;
  totalWeight += featuresScore.weight;

  const preferenceScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;

  // Calculate discovery score
  const { discoveryScore, discoveryReasons } = calculateDiscoveryScore(property, profile);
  
  // Determine if this is a discovery match
  const isDiscoveryMatch = preferenceScore < 60 && discoveryScore > 50;

  // Overall score: 80% preference, 20% discovery potential
  const overallScore = isDiscoveryMatch 
    ? discoveryScore 
    : (preferenceScore * 0.8) + (discoveryScore * 0.2);

  return {
    propertyId: property.id,
    overallScore,
    preferenceScore,
    discoveryScore,
    matchReasons,
    discoveryReasons,
    isDiscoveryMatch,
  };
}

function scoreLocation(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.location;
  const location = property.location?.toLowerCase() || '';
  
  // Check explicit preferences
  const explicitMatch = profile.explicit.preferredLocations.some(
    loc => location.includes(loc.toLowerCase())
  );
  
  // Check implicit patterns
  const implicitMatch = profile.implicit.locationClusters.some(
    loc => location.includes(loc.toLowerCase())
  );

  let score = 0;
  let explanation = '';

  if (explicitMatch) {
    score = 1;
    explanation = `Located in your preferred area: ${property.location}`;
  } else if (implicitMatch) {
    score = 0.8;
    explanation = `Similar to areas you've browsed: ${property.location}`;
  } else {
    score = 0.3;
    explanation = `New area to explore: ${property.location}`;
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

  if (price >= explicitMin && price <= explicitMax) {
    score = 1;
    explanation = `Within your budget ($${price.toLocaleString()})`;
  } else if (price >= implicitMin && price <= implicitMax) {
    score = 0.7;
    explanation = `Similar to properties you've viewed ($${price.toLocaleString()})`;
  } else if (price < explicitMin * 0.8) {
    score = 0.5;
    explanation = `Below budget - potential value ($${price.toLocaleString()})`;
  } else if (price > explicitMax * 1.2) {
    score = 0.2;
    explanation = `Above budget ($${price.toLocaleString()})`;
  } else {
    score = 0.4;
    explanation = `Slightly outside range ($${price.toLocaleString()})`;
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

  if (bedrooms >= minBed && bedrooms <= maxBed) {
    score = 1;
    explanation = `${bedrooms} bedrooms matches your needs`;
  } else if (bedrooms === minBed - 1 || bedrooms === maxBed + 1) {
    score = 0.6;
    explanation = `${bedrooms} bedrooms - close to your preference`;
  } else {
    score = 0.3;
    explanation = `${bedrooms} bedrooms available`;
  }

  return { factor: 'Size', score, explanation, weight };
}

function scoreType(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.type;
  const propertyType = property.property_type?.toLowerCase() || '';
  
  // Check explicit preference
  const explicitMatch = profile.explicit.preferredPropertyTypes.some(
    t => propertyType.includes(t.toLowerCase())
  );
  
  // Check implicit - time spent on type
  const dwellTime = profile.implicit.dwellTimeByType[propertyType] || 0;
  const avgDwell = Object.values(profile.implicit.dwellTimeByType).reduce((a, b) => a + b, 0) / 
    Math.max(Object.keys(profile.implicit.dwellTimeByType).length, 1);

  let score = 0;
  let explanation = '';

  if (explicitMatch) {
    score = 1;
    explanation = `${property.property_type} - your preferred type`;
  } else if (dwellTime > avgDwell) {
    score = 0.8;
    explanation = `${property.property_type} - you've shown interest in this type`;
  } else {
    score = 0.4;
    explanation = `${property.property_type}`;
  }

  return { factor: 'Property Type', score, explanation, weight };
}

function scoreFeatures(property: any, profile: UserProfile): MatchReason {
  const weight = profile.weights.features;
  const features = property.features || [];
  
  // Check must-have features
  const mustHaves = profile.explicit.mustHaveFeatures;
  const hasAllMustHaves = mustHaves.every(f => 
    features.some((pf: string) => pf.toLowerCase().includes(f.toLowerCase()))
  );
  
  // Check deal-breakers
  const dealBreakers = profile.explicit.dealBreakers;
  const hasDealBreaker = dealBreakers.some(d =>
    features.some((pf: string) => pf.toLowerCase().includes(d.toLowerCase()))
  );

  // Check feature affinities
  const affinityScore = Object.entries(profile.implicit.featureAffinities)
    .reduce((sum, [feature, affinity]) => {
      if (features.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()))) {
        return sum + affinity;
      }
      return sum;
    }, 0);

  let score = 0;
  let explanation = '';

  if (hasDealBreaker) {
    score = 0;
    explanation = 'Contains features you want to avoid';
  } else if (hasAllMustHaves && mustHaves.length > 0) {
    score = 1;
    explanation = `Has all your must-have features`;
  } else if (affinityScore > 0.5) {
    score = 0.8;
    explanation = `Features you've shown interest in`;
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

  // 1. Trending in market
  reasons.push({
    factor: 'Market Trend',
    score: 0.7,
    explanation: 'Popular area with growing demand',
    weight: 0.3
  });
  score += 0.7 * 0.3;

  // 2. Unusual value proposition
  if (property.price && property.bedrooms) {
    const pricePerBed = property.price / property.bedrooms;
    if (pricePerBed < 100000) {
      reasons.push({
        factor: 'Value Discovery',
        score: 0.9,
        explanation: 'Exceptional value for the size',
        weight: 0.3
      });
      score += 0.9 * 0.3;
    }
  }

  // 3. New listing
  const createdAt = new Date(property.created_at);
  const daysSinceListing = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceListing < 7) {
    reasons.push({
      factor: 'New Listing',
      score: 0.8,
      explanation: 'Just listed - be among the first to see it',
      weight: 0.2
    });
    score += 0.8 * 0.2;
  }

  // 4. Style expansion
  const isNewStyle = !profile.implicit.stylePreferences.includes(property.property_type);
  if (isNewStyle && profile.discoveryOpenness > 0.3) {
    reasons.push({
      factor: 'Style Discovery',
      score: 0.6,
      explanation: 'A different style you might like',
      weight: 0.2
    });
    score += 0.6 * 0.2;
  }

  const discoveryScore = (score / 1) * 100; // Normalize to 0-100

  return { discoveryScore, discoveryReasons: reasons };
}

function interleaveResults(preference: MatchResult[], discovery: MatchResult[]): MatchResult[] {
  const result: MatchResult[] = [];
  let prefIdx = 0;
  let discIdx = 0;

  for (let i = 0; i < preference.length + discovery.length; i++) {
    // Insert discovery at positions 3, 7, 11, etc.
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
  
  // Get recent activity summary
  const { data: recentActivity } = await supabase
    .from('user_behavior_signals')
    .select('signal_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const activitySummary = {
    totalViews: recentActivity?.filter((a: any) => a.signal_type === 'view').length || 0,
    totalSaves: recentActivity?.filter((a: any) => a.signal_type === 'save').length || 0,
    totalInquiries: recentActivity?.filter((a: any) => a.signal_type === 'inquiry').length || 0,
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
    .select('id, title, price, location, property_type, bedrooms, features')
    .eq('id', propertyId)
    .single();

  // Record the signal
  await supabase.from('user_behavior_signals').insert({
    user_id: userId,
    property_id: propertyId,
    signal_type: signalType,
    signal_strength: calculateSignalStrength(signalType, signalData),
    time_spent_seconds: signalData.timeSpent,
    scroll_depth: signalData.scrollDepth,
    photos_viewed: signalData.photosViewed,
    sections_expanded: signalData.sectionsExpanded,
    property_snapshot: property,
    session_id: signalData.sessionId,
    device_type: signalData.deviceType,
  });

  // Update learned preferences based on signal
  await updateLearnedPreferences(supabase, userId, property, signalType, signalData);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateSignalStrength(signalType: string, data: any): number {
  const baseStrengths: Record<string, number> = {
    view: 0.3,
    dwell: 0.5,
    save: 0.8,
    share: 0.7,
    inquiry: 1.0,
    revisit: 0.6,
    compare: 0.4,
  };

  let strength = baseStrengths[signalType] || 0.3;

  // Boost based on engagement
  if (data.timeSpent > 120) strength *= 1.3;
  if (data.scrollDepth > 80) strength *= 1.2;
  if (data.photosViewed > 5) strength *= 1.1;

  return Math.min(strength, 1.0);
}

async function updateLearnedPreferences(
  supabase: any, 
  userId: string, 
  property: any, 
  signalType: string,
  signalData: any
) {
  if (!property) return;

  // Update feature affinity
  if (property.features && signalType !== 'view') {
    for (const feature of property.features) {
      await supabase.from('learned_preferences').upsert({
        user_id: userId,
        pattern_type: 'feature_affinity',
        pattern_key: feature.toLowerCase(),
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

  if (!property) {
    throw new Error('Property not found');
  }

  const matchResult = scoreProperty(property, profile);

  // Get AI explanation
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
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are a real estate advisor. Explain why a property matches (or doesn\'t match) a user\'s preferences in a friendly, concise way. Be specific and helpful.'
            },
            { 
              role: 'user', 
              content: `Property: ${JSON.stringify(property)}
User preferences: ${JSON.stringify(profile.explicit)}
Match reasons: ${JSON.stringify(matchResult.matchReasons)}
Overall score: ${matchResult.overallScore}%

Provide a 2-3 sentence explanation of why this property is a ${matchResult.overallScore > 70 ? 'good' : matchResult.overallScore > 50 ? 'moderate' : 'weak'} match.`
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
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
    JSON.stringify({
      property,
      matchResult,
      userProfile: profile,
      aiExplanation,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function provideFeedback(supabase: any, recommendationId: string, feedback: string) {
  await supabase
    .from('recommendation_history')
    .update({ 
      user_feedback: feedback,
      feedback_at: new Date().toISOString(),
    })
    .eq('id', recommendationId);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
