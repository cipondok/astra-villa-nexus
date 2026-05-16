import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FilterOption {
  id: string;
  filter_name: string;
  filter_category: string;
  filter_type: string;
  filter_options?: string[];
  listing_type: 'sale' | 'rent';
  is_active: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FilterCategory {
  id: string;
  name: string;
  enabled: boolean;
  options: FilterOption[];
}

const QUERY_KEY = ['property-filter-configurations'] as const;

function categorizeFilters(data: any[]): FilterCategory[] {
  return data.reduce((acc: FilterCategory[], filter: any) => {
    const existing = acc.find(cat => cat.name === filter.filter_category);
    const option: FilterOption = {
      id: filter.id,
      filter_name: filter.filter_name,
      filter_category: filter.filter_category,
      filter_type: filter.filter_type,
      filter_options: filter.filter_options,
      listing_type: filter.listing_type,
      is_active: filter.is_active,
      display_order: filter.display_order,
      created_at: filter.created_at,
      updated_at: filter.updated_at,
    };

    if (existing) {
      existing.options.push(option);
    } else {
      acc.push({
        id: filter.filter_category,
        name: filter.filter_category,
        enabled: true,
        options: [option],
      });
    }
    return acc;
  }, []);
}

export const usePropertyFilters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: filters = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_filter_configurations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return categorizeFilters(data ?? []);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const addFilter = async (filter: Omit<FilterOption, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('property_filter_configurations')
        .insert({
          filter_name: filter.filter_name,
          filter_category: filter.filter_category,
          filter_type: filter.filter_type,
          filter_options: filter.filter_options,
          listing_type: filter.listing_type,
          is_active: filter.is_active,
          display_order: filter.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      invalidate();
      toast({ title: "Success", description: "Filter added successfully" });
      return data;
    } catch (error) {
      console.error('Error adding filter:', error);
      toast({ title: "Error", description: "Failed to add filter", variant: "destructive" });
      throw error;
    }
  };

  const updateFilter = async (id: string, updates: Partial<FilterOption>) => {
    try {
      const { data, error } = await supabase
        .from('property_filter_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      invalidate();
      toast({ title: "Success", description: "Filter updated successfully" });
      return data;
    } catch (error) {
      console.error('Error updating filter:', error);
      toast({ title: "Error", description: "Failed to update filter", variant: "destructive" });
      throw error;
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('property_filter_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      invalidate();
      toast({ title: "Success", description: "Filter deleted successfully" });
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({ title: "Error", description: "Failed to delete filter", variant: "destructive" });
      throw error;
    }
  };

  const getFiltersByCategory = useCallback((category: string): FilterOption[] => {
    return filters.find(cat => cat.name === category)?.options || [];
  }, [filters]);

  const getPropertyTypes = useCallback(() => getFiltersByCategory('search'), [getFiltersByCategory]);
  const getAmenities = useCallback(() => getFiltersByCategory('facilities'), [getFiltersByCategory]);
  const getFacilities = useCallback(() => getFiltersByCategory('specifications'), [getFiltersByCategory]);
  const getLocations = useCallback(() => getFiltersByCategory('location'), [getFiltersByCategory]);
  const getPriceRanges = useCallback(() => getFiltersByCategory('price'), [getFiltersByCategory]);

  return {
    filters,
    loading,
    fetchFilters: invalidate,
    addFilter,
    updateFilter,
    deleteFilter,
    getFiltersByCategory,
    getPropertyTypes,
    getAmenities,
    getFacilities,
    getLocations,
    getPriceRanges,
  };
};
