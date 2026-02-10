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
    await new Promise(r => setTimeout(r, 300));
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
    // mode: 'provinces' | 'districts' | 'single-province' | 'single-city'
    // provinceId: required for 'single-province' and 'single-city' mode
    // cityId: required for 'single-city' mode
    // includeVillages: boolean - whether to also sync kelurahan/desa (4th level)
    const { mode = 'provinces', provinceId, cityId, includeVillages = false } = body;

    console.log(`Sync mode: ${mode}, provinceId: ${provinceId || 'none'}, cityId: ${cityId || 'none'}, includeVillages: ${includeVillages}`);

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
          city_code: '',
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
          const { error } = await supabase
            .from('locations')
            .insert(record);
          
          if (error) {
            if (error.code === '23505') {
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

    // Mode: single-city - process ONE city with districts and optionally villages
    // This is the most granular and memory-efficient mode for villages
    if (mode === 'single-city' && provinceId && cityId) {
      const province = provinces.find(p => p.id === provinceId);
      if (!province) {
        return new Response(JSON.stringify({ success: false, error: 'Province not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      const provinceName = toTitleCase(province.name);
      
      const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${provinceId}.json`);
      const cities: City[] = await citiesRes.json();
      const city = cities.find(c => c.id === cityId);
      
      if (!city) {
        return new Response(JSON.stringify({ success: false, error: 'City not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      const cityName = toTitleCase(city.name);
      const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';
      const cleanCityName = cityName.replace(/^Kota |^Kabupaten /i, '');
      
      progress.push(`Memproses: ${cityType} ${cleanCityName}, ${provinceName}`);
      console.log(`Processing city: ${cleanCityName}`);

      const locationBatch: any[] = [];

      const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${cityId}.json`);
      const districts: District[] = await districtsRes.json();
      progress.push(`Ditemukan ${districts.length} kecamatan`);

      for (const district of districts) {
        const districtName = toTitleCase(district.name);
        
        if (includeVillages) {
          try {
            const villagesRes = await fetchWithRetry(`${API_BASE_URL}/villages/${district.id}.json`);
            const villages: Village[] = await villagesRes.json();
            
            for (const village of villages) {
              locationBatch.push({
                province_code: provinceId,
                province_name: provinceName,
                city_code: cityId,
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
          locationBatch.push({
            province_code: provinceId,
            province_name: provinceName,
            city_code: cityId,
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
      }

      stats.cities = 1;
      progress.push(`Menyimpan ${locationBatch.length} lokasi...`);

      // Delete old district-only records for this city before inserting village-level data
      if (includeVillages && locationBatch.length > 0) {
        const { error: delError } = await supabase
          .from('locations')
          .delete()
          .eq('province_code', provinceId)
          .eq('city_code', cityId)
          .is('subdistrict_code', null);
        
        if (delError) {
          console.error('Error deleting old district records:', delError);
        } else {
          progress.push('Menghapus data kecamatan lama (tanpa kelurahan)...');
        }

        // Also delete records with empty subdistrict_code
        await supabase
          .from('locations')
          .delete()
          .eq('province_code', provinceId)
          .eq('city_code', cityId)
          .eq('subdistrict_code', '');
      }

      // Batch insert in chunks of 300 (smaller for stability)
      for (let i = 0; i < locationBatch.length; i += 300) {
        const chunk = locationBatch.slice(i, i + 300);
        const { error } = await supabase.from('locations').insert(chunk);
        if (error) {
          // Try upsert as fallback
          const { error: upsertError } = await supabase.from('locations').upsert(chunk, {
            onConflict: 'province_code,city_code,district_code,subdistrict_code',
          });
          if (upsertError) {
            console.error(`Batch insert error:`, upsertError);
            stats.errors++;
          } else {
            stats.inserted += chunk.length;
          }
        } else {
          stats.inserted += chunk.length;
        }
      }

      progress.push(`Selesai! ${stats.inserted} lokasi disinkronkan`);

      return new Response(JSON.stringify({ 
        success: true, 
        stats, 
        mode, 
        city: cleanCityName,
        province: provinceName,
        progress,
        changes: [{ type: 'city', name: cleanCityName, action: 'synced' }],
        totalChanges: stats.inserted
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mode: single-province - process ONE province (districts only, NO villages to avoid memory issues)
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

      // If villages requested, return list of cities for user to sync individually
      if (includeVillages) {
        const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
        const cities: City[] = await citiesRes.json();
        
        const cityList = cities.map(c => ({
          id: c.id,
          name: toTitleCase(c.name),
          type: c.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN'
        }));

        return new Response(JSON.stringify({ 
          success: true, 
          mode: 'single-province',
          requiresCitySync: true,
          message: 'Untuk menyinkronkan kelurahan/desa, silakan pilih kota satu per satu untuk menghindari timeout.',
          province: provinceName,
          provinceId: province.id,
          cities: cityList,
          cityCount: cities.length,
          progress: [`${provinceName} memiliki ${cities.length} kota/kabupaten. Sync satu per satu untuk kelurahan.`]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process districts only (no villages)
      const citiesRes = await fetchWithRetry(`${API_BASE_URL}/regencies/${province.id}.json`);
      const cities: City[] = await citiesRes.json();
      progress.push(`Ditemukan ${cities.length} kota/kabupaten`);

      const locationBatch: any[] = [];

      for (const city of cities) {
        const cityName = toTitleCase(city.name);
        const cityType = city.name.toUpperCase().startsWith('KOTA ') ? 'KOTA' : 'KABUPATEN';
        const cleanCityName = cityName.replace(/^Kota |^Kabupaten /i, '');

        try {
          const districtsRes = await fetchWithRetry(`${API_BASE_URL}/districts/${city.id}.json`);
          const districts: District[] = await districtsRes.json();

          for (const district of districts) {
            const districtName = toTitleCase(district.name);
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
            stats.districts++;
          }
          changes.push({ type: 'city', name: cleanCityName, action: 'synced' });
        } catch (e) {
          console.error(`Error fetching districts for ${cityName}:`, e);
          stats.errors++;
        }
        stats.cities++;
      }

      progress.push(`Menyimpan ${locationBatch.length} kecamatan ke database...`);

      // Batch insert in chunks of 300
      for (let i = 0; i < locationBatch.length; i += 300) {
        const chunk = locationBatch.slice(i, i + 300);
        const { error } = await supabase.from('locations').upsert(chunk, {
          onConflict: 'province_code,city_code,district_code,subdistrict_code',
        });
        if (error) {
          console.error(`Batch insert error:`, error);
          stats.errors++;
        } else {
          stats.inserted += chunk.length;
        }
      }

      stats.provinces = 1;
      progress.push(`Selesai! ${stats.inserted} kecamatan disinkronkan`);

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

    // Mode: districts - process provinces in batches (2 at a time for stability)
    if (mode === 'districts') {
      const { data: existingProvinces } = await supabase
        .from('locations')
        .select('province_code')
        .not('district_code', 'is', null)
        .not('district_code', 'eq', '');
      
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

      // Process only 2 provinces at a time to avoid timeout
      const limitedProvinces = unprocessedProvinces.slice(0, 2);
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

          // Batch insert in chunks of 300
          for (let i = 0; i < locationBatch.length; i += 300) {
            const chunk = locationBatch.slice(i, i + 300);
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
