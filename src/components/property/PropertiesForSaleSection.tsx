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
      <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1 md:gap-1.5">
          <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
            Properties for Sale
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden bg-white/50 dark:bg-white/5">
              <div className="h-16 md:h-20 bg-muted/50"></div>
              <div className="p-1.5 space-y-1">
                <div className="h-2 bg-muted/50 rounded"></div>
                <div className="h-1.5 bg-muted/50 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (saleProperties.length === 0) {
    return (
      <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
        <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1 md:gap-1.5">
          <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
            Properties for Sale
          </h2>
        </div>
        <div className="text-center text-muted-foreground py-3 text-[9px] md:text-xs">
          No properties for sale available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg">
      <div className="mb-1.5 md:mb-2 flex items-center justify-center gap-1 md:gap-1.5">
        <h2 className="text-[10px] md:text-xs font-semibold text-foreground">
          Properties for Sale
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
        {saleProperties.slice(0, 6).map((property) => (
          <div
            key={property.id}
            onClick={() => onPropertyClick(property)}
            className="group cursor-pointer rounded-lg overflow-hidden bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Image */}
            <div className="relative h-16 md:h-20 overflow-hidden">
              <img
                src={property.images?.[0] || property.thumbnail_url || "/placeholder.svg"}
                alt={property.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Badge */}
              <div className="absolute top-1 left-1">
                <span className="text-[6px] md:text-[8px] font-medium px-1 py-0.5 rounded bg-green-500/90 text-white">
                  Jual
                </span>
              </div>
              {/* Price overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                <span className="text-[8px] md:text-[10px] font-bold text-white">
                  {property.price >= 1000000000 
                    ? `IDR ${(property.price / 1000000000).toFixed(1)} M` 
                    : `IDR ${(property.price / 1000000).toFixed(0)} Jt`}
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="p-1 md:p-1.5">
              <h3 className="text-[8px] md:text-[10px] font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
              <p className="text-[7px] md:text-[8px] text-muted-foreground truncate">
                {property.city || property.location}
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[6px] md:text-[7px] text-muted-foreground">
                {property.bedrooms && <span>{property.bedrooms} Bed</span>}
                {property.bathrooms && <span>• {property.bathrooms} Bath</span>}
                {property.area_sqm && <span>• {property.area_sqm}m²</span>}
              </div>
            </div>
          </div>
        ))}
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