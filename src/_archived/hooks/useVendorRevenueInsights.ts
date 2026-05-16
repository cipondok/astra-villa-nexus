import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorRevenueInsight {
  vendor_id: string;
  revenue_potential_score: number;
  speed_score: number;
  acceptance_score: number;
  reputation_score: number;
  conversion_score: number;
  demand_alignment_score: number;
  recommended_price_adjustment: string;
  lead_priority_tier: string;
  upsell_opportunities: string[];
  category_expansion_suggestions: string[];
}

/** Fetch revenue optimization insights for a single vendor */
export function useVendorRevenueInsights(vendorId?: string) {
  return useQuery({
    queryKey: ['vendor-revenue-insights', vendorId],
    queryFn: async (): Promise<VendorRevenueInsight | null> => {
      if (!vendorId) return null;
      const { data, error } = await supabase.functions.invoke('vendor-revenue-optimizer', {
        body: { vendor_id: vendorId, mode: 'score' },
      });
      if (error) throw error;
      return data as VendorRevenueInsight;
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}

/** Trigger batch vendor revenue scoring */
export function useBatchVendorRevenueScoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('vendor-revenue-optimizer', {
        body: { mode: 'batch' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['vendor-revenue-metrics'] });
      qc.invalidateQueries({ queryKey: ['vendor-revenue-insights'] });
      toast.success(`Scored ${data?.scored ?? 0} vendors`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
