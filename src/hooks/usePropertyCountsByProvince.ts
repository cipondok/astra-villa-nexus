import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProvincePropertyType {
  province: string;
  property_type: string;
  count: number;
}

export const usePropertyCountsByProvince = () => {
  return useQuery({
    queryKey: ['property-counts-by-province'],
    queryFn: async (): Promise<Record<string, Record<string, number>>> => {
      const { data, error } = await supabase.rpc('get_property_counts_by_province');
      if (error) throw error;

      const result: Record<string, Record<string, number>> = {};
      (data || []).forEach((row: any) => {
        if (!result[row.province]) result[row.province] = {};
        result[row.province][row.property_type] = Number(row.count);
      });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: 'Villa',
  house: 'House',
  apartment: 'Apartment',
  land: 'Land',
  commercial: 'Commercial',
  townhouse: 'Townhouse',
};

export const PROPERTY_TYPE_COLORS: Record<string, string> = {
  villa: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  house: 'bg-green-500/10 text-green-700 dark:text-green-400',
  apartment: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  land: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  commercial: 'bg-red-500/10 text-red-700 dark:text-red-400',
  townhouse: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
};
