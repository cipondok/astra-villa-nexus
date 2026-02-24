import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentFilterId, sessionId, userId } = await req.json();
    console.log('🤝 Collaborative recommendations request:', { currentFilterId, sessionId, userId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Strategy 1: If we have a userId, use interaction-based collaborative filtering
    if (userId) {
      const results = await getInteractionBasedRecommendations(supabase, userId);
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} interaction-based recommendations`);
        return jsonResponse({ recommendations: results, strategy: 'interaction' });
      }
    }

    // Strategy 2: If we have a currentFilterId, use filter-sequence-based recommendations
    if (currentFilterId) {
      const results = await getFilterSequenceRecommendations(supabase, currentFilterId, userId || sessionId);
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} filter-sequence recommendations`);
        return jsonResponse({ recommendations: results, strategy: 'filter_sequence' });
      }
    }

    // Strategy 3: Fallback to trending properties (most favorited recently)
    const results = await getTrendingRecommendations(supabase, userId);
    console.log(`✅ Found ${results.length} trending recommendations`);
    return jsonResponse({ recommendations: results, strategy: 'trending' });

  } catch (error) {
    console.error('❌ Error in collaborative recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * Strategy 1: Find users with similar interactions, surface properties they
 * viewed/favorited that the current user hasn't seen.
 */
async function getInteractionBasedRecommendations(supabase: any, userId: string) {
  // Step 1: Get the current user's viewed/favorited property IDs
  const [{ data: userInteractions }, { data: userFavorites }] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('interaction_data, interaction_type')
      .eq('user_id', userId)
      .in('interaction_type', ['property_view', 'property_click', 'property_inquiry', 'search'])
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId),
  ]);

  const userPropertyIds = new Set<string>();
  (userInteractions || []).forEach((i: any) => {
    const pid = i.interaction_data?.propertyId;
    if (pid) userPropertyIds.add(pid);
  });
  (userFavorites || []).forEach((f: any) => {
    if (f.property_id) userPropertyIds.add(f.property_id);
  });

  if (userPropertyIds.size === 0) return [];

  const userPropertyArr = Array.from(userPropertyIds);

  // Step 2: Find other users who also interacted with the same properties
  const { data: similarUserInteractions } = await supabase
    .from('user_interactions')
    .select('user_id, interaction_data')
    .neq('user_id', userId)
    .in('interaction_type', ['property_view', 'property_click', 'property_inquiry'])
    .order('created_at', { ascending: false })
    .limit(500);

  // Score each other user by overlap count
  const userOverlap: Record<string, number> = {};
  const otherUserProperties: Record<string, Set<string>> = {};

  (similarUserInteractions || []).forEach((i: any) => {
    const pid = i.interaction_data?.propertyId;
    if (!pid) return;

    const uid = i.user_id;
    if (!otherUserProperties[uid]) otherUserProperties[uid] = new Set();
    otherUserProperties[uid].add(pid);

    if (userPropertyArr.includes(pid)) {
      userOverlap[uid] = (userOverlap[uid] || 0) + 1;
    }
  });

  // Rank similar users by overlap (min 2 shared properties)
  const similarUsers = Object.entries(userOverlap)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([uid]) => uid);

  if (similarUsers.length === 0) return [];

  // Step 3: Collect properties from similar users that the current user hasn't seen
  const candidateScores: Record<string, number> = {};
  similarUsers.forEach(uid => {
    const overlap = userOverlap[uid];
    otherUserProperties[uid]?.forEach(pid => {
      if (!userPropertyIds.has(pid)) {
        // Weight by similarity score (overlap count)
        candidateScores[pid] = (candidateScores[pid] || 0) + overlap;
      }
    });
  });

  // Also check favorites of similar users
  const { data: similarFavorites } = await supabase
    .from('favorites')
    .select('property_id, user_id')
    .in('user_id', similarUsers);

  (similarFavorites || []).forEach((f: any) => {
    if (!userPropertyIds.has(f.property_id)) {
      const overlap = userOverlap[f.user_id] || 1;
      candidateScores[f.property_id] = (candidateScores[f.property_id] || 0) + overlap * 2; // Favorites weighted higher
    }
  });

  // Step 4: Get top candidate property details
  const topCandidateIds = Object.entries(candidateScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id]) => id);

  if (topCandidateIds.length === 0) return [];

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, city, district, price, property_type, bedrooms, bathrooms, images, listing_type')
    .in('id', topCandidateIds)
    .eq('status', 'approved');

  return (properties || []).map((p: any) => ({
    propertyId: p.id,
    title: p.title,
    city: p.city,
    district: p.district,
    price: p.price,
    propertyType: p.property_type,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    image: p.images?.[0] || null,
    listingType: p.listing_type,
    score: candidateScores[p.id],
    reason: 'Users with similar taste also viewed this property',
    icon: '👥',
  }));
}

/**
 * Strategy 2: Use filter_sequences to find what users searched for next
 * after the current filter, then find properties matching those filters.
 */
async function getFilterSequenceRecommendations(supabase: any, currentFilterId: string, excludeSession: string) {
  const { data: sequences } = await supabase
    .from('filter_sequences')
    .select('current_filter_id')
    .eq('previous_filter_id', currentFilterId)
    .limit(100);

  if (!sequences || sequences.length === 0) return [];

  const filterCounts: Record<string, number> = {};
  sequences.forEach((seq: any) => {
    if (seq.current_filter_id) {
      filterCounts[seq.current_filter_id] = (filterCounts[seq.current_filter_id] || 0) + 1;
    }
  });

  const topFilterIds = Object.entries(filterCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  if (topFilterIds.length === 0) return [];

  const { data: filters } = await supabase
    .from('filter_usage')
    .select('*')
    .in('id', topFilterIds);

  if (!filters || filters.length === 0) return [];

  // For each filter, find matching properties
  const allProperties: any[] = [];
  for (const filter of filters) {
    let query = supabase
      .from('properties')
      .select('id, title, city, district, price, property_type, bedrooms, bathrooms, images, listing_type')
      .eq('status', 'approved');

    if (filter.location) query = query.ilike('city', `%${filter.location}%`);
    if (filter.listing_type) query = query.eq('listing_type', filter.listing_type);
    if (filter.bedrooms) query = query.gte('bedrooms', filter.bedrooms);
    if (filter.price_min) query = query.gte('price', filter.price_min);
    if (filter.price_max) query = query.lte('price', filter.price_max);

    const { data: props } = await query.limit(3);
    if (props) {
      props.forEach((p: any) => {
        if (!allProperties.find(e => e.propertyId === p.id)) {
          allProperties.push({
            propertyId: p.id,
            title: p.title,
            city: p.city,
            district: p.district,
            price: p.price,
            propertyType: p.property_type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            image: p.images?.[0] || null,
            listingType: p.listing_type,
            score: filterCounts[filter.id],
            reason: `Based on popular search: ${buildFilterLabel(filter)}`,
            icon: '🔍',
          });
        }
      });
    }
  }

  return allProperties.slice(0, 8);
}

/**
 * Strategy 3: Fallback — most favorited properties in the last 30 days
 */
async function getTrendingRecommendations(supabase: any, excludeUserId?: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentFavorites } = await supabase
    .from('favorites')
    .select('property_id')
    .gte('created_at', thirtyDaysAgo)
    .limit(500);

  if (!recentFavorites || recentFavorites.length === 0) {
    // Absolute fallback: newest approved properties
    const { data: newest } = await supabase
      .from('properties')
      .select('id, title, city, district, price, property_type, bedrooms, bathrooms, images, listing_type')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(8);

    return (newest || []).map((p: any) => ({
      propertyId: p.id,
      title: p.title,
      city: p.city,
      district: p.district,
      price: p.price,
      propertyType: p.property_type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      image: p.images?.[0] || null,
      listingType: p.listing_type,
      score: 1,
      reason: 'Newly listed property',
      icon: '✨',
    }));
  }

  // Count favorites per property
  const favCounts: Record<string, number> = {};
  recentFavorites.forEach((f: any) => {
    favCounts[f.property_id] = (favCounts[f.property_id] || 0) + 1;
  });

  // Exclude current user's favorites
  let excludeIds: string[] = [];
  if (excludeUserId) {
    const { data: userFavs } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', excludeUserId);
    excludeIds = (userFavs || []).map((f: any) => f.property_id);
  }

  const topPropertyIds = Object.entries(favCounts)
    .filter(([id]) => !excludeIds.includes(id))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id]) => id);

  if (topPropertyIds.length === 0) return [];

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, city, district, price, property_type, bedrooms, bathrooms, images, listing_type')
    .in('id', topPropertyIds)
    .eq('status', 'approved');

  return (properties || []).map((p: any) => ({
    propertyId: p.id,
    title: p.title,
    city: p.city,
    district: p.district,
    price: p.price,
    propertyType: p.property_type,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    image: p.images?.[0] || null,
    listingType: p.listing_type,
    score: favCounts[p.id] || 1,
    reason: `Trending — favorited by ${favCounts[p.id]} users recently`,
    icon: '🔥',
  }));
}

function buildFilterLabel(filter: any): string {
  const parts: string[] = [];
  if (filter.location) parts.push(filter.location);
  if (filter.bedrooms) parts.push(`${filter.bedrooms}BR`);
  if (filter.listing_type) parts.push(filter.listing_type === 'rent' ? 'Rent' : 'Sale');
  return parts.join(', ') || 'similar criteria';
}

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
