import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyGridView from "@/components/search/PropertyGridView";
import { BaseProperty } from "@/types/property";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { shareProperty } from "@/utils/shareUtils";
import { useState } from "react";
import WhatsAppInquiryDialog from "./WhatsAppInquiryDialog";
import { toast } from "sonner";

interface PropertiesForSaleSectionProps {
  language: "en" | "id";
  onPropertyClick: (property: BaseProperty) => void;
}

const PropertiesForSaleSection = ({ language, onPropertyClick }: PropertiesForSaleSectionProps) => {
  const { isMobile } = useIsMobile();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const { data: saleProperties = [], isLoading } = useQuery({
    queryKey: ['properties-for-sale'],
    queryFn: async () => {
      console.log('Fetching properties for sale...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
          .eq('approval_status', 'approved')
          .eq('listing_type', 'sale')
          .in('development_status', ['completed', 'ready'])
          .not('title', 'is', null)
          .not('title', 'eq', '')
          .gt('price', 0)
          .order('created_at', { ascending: false })
          .limit(8);

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <section className={cn(
        "bg-background/60 dark:bg-background/80 backdrop-blur-md rounded-xl shadow-md border border-border/30",
        isMobile ? "p-2" : "p-3 lg:p-4"
      )}>
        <div className={cn(
          "text-center",
          isMobile ? "mb-2" : "mb-3"
        )}>
          <h2 className={cn(
            "font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent",
            isMobile ? "text-base mb-0.5" : "text-lg lg:text-xl mb-1"
          )}>
            Properties for Sale
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            Find your dream home to purchase
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden">
              <div className="h-24 md:h-32 bg-muted"></div>
              <div className={cn(isMobile ? "p-1.5 space-y-1" : "p-2 space-y-1.5")}>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
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
        "bg-background/60 dark:bg-background/80 backdrop-blur-md rounded-xl shadow-md border border-border/30",
        isMobile ? "p-2" : "p-3 lg:p-4"
      )}>
        <div className={cn(
          "text-center",
          isMobile ? "mb-2" : "mb-3"
        )}>
          <h2 className={cn(
            "font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent",
            isMobile ? "text-base mb-0.5" : "text-lg lg:text-xl mb-1"
          )}>
            Properties for Sale
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            Find your dream home to purchase
          </p>
        </div>
        <div className={cn(
          "text-center text-muted-foreground",
          isMobile ? "py-3 text-[10px]" : "py-4 text-xs"
        )}>
          No properties for sale available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className={cn(
      "bg-background/60 dark:bg-background/80 backdrop-blur-md rounded-xl shadow-md border border-border/30",
      isMobile ? "p-2" : "p-3 lg:p-4"
    )}>
      <div className={cn(
        "text-center",
        isMobile ? "mb-2" : "mb-3"
      )}>
        <h2 className={cn(
          "font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent",
          isMobile ? "text-base mb-0.5" : "text-lg lg:text-xl mb-1"
        )}>
          Properties for Sale
        </h2>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-[10px]" : "text-xs"
        )}>
          Find your dream home to purchase
        </p>
      </div>
      
      <div className="[&_.grid]:gap-2 [&_.grid]:md:gap-3">
        <PropertyGridView
          properties={saleProperties}
          onPropertyClick={onPropertyClick}
          onView3D={onPropertyClick}
          onSave={(property) => console.log('Save property:', property.id)}
          onShare={async (property) => {
            const success = await shareProperty({
              id: property.id,
              title: property.title,
              price: property.price || 0,
              location: property.location || property.city || '',
              images: property.images
            });
            if (success) {
              toast.success("Property link shared!");
            }
          }}
          onContact={(property) => {
            setSelectedProperty(property);
            setWhatsappDialogOpen(true);
          }}
        />
      </div>
      
      {selectedProperty && (
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={selectedProperty}
        />
      )}
    </section>
  );
};

export default PropertiesForSaleSection;