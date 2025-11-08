import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤝 Getting collaborative recommendations...');

    const { currentFilterId, sessionId } = await req.json();
    
    console.log('📍 Context:', { currentFilterId, sessionId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find filters that were searched after the current filter
    const { data: sequences, error: seqError } = await supabase
      .from('filter_sequences')
      .select('current_filter_id')
      .eq('previous_filter_id', currentFilterId)
      .limit(100);

    if (seqError) throw seqError;

    if (!sequences || sequences.length === 0) {
      console.log('ℹ️ No collaborative data found');
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Count occurrences of each subsequent filter
    const filterCounts: Record<string, number> = {};
    sequences.forEach(seq => {
      if (seq.current_filter_id) {
        filterCounts[seq.current_filter_id] = (filterCounts[seq.current_filter_id] || 0) + 1;
      }
    });

    // Get the top 5 most common subsequent filters
    const topFilterIds = Object.entries(filterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    if (topFilterIds.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fetch filter details
    const { data: filters, error: filterError } = await supabase
      .from('filter_usage')
      .select('*')
      .in('id', topFilterIds);

    if (filterError) throw filterError;

    const recommendations = filters?.map(filter => ({
      id: filter.id,
      title: generateTitle(filter),
      description: generateDescription(filter),
      icon: generateIcon(filter),
      filters: {
        location: filter.location || undefined,
        propertyTypes: filter.property_types || undefined,
        listingType: filter.listing_type || undefined,
        priceRange: filter.price_min && filter.price_max 
          ? [filter.price_min, filter.price_max]
          : undefined,
        bedrooms: filter.bedrooms?.toString() || undefined,
        bathrooms: filter.bathrooms?.toString() || undefined,
      },
      matchCount: filterCounts[filter.id],
    })) || [];

    console.log(`✅ Found ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in collaborative recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateTitle(filter: any): string {
  if (filter.location && filter.bedrooms) {
    return `${filter.bedrooms}BR in ${filter.location}`;
  } else if (filter.location) {
    return `${filter.location} Properties`;
  } else if (filter.listing_type) {
    return `For ${filter.listing_type === 'rent' ? 'Rent' : 'Sale'}`;
  }
  return 'Similar Search';
}

function generateDescription(filter: any): string {
  const parts = [];
  if (filter.bedrooms) parts.push(`${filter.bedrooms} bedrooms`);
  if (filter.bathrooms) parts.push(`${filter.bathrooms} bathrooms`);
  if (filter.location) parts.push(`in ${filter.location}`);
  return parts.length > 0 ? parts.join(', ') : 'Users also searched for this';
}

function generateIcon(filter: any): string {
  if (filter.listing_type === 'rent') return '🔑';
  if (filter.bedrooms && filter.bedrooms >= 4) return '🏰';
  if (filter.property_types?.includes('villa')) return '🏖️';
  if (filter.property_types?.includes('apartment')) return '🏢';
  return '🏠';
}
