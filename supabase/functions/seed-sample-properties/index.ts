import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PROPERTY_TYPES = [
  'house', 'apartment', 'villa', 'land', 'commercial', 'townhouse', 'warehouse', 'kost'
];

const LISTING_TYPES = ['sale', 'rent'];

const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  house: { min: 500_000_000, max: 5_000_000_000 },
  apartment: { min: 300_000_000, max: 3_000_000_000 },
  villa: { min: 1_000_000_000, max: 15_000_000_000 },
  land: { min: 100_000_000, max: 2_000_000_000 },
  commercial: { min: 500_000_000, max: 10_000_000_000 },
  townhouse: { min: 400_000_000, max: 3_000_000_000 },
  warehouse: { min: 1_000_000_000, max: 8_000_000_000 },
  kost: { min: 200_000_000, max: 2_000_000_000 },
};

const BEDROOMS: Record<string, number[]> = {
  house: [2, 3, 4, 5],
  apartment: [1, 2, 3],
  villa: [3, 4, 5, 6],
  land: [0],
  commercial: [0],
  townhouse: [2, 3, 4],
  warehouse: [0],
  kost: [10, 15, 20],
};

const AREA_RANGES: Record<string, { min: number; max: number }> = {
  house: { min: 60, max: 300 },
  apartment: { min: 30, max: 150 },
  villa: { min: 150, max: 1000 },
  land: { min: 100, max: 5000 },
  commercial: { min: 50, max: 500 },
  townhouse: { min: 50, max: 200 },
  warehouse: { min: 200, max: 2000 },
  kost: { min: 100, max: 500 },
};

const BATCH_SIZE = 3; // kelurahan per invocation (keep small to avoid WORKER_LIMIT)

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle(type: string, location: string): string {
  const adjectives = ['Modern', 'Elegant', 'Spacious', 'Cozy', 'Luxury', 'Strategic', 'Premium', 'Beautiful'];
  const adj = pickRandom(adjectives);
  const typeLabels: Record<string, string> = {
    house: 'Rumah', apartment: 'Apartemen', villa: 'Villa', land: 'Tanah',
    commercial: 'Ruko', townhouse: 'Townhouse', warehouse: 'Gudang', kost: 'Kost'
  };
  return `${adj} ${typeLabels[type] || type} di ${location}`;
}

async function generateAIImage(prompt: string): Promise<string | null> {
  if (!lovableApiKey) return null;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!adminData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { province, skipExisting, offset = 0 } = await req.json();

    if (!province) {
      return new Response(JSON.stringify({ error: 'Province is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get total count first (lightweight)
    const { count: totalKelurahan, error: countError } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('province_name', province)
      .eq('is_active', true)
      .not('subdistrict_name', 'is', null);

    if (countError || !totalKelurahan || totalKelurahan === 0) {
      return new Response(JSON.stringify({ error: 'No kelurahan found for this province' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch only the batch we need using range()
    const { data: batch, error: batchError } = await supabase
      .from('locations')
      .select('province_name, city_name, district_name, subdistrict_name')
      .eq('province_name', province)
      .eq('is_active', true)
      .not('subdistrict_name', 'is', null)
      .order('subdistrict_name')
      .range(offset, offset + BATCH_SIZE - 1);

    if (batchError || !batch || batch.length === 0) {
      return new Response(JSON.stringify({ success: true, hasMore: false, created: 0, skipped: 0, errors: 0, totalKelurahan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const hasMore = offset + BATCH_SIZE < totalKelurahan;
    const nextOffset = offset + BATCH_SIZE;

    console.log(`Processing batch: ${batch.length} kelurahan (${offset}-${offset + batch.length} of ${totalKelurahan})`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const loc of batch) {
      for (const propertyType of PROPERTY_TYPES) {
        try {
          if (skipExisting) {
            const { data: existing } = await supabase
              .from('properties')
              .select('id')
              .eq('property_type', propertyType)
              .ilike('location', `%${loc.subdistrict_name}%`)
              .limit(1);

            if (existing && existing.length > 0) {
              skipped++;
              continue;
            }
          }

          const locationStr = `${loc.subdistrict_name}, ${loc.district_name}, ${loc.city_name}, ${loc.province_name}`;
          const title = generateTitle(propertyType, loc.subdistrict_name!);
          const listingType = pickRandom(LISTING_TYPES);
          const priceRange = PRICE_RANGES[propertyType];
          const price = listingType === 'rent'
            ? randomBetween(priceRange.min / 100, priceRange.max / 100)
            : randomBetween(priceRange.min, priceRange.max);
          const bedrooms = pickRandom(BEDROOMS[propertyType] || [0]);
          const bathrooms = propertyType === 'land' || propertyType === 'warehouse' ? 0 : Math.max(1, bedrooms - 1);
          const areaRange = AREA_RANGES[propertyType];
          const areaSqm = randomBetween(areaRange.min, areaRange.max);

          // Skip AI image to reduce memory/compute — use placeholder
          const propertyData = {
            owner_id: userId,
            title,
            description: `${title}. Properti ${propertyType} berlokasi di ${locationStr}. Luas ${areaSqm}m², ${bedrooms > 0 ? `${bedrooms} kamar tidur, ${bathrooms} kamar mandi.` : ''} Cocok untuk investasi atau hunian.`,
            property_type: propertyType,
            listing_type: listingType,
            price,
            location: locationStr,
            bedrooms: bedrooms > 0 ? bedrooms : null,
            bathrooms: bathrooms > 0 ? bathrooms : null,
            area_sqm: areaSqm,
            images: [],
            image_urls: [],
            thumbnail_url: null,
            status: 'active',
            approval_status: 'approved',
            state: loc.province_name,
            city: loc.city_name,
            development_status: 'completed',
          };

          const { error: insertError } = await supabase
            .from('properties')
            .insert(propertyData);

          if (insertError) {
            errors++;
          } else {
            created++;
          }
        } catch {
          errors++;
        }
      }
    }

    console.log(`Batch complete: ${created} created, ${skipped} skipped, ${errors} errors`);

    return new Response(JSON.stringify({
      success: true,
      province,
      totalKelurahan,
      batchProcessed: batch.length,
      offset,
      nextOffset: hasMore ? nextOffset : null,
      hasMore,
      created,
      skipped,
      errors,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in seed-sample-properties:', error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
