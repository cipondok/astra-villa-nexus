import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeExchange(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('liquidity-exchange-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useLiquidityExchangeDashboard() {
  return useQuery({
    queryKey: ['liquidity-exchange-dashboard'],
    queryFn: () => invokeExchange('dashboard'),
    refetchInterval: 15_000,
  });
}

export function useOwnershipUnits(userId?: string) {
  return useQuery({
    queryKey: ['ownership-units', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_ownership_units' as any)
        .select('*')
        .eq('current_owner_user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function usePropertyOrderBook(propertyId?: string) {
  return useQuery({
    queryKey: ['property-order-book', propertyId],
    queryFn: async () => {
      const [sells, buys] = await Promise.all([
        supabase.from('liquidity_sell_orders' as any).select('*').eq('property_id', propertyId!).eq('order_status', 'open').order('price_per_percent', { ascending: true }),
        supabase.from('liquidity_buy_orders' as any).select('*').eq('target_property_id', propertyId!).eq('order_status', 'open').order('max_price_per_percent', { ascending: false }),
      ]);
      return { sellOrders: sells.data || [], buyOrders: buys.data || [] };
    },
    enabled: !!propertyId,
    refetchInterval: 10_000,
  });
}

export function useTradeHistory(propertyId?: string) {
  return useQuery({
    queryKey: ['trade-history', propertyId],
    queryFn: async () => {
      let q = supabase.from('liquidity_trade_executions' as any).select('*').order('executed_at', { ascending: false }).limit(20);
      if (propertyId) q = q.eq('property_id', propertyId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePlaceSellOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { unit_id: string; asking_price_total: number }) => invokeExchange('place_sell_order', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ownership-units'] });
      qc.invalidateQueries({ queryKey: ['property-order-book'] });
      qc.invalidateQueries({ queryKey: ['liquidity-exchange-dashboard'] });
    },
  });
}

export function usePlaceBuyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { target_property_id: string; desired_percentage: number; max_price_per_percent: number }) => invokeExchange('place_buy_order', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property-order-book'] });
      qc.invalidateQueries({ queryKey: ['liquidity-exchange-dashboard'] });
    },
  });
}

export function useMatchOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { property_id: string }) => invokeExchange('match_orders', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property-order-book'] });
      qc.invalidateQueries({ queryKey: ['trade-history'] });
      qc.invalidateQueries({ queryKey: ['ownership-units'] });
      qc.invalidateQueries({ queryKey: ['liquidity-exchange-dashboard'] });
    },
  });
}

export function useCancelSellOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { order_id: string }) => invokeExchange('cancel_sell_order', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ownership-units'] });
      qc.invalidateQueries({ queryKey: ['property-order-book'] });
    },
  });
}
