import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

// ── Types ──

export interface GPIIndexDefinition {
  id: string;
  index_code: string;
  index_name: string;
  index_tier: 'flagship' | 'regional' | 'city' | 'luxury' | 'rental_yield' | 'custom';
  description: string | null;
  base_value: number;
  w_liquidity: number;
  w_transaction_velocity: number;
  w_capital_inflow: number;
  w_price_appreciation: number;
  rebalance_frequency: string;
  is_active: boolean;
}

export interface GPIIndexValue {
  id: string;
  index_id: string;
  value_date: string;
  index_value: number;
  daily_change_pct: number;
  weekly_change_pct: number;
  monthly_change_pct: number;
  ytd_change_pct: number;
  volatility_30d: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  constituents_count: number;
  total_market_value_usd: number;
}

export interface GPIConstituent {
  id: string;
  index_id: string;
  city: string;
  district: string | null;
  liquidity_score: number;
  transaction_velocity_score: number;
  capital_inflow_score: number;
  price_appreciation_score: number;
  composite_score: number;
  weight_in_index: number;
  market_value_usd: number;
  is_active: boolean;
}

export interface GPIIndexSummary {
  index_code: string;
  index_name: string;
  tier: string;
  current_value: number;
  daily_change: number;
  ytd_change: number;
  volatility: number;
  sharpe: number;
  constituents: number;
}

export interface GPIDashboard {
  summary: {
    total_indexes: number;
    flagship_value: number;
    flagship_ytd: number;
    total_constituents: number;
    total_market_value_usd: number;
    institutional_subscribers: number;
    last_rebalance: string;
  };
  indexes: GPIIndexSummary[];
  index_definitions: GPIIndexDefinition[];
  latest_values: GPIIndexValue[];
  top_constituents: GPIConstituent[];
  recent_rebalances: any[];
  institutional_access: any[];
}

// ── Hooks ──

export function useGPIDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gpi-dashboard'],
    queryFn: async (): Promise<GPIDashboard> => {
      const { data, error } = await supabase.functions.invoke('global-property-index', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useGPIIndexValues(indexCode?: string, enabled = true) {
  return useQuery({
    queryKey: ['gpi-index-values', indexCode],
    queryFn: async (): Promise<GPIIndexValue[]> => {
      let query = supabase
        .from('gpi_index_values')
        .select('*')
        .order('value_date', { ascending: false })
        .limit(90);

      if (indexCode) {
        const { data: def } = await supabase
          .from('gpi_index_definitions')
          .select('id')
          .eq('index_code', indexCode)
          .single();
        if (def) query = query.eq('index_id', def.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as GPIIndexValue[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useGPIConstituents(indexCode?: string, enabled = true) {
  return useQuery({
    queryKey: ['gpi-constituents', indexCode],
    queryFn: async (): Promise<GPIConstituent[]> => {
      let query = supabase
        .from('gpi_index_constituents')
        .select('*')
        .eq('is_active', true)
        .order('composite_score', { ascending: false })
        .limit(30);

      if (indexCode) {
        const { data: def } = await supabase
          .from('gpi_index_definitions')
          .select('id')
          .eq('index_code', indexCode)
          .single();
        if (def) query = query.eq('index_id', def.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as GPIConstituent[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useGPIDefinitions(enabled = true) {
  return useQuery({
    queryKey: ['gpi-definitions'],
    queryFn: async (): Promise<GPIIndexDefinition[]> => {
      const { data, error } = await supabase
        .from('gpi_index_definitions')
        .select('*')
        .eq('is_active', true)
        .order('index_tier');
      if (error) throw error;
      return (data ?? []) as unknown as GPIIndexDefinition[];
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useTriggerGPIEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('global-property-index', {
        body: params,
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['gpi-dashboard'] });
      qc.invalidateQueries({ queryKey: ['gpi-index-values'] });
      qc.invalidateQueries({ queryKey: ['gpi-constituents'] });
      toast.success(`GPI engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'GPI engine failed');
    },
  });
}
