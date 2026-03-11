import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSmartCityScan = () =>
  useMutation({
    mutationFn: async (pipeline: string) => {
      const { data, error } = await supabase.functions.invoke('smart-city-engine', {
        body: { pipeline },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
  });

export const useSmartCityInfrastructure = () =>
  useQuery({
    queryKey: ['smart-city-infra'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_city_infrastructure')
        .select('*')
        .order('impact_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSmartCityDistricts = () =>
  useQuery({
    queryKey: ['smart-city-districts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_city_districts')
        .select('*')
        .order('capital_appreciation_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSmartCityDemographics = () =>
  useQuery({
    queryKey: ['smart-city-demographics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_city_demographics')
        .select('*')
        .order('housing_demand_growth', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSmartCityPolicies = () =>
  useQuery({
    queryKey: ['smart-city-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_city_policies')
        .select('*')
        .order('growth_acceleration_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSmartCityOpportunities = () =>
  useQuery({
    queryKey: ['smart-city-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_city_opportunities')
        .select('*')
        .order('investment_priority', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
