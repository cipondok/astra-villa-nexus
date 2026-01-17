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
    // mode: 'provinces' | 'districts' | 'single-province' | 'villages'
    // provinceId: required for 'single-province' mode
    // includeVillages: boolean - whether to also sync kelurahan/desa (4th level)
    const { mode = 'provinces', provinceId, includeVillages = false } = body;

    console.log(`Sync mode: ${mode}, provinceId: ${provinceId || 'none'}, includeVillages: ${includeVillages}`);

    const stats = { 
      provinces: 0, 
      cities: 0, 
      districts: 0, 
      villages: 0,
      inserted: 0,
      updated: 0,
      errors: 0 
    };
    
    const progress: string[] = [];
    const changes: { type: string; name: string; action: string }[] = [];

    // Fetch provinces list
    progress.push('Mengambil daftar provinsi dari BPS...');
    const provincesRes = await fetchWithRetry(`${API_BASE_URL}/provinces.json`);
    const provinces: Province[] = await provincesRes.json();
    progress.push(`Ditemukan ${provinces.length} provinsi`);

    // Mode: provinces only - just insert province names
    if (mode === 'provinces') {
      // Check existing provinces first - look for empty city_code (province-level entries)
      const { data: existing } = await supabase
        .from('locations')
        .select('province_code')
        .eq('city_code', '');
      
      const existingCodes = new Set((existing || []).map(e => e.province_code));
      
      // Process one by one to avoid duplicate key issues
      for (const p of provinces) {
        const provinceName = toTitleCase(p.name);
        const record = {
          province_code: p.id,
          province_name: provinceName,
          city_code: '', // Empty string for province-level entries
          city_name: '',
          city_type: 'KABUPATEN',
          district_code: '',
          district_name: '',
          subdistrict_code: '',
          subdistrict_name: '',
          area_name: provinceName,
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        if (existingCodes.has(p.id)) {
          // Update existing
          const { error } = await supabase
            .from('locations')
            .update(record)
            .eq('province_code', p.id)
            .eq('city_code', '');
          
          if (error && error.code !== '23505') {
            console.error('Province update error:', error);
            stats.errors++;
          } else {
            stats.updated++;
            changes.push({ type: 'province', name: provinceName, action: 'updated' });
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('locations')
            .insert(record);
          
          if (error) {
            if (error.code === '23505') {
              // Already exists, try update instead
              stats.updated++;
              changes.push({ type: 'province', name: provinceName, action: 'updated' });
            } else {
              console.error('Province insert error:', error);
              stats.errors++;
            }
          } else {
            stats.inserted++;
            changes.push({ type: 'province', name: provinceName, action: 'inserted' });
          }
        }
        stats.provinces++;
      }

      progress.push(`Selesai: ${stats.inserted} baru, ${stats.updated} diperbarui`);

      return new Response(JSON.stringify({ 
        success: true, 
        stats, 
        mode,
        progress,
        changes: changes.slice(0, 20),
        totalChanges: changes.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode: single-province - process one province with cities, districts, and optionally villages
    if (mode === 'single-province' && provinceId) {
      const province = provinces.find(p => p.id === provinceId);
      if (!province) {
        return new Response(JSON.stringify({ success: false, error: 'Province not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      const provinceName = toTitleCase(province.name);
      progress.push(`Memproses provinsi: ${provinceName}`);
      console.log(`Processing: ${provinceName}`);

      const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
      const cities: City[] = await citiesRes.json();
      progress.push(`Ditemukan ${cities.length} kota/kabupaten`);

      const locationBatch: any[] = [];

      for (const city of cities) {
        const cityName = toTitleCase(city.name);
        const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';
        const cleanCityName = cityName.replace(/^Kota |^Kabupaten /i, '');

        progress.push(`Memproses: ${cityName}`);

        try {
          const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
          const districts: District[] = await districtsRes.json();

          for (const district of districts) {
            const districtName = toTitleCase(district.name);
            
            if (includeVillages) {
              // Fetch villages/kelurahan for this district
              try {
                const villagesRes = await fetchWithRetry(`${API_BASE_URL}/villages/${district.id}.json`);
                const villages: Village[] = await villagesRes.json();
                
                for (const village of villages) {
                  locationBatch.push({
                    province_code: province.id,
                    province_name: provinceName,
                    city_code: city.id,
                    city_name: cleanCityName,
                    city_type: cityType,
                    district_code: district.id,
                    district_name: districtName,
                    subdistrict_code: village.id,
                    subdistrict_name: toTitleCase(village.name),
                    area_name: `${toTitleCase(village.name)}, ${districtName}`,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                  });
                  stats.villages++;
                }
              } catch (e) {
                console.error(`Error fetching villages for ${districtName}:`, e);
                stats.errors++;
              }
            } else {
              // Just districts without villages
              locationBatch.push({
                province_code: province.id,
                province_name: provinceName,
                city_code: city.id,
                city_name: cleanCityName,
                city_type: cityType,
                district_code: district.id,
                district_name: districtName,
                area_name: `${districtName}, ${cleanCityName}`,
                is_active: true,
                updated_at: new Date().toISOString(),
              });
            }
            stats.districts++;
            changes.push({ type: 'district', name: districtName, action: 'synced' });
          }
        } catch (e) {
          console.error(`Error fetching districts for ${cityName}:`, e);
          stats.errors++;
        }
        stats.cities++;
        changes.push({ type: 'city', name: cleanCityName, action: 'synced' });
      }

      progress.push(`Menyimpan ${locationBatch.length} lokasi ke database...`);

      // Batch insert in chunks of 500
      let insertedCount = 0;
      for (let i = 0; i < locationBatch.length; i += 500) {
        const chunk = locationBatch.slice(i, i + 500);
        const { error, data } = await supabase.from('locations').upsert(chunk, {
          onConflict: 'province_code,city_code,district_code,subdistrict_code',
        });
        if (error) {
          console.error(`Batch insert error:`, error);
          stats.errors++;
        } else {
          insertedCount += chunk.length;
        }
      }

      stats.provinces = 1;
      stats.inserted = insertedCount;
      progress.push(`Selesai! ${insertedCount} lokasi disinkronkan`);

      return new Response(JSON.stringify({ 
        success: true, 
        stats, 
        mode, 
        province: provinceName,
        progress,
        changes: changes.slice(0, 50),
        totalChanges: changes.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode: districts - process provinces in batches (5 at a time)
    if (mode === 'districts') {
      // Find where we left off
      const { data: existingProvinces } = await supabase
        .from('locations')
        .select('province_code')
        .not('district_code', 'is', null);
      
      const processedProvinceCodes = new Set((existingProvinces || []).map(e => e.province_code));
      const unprocessedProvinces = provinces.filter(p => !processedProvinceCodes.has(p.id));
      
      if (unprocessedProvinces.length === 0) {
        progress.push('Semua provinsi sudah tersinkronisasi!');
        return new Response(JSON.stringify({ 
          success: true, 
          stats,
          mode,
          progress,
          message: 'All provinces already synced',
          remaining: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const limitedProvinces = unprocessedProvinces.slice(0, 3); // Process 3 at a time for stability
      progress.push(`Memproses ${limitedProvinces.length} provinsi (tersisa ${unprocessedProvinces.length})...`);
      
      for (const province of limitedProvinces) {
        const provinceName = toTitleCase(province.name);
        progress.push(`Memproses: ${provinceName}`);
        console.log(`Processing: ${provinceName}`);

        try {
          const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
          const cities: City[] = await citiesRes.json();

          const locationBatch: any[] = [];

          for (const city of cities) {
            const cityName = toTitleCase(city.name);
            const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';
            const cleanCityName = cityName.replace(/^Kota |^Kabupaten /i, '');

            try {
              const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
              const districts: District[] = await districtsRes.json();

              for (const district of districts) {
                locationBatch.push({
                  province_code: province.id,
                  province_name: provinceName,
                  city_code: city.id,
                  city_name: cleanCityName,
                  city_type: cityType,
                  district_code: district.id,
                  district_name: toTitleCase(district.name),
                  area_name: `${toTitleCase(district.name)}, ${cleanCityName}`,
                  is_active: true,
                  updated_at: new Date().toISOString(),
                });
              }
              stats.districts += districts.length;
            } catch (e) {
              console.error(`Districts error for ${cityName}`);
              stats.errors++;
            }
            stats.cities++;
          }

          // Batch insert
          for (let i = 0; i < locationBatch.length; i += 500) {
            const chunk = locationBatch.slice(i, i + 500);
            await supabase.from('locations').upsert(chunk, {
              onConflict: 'province_code,city_code,district_code,subdistrict_code',
            });
          }
          
          stats.inserted += locationBatch.length;
          changes.push({ type: 'province', name: provinceName, action: 'completed' });
          stats.provinces++;
          progress.push(`${provinceName}: ${locationBatch.length} kecamatan disimpan`);
        } catch (e) {
          console.error(`Province error: ${provinceName}`);
          stats.errors++;
        }
      }

      const remaining = unprocessedProvinces.length - stats.provinces;
      progress.push(`Selesai batch ini. Tersisa ${remaining} provinsi.`);

      return new Response(JSON.stringify({ 
        success: true, 
        stats, 
        mode,
        progress,
        changes: changes.slice(0, 20),
        message: `Processed ${stats.provinces} of ${provinces.length} provinces. Run again to continue.`,
        remaining,
        totalChanges: stats.inserted
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
