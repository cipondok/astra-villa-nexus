import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Source: https://emsifa.github.io/api-wilayah-indonesia/
const API_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  province_id: string;
  name: string;
}

interface District {
  id: string;
  regency_id: string;
  name: string;
}

interface Village {
  id: string;
  district_id: string;
  name: string;
}

// Helper to convert to Title Case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fetch with retry logic
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      console.log(`Retry ${i + 1}/${retries} for ${url}`);
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      if (i === retries - 1) throw error;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    const body = await req.json().catch(() => ({}));
    const { mode = 'full', provinceId } = body;
    // mode: 'provinces' | 'cities' | 'districts' | 'villages' | 'full'
    // provinceId: optional - sync only specific province

    console.log(`Starting Indonesia locations sync. Mode: ${mode}, Province: ${provinceId || 'all'}`);

    const stats = {
      provinces: 0,
      cities: 0,
      districts: 0,
      villages: 0,
      errors: [] as string[],
    };

    // Step 1: Fetch all provinces
    console.log('Fetching provinces...');
    const provincesRes = await fetchWithRetry(`${API_BASE_URL}/provinces.json`);
    const provinces: Province[] = await provincesRes.json();
    console.log(`Found ${provinces.length} provinces`);

    // Filter provinces if specific one requested
    const targetProvinces = provinceId 
      ? provinces.filter(p => p.id === provinceId)
      : provinces;

    // Step 2: Process each province
    for (const province of targetProvinces) {
      try {
        const provinceName = toTitleCase(province.name);
        console.log(`Processing province: ${provinceName} (${province.id})`);

        // Fetch cities for this province
        const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
        const cities: City[] = await citiesRes.json();

        for (const city of cities) {
          try {
            const cityName = toTitleCase(city.name);
            const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';

            // Fetch districts for this city
            const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
            const districts: District[] = await districtsRes.json();

            for (const district of districts) {
              try {
                const districtName = toTitleCase(district.name);

                // Fetch villages for this district (only in full mode)
                if (mode === 'full' || mode === 'villages') {
                  try {
                    const villagesRes = await fetchWithRetry(`${API_BASE_URL}/villages/${district.id}.json`);
                    const villages: Village[] = await villagesRes.json();

                    for (const village of villages) {
                      const villageName = toTitleCase(village.name);

                      // Upsert village record
                      const { error: villageError } = await supabase
                        .from('locations')
                        .upsert({
                          province_code: province.id,
                          province_name: provinceName,
                          city_code: city.id,
                          city_name: cityName.replace(/^Kota |^Kabupaten /i, ''),
                          city_type: cityType,
                          district_code: district.id,
                          district_name: districtName,
                          subdistrict_code: village.id,
                          subdistrict_name: villageName,
                          is_active: true,
                          updated_at: new Date().toISOString(),
                        }, {
                          onConflict: 'province_code,city_code,district_code,subdistrict_code',
                          ignoreDuplicates: false,
                        });

                      if (villageError) {
                        // If conflict strategy fails, try individual upsert
                        const { error: retryError } = await supabase
                          .from('locations')
                          .upsert({
                            province_code: province.id,
                            province_name: provinceName,
                            city_code: city.id,
                            city_name: cityName.replace(/^Kota |^Kabupaten /i, ''),
                            city_type: cityType,
                            district_code: district.id,
                            district_name: districtName,
                            subdistrict_code: village.id,
                            subdistrict_name: villageName,
                            is_active: true,
                            updated_at: new Date().toISOString(),
                          });
                        
                        if (retryError) {
                          console.error(`Error upserting village ${villageName}:`, retryError);
                        } else {
                          stats.villages++;
                        }
                      } else {
                        stats.villages++;
                      }
                    }
                  } catch (villageErr) {
                    stats.errors.push(`Villages for district ${districtName}: ${villageErr}`);
                  }
                } else {
                  // Insert district without village
                  const { error: districtError } = await supabase
                    .from('locations')
                    .upsert({
                      province_code: province.id,
                      province_name: provinceName,
                      city_code: city.id,
                      city_name: cityName.replace(/^Kota |^Kabupaten /i, ''),
                      city_type: cityType,
                      district_code: district.id,
                      district_name: districtName,
                      is_active: true,
                      updated_at: new Date().toISOString(),
                    });

                  if (!districtError) {
                    stats.districts++;
                  }
                }
              } catch (distErr) {
                stats.errors.push(`District ${district.name}: ${distErr}`);
              }
            }
            stats.cities++;
          } catch (cityErr) {
            stats.errors.push(`City ${city.name}: ${cityErr}`);
          }
        }
        stats.provinces++;
      } catch (provErr) {
        stats.errors.push(`Province ${province.name}: ${provErr}`);
      }
    }

    console.log('Sync completed:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Indonesia locations sync completed',
        stats,
        source: 'https://emsifa.github.io/api-wilayah-indonesia/',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing locations:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to sync Indonesia locations',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
