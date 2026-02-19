import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Province mapping from location/city/state names (supports both Indonesian and English)
const locationToProvince: Record<string, string> = {
  // Bali
  'bali': 'Bali', 'denpasar': 'Bali', 'seminyak': 'Bali', 'ubud': 'Bali', 'kuta': 'Bali', 'sanur': 'Bali', 'canggu': 'Bali',
  // Jakarta
  'jakarta': 'DKI Jakarta', 'dki jakarta': 'DKI Jakarta', 'central jakarta': 'DKI Jakarta', 'south jakarta': 'DKI Jakarta',
  'north jakarta': 'DKI Jakarta', 'west jakarta': 'DKI Jakarta', 'east jakarta': 'DKI Jakarta',
  // Jawa Barat
  'bandung': 'Jawa Barat', 'west java': 'Jawa Barat', 'jawa barat': 'Jawa Barat', 'cimahi': 'Jawa Barat',
  'bogor': 'Jawa Barat', 'bekasi': 'Jawa Barat', 'depok': 'Jawa Barat', 'karawang': 'Jawa Barat', 'cirebon': 'Jawa Barat', 'cikarang': 'Jawa Barat',
  // Jawa Timur
  'surabaya': 'Jawa Timur', 'east java': 'Jawa Timur', 'jawa timur': 'Jawa Timur', 'malang': 'Jawa Timur', 'sidoarjo': 'Jawa Timur',
  // Yogyakarta
  'yogyakarta': 'Yogyakarta', 'yogya': 'Yogyakarta', 'jogja': 'Yogyakarta', 'jogjakarta': 'Yogyakarta', 'diy yogyakarta': 'Yogyakarta',
  // Jawa Tengah
  'semarang': 'Jawa Tengah', 'central java': 'Jawa Tengah', 'jawa tengah': 'Jawa Tengah', 'surakarta': 'Jawa Tengah', 'solo': 'Jawa Tengah',
  // Sumatera
  'medan': 'Sumatera Utara', 'north sumatra': 'Sumatera Utara',
  'padang': 'Sumatera Barat', 'west sumatra': 'Sumatera Barat',
  'palembang': 'Sumatera Selatan', 'south sumatra': 'Sumatera Selatan',
  'pekanbaru': 'Riau', 'riau': 'Riau',
  'lampung': 'Lampung',
  'aceh': 'Aceh',
  // Kalimantan
  'pontianak': 'Kalimantan Barat', 'west kalimantan': 'Kalimantan Barat',
  'balikpapan': 'Kalimantan Timur', 'samarinda': 'Kalimantan Timur', 'east kalimantan': 'Kalimantan Timur',
  'banjarmasin': 'Kalimantan Selatan', 'south kalimantan': 'Kalimantan Selatan',
  'palangkaraya': 'Kalimantan Tengah', 'central kalimantan': 'Kalimantan Tengah',
  'tarakan': 'Kalimantan Utara', 'north kalimantan': 'Kalimantan Utara',
  // Sulawesi
  'makassar': 'Sulawesi Selatan', 'south sulawesi': 'Sulawesi Selatan',
  'manado': 'Sulawesi Utara', 'north sulawesi': 'Sulawesi Utara',
  'palu': 'Sulawesi Tengah', 'central sulawesi': 'Sulawesi Tengah',
  'kendari': 'Sulawesi Tenggara', 'southeast sulawesi': 'Sulawesi Tenggara',
  'gorontalo': 'Gorontalo',
  // Nusa Tenggara
  'lombok': 'Nusa Tenggara Barat', 'mataram': 'Nusa Tenggara Barat', 'west nusa tenggara': 'Nusa Tenggara Barat', 'ntb': 'Nusa Tenggara Barat',
  'kupang': 'Nusa Tenggara Timur', 'east nusa tenggara': 'Nusa Tenggara Timur', 'ntt': 'Nusa Tenggara Timur',
  // Banten
  'tangerang': 'Banten', 'banten': 'Banten', 'serang': 'Banten',
  // Maluku & Papua
  'ambon': 'Maluku', 'maluku': 'Maluku',
  'ternate': 'Maluku Utara', 'north maluku': 'Maluku Utara',
  'jayapura': 'Papua', 'papua': 'Papua',
  'sorong': 'Papua Barat', 'west papua': 'Papua Barat',
};

const getProvinceFromLocation = (location: string, city?: string, state?: string): string => {
  // Check state first (most accurate) - state column often IS the province name
  if (state) {
    const lowerState = state.toLowerCase().trim();
    // Direct province name match (state column often stores province names directly)
    const directMatch = Object.values(locationToProvince).find(
      p => p.toLowerCase() === lowerState
    );
    if (directMatch) return directMatch;
    // Lookup by alias
    if (locationToProvince[lowerState]) {
      return locationToProvince[lowerState];
    }
  }
  
  // Check city
  if (city) {
    const lowerCity = city.toLowerCase().trim();
    if (locationToProvince[lowerCity]) {
      return locationToProvince[lowerCity];
    }
  }
  
  // Check location string parts
  const lowerLocation = location.toLowerCase();
  for (const [key, province] of Object.entries(locationToProvince)) {
    if (lowerLocation.includes(key)) {
      return province;
    }
  }
  return 'Lainnya';
};

export interface ProvinceCount {
  province: string;
  count: number;
}

export const useProvincePropertyCounts = () => {
  return useQuery({
    queryKey: ['province-property-counts'],
    queryFn: async (): Promise<Record<string, number>> => {
      // Use RPC to bypass the 1000-row limit and aggregate server-side
      const { data, error } = await supabase.rpc('get_province_property_counts');

      if (error) throw error;

      // Build a map: province name → count
      // The state column stores province names directly (e.g. "Jawa Barat")
      const counts: Record<string, number> = {};
      (data || []).forEach((row: { province: string; property_count: number }) => {
        if (row.province) {
          // Direct province name (from state column)
          counts[row.province] = Number(row.property_count);
        }
      });

      return counts;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useTotalPropertyCount = () => {
  return useQuery({
    queryKey: ['total-property-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 2 * 60 * 1000,
  });
};
