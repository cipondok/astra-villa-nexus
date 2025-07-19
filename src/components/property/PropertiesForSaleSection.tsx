import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyGridView from "@/components/search/PropertyGridView";
import { BaseProperty } from "@/types/property";

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const { data: saleProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-sale'],
    queryFn: async () => {
      console.log('Fetching properties for sale...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
          .eq('listing_type', 'sale')
          .in('development_status', ['completed', 'ready'])
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Properties for sale query error:', error);
          return [];
        }

        console.log('Properties for sale loaded:', data?.length || 0);
        // Transform data to match BaseProperty interface
        const transformedData = data?.map(property => ({
          ...property,
          listing_type: property.listing_type as "sale" | "rent" | "lease",
          image_urls: property.images || []
        })) || [];
        return transformedData;
        
      } catch (err) {
        console.error('Properties for sale fetch error:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <section className="professional-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 gradient-text">
            Properties for Sale
          </h2>
          <p className="text-muted-foreground">
            Find your dream home to purchase
          </p>
        </div>
        <div className="card-grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (saleProperties.length === 0) {
    return (
      <section className="professional-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 gradient-text">
            Properties for Sale
          </h2>
          <p className="text-muted-foreground">
            Find your dream home to purchase
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No properties for sale available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="professional-card">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2 gradient-text">
          Properties for Sale
        </h2>
        <p className="text-muted-foreground">
          Find your dream home to purchase
        </p>
      </div>
      
      <PropertyGridView
        properties={saleProperties}
        onPropertyClick={onPropertyClick}
        onView3D={onPropertyClick}
        onSave={(property) => console.log('Save property:', property.id)}
        onShare={(property) => console.log('Share property:', property.id)}
        onContact={(property) => console.log('Contact for property:', property.id)}
      />
    </section>
  );
};

export default PropertiesForSaleSection;