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
            <div key={i} className="animate-pulse rounded-lg overflow-hidden bg-white/50 dark:bg-white/5 h-28 md:h-36"></div>
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {saleProperties.slice(0, 6).map((property) => (
          <div
            key={property.id}
            onClick={() => onPropertyClick(property)}
            className="group cursor-pointer relative rounded-xl overflow-hidden h-36 md:h-44 hover:scale-[1.02] transition-all duration-200"
          >
            {/* Full Image Background */}
            <img
              src={property.images?.[0] || property.thumbnail_url || "/placeholder.svg"}
              alt={property.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            
            {/* Top Labels */}
            <div className="absolute top-1.5 left-1.5 right-1.5 md:top-2 md:left-2 md:right-2 flex items-start justify-between">
              {/* Sale Badge */}
              <span className="text-[9px] md:text-xs font-bold px-2 py-1 rounded-full bg-green-500 text-white shadow-lg">
                Jual
              </span>
              {/* Property Type */}
              <span className="text-[8px] md:text-[10px] font-semibold px-2 py-1 rounded-full bg-white/95 dark:bg-black/80 text-foreground shadow-lg truncate max-w-[55%]">
                {property.property_type || 'Property'}
              </span>
            </div>
            
            {/* Price Label - Positioned prominently */}
            <div className="absolute top-1/2 left-1.5 md:left-2 -translate-y-1/2">
              <span className="text-xs md:text-sm font-bold px-2 py-1 rounded-md bg-primary text-primary-foreground shadow-xl">
                {property.price >= 1000000000 
                  ? `IDR ${(property.price / 1000000000).toFixed(1)}M` 
                  : `IDR ${(property.price / 1000000).toFixed(0)}Jt`}
              </span>
            </div>
            
            {/* Bottom Content - All info on image */}
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
              {/* Title */}
              <h3 className="text-[11px] md:text-sm font-bold text-white line-clamp-1 drop-shadow-lg">
                {property.title}
              </h3>
              {/* Location */}
              <p className="text-[9px] md:text-xs text-white/95 truncate drop-shadow-md mt-0.5">
                📍 {property.city || property.location}
              </p>
              {/* Property Details */}
              <div className="flex items-center gap-2 md:gap-3 mt-1 text-[9px] md:text-[11px] text-white/90 font-medium">
                {property.bedrooms && (
                  <span className="flex items-center gap-0.5">
                    🛏️ {property.bedrooms}
                  </span>
                )}
                {property.bathrooms && (
                  <span className="flex items-center gap-0.5">
                    🚿 {property.bathrooms}
                  </span>
                )}
                {property.area_sqm && (
                  <span className="flex items-center gap-0.5">
                    📐 {property.area_sqm}m²
                  </span>
                )}
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