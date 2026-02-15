import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
  weight: number;
}

interface PropertyMatch {
  propertyId: string;
  overallScore: number;
  preferenceScore: number;
  discoveryScore: number;
  matchReasons: MatchReason[];
  discoveryReasons?: MatchReason[];
  isDiscoveryMatch: boolean;
  property: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const _authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await _authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, propertyId, limit = 10 } = await req.json();

    switch (action) {
      case 'get_ai_recommendations':
        return await getAIRecommendations(supabase, userId, limit, LOVABLE_API_KEY);
      
      case 'explain_match':
        return await explainMatch(supabase, userId, propertyId, LOVABLE_API_KEY);
      
      case 'get_discovery_insights':
        return await getDiscoveryInsights(supabase, userId, LOVABLE_API_KEY);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('AI Recommendations error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getAIRecommendations(supabase: any, userId: string, limit: number, apiKey: string) {
  // 1. Get user's preference profile
  const { data: userProfile } = await supabase
    .from('user_preference_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // 2. Get user's recent behavior
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentViews } = await supabase
    .from('user_behavior_signals')
    .select('property_snapshot, signal_type, time_spent_seconds')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(50);

  // 3. Get saved/favorited properties
  const { data: favorites } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId)
    .limit(20);

  const favoriteIds = (favorites || []).map((f: any) => f.property_id);

  // 4. Build user context for AI
  const userContext = buildUserContext(userProfile, recentViews, favoriteIds);

  // 5. Get candidate properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, description, price, bedrooms, bathrooms, area_sqm, property_type, listing_type, city, state, location, features, amenities, images, thumbnail_url, views_count')
    .eq('status', 'active')
    .eq('approval_status', 'approved')
    .limit(100);

  // 6. Score properties
  const scoredProperties = (properties || []).map((property: any) => ({
    ...property,
    ...scorePropertyForUser(property, userContext)
  }));

  // 7. Apply 80/20 rule
  const preferenceMatches = scoredProperties
    .filter((p: any) => !p.isDiscoveryMatch)
    .sort((a: any, b: any) => b.overallScore - a.overallScore)
    .slice(0, Math.ceil(limit * 0.8));

  const discoveryMatches = scoredProperties
    .filter((p: any) => p.isDiscoveryMatch)
    .sort((a: any, b: any) => b.discoveryScore - a.discoveryScore)
    .slice(0, Math.floor(limit * 0.2));

  // 8. Interleave results
  const recommendations = interleaveResults(preferenceMatches, discoveryMatches);

  // 9. Generate AI explanations for top results
  const topRecommendations = recommendations.slice(0, 5);
  const explanations = await generateBatchExplanations(topRecommendations, userContext, apiKey);

  // 10. Merge explanations
  const enrichedRecommendations = recommendations.map((rec: any, idx: number) => ({
    ...rec,
    aiExplanation: explanations[rec.id] || null,
    matchPercentage: Math.round(rec.overallScore),
    isDiscovery: rec.isDiscoveryMatch
  }));

  return new Response(
    JSON.stringify({
      success: true,
      recommendations: enrichedRecommendations,
      userInsights: {
        preferredLocations: userContext.preferredLocations,
        budgetRange: userContext.budgetRange,
        topPropertyTypes: userContext.preferredTypes
      },
      meta: {
        totalCandidates: properties?.length || 0,
        preferenceMatches: preferenceMatches.length,
        discoveryMatches: discoveryMatches.length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function explainMatch(supabase: any, userId: string, propertyId: string, apiKey: string) {
  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (!property) {
    throw new Error('Property not found');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_preference_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Get user's recent behavior
  const { data: recentViews } = await supabase
    .from('user_behavior_signals')
    .select('property_snapshot, signal_type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  const userContext = buildUserContext(userProfile, recentViews, []);
  const scoring = scorePropertyForUser(property, userContext);

  // Generate detailed AI explanation
  const explanation = await generateDetailedExplanation(property, userContext, scoring, apiKey);

  return new Response(
    JSON.stringify({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location
      },
      matchScore: Math.round(scoring.overallScore),
      isDiscoveryMatch: scoring.isDiscoveryMatch,
      explanation,
      matchBreakdown: scoring.matchReasons
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getDiscoveryInsights(supabase: any, userId: string, apiKey: string) {
  // Get user's behavior patterns
  const { data: signals } = await supabase
    .from('user_behavior_signals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  // Analyze patterns
  const patterns = analyzePatterns(signals || []);

  // Generate AI insights
  const prompt = `Analyze this property search behavior and provide 3 personalized insights:

User Behavior:
- Most viewed property types: ${patterns.topTypes.join(', ')}
- Price range viewed: Rp ${patterns.priceRange.min.toLocaleString()} - Rp ${patterns.priceRange.max.toLocaleString()}
- Most explored locations: ${patterns.topLocations.join(', ')}
- Average time spent per listing: ${patterns.avgDwellTime}s
- Total properties viewed: ${patterns.totalViews}

Provide insights as JSON: { "insights": [{ "title": "...", "description": "...", "suggestion": "..." }] }`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'You are a real estate advisor. Provide actionable insights based on user behavior. Respond in JSON format only.' },
        { role: 'user', content: prompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'provide_insights',
          description: 'Provide personalized property search insights',
          parameters: {
            type: 'object',
            properties: {
              insights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    suggestion: { type: 'string' }
                  },
                  required: ['title', 'description', 'suggestion']
                }
              }
            },
            required: ['insights']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'provide_insights' } }
    }),
  });

  let insights = [];
  if (response.ok) {
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        insights = JSON.parse(toolCall.function.arguments).insights;
      } catch (e) {
        console.error('Failed to parse insights:', e);
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      patterns,
      insights
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function buildUserContext(profile: any, recentViews: any[], favoriteIds: string[]) {
  const preferredLocations = profile?.preferred_locations || [];
  const preferredTypes = profile?.preferred_property_types || [];
  const budgetRange = {
    min: profile?.min_budget || 0,
    max: profile?.max_budget || Infinity
  };
  const minBedrooms = profile?.min_bedrooms;
  const mustHaveFeatures = profile?.must_have_features || [];

  // Analyze recent views for implicit preferences
  const viewedLocations: Record<string, number> = {};
  const viewedTypes: Record<string, number> = {};
  const viewedPrices: number[] = [];

  (recentViews || []).forEach((view: any) => {
    const snapshot = view.property_snapshot || {};
    if (snapshot.location) {
      viewedLocations[snapshot.location] = (viewedLocations[snapshot.location] || 0) + 1;
    }
    if (snapshot.property_type) {
      viewedTypes[snapshot.property_type] = (viewedTypes[snapshot.property_type] || 0) + 1;
    }
    if (snapshot.price) {
      viewedPrices.push(snapshot.price);
    }
  });

  // Top implicit locations
  const implicitLocations = Object.entries(viewedLocations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([loc]) => loc);

  // Top implicit types
  const implicitTypes = Object.entries(viewedTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  // Viewed price range
  const sortedPrices = viewedPrices.sort((a, b) => a - b);
  const implicitBudget = {
    min: sortedPrices[Math.floor(sortedPrices.length * 0.1)] || 0,
    max: sortedPrices[Math.floor(sortedPrices.length * 0.9)] || Infinity
  };

  return {
    preferredLocations: [...new Set([...preferredLocations, ...implicitLocations])],
    preferredTypes: [...new Set([...preferredTypes, ...implicitTypes])],
    budgetRange: budgetRange.max < Infinity ? budgetRange : implicitBudget,
    minBedrooms,
    mustHaveFeatures,
    favoriteIds
  };
}

function scorePropertyForUser(property: any, userContext: any) {
  let preferenceScore = 0;
  let maxScore = 0;
  const matchReasons: MatchReason[] = [];

  // Location score (25%)
  const locationWeight = 0.25;
  maxScore += locationWeight;
  const locationMatch = userContext.preferredLocations.some((loc: string) =>
    (property.city || '').toLowerCase().includes(loc.toLowerCase()) ||
    (property.location || '').toLowerCase().includes(loc.toLowerCase())
  );
  if (locationMatch) {
    preferenceScore += locationWeight;
    matchReasons.push({
      factor: 'Location',
      score: 1,
      explanation: `Located in ${property.city || property.location} - one of your preferred areas`,
      weight: locationWeight
    });
  } else {
    matchReasons.push({
      factor: 'Location',
      score: 0.3,
      explanation: `${property.city || property.location} - explore a new area`,
      weight: locationWeight
    });
    preferenceScore += locationWeight * 0.3;
  }

  // Price score (25%)
  const priceWeight = 0.25;
  maxScore += priceWeight;
  const price = property.price || 0;
  const inBudget = price >= userContext.budgetRange.min && price <= userContext.budgetRange.max;
  if (inBudget) {
    preferenceScore += priceWeight;
    matchReasons.push({
      factor: 'Price',
      score: 1,
      explanation: `Rp ${price.toLocaleString()} fits your budget`,
      weight: priceWeight
    });
  } else if (price < userContext.budgetRange.min * 0.8) {
    preferenceScore += priceWeight * 0.6;
    matchReasons.push({
      factor: 'Price',
      score: 0.6,
      explanation: `Great value at Rp ${price.toLocaleString()}`,
      weight: priceWeight
    });
  } else {
    preferenceScore += priceWeight * 0.2;
    matchReasons.push({
      factor: 'Price',
      score: 0.2,
      explanation: `Rp ${price.toLocaleString()} - above typical range`,
      weight: priceWeight
    });
  }

  // Property type score (20%)
  const typeWeight = 0.2;
  maxScore += typeWeight;
  const typeMatch = userContext.preferredTypes.some((t: string) =>
    (property.property_type || '').toLowerCase().includes(t.toLowerCase())
  );
  if (typeMatch) {
    preferenceScore += typeWeight;
    matchReasons.push({
      factor: 'Property Type',
      score: 1,
      explanation: `${property.property_type} - matches your preference`,
      weight: typeWeight
    });
  } else {
    preferenceScore += typeWeight * 0.4;
    matchReasons.push({
      factor: 'Property Type',
      score: 0.4,
      explanation: `${property.property_type}`,
      weight: typeWeight
    });
  }

  // Bedrooms score (15%)
  const bedroomWeight = 0.15;
  maxScore += bedroomWeight;
  const bedrooms = property.bedrooms || 0;
  if (!userContext.minBedrooms || bedrooms >= userContext.minBedrooms) {
    preferenceScore += bedroomWeight;
    matchReasons.push({
      factor: 'Bedrooms',
      score: 1,
      explanation: `${bedrooms} bedrooms meets your needs`,
      weight: bedroomWeight
    });
  } else {
    preferenceScore += bedroomWeight * 0.5;
    matchReasons.push({
      factor: 'Bedrooms',
      score: 0.5,
      explanation: `${bedrooms} bedrooms available`,
      weight: bedroomWeight
    });
  }

  // Features score (15%)
  const featureWeight = 0.15;
  maxScore += featureWeight;
  const features = property.features || [];
  const hasRequiredFeatures = userContext.mustHaveFeatures.length === 0 ||
    userContext.mustHaveFeatures.every((f: string) =>
      features.some((pf: string) => pf.toLowerCase().includes(f.toLowerCase()))
    );
  if (hasRequiredFeatures && features.length > 0) {
    preferenceScore += featureWeight;
    matchReasons.push({
      factor: 'Features',
      score: 1,
      explanation: `Has key features you want`,
      weight: featureWeight
    });
  } else {
    preferenceScore += featureWeight * 0.5;
    matchReasons.push({
      factor: 'Features',
      score: 0.5,
      explanation: `${features.length} features available`,
      weight: featureWeight
    });
  }

  const normalizedScore = (preferenceScore / maxScore) * 100;
  
  // Discovery score - higher for properties that are different but interesting
  const discoveryScore = calculateDiscoveryPotential(property, userContext);
  const isDiscoveryMatch = normalizedScore < 60 && discoveryScore > 50;

  return {
    overallScore: isDiscoveryMatch ? discoveryScore : normalizedScore,
    preferenceScore: normalizedScore,
    discoveryScore,
    matchReasons,
    isDiscoveryMatch
  };
}

function calculateDiscoveryPotential(property: any, userContext: any): number {
  let score = 50; // Base discovery score

  // Boost for trending/popular properties
  if (property.views_count > 100) score += 10;
  if (property.views_count > 500) score += 10;

  // Boost for properties in new locations
  const isNewLocation = !userContext.preferredLocations.some((loc: string) =>
    (property.city || '').toLowerCase().includes(loc.toLowerCase())
  );
  if (isNewLocation) score += 15;

  // Boost for good value
  if (property.price < userContext.budgetRange.min * 0.9) score += 10;

  // Boost for premium features
  const features = property.features || [];
  const premiumFeatures = ['pool', 'garden', 'view', 'smart home', 'gym'];
  const hasPremium = premiumFeatures.some(pf =>
    features.some((f: string) => f.toLowerCase().includes(pf))
  );
  if (hasPremium) score += 10;

  return Math.min(score, 95);
}

function interleaveResults(preferenceMatches: any[], discoveryMatches: any[]): any[] {
  const result = [...preferenceMatches];
  let discoveryIdx = 0;
  
  // Insert discovery matches at positions 3, 7, etc.
  for (let i = 2; i < result.length && discoveryIdx < discoveryMatches.length; i += 4) {
    result.splice(i + 1, 0, discoveryMatches[discoveryIdx]);
    discoveryIdx++;
  }
  
  // Add remaining discovery matches at the end
  while (discoveryIdx < discoveryMatches.length) {
    result.push(discoveryMatches[discoveryIdx]);
    discoveryIdx++;
  }
  
  return result;
}

async function generateBatchExplanations(properties: any[], userContext: any, apiKey: string): Promise<Record<string, string>> {
  const explanations: Record<string, string> = {};
  
  // Generate explanations for top 5 properties
  const prompt = `Generate brief, friendly "Why this match?" explanations for these properties based on user preferences.

User Preferences:
- Budget: Rp ${userContext.budgetRange.min?.toLocaleString() || 'flexible'} - Rp ${userContext.budgetRange.max?.toLocaleString() || 'flexible'}
- Preferred locations: ${userContext.preferredLocations.join(', ') || 'Not specified'}
- Preferred types: ${userContext.preferredTypes.join(', ') || 'Any'}
- Min bedrooms: ${userContext.minBedrooms || 'Any'}

Properties:
${properties.map((p, i) => `${i + 1}. ${p.title} - Rp ${p.price?.toLocaleString()} - ${p.property_type} - ${p.city} - ${p.bedrooms} bed - Match: ${Math.round(p.overallScore)}% ${p.isDiscoveryMatch ? '(Discovery)' : ''}`).join('\n')}

For each property, provide a 1-2 sentence explanation why it's a good match or discovery opportunity.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a friendly real estate advisor. Provide brief, personalized explanations for why properties match a user\'s needs. Be conversational and highlight specific matching factors.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'explain_matches',
            description: 'Provide match explanations for properties',
            parameters: {
              type: 'object',
              properties: {
                explanations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      property_index: { type: 'number' },
                      explanation: { type: 'string' }
                    },
                    required: ['property_index', 'explanation']
                  }
                }
              },
              required: ['explanations']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'explain_matches' } }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        parsed.explanations?.forEach((exp: any) => {
          const prop = properties[exp.property_index - 1];
          if (prop) {
            explanations[prop.id] = exp.explanation;
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to generate batch explanations:', error);
  }

  return explanations;
}

async function generateDetailedExplanation(property: any, userContext: any, scoring: any, apiKey: string): Promise<string> {
  const prompt = `Generate a detailed, personalized explanation for why this property matches this user's needs.

Property:
- Title: ${property.title}
- Price: Rp ${property.price?.toLocaleString()}
- Location: ${property.city}, ${property.state}
- Type: ${property.property_type}
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Area: ${property.area_sqm} m²
- Features: ${(property.features || []).join(', ')}

User Preferences:
- Budget: Rp ${userContext.budgetRange.min?.toLocaleString()} - Rp ${userContext.budgetRange.max?.toLocaleString()}
- Preferred locations: ${userContext.preferredLocations.join(', ') || 'Not specified'}
- Preferred property types: ${userContext.preferredTypes.join(', ') || 'Any'}
- Min bedrooms: ${userContext.minBedrooms || 'Not specified'}
- Must-have features: ${userContext.mustHaveFeatures.join(', ') || 'None specified'}

Match Score: ${Math.round(scoring.overallScore)}%
${scoring.isDiscoveryMatch ? 'This is a DISCOVERY match - interesting property outside usual preferences.' : ''}

Match breakdown:
${scoring.matchReasons.map((r: MatchReason) => `- ${r.factor}: ${Math.round(r.score * 100)}% - ${r.explanation}`).join('\n')}

Provide a friendly 3-4 sentence explanation highlighting why this property is worth considering.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a knowledgeable real estate advisor. Provide personalized, conversational explanations that help users understand why a property is a good match for them. Be specific about matching factors.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'This property matches several of your preferences.';
    }
  } catch (error) {
    console.error('Failed to generate detailed explanation:', error);
  }

  return 'This property matches your search criteria and preferences.';
}

function analyzePatterns(signals: any[]) {
  const typeCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const prices: number[] = [];
  let totalDwellTime = 0;

  signals.forEach(signal => {
    const snapshot = signal.property_snapshot || {};
    if (snapshot.property_type) {
      typeCounts[snapshot.property_type] = (typeCounts[snapshot.property_type] || 0) + 1;
    }
    if (snapshot.city) {
      locationCounts[snapshot.city] = (locationCounts[snapshot.city] || 0) + 1;
    }
    if (snapshot.price) {
      prices.push(snapshot.price);
    }
    if (signal.time_spent_seconds) {
      totalDwellTime += signal.time_spent_seconds;
    }
  });

  const sortedPrices = prices.sort((a, b) => a - b);
  
  return {
    topTypes: Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type),
    topLocations: Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([loc]) => loc),
    priceRange: {
      min: sortedPrices[Math.floor(sortedPrices.length * 0.1)] || 0,
      max: sortedPrices[Math.floor(sortedPrices.length * 0.9)] || 0
    },
    avgDwellTime: signals.length > 0 ? Math.round(totalDwellTime / signals.length) : 0,
    totalViews: signals.length
  };
}
