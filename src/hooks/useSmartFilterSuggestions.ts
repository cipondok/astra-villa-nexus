import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  filters: Partial<PropertyFilters>;
  usageCount: number;
  popularity: number;
}

export const useSmartFilterSuggestions = (
  currentFilters: PropertyFilters
) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          'get-smart-filter-suggestions',
          {
            body: {
              location: currentFilters.location,
              listingType: currentFilters.listingType,
              propertyTypes: currentFilters.propertyTypes,
            },
          }
        );

        if (error) throw error;

        setSuggestions(data?.suggestions || []);
      } catch (error) {
        console.error('Error fetching smart suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to avoid too many requests
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentFilters.location, currentFilters.listingType, currentFilters.propertyTypes]);

  const trackFilterUsage = async (filters: PropertyFilters) => {
    try {
      // Check if similar filter combination exists
      const { data: existing } = await supabase
        .from('filter_usage')
        .select('*')
        .eq('location', filters.location || null)
        .eq('listing_type', filters.listingType || null)
        .eq('bedrooms', filters.bedrooms ? parseInt(filters.bedrooms) : null)
        .eq('bathrooms', filters.bathrooms ? parseInt(filters.bathrooms) : null)
        .eq('price_min', filters.priceRange[0])
        .eq('price_max', filters.priceRange[1])
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('filter_usage')
          .update({
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new record
        await supabase.from('filter_usage').insert({
          location: filters.location !== 'all' ? filters.location : null,
          property_types: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
          listing_type: filters.listingType !== 'all' ? filters.listingType : null,
          price_min: filters.priceRange[0],
          price_max: filters.priceRange[1],
          bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : null,
          bathrooms: filters.bathrooms ? parseInt(filters.bathrooms) : null,
          search_query: filters.searchQuery || null,
        });
      }
    } catch (error) {
      console.error('Error tracking filter usage:', error);
    }
  };

  return {
    suggestions,
    isLoading,
    trackFilterUsage,
  };
};
