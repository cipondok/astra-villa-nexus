import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useLocationData = () => {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');

  const { data: provincesData = [] } = useQuery({
    queryKey: ['price-estimator-provinces'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_distinct_provinces');
      if (error) throw error;
      return (data || [])
        .map((d: any) => ({ code: d.province_code, name: d.province_name }))
        .filter((p: any) => p.name)
        .sort((a: any, b: any) => a.name.localeCompare(b.name, 'id'));
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: citiesData = [] } = useQuery({
    queryKey: ['price-estimator-cities', selectedProvinceCode],
    queryFn: async () => {
      if (!selectedProvinceCode) return [];
      const { data, error } = await supabase.rpc('get_distinct_cities', {
        p_province_code: selectedProvinceCode,
      });
      if (error) throw error;
      return (data || [])
        .map((d: any) => d.city_name)
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b, 'id'));
    },
    enabled: !!selectedProvinceCode,
    staleTime: 10 * 60 * 1000,
  });

  const provinces = provincesData.map((p: any) => p.name) as string[];
  const provinceMap = Object.fromEntries(provincesData.map((p: any) => [p.name, p.code]));

  const loadCities = useCallback((provinceName: string) => {
    const code = provinceMap[provinceName];
    setSelectedProvinceCode(code || '');
  }, [provinceMap]);

  return {
    provinces,
    cities: citiesData as string[],
    loadCities,
  };
};
