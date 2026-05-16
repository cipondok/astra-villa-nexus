import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OffMarketDeal {
  property_id: string;
  project_name: string;
  city: string;
  state: string | null;
  property_type: string;
  price: number;
  area_sqm: number;
  price_per_sqm: number;
  estimated_market_price: number;
  undervalue_percent: number;
  investment_score: number;
  demand_heat_score: number;
  deal_score: number;
  construction_phase: string | null;
  completion_percentage: number;
  estimated_completion_date: string | null;
  estimated_completion_value: number | null;
  discount_percentage: number;
  is_pre_launch: boolean;
  is_early_bird: boolean;
  total_units: number | null;
  units_sold: number | null;
  thumbnail_url: string | null;
  deal_quality: string;
}

export interface OffMarketDealsResult {
  deals: OffMarketDeal[];
  total_scanned: number;
  total_qualified: number;
  avg_undervalue: number;
  cities_covered: string[];
  recommendation: string;
  generated_at: string;
}

export interface OffMarketDealsInput {
  city?: string;
  max_budget?: number;
  min_discount?: number;
}

export function useOffMarketDeals() {
  return useMutation({
    mutationFn: async (input: OffMarketDealsInput): Promise<OffMarketDealsResult> => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: { mode: 'off_market_deals', ...input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as OffMarketDealsResult;
    },
    onSuccess: (data) => {
      toast.success(`Ditemukan ${data.deals.length} off-market deals dari ${data.total_scanned} properti`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal memindai off-market deals');
    },
  });
}
