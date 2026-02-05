import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Indonesian states/provinces
const INDONESIAN_STATES = [
  { id: 'aceh', name: 'Aceh' },
  { id: 'sumut', name: 'Sumatera Utara' },
  { id: 'sumbar', name: 'Sumatera Barat' },
  { id: 'riau', name: 'Riau' },
  { id: 'kepri', name: 'Kepulauan Riau' },
  { id: 'jambi', name: 'Jambi' },
  { id: 'sumsel', name: 'Sumatera Selatan' },
  { id: 'bengkulu', name: 'Bengkulu' },
  { id: 'babel', name: 'Bangka Belitung' },
  { id: 'lampung', name: 'Lampung' },
  { id: 'banten', name: 'Banten' },
  { id: 'jakarta', name: 'DKI Jakarta' },
  { id: 'jabar', name: 'Jawa Barat' },
  { id: 'jateng', name: 'Jawa Tengah' },
  { id: 'yogya', name: 'Yogyakarta' },
  { id: 'jatim', name: 'Jawa Timur' },
  { id: 'bali', name: 'Bali' },
  { id: 'ntb', name: 'Nusa Tenggara Barat' },
  { id: 'ntt', name: 'Nusa Tenggara Timur' },
  { id: 'kalbar', name: 'Kalimantan Barat' },
  { id: 'kalteng', name: 'Kalimantan Tengah' },
  { id: 'kalsel', name: 'Kalimantan Selatan' },
  { id: 'kaltim', name: 'Kalimantan Timur' },
  { id: 'kaltara', name: 'Kalimantan Utara' },
  { id: 'sulut', name: 'Sulawesi Utara' },
  { id: 'sulteng', name: 'Sulawesi Tengah' },
  { id: 'sulsel', name: 'Sulawesi Selatan' },
  { id: 'sultra', name: 'Sulawesi Tenggara' },
  { id: 'gorontalo', name: 'Gorontalo' },
  { id: 'sulbar', name: 'Sulawesi Barat' },
  { id: 'maluku', name: 'Maluku' },
  { id: 'malut', name: 'Maluku Utara' },
  { id: 'papua', name: 'Papua' },
  { id: 'papuabarat', name: 'Papua Barat' },
];

const PROPERTY_CATEGORIES = ['dijual', 'disewa'];
const PROPERTY_TYPES = ['rumah', 'apartemen', 'villa', 'tanah', 'ruko', 'kantor', 'gudang'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, stateId, category, propertyType, batchSize = 10 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'generate-single') {
      // Generate a single landing page
      const result = await generateLandingPage(supabase, lovableApiKey, stateId, category, propertyType);
      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-batch') {
      // Generate batch of landing pages for all states with a category/type
      const results = await generateBatchLandingPages(supabase, lovableApiKey, category, propertyType, batchSize);
      return new Response(JSON.stringify({ success: true, data: results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-all-states') {
      // Queue generation for all states (state-only pages)
      const queued = await queueAllStatesGeneration(supabase);
      return new Response(JSON.stringify({ success: true, queued }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-all-combinations') {
      // Queue all state + category + type combinations
      const queued = await queueAllCombinations(supabase);
      return new Response(JSON.stringify({ success: true, queued }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'process-queue') {
      // Process pending items from the queue
      const processed = await processQueue(supabase, lovableApiKey, batchSize);
      return new Response(JSON.stringify({ success: true, processed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-stats') {
      // Get SEO content statistics
      const stats = await getStats(supabase);
      return new Response(JSON.stringify({ success: true, stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-all-property-posts') {
      // Generate property listing pages for all states with all types
      const result = await generateAllPropertyPosts(supabase, lovableApiKey);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync-property-counts') {
      // Sync real property counts to all landing pages
      const synced = await syncPropertyCounts(supabase);
      return new Response(JSON.stringify({ success: true, synced }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SEO content generator error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateLandingPage(
  supabase: any, 
  apiKey: string | undefined, 
  stateId: string, 
  category?: string, 
  propertyType?: string
) {
  const state = INDONESIAN_STATES.find(s => s.id === stateId);
  if (!state) throw new Error(`State not found: ${stateId}`);

  // Get property stats for this state
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('price, listing_type, property_type')
    .ilike('location', `%${state.name}%`);

  let filteredProps = properties || [];
  if (category) {
    filteredProps = filteredProps.filter((p: any) => 
      category === 'dijual' ? p.listing_type === 'sale' : p.listing_type === 'rent'
    );
  }
  if (propertyType) {
    filteredProps = filteredProps.filter((p: any) => 
      p.property_type?.toLowerCase() === propertyType.toLowerCase()
    );
  }

  const propertyCount = filteredProps.length;
  const prices = filteredProps.map((p: any) => p.price).filter(Boolean);
  const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : null;
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  // Determine page type and create slug
  let pageType: string;
  let slug: string;
  let title: string;
  let primaryKeyword: string;

  if (category && propertyType) {
    pageType = 'property_type_state';
    slug = `${propertyType}-${category}-${stateId}`;
    title = `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${category === 'dijual' ? 'Dijual' : 'Disewa'} di ${state.name}`;
    primaryKeyword = `${propertyType} ${category} ${state.name}`;
  } else if (category) {
    pageType = 'category_state';
    slug = `properti-${category}-${stateId}`;
    title = `Properti ${category === 'dijual' ? 'Dijual' : 'Disewa'} di ${state.name}`;
    primaryKeyword = `properti ${category} ${state.name}`;
  } else {
    pageType = 'state';
    slug = `properti-${stateId}`;
    title = `Properti di ${state.name}`;
    primaryKeyword = `properti ${state.name}`;
  }

  // Generate AI content if API key available
  let aiContent = null;
  if (apiKey) {
    aiContent = await generateAIContent(apiKey, state.name, category, propertyType, propertyCount, avgPrice);
  }

  // Create or update landing page
  const pageData = {
    slug,
    page_type: pageType,
    state_id: stateId,
    state_name: state.name,
    category: category || null,
    property_type: propertyType || null,
    title,
    meta_title: aiContent?.metaTitle || `${title} - Astra Villa`,
    meta_description: aiContent?.metaDescription || `Temukan ${propertyCount} ${title.toLowerCase()} dengan harga terbaik. Cari properti impian Anda sekarang.`,
    h1_heading: aiContent?.h1 || title,
    intro_content: aiContent?.intro || `Jelajahi berbagai pilihan properti di ${state.name}.`,
    main_content: aiContent?.mainContent || `Kami memiliki ${propertyCount} properti tersedia di ${state.name}.`,
    closing_content: aiContent?.closing || 'Hubungi kami untuk informasi lebih lanjut.',
    primary_keyword: primaryKeyword,
    secondary_keywords: aiContent?.secondaryKeywords || [`harga properti ${state.name}`, `jual beli rumah ${state.name}`],
    property_count: propertyCount,
    avg_price: avgPrice,
    price_range_min: minPrice,
    price_range_max: maxPrice,
    is_ai_generated: !!apiKey,
    ai_model_used: apiKey ? 'google/gemini-3-flash-preview' : null,
    last_ai_update: apiKey ? new Date().toISOString() : null,
    seo_score: aiContent?.seoScore || 70,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('seo_landing_pages')
    .upsert(pageData, { onConflict: 'slug' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function generateAIContent(
  apiKey: string, 
  stateName: string, 
  category?: string, 
  propertyType?: string,
  propertyCount?: number,
  avgPrice?: number | null
) {
  const categoryText = category === 'dijual' ? 'dijual' : category === 'disewa' ? 'disewa' : '';
  const typeText = propertyType ? propertyType : 'properti';
  
  const prompt = `Generate SEO content for a real estate landing page in Indonesian language.

Location: ${stateName}, Indonesia
Property Type: ${typeText}
Category: ${categoryText || 'semua'}
Available Properties: ${propertyCount || 'banyak'}
${avgPrice ? `Average Price: Rp ${avgPrice.toLocaleString('id-ID')}` : ''}

Generate JSON with these fields:
- metaTitle: SEO title (max 60 chars)
- metaDescription: Meta description (max 160 chars)
- h1: Main heading
- intro: Introduction paragraph (2-3 sentences)
- mainContent: Main content (3-4 paragraphs about the area, property market, benefits)
- closing: Call to action paragraph
- secondaryKeywords: Array of 5 related keywords
- seoScore: Estimated SEO score (1-100)

Focus on local market insights, area benefits, and property investment value.`;

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
          { role: 'system', content: 'You are an SEO content specialist for Indonesian real estate. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI content generation error:', error);
    return null;
  }
}

async function generateBatchLandingPages(
  supabase: any,
  apiKey: string | undefined,
  category?: string,
  propertyType?: string,
  batchSize: number = 10
) {
  const results = [];
  const statesToProcess = INDONESIAN_STATES.slice(0, batchSize);

  for (const state of statesToProcess) {
    try {
      const result = await generateLandingPage(supabase, apiKey, state.id, category, propertyType);
      results.push({ stateId: state.id, success: true, data: result });
    } catch (error) {
      results.push({ stateId: state.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return results;
}

async function queueAllStatesGeneration(supabase: any) {
  const queueItems = INDONESIAN_STATES.map((state, index) => ({
    action: 'generate',
    priority: index < 10 ? 1 : 5, // Prioritize popular states
    status: 'pending',
    scheduled_for: new Date(Date.now() + index * 60000).toISOString(), // Stagger by 1 min
  }));

  // Create placeholder landing pages first
  for (const state of INDONESIAN_STATES) {
    const { error } = await supabase
      .from('seo_landing_pages')
      .upsert({
        slug: `properti-${state.id}`,
        page_type: 'state',
        state_id: state.id,
        state_name: state.name,
        title: `Properti di ${state.name}`,
        is_published: false,
      }, { onConflict: 'slug' });
  }

  // Get the created pages and queue them
  const { data: pages } = await supabase
    .from('seo_landing_pages')
    .select('id')
    .eq('page_type', 'state');

  const queueData = pages?.map((page: any, index: number) => ({
    landing_page_id: page.id,
    action: 'generate',
    priority: index < 10 ? 1 : 5,
    status: 'pending',
  })) || [];

  const { data, error } = await supabase
    .from('seo_publish_queue')
    .insert(queueData)
    .select();

  return data?.length || 0;
}

async function queueAllCombinations(supabase: any) {
  let queued = 0;

  for (const state of INDONESIAN_STATES) {
    for (const category of PROPERTY_CATEGORIES) {
      for (const type of PROPERTY_TYPES) {
        const slug = `${type}-${category}-${state.id}`;
        
        // Create placeholder page
        const { data: page, error } = await supabase
          .from('seo_landing_pages')
          .upsert({
            slug,
            page_type: 'property_type_state',
            state_id: state.id,
            state_name: state.name,
            category,
            property_type: type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${category === 'dijual' ? 'Dijual' : 'Disewa'} di ${state.name}`,
            is_published: false,
          }, { onConflict: 'slug' })
          .select()
          .single();

        if (page) {
          await supabase
            .from('seo_publish_queue')
            .insert({
              landing_page_id: page.id,
              action: 'generate',
              priority: 5,
              status: 'pending',
            });
          queued++;
        }
      }
    }
  }

  return queued;
}

async function processQueue(supabase: any, apiKey: string | undefined, batchSize: number) {
  // Get pending items
  const { data: queueItems, error } = await supabase
    .from('seo_publish_queue')
    .select('*, seo_landing_pages(*)')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error || !queueItems?.length) return 0;

  let processed = 0;

  for (const item of queueItems) {
    try {
      // Update status to processing
      await supabase
        .from('seo_publish_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      // Generate content
      const page = item.seo_landing_pages;
      if (page) {
        await generateLandingPage(
          supabase, 
          apiKey, 
          page.state_id, 
          page.category, 
          page.property_type
        );
      }

      // Mark as completed
      await supabase
        .from('seo_publish_queue')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', item.id);

      processed++;
    } catch (error) {
      await supabase
        .from('seo_publish_queue')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', item.id);
    }
  }

  return processed;
}

async function getStats(supabase: any) {
  const { data: totalPages } = await supabase
    .from('seo_landing_pages')
    .select('id', { count: 'exact', head: true });

  const { data: publishedPages } = await supabase
    .from('seo_landing_pages')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true);

  const { data: pendingQueue } = await supabase
    .from('seo_publish_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: recentSearches } = await supabase
    .from('seo_internal_searches')
    .select('search_query')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: topKeywords } = await supabase
    .from('seo_keywords')
    .select('*')
    .order('search_volume', { ascending: false })
    .limit(10);

  return {
    totalPages: totalPages?.length || 0,
    publishedPages: publishedPages?.length || 0,
    pendingQueue: pendingQueue?.length || 0,
    recentSearches: recentSearches?.map((s: any) => s.search_query) || [],
    topKeywords: topKeywords || [],
  };
}

// Generate all property posts for each state with all types
async function generateAllPropertyPosts(supabase: any, apiKey: string | undefined) {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  // Get real property counts by state and type
  const { data: properties } = await supabase
    .from('properties')
    .select('id, location, state, city, listing_type, property_type');

  // Build property count map
  const countMap: Record<string, { count: number; listing_type: string; property_type: string }> = {};
  
  properties?.forEach((p: any) => {
    // Try to map location to state
    const stateName = p.state || extractStateFromLocation(p.location || p.city || '');
    if (!stateName) return;

    const state = INDONESIAN_STATES.find(s => 
      s.name.toLowerCase() === stateName.toLowerCase() ||
      s.id === stateName.toLowerCase()
    );
    if (!state) return;

    const listingType = p.listing_type === 'sale' ? 'dijual' : 'disewa';
    const propType = (p.property_type || 'rumah').toLowerCase();
    const key = `${state.id}-${listingType}-${propType}`;
    
    if (!countMap[key]) {
      countMap[key] = { count: 0, listing_type: listingType, property_type: propType };
    }
    countMap[key].count++;
  });

  // Generate pages for all combinations
  for (const state of INDONESIAN_STATES) {
    for (const category of PROPERTY_CATEGORIES) {
      for (const type of PROPERTY_TYPES) {
        const key = `${state.id}-${category}-${type}`;
        const stats = countMap[key] || { count: 0 };
        const slug = `${type}-${category}-${state.id}`;
        const title = `${type.charAt(0).toUpperCase() + type.slice(1)} ${category === 'dijual' ? 'Dijual' : 'Disewa'} di ${state.name}`;

        try {
          // Check if page exists
          const { data: existing } = await supabase
            .from('seo_landing_pages')
            .select('id')
            .eq('slug', slug)
            .single();

          const pageData = {
            slug,
            page_type: 'property_type_state',
            state_id: state.id,
            state_name: state.name,
            category,
            property_type: type,
            title,
            meta_title: `${title} | Temukan ${stats.count}+ Properti`,
            meta_description: `Cari ${type} ${category} di ${state.name}. Tersedia ${stats.count} listing dengan harga terbaik. Update terbaru hari ini!`,
            h1_heading: title,
            primary_keyword: `${type} ${category} ${state.name}`,
            secondary_keywords: [
              `harga ${type} ${state.name}`,
              `${type} murah ${state.name}`,
              `jual ${type} ${state.name}`,
              `sewa ${type} ${state.name}`,
            ],
            property_count: stats.count,
            is_published: stats.count > 0, // Auto-publish if has properties
            seo_score: stats.count > 0 ? 75 : 50,
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            await supabase
              .from('seo_landing_pages')
              .update(pageData)
              .eq('id', existing.id);
            updated++;
          } else {
            await supabase
              .from('seo_landing_pages')
              .insert(pageData);
            created++;
          }
        } catch (err) {
          errors.push(`${slug}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    }
  }

  // Also generate state-level pages
  for (const state of INDONESIAN_STATES) {
    const statePropertyCount = properties?.filter((p: any) => {
      const stateName = p.state || extractStateFromLocation(p.location || p.city || '');
      return stateName?.toLowerCase() === state.name.toLowerCase();
    }).length || 0;

    const slug = `properti-${state.id}`;
    const { data: existing } = await supabase
      .from('seo_landing_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    const pageData = {
      slug,
      page_type: 'state',
      state_id: state.id,
      state_name: state.name,
      title: `Properti di ${state.name}`,
      meta_title: `Properti di ${state.name} | ${statePropertyCount}+ Listing Tersedia`,
      meta_description: `Temukan properti terbaik di ${state.name}. Rumah, apartemen, villa, tanah, dan ruko tersedia untuk dijual dan disewa.`,
      h1_heading: `Properti di ${state.name}`,
      primary_keyword: `properti ${state.name}`,
      property_count: statePropertyCount,
      is_published: statePropertyCount > 0,
      seo_score: statePropertyCount > 0 ? 80 : 55,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('seo_landing_pages').update(pageData).eq('id', existing.id);
    } else {
      await supabase.from('seo_landing_pages').insert(pageData);
      created++;
    }
  }

  return { created, updated, errors: errors.slice(0, 10), total: INDONESIAN_STATES.length * PROPERTY_CATEGORIES.length * PROPERTY_TYPES.length + INDONESIAN_STATES.length };
}

// Extract state from location string
function extractStateFromLocation(location: string): string | null {
  const loc = location.toLowerCase();
  for (const state of INDONESIAN_STATES) {
    if (loc.includes(state.name.toLowerCase()) || loc.includes(state.id)) {
      return state.name;
    }
  }
  // Common city mappings
  const cityToState: Record<string, string> = {
    'jakarta': 'DKI Jakarta', 'bandung': 'Jawa Barat', 'surabaya': 'Jawa Timur',
    'semarang': 'Jawa Tengah', 'denpasar': 'Bali', 'medan': 'Sumatera Utara',
    'makassar': 'Sulawesi Selatan', 'palembang': 'Sumatera Selatan', 'tangerang': 'Banten',
    'bekasi': 'Jawa Barat', 'depok': 'Jawa Barat', 'bogor': 'Jawa Barat',
    'yogyakarta': 'Yogyakarta', 'malang': 'Jawa Timur', 'solo': 'Jawa Tengah',
    'ubud': 'Bali', 'seminyak': 'Bali', 'canggu': 'Bali', 'kuta': 'Bali',
  };
  for (const [city, state] of Object.entries(cityToState)) {
    if (loc.includes(city)) return state;
  }
  return null;
}

// Sync property counts to all landing pages
async function syncPropertyCounts(supabase: any) {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, location, state, city, listing_type, property_type');

  const { data: pages } = await supabase
    .from('seo_landing_pages')
    .select('id, state_id, category, property_type, page_type');

  let synced = 0;

  for (const page of pages || []) {
    let count = 0;

    properties?.forEach((p: any) => {
      const stateName = p.state || extractStateFromLocation(p.location || p.city || '');
      const state = INDONESIAN_STATES.find(s => s.name.toLowerCase() === stateName?.toLowerCase());
      
      if (!state || state.id !== page.state_id) return;

      if (page.page_type === 'state') {
        count++;
      } else {
        const listingType = p.listing_type === 'sale' ? 'dijual' : 'disewa';
        const propType = (p.property_type || '').toLowerCase();
        
        if (page.category && page.category !== listingType) return;
        if (page.property_type && page.property_type !== propType) return;
        count++;
      }
    });

    await supabase
      .from('seo_landing_pages')
      .update({ 
        property_count: count,
        is_published: count > 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', page.id);
    synced++;
  }

  return synced;
}
