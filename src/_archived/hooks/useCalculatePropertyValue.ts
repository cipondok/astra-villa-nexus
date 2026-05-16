import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalculatedValuation {
  estimated_value: number;
  confidence_score: number;
  market_trend: 'rising' | 'stable' | 'declining';
  comparables_count: number;
  price_range_low: number;
  price_range_high: number;
  avg_price_per_sqm: number;
  comparable_properties: {
    id: string;
    title: string;
    price: number;
    area: number;
    price_per_sqm: number;
    city: string;
    similarity: number;
  }[];
  valuation_method: string;
  property_price: number;
  property_area: number;
}

export function useCalculatePropertyValue(propertyId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (propId: string): Promise<CalculatedValuation> => {
      const { data, error } = await supabase.functions.invoke('calculate-property-value', {
        body: { property_id: propId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Property valuation calculated');
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ['property-valuation-latest', propertyId] });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Valuation failed');
    },
  });

  // Fetch latest stored valuation
  const latestValuation = useQuery({
    queryKey: ['property-valuation-latest', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_valuations')
        .select('*')
        .eq('property_id', propertyId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    calculate: mutation.mutate,
    isCalculating: mutation.isPending,
    result: mutation.data,
    latestValuation: latestValuation.data,
    isLoadingLatest: latestValuation.isLoading,
  };
}
