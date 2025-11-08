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
    console.log('📊 Getting filter analytics...');

    const { days = 30 } = await req.json().catch(() => ({ days: 30 }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get aggregated analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('filter_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (analyticsError) throw analyticsError;

    // Get all filter usage for detailed analysis
    const { data: filterUsage, error: usageError } = await supabase
      .from('filter_usage')
      .select('*')
      .gte('last_used_at', startDate.toISOString());

    if (usageError) throw usageError;

    // Process data for different views

    // 1. Location heatmap data
    const locationHeatmap = processLocationHeatmap(filterUsage || []);

    // 2. Time-based trends (daily aggregation)
    const timeTrends = processTimeTrends(analytics || []);

    // 3. Top searches by category
    const topSearches = processTopSearches(filterUsage || []);

    // 4. Conversion rates (simulated - in production track actual conversions)
    const conversionRates = processConversionRates(filterUsage || []);

    // 5. Property type distribution
    const propertyTypeDistribution = processPropertyTypeDistribution(filterUsage || []);

    console.log('✅ Analytics processed successfully');

    return new Response(
      JSON.stringify({
        locationHeatmap,
        timeTrends,
        topSearches,
        conversionRates,
        propertyTypeDistribution,
        summary: {
          totalSearches: filterUsage?.length || 0,
          uniqueLocations: new Set(filterUsage?.map(f => f.location).filter(Boolean)).size,
          avgSearchesPerDay: Math.round((filterUsage?.length || 0) / days),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in filter analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function processLocationHeatmap(usage: any[]) {
  const heatmap: Record<string, number> = {};
  usage.forEach(item => {
    if (item.location) {
      heatmap[item.location] = (heatmap[item.location] || 0) + item.usage_count;
    }
  });
  return Object.entries(heatmap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

function processTimeTrends(analytics: any[]) {
  const trends: Record<string, number> = {};
  analytics.forEach(item => {
    const date = item.date;
    trends[date] = (trends[date] || 0) + item.search_count;
  });
  return Object.entries(trends)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function processTopSearches(usage: any[]) {
  return usage
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 10)
    .map(item => ({
      id: item.id,
      location: item.location,
      propertyTypes: item.property_types,
      listingType: item.listing_type,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      usageCount: item.usage_count,
      lastUsed: item.last_used_at,
    }));
}

function processConversionRates(usage: any[]) {
  // Simulate conversion rates based on filter characteristics
  // In production, track actual property views/inquiries
  const conversions = usage.map(item => {
    const baseRate = 0.15; // 15% base conversion
    let rate = baseRate;
    
    // More specific searches have higher conversion
    if (item.location) rate += 0.05;
    if (item.bedrooms) rate += 0.05;
    if (item.bathrooms) rate += 0.03;
    if (item.property_types?.length === 1) rate += 0.04;
    
    return {
      filterId: item.id,
      location: item.location,
      conversionRate: Math.min(rate, 0.5), // Cap at 50%
      searches: item.usage_count,
      estimatedConversions: Math.round(item.usage_count * rate),
    };
  });

  return conversions.sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 10);
}

function processPropertyTypeDistribution(usage: any[]) {
  const distribution: Record<string, number> = {};
  usage.forEach(item => {
    if (item.property_types && Array.isArray(item.property_types)) {
      item.property_types.forEach((type: string) => {
        distribution[type] = (distribution[type] || 0) + 1;
      });
    }
  });
  return Object.entries(distribution)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}
