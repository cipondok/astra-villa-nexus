import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeExchange(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('asset-tokenization-exchange', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full exchange dashboard with market cap, order book, yields */
export function usePATEDashboard() {
  return useQuery({
    queryKey: ['pate-dashboard'],
    queryFn: () => invokeExchange('dashboard'),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/** Tokenized assets listing */
export function useTokenizedAssets() {
  return useQuery({
    queryKey: ['pate-tokenized-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pate_tokenized_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Open order book for a specific asset */
export function useOrderBook(assetId: string | undefined) {
  return useQuery({
    queryKey: ['pate-order-book', assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pate_order_book')
        .select('*')
        .eq('asset_id', assetId!)
        .eq('status', 'open')
        .order('price_per_token', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!assetId,
    refetchInterval: 10_000,
  });
}

/** Yield streams for an asset */
export function useYieldStreams(assetId: string | undefined) {
  return useQuery({
    queryKey: ['pate-yield-streams', assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pate_yield_streams')
        .select('*')
        .eq('asset_id', assetId!)
        .order('period_start', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!assetId,
  });
}

/** Financial products */
export function useFinancialProducts() {
  return useQuery({
    queryKey: ['pate-financial-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pate_financial_products')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: tokenize an asset */
export function useTokenizeAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeExchange('tokenize_asset', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pate-tokenized-assets'] }),
  });
}

/** Mutation: place an order */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeExchange('place_order', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pate-order-book'] }),
  });
}

/** Mutation: trigger order matching */
export function useMatchOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { asset_id: string }) => invokeExchange('match_orders', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pate-order-book'] });
      qc.invalidateQueries({ queryKey: ['pate-tokenized-assets'] });
    },
  });
}

/** Mutation: compute and stream yield */
export function useComputeYield() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeExchange('compute_yield', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pate-yield-streams'] }),
  });
}

/** Mutation: custody audit */
export function useCustodyAudit() {
  return useMutation({
    mutationFn: (params: { asset_id: string }) => invokeExchange('custody_audit', params),
  });
}
