import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PropertyFeature {
  key: string;
  labelEn: string;
  labelId: string;
  icon: string;
  applicableFor: ('sale' | 'rent' | 'lease')[];
  category: 'basic' | 'amenity' | 'security' | 'environment' | 'accessibility';
}

export const usePropertyFeatures = (listingType: 'sale' | 'rent' | 'lease') => {
  return useQuery({
    queryKey: ['property-features', listingType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_filter_configurations')
        .select('*')
        .eq('filter_category', 'features')
        .eq('listing_type', listingType)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Transform database data to match our feature interface
      const features: PropertyFeature[] = (data || []).map(item => {
        // Parse filter_options to get feature details
        const options = item.filter_options as any;
        
        return {
          key: item.filter_name,
          labelEn: options?.labelEn || item.filter_name,
          labelId: options?.labelId || item.filter_name,
          icon: options?.icon || '🏠',
          applicableFor: [listingType], // Current listing type
          category: (options?.category || 'basic') as PropertyFeature['category']
        };
      });

      // Group features by category
      const grouped = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
          acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
      }, {} as Record<string, PropertyFeature[]>);

      return { features, grouped };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Auto-select features based on property type (now database-driven)
export const getDefaultFeaturesForPropertyType = (
  propertyType: string,
  listingType: 'sale' | 'rent' | 'lease',
  allFeatures: PropertyFeature[]
): string[] => {
  const defaults: Record<string, string[]> = {
    apartment: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'nearpublictransport'],
    condo: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'swimmingpool', 'gym'],
    villa: ['airconditioner', 'parking', 'garden', 'swimmingpool', 'security'],
    house: ['airconditioner', 'parking', 'garden'],
    townhouse: ['airconditioner', 'parking', 'security'],
    penthouse: ['airconditioner', 'elevator', 'balcony', 'security', 'cctv', 'parking'],
    studio: ['airconditioner', 'wifi'],
    duplex: ['airconditioner', 'parking'],
    hotel: ['airconditioner', 'wifi', 'elevator', 'security', 'cctv', 'swimmingpool', 'gym'],
    resort: ['airconditioner', 'wifi', 'swimmingpool', 'gym', 'security', 'beachaccess'],
    office: ['airconditioner', 'elevator', 'security', 'cctv', 'parking', 'wifi'],
    virtual_office: ['wifi', 'security'],
    warehouse: ['security', 'cctv', 'parking'],
    retail: ['airconditioner', 'security', 'cctv', 'nearmall', 'parking'],
    shophouse: ['airconditioner', 'parking', 'security'],
    commercial: ['airconditioner', 'parking', 'security', 'cctv'],
    land: []
  };

  // Add rental-specific features
  let defaultKeys = [...(defaults[propertyType] || [])];
  
  if (listingType === 'rent' || listingType === 'lease') {
    defaultKeys = [...defaultKeys, 'wifi', 'furnished'];
  }

  // Filter to only include features that exist in the database
  const availableKeys = allFeatures.map(f => f.key);
  return defaultKeys.filter(key => availableKeys.includes(key));
};
