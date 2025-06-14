import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, type = 'properties', limit = 5 } = await req.json();

    console.log('Smart recommendations request:', { userId, type, limit });

    // Get user behavior and preferences
    const userProfile = await getUserProfile(supabase, userId);
    const recommendations = await generateRecommendations(supabase, userProfile, type, limit);

    return new Response(JSON.stringify({
      recommendations,
      userProfile: userProfile.preferences
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserProfile(supabase: any, userId: string) {
  if (!userId) {
    return { preferences: {}, interactions: [] };
  }

  // Get user interactions
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return {
    profile,
    interactions: interactions || [],
    preferences: extractUserPreferences(interactions || [])
  };
}

async function generateRecommendations(supabase: any, userProfile: any, type: string, limit: number) {
  if (type === 'properties') {
    return await generatePropertyRecommendations(supabase, userProfile, limit);
  } else if (type === 'vendors') {
    return await generateVendorRecommendations(supabase, userProfile, limit);
  }
  
  return [];
}

async function generatePropertyRecommendations(supabase: any, userProfile: any, limit: number) {
  const preferences = userProfile.preferences;
  
  // Start with base query
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'approved');

  // Apply preference-based filtering
  if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
    query = query.in('property_type', preferences.propertyTypes);
  }

  if (preferences.locations && preferences.locations.length > 0) {
    query = query.in('city', preferences.locations);
  }

  if (preferences.priceRange) {
    query = query.gte('price', preferences.priceRange.min);
    if (preferences.priceRange.max) {
      query = query.lte('price', preferences.priceRange.max);
    }
  }

  const { data: properties } = await query.limit(limit * 2); // Get more to rank

  if (!properties || properties.length === 0) {
    // Fallback to popular properties
    const { data: fallback } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return fallback || [];
  }

  // Score and rank properties
  const scoredProperties = properties.map(property => ({
    ...property,
    score: calculatePropertyScore(property, userProfile)
  }));

  // Sort by score and return top results
  return scoredProperties
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function generateVendorRecommendations(supabase: any, userProfile: any, limit: number) {
  const { data: vendors } = await supabase
    .from('vendor_services')
    .select('*, vendor_business_profiles(*)')
    .limit(limit);

  return vendors || [];
}

function extractUserPreferences(interactions: any[]) {
  const preferences: any = {
    propertyTypes: [],
    locations: [],
    priceRange: null,
    features: [],
    viewHistory: []
  };

  const propertyTypeCount: any = {};
  const locationCount: any = {};
  const prices: number[] = [];

  interactions.forEach(interaction => {
    const data = interaction.interaction_data;
    
    if (data.propertyType) {
      propertyTypeCount[data.propertyType] = (propertyTypeCount[data.propertyType] || 0) + 1;
    }
    
    if (data.location) {
      locationCount[data.location] = (locationCount[data.location] || 0) + 1;
    }
    
    if (data.price && !isNaN(data.price)) {
      prices.push(data.price);
    }

    if (data.propertyId) {
      preferences.viewHistory.push(data.propertyId);
    }
  });

  // Extract most common property types
  preferences.propertyTypes = Object.entries(propertyTypeCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([type]) => type);

  // Extract most common locations
  preferences.locations = Object.entries(locationCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([location]) => location);

  // Calculate price range
  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    preferences.priceRange = { min: q1, max: q3 };
  }

  return preferences;
}

function calculatePropertyScore(property: any, userProfile: any) {
  let score = 0;
  const preferences = userProfile.preferences;

  // Property type match
  if (preferences.propertyTypes.includes(property.property_type)) {
    score += 30;
  }

  // Location match
  if (preferences.locations.includes(property.city)) {
    score += 25;
  }

  // Price range match
  if (preferences.priceRange && property.price) {
    if (property.price >= preferences.priceRange.min && 
        property.price <= preferences.priceRange.max) {
      score += 20;
    }
  }

  // Recency bonus
  const daysSinceCreated = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 30) {
    score += 10;
  }

  // Avoid already viewed properties
  if (preferences.viewHistory.includes(property.id)) {
    score -= 15;
  }

  return score;
}
