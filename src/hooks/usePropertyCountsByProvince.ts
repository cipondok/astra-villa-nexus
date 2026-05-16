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
  villa: 'bg-chart-2/10 text-chart-2',
  house: 'bg-chart-1/10 text-chart-1',
  apartment: 'bg-chart-4/10 text-chart-4',
  land: 'bg-chart-3/10 text-chart-3',
  commercial: 'bg-destructive/10 text-destructive',
  townhouse: 'bg-chart-5/10 text-chart-5',
};
