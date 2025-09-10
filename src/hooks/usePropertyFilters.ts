import { useState, useEffect } from 'react';
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

export const usePropertyFilters = () => {
  const [filters, setFilters] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_filter_configurations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Group filters by category
      const categorizedFilters = data.reduce((acc: FilterCategory[], filter: any) => {
        const existingCategory = acc.find(cat => cat.name === filter.filter_category);
        
        if (existingCategory) {
          existingCategory.options.push({
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
          });
        } else {
          acc.push({
            id: filter.filter_category,
            name: filter.filter_category,
            enabled: true,
            options: [{
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
            }]
          });
        }
        return acc;
      }, []);

      setFilters(categorizedFilters);
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast({
        title: "Error",
        description: "Failed to load property filters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      await fetchFilters();
      toast({
        title: "Success",
        description: "Filter added successfully",
      });

      return data;
    } catch (error) {
      console.error('Error adding filter:', error);
      toast({
        title: "Error",
        description: "Failed to add filter",
        variant: "destructive",
      });
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

      await fetchFilters();
      toast({
        title: "Success",
        description: "Filter updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating filter:', error);
      toast({
        title: "Error",
        description: "Failed to update filter",
        variant: "destructive",
      });
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

      await fetchFilters();
      toast({
        title: "Success",
        description: "Filter deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getFiltersByCategory = (category: string): FilterOption[] => {
    const categoryData = filters.find(cat => cat.name === category);
    return categoryData?.options || [];
  };

  const getPropertyTypes = () => getFiltersByCategory('search');
  const getAmenities = () => getFiltersByCategory('facilities');
  const getFacilities = () => getFiltersByCategory('specifications');
  const getLocations = () => getFiltersByCategory('location');
  const getPriceRanges = () => getFiltersByCategory('price');

  useEffect(() => {
    fetchFilters();
  }, []);

  return {
    filters,
    loading,
    fetchFilters,
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