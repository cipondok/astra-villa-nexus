import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FilterSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  filters: {
    location?: string;
    propertyTypes?: string[];
    listingType?: string;
    priceRange?: [number, number];
    bedrooms?: string;
    bathrooms?: string;
  };
  usageCount: number;
  popularity: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Getting smart filter suggestions...');

    const { location, listingType, propertyTypes } = await req.json();
    
    console.log('📍 Context:', { location, listingType, propertyTypes });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Build query based on context
    let query = supabase
      .from('filter_usage')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('last_used_at', { ascending: false })
      .limit(20);

    // Filter by location if provided
    if (location && location !== 'all') {
      query = query.eq('location', location);
    }

    // Filter by listing type if provided
    if (listingType && listingType !== 'all') {
      query = query.eq('listing_type', listingType);
    }

    const { data: usageData, error } = await query;

    if (error) {
      console.error('❌ Error fetching filter usage:', error);
      throw error;
    }

    console.log(`✅ Found ${usageData?.length || 0} usage records`);

    // Process and aggregate similar filters
    const suggestions: FilterSuggestion[] = [];
    const processedCombinations = new Set<string>();

    usageData?.forEach((usage) => {
      // Create a unique key for this combination
      const key = `${usage.location}-${usage.listing_type}-${usage.bedrooms}-${usage.bathrooms}-${usage.price_min}-${usage.price_max}`;
      
      if (processedCombinations.has(key)) {
        return;
      }
      processedCombinations.add(key);

      // Calculate popularity score
      const daysSinceLastUsed = Math.floor(
        (Date.now() - new Date(usage.last_used_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyScore = Math.max(0, 30 - daysSinceLastUsed) / 30; // 0-1 based on recency
      const popularity = (usage.usage_count * 0.7) + (recencyScore * usage.usage_count * 0.3);

      // Generate suggestion title and description
      let title = '';
      let description = '';
      let icon = '🎯';

      if (usage.bedrooms && usage.bathrooms) {
        title = `${usage.bedrooms}BR/${usage.bathrooms}BA ${usage.location || 'Properties'}`;
        description = `Popular ${usage.bedrooms} bedroom, ${usage.bathrooms} bathroom properties`;
        icon = '🏡';
      } else if (usage.location) {
        title = `${usage.location} ${usage.listing_type === 'rent' ? 'Rentals' : 'Properties'}`;
        description = `Trending searches in ${usage.location}`;
        icon = '📍';
      } else if (usage.price_min || usage.price_max) {
        const priceRange = `IDR ${(usage.price_min / 1000000000).toFixed(1)}B - ${(usage.price_max / 1000000000).toFixed(1)}B`;
        title = `${priceRange} Range`;
        description = `Popular price range for ${usage.listing_type || 'all properties'}`;
        icon = '💰';
      } else {
        title = `${usage.listing_type === 'rent' ? 'Rental' : 'Sale'} Properties`;
        description = `Popular search in your area`;
        icon = '✨';
      }

      suggestions.push({
        id: usage.id,
        title,
        description,
        icon,
        filters: {
          location: usage.location || undefined,
          propertyTypes: usage.property_types || undefined,
          listingType: usage.listing_type || undefined,
          priceRange: usage.price_min && usage.price_max 
            ? [usage.price_min, usage.price_max]
            : undefined,
          bedrooms: usage.bedrooms?.toString() || undefined,
          bathrooms: usage.bathrooms?.toString() || undefined,
        },
        usageCount: usage.usage_count,
        popularity,
      });
    });

    // Sort by popularity and take top 6
    const topSuggestions = suggestions
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);

    console.log(`🎯 Returning ${topSuggestions.length} smart suggestions`);

    return new Response(
      JSON.stringify({ suggestions: topSuggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in get-smart-filter-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
