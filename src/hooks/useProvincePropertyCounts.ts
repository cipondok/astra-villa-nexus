import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Province mapping from location names
const locationToProvince: Record<string, string> = {
  'bali': 'Bali',
  'jakarta': 'DKI Jakarta',
  'bandung': 'Jawa Barat',
  'cimahi': 'Jawa Barat',
  'bogor': 'Jawa Barat',
  'bekasi': 'Jawa Barat',
  'depok': 'Jawa Barat',
  'karawang': 'Jawa Barat',
  'surabaya': 'Jawa Timur',
  'malang': 'Jawa Timur',
  'yogyakarta': 'Yogyakarta',
  'yogya': 'Yogyakarta',
  'semarang': 'Jawa Tengah',
  'surakarta': 'Jawa Tengah',
  'solo': 'Jawa Tengah',
  'medan': 'Sumatera Utara',
  'makassar': 'Sulawesi Selatan',
  'manado': 'Sulawesi Utara',
  'pontianak': 'Kalimantan Barat',
  'lombok': 'Nusa Tenggara Barat',
  'tangerang': 'Banten',
  'banten': 'Banten',
  'palembang': 'Sumatera Selatan',
  'padang': 'Sumatera Barat',
  'pekanbaru': 'Riau',
  'balikpapan': 'Kalimantan Timur',
  'samarinda': 'Kalimantan Timur',
  'banjarmasin': 'Kalimantan Selatan',
  'aceh': 'Aceh',
  'lampung': 'Lampung',
  'jayapura': 'Papua',
  'ambon': 'Maluku',
};

const getProvinceFromLocation = (location: string): string => {
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
      const { data, error } = await supabase
        .from('properties')
        .select('location');

      if (error) throw error;

      // Aggregate counts by province
      const counts: Record<string, number> = {};
      
      data?.forEach((property) => {
        if (property.location) {
          const province = getProvinceFromLocation(property.location);
          counts[province] = (counts[province] || 0) + 1;
        }
      });

      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTotalPropertyCount = () => {
  return useQuery({
    queryKey: ['total-property-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });
};
