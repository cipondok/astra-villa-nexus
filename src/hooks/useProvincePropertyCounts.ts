import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProvinceCount {
  province: string;
  count: number;
}

// Province name normalization: maps raw state values → display names
const normalizeProvinceName = (state: string): string => {
  const s = state.trim().toLowerCase();
  const map: Record<string, string> = {
    'aceh': 'Aceh',
    'sumatera utara': 'Sumatera Utara', 'north sumatra': 'Sumatera Utara',
    'sumatera barat': 'Sumatera Barat', 'west sumatra': 'Sumatera Barat',
    'riau': 'Riau',
    'kepulauan riau': 'Kepulauan Riau', 'riau islands': 'Kepulauan Riau',
    'jambi': 'Jambi',
    'sumatera selatan': 'Sumatera Selatan', 'south sumatra': 'Sumatera Selatan',
    'bengkulu': 'Bengkulu',
    'kepulauan bangka belitung': 'Bangka Belitung', 'bangka belitung': 'Bangka Belitung',
    'lampung': 'Lampung',
    'banten': 'Banten',
    'dki jakarta': 'DKI Jakarta', 'jakarta': 'DKI Jakarta',
    'jawa barat': 'Jawa Barat', 'west java': 'Jawa Barat',
    'jawa tengah': 'Jawa Tengah', 'central java': 'Jawa Tengah',
    'di yogyakarta': 'Yogyakarta', 'diy yogyakarta': 'Yogyakarta', 'yogyakarta': 'Yogyakarta', 'yogya': 'Yogyakarta', 'jogja': 'Yogyakarta',
    'jawa timur': 'Jawa Timur', 'east java': 'Jawa Timur',
    'kalimantan barat': 'Kalimantan Barat', 'west kalimantan': 'Kalimantan Barat',
    'kalimantan tengah': 'Kalimantan Tengah', 'central kalimantan': 'Kalimantan Tengah',
    'kalimantan selatan': 'Kalimantan Selatan', 'south kalimantan': 'Kalimantan Selatan',
    'kalimantan timur': 'Kalimantan Timur', 'east kalimantan': 'Kalimantan Timur',
    'kalimantan utara': 'Kalimantan Utara', 'north kalimantan': 'Kalimantan Utara',
    'sulawesi utara': 'Sulawesi Utara', 'north sulawesi': 'Sulawesi Utara',
    'gorontalo': 'Gorontalo',
    'sulawesi tengah': 'Sulawesi Tengah', 'central sulawesi': 'Sulawesi Tengah',
    'sulawesi barat': 'Sulawesi Barat', 'west sulawesi': 'Sulawesi Barat',
    'sulawesi selatan': 'Sulawesi Selatan', 'south sulawesi': 'Sulawesi Selatan',
    'sulawesi tenggara': 'Sulawesi Tenggara', 'southeast sulawesi': 'Sulawesi Tenggara',
    'bali': 'Bali',
    'nusa tenggara barat': 'Nusa Tenggara Barat', 'west nusa tenggara': 'Nusa Tenggara Barat', 'ntb': 'Nusa Tenggara Barat',
    'nusa tenggara timur': 'Nusa Tenggara Timur', 'east nusa tenggara': 'Nusa Tenggara Timur', 'ntt': 'Nusa Tenggara Timur',
    'maluku': 'Maluku',
    'maluku utara': 'Maluku Utara', 'north maluku': 'Maluku Utara',
    'papua barat': 'Papua Barat', 'west papua': 'Papua Barat',
    'papua': 'Papua',
    'papua tengah': 'Papua Tengah',
    'papua pegunungan': 'Papua Pegunungan',
    'papua selatan': 'Papua Selatan',
    'papua barat daya': 'Papua Barat Daya',
  };
  return map[s] || state.trim();
};

export const useProvincePropertyCounts = () => {
  return useQuery({
    queryKey: ['province-property-counts-v2'],
    queryFn: async (): Promise<Record<string, number>> => {
      // Try RPC first
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_province_property_counts');
        if (!rpcError && rpcData && rpcData.length > 0) {
          const counts: Record<string, number> = {};
          rpcData.forEach((row: { province: string; property_count: number }) => {
            if (row.province) {
              counts[row.province] = Number(row.property_count);
            }
          });
          return counts;
        }
      } catch (e) {
        console.warn('RPC failed, falling back to direct query', e);
      }

      // Fallback: paginated direct query to bypass 1000-row limit
      const counts: Record<string, number> = {};
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('properties')
          .select('state')
          .eq('status', 'active')
          .eq('approval_status', 'approved')
          .not('state', 'is', null)
          .neq('state', '')
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        data.forEach((row) => {
          if (row.state) {
            const province = normalizeProvinceName(row.state);
            counts[province] = (counts[province] || 0) + 1;
          }
        });

        hasMore = data.length === pageSize;
        from += pageSize;
      }

      return counts;
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useTotalPropertyCount = () => {
  return useQuery({
    queryKey: ['total-property-count-v2'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1 * 60 * 1000,
  });
};
