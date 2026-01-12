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
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Failed to fetch ${url}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    // mode: 'provinces' | 'districts' | 'single-province'
    // provinceId: required for 'single-province' mode
    const { mode = 'provinces', provinceId } = body;

    console.log(`Sync mode: ${mode}, provinceId: ${provinceId || 'none'}`);

    const stats = { provinces: 0, cities: 0, districts: 0, villages: 0 };

    // Fetch provinces list
    const provincesRes = await fetchWithRetry(`${API_BASE_URL}/provinces.json`);
    const provinces: Province[] = await provincesRes.json();

    // Mode: provinces only - just insert province names
    if (mode === 'provinces') {
      const batch = provinces.map(p => ({
        province_code: p.id,
        province_name: toTitleCase(p.name),
        is_active: true,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('locations').upsert(batch, {
        onConflict: 'province_code,city_code,district_code,subdistrict_code',
      });

      if (error) console.error('Provinces upsert error:', error);
      stats.provinces = provinces.length;

      return new Response(JSON.stringify({ success: true, stats, mode }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode: single-province - process one province with cities and districts
    if (mode === 'single-province' && provinceId) {
      const province = provinces.find(p => p.id === provinceId);
      if (!province) {
        return new Response(JSON.stringify({ success: false, error: 'Province not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      const provinceName = toTitleCase(province.name);
      console.log(`Processing: ${provinceName}`);

      const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
      const cities: City[] = await citiesRes.json();

      const locationBatch: any[] = [];

      for (const city of cities) {
        const cityName = toTitleCase(city.name);
        const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';

        try {
          const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
          const districts: District[] = await districtsRes.json();

          for (const district of districts) {
            locationBatch.push({
              province_code: province.id,
              province_name: provinceName,
              city_code: city.id,
              city_name: cityName.replace(/^Kota |^Kabupaten /i, ''),
              city_type: cityType,
              district_code: district.id,
              district_name: toTitleCase(district.name),
              is_active: true,
              updated_at: new Date().toISOString(),
            });
          }
          stats.districts += districts.length;
        } catch (e) {
          console.error(`Error fetching districts for ${cityName}:`, e);
        }
        stats.cities++;
      }

      // Batch insert in chunks of 500
      for (let i = 0; i < locationBatch.length; i += 500) {
        const chunk = locationBatch.slice(i, i + 500);
        const { error } = await supabase.from('locations').upsert(chunk);
        if (error) console.error(`Batch insert error:`, error);
      }

      stats.provinces = 1;
      return new Response(JSON.stringify({ success: true, stats, mode, province: provinceName }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode: districts - process ALL provinces but limited (first 5 only to avoid timeout)
    if (mode === 'districts') {
      const limitedProvinces = provinces.slice(0, 5); // Process only 5 at a time
      
      for (const province of limitedProvinces) {
        const provinceName = toTitleCase(province.name);
        console.log(`Processing: ${provinceName}`);

        try {
          const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
          const cities: City[] = await citiesRes.json();

          const locationBatch: any[] = [];

          for (const city of cities) {
            const cityName = toTitleCase(city.name);
            const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';

            try {
              const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
              const districts: District[] = await districtsRes.json();

              for (const district of districts) {
                locationBatch.push({
                  province_code: province.id,
                  province_name: provinceName,
                  city_code: city.id,
                  city_name: cityName.replace(/^Kota |^Kabupaten /i, ''),
                  city_type: cityType,
                  district_code: district.id,
                  district_name: toTitleCase(district.name),
                  is_active: true,
                  updated_at: new Date().toISOString(),
                });
              }
              stats.districts += districts.length;
            } catch (e) {
              console.error(`Districts error for ${cityName}`);
            }
            stats.cities++;
          }

          // Batch insert
          for (let i = 0; i < locationBatch.length; i += 500) {
            const chunk = locationBatch.slice(i, i + 500);
            await supabase.from('locations').upsert(chunk);
          }

          stats.provinces++;
        } catch (e) {
          console.error(`Province error: ${provinceName}`);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        stats, 
        mode,
        message: `Processed ${stats.provinces} of ${provinces.length} provinces. Run again to continue.`,
        remaining: provinces.length - stats.provinces,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid mode' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
