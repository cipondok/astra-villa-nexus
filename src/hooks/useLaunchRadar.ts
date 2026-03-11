import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLaunchRadarScan = () =>
  useMutation({
    mutationFn: async (pipeline: string) => {
      const { data, error } = await supabase.functions.invoke('launch-radar', {
        body: { pipeline },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
  });

export const useLaunchRadarSignals = () =>
  useQuery({
    queryKey: ['launch-radar-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_radar_developer_signals')
        .select('*')
        .order('launch_probability', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

export const useLaunchRadarAlerts = () =>
  useQuery({
    queryKey: ['launch-radar-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_radar_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

export const useLaunchRadarRisks = () =>
  useQuery({
    queryKey: ['launch-radar-risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_radar_developer_risks')
        .select('*')
        .order('investment_safety_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useLaunchRadarPredictions = () =>
  useQuery({
    queryKey: ['launch-radar-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_radar_price_predictions')
        .select('*')
        .order('early_entry_profit_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

export const useLaunchRadarForecasts = () =>
  useQuery({
    queryKey: ['launch-radar-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launch_radar_demand_forecasts')
        .select('*')
        .order('sales_velocity_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
