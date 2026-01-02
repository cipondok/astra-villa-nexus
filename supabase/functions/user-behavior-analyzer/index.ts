import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication required - this endpoint exposes sensitive user behavior data
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        message: 'Please sign in to access behavior analysis.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication',
        message: 'Your session has expired. Please sign in again.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authenticatedUserId = user.id;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, sessionId, options = {}, requestType = 'analysis' } = await req.json();

    // Security: Users can only access their own data (unless admin)
    const requestedUserId = userId || authenticatedUserId;
    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      // Check if user is admin
      const { data: adminCheck } = await supabaseClient.rpc('check_admin_access');
      if (!adminCheck) {
        console.warn(`Unauthorized access attempt: ${authenticatedUserId} tried to access ${requestedUserId}'s behavior data`);
        return new Response(JSON.stringify({ 
          error: 'Unauthorized',
          message: 'You can only access your own behavior analysis.'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Behavior analysis request:', { userId: requestedUserId, sessionId, requestedBy: authenticatedUserId });
    
    if (requestType === 'insights') {
      const insights = await generatePersonalizedInsights(supabaseClient, requestedUserId, sessionId);
      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Main behavior analysis
    const metrics = await analyzeBehaviorPatterns(supabaseClient, requestedUserId, sessionId, options);
    
    return new Response(JSON.stringify({ metrics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Behavior analysis error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeBehaviorPatterns(supabase: any, userId?: string, sessionId?: string, options: any = {}) {
  const timeRange = getTimeRangeFilter(options.timeRange || 'month');
  
  // Get user interactions
  let query = supabase
    .from('user_interactions')
    .select('*')
    .gte('created_at', timeRange);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data: interactions, error } = await query.order('created_at', { ascending: false });
  
  if (error || !interactions?.length) {
    return getDefaultMetrics();
  }

  // Analyze patterns
  const viewingPatterns = analyzeViewingPatterns(interactions);
  const searchPatterns = analyzeSearchPatterns(interactions);
  const engagementScore = calculateEngagementScore(interactions);
  const intentScore = calculateIntentScore(interactions);
  const recommendationFactors = generateRecommendationFactors(interactions);

  return {
    viewingPatterns,
    searchPatterns,
    engagementScore,
    intentScore,
    recommendationFactors,
    totalInteractions: interactions.length,
    analysisDate: new Date().toISOString()
  };
}

function analyzeViewingPatterns(interactions: any[]) {
  const propertyViews = interactions.filter(i => i.interaction_type === 'view' && i.property_id);
  
  // Calculate average time on property
  const viewDurations = propertyViews
    .map(v => v.interaction_data?.view_duration || 0)
    .filter(d => d > 0);
  
  const avgTimeOnProperty = viewDurations.length > 0 
    ? viewDurations.reduce((sum, d) => sum + d, 0) / viewDurations.length 
    : 0;

  // Get property preferences from views and searches
  const propertyTypes = extractPropertyTypes(interactions);
  const priceRanges = extractPriceRanges(interactions);
  const locations = extractLocations(interactions);

  return {
    avgTimeOnProperty: Math.round(avgTimeOnProperty / 1000), // Convert to seconds
    preferredPropertyTypes: getTopItems(propertyTypes, 3),
    priceRangeInterest: calculatePriceRange(priceRanges),
    locationPreferences: getTopItems(locations, 5)
  };
}

function analyzeSearchPatterns(interactions: any[]) {
  const searches = interactions.filter(i => i.interaction_type === 'search');
  
  const queries = searches.map(s => s.interaction_data?.search_query).filter(Boolean);
  const filters = searches.map(s => s.interaction_data?.filters_applied).filter(Boolean);
  
  // Analyze filter usage
  const filterUsage: Record<string, number> = {};
  filters.forEach(filterSet => {
    Object.keys(filterSet || {}).forEach(key => {
      filterUsage[key] = (filterUsage[key] || 0) + 1;
    });
  });

  // Analyze search timing
  const searchTiming = searches.map(s => {
    const hour = new Date(s.created_at).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  });

  return {
    frequentQueries: getTopItems(queries, 5),
    filterUsage,
    searchTiming: getTopItems(searchTiming, 4)
  };
}

function calculateEngagementScore(interactions: any[]): number {
  if (!interactions.length) return 0;

  let score = 0;
  let maxScore = 0;

  // View duration scoring (40% weight)
  const avgViewDuration = getAverageViewDuration(interactions);
  score += Math.min(avgViewDuration / 120000, 1) * 40; // Max score at 2 minutes
  maxScore += 40;

  // Interaction diversity (30% weight)
  const uniqueTypes = new Set(interactions.map(i => i.interaction_type)).size;
  score += Math.min(uniqueTypes / 6, 1) * 30; // Max score at 6 different types
  maxScore += 30;

  // Frequency scoring (20% weight)
  const daysWithActivity = getDaysWithActivity(interactions);
  score += Math.min(daysWithActivity / 7, 1) * 20; // Max score at daily activity for a week
  maxScore += 20;

  // Depth of interaction (10% weight)
  const deepInteractions = interactions.filter(i => 
    ['save', 'contact', 'visit_3d'].includes(i.interaction_type)
  ).length;
  score += Math.min(deepInteractions / 10, 1) * 10; // Max score at 10 deep interactions
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}

function calculateIntentScore(interactions: any[]): number {
  if (!interactions.length) return 0;

  let intentScore = 0;

  // High-intent signals
  const contactActions = interactions.filter(i => i.interaction_type === 'contact').length;
  const saveActions = interactions.filter(i => i.interaction_type === 'save').length;
  const longViews = interactions.filter(i => 
    i.interaction_type === 'view' && (i.interaction_data?.view_duration || 0) > 120000
  ).length;
  const repeat3DViews = interactions.filter(i => i.interaction_type === 'visit_3d').length;

  // Scoring algorithm
  intentScore += contactActions * 25;      // Very high intent
  intentScore += saveActions * 15;         // High intent
  intentScore += longViews * 10;           // Medium intent
  intentScore += repeat3DViews * 20;       // High intent

  return Math.min(intentScore, 100); // Cap at 100
}

function generateRecommendationFactors(interactions: any[]) {
  const factors: Record<string, number> = {};
  
  // Property type preferences
  const propertyTypes = extractPropertyTypes(interactions);
  Object.entries(propertyTypes).forEach(([type, count]) => {
    factors[`prefers_${type}`] = count / interactions.length;
  });

  // Location preferences
  const locations = extractLocations(interactions);
  Object.entries(locations).forEach(([location, count]) => {
    factors[`location_${location.toLowerCase().replace(/\s+/g, '_')}`] = count / interactions.length;
  });

  // Engagement patterns
  factors['high_engagement'] = getAverageViewDuration(interactions) > 90000 ? 1 : 0;
  factors['saves_properties'] = interactions.some(i => i.interaction_type === 'save') ? 1 : 0;
  factors['uses_3d'] = interactions.some(i => i.interaction_type === 'visit_3d') ? 1 : 0;

  return factors;
}

async function generatePersonalizedInsights(supabase: any, userId?: string, sessionId?: string) {
  const insights = [];
  
  // Get recent behavior data
  let query = supabase
    .from('user_interactions')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data: interactions } = await query;
  
  if (!interactions?.length) {
    return [
      {
        type: 'welcome',
        title: 'Welcome to our property platform!',
        message: 'Start exploring properties to get personalized recommendations.',
        priority: 'medium'
      }
    ];
  }

  // Generate insights based on behavior patterns
  const propertyViews = interactions.filter(i => i.interaction_type === 'view' && i.property_id);
  const searches = interactions.filter(i => i.interaction_type === 'search');
  
  if (propertyViews.length > 5) {
    const avgTime = getAverageViewDuration(propertyViews) / 1000;
    if (avgTime > 120) {
      insights.push({
        type: 'engagement',
        title: 'High Engagement Detected',
        message: `You spend an average of ${Math.round(avgTime)} seconds viewing properties. You might be ready to make a decision!`,
        priority: 'high'
      });
    }
  }

  if (searches.length > 3) {
    const commonFilters = analyzeSearchPatterns(interactions).filterUsage;
    const topFilter = Object.entries(commonFilters)[0];
    if (topFilter) {
      insights.push({
        type: 'search_pattern',
        title: 'Search Pattern Identified',
        message: `You frequently filter by ${topFilter[0]}. We'll prioritize these in your recommendations.`,
        priority: 'medium'
      });
    }
  }

  return insights;
}

// Helper functions
function getTimeRangeFilter(range: string): string {
  const now = new Date();
  switch (range) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(0).toISOString(); // All time
  }
}

function extractPropertyTypes(interactions: any[]): Record<string, number> {
  const types: Record<string, number> = {};
  interactions.forEach(i => {
    const type = i.interaction_data?.property_type || i.interaction_data?.filters_applied?.propertyType;
    if (type) {
      types[type] = (types[type] || 0) + 1;
    }
  });
  return types;
}

function extractPriceRanges(interactions: any[]): number[] {
  const prices: number[] = [];
  interactions.forEach(i => {
    const priceRange = i.interaction_data?.filters_applied?.priceRange;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map((p: string) => parseFloat(p));
      if (!isNaN(min)) prices.push(min);
      if (!isNaN(max)) prices.push(max);
    }
  });
  return prices;
}

function extractLocations(interactions: any[]): Record<string, number> {
  const locations: Record<string, number> = {};
  interactions.forEach(i => {
    const location = i.interaction_data?.filters_applied?.location || i.interaction_data?.filters_applied?.city;
    if (location) {
      locations[location] = (locations[location] || 0) + 1;
    }
  });
  return locations;
}

function getTopItems(items: any[], limit: number): any[] {
  if (Array.isArray(items[0])) {
    // Handle array of strings
    const counts: Record<string, number> = {};
    items.forEach(item => {
      if (item) counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  } else {
    // Handle object with counts
    return Object.entries(items)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([item]) => item);
  }
}

function calculatePriceRange(prices: number[]): { min: number; max: number } {
  if (!prices.length) return { min: 0, max: 0 };
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

function getAverageViewDuration(interactions: any[]): number {
  const durations = interactions
    .filter(i => i.interaction_type === 'view')
    .map(i => i.interaction_data?.view_duration || 0)
    .filter(d => d > 0);
  
  return durations.length > 0 
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
    : 0;
}

function getDaysWithActivity(interactions: any[]): number {
  const uniqueDays = new Set(
    interactions.map(i => new Date(i.created_at).toDateString())
  );
  return uniqueDays.size;
}

function getDefaultMetrics() {
  return {
    viewingPatterns: {
      avgTimeOnProperty: 0,
      preferredPropertyTypes: [],
      priceRangeInterest: { min: 0, max: 0 },
      locationPreferences: []
    },
    searchPatterns: {
      frequentQueries: [],
      filterUsage: {},
      searchTiming: []
    },
    engagementScore: 0,
    intentScore: 0,
    recommendationFactors: {},
    totalInteractions: 0
  };
}