
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BaseProperty } from '@/types/property';

interface SearchFilters {
  query?: string;
  propertyType?: string;
  listingType?: string;
  priceRange?: [number, number];
  bedrooms?: string;
  bathrooms?: string;
  areaRange?: [number, number];
  location?: string;
  state?: string;
  city?: string;
  developmentStatus?: string;
  features?: string[];
  amenities?: string[];
  furnishing?: string;
  parking?: string;
  floorLevel?: string;
  buildingAge?: string;
  certification?: string[];
  has3D?: boolean;
  hasVirtualTour?: boolean;
  sortBy?: string;
}

export const usePropertySearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const buildQuery = useCallback((filters: SearchFilters) => {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');

    // Text search
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,location.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    // Property type filter
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }

    // Listing type filter
    if (filters.listingType && filters.listingType !== 'all') {
      query = query.eq('listing_type', filters.listingType);
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (minPrice > 0) {
        query = query.gte('price', minPrice);
      }
      if (maxPrice < 20000000000) {
        query = query.lte('price', maxPrice);
      }
    }

    // Bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      query = query.gte('bedrooms', parseInt(filters.bedrooms));
    }

    // Bathrooms filter
    if (filters.bathrooms && filters.bathrooms !== 'all') {
      query = query.gte('bathrooms', parseInt(filters.bathrooms));
    }

    // Area range filter
    if (filters.areaRange && filters.areaRange.length === 2) {
      const [minArea, maxArea] = filters.areaRange;
      if (minArea > 0) {
        query = query.gte('area_sqm', minArea);
      }
      if (maxArea < 2000) {
        query = query.lte('area_sqm', maxArea);
      }
    }

    // Location filters
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    // Development status filter
    if (filters.developmentStatus && filters.developmentStatus !== 'all') {
      query = query.eq('development_status', filters.developmentStatus);
    }

    // Special features
    if (filters.has3D) {
      query = query.not('three_d_model_url', 'is', null);
    }

    if (filters.hasVirtualTour) {
      query = query.not('virtual_tour_url', 'is', null);
    }

    // Property features filter (using JSONB contains)
    if (filters.features && filters.features.length > 0) {
      filters.features.forEach(feature => {
        query = query.contains('property_features', { [feature]: true });
      });
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low_high':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high_low':
        query = query.order('price', { ascending: false });
        break;
      case 'area_large_small':
        query = query.order('area_sqm', { ascending: false });
        break;
      case 'area_small_large':
        query = query.order('area_sqm', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    return query;
  }, []);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['property-search', filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BaseProperty[];
    },
    enabled: Object.keys(filters).length > 0 || searchQuery.length > 0,
  });

  const searchProperties = useCallback((searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    setSearchQuery(searchFilters.query || '');
  }, []);

  const clearSearch = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    
    // Additional client-side filtering for complex features
    return searchResults.filter(property => {
      // Furnishing filter (if stored in property_features)
      if (filters.furnishing && filters.furnishing !== 'all') {
        const furnishing = property.property_features?.furnishing;
        if (furnishing !== filters.furnishing) return false;
      }

      // Parking filter (if stored in property_features)
      if (filters.parking && filters.parking !== 'all') {
        const parking = property.property_features?.parking;
        if (filters.parking === 'none' && parking) return false;
        if (filters.parking === 'one' && parking !== 'one') return false;
        if (filters.parking === 'multiple' && !['two', 'multiple'].includes(parking)) return false;
      }

      // Floor level filter (if stored in property_features)
      if (filters.floorLevel && filters.floorLevel !== 'all') {
        const floorLevel = property.property_features?.floorLevel;
        if (floorLevel !== filters.floorLevel) return false;
      }

      // Building age filter (if stored in property_features)
      if (filters.buildingAge && filters.buildingAge !== 'all') {
        const buildingAge = property.property_features?.buildingAge;
        if (buildingAge !== filters.buildingAge) return false;
      }

      // Amenities filter (if stored in property_features)
      if (filters.amenities && filters.amenities.length > 0) {
        const propertyAmenities = property.property_features?.amenities || [];
        const hasRequiredAmenities = filters.amenities.every(amenity => 
          propertyAmenities.includes(amenity)
        );
        if (!hasRequiredAmenities) return false;
      }

      // Certifications filter (if stored in property_features)
      if (filters.certification && filters.certification.length > 0) {
        const propertyCertifications = property.property_features?.certifications || [];
        const hasRequiredCertifications = filters.certification.every(cert => 
          propertyCertifications.includes(cert)
        );
        if (!hasRequiredCertifications) return false;
      }

      return true;
    });
  }, [searchResults, filters]);

  return {
    searchResults: filteredResults,
    isLoading,
    error,
    searchProperties,
    clearSearch,
    filters,
    refetch
  };
};
