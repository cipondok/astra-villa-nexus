import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyGridView from "@/components/search/PropertyGridView";
import { BaseProperty } from "@/types/property";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const { isMobile } = useIsMobile();
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
      <section className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20",
        isMobile ? "p-3" : "p-4 lg:p-6"
      )}>
        <div className={cn(
          "text-center no-space-waste",
          isMobile ? "mb-3" : "mb-4"
        )}>
          <h2 className={cn(
            "font-bold gradient-text",
            isMobile ? "text-lg mb-1" : "text-xl lg:text-2xl mb-2"
          )}>
            Properties for Sale
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm lg:text-base"
          )}>
            Find your dream home to purchase
          </p>
        </div>
        <div className="responsive-grid-properties">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <div className={cn(isMobile ? "p-2 space-y-2" : "p-4 space-y-3")}>
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
      <section className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20",
        isMobile ? "p-3" : "p-4 lg:p-6"
      )}>
        <div className={cn(
          "text-center no-space-waste",
          isMobile ? "mb-3" : "mb-4"
        )}>
          <h2 className={cn(
            "font-bold gradient-text",
            isMobile ? "text-lg mb-1" : "text-xl lg:text-2xl mb-2"
          )}>
            Properties for Sale
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm lg:text-base"
          )}>
            Find your dream home to purchase
          </p>
        </div>
        <div className={cn(
          "text-center text-muted-foreground",
          isMobile ? "py-4 text-xs" : "py-8 text-sm"
        )}>
          No properties for sale available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className={cn(
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20",
      isMobile ? "p-3" : "p-4 lg:p-6"
    )}>
      <div className={cn(
        "text-center no-space-waste",
        isMobile ? "mb-3" : "mb-4"
      )}>
        <h2 className={cn(
          "font-bold gradient-text",
          isMobile ? "text-lg mb-1" : "text-xl lg:text-2xl mb-2"
        )}>
          Properties for Sale
        </h2>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-xs" : "text-sm lg:text-base"
        )}>
          Find your dream home to purchase
        </p>
      </div>
      
      <div className="container-compact">
        <PropertyGridView
          properties={saleProperties}
          onPropertyClick={onPropertyClick}
          onView3D={onPropertyClick}
          onSave={(property) => console.log('Save property:', property.id)}
          onShare={(property) => console.log('Share property:', property.id)}
          onContact={(property) => console.log('Contact for property:', property.id)}
        />
      </div>
    </section>
  );
};

export default PropertiesForSaleSection;